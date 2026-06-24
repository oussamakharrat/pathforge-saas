import { Controller, Get, Patch, Post, Body } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateSubscriptionDto } from './dto/subscriptions.dto';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly service: SubscriptionsService) {}

  @Get('me')
  getMine(@CurrentUser() user: { id: string }) {
    return this.service.getMine(user.id);
  }

  @Patch('me')
  update(
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateSubscriptionDto,
  ) {
    return this.service.update(user.id, dto);
  }

  @Post('me/cancel')
  cancel(@CurrentUser() user: { id: string }) {
    return this.service.cancel(user.id);
  }
}
