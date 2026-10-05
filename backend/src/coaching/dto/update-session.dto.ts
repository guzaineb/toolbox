import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { CoachingSessionStatus, SessionObjectiveResult } from '@prisma/client';

/** Blocage identifié par le coach pendant la session (stocké en Json sur la session). */
export class SessionBlockerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  detail?: string;

  @IsOptional()
  @IsBoolean()
  resolved?: boolean;
}

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

  /** Constats du coach — distincts des notes : ce que le coach observe, pas ce qui a été dit. */
  @IsOptional()
  @IsString()
  findings?: string;

  /** Points réellement abordés pendant la séance (un par ligne). */
  @IsOptional()
  @IsString()
  topicsDiscussed?: string;

  /** Blocages identifiés (suivis de session en session). */
  @IsOptional()
  @IsArray()
  blockers?: SessionBlockerDto[];

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

  /** Résultat de l'objectif fixé pour la session. */
  @IsOptional()
  @IsEnum(SessionObjectiveResult, {
    message: 'Résultat invalide (ACHIEVED, PARTIALLY_ACHIEVED ou NOT_ACHIEVED)',
  })
  objectiveResult?: SessionObjectiveResult;

  /** Justification du résultat constaté. */
  @IsOptional()
  @IsString()
  objectiveResultReason?: string;
}
