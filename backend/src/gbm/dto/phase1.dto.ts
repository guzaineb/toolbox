import { IsString, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class IdeaSketchDto {
  @IsOptional() @IsString() idea_initial?: string;
  @IsOptional() @IsString() product_service?: string;
  @IsOptional() @IsString() customers?: string;
  @IsOptional() @IsString() partners?: string;
}

export class ProblemsNeedsDto {
  @IsOptional() @IsString() environmental_challenges?: string;
  @IsOptional() @IsString() social_challenges?: string;
  @IsOptional() @IsString() customer_needs?: string;
  @IsOptional() @IsString() team_motivations?: string;
}

export class PestelDto {
  @IsOptional() @IsString() political_what?: string;
  @IsOptional() @IsString() political_how?: string;
  @IsOptional() @IsString() economic_what?: string;
  @IsOptional() @IsString() economic_how?: string;
  @IsOptional() @IsString() social_what?: string;
  @IsOptional() @IsString() social_how?: string;
  @IsOptional() @IsString() technological_what?: string;
  @IsOptional() @IsString() technological_how?: string;
  @IsOptional() @IsString() environmental_what?: string;
  @IsOptional() @IsString() environmental_how?: string;
  @IsOptional() @IsString() legal_what?: string;
  @IsOptional() @IsString() legal_how?: string;
}

export class ObjectiveDto {
  @IsOptional() @IsString() environmental_problems?: string;
  @IsOptional() @IsString() environmental_objectives?: string;
  @IsOptional() @IsString() social_problems?: string;
  @IsOptional() @IsString() social_objectives?: string;
  @IsOptional() @IsString() customer_problems?: string;
  @IsOptional() @IsString() customer_objectives?: string;
  @IsOptional() @IsString() team_problems?: string;
  @IsOptional() @IsString() team_objectives?: string;
}

export class MissionVisionDto {
  @IsOptional() @IsString() mission?: string;
  @IsOptional() @IsString() vision?: string;
  @IsOptional() @IsString() values?: string;
}

export class ContextSummaryDto {
  @IsOptional() @IsString() summary_text?: string;
  @IsOptional() @IsString() generated_by_ai?: boolean;
}

export class UpdateIdeaSketchDto extends PartialType(IdeaSketchDto) {}
export class UpdateProblemsNeedsDto extends PartialType(ProblemsNeedsDto) {}
export class UpdatePestelDto extends PartialType(PestelDto) {}
export class UpdateObjectiveDto extends PartialType(ObjectiveDto) {}
export class UpdateMissionVisionDto extends PartialType(MissionVisionDto) {}
export class UpdateContextSummaryDto extends PartialType(ContextSummaryDto) {}
