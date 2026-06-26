import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevelopmentPhase } from './development-phase.entity';
import { DevelopmentPhasesService } from './development-phases.service';
import { DevelopmentPhasesController } from './development-phases.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DevelopmentPhase])],
  controllers: [DevelopmentPhasesController],
  providers: [DevelopmentPhasesService],
  exports: [DevelopmentPhasesService],
})
export class DevelopmentPhasesModule {}
