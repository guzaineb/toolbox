import { IsString, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

// Étape 19 — Préparez le test !
export class TestPreparationDto {
  @IsOptional() @IsString() test_objectives?: string;
  @IsOptional() @IsString() test_method?: string;
  @IsOptional() @IsString() success_criteria?: string;
  @IsOptional() @IsString() resources_needed?: string;
  @IsOptional() @IsString() timeline?: string;
}

export class UpdateTestPreparationDto extends PartialType(TestPreparationDto) {}
