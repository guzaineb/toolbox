import { Module, forwardRef, OnApplicationBootstrap } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../projects/project.entity';
import { ProjectStep } from './project-step.entity';
import { JourneyService } from './journey.service';
import { JourneyController, MigrationController } from './journey.controller';
import { JourneyMigrationService } from './journey-migration.service';
import { ProgressModule } from '../progress/progress.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectStep, Project]), forwardRef(() => ProgressModule)],
  controllers: [JourneyController, MigrationController],
  providers: [JourneyService, JourneyMigrationService],
  exports: [JourneyService, JourneyMigrationService],
})
export class JourneyModule implements OnApplicationBootstrap {
  constructor(private migrationService: JourneyMigrationService) {}

  async onApplicationBootstrap() {
    await this.migrationService.migrateAllProjects();
  }
}
