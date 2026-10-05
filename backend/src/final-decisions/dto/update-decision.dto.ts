import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { FinalDecisionType } from '@prisma/client';

export class UpdateDecisionDto {
  @IsOptional()
  @IsEnum(FinalDecisionType, {
    message: 'Type de décision invalide',
  })
  decision?: FinalDecisionType;

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
}
