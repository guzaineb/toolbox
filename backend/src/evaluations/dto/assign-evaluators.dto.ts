import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class AssignmentItemDto {
  @IsString()
  @IsNotEmpty({ message: "L'identifiant du projet est requis" })
  projectId: string;

  @IsArray()
  @ArrayNotEmpty({ message: 'Au moins un évaluateur requis' })
  @IsString({ each: true })
  juryUserIds: string[];
}

export class AssignEvaluatorsDto {
  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsArray()
  @ArrayNotEmpty({ message: 'Au moins une affectation requise' })
  @ValidateNested({ each: true })
  @Type(() => AssignmentItemDto)
  assignments: AssignmentItemDto[];
}
