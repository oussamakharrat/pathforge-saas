import { Injectable, BadRequestException } from '@nestjs/common';
import { PortfolioStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { assertFound, assertOwner } from '../common/assertions';
import { MAX_FEATURED_PROJECTS } from '../domain/types';
import { CreatePortfolioProjectDto, UpdatePortfolioProjectDto } from './dto/portfolio.dto';

@Injectable()
export class PortfolioService {
  constructor(private readonly prisma: PrismaService) {}

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

  private async enforceFeaturedLimit(userId: string, featured: boolean, excludeId?: string) {
    if (!featured) return;
    const count = await this.prisma.portfolioProject.count({
      where: { userId, featured: true, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
    if (count >= MAX_FEATURED_PROJECTS) {
      throw new BadRequestException(`Maximum ${MAX_FEATURED_PROJECTS} featured projects allowed`);
    }
  }

  async create(userId: string, dto: CreatePortfolioProjectDto) {
    await this.enforceFeaturedLimit(userId, dto.featured ?? false);

    return this.prisma.portfolioProject.create({
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
        skills: dto.skillCatalogIds?.length
          ? { create: dto.skillCatalogIds.map((skillCatalogId) => ({ skillCatalogId })) }
          : undefined,
      },
      include: { skills: { include: { skillCatalog: true } } },
    });
  }

  async update(userId: string, id: string, dto: UpdatePortfolioProjectDto) {
    await this.findOne(userId, id);
    if (dto.featured) await this.enforceFeaturedLimit(userId, true, id);

    if (dto.skillCatalogIds) {
      await this.prisma.portfolioProjectSkill.deleteMany({ where: { projectId: id } });
      if (dto.skillCatalogIds.length) {
        await this.prisma.portfolioProjectSkill.createMany({
          data: dto.skillCatalogIds.map((skillCatalogId) => ({ projectId: id, skillCatalogId })),
        });
      }
    }

    return this.prisma.portfolioProject.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        technologies: dto.technologies,
        repoUrl: dto.repoUrl,
        demoUrl: dto.demoUrl,
        imageUrl: dto.imageUrl,
        status: dto.status as PortfolioStatus | undefined,
        featured: dto.featured,
        completedAt: dto.status === 'completed' ? new Date() : undefined,
      },
      include: { skills: { include: { skillCatalog: true } } },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.portfolioProject.delete({ where: { id } });
    return { deleted: true };
  }
}
