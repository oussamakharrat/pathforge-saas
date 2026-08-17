import { Injectable, BadRequestException } from '@nestjs/common';
import {
  ApplicationStatus,
  InterviewStatus,
  InterviewType,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardProjector } from '../common/dashboard.projector';
import { NotificationsHelper } from '../common/notifications.helper';
import { GamificationUnlockService } from '../common/gamification-unlock.service';
import { PlanService } from '../common/plan.service';
import { assertFound, assertOwner } from '../common/assertions';
import {
  trackedApplicationWhere,
  HIDDEN_JOB_SOURCES,
} from '../common/tracked-applications';
import { validateStatusTransition } from '../domain/application.logic';
import {
  CreateJobPostingDto,
  UpdateJobPostingDto,
  CreateApplicationDto,
  UpdateApplicationStatusDto,
  CreateInterviewDto,
  UpdateInterviewDto,
  CreateOfferDto,
  UpdateApplicationNotesDto,
  CreateMockInterviewDto,
} from './dto/jobs.dto';

@Injectable()
export class JobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dashboard: DashboardProjector,
    private readonly notifications: NotificationsHelper,
    private readonly gamification: GamificationUnlockService,
    private readonly planService: PlanService,
  ) {}

  // ── Job Postings ──

  async listJobs(userId: string) {
    return this.prisma.jobPosting.findMany({
      where: { userId },
      include: { skills: { include: { skillCatalog: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getJob(userId: string, id: string) {
    const job = assertFound(
      await this.prisma.jobPosting.findUnique({
        where: { id },
        include: {
          skills: { include: { skillCatalog: true } },
          applications: true,
        },
      }),
      'Job posting',
    );
    assertOwner(job.userId, userId);
    return job;
  }

  async createJob(userId: string, dto: CreateJobPostingDto) {
    return this.prisma.jobPosting.create({
      data: {
        userId,
        company: dto.company,
        title: dto.title,
        description: dto.description ?? '',
        location: dto.location ?? '',
        url: dto.url ?? '',
        salaryRange: (dto.salaryRange ?? {}) as Prisma.InputJsonValue,
        source: dto.source ?? '',
        companyLogo: dto.companyLogo ?? '',
        matchScore: dto.matchScore ?? 0,
        skills: dto.skillCatalogIds?.length
          ? {
              create: dto.skillCatalogIds.map((skillCatalogId) => ({
                skillCatalogId,
              })),
            }
          : undefined,
      },
      include: { skills: { include: { skillCatalog: true } } },
    });
  }

  async updateJob(userId: string, id: string, dto: UpdateJobPostingDto) {
    await this.getJob(userId, id);

    if (dto.skillCatalogIds) {
      await this.prisma.jobSkill.deleteMany({ where: { jobId: id } });
      if (dto.skillCatalogIds.length) {
        await this.prisma.jobSkill.createMany({
          data: dto.skillCatalogIds.map((skillCatalogId) => ({
            jobId: id,
            skillCatalogId,
          })),
        });
      }
    }

    return this.prisma.jobPosting.update({
      where: { id },
      data: {
        company: dto.company,
        title: dto.title,
        description: dto.description,
        location: dto.location,
        url: dto.url,
        salaryRange: dto.salaryRange as Prisma.InputJsonValue | undefined,
        matchScore: dto.matchScore,
      },
      include: { skills: { include: { skillCatalog: true } } },
    });
  }

  async deleteJob(userId: string, id: string) {
    await this.getJob(userId, id);
    await this.prisma.jobPosting.delete({ where: { id } });
    return { deleted: true };
  }

  // ── Applications ──

  async listApplications(userId: string) {
    return this.prisma.application.findMany({
      where: trackedApplicationWhere(userId),
      include: {
        job: true,
        interviews: true,
        offers: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getApplication(userId: string, id: string) {
    const app = assertFound(
      await this.prisma.application.findUnique({
        where: { id },
        include: {
          job: true,
          interviews: true,
          offers: { include: { negotiation: true } },
        },
      }),
      'Application',
    );
    assertOwner(app.userId, userId);
    return app;
  }

  async createApplication(userId: string, dto: CreateApplicationDto) {
    await this.planService.assertQuota(userId, 'jobApplications');

    const job = assertFound(
      await this.prisma.jobPosting.findUnique({ where: { id: dto.jobId } }),
      'Job posting',
    );
    assertOwner(job.userId, userId);

    if (dto.goalId) {
      const goal = assertFound(
        await this.prisma.goal.findUnique({ where: { id: dto.goalId } }),
        'Goal',
      );
      assertOwner(goal.userId, userId);
    }

    const app = await this.prisma.application.create({
      data: {
        userId,
        jobId: dto.jobId,
        goalId: dto.goalId,
        notes: dto.notes ?? '',
        status: dto.status ?? ApplicationStatus.wishlist,
      },
      include: { job: true },
    });

    await this.notifications.create(
      userId,
      'application_tracked',
      'Application tracked',
      `${job.company} — ${job.title}`,
      app.id,
      'application',
      '/app/tracker',
    );
    await this.gamification.onApplicationTracked(userId);
    await this.dashboard.refresh(userId);
    return app;
  }

  async updateApplicationNotes(
    userId: string,
    id: string,
    dto: UpdateApplicationNotesDto,
  ) {
    await this.getApplication(userId, id);
    return this.prisma.application.update({
      where: { id },
      data: { notes: dto.notes ?? '' },
      include: { job: true },
    });
  }

  async updateApplicationStatus(
    userId: string,
    id: string,
    dto: UpdateApplicationStatusDto,
  ) {
    const app = await this.getApplication(userId, id);
    const newStatus = dto.status;

    let hasInterviews = app.interviews.length > 0;
    let hasOffers = app.offers.length > 0;

    if (
      (newStatus === ApplicationStatus.interview ||
        newStatus === ApplicationStatus.final_round) &&
      !hasInterviews
    ) {
      await this.prisma.interview.create({
        data: {
          applicationId: id,
          type: InterviewType.behavioral,
          date: new Date(),
          company: app.job.company,
          role: app.job.title,
        },
      });
      hasInterviews = true;
    }

    if (newStatus === ApplicationStatus.offer && !hasOffers) {
      await this.prisma.offer.create({
        data: {
          applicationId: id,
          company: app.job.company,
          role: app.job.title,
          baseSalary: { amount: 0, currency: 'USD' },
        },
      });
      hasOffers = true;
    }

    validateStatusTransition(app.status, newStatus, hasInterviews, hasOffers);

    const updated = await this.prisma.application.update({
      where: { id },
      data: { status: newStatus },
      include: { job: true, interviews: true, offers: true },
    });

    await this.notifications.create(
      userId,
      'application_tracked',
      'Application updated',
      `Status: ${newStatus}`,
      id,
      'application',
      '/app/tracker',
    );
    if (newStatus === ApplicationStatus.offer) {
      await this.gamification.onOfferReceived(userId);
    }
    await this.dashboard.refresh(userId);
    await this.dashboard.refreshCareerMetrics(userId);
    return updated;
  }

  async deleteApplication(userId: string, id: string) {
    await this.getApplication(userId, id);
    await this.prisma.application.delete({ where: { id } });
    await this.dashboard.refresh(userId);
    await this.dashboard.refreshCareerMetrics(userId);
    return { deleted: true };
  }

  async addInterview(
    userId: string,
    applicationId: string,
    dto: CreateInterviewDto,
  ) {
    await this.getApplication(userId, applicationId);

    const interview = await this.prisma.interview.create({
      data: {
        applicationId,
        type: dto.type,
        date: new Date(dto.date),
        company: dto.company ?? '',
        role: dto.role ?? '',
        isMock: dto.isMock ?? false,
      },
    });

    await this.notifications.create(
      userId,
      'interview_tracked',
      'Interview scheduled',
      `${dto.type} interview on ${dto.date}`,
      interview.id,
      'interview',
      '/app/interview',
    );
    await this.dashboard.refresh(userId);
    return interview;
  }

  async updateInterview(
    userId: string,
    applicationId: string,
    interviewId: string,
    dto: UpdateInterviewDto,
  ) {
    await this.getApplication(userId, applicationId);
    const interview = assertFound(
      await this.prisma.interview.findUnique({ where: { id: interviewId } }),
      'Interview',
    );
    if (interview.applicationId !== applicationId) {
      throw new BadRequestException(
        'Interview does not belong to this application',
      );
    }

    const updated = await this.prisma.interview.update({
      where: { id: interviewId },
      data: {
        status: dto.status as InterviewStatus,
        score: dto.score,
        feedback: dto.feedback,
        answers: (dto.answers ?? undefined) as
          | Prisma.InputJsonValue
          | undefined,
      },
    });

    if (
      interview.isMock &&
      (dto.status === InterviewStatus.completed || dto.score != null)
    ) {
      await this.gamification.onMockInterviewCompleted(userId);
      await this.dashboard.refreshCareerMetrics(userId);
    }

    return updated;
  }

  async addOffer(userId: string, applicationId: string, dto: CreateOfferDto) {
    await this.getApplication(userId, applicationId);

    const offer = await this.prisma.offer.create({
      data: {
        applicationId,
        company: dto.company ?? '',
        role: dto.role ?? '',
        baseSalary: dto.baseSalary,
        equity: dto.equity ?? '',
        bonus: dto.bonus ?? '',
        benefits: dto.benefits ?? [],
        decisionDeadline: dto.decisionDeadline
          ? new Date(dto.decisionDeadline)
          : null,
      },
    });

    await this.prisma.application.update({
      where: { id: applicationId },
      data: { status: ApplicationStatus.offer },
    });

    await this.notifications.create(
      userId,
      'offer_received',
      'Offer received!',
      dto.company ?? 'New offer',
      offer.id,
      'offer',
      '/app/negotiate',
    );
    await this.gamification.onOfferReceived(userId);
    await this.dashboard.refresh(userId);
    return offer;
  }

  async createMockInterview(userId: string, dto: CreateMockInterviewDto) {
    const typeMap: Record<string, InterviewType> = {
      technical: InterviewType.technical,
      behavioral: InterviewType.behavioral,
      system: InterviewType.system_design,
    };
    const interviewType = typeMap[dto.type] ?? InterviewType.mock;

    let job = await this.prisma.jobPosting.findFirst({
      where: { userId, company: dto.company, title: dto.role, source: 'practice' },
    });
    if (!job) {
      job = await this.prisma.jobPosting.create({
        data: {
          userId,
          company: dto.company,
          title: dto.role,
          description: 'Mock interview practice session',
          source: 'practice',
        },
      });
    }

    let application = await this.prisma.application.findFirst({
      where: { userId, jobId: job.id },
    });
    if (!application) {
      application = await this.prisma.application.create({
        data: {
          userId,
          jobId: job.id,
          status: ApplicationStatus.interview,
          notes: 'Mock interview practice',
        },
      });
    }

    const interview = await this.prisma.interview.create({
      data: {
        applicationId: application.id,
        type: interviewType,
        date: new Date(),
        company: dto.company,
        role: dto.role,
        isMock: true,
        status: InterviewStatus.completed,
        score: dto.score,
        feedback: dto.feedback ?? '',
        answers: (dto.answers ?? []) as Prisma.InputJsonValue,
      },
    });

    await this.gamification.onMockInterviewCompleted(userId);
    await this.dashboard.refresh(userId);
    await this.dashboard.refreshCareerMetrics(userId);
    return interview;
  }
}
