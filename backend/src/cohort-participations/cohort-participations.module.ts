import { Module } from '@nestjs/common';
import { CohortParticipationsController } from './cohort-participations.controller';
import { CohortParticipationsService } from './cohort-participations.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [CohortParticipationsController],
  providers: [CohortParticipationsService],
  exports: [CohortParticipationsService],
})
export class CohortParticipationsModule {}
