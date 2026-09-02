import api from './api'
import type { BusinessPlanProgress, BusinessPlanGatingStatus } from '@/types/business-plan'

const base = (projectId: string) => `/projects/${projectId}/business-plan`

export const businessPlanService = {
  // Management
  getManagement: (projectId: string) => api.get(`${base(projectId)}/management`).then(r => r.data),
  updateManagement: (projectId: string, data: any) => api.patch(`${base(projectId)}/management`, data).then(r => r.data),

  // Marketing
  getMarketing: (projectId: string) => api.get(`${base(projectId)}/marketing`).then(r => r.data),
  updateMarketing: (projectId: string, data: any) => api.patch(`${base(projectId)}/marketing`, data).then(r => r.data),

  // Financial
  getFinancial: (projectId: string) => api.get(`${base(projectId)}/financial`).then(r => r.data),
  updateFinancial: (projectId: string, data: any) => api.patch(`${base(projectId)}/financial`, data).then(r => r.data),

  // Legal
  getLegal: (projectId: string) => api.get(`${base(projectId)}/legal`).then(r => r.data),
  updateLegal: (projectId: string, data: any) => api.patch(`${base(projectId)}/legal`, data).then(r => r.data),

  // KPIs
  getKpis: (projectId: string) => api.get(`${base(projectId)}/kpis`).then(r => r.data),
  updateKpis: (projectId: string, data: any) => api.patch(`${base(projectId)}/kpis`, data).then(r => r.data),

  // Executive Summary
  getExecutiveSummary: (projectId: string) => api.get(`${base(projectId)}/executive-summary`).then(r => r.data),
  updateExecutiveSummary: (projectId: string, data: any) => api.patch(`${base(projectId)}/executive-summary`, data).then(r => r.data),
  generateExecutiveSummary: (projectId: string) => api.post(`${base(projectId)}/executive-summary/generate`).then(r => r.data),

  // Progress
  getProgress: (projectId: string): Promise<BusinessPlanProgress> =>
    api.get(`${base(projectId)}/progress`).then(r => r.data),

  // Finalisation / gating GBM (D7)
  getGatingStatus: (projectId: string): Promise<BusinessPlanGatingStatus> =>
    api.get(`${base(projectId)}/status`).then(r => r.data),
  finalize: (projectId: string) =>
    api.post(`${base(projectId)}/finalize`).then(r => r.data),
}
