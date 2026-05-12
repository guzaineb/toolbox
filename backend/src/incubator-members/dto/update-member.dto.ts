import { IsString, IsOptional, IsBoolean, IsIn } from 'class-validator';

export class UpdateMemberDto {
  @IsOptional()
  @IsIn(['admin', 'program_manager', 'cohort_manager', 'review_manager', 'member', 'viewer'])
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
  @IsIn(['active', 'inactive'])
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
