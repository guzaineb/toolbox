import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

// ─── Étape 7a — Partie prenante ───
export class StakeholderDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() role?: string;
  @IsOptional() @IsString() interest?: string;
  @IsOptional() @IsString() influence?: string;
  @IsOptional() @IsString() engagement_strategy?: string;
}
export class CreateStakeholderDto extends StakeholderDto {}

// ─── Étape 7b — Carte partie prenante (donnant-donnant) ───
export class StakeholderMapDto {
  @IsOptional() @IsString() stakeholder_name?: string;
  @IsOptional() @IsString() contribution?: string;
  @IsOptional() @IsString() reward?: string;
}
export class CreateStakeholderMapDto extends StakeholderMapDto {}

// ─── Étape 8 — Segment de clientèle ───
export class CustomerSegmentDto {
  @IsOptional() @IsString() segment_name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() pains?: string;
  @IsOptional() @IsString() gains?: string;
  @IsOptional() @IsString() functions?: string;
}
export class CreateCustomerSegmentDto extends CustomerSegmentDto {}

// ─── Étape 9 — Proposition de valeur ───
export class ValuePropositionDto {
  @IsOptional() @IsString() environmental_value?: string;
  @IsOptional() @IsString() social_value?: string;
  @IsOptional() @IsString() pain_relievers?: string;
  @IsOptional() @IsString() gain_creators?: string;
  @IsOptional() @IsString() products_services?: string;
  @IsOptional() @IsString() value_added?: string;
  @IsOptional() @IsString() innovation_value?: string;
}
export class UpdateValuePropositionDto extends PartialType(
  ValuePropositionDto,
) {}

// ─── Étape 10 — Test découverte ───
export class TestDiscoveryDto {
  @IsOptional() @IsString() hypothesis?: string;
  @IsOptional() @IsString() test_method?: string;
  @IsOptional() @IsString() results?: string;
  @IsOptional() @IsString() learnings?: string;
  @IsOptional() @IsBoolean() validated?: boolean;
}
export class CreateTestDiscoveryDto extends TestDiscoveryDto {}

// ─── Étape 11 — Pivot proposition de valeur ───
export class ValuePropositionPivotDto {
  @IsOptional() @IsString() initial_assumptions?: string;
  @IsOptional() @IsString() test_results?: string;
  @IsOptional() @IsString() pivot_decision?: string;
  @IsOptional() @IsString() new_value_proposition?: string;
}
export class UpdateValuePropositionPivotDto extends PartialType(
  ValuePropositionPivotDto,
) {}

// ─── Étape 12a — Relations clients et canaux ───
export class CustomerRelationsChannelDto {
  @IsOptional() @IsString() customer_relationships?: string;
  @IsOptional() @IsString() channels?: string;
  @IsOptional() @IsString() distribution_strategy?: string;
}
export class UpdateCustomerRelationsChannelDto extends PartialType(
  CustomerRelationsChannelDto,
) {}

// ─── Étape 12b — Parcours client ───
export class CustomerJourneyDto {
  @IsOptional() @IsString() stage_name?: string;
  @IsOptional() @IsString() touchpoints?: string;
  @IsOptional() @IsString() customer_emotions?: string;
  @IsOptional() @IsString() improvement_ideas?: string;
}
export class CreateCustomerJourneyDto extends CustomerJourneyDto {}

// ─── Étape 13 — Activités et ressources ───
export class KeyActivitiesResourceDto {
  @IsOptional() @IsString() key_activities?: string;
  @IsOptional() @IsString() key_resources?: string;
  @IsOptional() @IsString() strategic_partners?: string;
}
export class UpdateKeyActivitiesResourceDto extends PartialType(
  KeyActivitiesResourceDto,
) {}

// ─── Étape 14a — Écoconception ───
export class EcoDesignDto {
  @IsOptional() @IsString() equipe_eco?: string;
  @IsOptional() @IsString() projet_eco?: string;
  @IsOptional() @IsString() contexte_eco?: string;
  @IsOptional() @IsString() vision_durable?: string;
  @IsOptional() @IsObject() cycle_de_vie?: Record<string, any>;
  @IsOptional() @IsString() performance_eco?: string;
  @IsOptional() @IsObject() strategies_eco?: Record<string, any>;
  @IsOptional() @IsObject() plan_action_eco?: Record<string, any>;
}
export class UpdateEcoDesignDto extends PartialType(EcoDesignDto) {}

// ─── Étape 14b — Résultats écoconception ───
export class EcoDesignResultDto {
  @IsOptional() @IsString() eco_results?: string;
  @IsOptional() @IsString() performance_analysis?: string;
  @IsOptional() @IsString() improvements?: string;
}
export class UpdateEcoDesignResultDto extends PartialType(EcoDesignResultDto) {}

// ─── Étape 16 — Structure des coûts ───
export class CostStructureDto {
  @IsOptional() @IsString() fixed_costs?: string;
  @IsOptional() @IsString() variable_costs?: string;
  @IsOptional() @IsString() cost_drivers?: string;
  @IsOptional() @IsString() breakeven_analysis?: string;
}
export class UpdateCostStructureDto extends PartialType(CostStructureDto) {}

// ─── Étape 17 — Flux de revenus ───
export class RevenueStreamDto {
  @IsOptional() @IsString() revenue_sources?: string;
  @IsOptional() @IsString() pricing_strategy?: string;
  @IsOptional() @IsString() revenue_projections?: string;
}
export class UpdateRevenueStreamDto extends PartialType(RevenueStreamDto) {}
