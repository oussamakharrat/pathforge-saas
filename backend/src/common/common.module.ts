import { Module, Global } from '@nestjs/common';
import { NotificationsHelper } from './notifications.helper';
import { DashboardProjector } from './dashboard.projector';
import { GamificationUnlockService } from './gamification-unlock.service';

@Global()
@Module({
  providers: [NotificationsHelper, DashboardProjector, GamificationUnlockService],
  exports: [NotificationsHelper, DashboardProjector, GamificationUnlockService],
})
export class CommonModule {}
