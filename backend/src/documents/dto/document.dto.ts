import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ProjectIdParam } from '../../common/dto/project-id.param';

export { ProjectIdParam };

export class DocumentKeyParam {
  @IsString()
  projectId!: string;

  @IsString()
  documentKey!: string;
}

export class GenerateDocumentDto {
  @IsOptional()
  @IsString()
  projectId?: string;
}
