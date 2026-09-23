import { IsString, IsOptional, IsInt, IsDateString, Min } from 'class-validator';

export class CreateCohortDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  program?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsDateString()
  application_deadline?: string;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;
}
