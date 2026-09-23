import { IsString, IsOptional, IsBoolean, IsIn } from 'class-validator';

export class UpdateMemberDto {
  @IsOptional()
  @IsIn([
    'ADMIN',
    'PROGRAM_MANAGER',
    'COHORT_MANAGER',
    'REVIEW_MANAGER',
    'MEMBER',
    'VIEWER',
  ])
  role?: string;

  @IsOptional()
  @IsString()
  job_title?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'PENDING', 'SUSPENDED'])
  status?: string;

  @IsOptional()
  @IsBoolean()
  is_primary_contact?: boolean;

  @IsOptional()
  @IsBoolean()
  can_manage_programs?: boolean;

  @IsOptional()
  @IsBoolean()
  can_manage_cohorts?: boolean;

  @IsOptional()
  @IsBoolean()
  can_manage_members?: boolean;
}
