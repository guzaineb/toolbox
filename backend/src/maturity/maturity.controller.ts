import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MaturityScoreService } from './maturity-score.service';
import { ModuleAccessService } from '../common/services/module-access.service';

@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/maturity')
export class MaturityController {
  constructor(
    private readonly maturityScore: MaturityScoreService,
    private readonly access: ModuleAccessService,
  ) {}

  @Get()
  async getMaturity(
    @Param('projectId') projectId: string,
    @Req() req: { user: { id: string } },
  ) {
    await this.access.assertCanAccessProject(projectId, req.user.id);
    return this.maturityScore.compute(projectId);
  }
}
