import { Global, Module } from '@nestjs/common';
import { ProjectsModule } from '../projects/projects.module';
import { SectionStepService } from './services/section-step.service';
import { ProgressService } from './services/progress.service';
import { ProjectContextService } from './services/project-context.service';
import { ModuleAccessService } from './services/module-access.service';
import { ProjectContextController } from './controllers/project-context.controller';

@Global()
@Module({
  imports: [ProjectsModule],
  controllers: [ProjectContextController],
  providers: [
    SectionStepService,
    ProgressService,
    ProjectContextService,
    ModuleAccessService,
  ],
  exports: [
    SectionStepService,
    ProgressService,
    ProjectContextService,
    ModuleAccessService,
  ],
})
export class CommonModule {}
