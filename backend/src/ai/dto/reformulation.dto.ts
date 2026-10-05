import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';

export enum AudienceLevel {
  DEBUTANT = 'debutant',
  INTERMEDIAIRE = 'intermediaire',
  AVANCE = 'avance',
}

export class ReformulateStepDto {
  @IsUUID()
  projectId: string;

  @IsString()
  stepKey: string;

  @IsOptional()
  @IsEnum(AudienceLevel)
  audience?: AudienceLevel;
}

export class ReformulateTextDto {
  @IsString()
  text: string;

  @IsString()
  stepConcept: string;

  @IsOptional()
  @IsEnum(AudienceLevel)
  audience?: AudienceLevel;
}
