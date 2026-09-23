import { IsEmail, IsString, IsOptional, IsUUID } from 'class-validator';

export class InviteMemberDto {
  @IsEmail()
  email: string;

  @IsString()
  role: string;

  @IsOptional()
  @IsString()
  job_title?: string;
}

export class AcceptInviteDto {
  @IsString()
  token: string;
}
