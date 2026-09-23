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
  Min,
  ValidateNested,
} from 'class-validator';
import { EvaluationStage } from '@prisma/client';

export class CriterionUpdateDto {
  @IsOptional()
  @IsString()
  id?: string;

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

export class UpdateTemplateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(EvaluationStage, {
    message: 'Étape invalide (INTERMEDIATE ou FINAL)',
  })
  stage?: EvaluationStage;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CriterionUpdateDto)
  criteria?: CriterionUpdateDto[];
}
