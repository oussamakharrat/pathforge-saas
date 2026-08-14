import { Module, Global } from '@nestjs/common';
import { NotificationsHelper } from './notifications.helper';
import { DashboardProjector } from './dashboard.projector';
import { GamificationUnlockService } from './gamification-unlock.service';
import { EmailService } from './email.service';

@Global()
@Module({
  providers: [NotificationsHelper, DashboardProjector, GamificationUnlockService, EmailService],
  exports: [NotificationsHelper, DashboardProjector, GamificationUnlockService, EmailService],
})
export class CommonModule {}
