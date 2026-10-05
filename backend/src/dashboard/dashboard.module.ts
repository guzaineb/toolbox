import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { MaturityModule } from '../maturity/maturity.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [MaturityModule, NotificationsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
