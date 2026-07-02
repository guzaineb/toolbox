import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

// Étape 6 — Résumé du contexte et des objectifs (Phase 1)
// Déplacé dans phase1.dto.ts

// Étape 20 — Indicateurs (Phase 4)
export class IndicatorDto {
  @IsOptional() @IsString() environmental_kpis?: string;
  @IsOptional() @IsString() social_kpis?: string;
  @IsOptional() @IsString() economic_kpis?: string;
  @IsOptional() @IsString() measurement_method?: string;
  @IsOptional() @IsString() review_frequency?: string;
}

export class UpdateIndicatorDto extends PartialType(IndicatorDto) {}

// Étape 15 — Résumé des activités (Phase 2)
export class SummaryActivityDto {
  @IsOptional() @IsString() activities_summary?: string;
  @IsOptional() @IsString() key_achievements?: string;
  @IsOptional() @IsString() next_steps?: string;
  @IsOptional() @IsBoolean() generated_by_ai?: boolean;
}

export class UpdateSummaryActivityDto extends PartialType(SummaryActivityDto) {}

// Étape 18 — Résumé des coûts et revenus (Phase 2)
export class CostRevenueSummaryDto {
  @IsOptional() @IsString() cost_summary?: string;
  @IsOptional() @IsString() revenue_summary?: string;
  @IsOptional() @IsString() financial_health?: string;
  @IsOptional() @IsBoolean() generated_by_ai?: boolean;
}

export class UpdateCostRevenueSummaryDto extends PartialType(CostRevenueSummaryDto) {}
