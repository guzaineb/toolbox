import api from './api'

export interface Project {
  id: string
  name: string
  description?: string
  is_gbm_reviewed?: boolean
  gbm_reviewed_at?: string
  created_at: string
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
}