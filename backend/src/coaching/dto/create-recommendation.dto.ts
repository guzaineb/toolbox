import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CoachingActionPriority } from '@prisma/client';

export class CreateRecommendationDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsString()
  @IsNotEmpty({ message: 'Le contenu de la recommandation est requis' })
  content: string;

  @IsOptional()
  @IsEnum(CoachingActionPriority, {
    message: 'Priorité invalide (LOW, MEDIUM ou HIGH)',
  })
  priority?: CoachingActionPriority;

  @IsOptional()
  @IsString()
  sessionId?: string;
}
