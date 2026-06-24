import { Injectable, BadRequestException } from '@nestjs/common';
import { LearningPlanStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardProjector } from '../common/dashboard.projector';
import { assertFound, assertOwner } from '../common/assertions';
import {
  CreateLearningPlanDto,
  UpdateLearningPlanDto,
  CreateLearningItemDto,
  ToggleLearningItemDto,
} from './dto/learning-plans.dto';

@Injectable()
export class LearningPlansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dashboard: DashboardProjector,
  ) {}

  private recalcProgress(items: { completed: boolean }[]) {
    if (!items.length) return 0;
    const done = items.filter((i) => i.completed).length;
    return Math.round((done / items.length) * 100);
  }

  async findAll(userId: string) {
    return this.prisma.learningPlan.findMany({
      where: { userId },
      include: { items: { orderBy: { order: 'asc' } }, skills: { include: { skillCatalog: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const plan = assertFound(
      await this.prisma.learningPlan.findUnique({
        where: { id },
        include: { items: { orderBy: { order: 'asc' } }, skills: { include: { skillCatalog: true } } },
      }),
      'Learning plan',
    );
    assertOwner(plan.userId, userId);
    return plan;
  }

  async create(userId: string, dto: CreateLearningPlanDto) {
    const items = dto.items ?? [];
    const progress = 0;

    const plan = await this.prisma.learningPlan.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description ?? '',
        goalId: dto.goalId,
        progress,
        items: items.length
          ? {
              create: items.map((item, idx) => ({
                title: item.title,
                description: item.description ?? '',
                tag: item.tag ?? '',
                order: item.order ?? idx,
                skillBoostAmount: item.skillBoostAmount ?? 0,
              })),
            }
          : undefined,
        skills: dto.skillCatalogIds?.length
          ? { create: dto.skillCatalogIds.map((skillCatalogId) => ({ skillCatalogId })) }
          : undefined,
      },
      include: { items: true, skills: { include: { skillCatalog: true } } },
    });

    await this.dashboard.refresh(userId);
    return plan;
  }

  async update(userId: string, id: string, dto: UpdateLearningPlanDto) {
    await this.findOne(userId, id);

    return this.prisma.learningPlan.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        goalId: dto.goalId,
        status: dto.status as LearningPlanStatus | undefined,
        completedAt:
          dto.status === 'completed' ? new Date() : undefined,
      },
      include: { items: true },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.learningPlan.delete({ where: { id } });
    await this.dashboard.refresh(userId);
    return { deleted: true };
  }

  async addItem(userId: string, planId: string, dto: CreateLearningItemDto) {
    const plan = await this.findOne(userId, planId);
    const maxOrder = plan.items.reduce((max, i) => Math.max(max, i.order), -1);

    await this.prisma.learningItem.create({
      data: {
        planId,
        title: dto.title,
        description: dto.description ?? '',
        tag: dto.tag ?? '',
        order: dto.order ?? maxOrder + 1,
        skillBoostAmount: dto.skillBoostAmount ?? 0,
      },
    });

    const items = await this.prisma.learningItem.findMany({ where: { planId } });
    return this.prisma.learningPlan.update({
      where: { id: planId },
      data: { progress: this.recalcProgress(items) },
      include: { items: { orderBy: { order: 'asc' } } },
    });
  }

  async toggleItem(userId: string, planId: string, itemId: string, dto: ToggleLearningItemDto) {
    await this.findOne(userId, planId);
    const item = assertFound(
      await this.prisma.learningItem.findUnique({ where: { id: itemId } }),
      'Learning item',
    );
    if (item.planId !== planId) throw new BadRequestException('Item does not belong to this plan');

    const completed = dto.completed ?? !item.completed;
    await this.prisma.learningItem.update({
      where: { id: itemId },
      data: { completed, completedAt: completed ? new Date() : null },
    });

    const items = await this.prisma.learningItem.findMany({ where: { planId } });
    const progress = this.recalcProgress(items);
    const allDone = progress >= 100;

    const updated = await this.prisma.learningPlan.update({
      where: { id: planId },
      data: {
        progress,
        status: allDone ? LearningPlanStatus.completed : undefined,
        completedAt: allDone ? new Date() : undefined,
      },
      include: { items: { orderBy: { order: 'asc' } } },
    });

    await this.dashboard.refresh(userId);
    return updated;
  }
}
