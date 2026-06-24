import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardProjector } from '../common/dashboard.projector';
import { assertFound, assertOwner } from '../common/assertions';
import { UpdateProfileDto, UpsertUserSkillDto, UpdateUserSkillDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dashboard: DashboardProjector,
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
    const { password: _, ...safe } = user;
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

    return this.getMe(userId);
  }

  async listSkills(userId: string) {
    return this.prisma.userSkill.findMany({
      where: { userId },
      include: { skillCatalog: true },
    });
  }

  async upsertSkill(userId: string, dto: UpsertUserSkillDto) {
    const skill = await this.prisma.userSkill.upsert({
      where: {
        userId_skillCatalogId: { userId, skillCatalogId: dto.skillCatalogId },
      },
      create: {
        userId,
        skillCatalogId: dto.skillCatalogId,
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
    return skill;
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
    return skill;
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
}
