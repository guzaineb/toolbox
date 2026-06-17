import { IsOptional, IsObject, IsBoolean, IsDateString } from 'class-validator';

export class CreateShareDto {
  @IsOptional()
  @IsObject()
  permissions?: {
    can_view_bmc?: boolean;
    can_view_business_plan?: boolean;
    can_view_documents?: boolean;
    can_comment?: boolean;
  };

  @IsOptional()
  @IsDateString()
  expires_at?: string;
}
