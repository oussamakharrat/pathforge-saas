import { Module, Global } from '@nestjs/common';
import { NotificationsHelper } from './notifications.helper';
import { DashboardProjector } from './dashboard.projector';
import { GamificationUnlockService } from './gamification-unlock.service';
import { EmailService } from './email.service';
import { PlanService } from './plan.service';

@Global()
@Module({
  providers: [NotificationsHelper, DashboardProjector, GamificationUnlockService, EmailService, PlanService],
  exports: [NotificationsHelper, DashboardProjector, GamificationUnlockService, EmailService, PlanService],
})
export class CommonModule {}
