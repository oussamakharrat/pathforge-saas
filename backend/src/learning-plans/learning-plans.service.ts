import { Injectable, BadRequestException } from '@nestjs/common';
import { LearningPlanStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardProjector } from '../common/dashboard.projector';
import { GamificationUnlockService } from '../common/gamification-unlock.service';
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
    private readonly gamification: GamificationUnlockService,
  ) {}

  private recalcProgress(items: { completed: boolean }[]) {
    if (!items.length) return 0;
    const done = items.filter((i) => i.completed).length;
    return Math.round((done / items.length) * 100);
  }

  private async applySkillBoost(
    userId: string,
    planId: string,
    item: { tag: string; skillBoostAmount: number },
  ) {
    const boost = item.skillBoostAmount > 0 ? item.skillBoostAmount : 5;
    const plan = await this.prisma.learningPlan.findUnique({
      where: { id: planId },
      include: { skills: true },
    });
    if (!plan) return;

    const catalogIds = new Set(plan.skills.map((s) => s.skillCatalogId));

    if (item.tag) {
      const catalog = await this.prisma.skillCatalog.findFirst({
        where: { name: { equals: item.tag, mode: 'insensitive' } },
      });
      if (catalog) catalogIds.add(catalog.id);
    }

    for (const skillCatalogId of catalogIds) {
      const existing = await this.prisma.userSkill.findUnique({
        where: { userId_skillCatalogId: { userId, skillCatalogId } },
      });
      if (existing) {
        await this.prisma.userSkill.update({
          where: { id: existing.id },
          data: {
            currentLevel: Math.min(100, existing.currentLevel + boost),
            lastAssessed: new Date(),
          },
        });
      } else {
        await this.prisma.userSkill.create({
          data: {
            userId,
            skillCatalogId,
            currentLevel: Math.min(100, boost),
            targetLevel: 80,
          },
        });
      }
    }

    await this.gamification.onSkillsChanged(userId);
    await this.dashboard.refreshCareerMetrics(userId);
  }

  async findAll(userId: string) {
    return this.prisma.learningPlan.findMany({
      where: { userId },
      include: {
        items: { orderBy: { order: 'asc' } },
        skills: { include: { skillCatalog: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const plan = assertFound(
      await this.prisma.learningPlan.findUnique({
        where: { id },
        include: {
          items: { orderBy: { order: 'asc' } },
          skills: { include: { skillCatalog: true } },
        },
      }),
      'Learning plan',
    );
    assertOwner(plan.userId, userId);
    return plan;
  }

  async create(userId: string, dto: CreateLearningPlanDto) {
    if (dto.goalId) {
      const goal = assertFound(
        await this.prisma.goal.findUnique({ where: { id: dto.goalId } }),
        'Goal',
      );
      assertOwner(goal.userId, userId);
    }

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
          ? {
              create: dto.skillCatalogIds.map((skillCatalogId) => ({
                skillCatalogId,
              })),
            }
          : undefined,
      },
      include: { items: true, skills: { include: { skillCatalog: true } } },
    });

    await this.dashboard.refresh(userId);
    return plan;
  }

  async update(userId: string, id: string, dto: UpdateLearningPlanDto) {
    await this.findOne(userId, id);

    if (dto.goalId) {
      const goal = assertFound(
        await this.prisma.goal.findUnique({ where: { id: dto.goalId } }),
        'Goal',
      );
      assertOwner(goal.userId, userId);
    }

    return this.prisma.learningPlan.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        goalId: dto.goalId,
        status: dto.status as LearningPlanStatus | undefined,
        completedAt: dto.status === 'completed' ? new Date() : undefined,
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

    const items = await this.prisma.learningItem.findMany({
      where: { planId },
    });
    return this.prisma.learningPlan.update({
      where: { id: planId },
      data: { progress: this.recalcProgress(items) },
      include: { items: { orderBy: { order: 'asc' } } },
    });
  }

  async toggleItem(
    userId: string,
    planId: string,
    itemId: string,
    dto: ToggleLearningItemDto,
  ) {
    await this.findOne(userId, planId);
    const item = assertFound(
      await this.prisma.learningItem.findUnique({ where: { id: itemId } }),
      'Learning item',
    );
    if (item.planId !== planId)
      throw new BadRequestException('Item does not belong to this plan');

    const completed = dto.completed ?? !item.completed;
    await this.prisma.learningItem.update({
      where: { id: itemId },
      data: { completed, completedAt: completed ? new Date() : null },
    });

    if (completed && !item.completed) {
      await this.applySkillBoost(userId, planId, item);
    }

    const items = await this.prisma.learningItem.findMany({
      where: { planId },
    });
    const progress = this.recalcProgress(items);
    const allDone = progress >= 100;

    const updated = await this.prisma.learningPlan.update({
      where: { id: planId },
      data: {
        progress,
        status: allDone
          ? LearningPlanStatus.completed
          : LearningPlanStatus.active,
        completedAt: allDone ? new Date() : null,
      },
      include: { items: { orderBy: { order: 'asc' } } },
    });

    await this.dashboard.refresh(userId);
    if (allDone) {
      await this.gamification.onLearningPlanCompleted(userId);
    }
    return updated;
  }

  async removeItem(userId: string, planId: string, itemId: string) {
    await this.findOne(userId, planId);
    const item = assertFound(
      await this.prisma.learningItem.findUnique({ where: { id: itemId } }),
      'Learning item',
    );
    if (item.planId !== planId) {
      throw new BadRequestException('Item does not belong to this plan');
    }

    await this.prisma.learningItem.delete({ where: { id: itemId } });

    const items = await this.prisma.learningItem.findMany({ where: { planId } });
    return this.prisma.learningPlan.update({
      where: { id: planId },
      data: { progress: this.recalcProgress(items) },
      include: { items: { orderBy: { order: 'asc' } } },
    });
  }
}
