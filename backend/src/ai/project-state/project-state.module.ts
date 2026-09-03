import { Module } from '@nestjs/common';
import { ProjectAnalyzer } from './project-analyzer.service';
import { ConsistencyChecker } from './consistency-checker.service';
import { ProjectHealthService } from './project-health.service';
import { ProjectStateService } from './project-state.service';

@Module({
  providers: [
    ProjectAnalyzer,
    ConsistencyChecker,
    ProjectHealthService,
    ProjectStateService,
  ],
  exports: [
    ProjectAnalyzer,
    ConsistencyChecker,
    ProjectHealthService,
    ProjectStateService,
  ],
})
export class ProjectStateModule {}
