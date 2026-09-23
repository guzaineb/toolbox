import { IsOptional, IsString, IsNumber, Min, Max, IsIn } from 'class-validator';

export class UpdateExpertiseLevelDto {
  @IsOptional()
  @IsString()
  @IsIn(['junior', 'intermediate', 'senior', 'expert'])
  level?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  years_of_experience?: number;
}