import { IsUUID, IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';

export class AddExpertiseDto {
  @IsUUID('4')
  expertiseAreaId: string;

  /**
   * Niveau : 'beginner' | 'intermediate' | 'advanced' | 'expert'
   */
  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  years_of_experience?: number;
}
