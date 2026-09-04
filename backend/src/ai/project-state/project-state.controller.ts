import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ModuleAccessService } from '../../common/services/module-access.service';
import { ProjectStateService } from './project-state.service';

type RequestUser = { user: { id: string } };

@Controller('ai/project-state')
@UseGuards(JwtAuthGuard)
export class ProjectStateController {
  constructor(
    private readonly projectStateService: ProjectStateService,
    private readonly access: ModuleAccessService,
  ) {}

  @Get(':projectId')
  async getProjectState(
    @Param('projectId') projectId: string,
    @Req() req: RequestUser,
  ) {
    await this.access.assertCanAccessProject(projectId, req.user.id);
    const data = await this.projectStateService.getProjectState(projectId);
    return { data };
  }
}
