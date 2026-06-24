import { Injectable, BadRequestException } from '@nestjs/common';
import { NegotiationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsHelper } from '../common/notifications.helper';
import { DashboardProjector } from '../common/dashboard.projector';
import { assertFound, assertOwner } from '../common/assertions';
import {
  CreateNegotiationDto,
  UpdateNegotiationDto,
} from './dto/negotiations.dto';

@Injectable()
export class NegotiationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsHelper,
    private readonly dashboard: DashboardProjector,
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
      '/negotiate',
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
      await this.dashboard.refreshCareerMetrics(userId);
    }

    return updated;
  }
}
