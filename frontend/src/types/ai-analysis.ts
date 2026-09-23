/* =========================================================
   ANALYSES IA — Module Coaching & Évaluation
   L'IA propose, l'humain valide. Aucun score officiel n'est
   calculé par l'IA (voir MaturityScore côté backend).
========================================================= */

export type AiAnalysisType =
  | 'EVALUATION_ANALYSIS'
  | 'JURY_ASSISTANT'
  | 'RISK_ANALYSIS'
  | 'PROGRESS_ANALYSIS'
  | 'SESSION_BRIEF'
  | 'SESSION_SUMMARY'

export type AiAnalysisStatus = 'PENDING' | 'COMPLETED' | 'FAILED'

export interface AnalysisPoint {
  area: string
  severity?: string
  description: string
  evidence?: string | null
  confidence?: number | null
}

export interface AnalysisRecommendation {
  title: string
  priority: string
  reason: string
}

export interface EvaluationAnalysisPayload {
  summary: string
  strengths: AnalysisPoint[]
  weaknesses: AnalysisPoint[]
  risks: AnalysisPoint[]
  opportunities: AnalysisPoint[]
  recommendations: AnalysisRecommendation[]
  suggestedQuestions: string[]
}

export interface JuryBriefingPayload {
  summary: string
  strengths: string[]
  weaknesses: string[]
  risks: string[]
  suggestedQuestions: string[]
  missingInformation: string[]
  inconsistencies: string[]
}

export interface RiskAnalysisPayload {
  overallLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  risks: Array<{
    category: string
    severity: 'LOW' | 'MEDIUM' | 'HIGH'
    description: string
    evidence: string | null
    recommendedAction: string | null
  }>
}

export interface ProgressAnalysisPayload {
  overallBefore: number | null
  overallAfter: number | null
  overallDelta: number | null
  dimensions: Array<{ name: string; before: number | null; after: number | null; delta: number | null }>
  actionsCompleted: number
  actionsTotal: number
  sessionsCompleted: number
  narrative: string
  improvements: string[]
  persistentWeaknesses: string[]
  newRisks: string[]
  nextPriorities: string[]
}

export interface CoachingBriefPayload {
  objective: string
  previousProgress: string[]
  priorities: Array<{ title: string; priority: string; detail: string }>
  suggestedQuestions: string[]
  pointsToDiscuss: string[]
}

export interface SessionSummaryPayload {
  summary: string
  decisions: string[]
  nextObjectives: string[]
  improvements: string[]
  persistentRisks: string[]
}

export interface AiAnalysis {
  id: string
  project_id: string
  type: AiAnalysisType
  status: AiAnalysisStatus
  evaluation_id?: string | null
  session_id?: string | null
  from_evaluation_id?: string | null
  to_evaluation_id?: string | null
  payload?: Record<string, unknown> | null
  error?: string | null
  model?: string | null
  duration_ms?: number | null
  created_by?: string | null
  created_at: string
  updated_at: string
}

/* =========================================================
   PLAN D'AMÉLIORATION
========================================================= */

export type ImprovementPlanStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'
export type ImprovementObjectiveStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export interface ImprovementObjective {
  id: string
  plan_id: string
  title: string
  description?: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  current_score?: number | null
  target_score?: number | null
  progress: number
  status: ImprovementObjectiveStatus
  deadline?: string | null
  created_at: string
  updated_at: string
}

export interface ImprovementPlan {
  id: string
  project_id: string
  evaluation_id?: string | null
  ai_analysis_id?: string | null
  title?: string
  description?: string
  status: ImprovementPlanStatus
  target_areas?: string[] | null
  progress: number
  deadline?: string | null
  validated_by?: string | null
  validated_at?: string | null
  created_by: string
  created_at: string
  updated_at: string
  objectives?: ImprovementObjective[]
}

/* =========================================================
   MATURITÉ (score déterministe backend)
========================================================= */

export interface MaturityScore {
  globalScore: number
  dimensions: Array<{ name: string; score: number; weight: number }>
  computedAt: string
}

/* =========================================================
   LABELS & COULEURS
========================================================= */

export const AI_ANALYSIS_TYPE_LABELS: Record<AiAnalysisType, string> = {
  EVALUATION_ANALYSIS: "Analyse d'évaluation",
  JURY_ASSISTANT: 'Briefing jury',
  RISK_ANALYSIS: 'Analyse de risques',
  PROGRESS_ANALYSIS: 'Analyse de progression',
  SESSION_BRIEF: 'Brief de session',
  SESSION_SUMMARY: 'Résumé de session',
}

export const AI_ANALYSIS_STATUS_LABELS: Record<AiAnalysisStatus, string> = {
  PENDING: 'En cours',
  COMPLETED: 'Terminée',
  FAILED: 'Échec',
}

export const AI_ANALYSIS_STATUS_COLORS: Record<AiAnalysisStatus, 'amber' | 'green' | 'red'> = {
  PENDING: 'amber',
  COMPLETED: 'green',
  FAILED: 'red',
}

export const AREA_LABELS: Record<string, string> = {
  impact: 'Impact',
  market: 'Marché',
  finance: 'Finance',
  team: 'Équipe',
  product: 'Produit',
  customer_acquisition: 'Acquisition clients',
  operations: 'Opérations',
  legal: 'Juridique',
  innovation: 'Innovation',
  business_model: 'Business model',
  general: 'Général',
}

export const SEVERITY_LABELS: Record<string, string> = {
  LOW: 'Faible',
  MEDIUM: 'Moyen',
  HIGH: 'Élevé',
}

export const SEVERITY_COLORS: Record<string, 'gray' | 'blue' | 'red'> = {
  LOW: 'gray',
  MEDIUM: 'blue',
  HIGH: 'red',
}

export const IMPROVEMENT_PLAN_STATUS_LABELS: Record<ImprovementPlanStatus, string> = {
  DRAFT: 'Brouillon (à valider)',
  ACTIVE: 'Actif',
  COMPLETED: 'Terminé',
  ARCHIVED: 'Archivé',
}

export const OBJECTIVE_STATUS_LABELS: Record<ImprovementObjectiveStatus, string> = {
  PENDING: 'À faire',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Atteint',
  CANCELLED: 'Annulé',
}

export const MATURITY_DIMENSION_LABELS: Record<string, string> = {
  evaluation: 'Évaluation jury (/20)',
  gbm: 'Parcours GBM',
  business_plan: 'Business plan',
  market_validation: 'Validation marché',
  impact: 'Impact mesuré',
  coaching_progress: 'Progression coaching',
}
