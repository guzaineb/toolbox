import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateConditionDto } from './create-decision.dto';

export class AddConditionsDto {
  @IsArray()
  @ArrayNotEmpty({ message: 'Au moins une condition requise' })
  @ValidateNested({ each: true })
  @Type(() => CreateConditionDto)
  conditions: CreateConditionDto[];

  @IsOptional()
  @IsString()
  justification?: string;
}

export class UpdateConditionDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;
}
