import { IsString, IsOptional, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

// `@IsOptional()` n'ignore que `null`/`undefined` : sans ce transform, un
// champ vide envoyé par un formulaire ("") serait rejeté par `@IsDateString()`.
const emptyToUndefined = ({ value }: { value: unknown }) =>
  value === '' || value === null ? undefined : value;

export class CreateExperienceDto {
  @IsString()
  title: string;

  @IsString()
  organization: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  description?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsDateString()
  end_date?: string;
}
