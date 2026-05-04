import { IsString, IsOptional, IsIn } from 'class-validator';

export class UploadDocumentDto {
  @IsString()
  @IsIn([ 'commerce_register', 'legal_doc', 'tax_certificate', 'institutional_proof'])
  document_type: string;
  
  @IsOptional()
  @IsString()
  description?: string;
}