import { IsString, IsOptional, IsUUID, IsNumber, IsObject, IsEnum, IsArray, IsBoolean } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class ProjectIdParam {
  @IsUUID()
  projectId: string;
}

export class FundingAssessmentDto {
  @IsOptional() @IsObject() reponses_questionnaire?: Record<string, boolean>;
  @IsOptional() @IsNumber() score_maturite?: number;
  @IsOptional() @IsString() phase_maturite?: string;
  @IsOptional() @IsObject() opportunites_financement?: Record<string, any>;
  @IsOptional() @IsString() opportunites_pays?: string;
  @IsOptional() @IsString() strategie_levee_fonds?: string;
}

export class SubmitQuestionnaireDto {
  @IsObject()
  reponses: Record<string, boolean>;
}

export class UpdateFundingAssessmentDto extends PartialType(FundingAssessmentDto) {}
