// ── Backend /dashboard/* responses (mirror of DashboardService interfaces) ──

export interface ProjectProgress {
  overall: number
  gbm: { done: number; total: number; percentage: number }
  businessPlan: { done: number; total: number; percentage: number }
}

export interface ActivityItem {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  createdAt: string
  isRead: boolean
}

export interface AlertItem {
  type: string
  severity: 'high' | 'medium' | 'low'
  title: string
  message: string
  link: string | null
}

export interface NextStep {
  label: string
  link: string
}

// ── PROJECT_OWNER ──

export interface OwnerProjectItem {
  id: string
  name: string
  description: string | null
  isGbmReviewed: boolean
  gbmReviewedAt: string | null
  isBusinessPlanFinalized: boolean
  createdAt: string
  documentsGenerated: number
  progress: ProjectProgress
  nextStep: NextStep
}

export interface OwnerDashboardResponse {
  role: 'PROJECT_OWNER'
  projects: OwnerProjectItem[]
  stats: {
    totalProjects: number
    gbmReviewed: number
    notStarted: number
    inProgress: number
    averageProgress: number
    documentsGenerated: number
    recentlyCreated: number
  }
  recentActivities: ActivityItem[]
}

// ── EXPERT ──

export interface ExpertProjectItem {
  id: string
  name: string
  description: string | null
  ownerName: string
  role: string
  assignedAt: string
  progress: ProjectProgress
  maturity: { score: number; computedAt: string } | null
  nextAction: NextStep | null
  lastEvent: { type: string; label: string; createdAt: string } | null
}

export interface EvaluationTodoItem {
  assignmentId: string
  projectId: string
  projectName: string
  cohortId: string
  cohortName: string | null
  deadline: string | null
  createdAt: string
}

export interface EvaluationProgressItem {
  evaluationId: string
  projectId: string
  projectName: string
  updatedAt?: string
  submittedAt?: string
}

export interface UpcomingSessionItem {
  id: string
  projectId: string
  projectName: string
  title: string | null
  sessionType: string | null
  scheduledAt: string
  status: string
}

export interface ExpertDashboardResponse {
  role: 'EXPERT'
  projects: ExpertProjectItem[]
  stats: {
    assignedProjects: number
    activeCohorts: number
    evaluationsTodo: number
    upcomingSessions: number
    openActionsCount: number
  }
  evaluations: {
    todo: EvaluationTodoItem[]
    inProgress: EvaluationProgressItem[]
    done: EvaluationProgressItem[]
  }
  upcomingSessions: UpcomingSessionItem[]
  alerts: AlertItem[]
  recentActivities: ActivityItem[]
}

// ── INCUBATOR_MEMBER ──

export interface PortfolioProjectItem {
  id: string
  name: string
  description: string | null
  ownerId: string
  ownerName: string
  cohortId: string
  cohortName: string | null
  isGbmReviewed: boolean
  createdAt: string
  progress: ProjectProgress
}

export interface IncubatorSummaryItem {
  id: string
  name: string
  status: string
  activeCohorts: number
  portfolioSize: number
}

export interface CohortSummaryItem {
  id: string
  incubatorId: string
  name: string
  status: string
  startDate: string | null
  endDate: string | null
  participants: number
}

export interface ExpertSummaryItem {
  id: string
  name: string
  roles: { cohortId: string; cohortName: string; role: string }[]
}

export interface PendingEvaluationItem {
  projectId: string
  projectName: string
  cohortId: string
  cohortName: string | null
  pending: number
}

export interface JurySessionItem {
  id: string
  projectId: string
  projectName: string
  cohortId: string
  cohortName: string
  title: string | null
  status: string
  createdAt: string
}

export interface IncubatorDashboardResponse {
  role: 'INCUBATOR_MEMBER'
  incubators: IncubatorSummaryItem[]
  cohorts: CohortSummaryItem[]
  portfolio: PortfolioProjectItem[]
  stats: {
    portfolioSize: number
    activeProjects: number
    notStarted: number
    needsAttention: number
    totalCohorts: number
    activeCohorts: number
    expertsActive: number
    applicationsPending: number
    averageProgress: number
  }
  experts: ExpertSummaryItem[]
  pendingEvaluations: PendingEvaluationItem[]
  upcomingSessions: UpcomingSessionItem[]
  jurySessions: JurySessionItem[]
  alerts: AlertItem[]
  recentActivities: ActivityItem[]
}

// ── Union consumed by useRoleDashboard ──

export type RoleDashboardData =
  | OwnerDashboardResponse
  | ExpertDashboardResponse
  | IncubatorDashboardResponse

export type RoleDashboardResult =
  | { role: 'PROJECT_OWNER'; data: OwnerDashboardResponse }
  | { role: 'EXPERT'; data: ExpertDashboardResponse }
  | { role: 'INCUBATOR_MEMBER'; data: IncubatorDashboardResponse }