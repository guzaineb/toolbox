import { IsIn } from 'class-validator';

export class UpdateStatusDto {
  @IsIn(['ACTIVE', 'SUSPENDED'])
  status: 'ACTIVE' | 'SUSPENDED';
}

export class UpdateVerificationDto {
  @IsIn(['APPROVED', 'REJECTED'])
  verification_status: 'APPROVED' | 'REJECTED';
}
