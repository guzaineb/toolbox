import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { EvaluationStage } from '@prisma/client';

export class CriterionDto {
  @IsString()
  @IsNotEmpty({ message: 'Le nom du critère est requis' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  weight: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  max_score?: number;

  @IsOptional()
  @IsInt()
  sort_order?: number;
}

export class CreateTemplateDto {
  @IsString()
  @IsNotEmpty({ message: 'Le nom de la grille est requis' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(EvaluationStage, {
    message: 'Étape invalide (INTERMEDIATE ou FINAL)',
  })
  stage?: EvaluationStage;

  @IsArray()
  @ArrayNotEmpty({ message: 'La grille doit contenir au moins un critère' })
  @ValidateNested({ each: true })
  @Type(() => CriterionDto)
  criteria: CriterionDto[];
}
