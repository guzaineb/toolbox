import { Module } from '@nestjs/common';
import { CohortParticipationsController } from './cohort-participations.controller';
import { CohortParticipationsService } from './cohort-participations.service';

@Module({
  controllers: [CohortParticipationsController],
  providers: [CohortParticipationsService],
  exports: [CohortParticipationsService],
})
export class CohortParticipationsModule {}
