import { Injectable, BadRequestException } from '@nestjs/common';
import { NegotiationStatus, ApplicationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsHelper } from '../common/notifications.helper';
import { DashboardProjector } from '../common/dashboard.projector';
import { GamificationUnlockService } from '../common/gamification-unlock.service';
import { assertFound, assertOwner } from '../common/assertions';
import {
  CreateNegotiationDto,
  UpdateNegotiationDto,
} from './dto/negotiations.dto';
import { AnalyzeOfferDto } from './dto/analyze-offer.dto';

@Injectable()
export class NegotiationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsHelper,
    private readonly dashboard: DashboardProjector,
    private readonly gamification: GamificationUnlockService,
  ) {}

  async findAll(userId: string) {
    return this.prisma.negotiation.findMany({
      where: { userId },
      include: {
        offer: { include: { application: { include: { job: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const neg = assertFound(
      await this.prisma.negotiation.findUnique({
        where: { id },
        include: {
          offer: { include: { application: { include: { job: true } } } },
        },
      }),
      'Negotiation',
    );
    assertOwner(neg.userId, userId);
    return neg;
  }

  async create(userId: string, dto: CreateNegotiationDto) {
    const offer = assertFound(
      await this.prisma.offer.findUnique({
        where: { id: dto.offerId },
        include: { application: true, negotiation: true },
      }),
      'Offer',
    );
    assertOwner(offer.application.userId, userId);

    if (offer.negotiation) {
      throw new BadRequestException(
        'Negotiation already exists for this offer',
      );
    }

    if (dto.targetSalary.amount < dto.offeredSalary.amount) {
      throw new BadRequestException('Target salary must be >= offered salary');
    }

    const negotiation = await this.prisma.negotiation.create({
      data: {
        userId,
        offerId: dto.offerId,
        offeredSalary: dto.offeredSalary,
        targetSalary: dto.targetSalary,
        strategy: dto.strategy ?? '',
        talkingPoints: dto.talkingPoints ?? [],
        status: NegotiationStatus.pending,
      },
      include: { offer: true },
    });

    await this.notifications.create(
      userId,
      'negotiation_completed',
      'Negotiation started',
      'Your salary negotiation is ready',
      negotiation.id,
      'negotiation',
      '/app/negotiate',
    );

    return negotiation;
  }

  async update(userId: string, id: string, dto: UpdateNegotiationDto) {
    await this.findOne(userId, id);

    const data: Record<string, unknown> = {
      strategy: dto.strategy,
      talkingPoints: dto.talkingPoints,
    };

    if (dto.status) {
      data.status = dto.status;
      if (dto.status === 'accepted') {
        if (!dto.finalSalary) {
          throw new BadRequestException('finalSalary required when accepting');
        }
        data.finalSalary = dto.finalSalary;
        data.completedAt = new Date();
      }
    }

    const updated = await this.prisma.negotiation.update({
      where: { id },
      data,
      include: { offer: true },
    });

    if (dto.status === 'accepted') {
      await this.gamification.onNegotiationAccepted(userId);
      await this.dashboard.refreshCareerMetrics(userId);
    }

    return updated;
  }

  async analyzeOffer(userId: string, dto: AnalyzeOfferDto) {
    if (dto.targetSalary.amount < dto.offeredSalary.amount) {
      throw new BadRequestException('Target salary must be >= offered salary');
    }

    let job = await this.prisma.jobPosting.findFirst({
      where: {
        userId,
        company: dto.company,
        title: dto.role,
        source: 'negotiation_draft',
      },
    });

    if (!job) {
      job = await this.prisma.jobPosting.create({
        data: {
          userId,
          company: dto.company,
          title: dto.role,
          location: dto.location ?? '',
          source: 'negotiation_draft',
          salaryRange: dto.offeredSalary,
        },
      });
    } else {
      job = await this.prisma.jobPosting.update({
        where: { id: job.id },
        data: {
          location: dto.location ?? job.location,
          salaryRange: dto.offeredSalary,
        },
      });
    }

    let application = await this.prisma.application.findFirst({
      where: { userId, jobId: job.id },
      include: { offers: { include: { negotiation: true } } },
    });

    if (!application) {
      application = await this.prisma.application.create({
        data: {
          userId,
          jobId: job.id,
          status: ApplicationStatus.offer,
          notes: `Salary negotiation for ${dto.role} at ${dto.company}`,
        },
        include: { offers: { include: { negotiation: true } } },
      });
    }

    let offer = application.offers[0];
    if (!offer) {
      offer = await this.prisma.offer.create({
        data: {
          applicationId: application.id,
          company: dto.company,
          role: dto.role,
          baseSalary: dto.offeredSalary,
        },
        include: { negotiation: true },
      });
      await this.gamification.onOfferReceived(userId);
    } else {
      offer = await this.prisma.offer.update({
        where: { id: offer.id },
        data: { baseSalary: dto.offeredSalary },
        include: { negotiation: true },
      });
    }

    if (offer.negotiation) {
      return this.prisma.negotiation.update({
        where: { id: offer.negotiation.id },
        data: {
          offeredSalary: dto.offeredSalary,
          targetSalary: dto.targetSalary,
          strategy: dto.strategy ?? 'Market-aligned counter-offer',
        },
        include: { offer: { include: { application: { include: { job: true } } } } },
      });
    }

    const negotiation = await this.prisma.negotiation.create({
      data: {
        userId,
        offerId: offer.id,
        offeredSalary: dto.offeredSalary,
        targetSalary: dto.targetSalary,
        strategy: dto.strategy ?? 'Market-aligned counter-offer',
        talkingPoints: [],
        status: NegotiationStatus.pending,
      },
      include: { offer: { include: { application: { include: { job: true } } } } },
    });

    await this.notifications.create(
      userId,
      'negotiation_completed',
      'Negotiation started',
      'Your salary negotiation is ready',
      negotiation.id,
      'negotiation',
      '/app/negotiate',
    );

    await this.dashboard.refresh(userId);
    return negotiation;
  }

  async remove(userId: string, id: string) {
    const neg = await this.findOne(userId, id);
    await this.prisma.negotiation.delete({ where: { id: neg.id } });
    await this.dashboard.refresh(userId);
    return { deleted: true };
  }
}
