import api from './api'
import type { Paginated } from '@/types/pagination'

export interface Project {
  id: string
  name: string
  description?: string
  is_gbm_reviewed?: boolean
  gbm_reviewed_at?: string
  created_at: string
}

export type FundingPhase =
  | 'IDEATION'
  | 'VALIDATION'
  | 'EARLY_STAGE'
  | 'GROWTH'
  | 'SCALING'

export interface ProjectDirectoryParticipation {
  id: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'
  origin: 'APPLICATION' | 'INVITATION'
  cohort: { id: string; name: string; status: string } | null
}

/**
 * Projet tel que présenté dans l'annuaire de l'incubateur
 * (`GET /projects/directory`) : description détaillée + informations clés
 * (porteur, maturité, cohortes).
 */
export interface ProjectDirectoryEntry {
  id: string
  name: string
  description?: string | null
  owner_id: string
  ownerName: string
  created_at: string
  is_gbm_reviewed: boolean
  business_plan_status?: 'FINAL' | null
  context_summary?: { summary_text?: string | null } | null
  mission_vision?: { mission?: string | null; vision?: string | null } | null
  funding_assessment?: {
    phase_maturite?: FundingPhase | null
    score_maturite?: number | null
  } | null
  cohort_participations: ProjectDirectoryParticipation[]
}

export type ProjectDirectoryPage = Paginated<ProjectDirectoryEntry>

export const FUNDING_PHASE_LABELS: Record<FundingPhase, string> = {
  IDEATION: 'Idéation',
  VALIDATION: 'Validation',
  EARLY_STAGE: 'Amorçage',
  GROWTH: 'Croissance',
  SCALING: 'Passage à l’échelle',
}

const base = '/projects'

export const projectService = {
  async list(): Promise<Project[]> {
    const { data } = await api.get(base)
    return Array.isArray(data) ? (data as Project[]) : []
  },

  async get(projectId: string): Promise<Project> {
    const { data } = await api.get(`${base}/${projectId}`)
    return data as Project
  },

  async create(name: string, description?: string): Promise<Project> {
    const { data } = await api.post(base, { name, description })
    return data as Project
  },

  /**
   * Annuaire des projets de la plateforme — réservé aux incubateurs.
   */
  async listDirectory(
    filters: { q?: string; page?: number; limit?: number } = {},
  ): Promise<ProjectDirectoryPage> {
    const params: Record<string, string | number> = {}
    if (filters.q?.trim()) params.q = filters.q.trim()
    if (filters.page) params.page = filters.page
    if (filters.limit) params.limit = filters.limit

    const { data } = await api.get(`${base}/directory`, { params })
    return data as ProjectDirectoryPage
  },
}