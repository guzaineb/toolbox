import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateJurySessionDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsArray()
  @ArrayNotEmpty({ message: 'Au moins un membre du jury requis' })
  @IsString({ each: true })
  memberUserIds: string[];
}
