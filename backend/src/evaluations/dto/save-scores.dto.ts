import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class ScoreItemDto {
  @IsString()
  @IsNotEmpty({ message: "L'identifiant du critère est requis" })
  criterionId: string;

  @IsInt()
  @Min(0)
  @Max(100)
  score: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class SaveScoresDto {
  @IsArray()
  @ArrayNotEmpty({ message: 'Au moins un score requis' })
  @ValidateNested({ each: true })
  @Type(() => ScoreItemDto)
  scores: ScoreItemDto[];
}
