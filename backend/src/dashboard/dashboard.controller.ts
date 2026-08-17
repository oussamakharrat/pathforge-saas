import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePlan } from '../auth/decorators/require-plan.decorator';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('progress')
  getProgress(@CurrentUser() user: { id: string }) {
    return this.service.getProgressDashboard(user.id);
  }

  @Get('metrics')
  getMetrics(@CurrentUser() user: { id: string }) {
    return this.service.getCareerMetrics(user.id);
  }

  @Get('job-match')
  @RequirePlan('pro')
  getJobMatch(@CurrentUser() user: { id: string }) {
    return this.service.getJobMatchInsights(user.id);
  }

  @Get('interview-readiness')
  @RequirePlan('premium')
  getInterviewReadiness(@CurrentUser() user: { id: string }) {
    return this.service.getInterviewReadiness(user.id);
  }
}
