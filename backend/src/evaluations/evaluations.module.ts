import { Module } from '@nestjs/common';
import { EvaluationsController } from './evaluations.controller';
import { EvaluationsService } from './evaluations.service';
import { EvaluationTemplatesController } from './evaluation-templates.controller';
import { EvaluationTemplatesService } from './evaluation-templates.service';
import { EvaluationAssignmentsController } from './evaluation-assignments.controller';
import { EvaluationAssignmentsService } from './evaluation-assignments.service';

@Module({
  controllers: [
    EvaluationsController,
    EvaluationTemplatesController,
    EvaluationAssignmentsController,
  ],
  providers: [
    EvaluationsService,
    EvaluationTemplatesService,
    EvaluationAssignmentsService,
  ],
  exports: [EvaluationsService],
})
export class EvaluationsModule {}
