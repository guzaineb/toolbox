import { IsString, IsOptional } from 'class-validator';

export class ProjectIdParam {
  @IsString()
  projectId!: string;
}

export class UpdateSwotDto {
  @IsOptional()
  @IsString()
  strengths?: string;

  @IsOptional()
  @IsString()
  weaknesses?: string;

  @IsOptional()
  @IsString()
  opportunities?: string;

  @IsOptional()
  @IsString()
  threats?: string;
}
