import { IsUUID, IsString, IsOptional, IsBoolean } from 'class-validator';

export class AddMemberDto {
  // Conformité API (snake_case) : utilisé par le frontend
  @IsOptional()
  @IsUUID()
  user_id?: string;

  // Rétrocompatibilité : ancien contrat camelCase
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsString()
  role: string;

  @IsOptional()
  @IsString()
  job_title?: string;

  @IsOptional()
  @IsBoolean()
  can_manage_members?: boolean;
}
