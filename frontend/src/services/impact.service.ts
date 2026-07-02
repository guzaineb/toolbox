import api from './api'
import type { ImpactMeasure } from '@/types/impact'

const base = (projectId: string) => `/projects/${projectId}/impact`

export const impactService = {
  get: (projectId: string): Promise<ImpactMeasure> => api.get(base(projectId)).then(r => r.data),
  update: (projectId: string, data: any) => api.patch(base(projectId), data).then(r => r.data),
  generateReport: (projectId: string) => api.post(`${base(projectId)}/report/generate`).then(r => r.data),
  getProgress: (projectId: string) => api.get(`${base(projectId)}/progress`).then(r => r.data),
}
