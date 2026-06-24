import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardProjector } from '../common/dashboard.projector';
import { assertFound, assertOwner } from '../common/assertions';
import {
  CreateResumeDto,
  UpdateResumeDto,
  CreateResumeSectionDto,
  UpdateResumeSectionDto,
} from './dto/resumes.dto';

@Injectable()
export class ResumesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dashboard: DashboardProjector,
  ) {}

  async findAll(userId: string) {
    return this.prisma.resume.findMany({
      where: { userId },
      include: { sections: { orderBy: { order: 'asc' } } },
      orderBy: { version: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const resume = assertFound(
      await this.prisma.resume.findUnique({
        where: { id },
        include: { sections: { orderBy: { order: 'asc' } } },
      }),
      'Resume',
    );
    assertOwner(resume.userId, userId);
    return resume;
  }

  async create(userId: string, dto: CreateResumeDto) {
    const latest = await this.prisma.resume.findFirst({
      where: { userId },
      orderBy: { version: 'desc' },
    });
    const version = (latest?.version ?? 0) + 1;

    const resume = await this.prisma.resume.create({
      data: {
        userId,
        version,
        title: dto.title ?? `Resume v${version}`,
        sections: dto.sections?.length
          ? {
              create: dto.sections.map((s, idx) => ({
                type: s.type,
                title: s.title,
                content: s.content,
                order: s.order ?? idx,
              })),
            }
          : undefined,
      },
      include: { sections: true },
    });

    await this.dashboard.refreshCareerMetrics(userId);
    return resume;
  }

  async update(userId: string, id: string, dto: UpdateResumeDto) {
    await this.findOne(userId, id);
    const resume = await this.prisma.resume.update({
      where: { id },
      data: dto,
      include: { sections: { orderBy: { order: 'asc' } } },
    });
    await this.dashboard.refreshCareerMetrics(userId);
    return resume;
  }

  async addSection(
    userId: string,
    resumeId: string,
    dto: CreateResumeSectionDto,
  ) {
    await this.findOne(userId, resumeId);
    const maxOrder = await this.prisma.resumeSection.aggregate({
      where: { resumeId },
      _max: { order: true },
    });

    return this.prisma.resumeSection.create({
      data: {
        resumeId,
        type: dto.type,
        title: dto.title,
        content: dto.content,
        order: dto.order ?? (maxOrder._max.order ?? -1) + 1,
      },
    });
  }

  async updateSection(
    userId: string,
    resumeId: string,
    sectionId: string,
    dto: UpdateResumeSectionDto,
  ) {
    await this.findOne(userId, resumeId);
    const section = assertFound(
      await this.prisma.resumeSection.findUnique({ where: { id: sectionId } }),
      'Resume section',
    );
    if (section.resumeId !== resumeId) {
      throw new BadRequestException('Section does not belong to this resume');
    }
    return this.prisma.resumeSection.update({
      where: { id: sectionId },
      data: dto,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.resume.delete({ where: { id } });
    await this.dashboard.refreshCareerMetrics(userId);
    return { deleted: true };
  }
}
