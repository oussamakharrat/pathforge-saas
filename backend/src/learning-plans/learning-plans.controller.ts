import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { LearningPlansService } from './learning-plans.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  CreateLearningPlanDto,
  UpdateLearningPlanDto,
  CreateLearningItemDto,
  ToggleLearningItemDto,
} from './dto/learning-plans.dto';

@Controller('learning-plans')
export class LearningPlansController {
  constructor(private readonly service: LearningPlansService) {}

  @Get()
  findAll(@CurrentUser() user: { id: string }) {
    return this.service.findAll(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.service.findOne(user.id, id);
  }

  @Post()
  create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateLearningPlanDto,
  ) {
    return this.service.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateLearningPlanDto,
  ) {
    return this.service.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.service.remove(user.id, id);
  }

  @Post(':id/items')
  addItem(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: CreateLearningItemDto,
  ) {
    return this.service.addItem(user.id, id, dto);
  }

  @Patch(':id/items/:itemId/toggle')
  toggleItem(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: ToggleLearningItemDto,
  ) {
    return this.service.toggleItem(user.id, id, itemId, dto);
  }

  @Delete(':id/items/:itemId')
  removeItem(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ) {
    return this.service.removeItem(user.id, id, itemId);
  }
}
