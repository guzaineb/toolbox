import { Controller, Get, Patch, Param, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EcoDesignService } from './eco-design.service';
import { ProjectIdParam } from './dto/eco-design.dto';

@Controller('projects/:projectId/eco-design')
@UseGuards(JwtAuthGuard)
export class EcoDesignController {
  constructor(private readonly eco: EcoDesignService) {}

  @Get()
  get(@Req() req: { user: { id: string } }, @Param() params: ProjectIdParam) {
    return this.eco.get(params.projectId, req.user.id);
  }

  @Patch()
  update(@Req() req: { user: { id: string } }, @Param() params: ProjectIdParam, @Body() data: any) {
    return this.eco.update(params.projectId, data, req.user.id);
  }

  @Get('progress')
  getProgress(@Req() req: { user: { id: string } }, @Param() params: ProjectIdParam) {
    return this.eco.getProgress(params.projectId, req.user.id);
  }
}
