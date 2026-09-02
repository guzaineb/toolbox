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
import { BusinessPlanService } from './business-plan.service';
import { ProjectIdParam } from './dto/business-plan.dto';

@Controller('projects/:projectId/business-plan')
@UseGuards(JwtAuthGuard)
export class BusinessPlanController {
  constructor(private readonly bp: BusinessPlanService) {}

  @Get('management')
  getManagement(
    @Req() req: { user: { id: string } },
    @Param() params: ProjectIdParam,
  ) {
    return this.bp.getManagementPlan(params.projectId, req.user.id);
  }

  @Patch('management')
  updateManagement(
    @Req() req: { user: { id: string } },
    @Param() params: ProjectIdParam,
    @Body() data: any,
  ) {
    return this.bp.updateManagementPlan(params.projectId, data, req.user.id);
  }

  @Get('marketing')
  getMarketing(
    @Req() req: { user: { id: string } },
    @Param() params: ProjectIdParam,
  ) {
    return this.bp.getMarketingPlan(params.projectId, req.user.id);
  }

  @Patch('marketing')
  updateMarketing(
    @Req() req: { user: { id: string } },
    @Param() params: ProjectIdParam,
    @Body() data: any,
  ) {
    return this.bp.updateMarketingPlan(params.projectId, data, req.user.id);
  }

  @Get('financial')
  getFinancial(
    @Req() req: { user: { id: string } },
    @Param() params: ProjectIdParam,
  ) {
    return this.bp.getFinancialPlan(params.projectId, req.user.id);
  }

  @Patch('financial')
  updateFinancial(
    @Req() req: { user: { id: string } },
    @Param() params: ProjectIdParam,
    @Body() data: any,
  ) {
    return this.bp.updateFinancialPlan(params.projectId, data, req.user.id);
  }

  @Get('legal')
  getLegal(
    @Req() req: { user: { id: string } },
    @Param() params: ProjectIdParam,
  ) {
    return this.bp.getLegalPlan(params.projectId, req.user.id);
  }

  @Patch('legal')
  updateLegal(
    @Req() req: { user: { id: string } },
    @Param() params: ProjectIdParam,
    @Body() data: any,
  ) {
    return this.bp.updateLegalPlan(params.projectId, data, req.user.id);
  }

  @Get('kpis')
  getKpis(
    @Req() req: { user: { id: string } },
    @Param() params: ProjectIdParam,
  ) {
    return this.bp.getKpis(params.projectId, req.user.id);
  }

  @Patch('kpis')
  updateKpis(
    @Req() req: { user: { id: string } },
    @Param() params: ProjectIdParam,
    @Body() data: any,
  ) {
    return this.bp.updateKpis(params.projectId, data, req.user.id);
  }

  @Get('executive-summary')
  getExecutiveSummary(
    @Req() req: { user: { id: string } },
    @Param() params: ProjectIdParam,
  ) {
    return this.bp.getExecutiveSummary(params.projectId, req.user.id);
  }

  @Patch('executive-summary')
  updateExecutiveSummary(
    @Req() req: { user: { id: string } },
    @Param() params: ProjectIdParam,
    @Body() data: any,
  ) {
    return this.bp.updateExecutiveSummary(params.projectId, data, req.user.id);
  }

  @Post('executive-summary/generate')
  generateExecutiveSummary(
    @Req() req: { user: { id: string } },
    @Param() params: ProjectIdParam,
  ) {
    return this.bp.generateExecutiveSummary(params.projectId, req.user.id);
  }

  @Get('progress')
  getProgress(
    @Req() req: { user: { id: string } },
    @Param() params: ProjectIdParam,
  ) {
    return this.bp.getProgress(params.projectId, req.user.id);
  }

  @Get('status')
  getStatus(
    @Req() req: { user: { id: string } },
    @Param() params: ProjectIdParam,
  ) {
    return this.bp.getFinalizationStatus(params.projectId, req.user.id);
  }

  @Post('finalize')
  finalize(
    @Req() req: { user: { id: string } },
    @Param() params: ProjectIdParam,
  ) {
    return this.bp.finalizeBusinessPlan(params.projectId, req.user.id);
  }
}
