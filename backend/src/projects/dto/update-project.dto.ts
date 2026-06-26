import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ProjectStatus } from '../project.entity';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  name?: string;

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

export class UpdateProjectStatusDto {
  @IsEnum(ProjectStatus)
  status: ProjectStatus;
}
