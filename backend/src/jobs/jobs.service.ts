import { Injectable, BadRequestException } from '@nestjs/common';
import { ApplicationStatus, InterviewType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardProjector } from '../common/dashboard.projector';
import { NotificationsHelper } from '../common/notifications.helper';
import { assertFound, assertOwner } from '../common/assertions';
import { validateStatusTransition } from '../domain/application.logic';
import {
  CreateJobPostingDto,
  UpdateJobPostingDto,
  CreateApplicationDto,
  UpdateApplicationStatusDto,
  CreateInterviewDto,
  UpdateInterviewDto,
  CreateOfferDto,
} from './dto/jobs.dto';

@Injectable()
export class JobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dashboard: DashboardProjector,
    private readonly notifications: NotificationsHelper,
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
        include: { skills: { include: { skillCatalog: true } }, applications: true },
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
          ? { create: dto.skillCatalogIds.map((skillCatalogId) => ({ skillCatalogId })) }
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
          data: dto.skillCatalogIds.map((skillCatalogId) => ({ jobId: id, skillCatalogId })),
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
      where: { userId },
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
        include: { job: true, interviews: true, offers: { include: { negotiation: true } } },
      }),
      'Application',
    );
    assertOwner(app.userId, userId);
    return app;
  }

  async createApplication(userId: string, dto: CreateApplicationDto) {
    const job = assertFound(
      await this.prisma.jobPosting.findUnique({ where: { id: dto.jobId } }),
      'Job posting',
    );
    assertOwner(job.userId, userId);

    const app = await this.prisma.application.create({
      data: {
        userId,
        jobId: dto.jobId,
        goalId: dto.goalId,
        notes: dto.notes ?? '',
        status: (dto.status as ApplicationStatus) ?? ApplicationStatus.wishlist,
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
      '/tracker',
    );
    await this.dashboard.refresh(userId);
    return app;
  }

  async updateApplicationStatus(userId: string, id: string, dto: UpdateApplicationStatusDto) {
    const app = await this.getApplication(userId, id);
    const newStatus = dto.status as ApplicationStatus;

    validateStatusTransition(
      app.status,
      newStatus,
      app.interviews.length > 0,
      app.offers.length > 0,
    );

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
      '/tracker',
    );
    await this.dashboard.refresh(userId);
    await this.dashboard.refreshCareerMetrics(userId);
    return updated;
  }

  async addInterview(userId: string, applicationId: string, dto: CreateInterviewDto) {
    await this.getApplication(userId, applicationId);

    const interview = await this.prisma.interview.create({
      data: {
        applicationId,
        type: dto.type as InterviewType,
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
      '/interview',
    );
    await this.dashboard.refresh(userId);
    return interview;
  }

  async updateInterview(userId: string, applicationId: string, interviewId: string, dto: UpdateInterviewDto) {
    await this.getApplication(userId, applicationId);
    const interview = assertFound(
      await this.prisma.interview.findUnique({ where: { id: interviewId } }),
      'Interview',
    );
    if (interview.applicationId !== applicationId) {
      throw new BadRequestException('Interview does not belong to this application');
    }

    return this.prisma.interview.update({
      where: { id: interviewId },
      data: {
        status: dto.status as any,
        score: dto.score,
        feedback: dto.feedback,
        answers: (dto.answers ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
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
        decisionDeadline: dto.decisionDeadline ? new Date(dto.decisionDeadline) : null,
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
      '/negotiate',
    );
    await this.dashboard.refresh(userId);
    return offer;
  }
}
