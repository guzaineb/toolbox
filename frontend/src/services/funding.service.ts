import api from './api'
import type { FundingQuestion, FundingAssessment } from '@/types/funding'

const base = (projectId: string) => `/projects/${projectId}/funding`

export const fundingService = {
  getQuestions: () => api.get<FundingQuestion[]>(`${base('_')}/questions`).then(r => r.data),
  getAssessment: (projectId: string): Promise<FundingAssessment> =>
    api.get(base(projectId)).then(r => r.data),
  submitQuestionnaire: (projectId: string, reponses: Record<string, boolean>) =>
    api.post(`${base(projectId)}/questionnaire`, { reponses }).then(r => r.data),
  updateAssessment: (projectId: string, data: any) =>
    api.patch(base(projectId), data).then(r => r.data),
}
