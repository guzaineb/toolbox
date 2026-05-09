<<<<<<< HEAD
import {
  IsString,
  IsOptional,
  IsDateString,
  Matches,
} from 'class-validator';

export class ProfileDto {
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;
=======
import { IsString,IsOptional, IsDateString, Matches,} from 'class-validator';

export class ProfileDto {
  @IsString()first_name: string;
  @IsString()last_name: string;
>>>>>>> 38c6efc (Misa a jour les interfaces)

  @IsOptional()
  @Matches(/^\+?[0-9]{8,15}$/, { message: 'Numéro invalide' })
  phone?: string;

<<<<<<< HEAD
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  preferredLanguage?: string;

=======
  @IsOptional()@IsDateString()birthDate?: string;
  @IsOptional()@IsString()country?: string;
  @IsOptional()@IsString()city?: string;
  @IsOptional()@IsString()address?: string;
  @IsOptional()@IsString()preferredLanguage?: string;
>>>>>>> 38c6efc (Misa a jour les interfaces)
  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  linkedin?: string;
<<<<<<< HEAD


=======
>>>>>>> 38c6efc (Misa a jour les interfaces)
}