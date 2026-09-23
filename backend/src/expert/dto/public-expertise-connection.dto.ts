import { Expose, Type } from 'class-transformer';
import { PublicExpertiseAreaDto } from './public-expertise-area.dto';

export class PublicExpertiseConnectionDto {
  @Expose()
  id: string;

  @Expose()
  level: string;

  @Expose()
  years_of_experience: number;

  @Expose()
  @Type(() => PublicExpertiseAreaDto)
  expertiseArea: PublicExpertiseAreaDto;
}
