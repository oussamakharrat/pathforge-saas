import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AiCoachService } from './ai-coach.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateConversationDto, SendMessageDto } from './dto/ai-coach.dto';

@Controller('ai-coach')
export class AiCoachController {
  constructor(private readonly service: AiCoachService) {}

  @Get('conversations')
  list(@CurrentUser() user: { id: string }) {
    return this.service.listConversations(user.id);
  }

  @Get('conversations/:id')
  getOne(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.service.getConversation(user.id, id);
  }

  @Post('conversations')
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateConversationDto) {
    return this.service.createConversation(user.id, dto);
  }

  @Post('conversations/:id/messages')
  sendMessage(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.service.sendMessage(user.id, id, dto);
  }
}
