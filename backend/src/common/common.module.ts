import { Global, Module } from '@nestjs/common';
import { ProjectsModule } from '../projects/projects.module';
import { SectionStepService } from './services/section-step.service';
import { ProgressService } from './services/progress.service';
import { ProjectContextService } from './services/project-context.service';
import { ProjectContextController } from './controllers/project-context.controller';

@Global()
@Module({
  imports: [ProjectsModule],
  controllers: [ProjectContextController],
  providers: [SectionStepService, ProgressService, ProjectContextService],
  exports: [SectionStepService, ProgressService, ProjectContextService],
})
export class CommonModule {}
