import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SectionStepService } from '../services/section-step.service';
import { ProjectContextService } from '../services/project-context.service';

/**
 * Expose le contexte complet d'un projet et le préremplissage intelligent
 * des modules (Business Plan, Éco-conception, Impact, Marché, Financement).
 */
@Controller('projects/:projectId/context')
@UseGuards(JwtAuthGuard)
export class ProjectContextController {
  constructor(
    private readonly context: ProjectContextService,
    private readonly sections: SectionStepService,
  ) {}

  @Get()
  async getContext(
    @Req() req: { user: { id: string } },
    @Param('projectId') projectId: string,
  ) {
    await this.sections.ensureOwnership(projectId, req.user.id);
    return this.context.getFullContext(projectId);
  }

  @Get('prefill/:module')
  getPrefill(
    @Req() req: { user: { id: string } },
    @Param('projectId') projectId: string,
    @Param('module') module: string,
  ) {
    return this.context.getPrefill(projectId, module, req.user.id);
  }
}
