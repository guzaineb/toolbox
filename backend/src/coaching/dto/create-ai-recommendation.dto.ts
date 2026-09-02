import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { CoachingActionPriority } from '@prisma/client';

/**
 * Recommandation issue d'une suggestion IA, validée par le coach (human-in-the-loop).
 */
export class CreateAiRecommendationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  priority?: CoachingActionPriority;

  @IsOptional()
  @IsUUID()
  sessionId?: string;

  @IsUUID()
  aiAnalysisId: string;
}
