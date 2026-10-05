import { IsOptional, IsEnum } from 'class-validator';
import { CohortExpertRole, CohortExpertStatus } from '@prisma/client';

export class UpdateCohortExpertDto {
  @IsOptional()
  @IsEnum(CohortExpertRole)
  role?: CohortExpertRole;

  @IsOptional()
  @IsEnum(CohortExpertStatus)
  status?: CohortExpertStatus;
}
