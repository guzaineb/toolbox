import { IsString, IsEnum } from 'class-validator';
import { CohortExpertRole } from '@prisma/client';

export class InviteExpertDto {
  @IsString()
  expertUserId: string;

  @IsEnum(CohortExpertRole)
  role: CohortExpertRole;
}
