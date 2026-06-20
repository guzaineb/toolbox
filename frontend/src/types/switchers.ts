export interface PESTELDimension {
  quoi: string;
  comment: string;
}

export interface PESTELData {
  politique: PESTELDimension;
  economique: PESTELDimension;
  socioculturel: PESTELDimension;
  technologique: PESTELDimension;
  environnemental: PESTELDimension;
  legal: PESTELDimension;
}

export interface StakeholderEntry {
  name: string;
  influence: number;
  impacted: number;
  effects: string;
  actions: string;
}

export interface StakeholderByObjective {
  objective: string;
  stakeholders: StakeholderEntry[];
}

export interface StakeholderGiveTake {
  stakeholder: string;
  gives: string;
  receives: string;
  type: 'resource' | 'information' | 'support' | 'other';
}

export interface CustomerSegmentCard {
  name: string;
  description: string;
  pains: string[];
  gains: string[];
  jobs: string[];
  archetype?: string;
}

export interface ValuePropositionCanvas {
  productsServices: string[];
  painRelievers: string[];
  gainCreators: string[];
  greenValue: string;
  socialValue: string;
  customerSegment: string;
}

export interface DiscoveryCard {
  type: 'interview' | 'observation' | 'survey';
  date: string;
  person: string;
  hypothesisTested: string;
  keyFindings: string;
  insights: string;
  actionItems: string[];
}

export interface EcoDesignEntry {
  domain: string;
  currentState: string;
  improvements: string;
  priority: 'low' | 'medium' | 'high';
}

export interface JourneyStepContent {
  avantDeLire: {
    description: string;
    resultatsAttendus: string;
  };
  etudeDeCas: string;
  conseils: string[];
  subSections: Record<string, any>;
  [key: string]: any;
}

export type ToolKey = 'modele_affaires_vert' | 'plan_affaires_vert' | 'eco_conception' | 'acces_financement' | 'acces_marche' | 'mesure_impact';

export const STADE_LABELS: Record<StadeKey, string> = {
  ideation: 'Idéation',
  creation: 'Création',
  amorcage: 'Amorçage',
  scaling: 'Scaling',
};

export type StadeKey = 'ideation' | 'creation' | 'amorcage' | 'scaling';

export interface ToolInfo {
  label: string;
  steps: number[];
  icon?: string;
}

export const TOOL_STEP_MAPPING: Record<ToolKey, ToolInfo> = {
  modele_affaires_vert: { label: "Modèle d'affaires vert", steps: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18] },
  plan_affaires_vert: { label: "Plan d'affaires vert", steps: [15, 16, 17, 18] },
  eco_conception: { label: 'Éco-conception', steps: [14] },
  acces_financement: { label: 'Accès au financement', steps: [16, 17] },
  acces_marche: { label: 'Accès au marché', steps: [7, 8, 9, 12] },
  mesure_impact: { label: "Mesure de l'impact", steps: [20] },
};

export function getStadeFromProgress(percentage: number): StadeKey {
  if (percentage < 25) return 'ideation';
  if (percentage < 50) return 'creation';
  if (percentage < 75) return 'amorcage';
  return 'scaling';
}

export function getToolProgress(steps: { step_number: number; status: string }[], toolKey: ToolKey): number {
  const tool = TOOL_STEP_MAPPING[toolKey];
  const relevant = steps.filter(s => tool.steps.includes(s.step_number));
  if (relevant.length === 0) return 0;
  const completed = relevant.filter(s => s.status === 'approved' || s.status === 'submitted').length;
  return Math.round((completed / relevant.length) * 100);
}
