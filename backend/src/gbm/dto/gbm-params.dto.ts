import { IsUUID, IsString, IsOptional } from 'class-validator';

export class ProjectIdParam {
  @IsUUID()
  projectId: string;
}

export class GbmStepParams extends ProjectIdParam {
  @IsString()
  stepId: string;
}

export class GbmItemParams extends GbmStepParams {
  @IsUUID()
  itemId: string;
}

export class PaginationQuery {
  @IsOptional()
  @IsString()
  skip?: string;

  @IsOptional()
  @IsString()
  take?: string;
}
