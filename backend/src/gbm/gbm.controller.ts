import {
  Controller, Get, Patch, Post, Delete, Param, Body, Query, Req, Res,
  UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GbmService } from './gbm.service';
import { BmcPdfService } from './bmc-pdf.service';
import { ProjectIdParam, GbmStepParams, GbmItemParams } from './dto/gbm-params.dto';

@Controller('projects/:projectId/gbm')
@UseGuards(JwtAuthGuard)
export class GbmController {
  constructor(
    private readonly gbmService: GbmService,
    private readonly bmcPdfService: BmcPdfService,
  ) {}

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

  @Get('bmc-pdf')
  async downloadBmcPdf(
    @Req() req: { user: { id: string } },
    @Param() params: ProjectIdParam,
    @Res() res: Response,
  ) {
    const buffer = await this.bmcPdfService.generate(params.projectId, req.user.id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="bmc-${params.projectId}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
