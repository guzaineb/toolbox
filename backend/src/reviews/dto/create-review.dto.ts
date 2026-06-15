import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  step_id?: string;

  @IsOptional()
  @IsString()
  document_id?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  innovation_score?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  faisability_score?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  market_score?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  team_score?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  business_model_score?: number;
}
