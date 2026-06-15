import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectStep } from './project-step.entity';
import { JourneyService } from './journey.service';
import { JourneyController } from './journey.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectStep])],
  controllers: [JourneyController],
  providers: [JourneyService],
  exports: [JourneyService],
})
export class JourneyModule {}
