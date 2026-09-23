import api from './api'
import {
  AiAnalysis,
  AiAnalysisType,
  EvaluationAnalysisPayload,
  ImprovementObjective,
  ImprovementPlan,
  JuryBriefingPayload,
  MaturityScore,
  ProgressAnalysisPayload,
  RiskAnalysisPayload,
} from '@/types/ai-analysis'

class AiAnalysisService {
  private static instance: AiAnalysisService

  static getInstance(): AiAnalysisService {
    if (!AiAnalysisService.instance) {
      AiAnalysisService.instance = new AiAnalysisService()
    }
    return AiAnalysisService.instance
  }

  // ==================== ANALYSE D'ÉVALUATION ====================

  async analyzeEvaluation(projectId: string, evaluationId: string): Promise<{ success: boolean; data: EvaluationAnalysisPayload | null }> {
    const { data } = await api.post(`/projects/${projectId}/ai/evaluations/${evaluationId}/analyze`)
    return data
  }

  // ==================== PLAN D'AMÉLIORATION ====================

  /** Génère un plan d'amélioration en brouillon à partir d'une analyse d'évaluation. */
  async generateImprovementPlan(projectId: string, evaluationId: string): Promise<{ planId: string | null; analysisAvailable: boolean }> {
    const { data } = await api.post(`/projects/${projectId}/ai/improvement-plan/generate`, { evaluationId })
    return data
  }

  async getProjectPlans(projectId: string): Promise<ImprovementPlan[]> {
    const { data } = await api.get(`/projects/${projectId}/improvement-plans`)
    return data
  }

  /** Le coach valide le brouillon (status: 'ACTIVE') ou l'archive/clôture. */
  async updatePlan(planId: string, dto: { status?: string }): Promise<ImprovementPlan> {
    const { data } = await api.patch(`/improvement-plans/${planId}`, dto)
    return data
  }

  async updateObjective(objectiveId: string, dto: { status?: string; progress?: number }): Promise<ImprovementObjective> {
    const { data } = await api.patch(`/improvement-objectives/${objectiveId}`, dto)
    return data
  }

  // ==================== RISQUES / JURY / PROGRESSION ====================

  async analyzeRisks(projectId: string): Promise<{ success: boolean; data: RiskAnalysisPayload | null }> {
    const { data } = await api.post(`/projects/${projectId}/ai/risks/analyze`)
    return data
  }

  async getJuryBriefing(projectId: string): Promise<{ success: boolean; data: JuryBriefingPayload | null }> {
    const { data } = await api.post(`/projects/${projectId}/ai/jury-briefing`)
    return data
  }

  async analyzeProgress(projectId: string, fromEvaluationId: string, toEvaluationId: string): Promise<{ success: boolean; data: ProgressAnalysisPayload | null }> {
    const { data } = await api.post(`/projects/${projectId}/ai/progress/analyze`, {
      fromEvaluationId,
      toEvaluationId,
    })
    return data
  }

  // ==================== HISTORIQUE DES ANALYSES ====================

  async listAnalyses(projectId: string, type?: AiAnalysisType): Promise<AiAnalysis[]> {
    const { data } = await api.get(`/projects/${projectId}/ai/analyses`, { params: type ? { type } : {} })
    return data
  }

  // ==================== MATURITÉ (score déterministe backend) ====================

  async getMaturity(projectId: string): Promise<MaturityScore> {
    const { data } = await api.get(`/projects/${projectId}/maturity`)
    return data
  }
}

export const aiAnalysisService = AiAnalysisService.getInstance()
