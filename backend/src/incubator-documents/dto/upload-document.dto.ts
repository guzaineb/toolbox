import { IsString, IsOptional } from 'class-validator';

export class UploadDocumentDto {
  @IsString()
  document_type: string;
}