import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ProjectStatus } from '../project.entity';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateProjectStatusDto {
  @IsEnum(ProjectStatus)
  status: ProjectStatus;
}
