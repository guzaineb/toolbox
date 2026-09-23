import { IsOptional, IsString, IsUUID, IsInt, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class ExpertFiltersDto {
  @IsOptional()
  @IsString()
  @IsIn(['AVAILABLE', 'BUSY', 'UNAVAILABLE'])
  availability?: string;

  @IsOptional()
  @IsUUID()
  expertiseAreaId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minYears?: number;
}