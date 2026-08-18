import { IsEnum, IsOptional } from 'class-validator';
import { CohortExpertRole, CohortExpertStatus } from '@prisma/client';

export class UpdateAssignmentDto {
  @IsOptional()
  @IsEnum(CohortExpertRole, {
    message: 'Rôle invalide (COACH ou JURY)',
  })
  role?: CohortExpertRole;

  @IsOptional()
  @IsEnum(CohortExpertStatus, {
    message: 'Statut invalide (ACTIVE ou INACTIVE)',
  })
  status?: CohortExpertStatus;
}
