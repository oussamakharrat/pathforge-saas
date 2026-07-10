import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsHelper } from './notifications.helper';

@Injectable()
export class GamificationUnlockService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsHelper,
  ) {}

  async onGoalCreated(userId: string) {
    await this.unlockAchievement(userId, 'First Goal');
  }

  async onGoalCompleted(userId: string) {
    await this.unlockAchievement(userId, 'Goal Crusher');
  }

  async onSkillsChanged(userId: string) {
    const count = await this.prisma.userSkill.count({ where: { userId } });
    if (count >= 5) {
      await this.unlockAchievement(userId, 'Skill Builder');
    }
  }

  async onMockInterviewCompleted(userId: string) {
    await this.unlockAchievement(userId, 'Interview Ready');
  }

  async onOfferReceived(userId: string) {
    await this.unlockAchievement(userId, 'Offer Received');
  }

  async onApplicationTracked(_userId: string) {
    // Applications feed dashboard metrics; no standalone achievement in catalog.
  }

  async onCommunityEngagement(userId: string) {
    await this.unlockBadge(userId, 'Networker');
  }

  async onLearningPlanCompleted(userId: string) {
    await this.unlockBadge(userId, 'Learner');
  }

  async onNegotiationAccepted(userId: string) {
    await this.unlockBadge(userId, 'Negotiator');
  }

  async onStreakUpdated(userId: string, streakDays: number) {
    if (streakDays >= 7) {
      await this.unlockAchievement(userId, 'Week Streak');
    }
  }

  async onProfileCompleted(userId: string) {
    const profile = await this.prisma.careerProfile.findUnique({
      where: { userId },
    });
    if (profile?.targetRole?.trim()) {
      await this.unlockBadge(userId, 'Starter');
    }
  }

  async onPortfolioUpdated(userId: string) {
    const count = await this.prisma.portfolioProject.count({
      where: { userId, status: 'completed' },
    });
    if (count >= 3) {
      await this.unlockBadge(userId, 'Portfolio Pro');
    }
  }

  private async unlockAchievement(userId: string, name: string) {
    const def = await this.prisma.achievementDefinition.findUnique({
      where: { name },
    });
    if (!def) return;

    const existing = await this.prisma.userAchievement.findUnique({
      where: {
        userId_achievementDefinitionId: {
          userId,
          achievementDefinitionId: def.id,
        },
      },
    });
    if (existing) return;

    await this.prisma.userAchievement.create({
      data: { userId, achievementDefinitionId: def.id },
    });

    await this.notifications.create(
      userId,
      'achievement_unlocked',
      'Achievement unlocked!',
      def.description,
      def.id,
      'achievement',
      '/app/achievements',
    );
  }

  private async unlockBadge(userId: string, name: string) {
    const def = await this.prisma.badgeDefinition.findUnique({
      where: { name },
    });
    if (!def) return;

    const existing = await this.prisma.userBadge.findUnique({
      where: {
        userId_badgeDefinitionId: { userId, badgeDefinitionId: def.id },
      },
    });
    if (existing?.earnedAt) return;

    await this.prisma.userBadge.upsert({
      where: {
        userId_badgeDefinitionId: { userId, badgeDefinitionId: def.id },
      },
      create: {
        userId,
        badgeDefinitionId: def.id,
        progress: 100,
        earnedAt: new Date(),
      },
      update: { progress: 100, earnedAt: new Date() },
    });

    await this.notifications.create(
      userId,
      'badge_earned',
      'Badge earned!',
      def.description,
      def.id,
      'badge',
      '/app/badges',
    );
  }
}
