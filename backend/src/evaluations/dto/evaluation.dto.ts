import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

export class CreateEvaluationDto {
  @IsNumber()
  @Min(0)
  @Max(20)
  score: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class UpdateEvaluationDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(20)
  score?: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
