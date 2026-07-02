import { IsString, IsOptional, IsNumber, IsArray, IsUUID } from 'class-validator';

export class CreateExpertDto {
  @IsString()
  headline: string;

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

  @IsArray()
  @IsUUID('4', { each: true })
  expertiseAreaIds: string[];
}