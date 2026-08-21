import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EvaluationsService } from './evaluations.service';
import { CreateEvaluationDto, UpdateEvaluationDto } from './dto/evaluation.dto';
import { SaveScoresDto } from './dto/save-scores.dto';
import { RequestReevaluationDto } from './dto/request-reevaluation.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @Post('projects/:projectId/evaluations')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateEvaluationDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.evaluationsService.create(projectId, dto, req.user.id);
  }

  @Patch('evaluations/:id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEvaluationDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.evaluationsService.update(id, dto, req.user.id);
  }

  @Get('evaluations/:id')
  findOne(
    @Param('id') id: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.evaluationsService.findOne(id, req.user.id);
  }

  @Get('projects/:projectId/evaluations')
  findByProject(
    @Param('projectId') projectId: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.evaluationsService.findByProject(projectId, req.user.id);
  }

  @Get('cohorts/:cohortId/evaluations')
  findByCohort(
    @Param('cohortId') cohortId: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.evaluationsService.findByCohort(cohortId, req.user.id);
  }

  @Get('experts/me/evaluations')
  findMyEvaluations(@Req() req: { user: { id: string } }) {
    return this.evaluationsService.findMyEvaluations(req.user.id);
  }

  // ==================== MODULE ÉVALUATION ====================

  @Post('evaluation-assignments/:id/draft')
  @HttpCode(HttpStatus.CREATED)
  createDraft(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.evaluationsService.createDraft(id, req.user.id);
  }

  @Patch('evaluations/:id/scores')
  saveScores(
    @Param('id') id: string,
    @Body() dto: SaveScoresDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.evaluationsService.saveScores(id, dto, req.user.id);
  }

  @Post('evaluations/:id/submit')
  @HttpCode(HttpStatus.OK)
  submit(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.evaluationsService.submit(id, req.user.id);
  }

  @Get('projects/:projectId/evaluations/summary')
  getProjectSummary(
    @Param('projectId') projectId: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.evaluationsService.getProjectSummary(projectId, req.user.id);
  }

  // ==================== RÉ-ÉVALUATION ====================

  @Post('projects/:projectId/evaluations/reevaluation')
  @HttpCode(HttpStatus.OK)
  requestReevaluation(
    @Param('projectId') projectId: string,
    @Body() dto: RequestReevaluationDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.evaluationsService.requestReevaluation(projectId, dto, req.user.id);
  }
}
