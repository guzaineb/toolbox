import { IsOptional, IsBoolean } from 'class-validator';

export class GenerateBmcDto {
  @IsOptional()
  @IsBoolean()
  is_green?: boolean;
}
