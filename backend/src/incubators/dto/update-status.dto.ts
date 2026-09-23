import { IsIn } from 'class-validator';

export class UpdateStatusDto {
  @IsIn(['active', 'suspended'])
  status: 'active' | 'suspended';
}

export class UpdateVerificationDto {
  @IsIn(['approved', 'rejected'])
  verification_status: 'approved' | 'rejected';
}
