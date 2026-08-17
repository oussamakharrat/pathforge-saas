import { Controller, Get, Patch, Delete, Post, Query, Param, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Post()
  create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateNotificationDto,
  ) {
    return this.service.create(user.id, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: { id: string },
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.service.findAll(user.id, unreadOnly === 'true');
  }

  @Patch('read-all')
  markAllRead(@CurrentUser() user: { id: string }) {
    return this.service.markAllRead(user.id);
  }

  @Patch(':id/read')
  markRead(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.service.markRead(user.id, id);
  }

  @Delete('read')
  clearRead(@CurrentUser() user: { id: string }) {
    return this.service.clearRead(user.id);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.service.remove(user.id, id);
  }
}
