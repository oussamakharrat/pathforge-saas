import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardProjector } from '../common/dashboard.projector';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projector: DashboardProjector,
  ) {}

  async getProgressDashboard(userId: string) {
    return this.projector.refresh(userId);
  }

  async getCareerMetrics(userId: string) {
    return this.projector.refreshCareerMetrics(userId);
  }

  async getJobMatchInsights(userId: string) {
    const jobs = await this.prisma.jobPosting.findMany({
      where: { userId },
      include: { skills: true },
    });
    const userSkills = await this.prisma.userSkill.findMany({ where: { userId } });
    const userSkillIds = new Set(userSkills.map((s) => s.skillCatalogId));

    const insights = await Promise.all(
      jobs.map(async (job) => {
        const required = job.skills.map((s) => s.skillCatalogId);
        const missing = required.filter((id) => !userSkillIds.has(id));
        const matchPercentage =
          required.length > 0
            ? Math.round(((required.length - missing.length) / required.length) * 100)
            : job.matchScore;

        return this.prisma.jobMatchInsight.upsert({
          where: { userId_jobId: { userId, jobId: job.id } },
          create: {
            userId,
            jobId: job.id,
            matchPercentage,
            missingSkillIds: missing,
          },
          update: {
            matchPercentage,
            missingSkillIds: missing,
            lastUpdated: new Date(),
          },
        });
      }),
    );

    return insights;
  }

  async getInterviewReadiness(userId: string) {
    const interviews = await this.prisma.interview.findMany({
      where: { application: { userId }, status: 'completed' },
    });

    const byRole = new Map<string, number[]>();
    for (const i of interviews) {
      const role = i.role || 'General';
      if (!byRole.has(role)) byRole.set(role, []);
      byRole.get(role)!.push(i.score);
    }

    const results: Awaited<ReturnType<typeof this.prisma.interviewReadiness.upsert>>[] = [];
    for (const [role, scores] of byRole) {
      const readinessScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      const row = await this.prisma.interviewReadiness.upsert({
        where: { userId_role: { userId, role } },
        create: {
          userId,
          role,
          readinessScore,
          interviewCount: scores.length,
          lastScore: scores[scores.length - 1],
        },
        update: {
          readinessScore,
          interviewCount: scores.length,
          lastScore: scores[scores.length - 1],
          lastUpdated: new Date(),
        },
      });
      results.push(row);
    }

    return results;
  }
}
