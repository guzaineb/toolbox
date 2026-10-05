import { Module } from '@nestjs/common';
import { MaturityModule } from '../../maturity/maturity.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { CommonModule } from '../../common/common.module';
import { ProjectStateModule } from '../project-state/project-state.module';
import { ToolRegistry } from './tool-registry';
import { ProjectToolsService } from './project-tools.service';

@Module({
  imports: [MaturityModule, PrismaModule, CommonModule, ProjectStateModule],
  providers: [ToolRegistry, ProjectToolsService],
  exports: [ToolRegistry, ProjectToolsService],
})
export class ProjectToolsModule {}
