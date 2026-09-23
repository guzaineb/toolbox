import api from './api'

export interface SwotData {
  strengths?: string
  weaknesses?: string
  opportunities?: string
  threats?: string
  generated_at?: string
  updated_at?: string
}

const base = (projectId: string) => `/projects/${projectId}/swot`

export const swotService = {
  async getSwotAnalysis(projectId: string): Promise<SwotData | null> {
    try {
      const { data } = await api.get(base(projectId))
      return data || null
    } catch {
      return null
    }
  },

  async generateSwotAnalysis(projectId: string): Promise<SwotData> {
    const { data } = await api.post(`${base(projectId)}/generate`)
    return data
  },

  async updateSwotAnalysis(projectId: string, body: Partial<SwotData>): Promise<SwotData> {
    const { data } = await api.patch(base(projectId), body)
    return data
  },
}
