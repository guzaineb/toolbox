import api from './api'
import {
  CoachingOverview,
  CoachingSession,
  CoachingAction,
  CoachingRecommendation,
  CoachingComment,
  ProjectAssignment,
  CreateAssignmentDto,
  CreateSessionDto,
  UpdateSessionDto,
  CreateActionDto,
  CreateRecommendationDto,
  CreateCommentDto,
  ActionEvidence,
} from '@/types/coaching'
import { CoachingBriefPayload, SessionSummaryPayload } from '@/types/ai-analysis'

class CoachingService {
  private static instance: CoachingService

  static getInstance(): CoachingService {
    if (!CoachingService.instance) {
      CoachingService.instance = new CoachingService()
    }
    return CoachingService.instance
  }

  // ==================== AFFECTATIONS EXPERT / PROJET ====================

  async createAssignment(projectId: string, dto: CreateAssignmentDto): Promise<ProjectAssignment> {
    const { data } = await api.post(`/projects/${projectId}/assignments`, dto)
    return data
  }

  async getProjectAssignments(projectId: string): Promise<ProjectAssignment[]> {
    const { data } = await api.get(`/projects/${projectId}/assignments`)
    return data
  }

  async updateAssignment(id: string, dto: { status?: string; note?: string }): Promise<ProjectAssignment> {
    const { data } = await api.patch(`/assignments/${id}`, dto)
    return data
  }

  async removeAssignment(id: string): Promise<{ id: string }> {
    const { data } = await api.delete(`/assignments/${id}`)
    return data
  }

  async getMyAssignments(): Promise<ProjectAssignment[]> {
    const { data } = await api.get('/experts/me/assignments')
    return data
  }

  // ==================== TABLEAU DE BORD PROJET ====================

  async getProjectCoachingOverview(projectId: string): Promise<CoachingOverview> {
    const { data } = await api.get(`/projects/${projectId}/coaching`)
    return data
  }

  // ==================== SESSIONS ====================

  async getSession(id: string): Promise<CoachingSession> {
    const { data } = await api.get(`/coaching/sessions/${id}`)
    return data
  }

  async getProjectSessions(projectId: string): Promise<CoachingSession[]> {
    const { data } = await api.get(`/projects/${projectId}/coaching/sessions`)
    return data
  }

  async createSession(projectId: string, dto: CreateSessionDto): Promise<CoachingSession> {
    const { data } = await api.post(`/projects/${projectId}/coaching/sessions`, dto)
    return data
  }

  async updateSession(id: string, dto: UpdateSessionDto): Promise<CoachingSession> {
    const { data } = await api.patch(`/coaching/sessions/${id}`, dto)
    return data
  }

  async completeSession(id: string, report?: string): Promise<CoachingSession> {
    const { data } = await api.post(`/coaching/sessions/${id}/complete`, { report })
    return data
  }

  async startSession(id: string): Promise<CoachingSession> {
    const { data } = await api.post(`/coaching/sessions/${id}/start`)
    return data
  }

  // ==================== IA DE SESSION (proposition → validation coach) ====================

  async aiSessionBrief(id: string): Promise<{ success: boolean; data: CoachingBriefPayload | null }> {
    const { data } = await api.post(`/coaching/sessions/${id}/ai-brief`)
    return data
  }

  async aiSessionSummary(id: string): Promise<{ success: boolean; data: SessionSummaryPayload | null }> {
    const { data } = await api.post(`/coaching/sessions/${id}/ai-summary`)
    return data
  }

  // ==================== ACTIONS ====================

  async getProjectActions(projectId: string): Promise<CoachingAction[]> {
    const { data } = await api.get(`/projects/${projectId}/coaching/actions`)
    return data
  }

  async createAction(projectId: string, dto: CreateActionDto): Promise<CoachingAction> {
    const { data } = await api.post(`/projects/${projectId}/coaching/actions`, dto)
    return data
  }

  async updateAction(id: string, dto: { title?: string; description?: string; status?: string; priority?: string; deadline?: string; responsibleUserId?: string | null; relatedDocumentKey?: string | null }): Promise<CoachingAction> {
    const { data } = await api.patch(`/coaching/actions/${id}`, dto)
    return data
  }

  // ==================== PREUVES D'ACTION ====================

  async addEvidence(actionId: string, dto: { type: string; title?: string; content?: string; url?: string }): Promise<ActionEvidence> {
    const { data } = await api.post(`/coaching/actions/${actionId}/evidences`, dto)
    return data
  }

  async getEvidences(actionId: string): Promise<ActionEvidence[]> {
    const { data } = await api.get(`/coaching/actions/${actionId}/evidences`)
    return data
  }

  async reviewEvidence(evidenceId: string, dto: { status: 'APPROVED' | 'REJECTED'; comment?: string }): Promise<ActionEvidence> {
    const { data } = await api.patch(`/coaching/evidences/${evidenceId}/review`, dto)
    return data
  }

  /** Valide une suggestion IA en recommandation officielle (source = AI). */
  async createRecommendationFromAi(projectId: string, dto: { title: string; content: string; priority?: string; sessionId?: string; aiAnalysisId: string }): Promise<CoachingRecommendation> {
    const { data } = await api.post(`/projects/${projectId}/coaching/recommendations/from-ai`, dto)
    return data
  }

  // ==================== RECOMMANDATIONS ====================

  async getProjectRecommendations(projectId: string): Promise<CoachingRecommendation[]> {
    const { data } = await api.get(`/projects/${projectId}/coaching/recommendations`)
    return data
  }

  async createRecommendation(projectId: string, dto: CreateRecommendationDto): Promise<CoachingRecommendation> {
    const { data } = await api.post(`/projects/${projectId}/coaching/recommendations`, dto)
    return data
  }

  async updateRecommendation(id: string, dto: { status?: string }): Promise<CoachingRecommendation> {
    const { data } = await api.patch(`/coaching/recommendations/${id}`, dto)
    return data
  }

  // ==================== COMMENTAIRES ====================

  async addActionComment(actionId: string, dto: CreateCommentDto): Promise<CoachingComment> {
    const { data } = await api.post(`/coaching/actions/${actionId}/comments`, dto)
    return data
  }

  async getActionComments(actionId: string): Promise<CoachingComment[]> {
    const { data } = await api.get(`/coaching/actions/${actionId}/comments`)
    return data
  }

  async addSessionComment(sessionId: string, dto: CreateCommentDto): Promise<CoachingComment> {
    const { data } = await api.post(`/coaching/sessions/${sessionId}/comments`, dto)
    return data
  }

  async getSessionComments(sessionId: string): Promise<CoachingComment[]> {
    const { data } = await api.get(`/coaching/sessions/${sessionId}/comments`)
    return data
  }

  // ==================== VUE EXPERT ====================

  async getMyCoachingSessions(): Promise<CoachingSession[]> {
    const { data } = await api.get('/experts/me/coaching/sessions')
    return data
  }

  async getMyCoachingActions(): Promise<CoachingAction[]> {
    const { data } = await api.get('/experts/me/coaching/actions')
    return data
  }
}

export const coachingService = CoachingService.getInstance()
