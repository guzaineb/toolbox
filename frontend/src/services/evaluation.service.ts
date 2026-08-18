import api from './api'
import {
  EvaluationTemplate,
  EvaluationAssignment,
  EvaluationModule,
  EvaluationSummary,
  JurySession,
  FinalDecision,
  FinalDecisionView,
  FinalDecisionCondition,
  CreateTemplateDto,
  AssignEvaluatorsDto,
  ScoreItemDto,
  CreateJurySessionDto,
  MakeDecisionDto,
} from '@/types/coaching'

class EvaluationService {
  private static instance: EvaluationService

  static getInstance(): EvaluationService {
    if (!EvaluationService.instance) {
      EvaluationService.instance = new EvaluationService()
    }
    return EvaluationService.instance
  }

  // ==================== GRILLES D'ÉVALUATION ====================

  async getCohortTemplates(cohortId: string): Promise<EvaluationTemplate[]> {
    const { data } = await api.get(`/cohorts/${cohortId}/evaluation-templates`)
    return data
  }

  async createTemplate(cohortId: string, dto: CreateTemplateDto): Promise<EvaluationTemplate> {
    const { data } = await api.post(`/cohorts/${cohortId}/evaluation-templates`, dto)
    return data
  }

  async publishTemplate(id: string): Promise<EvaluationTemplate> {
    const { data } = await api.post(`/evaluation-templates/${id}/publish`)
    return data
  }

  // ==================== AFFECTATIONS ÉVALUATEURS ====================

  async assignEvaluators(cohortId: string, dto: AssignEvaluatorsDto): Promise<{ created: number; assignments: EvaluationAssignment[] }> {
    const { data } = await api.post(`/cohorts/${cohortId}/evaluations/assign`, dto)
    return data
  }

  async getCohortEvaluationAssignments(cohortId: string): Promise<EvaluationAssignment[]> {
    const { data } = await api.get(`/cohorts/${cohortId}/evaluations/assignments`)
    return data
  }

  async getEvaluationAssignment(id: string): Promise<EvaluationAssignment & { evaluations: EvaluationModule[] }> {
    const { data } = await api.get(`/evaluation-assignments/${id}`)
    return data
  }

  // ==================== ÉVALUATIONS (BROUILLON / SCORES / SOUMISSION) ====================

  async createDraft(assignmentId: string): Promise<EvaluationModule> {
    const { data } = await api.post(`/evaluation-assignments/${assignmentId}/draft`)
    return data
  }

  async saveScores(evaluationId: string, dto: { scores: ScoreItemDto[] }): Promise<EvaluationModule> {
    const { data } = await api.patch(`/evaluations/${evaluationId}/scores`, dto)
    return data
  }

  async submitEvaluation(evaluationId: string): Promise<EvaluationModule & { total: number; total20: number }> {
    const { data } = await api.post(`/evaluations/${evaluationId}/submit`)
    return data
  }

  async getProjectSummary(projectId: string): Promise<EvaluationSummary> {
    const { data } = await api.get(`/projects/${projectId}/evaluations/summary`)
    return data
  }

  async getMyTodo(): Promise<EvaluationAssignment[]> {
    const { data } = await api.get('/experts/me/evaluations/todo')
    return data
  }

  // ==================== SESSIONS DU JURY ====================

  async createJurySession(projectId: string, dto: CreateJurySessionDto): Promise<JurySession> {
    const { data } = await api.post(`/projects/${projectId}/jury-sessions`, dto)
    return data
  }

  async getProjectJurySessions(projectId: string): Promise<JurySession[]> {
    const { data } = await api.get(`/projects/${projectId}/jury-sessions`)
    return data
  }

  async updateJurySession(id: string, dto: Partial<CreateJurySessionDto> & { status?: string; observations?: string }): Promise<JurySession> {
    const { data } = await api.patch(`/jury-sessions/${id}`, dto)
    return data
  }

  async closeJurySession(id: string): Promise<JurySession> {
    const { data } = await api.post(`/jury-sessions/${id}/close`)
    return data
  }

  // ==================== DÉCISIONS FINALES ====================

  async makeDecision(projectId: string, dto: MakeDecisionDto): Promise<FinalDecision> {
    const { data } = await api.post(`/projects/${projectId}/final-decision`, dto)
    return data
  }

  async getProjectDecision(projectId: string): Promise<FinalDecisionView> {
    const { data } = await api.get(`/projects/${projectId}/final-decision`)
    return data
  }

  async addConditions(decisionId: string, dto: { conditions: Array<{ description: string; deadline?: string }> }): Promise<FinalDecisionCondition[]> {
    const { data } = await api.post(`/final-decisions/${decisionId}/conditions`, dto)
    return data
  }

  async validateCondition(id: string): Promise<FinalDecisionCondition> {
    const { data } = await api.post(`/final-decision-conditions/${id}/validate`)
    return data
  }
}

export const evaluationService = EvaluationService.getInstance()
