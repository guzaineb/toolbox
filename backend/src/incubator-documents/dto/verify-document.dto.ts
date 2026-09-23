import { IsIn, IsOptional, IsString } from 'class-validator';

export class VerifyDocumentDto {
  @IsIn(['APPROVED', 'REJECTED'])
  verification_status: 'APPROVED' | 'REJECTED';

  @IsOptional()
  @IsString()
  rejection_reason?: string;
}
