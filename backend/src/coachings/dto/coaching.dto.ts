import { IsOptional, IsString } from 'class-validator';

export class CreateCoachingDto {
  @IsOptional()
  @IsString()
  feedback?: string;
}

export class UpdateCoachingDto {
  @IsOptional()
  @IsString()
  feedback?: string;
}
