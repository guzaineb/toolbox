import api from './api'

export interface GeneratedDocument {
  key: string
  title: string
  icon: string
  status: 'NOT_GENERATED' | 'GENERATED' | 'UPDATED'
  generatedAt: string | null
  updatedAt: string | null
  content: string | null
}

const base = (projectId: string) => `/projects/${projectId}/documents`

export const documentsService = {
  async getDocumentsList(projectId: string): Promise<GeneratedDocument[]> {
    const { data } = await api.get(base(projectId))
    return data
  },

  async getDocument(projectId: string, documentKey: string): Promise<GeneratedDocument> {
    const { data } = await api.get(`${base(projectId)}/${documentKey}`)
    return data
  },

  async generateDocument(projectId: string, documentKey: string): Promise<GeneratedDocument> {
    const { data } = await api.post(`${base(projectId)}/${documentKey}/generate`)
    return data
  },

  async generateAllDocuments(projectId: string): Promise<GeneratedDocument[]> {
    const { data } = await api.post(`${base(projectId)}/generate-all`)
    return data
  },

  async downloadPdf(projectId: string, documentKey: string): Promise<Blob> {
    const { data } = await api.get(`${base(projectId)}/${documentKey}/pdf`, {
      responseType: 'blob',
    })
    return data
  },
}
