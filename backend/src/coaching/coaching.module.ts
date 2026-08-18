import { Module } from '@nestjs/common';
import { CoachingController } from './coaching.controller';
import { CoachingService } from './coaching.service';
import { CoachingSchedulerService } from './coaching-scheduler.service';

@Module({
  controllers: [CoachingController],
  providers: [CoachingService, CoachingSchedulerService],
})
export class CoachingModule {}
