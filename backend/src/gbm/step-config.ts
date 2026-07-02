export type RelationType = 'one-to-one' | 'one-to-many';

export interface StepConfig {
  stepKey: string;
  phase: number;
  title: string;
  model: string;
  relation: RelationType;
  aiGenerated?: boolean;
}

export const GBM_STEPS: StepConfig[] = [
  // ── Phase 1 — Ébaucher & Définir (6 étapes) ──
  { stepKey: 'gbm_1',   phase: 1, title: "Esquissez votre idée d'entreprise",         model: 'ideaSketch',              relation: 'one-to-one' },
  { stepKey: 'gbm_2',   phase: 1, title: 'Identifier les problèmes et les besoins',    model: 'problemsNeeds',           relation: 'one-to-one' },
  { stepKey: 'gbm_3',   phase: 1, title: 'Comprendre le contexte (PESTEL)',            model: 'pestel',                  relation: 'one-to-one' },
  { stepKey: 'gbm_4',   phase: 1, title: 'Fixez vos objectifs',                        model: 'objective',               relation: 'one-to-one' },
  { stepKey: 'gbm_5',   phase: 1, title: 'Synthétiser une mission et une vision',      model: 'missionVision',           relation: 'one-to-one' },
  { stepKey: 'gbm_6',   phase: 1, title: 'Résumé du contexte et des objectifs',        model: 'contextSummary',          relation: 'one-to-one', aiGenerated: true },

  // ── Phase 2 — Construire (12 étapes) ──
  { stepKey: 'gbm_7a',  phase: 2, title: 'Identifier et cartographier les parties prenantes', model: 'stakeholder',     relation: 'one-to-many' },
  { stepKey: 'gbm_7b',  phase: 2, title: 'Cartes des parties prenantes (donnant-donnant)',     model: 'stakeholderMap',  relation: 'one-to-many' },
  { stepKey: 'gbm_8',   phase: 2, title: 'Segments de clientèle',                       model: 'customerSegment',         relation: 'one-to-many' },
  { stepKey: 'gbm_9',   phase: 2, title: 'Canevas de propositions de valeur',           model: 'valueProposition',        relation: 'one-to-one' },
  { stepKey: 'gbm_10',  phase: 2, title: 'Tester la proposition de valeur',             model: 'testDiscovery',           relation: 'one-to-many' },
  { stepKey: 'gbm_11',  phase: 2, title: 'Pivoter la proposition de valeur',            model: 'valuePropositionPivot',   relation: 'one-to-one' },
  { stepKey: 'gbm_12a', phase: 2, title: 'Relations avec les clients et canaux',        model: 'customerRelationsChannel',relation: 'one-to-one' },
  { stepKey: 'gbm_12b', phase: 2, title: 'Parcours du client',                          model: 'customerJourney',         relation: 'one-to-many' },
  { stepKey: 'gbm_13',  phase: 2, title: 'Principales activités et ressources',         model: 'keyActivitiesResource',   relation: 'one-to-one' },
  { stepKey: 'gbm_14a', phase: 2, title: 'Écoconception de votre entreprise',           model: 'ecoDesign',               relation: 'one-to-one' },
  { stepKey: 'gbm_14b', phase: 2, title: "Résultats de l'écoconception",                model: 'ecoDesignResult',         relation: 'one-to-one' },
  { stepKey: 'gbm_15',  phase: 2, title: 'Résumé des activités et ressources',          model: 'summaryActivity',         relation: 'one-to-one', aiGenerated: true },

  // ── Phase 2 suite — Structure financière (3 étapes) ──
  { stepKey: 'gbm_16',  phase: 2, title: 'Structure des coûts',                         model: 'costStructure',           relation: 'one-to-one' },
  { stepKey: 'gbm_17',  phase: 2, title: 'Flux de revenus',                             model: 'revenueStream',           relation: 'one-to-one' },
  { stepKey: 'gbm_18',  phase: 2, title: 'Résumé des coûts et flux de recettes',        model: 'costRevenueSummary',      relation: 'one-to-one', aiGenerated: true },

  // ── Phase 3 — Tester (1 étape) ──
  { stepKey: 'gbm_19',  phase: 3, title: 'Préparez le test !',                          model: 'testPreparation',         relation: 'one-to-one' },

  // ── Phase 4 — Mesurer & Améliorer (1 étape) ──
  { stepKey: 'gbm_20',  phase: 4, title: 'Indicateurs',                                 model: 'indicator',               relation: 'one-to-one' },
];

export function getStepConfig(stepKey: string): StepConfig | undefined {
  return GBM_STEPS.find(s => s.stepKey === stepKey);
}

export function getPhaseSteps(phase: number): StepConfig[] {
  return GBM_STEPS.filter(s => s.phase === phase);
}
