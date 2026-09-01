import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CohortsController } from './cohorts.controller';
import { CohortsService } from './cohorts.service';
import { CohortSchedulerService } from './cohort-scheduler.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [CohortsController],
  providers: [CohortsService, CohortSchedulerService],
  exports: [CohortsService],
})
export class CohortsModule {}
