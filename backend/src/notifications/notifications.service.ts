import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { assertFound, assertOwner } from '../common/assertions';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, unreadOnly = false) {
    return this.prisma.notification.findMany({
      where: { userId, ...(unreadOnly ? { read: false } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markRead(userId: string, id: string) {
    const n = assertFound(
      await this.prisma.notification.findUnique({ where: { id } }),
      'Notification',
    );
    assertOwner(n.userId, userId);

    const updated = await this.prisma.notification.update({
      where: { id },
      data: { read: true, readAt: new Date() },
    });

    const unread = await this.prisma.notification.count({
      where: { userId, read: false },
    });

    await this.prisma.progressDashboard.upsert({
      where: { userId },
      create: { userId, unreadNotifications: unread },
      update: { unreadNotifications: unread, lastRefreshedAt: new Date() },
    });

    return updated;
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true, readAt: new Date() },
    });

    await this.prisma.progressDashboard.upsert({
      where: { userId },
      create: { userId, unreadNotifications: 0 },
      update: { unreadNotifications: 0, lastRefreshedAt: new Date() },
    });

    return { success: true };
  }
}
