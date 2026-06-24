import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReferenceService {
  constructor(private readonly prisma: PrismaService) {}

  listSkills() {
    return this.prisma.skillCatalog.findMany({ orderBy: { name: 'asc' } });
  }

  listAchievements() {
    return this.prisma.achievementDefinition.findMany({ orderBy: { name: 'asc' } });
  }

  listBadges() {
    return this.prisma.badgeDefinition.findMany({ orderBy: { name: 'asc' } });
  }
}
