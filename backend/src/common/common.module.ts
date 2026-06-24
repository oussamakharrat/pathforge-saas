import { Module, Global } from '@nestjs/common';
import { NotificationsHelper } from './notifications.helper';
import { DashboardProjector } from './dashboard.projector';

@Global()
@Module({
  providers: [NotificationsHelper, DashboardProjector],
  exports: [NotificationsHelper, DashboardProjector],
})
export class CommonModule {}
