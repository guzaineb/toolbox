import { IsString, IsOptional, IsNumber, IsArray, IsUUID } from 'class-validator';

export class UpdateExpertDto {
  @IsOptional()
  @IsString()
  headline?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  organization?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsNumber()
  years_of_experience?: number;

  @IsOptional()
  @IsString()
  linkedin_url?: string;

  @IsOptional()
  @IsString()
  availability_status?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  expertiseAreaIds?: string[];
}
