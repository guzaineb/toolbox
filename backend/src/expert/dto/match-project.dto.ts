// dto/match-project.dto.ts
import { IsArray, IsUUID, IsInt, Min, ArrayMinSize, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class MatchProjectDto {
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(1)
  requiredAreas: string[];

  @Type(() => Number)
  @IsInt()
  @Min(0)
  minYearsExperience: number;

  @IsOptional()
  @IsUUID()
  projectId?: string;
}