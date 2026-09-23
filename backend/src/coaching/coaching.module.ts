import { Module } from '@nestjs/common';
import { CoachingController } from './coaching.controller';
import { CoachingService } from './coaching.service';
import { CoachingSchedulerService } from './coaching-scheduler.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [CoachingController],
  providers: [CoachingService, CoachingSchedulerService],
})
export class CoachingModule {}
