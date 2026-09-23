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
  findOne(@Param('id') id: string) {
    return this.evaluationsService.findOne(id);
  }

  @Get('projects/:projectId/evaluations')
  findByProject(@Param('projectId') projectId: string) {
    return this.evaluationsService.findByProject(projectId);
  }

  @Get('cohorts/:cohortId/evaluations')
  findByCohort(@Param('cohortId') cohortId: string) {
    return this.evaluationsService.findByCohort(cohortId);
  }

  @Get('experts/me/evaluations')
  findMyEvaluations(@Req() req: { user: { id: string } }) {
    return this.evaluationsService.findMyEvaluations(req.user.id);
  }
}
