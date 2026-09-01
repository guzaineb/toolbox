import { IsString, IsOptional, IsNumber, IsObject } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ProjectIdParam } from '../../common/dto/project-id.param';

export { ProjectIdParam };

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
