import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
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

  /** Responsable de l'action : porteur, coach ou tout utilisateur autorisé. */
  @IsOptional()
  @IsString()
  responsibleUserId?: string | null;

  /** Livrable concerné (clé des DOCUMENT_DEFINITIONS). */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  relatedDocumentKey?: string | null;

  /** Objectif du plan d'amélioration lié (« null » pour détacher). */
  @IsOptional()
  @IsString()
  objectiveId?: string | null;
}
