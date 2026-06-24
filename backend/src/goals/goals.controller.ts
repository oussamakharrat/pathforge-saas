import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { GoalsService } from './goals.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  CreateGoalDto,
  UpdateGoalDto,
  AddMilestoneDto,
  ToggleMilestoneDto,
} from './dto/goals.dto';

@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Get()
  findAll(@CurrentUser() user: { id: string }) {
    return this.goalsService.findAll(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.goalsService.findOne(user.id, id);
  }

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateGoalDto) {
    return this.goalsService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateGoalDto,
  ) {
    return this.goalsService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.goalsService.remove(user.id, id);
  }

  @Post(':id/milestones')
  addMilestone(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: AddMilestoneDto,
  ) {
    return this.goalsService.addMilestone(user.id, id, dto);
  }

  @Patch(':id/milestones/toggle')
  toggleMilestone(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: ToggleMilestoneDto,
  ) {
    return this.goalsService.toggleMilestone(user.id, id, dto);
  }
}
