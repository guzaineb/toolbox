import api from './api'
import type { GbmProgress } from '@/types/gbm'

const base = (projectId: string) => `/projects/${projectId}/gbm`

export const gbmService = {
  async getStep(projectId: string, stepId: string) {
    const { data } = await api.get(`${base(projectId)}/step/${stepId}`)
    return data
  },

  async updateStep(projectId: string, stepId: string, body: Record<string, unknown>) {
    const { data } = await api.patch(`${base(projectId)}/step/${stepId}`, body)
    return data
  },

  async addStepItem(projectId: string, stepId: string, body: Record<string, unknown>) {
    const { data } = await api.post(`${base(projectId)}/step/${stepId}/add`, body)
    return data
  },

  async updateStepItem(projectId: string, stepId: string, itemId: string, body: Record<string, unknown>) {
    const { data } = await api.patch(`${base(projectId)}/step/${stepId}/${itemId}`, body)
    return data
  },

  async listStepItems(projectId: string, stepId: string) {
    const { data } = await api.get(`${base(projectId)}/step/${stepId}/list`)
    return data
  },

  async deleteStepItem(projectId: string, stepId: string, itemId: string) {
    const { data } = await api.delete(`${base(projectId)}/step/${stepId}/${itemId}`)
    return data
  },

  async getProgress(projectId: string): Promise<GbmProgress> {
    const { data } = await api.get(`${base(projectId)}/progress`)
    return data
  },

  async reviewGbm(projectId: string) {
    const { data } = await api.post(`${base(projectId)}/review`)
    return data
  },

  async initSteps(projectId: string) {
    const { data } = await api.post(`${base(projectId)}/init-steps`)
    return data
  },

  async downloadBmcPdf(projectId: string): Promise<Blob> {
    const { data } = await api.get(`${base(projectId)}/bmc-pdf`, {
      responseType: 'blob',
    })
    return data
  },
}
