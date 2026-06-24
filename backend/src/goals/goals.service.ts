import { Injectable, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardProjector } from '../common/dashboard.projector';
import { NotificationsHelper } from '../common/notifications.helper';
import { assertFound, assertOwner } from '../common/assertions';
import { parseMilestones, recalculateGoalProgress } from '../domain/goal.logic';
import type { Milestone } from '../domain/types';
import {
  CreateGoalDto,
  UpdateGoalDto,
  AddMilestoneDto,
  ToggleMilestoneDto,
} from './dto/goals.dto';
import { Prisma, GoalStatus } from '@prisma/client';

@Injectable()
export class GoalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dashboard: DashboardProjector,
    private readonly notifications: NotificationsHelper,
  ) {}

  async findAll(userId: string) {
    return this.prisma.goal.findMany({
      where: { userId },
      include: { skills: { include: { skillCatalog: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const goal = assertFound(
      await this.prisma.goal.findUnique({
        where: { id },
        include: { skills: { include: { skillCatalog: true } } },
      }),
      'Goal',
    );
    assertOwner(goal.userId, userId);
    return goal;
  }

  async create(userId: string, dto: CreateGoalDto) {
    const goal = await this.prisma.goal.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description ?? '',
        targetDate: dto.targetDate ? new Date(dto.targetDate) : null,
        careerPath: dto.careerPath ?? '',
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

    await this.notifications.create(
      userId,
      'goal_created',
      'Goal created',
      `You created "${goal.title}"`,
      goal.id,
      'goal',
      '/goals',
    );
    await this.dashboard.refresh(userId);
    return goal;
  }

  async update(userId: string, id: string, dto: UpdateGoalDto) {
    await this.findOne(userId, id);

    if (dto.skillCatalogIds) {
      await this.prisma.goalSkill.deleteMany({ where: { goalId: id } });
      if (dto.skillCatalogIds.length) {
        await this.prisma.goalSkill.createMany({
          data: dto.skillCatalogIds.map((skillCatalogId) => ({
            goalId: id,
            skillCatalogId,
          })),
        });
      }
    }

    return this.prisma.goal.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        targetDate: dto.targetDate ? new Date(dto.targetDate) : undefined,
        careerPath: dto.careerPath,
      },
      include: { skills: { include: { skillCatalog: true } } },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.goal.delete({ where: { id } });
    await this.dashboard.refresh(userId);
    return { deleted: true };
  }

  async addMilestone(userId: string, goalId: string, dto: AddMilestoneDto) {
    const goal = await this.findOne(userId, goalId);
    if (goal.status === GoalStatus.completed) {
      throw new BadRequestException(
        'Cannot modify milestones on a completed goal',
      );
    }

    const milestones = parseMilestones(goal.milestones);
    const maxOrder = milestones.reduce((max, m) => Math.max(max, m.order), 0);
    const milestone: Milestone = {
      id: randomUUID(),
      title: dto.title,
      description: dto.description ?? '',
      completed: false,
      order: maxOrder + 1,
    };

    const updated = [...milestones, milestone];
    const calc = recalculateGoalProgress(updated, goal.status);

    return this.prisma.goal.update({
      where: { id: goalId },
      data: {
        milestones: updated as unknown as Prisma.InputJsonValue,
        progress: calc.progress,
        status: calc.status,
        completedAt: calc.completedAt,
      },
    });
  }

  async toggleMilestone(
    userId: string,
    goalId: string,
    dto: ToggleMilestoneDto,
  ) {
    const goal = await this.findOne(userId, goalId);
    if (goal.status === GoalStatus.completed) {
      throw new BadRequestException(
        'Cannot modify milestones on a completed goal',
      );
    }

    const milestones = parseMilestones(goal.milestones).map((m) => {
      if (m.id !== dto.milestoneId) return m;
      const completed = dto.completed ?? !m.completed;
      return {
        ...m,
        completed,
        completedAt: completed ? new Date().toISOString() : undefined,
      };
    });

    const calc = recalculateGoalProgress(milestones, goal.status);
    const updated = await this.prisma.goal.update({
      where: { id: goalId },
      data: {
        milestones: milestones as unknown as Prisma.InputJsonValue,
        progress: calc.progress,
        status: calc.status,
        completedAt: calc.completedAt,
      },
    });

    if (calc.status === GoalStatus.completed) {
      await this.notifications.create(
        userId,
        'goal_completed',
        'Goal completed!',
        `"${goal.title}" is complete`,
        goalId,
        'goal',
        '/goals',
      );
      await this.dashboard.refreshCareerMetrics(userId);
    }

    await this.dashboard.refresh(userId);
    return updated;
  }
}
