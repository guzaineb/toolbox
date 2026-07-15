import { IsString, IsOptional, IsEnum } from 'class-validator';

export class ProjectIdParam {
  @IsString()
  projectId!: string;
}

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
