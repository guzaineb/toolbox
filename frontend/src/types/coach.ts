// ── Project State (from backend ProjectStateService) ──

export type MaturityLevel = 'NOT_STARTED' | 'INITIAL' | 'DEVELOPING' | 'MATURE' | 'OPTIMIZED'
export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type InconsistencySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type PriorityModule =
  | 'GBM'
  | 'BUSINESS_PLAN'
  | 'MARKET'
  | 'FUNDING'
  | 'IMPACT'
  | 'ECO_DESIGN'
  | 'EVALUATION'
  | 'COACHING'
  | 'GENERAL'

export interface StepInfo {
  stepKey: string
  title: string
  phase: number
  status: string
  hasData: boolean
  aiGenerated?: boolean
}

export interface CategoryScore {
  label: string
  score: number
  maxScore: number
  weight: number
}

export interface HealthScore {
  overall: number
  categories: CategoryScore[]
}

export interface Priority {
  level: PriorityLevel
  area: string
  description: string
  impact: number
  module?: PriorityModule
  stepKey?: string
}

export interface Inconsistency {
  area: string
  description: string
  severity: InconsistencySeverity
  module?: string
  evidence?: string
  recommendation?: string
  action?: string
}

export interface ProjectState {
  projectId: string
  projectName: string
  maturityLevel: MaturityLevel
  overallProgress: number
  completedSteps: StepInfo[]
  incompleteSteps: StepInfo[]
  missingInformation: string[]
  strengths: string[]
  weakAreas: string[]
  inconsistencies: Inconsistency[]
  healthScore: HealthScore
  priorities: Priority[]
  currentPriority: Priority | null
  recommendedNextAction: string
}

// ── Chat (from backend ChatbotService) ──

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatSource {
  id: string
  documentKey: string
  module: string
  section: string
  page?: number
}

export interface ChatbotAskResult {
  answer: string
  sources: unknown[]
  sourcesUsed: ChatSource[]
  ragStatus: 'RAG_AVAILABLE' | 'RAG_UNAVAILABLE' | 'NO_RELEVANT_CONTEXT'
  contextUsed: boolean
  toolsUsed: string[]
  conversationId: string
}

// ── Documents (from backend DocumentService) ──

export type UploadedDocumentStatus = 'PENDING' | 'PROCESSING' | 'INDEXED' | 'FAILED'

export interface UploadedDocument {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  status: UploadedDocumentStatus
  createdAt: string
}

export interface UploadedDocumentsResult {
  documents: UploadedDocument[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// ── Conversations ──

export interface Conversation {
  id: string
  title: string | null
  summary: string | null
  messageCount: number
  lastMessageAt: string | null
  createdAt: string
}

export interface ConversationMessage {
  id: string
  role: string
  content: string
  sources: unknown
  contextUsed: boolean
  createdAt: string
}

// ── UI Helpers ──

export const MATURITY_LABELS: Record<MaturityLevel, string> = {
  NOT_STARTED: 'Non démarré',
  INITIAL: 'Initial',
  DEVELOPING: 'En développement',
  MATURE: 'Mature',
  OPTIMIZED: 'Optimisé',
}

export const MATURITY_COLORS: Record<MaturityLevel, string> = {
  NOT_STARTED: 'gray',
  INITIAL: 'amber',
  DEVELOPING: 'blue',
  MATURE: 'green',
  OPTIMIZED: 'green',
}

export const SEVERITY_LABELS: Record<InconsistencySeverity, string> = {
  LOW: 'Faible',
  MEDIUM: 'Moyen',
  HIGH: 'Élevé',
  CRITICAL: 'Critique',
}

export const SEVERITY_COLORS: Record<InconsistencySeverity, string> = {
  LOW: 'gray',
  MEDIUM: 'amber',
  HIGH: 'red',
  CRITICAL: 'red',
}

export const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  LOW: 'Basse',
  MEDIUM: 'Moyenne',
  HIGH: 'Haute',
  CRITICAL: 'Critique',
}

export const PRIORITY_COLORS: Record<PriorityLevel, string> = {
  LOW: 'gray',
  MEDIUM: 'amber',
  HIGH: 'red',
  CRITICAL: 'red',
}
