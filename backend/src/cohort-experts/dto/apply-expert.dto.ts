import { IsEnum } from 'class-validator';
import { CohortExpertRole } from '@prisma/client';

export class ApplyExpertDto {
  @IsEnum(CohortExpertRole)
  role: CohortExpertRole;
}
