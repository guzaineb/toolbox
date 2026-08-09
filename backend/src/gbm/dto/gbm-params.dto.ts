import { IsString, IsUUID } from 'class-validator';
import { ProjectIdParam } from '../../common/dto/project-id.param';
import { PaginationQuery } from '../../common/dto/pagination-query.dto';

export { ProjectIdParam, PaginationQuery };

export class GbmStepParams extends ProjectIdParam {
  @IsString()
  stepId: string;
}

export class GbmItemParams extends GbmStepParams {
  @IsUUID()
  itemId: string;
}
