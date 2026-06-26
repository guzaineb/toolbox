import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { Sector } from '../sectors/sector.entity';
import { DevelopmentPhase } from '../development-phases/development-phase.entity';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { JourneyModule } from '../journey/journey.module';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Sector, DevelopmentPhase]), JourneyModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
