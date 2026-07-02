import {
  Controller, Get, Patch, Post, Delete, Param, Body, Query, Req,
  UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GbmService } from './gbm.service';
import { ProjectIdParam, GbmStepParams, GbmItemParams } from './dto/gbm-params.dto';

@Controller('projects/:projectId/gbm')
@UseGuards(JwtAuthGuard)
export class GbmController {
  constructor(private readonly gbmService: GbmService) {}

  @Get('step/:stepId')
  async getStep(
    @Req() req: { user: { id: string } },
    @Param() params: GbmStepParams,
  ) {
    return this.gbmService.getStepData(params.projectId, params.stepId, req.user.id);
  }

  @Patch('step/:stepId')
  async updateStep(
    @Req() req: { user: { id: string } },
    @Param() params: GbmStepParams,
    @Body() data: Record<string, any>,
  ) {
    return this.gbmService.updateStep(params.projectId, params.stepId, data, req.user.id);
  }

  @Post('step/:stepId/add')
  async addStepItem(
    @Req() req: { user: { id: string } },
    @Param() params: GbmStepParams,
    @Body() data: Record<string, any>,
  ) {
    return this.gbmService.addStepItem(params.projectId, params.stepId, data, req.user.id);
  }

  @Get('step/:stepId/list')
  async listStepItems(
    @Req() req: { user: { id: string } },
    @Param() params: GbmStepParams,
  ) {
    return this.gbmService.listStepItems(params.projectId, params.stepId, req.user.id);
  }

  @Delete('step/:stepId/:itemId')
  async deleteStepItem(
    @Req() req: { user: { id: string } },
    @Param() params: GbmItemParams,
  ) {
    return this.gbmService.deleteStepItem(params.projectId, params.stepId, params.itemId, req.user.id);
  }

  @Post('review')
  async reviewGbm(
    @Req() req: { user: { id: string } },
    @Param() params: ProjectIdParam,
  ) {
    return this.gbmService.reviewGbm(params.projectId, req.user.id);
  }

  @Get('progress')
  async getProgress(
    @Req() req: { user: { id: string } },
    @Param() params: ProjectIdParam,
  ) {
    return this.gbmService.getProgress(params.projectId, req.user.id);
  }

  @Post('init-steps')
  async initializeSteps(
    @Req() req: { user: { id: string } },
    @Param() params: ProjectIdParam,
  ) {
    return this.gbmService.initializeProjectSteps(params.projectId, req.user.id);
  }
}
