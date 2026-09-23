import { IsUUID, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class UploadDocumentDto {
  @IsUUID()
  projectId: string;
}

export class ListDocumentsDto {
  @IsUUID()
  projectId: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class DocumentIdDto {
  @IsUUID()
  documentId: string;

  @IsUUID()
  projectId: string;
}
