import { IsUUID, IsString, IsOptional, IsBoolean } from 'class-validator';

export class AddMemberDto {
  @IsUUID()
  userId: string;

  @IsString()
  role: string;

  @IsOptional()
  @IsString()
  job_title?: string;

  @IsOptional()
  @IsBoolean()
  can_manage_members?: boolean;
}