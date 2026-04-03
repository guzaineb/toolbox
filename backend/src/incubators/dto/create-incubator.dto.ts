import { IsString, IsOptional, IsUrl, IsDateString } from 'class-validator';

export class CreateIncubatorDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  legal_name?: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  foundation_date?: string;

  @IsOptional()
  @IsString()
  organization_type?: string;

  @IsOptional()
  @IsString()
  registration_number?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsUrl()
  website_url?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;
}