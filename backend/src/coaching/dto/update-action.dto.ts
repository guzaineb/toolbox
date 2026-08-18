import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { CoachingActionStatus, CoachingActionPriority } from '@prisma/client';

export class UpdateActionDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(CoachingActionStatus, {
    message: 'Statut invalide',
  })
  status?: CoachingActionStatus;

  @IsOptional()
  @IsEnum(CoachingActionPriority, {
    message: 'Priorité invalide (LOW, MEDIUM ou HIGH)',
  })
  priority?: CoachingActionPriority;

  @IsOptional()
  @IsDateString()
  deadline?: string;
}
