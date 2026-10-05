import { IsOptional, IsBoolean } from 'class-validator';

export class UpdatePreferencesDto {
  @IsOptional()
  @IsBoolean()
  inAppEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  realtimeEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  coachingEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  evaluationEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  cohortEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  invitationEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  documentEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  aiEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  adminEnabled?: boolean;
}
