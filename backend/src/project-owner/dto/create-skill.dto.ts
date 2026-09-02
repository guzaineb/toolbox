import { IsString, IsOptional, IsIn } from 'class-validator';

export class CreateSkillDto {
  @IsString()
  skill_name: string;

  @IsOptional()
  @IsIn(['beginner', 'intermediate', 'advanced', 'expert'])
  level?: string;
}
