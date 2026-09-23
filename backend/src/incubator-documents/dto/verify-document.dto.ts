import { IsIn, IsOptional, IsString } from 'class-validator';

export class VerifyDocumentDto {
  @IsIn(['approved', 'rejected'])
  verification_status: 'approved' | 'rejected';

  @IsOptional()
  @IsString()
  rejection_reason?: string;
}
