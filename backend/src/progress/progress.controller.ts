import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('progress')
export class ProgressController {
  constructor(private progressService: ProgressService) {}

  @UseGuards(JwtAuthGuard)
  @Get('project/:projectId')
  getProjectProgress(@Param('projectId') projectId: string) {
    return this.progressService.getProjectProgress(projectId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('project/:projectId/history')
  getHistory(@Param('projectId') projectId: string) {
    return this.progressService.getHistory(projectId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('porteur')
  getPorteurKPIs(@Req() req: { user: { id: string } }) {
    return this.progressService.getPorteurKPIs(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('incubateur')
  getIncubateurKPIs() {
    return this.progressService.getIncubateurKPIs();
  }
}
