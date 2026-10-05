import { IsString, IsEnum } from 'class-validator';
import { CohortExpertRole } from '@prisma/client';

export class CreateCohortExpertDto {
  @IsString()
  expertUserId: string;

  @IsEnum(CohortExpertRole)
  role: CohortExpertRole;
}
