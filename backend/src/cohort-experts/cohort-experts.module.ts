import { Module } from '@nestjs/common';
import { CohortExpertsController } from './cohort-experts.controller';
import { CohortExpertsService } from './cohort-experts.service';

@Module({
  controllers: [CohortExpertsController],
  providers: [CohortExpertsService],
  exports: [CohortExpertsService],
})
export class CohortExpertsModule {}
