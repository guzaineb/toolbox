import { IsOptional, IsString } from 'class-validator';

export class PaginationQuery {
  @IsOptional()
  @IsString()
  skip?: string;

  @IsOptional()
  @IsString()
  take?: string;
}
