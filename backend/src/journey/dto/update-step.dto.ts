import { IsOptional, IsEnum, IsObject } from 'class-validator';
import { StepStatus } from '../project-step.entity';

export class UpdateStepDto {
  @IsOptional()
  @IsObject()
  content?: Record<string, any>;

  @IsOptional()
  @IsObject()
  sub_sections?: Record<string, any>;

  @IsOptional()
  @IsEnum(StepStatus)
  status?: StepStatus;
}
