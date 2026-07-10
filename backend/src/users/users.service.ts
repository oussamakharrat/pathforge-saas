import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardProjector } from '../common/dashboard.projector';
import { GamificationUnlockService } from '../common/gamification-unlock.service';
import { assertFound, assertOwner } from '../common/assertions';
import {
  UpdateProfileDto,
  UpsertUserSkillDto,
  UpdateUserSkillDto,
  PurchaseServiceDto,
} from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dashboard: DashboardProjector,
    private readonly gamification: GamificationUnlockService,
  ) {}

  async getMe(userId: string) {
    const user = assertFound(
      await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          careerProfile: true,
          userSkills: { include: { skillCatalog: true } },
          userAchievements: { include: { achievementDefinition: true } },
          userBadges: { include: { badgeDefinition: true } },
          subscription: true,
        },
      }),
      'User',
    );
    const { password: _password, ...safe } = user;
    void _password;
    return safe;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const { displayName, ...profileFields } = dto;

    if (displayName !== undefined) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { displayName },
      });
    }

    if (Object.keys(profileFields).length > 0) {
      await this.prisma.careerProfile.upsert({
        where: { userId },
        create: { userId, ...profileFields },
        update: profileFields,
      });
    }

    await this.gamification.onProfileCompleted(userId);
    return this.getMe(userId);
  }

  async listSkills(userId: string) {
    return this.prisma.userSkill.findMany({
      where: { userId },
      include: { skillCatalog: true },
    });
  }

  async upsertSkill(userId: string, dto: UpsertUserSkillDto) {
    const skillCatalogId = await this.resolveSkillCatalogId(dto);

    const skill = await this.prisma.userSkill.upsert({
      where: {
        userId_skillCatalogId: { userId, skillCatalogId },
      },
      create: {
        userId,
        skillCatalogId,
        currentLevel: dto.currentLevel ?? 25,
        targetLevel: dto.targetLevel ?? 80,
      },
      update: {
        currentLevel: dto.currentLevel,
        targetLevel: dto.targetLevel,
        lastAssessed: new Date(),
      },
      include: { skillCatalog: true },
    });

    await this.dashboard.refreshCareerMetrics(userId);
    await this.gamification.onSkillsChanged(userId);
    return skill;
  }

  private async resolveSkillCatalogId(
    dto: UpsertUserSkillDto,
  ): Promise<string> {
    if (dto.skillCatalogId) {
      const catalog = await this.prisma.skillCatalog.findUnique({
        where: { id: dto.skillCatalogId },
      });
      if (!catalog) {
        throw new BadRequestException('Skill not found in catalog');
      }
      return catalog.id;
    }

    const trimmed = dto.name?.trim();
    if (!trimmed) {
      throw new BadRequestException('Provide skillCatalogId or name');
    }

    const existing = await this.prisma.skillCatalog.findUnique({
      where: { name: trimmed },
    });
    if (existing) return existing.id;

    const created = await this.prisma.skillCatalog.create({
      data: {
        name: trimmed,
        category: dto.category?.trim() || 'Tools',
        marketDemand: 'medium',
      },
    });
    return created.id;
  }

  async updateSkill(userId: string, skillId: string, dto: UpdateUserSkillDto) {
    const existing = assertFound(
      await this.prisma.userSkill.findUnique({ where: { id: skillId } }),
      'Skill',
    );
    assertOwner(existing.userId, userId);

    const skill = await this.prisma.userSkill.update({
      where: { id: skillId },
      data: { ...dto, lastAssessed: new Date() },
      include: { skillCatalog: true },
    });

    await this.dashboard.refreshCareerMetrics(userId);
    await this.gamification.onSkillsChanged(userId);
    return skill;
  }

  async deleteSkill(userId: string, skillId: string) {
    const existing = assertFound(
      await this.prisma.userSkill.findUnique({ where: { id: skillId } }),
      'Skill',
    );
    assertOwner(existing.userId, userId);
    await this.prisma.userSkill.delete({ where: { id: skillId } });
    await this.dashboard.refreshCareerMetrics(userId);
    return { deleted: true };
  }

  async listAchievements(userId: string) {
    return this.prisma.userAchievement.findMany({
      where: { userId },
      include: { achievementDefinition: true },
    });
  }

  async markAchievementSeen(userId: string, id: string) {
    const item = assertFound(
      await this.prisma.userAchievement.findUnique({ where: { id } }),
      'Achievement',
    );
    assertOwner(item.userId, userId);
    return this.prisma.userAchievement.update({
      where: { id },
      data: { seen: true },
      include: { achievementDefinition: true },
    });
  }

  async listBadges(userId: string) {
    return this.prisma.userBadge.findMany({
      where: { userId },
      include: { badgeDefinition: true },
    });
  }

  async markBadgeSeen(userId: string, id: string) {
    const item = assertFound(
      await this.prisma.userBadge.findUnique({ where: { id } }),
      'Badge',
    );
    assertOwner(item.userId, userId);
    return this.prisma.userBadge.update({
      where: { id },
      data: { seen: true },
      include: { badgeDefinition: true },
    });
  }

  async purchaseService(userId: string, dto: PurchaseServiceDto) {
    const profile = await this.prisma.careerProfile.findUnique({
      where: { userId },
    });
    const current = profile?.purchasedServices ?? [];
    if (current.includes(dto.service)) {
      return this.getMe(userId);
    }

    await this.prisma.careerProfile.upsert({
      where: { userId },
      create: { userId, purchasedServices: [dto.service] },
      update: { purchasedServices: [...current, dto.service] },
    });

    return this.getMe(userId);
  }

  async exportData(userId: string) {
    const user = await this.getMe(userId);
    const [goals, skills, plans, applications, negotiations, resumes, portfolio, conversations] =
      await Promise.all([
        this.prisma.goal.findMany({ where: { userId } }),
        this.prisma.userSkill.findMany({
          where: { userId },
          include: { skillCatalog: true },
        }),
        this.prisma.learningPlan.findMany({
          where: { userId },
          include: { items: true },
        }),
        this.prisma.application.findMany({
          where: { userId },
          include: { job: true, interviews: true, offers: true },
        }),
        this.prisma.negotiation.findMany({
          where: { userId },
          include: { offer: true },
        }),
        this.prisma.resume.findMany({
          where: { userId },
          include: { sections: true },
        }),
        this.prisma.portfolioProject.findMany({ where: { userId } }),
        this.prisma.aIConversation.findMany({
          where: { userId },
          include: { messages: true },
        }),
      ]);

    return {
      exportedAt: new Date().toISOString(),
      user,
      goals,
      skills,
      learningPlans: plans,
      applications,
      negotiations,
      resumes,
      portfolio,
      conversations,
    };
  }

  async deleteAccount(userId: string) {
    await this.prisma.user.delete({ where: { id: userId } });
    return { deleted: true };
  }
}
