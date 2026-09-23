import { Module } from '@nestjs/common';
import { CoachingsController } from './coachings.controller';
import { CoachingsService } from './coachings.service';

@Module({
  controllers: [CoachingsController],
  providers: [CoachingsService],
  exports: [CoachingsService],
})
export class CoachingsModule {}
