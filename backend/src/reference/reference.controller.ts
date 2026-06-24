import { Controller, Get } from '@nestjs/common';
import { ReferenceService } from './reference.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('reference')
export class ReferenceController {
  constructor(private readonly service: ReferenceService) {}

  @Public()
  @Get('skills')
  listSkills() {
    return this.service.listSkills();
  }

  @Public()
  @Get('achievements')
  listAchievements() {
    return this.service.listAchievements();
  }

  @Public()
  @Get('badges')
  listBadges() {
    return this.service.listBadges();
  }
}
