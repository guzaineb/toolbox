import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ImpactService } from './impact.service';
import { ProjectIdParam } from './dto/impact.dto';

@Controller('projects/:projectId/impact')
@UseGuards(JwtAuthGuard)
export class ImpactController {
  constructor(private readonly impact: ImpactService) {}

  @Get()
  get(@Req() req: { user: { id: string } }, @Param() params: ProjectIdParam) {
    return this.impact.get(params.projectId, req.user.id);
  }

  @Patch()
  update(
    @Req() req: { user: { id: string } },
    @Param() params: ProjectIdParam,
    @Body() data: any,
  ) {
    return this.impact.update(params.projectId, data, req.user.id);
  }

  @Post('report/generate')
  generateReport(
    @Req() req: { user: { id: string } },
    @Param() params: ProjectIdParam,
  ) {
    return this.impact.generateReport(params.projectId, req.user.id);
  }

  @Get('progress')
  getProgress(
    @Req() req: { user: { id: string } },
    @Param() params: ProjectIdParam,
  ) {
    return this.impact.getProgress(params.projectId, req.user.id);
  }
}
