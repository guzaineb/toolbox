import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class GenerateImprovementPlanDto {
  @IsUUID()
  @IsNotEmpty()
  evaluationId: string;
}

export class ProgressAnalysisDto {
  @IsUUID()
  @IsNotEmpty()
  fromEvaluationId: string;

  @IsUUID()
  @IsNotEmpty()
  toEvaluationId: string;
}

export class AiAnalysisQueryDto {
  /** EVALUATION_ANALYSIS | JURY_ASSISTANT | RISK_ANALYSIS | PROGRESS_ANALYSIS | SESSION_BRIEF | SESSION_SUMMARY */
  @IsOptional()
  @IsString()
  type?: string;
}
