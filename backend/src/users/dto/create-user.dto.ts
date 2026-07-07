import { IsEmail, IsEnum, IsOptional, isString, IsString, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ProfileDto } from 'src/profiles/dto/create-profile';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
 
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
  @ValidateNested()
  @Type(() => ProfileDto)

  profile: ProfileDto;
}