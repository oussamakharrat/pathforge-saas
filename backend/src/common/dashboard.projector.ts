import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  GoalStatus,
  LearningPlanStatus,
  ApplicationStatus,
} from '@prisma/client';

@Injectable()
export class DashboardProjector {
  constructor(private readonly prisma: PrismaService) {}

  async refresh(userId: string) {
    const [
      activeGoals,
      activePlans,
      ongoingApplications,
      upcomingInterviews,
      pendingOffers,
      unreadNotifications,
    ] = await Promise.all([
      this.prisma.goal.count({
        where: {
          userId,
          status: { in: [GoalStatus.not_started, GoalStatus.in_progress] },
        },
      }),
      this.prisma.learningPlan.count({
        where: { userId, status: LearningPlanStatus.active },
      }),
      this.prisma.application.count({
        where: {
          userId,
          status: {
            notIn: [ApplicationStatus.rejected, ApplicationStatus.accepted],
          },
        },
      }),
      this.prisma.interview.count({
        where: {
          application: { userId },
          status: 'scheduled',
          date: { gte: new Date() },
        },
      }),
      this.prisma.offer.count({
        where: {
          application: { userId },
          status: 'pending',
        },
      }),
      this.prisma.notification.count({ where: { userId, read: false } }),
    ]);

    return this.prisma.progressDashboard.upsert({
      where: { userId },
      create: {
        userId,
        activeGoals,
        activePlans,
        ongoingApplications,
        upcomingInterviews,
        pendingOffers,
        unreadNotifications,
      },
      update: {
        activeGoals,
        activePlans,
        ongoingApplications,
        upcomingInterviews,
        pendingOffers,
        unreadNotifications,
        lastRefreshedAt: new Date(),
      },
    });
  }

  async refreshCareerMetrics(userId: string) {
    const [skills, goals, applications, resumes, badges] = await Promise.all([
      this.prisma.userSkill.findMany({ where: { userId } }),
      this.prisma.goal.findMany({ where: { userId } }),
      this.prisma.application.findMany({ where: { userId } }),
      this.prisma.resume.findMany({ where: { userId } }),
      this.prisma.userBadge.findMany({
        where: { userId, earnedAt: { not: null } },
      }),
    ]);

    const skillsScore =
      skills.length > 0
        ? Math.round(
            skills.reduce((s, sk) => s + sk.currentLevel, 0) / skills.length,
          )
        : 0;

    const goalScore =
      goals.length > 0
        ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length)
        : 0;

    const applicationScore = Math.min(
      100,
      applications.filter((a) =>
        ['applied', 'screening', 'interview', 'offer', 'accepted'].includes(
          a.status,
        ),
      ).length * 10,
    );

    const resumeScore =
      resumes.length > 0
        ? Math.round(
            resumes.reduce((s, r) => s + r.atsScore, 0) / resumes.length,
          )
        : 0;

    const badgeBonus = Math.min(20, badges.length * 2);

    const overallScore = Math.min(
      100,
      Math.round(
        skillsScore * 0.3 +
          goalScore * 0.2 +
          applicationScore * 0.2 +
          resumeScore * 0.15 +
          badgeBonus * 0.15,
      ),
    );

    return this.prisma.careerMetrics.upsert({
      where: { userId },
      create: {
        userId,
        overallScore,
        skillsScore,
        applicationScore,
        resumeScore,
        goalScore,
      },
      update: {
        overallScore,
        skillsScore,
        applicationScore,
        resumeScore,
        goalScore,
        lastCalculatedAt: new Date(),
      },
    });
  }
}
