export interface StepTemplate {
  stepKey: string;
  title: string;
  module: string;
  phase: number;
}

export const ALL_STEPS: StepTemplate[] = [
  // ── GBM Phase 1 — Ébaucher & Définir ──
  {
    stepKey: 'gbm_1',
    title: "Esquissez votre idée d'entreprise",
    module: 'GBM',
    phase: 1,
  },
  {
    stepKey: 'gbm_2',
    title: 'Identifier les problèmes et les besoins',
    module: 'GBM',
    phase: 1,
  },
  {
    stepKey: 'gbm_3',
    title: 'Comprendre le contexte (PESTEL)',
    module: 'GBM',
    phase: 1,
  },
  { stepKey: 'gbm_4', title: 'Fixez vos objectifs', module: 'GBM', phase: 1 },
  {
    stepKey: 'gbm_5',
    title: 'Synthétiser une mission et une vision',
    module: 'GBM',
    phase: 1,
  },
  {
    stepKey: 'gbm_6',
    title: 'Résumé du contexte et des objectifs',
    module: 'GBM',
    phase: 1,
  },

  // ── GBM Phase 2 — Construire ──
  {
    stepKey: 'gbm_7a',
    title: 'Identifier et cartographier les parties prenantes',
    module: 'GBM',
    phase: 2,
  },
  {
    stepKey: 'gbm_7b',
    title: 'Cartes des parties prenantes (donnant-donnant)',
    module: 'GBM',
    phase: 2,
  },
  { stepKey: 'gbm_8', title: 'Segments de clientèle', module: 'GBM', phase: 2 },
  {
    stepKey: 'gbm_9',
    title: 'Canevas de propositions de valeur',
    module: 'GBM',
    phase: 2,
  },
  {
    stepKey: 'gbm_10',
    title: 'Tester la proposition de valeur',
    module: 'GBM',
    phase: 2,
  },
  {
    stepKey: 'gbm_11',
    title: 'Pivoter la proposition de valeur',
    module: 'GBM',
    phase: 2,
  },
  {
    stepKey: 'gbm_12a',
    title: 'Relations avec les clients et canaux',
    module: 'GBM',
    phase: 2,
  },
  { stepKey: 'gbm_12b', title: 'Parcours du client', module: 'GBM', phase: 2 },
  {
    stepKey: 'gbm_13',
    title: 'Principales activités et ressources',
    module: 'GBM',
    phase: 2,
  },
  {
    stepKey: 'gbm_14a',
    title: "Écoconception de l'entreprise",
    module: 'GBM',
    phase: 2,
  },
  {
    stepKey: 'gbm_14b',
    title: "Résultats de l'écoconception",
    module: 'GBM',
    phase: 2,
  },
  {
    stepKey: 'gbm_15',
    title: 'Résumé des activités et ressources',
    module: 'GBM',
    phase: 2,
  },
  { stepKey: 'gbm_16', title: 'Structure des coûts', module: 'GBM', phase: 2 },
  { stepKey: 'gbm_17', title: 'Flux de revenus', module: 'GBM', phase: 2 },
  {
    stepKey: 'gbm_18',
    title: 'Résumé des coûts et flux de recettes',
    module: 'GBM',
    phase: 2,
  },

  // ── GBM Phase 3 — Tester ──
  { stepKey: 'gbm_19', title: 'Préparez le test !', module: 'GBM', phase: 3 },

  // ── GBM Phase 4 — Mesurer & Améliorer ──
  { stepKey: 'gbm_20', title: 'Indicateurs', module: 'GBM', phase: 4 },

  // ── GBM Phase 5 — Synthèse ──
  { stepKey: 'gbm_21', title: 'Analyse SWOT', module: 'GBM', phase: 5 },

  // ── Modules transverses ──
  {
    stepKey: 'eco_design',
    title: 'Éco-conception approfondie',
    module: 'Éco-conception',
    phase: 0,
  },
  {
    stepKey: 'funding',
    title: 'Accès au Financement',
    module: 'Financement',
    phase: 0,
  },
  { stepKey: 'market', title: 'Accès au Marché', module: 'Marché', phase: 0 },
  {
    stepKey: 'impact',
    title: "Mesure de l'Impact",
    module: 'Impact',
    phase: 0,
  },

  // Business Plan
  {
    stepKey: 'bp_2.1',
    title: 'Plan de gestion & exploitation',
    module: 'Business Plan',
    phase: 0,
  },
  {
    stepKey: 'bp_2.2',
    title: 'Plan de marketing',
    module: 'Business Plan',
    phase: 0,
  },
  {
    stepKey: 'bp_2.3',
    title: 'Plan financier',
    module: 'Business Plan',
    phase: 0,
  },
  {
    stepKey: 'bp_2.4',
    title: 'Plan juridique',
    module: 'Business Plan',
    phase: 0,
  },
  {
    stepKey: 'bp_2.5',
    title: 'Mesure et attente (KPIs)',
    module: 'Business Plan',
    phase: 0,
  },
  {
    stepKey: 'bp_2.6',
    title: 'Résumé analytique',
    module: 'Business Plan',
    phase: 0,
  },
];

export const STEP_KEYS = ALL_STEPS.map((s) => s.stepKey);

export function getStepsByModule(module: string): StepTemplate[] {
  return ALL_STEPS.filter((s) => s.module === module);
}

export function getStepsByPhase(phase: number): StepTemplate[] {
  return ALL_STEPS.filter((s) => s.phase === phase);
}
