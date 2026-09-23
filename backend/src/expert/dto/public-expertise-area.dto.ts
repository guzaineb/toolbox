import { Expose } from 'class-transformer';

export class PublicExpertiseAreaDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  category: string;
}