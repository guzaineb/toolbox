import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';

export class CreateProjectOwnerDto {
  @IsOptional()
  @IsString()
  current_status?: string;

  @IsOptional()
  @IsString()
  education_level?: string;

  @IsOptional()
  @IsString()
  linkedin_url?: string;

  @IsOptional()
  @IsNumber()
  entrepreneurial_experience_level?: number;

  @IsOptional()
  @IsBoolean()
  has_previous_startup?: boolean;
}