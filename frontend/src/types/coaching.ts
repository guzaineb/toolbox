/* =========================================================
   ENUMS — Module Coaching & Évaluation
========================================================= */

export type AssignmentRole = 'COACH' | 'JURY'

export type CoachingSessionStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED' | 'MISSED'
export type CoachingActionStatus = 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'COMPLETED' | 'REJECTED' | 'OVERDUE' | 'CANCELLED'
export type CoachingActionPriority = 'LOW' | 'MEDIUM' | 'HIGH'
export type CoachingRecommendationStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'ARCHIVED'

export type EvaluationStatus = 'DRAFT' | 'SUBMITTED'
export type EvaluationStage = 'INTERMEDIATE' | 'FINAL'

export type JurySessionStatus = 'DRAFT' | 'OPEN' | 'DELIBERATION' | 'CLOSED'

export type FinalDecisionType = 'ACCEPTED' | 'REJECTED' | 'CONDITIONAL' | 'EXTENDED' | 'REEVALUATION_REQUIRED'
export type ConditionStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED'

/* =========================================================
   ENTITIES
========================================================= */

export interface ProjectAssignment {
  id: string
  project_id: string
  expert_user_id: string
  role: AssignmentRole
  status: string
  note?: string
  assigned_by: string
  assigned_at: string
  created_at: string
  updated_at: string
  expertUser?: {
    id: string
    email: string
    profile?: { first_name: string; last_name: string }
  }
  project?: { id: string; name: string; description?: string; owner_id: string }
}

export interface CoachingSession {
  id: string
  assignment_id: string
  title?: string
  scheduled_at: string
  duration_minutes?: number
  status: CoachingSessionStatus
  report?: string
  completed_at?: string
  created_at: string
  updated_at: string
  assignment?: {
    id: string
    expert_user_id: string
    project?: { id: string; name: string; owner_id: string }
    expertUser?: { id: string; email: string; profile?: { first_name: string; last_name: string } }
  }
}

export interface CoachingAction {
  id: string
  project_id: string
  assignment_id?: string
  title: string
  description?: string
  status: CoachingActionStatus
  priority: CoachingActionPriority
  deadline?: string
  deadline_reminded_at?: string
  overdue_reminded_at?: string
  created_by: string
  created_at: string
  updated_at: string
  project?: { id: string; name: string }
  assignment?: { id: string; expert_user_id: string }
}

export interface CoachingRecommendation {
  id: string
  project_id: string
  session_id?: string
  title?: string
  content: string
  priority: CoachingActionPriority
  status: CoachingRecommendationStatus
  author_id: string
  created_at: string
  updated_at: string
  author?: { id: string; email: string; profile?: { first_name: string; last_name: string } }
  actions?: Array<{ id: string; title: string; status: CoachingActionStatus }>
}

export interface CoachingComment {
  id: string
  content: string
  author_id: string
  action_id?: string
  session_id?: string
  created_at: string
  author?: { id: string; email: string; profile?: { first_name: string; last_name: string } }
}

export interface CoachingOverview {
  project_id: string
  sessions: CoachingSession[]
  actions: CoachingAction[]
  recommendations: CoachingRecommendation[]
  assignments: ProjectAssignment[]
  counts: {
    sessions: number
    sessions_completed: number
    actions: number
    actions_completed: number
    actions_pending: number
    recommendations: number
    recommendations_done: number
  }
}

export interface EvaluationCriterion {
  id: string
  template_id: string
  name: string
  description?: string
  weight: number
  max_score: number
  sort_order: number
}

export interface EvaluationTemplate {
  id: string
  cohort_id: string
  name: string
  description?: string
  stage: EvaluationStage
  published: boolean
  locked_at?: string
  created_by: string
  created_at: string
  updated_at: string
  criteria: EvaluationCriterion[]
}

export interface EvaluationScore {
  id: string
  evaluation_id: string
  criterion_id: string
  score: number
  comment?: string
}

export interface EvaluationModule {
  id: string
  project_id: string
  jury_user_id: string
  status: EvaluationStatus
  template_id?: string
  version: number
  submitted_at?: string
  created_at: string
  updated_at: string
  score?: number
  comment?: string
  total?: number
  total20?: number
  project?: { id: string; name: string }
  template?: { id: string; name: string; stage: EvaluationStage; published?: boolean; criteria: EvaluationCriterion[] }
  scores?: EvaluationScore[]
  juryUser?: { id: string; email: string; profile?: { first_name: string; last_name: string } }
}

export interface EvaluationAssignment {
  id: string
  cohort_id: string
  project_id: string
  jury_user_id: string
  deadline?: string
  created_by: string
  created_at: string
  submitted?: boolean
  todo?: boolean
  evaluation_id?: string | null
  evaluation_status?: EvaluationStatus | null
  version?: number | null
  cohort?: { id: string; name: string }
  project?: { id: string; name: string; description?: string; owner_id: string }
  juryUser?: { id: string; email: string; profile?: { first_name: string; last_name: string } }
}

export interface EvaluationSummary {
  project_id: string
  submitted: number
  average20: number | null
  min20: number | null
  max20: number | null
  byEvaluator: Array<{
    juryMember: { id: string; email: string; profile?: { first_name: string; last_name: string } }
    total: number
    total20: number
    submitted_at?: string
  }>
  byCriterion: Array<{
    criterion_id: string
    name: string
    weight: number
    max_score: number
    average: number
  }>
}

export interface JurySession {
  id: string
  project_id: string
  cohort_id: string
  title?: string
  status: JurySessionStatus
  observations?: string
  reevaluation_requested: boolean
  created_by: string
  created_at: string
  updated_at: string
  closed_at?: string
  project?: { id: string; name: string; owner_id: string }
  members?: Array<{
    id: string
    jury_session_id: string
    member_user_id: string
    member?: { id: string; email: string; profile?: { first_name: string; last_name: string } }
  }>
}

export interface FinalDecisionCondition {
  id: string
  decision_id: string
  description: string
  deadline?: string
  status: ConditionStatus
  validated_by?: string
  validated_at?: string
  created_at: string
}

export interface FinalDecision {
  id: string
  project_id: string
  cohort_id: string
  decision: FinalDecisionType
  final_score?: number
  justification?: string
  new_end_date?: string
  decided_by: string
  decided_at: string
  created_at: string
  updated_at: string
  project?: { id: string; name: string; owner_id: string }
  conditions?: FinalDecisionCondition[]
  decidedBy?: { id: string; email: string; profile?: { first_name: string; last_name: string } }
}

export interface FinalDecisionView {
  project_id: string
  decisions: FinalDecision[]
  latest: FinalDecision | null
}

/* =========================================================
   DTOs
========================================================= */

export interface CreateAssignmentDto {
  expertUserId: string
  role: AssignmentRole
  note?: string
}

export interface CreateSessionDto {
  title?: string
  scheduledAt: string
  durationMinutes?: number
  report?: string
}

export interface CreateActionDto {
  title: string
  description?: string
  priority?: CoachingActionPriority
  deadline?: string
  sessionId?: string
  recommendationId?: string
  assignmentId?: string
}

export interface CreateRecommendationDto {
  title?: string
  content: string
  priority?: CoachingActionPriority
  sessionId?: string
}

export interface CreateCommentDto {
  content: string
}

export interface CriterionDto {
  name: string
  description?: string
  weight: number
  max_score?: number
  sort_order?: number
}

export interface CreateTemplateDto {
  name: string
  description?: string
  stage?: EvaluationStage
  criteria: CriterionDto[]
}

export interface AssignmentItemDto {
  projectId: string
  juryUserIds: string[]
}

export interface AssignEvaluatorsDto {
  templateId?: string
  deadline?: string
  assignments: AssignmentItemDto[]
}

export interface ScoreItemDto {
  criterionId: string
  score: number
  comment?: string
}

export interface CreateJurySessionDto {
  title?: string
  memberUserIds: string[]
}

export interface MakeDecisionDto {
  decision: FinalDecisionType
  final_score?: number
  justification?: string
  new_end_date?: string
  conditions?: Array<{ description: string; deadline?: string }>
}

/* =========================================================
   LABELS & COLORS
========================================================= */

export const ASSIGNMENT_ROLE_LABELS: Record<AssignmentRole, string> = {
  COACH: 'Coach',
  JURY: 'Jury',
}

export const COACHING_SESSION_STATUS_LABELS: Record<CoachingSessionStatus, string> = {
  SCHEDULED: 'Planifiée',
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée',
  RESCHEDULED: 'Reprogrammée',
  MISSED: 'Manquée',
}

export const COACHING_SESSION_STATUS_COLORS: Record<CoachingSessionStatus, BadgeVariantKey> = {
  SCHEDULED: 'blue',
  COMPLETED: 'green',
  CANCELLED: 'gray',
  RESCHEDULED: 'amber',
  MISSED: 'red',
}

export const ACTION_STATUS_LABELS: Record<CoachingActionStatus, string> = {
  PENDING: 'En attente',
  IN_PROGRESS: 'En cours',
  SUBMITTED: 'À valider',
  COMPLETED: 'Terminée',
  REJECTED: 'Refusée',
  OVERDUE: 'En retard',
  CANCELLED: 'Annulée',
}

export const ACTION_STATUS_COLORS: Record<CoachingActionStatus, BadgeVariantKey> = {
  PENDING: 'gray',
  IN_PROGRESS: 'blue',
  SUBMITTED: 'amber',
  COMPLETED: 'green',
  REJECTED: 'red',
  OVERDUE: 'red',
  CANCELLED: 'gray',
}

export const PRIORITY_LABELS: Record<CoachingActionPriority, string> = {
  LOW: 'Basse',
  MEDIUM: 'Moyenne',
  HIGH: 'Haute',
}

export const PRIORITY_COLORS: Record<CoachingActionPriority, BadgeVariantKey> = {
  LOW: 'gray',
  MEDIUM: 'blue',
  HIGH: 'red',
}

export const RECOMMENDATION_STATUS_LABELS: Record<CoachingRecommendationStatus, string> = {
  OPEN: 'Ouverte',
  IN_PROGRESS: 'En cours',
  DONE: 'Réalisée',
  ARCHIVED: 'Archivée',
}

export const EVALUATION_STATUS_LABELS: Record<EvaluationStatus, string> = {
  DRAFT: 'Brouillon',
  SUBMITTED: 'Soumise',
}

export const EVALUATION_STAGE_LABELS: Record<EvaluationStage, string> = {
  INTERMEDIATE: 'Évaluation intermédiaire',
  FINAL: 'Évaluation finale',
}

export const JURY_STATUS_LABELS: Record<JurySessionStatus, string> = {
  DRAFT: 'Brouillon',
  OPEN: 'Ouverte',
  DELIBERATION: 'Délibération',
  CLOSED: 'Clôturée',
}

export const JURY_STATUS_COLORS: Record<JurySessionStatus, BadgeVariantKey> = {
  DRAFT: 'gray',
  OPEN: 'blue',
  DELIBERATION: 'amber',
  CLOSED: 'green',
}

export const DECISION_LABELS: Record<FinalDecisionType, string> = {
  ACCEPTED: 'Accepté',
  REJECTED: 'Refusé',
  CONDITIONAL: 'Accepté avec conditions',
  EXTENDED: 'Accompagnement prolongé',
  REEVALUATION_REQUIRED: 'Réévaluation requise',
}

export const DECISION_COLORS: Record<FinalDecisionType, BadgeVariantKey> = {
  ACCEPTED: 'green',
  REJECTED: 'red',
  CONDITIONAL: 'amber',
  EXTENDED: 'blue',
  REEVALUATION_REQUIRED: 'amber',
}

export const CONDITION_STATUS_LABELS: Record<ConditionStatus, string> = {
  PENDING: 'En attente',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Validée',
  EXPIRED: 'Expirée',
}

export const CONDITION_STATUS_COLORS: Record<ConditionStatus, BadgeVariantKey> = {
  PENDING: 'amber',
  IN_PROGRESS: 'blue',
  COMPLETED: 'green',
  EXPIRED: 'red',
}

type BadgeVariantKey = 'green' | 'amber' | 'red' | 'blue' | 'gray' | 'secondary'
