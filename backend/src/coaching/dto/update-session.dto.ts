import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { CoachingSessionStatus } from '@prisma/client';

export class UpdateSessionDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(480)
  durationMinutes?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  sessionType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  objective?: string;

  @IsOptional()
  @IsString()
  agenda?: string;

  @IsOptional()
  @IsEnum(CoachingSessionStatus, {
    message: 'Statut de session invalide',
  })
  status?: CoachingSessionStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  decisions?: string;

  @IsOptional()
  @IsString()
  report?: string;

  /** Résumé de session (proposé par l'IA, validé/édité par le coach). */
  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  nextObjectives?: string;
}
