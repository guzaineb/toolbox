import { Module } from '@nestjs/common';
import { MaturityModule } from '../../maturity/maturity.module';
import { ProjectAnalyzer } from './project-analyzer.service';
import { ConsistencyChecker } from './consistency-checker.service';
import { ProjectHealthService } from './project-health.service';
import { ProjectStateService } from './project-state.service';

@Module({
  imports: [MaturityModule],
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
