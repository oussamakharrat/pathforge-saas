import { Controller, Get, Patch, Post, Put, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  UpdateProfileDto,
  UpsertUserSkillDto,
  UpdateUserSkillDto,
} from './dto/users.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: { id: string }) {
    return this.usersService.getMe(user.id);
  }

  @Patch('me/profile')
  updateProfile(
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Get('me/skills')
  listSkills(@CurrentUser() user: { id: string }) {
    return this.usersService.listSkills(user.id);
  }

  @Post('me/skills')
  upsertSkill(
    @CurrentUser() user: { id: string },
    @Body() dto: UpsertUserSkillDto,
  ) {
    return this.usersService.upsertSkill(user.id, dto);
  }

  @Put('me/skills/:id')
  updateSkill(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateUserSkillDto,
  ) {
    return this.usersService.updateSkill(user.id, id, dto);
  }

  @Get('me/achievements')
  listAchievements(@CurrentUser() user: { id: string }) {
    return this.usersService.listAchievements(user.id);
  }

  @Patch('me/achievements/:id/seen')
  markAchievementSeen(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.usersService.markAchievementSeen(user.id, id);
  }

  @Get('me/badges')
  listBadges(@CurrentUser() user: { id: string }) {
    return this.usersService.listBadges(user.id);
  }

  @Patch('me/badges/:id/seen')
  markBadgeSeen(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.usersService.markBadgeSeen(user.id, id);
  }
}
