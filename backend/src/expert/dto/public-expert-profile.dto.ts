import { Expose, Type } from 'class-transformer';
import { PublicUserDto } from './public-user.dto';
import { PublicExpertiseConnectionDto } from './public-expertise-connection.dto';

export class PublicExpertProfileDto {
  @Expose()
  id: string;

  @Expose()
  headline: string;

  @Expose()
  bio?: string;

  @Expose()
  organization?: string;

  @Expose()
  position?: string;

  @Expose()
  years_of_experience?: number;

  @Expose()
  linkedin_url?: string;

  @Expose()
  availability_status: string;

  @Expose()
  @Type(() => PublicUserDto)
  user?: PublicUserDto;

  @Expose()
  @Type(() => PublicExpertiseConnectionDto)
  expertiseConnections?: PublicExpertiseConnectionDto[];
}
