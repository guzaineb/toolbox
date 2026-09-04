import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ProjectStateService } from './project-state.service';

@Controller('ai/project-state')
@UseGuards(JwtAuthGuard)
export class ProjectStateController {
  constructor(private readonly projectStateService: ProjectStateService) {}

  @Get(':projectId')
  async getProjectState(
    @Param('projectId') projectId: string,
    @Req() req: { user: { id: string } },
  ) {
    const data = await this.projectStateService.getProjectState(projectId);
    return { data };
  }
}
