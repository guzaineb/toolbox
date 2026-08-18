import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { CoachingActionPriority } from '@prisma/client';

export class CreateActionDto {
  @IsString()
  @IsNotEmpty({ message: "Le titre de l'action est requis" })
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(CoachingActionPriority, {
    message: 'Priorité invalide (LOW, MEDIUM ou HIGH)',
  })
  priority?: CoachingActionPriority;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  recommendationId?: string;

  @IsOptional()
  @IsString()
  assignmentId?: string;
}
