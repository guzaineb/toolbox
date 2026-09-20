import api from './api'

const base = (projectId: string) => `/projects/${projectId}/eco-design`

export const ecoDesignService = {
  get: (projectId: string) => api.get(base(projectId)).then(r => r.data),
  update: (projectId: string, data: any) => api.patch(base(projectId), data).then(r => r.data),
  getProgress: (projectId: string) => api.get(`${base(projectId)}/progress`).then(r => r.data),
}
