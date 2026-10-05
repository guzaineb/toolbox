import { IsString, IsOptional, IsDateString, Matches } from 'class-validator';

export class ProfileDto {
  @IsString() first_name: string;
  @IsString() last_name: string;

  @IsOptional()
  @Matches(/^\+?[0-9]{8,15}$/, { message: 'Numéro invalide' })
  phone?: string;

  @IsOptional() @IsDateString() birthDate?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() preferredLanguage?: string;
  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  linkedin?: string;
}
