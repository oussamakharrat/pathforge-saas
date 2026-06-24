import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsHelper {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    type: string,
    title: string,
    message: string,
    sourceEntityId?: string,
    sourceEntityType?: string,
    link?: string,
  ) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        sourceEntityId: sourceEntityId ?? '',
        sourceEntityType: sourceEntityType ?? '',
        link: link ?? '',
      },
    });

    await this.prisma.progressDashboard.upsert({
      where: { userId },
      create: {
        userId,
        unreadNotifications: 1,
      },
      update: {
        unreadNotifications: { increment: 1 },
        lastRefreshedAt: new Date(),
      },
    });

    return notification;
  }
}
