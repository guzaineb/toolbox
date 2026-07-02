export interface GbmStepProgress {
  step_key: string
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED'
}

export interface GbmProgress {
  total: number
  completed: number
  inProgress: number
  blocked: number
  notStarted: number
  percentage: number
  phases: { phase: number; total: number; completed: number; percentage: number }[]
  steps: GbmStepProgress[]
}

// ── Phase 1 — Ébaucher & Définir ──

// Étape 1 — Esquissez votre idée d'entreprise
export interface IdeaSketch {
  idea_initial?: string
  product_service?: string
  customers?: string
  partners?: string
}

// Étape 2 — Identifier les problèmes et les besoins
export interface ProblemsNeeds {
  environmental_challenges?: string
  social_challenges?: string
  customer_needs?: string
  team_motivations?: string
}

// Étape 3 — PESTEL
export interface Pestel {
  political_what?: string
  political_how?: string
  economic_what?: string
  economic_how?: string
  social_what?: string
  social_how?: string
  technological_what?: string
  technological_how?: string
  environmental_what?: string
  environmental_how?: string
  legal_what?: string
  legal_how?: string
}

// Étape 4 — Objectifs
export interface Objective {
  environmental_problems?: string
  environmental_objectives?: string
  social_problems?: string
  social_objectives?: string
  customer_problems?: string
  customer_objectives?: string
  team_problems?: string
  team_objectives?: string
}

// Étape 5 — Mission & Vision
export interface MissionVision {
  mission?: string
  vision?: string
  values?: string
}

// Étape 6 — Résumé du contexte et des objectifs
export interface ContextSummary {
  summary_text?: string
  generated_by_ai?: boolean
}

// ── Phase 2 — Construire ──

// Étape 7a — Partie prenante
export interface Stakeholder {
  id: string
  name?: string
  role?: string
  interest?: string
  influence?: string
  engagement_strategy?: string
}

// Étape 7b — Carte partie prenante
export interface StakeholderMap {
  id: string
  stakeholder_name?: string
  contribution?: string
  reward?: string
}

// Étape 8 — Segment de clientèle
export interface CustomerSegment {
  id: string
  segment_name?: string
  description?: string
  pains?: string
  gains?: string
  functions?: string
}

// Étape 9 — Proposition de valeur
export interface ValueProposition {
  environmental_value?: string
  social_value?: string
  pain_relievers?: string
  gain_creators?: string
  products_services?: string
  value_added?: string
  innovation_value?: string
}

// Étape 10 — Test découverte
export interface TestDiscovery {
  id: string
  hypothesis?: string
  test_method?: string
  results?: string
  learnings?: string
  validated?: boolean
}

// Étape 11 — Pivot
export interface ValuePropositionPivot {
  initial_assumptions?: string
  test_results?: string
  pivot_decision?: string
  new_value_proposition?: string
}

// Étape 12a — Relations & canaux
export interface CustomerRelationsChannel {
  customer_relationships?: string
  channels?: string
  distribution_strategy?: string
}

// Étape 12b — Parcours client
export interface CustomerJourney {
  id: string
  stage_name?: string
  touchpoints?: string
  customer_emotions?: string
  improvement_ideas?: string
}

// Étape 13 — Activités & ressources
export interface KeyActivitiesResource {
  key_activities?: string
  key_resources?: string
  strategic_partners?: string
}

// Étape 14a — Écoconception
export interface EcoDesign {
  equipe_eco?: string
  projet_eco?: string
  contexte_eco?: string
  vision_durable?: string
  cycle_de_vie?: any
  performance_eco?: string
  strategies_eco?: any
  plan_action_eco?: any
}

// Étape 14b — Résultats écoconception
export interface EcoDesignResult {
  eco_results?: string
  performance_analysis?: string
  improvements?: string
}

// Étape 15 — Résumé des activités (AI)
export interface SummaryActivity {
  activities_summary?: string
  key_achievements?: string
  next_steps?: string
  generated_by_ai?: boolean
}

// Étape 16 — Structure des coûts
export interface CostStructure {
  fixed_costs?: string
  variable_costs?: string
  cost_drivers?: string
  breakeven_analysis?: string
}

// Étape 17 — Flux de revenus
export interface RevenueStream {
  revenue_sources?: string
  pricing_strategy?: string
  revenue_projections?: string
}

// Étape 18 — Résumé coûts/revenus (AI)
export interface CostRevenueSummary {
  cost_summary?: string
  revenue_summary?: string
  financial_health?: string
  generated_by_ai?: boolean
}

// ── Phase 3 — Tester ──
export interface TestPreparation {
  test_objectives?: string
  test_method?: string
  success_criteria?: string
  resources_needed?: string
  timeline?: string
}

// ── Phase 4 — Mesurer & Améliorer ──
export interface Indicator {
  environmental_kpis?: string
  social_kpis?: string
  economic_kpis?: string
  measurement_method?: string
  review_frequency?: string
}

export const GBM_STEP_LABELS: Record<string, { title: string; phase: number; phaseName: string }> = {
  // Phase 1 — Ébaucher & Définir
  gbm_1:   { title: "Étape 1 — Esquissez votre idée d'entreprise",         phase: 1, phaseName: 'Ébaucher & Définir' },
  gbm_2:   { title: 'Étape 2 — Identifier les problèmes et les besoins',    phase: 1, phaseName: 'Ébaucher & Définir' },
  gbm_3:   { title: 'Étape 3 — Comprendre le contexte (PESTEL)',            phase: 1, phaseName: 'Ébaucher & Définir' },
  gbm_4:   { title: 'Étape 4 — Fixez vos objectifs',                        phase: 1, phaseName: 'Ébaucher & Définir' },
  gbm_5:   { title: 'Étape 5 — Synthétiser une mission et une vision',      phase: 1, phaseName: 'Ébaucher & Définir' },
  gbm_6:   { title: 'Étape 6 — Résumé du contexte et des objectifs',        phase: 1, phaseName: 'Ébaucher & Définir' },

  // Phase 2 — Construire
  gbm_7a:  { title: 'Étape 7a — Parties prenantes',                         phase: 2, phaseName: 'Construire' },
  gbm_7b:  { title: 'Étape 7b — Cartes des parties prenantes',              phase: 2, phaseName: 'Construire' },
  gbm_8:   { title: 'Étape 8 — Segments de clientèle',                      phase: 2, phaseName: 'Construire' },
  gbm_9:   { title: 'Étape 9 — Proposition de valeur',                      phase: 2, phaseName: 'Construire' },
  gbm_10:  { title: 'Étape 10 — Test de la proposition',                    phase: 2, phaseName: 'Construire' },
  gbm_11:  { title: 'Étape 11 — Pivot de la proposition de valeur',         phase: 2, phaseName: 'Construire' },
  gbm_12a: { title: 'Étape 12a — Relations clients & canaux',               phase: 2, phaseName: 'Construire' },
  gbm_12b: { title: 'Étape 12b — Parcours du client',                       phase: 2, phaseName: 'Construire' },
  gbm_13:  { title: 'Étape 13 — Activités et ressources',                   phase: 2, phaseName: 'Construire' },
  gbm_14a: { title: 'Étape 14a — Écoconception',                            phase: 2, phaseName: 'Construire' },
  gbm_14b: { title: "Étape 14b — Résultats de l'écoconception",             phase: 2, phaseName: 'Construire' },
  gbm_15:  { title: 'Étape 15 — Résumé des activités et ressources',        phase: 2, phaseName: 'Construire' },
  gbm_16:  { title: 'Étape 16 — Structure des coûts',                       phase: 2, phaseName: 'Construire' },
  gbm_17:  { title: 'Étape 17 — Flux de revenus',                           phase: 2, phaseName: 'Construire' },
  gbm_18:  { title: 'Étape 18 — Résumé des coûts et recettes',              phase: 2, phaseName: 'Construire' },

  // Phase 3 — Tester
  gbm_19:  { title: 'Étape 19 — Préparez le test !',                        phase: 3, phaseName: 'Tester' },

  // Phase 4 — Mesurer & Améliorer
  gbm_20:  { title: 'Étape 20 — Indicateurs',                               phase: 4, phaseName: 'Mesurer & Améliorer' },
}
