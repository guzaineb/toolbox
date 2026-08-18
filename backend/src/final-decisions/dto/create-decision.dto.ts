import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { FinalDecisionType } from '@prisma/client';

export class CreateConditionDto {
  @IsString()
  @IsNotEmpty({ message: 'La description de la condition est requise' })
  description: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;
}

export class CreateDecisionDto {
  @IsEnum(FinalDecisionType, {
    message: 'Type de décision invalide',
  })
  decision: FinalDecisionType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  final_score?: number;

  @IsOptional()
  @IsString()
  justification?: string;

  @IsOptional()
  @IsDateString()
  new_end_date?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateConditionDto)
  conditions?: CreateConditionDto[];
}
