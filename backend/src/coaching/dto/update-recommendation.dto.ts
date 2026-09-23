import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CoachingRecommendationStatus } from '@prisma/client';

export class UpdateRecommendationDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(CoachingRecommendationStatus, {
    message: 'Statut invalide (OPEN, IN_PROGRESS, DONE ou ARCHIVED)',
  })
  status?: CoachingRecommendationStatus;
}
