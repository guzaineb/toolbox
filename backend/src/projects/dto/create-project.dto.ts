import { IsString, IsOptional, MinLength, IsUUID } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  sector_id?: string;

  @IsOptional()
  @IsUUID()
  development_phase_id?: string;
}
