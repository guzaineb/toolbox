export interface OneToManyField {
  field: string;
  label: string;
}

export interface OneToManyStepRule {
  stepKey: string;
  title: string;
  idField: string;
  idLabel: string;
  /** Au moins un de ces champs doit être renseigné (non vide). */
  anyOf?: OneToManyField[];
  /** Tous ces champs doivent être renseignés (non vides). */
  allOf?: OneToManyField[];
}

/**
 * Règles de validité minimale d'un élément des étapes GBM one-to-many (D3).
 * Une étape est considérée complétée si elle contient au moins un élément valide.
 * Règles miroir côté frontend : `frontend/src/data/gbm/steps.ts`.
 */
export const ONE_TO_MANY_STEP_RULES: OneToManyStepRule[] = [
  {
    stepKey: 'gbm_7a',
    title: 'Parties prenantes',
    idField: 'name',
    idLabel: 'Nom de la partie prenante',
    anyOf: [
      { field: 'role', label: 'Rôle' },
      { field: 'interest', label: 'Intérêt dans le projet' },
      { field: 'influence', label: "Degré d'influence" },
      { field: 'engagement_strategy', label: "Stratégie d'engagement" },
    ],
  },
  {
    stepKey: 'gbm_7b',
    title: 'Cartes des parties prenantes (donnant-donnant)',
    idField: 'stakeholder_name',
    idLabel: 'Partie prenante',
    allOf: [
      { field: 'contribution', label: 'Contribution (donnant)' },
      { field: 'reward', label: 'Récompense (donnant)' },
    ],
  },
  {
    stepKey: 'gbm_8',
    title: 'Segments de clientèle',
    idField: 'segment_name',
    idLabel: 'Nom du segment',
    anyOf: [
      { field: 'pains', label: 'Souffrances' },
      { field: 'gains', label: 'Gains attendus' },
      { field: 'functions', label: 'Fonctions' },
    ],
  },
  {
    stepKey: 'gbm_10',
    title: 'Test de la proposition',
    idField: 'hypothesis',
    idLabel: 'Hypothèse',
    anyOf: [
      { field: 'test_method', label: 'Méthode de test' },
      { field: 'results', label: 'Résultats' },
      { field: 'learnings', label: 'Apprentissages' },
    ],
  },
  {
    stepKey: 'gbm_12b',
    title: 'Parcours du client',
    idField: 'stage_name',
    idLabel: "Nom de l'étape",
    anyOf: [
      { field: 'touchpoints', label: 'Points de contact' },
      { field: 'customer_emotions', label: 'Émotions client' },
      { field: 'improvement_ideas', label: "Idées d'amélioration" },
    ],
  },
];

export function getOneToManyRule(
  stepKey: string,
): OneToManyStepRule | undefined {
  return ONE_TO_MANY_STEP_RULES.find((r) => r.stepKey === stepKey);
}

export function isBlank(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim() === '';
  return false;
}

/**
 * Champs requis manquants d'un élément. Retourne une liste vide si l'élément est valide.
 */
export function missingOneToManyFields(
  stepKey: string,
  item: Record<string, unknown>,
): string[] {
  const rule = getOneToManyRule(stepKey);
  if (!rule) return [];

  const missing: string[] = [];
  if (isBlank(item[rule.idField])) {
    missing.push(rule.idLabel);
  }

  for (const f of rule.allOf ?? []) {
    if (isBlank(item[f.field])) missing.push(f.label);
  }

  const anyOf = rule.anyOf ?? [];
  if (anyOf.length > 0 && !anyOf.some((f) => !isBlank(item[f.field]))) {
    missing.push(anyOf.map((f) => f.label).join(' ou '));
  }

  return missing;
}

export function isValidOneToManyItem(
  stepKey: string,
  item: Record<string, unknown>,
): boolean {
  return missingOneToManyFields(stepKey, item).length === 0;
}

/** Nombre d'éléments valides dans une collection. */
export function countValidOneToManyItems(
  stepKey: string,
  items: Record<string, unknown>[],
): number {
  return items.filter((item) => isValidOneToManyItem(stepKey, item)).length;
}
