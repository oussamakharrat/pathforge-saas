import { ForbiddenException, Injectable } from '@nestjs/common';
import { AIMessageRole, Plan } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { trackedApplicationWhere } from './tracked-applications';
import {
  PLAN_LABELS,
  PLAN_LIMITS,
  PlanQuota,
  PlanTier,
  planMeetsMin,
} from './plan.constants';

@Injectable()
export class PlanService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserPlan(userId: string): Promise<PlanTier> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      select: { plan: true },
    });
    return subscription?.plan ?? Plan.free;
  }

  async assertMinPlan(userId: string, required: PlanTier): Promise<PlanTier> {
    const current = await this.getUserPlan(userId);
    if (!planMeetsMin(current, required)) {
      throw new ForbiddenException(
        `This feature requires the ${PLAN_LABELS[required]} plan. Upgrade to continue.`,
      );
    }
    return current;
  }

  async assertQuota(userId: string, quota: PlanQuota): Promise<void> {
    const plan = await this.getUserPlan(userId);
    const limit = PLAN_LIMITS[plan][quota];
    if (!Number.isFinite(limit)) return;

    const usage = await this.getQuotaUsage(userId, quota);
    if (usage >= limit) {
      throw new ForbiddenException(this.quotaMessage(quota, limit, plan));
    }
  }

  async getQuotaUsage(userId: string, quota: PlanQuota): Promise<number> {
    switch (quota) {
      case 'aiMessages': {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        return this.prisma.aIMessage.count({
          where: {
            role: AIMessageRole.user,
            createdAt: { gte: startOfMonth },
            conversation: { userId },
          },
        });
      }
      case 'resumes':
        return this.prisma.resume.count({ where: { userId } });
      case 'jobApplications':
        return this.prisma.application.count({
          where: trackedApplicationWhere(userId),
        });
      default:
        return 0;
    }
  }

  private quotaMessage(
    quota: PlanQuota,
    limit: number,
    plan: PlanTier,
  ): string {
    const label = PLAN_LABELS[plan];
    switch (quota) {
      case 'aiMessages':
        return `You've reached your ${label} plan limit of ${limit} AI messages this month. Upgrade to continue.`;
      case 'resumes':
        return `You've reached your ${label} plan limit of ${limit} resume${limit === 1 ? '' : 's'}. Upgrade to continue.`;
      case 'jobApplications':
        return `You've reached your ${label} plan limit of ${limit} tracked job applications. Upgrade to continue.`;
      default:
        return 'Plan limit reached. Upgrade to continue.';
    }
  }
}
