export type MaturityLevel =
  | 'NOT_STARTED'
  | 'INITIAL'
  | 'DEVELOPING'
  | 'MATURE'
  | 'OPTIMIZED';

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type InconsistencySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type StepInfo = {
  stepKey: string;
  title: string;
  phase: number;
  status: string;
  hasData: boolean;
};

export type CategoryScore = {
  label: string;
  score: number;
  maxScore: number;
  weight: number;
};

export type HealthScore = {
  overall: number;
  categories: CategoryScore[];
};

export type Priority = {
  level: PriorityLevel;
  area: string;
  description: string;
  impact: number;
};

export type Inconsistency = {
  area: string;
  description: string;
  severity: InconsistencySeverity;
};

export type CompletenessResult = {
  gbm: { completed: number; total: number; percentage: number; steps: StepInfo[] };
  businessPlan: { completed: number; total: number; percentage: number; sections: string[] };
  transversal: Record<string, boolean>;
};

export type ProgressResult = {
  overallPercentage: number;
  gbmPercentage: number;
  bpPercentage: number;
  modulePercentages: Record<string, number>;
  completedCount: number;
  totalCount: number;
};

export type ProjectState = {
  projectId: string;
  projectName: string;
  maturityLevel: MaturityLevel;
  overallProgress: number;
  completedSteps: StepInfo[];
  incompleteSteps: StepInfo[];
  missingInformation: string[];
  strengths: string[];
  weakAreas: string[];
  inconsistencies: Inconsistency[];
  healthScore: HealthScore;
  priorities: Priority[];
  currentPriority: Priority | null;
  recommendedNextAction: string;
};

export type ConsistencyResult = {
  inconsistencies: Inconsistency[];
  score: number;
  totalChecks: number;
  passedChecks: number;
};

export type HealthDiagnostic = {
  score: number;
  completenessScore: number;
  progressScore: number;
  coherenceScore: number;
  maturityScore: number;
  weakAreas: string[];
  strengths: string[];
};
