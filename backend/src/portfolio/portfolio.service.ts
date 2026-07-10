import { Injectable, BadRequestException } from '@nestjs/common';
import { PortfolioStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GamificationUnlockService } from '../common/gamification-unlock.service';
import { assertFound, assertOwner } from '../common/assertions';
import { MAX_FEATURED_PROJECTS } from '../domain/types';
import {
  CreatePortfolioProjectDto,
  UpdatePortfolioProjectDto,
} from './dto/portfolio.dto';

@Injectable()
export class PortfolioService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gamification: GamificationUnlockService,
  ) {}

  async findAll(userId: string) {
    return this.prisma.portfolioProject.findMany({
      where: { userId },
      include: { skills: { include: { skillCatalog: true } } },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(userId: string, id: string) {
    const project = assertFound(
      await this.prisma.portfolioProject.findUnique({
        where: { id },
        include: { skills: { include: { skillCatalog: true } } },
      }),
      'Project',
    );
    assertOwner(project.userId, userId);
    return project;
  }

  private async enforceFeaturedLimit(
    userId: string,
    featured: boolean,
    excludeId?: string,
  ) {
    if (!featured) return;
    const count = await this.prisma.portfolioProject.count({
      where: {
        userId,
        featured: true,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    if (count >= MAX_FEATURED_PROJECTS) {
      throw new BadRequestException(
        `Maximum ${MAX_FEATURED_PROJECTS} featured projects allowed`,
      );
    }
  }

  async create(userId: string, dto: CreatePortfolioProjectDto) {
    await this.enforceFeaturedLimit(userId, dto.featured ?? false);

    const project = await this.prisma.portfolioProject.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description ?? '',
        technologies: dto.technologies ?? [],
        repoUrl: dto.repoUrl ?? '',
        demoUrl: dto.demoUrl ?? '',
        imageUrl: dto.imageUrl ?? '',
        status: (dto.status as PortfolioStatus) ?? PortfolioStatus.not_started,
        featured: dto.featured ?? false,
        completedAt:
          dto.status === PortfolioStatus.completed ? new Date() : undefined,
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
    await this.gamification.onPortfolioUpdated(userId);
    return project;
  }

  async update(userId: string, id: string, dto: UpdatePortfolioProjectDto) {
    await this.findOne(userId, id);
    if (dto.featured) await this.enforceFeaturedLimit(userId, true, id);

    if (dto.skillCatalogIds) {
      await this.prisma.portfolioProjectSkill.deleteMany({
        where: { projectId: id },
      });
      if (dto.skillCatalogIds.length) {
        await this.prisma.portfolioProjectSkill.createMany({
          data: dto.skillCatalogIds.map((skillCatalogId) => ({
            projectId: id,
            skillCatalogId,
          })),
        });
      }
    }

    const project = await this.prisma.portfolioProject.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        technologies: dto.technologies,
        repoUrl: dto.repoUrl,
        demoUrl: dto.demoUrl,
        imageUrl: dto.imageUrl,
        status: dto.status,
        featured: dto.featured,
        completedAt: dto.status === 'completed' ? new Date() : undefined,
      },
      include: { skills: { include: { skillCatalog: true } } },
    });
    await this.gamification.onPortfolioUpdated(userId);
    return project;
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.portfolioProject.delete({ where: { id } });
    return { deleted: true };
  }
}
