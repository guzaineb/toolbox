import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EvaluationAssignmentsService } from './evaluation-assignments.service';
import { AssignEvaluatorsDto } from './dto/assign-evaluators.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class EvaluationAssignmentsController {
  constructor(private readonly assignmentsService: EvaluationAssignmentsService) {}

  @Post('cohorts/:cohortId/evaluations/assign')
  @HttpCode(HttpStatus.CREATED)
  assign(
    @Param('cohortId') cohortId: string,
    @Body() dto: AssignEvaluatorsDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.assignmentsService.assign(cohortId, dto, req.user.id);
  }

  @Get('cohorts/:cohortId/evaluations/assignments')
  findByCohort(
    @Param('cohortId') cohortId: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.assignmentsService.findByCohort(cohortId, req.user.id);
  }

  @Get('evaluation-assignments/:id')
  findOne(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.assignmentsService.findOne(id, req.user.id);
  }

  @Get('experts/me/evaluations/todo')
  findMyTodo(@Req() req: { user: { id: string } }) {
    return this.assignmentsService.findMyTodo(req.user.id);
  }
}
