import { Expose } from 'class-transformer';

export class PublicUserDto {
  @Expose()
  id: string;
  @Expose()
  email: string;

  @Expose()
  profile?: {
    first_name: string;
    last_name: string;
  };
}
