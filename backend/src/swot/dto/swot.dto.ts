import { IsString, IsOptional } from 'class-validator';
import { ProjectIdParam } from '../../common/dto/project-id.param';

export { ProjectIdParam };

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
