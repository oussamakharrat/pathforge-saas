import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsHelper } from '../common/notifications.helper';
import { assertFound, assertOwner } from '../common/assertions';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsHelper: NotificationsHelper,
  ) {}

  async create(userId: string, dto: CreateNotificationDto) {
    return this.notificationsHelper.create(
      userId,
      dto.type,
      dto.title,
      dto.message,
      dto.sourceEntityId,
      dto.sourceEntityType,
      dto.link,
    );
  }

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

  async remove(userId: string, id: string) {
    const n = assertFound(
      await this.prisma.notification.findUnique({ where: { id } }),
      'Notification',
    );
    assertOwner(n.userId, userId);

    await this.prisma.notification.delete({ where: { id } });

    const unread = await this.prisma.notification.count({
      where: { userId, read: false },
    });
    await this.prisma.progressDashboard.upsert({
      where: { userId },
      create: { userId, unreadNotifications: unread },
      update: { unreadNotifications: unread, lastRefreshedAt: new Date() },
    });

    return { deleted: true };
  }

  async clearRead(userId: string) {
    await this.prisma.notification.deleteMany({
      where: { userId, read: true },
    });
    return { deleted: true };
  }
}
