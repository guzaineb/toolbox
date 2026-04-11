import { IsEmail, isString, IsString, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ProfileDto } from 'src/profiles/dto/create-profile';
import { UserRole } from '../user.entity';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
 @IsString()
  role:UserRole
  @ValidateNested()
  @Type(() => ProfileDto)
  profile: ProfileDto;
}