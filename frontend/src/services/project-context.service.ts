import api from './api'
import type { ModulePrefill, ProjectContext } from '@/types/project-context'

const base = (projectId: string) => `/projects/${projectId}/context`

export const projectContextService = {
  getContext: (projectId: string): Promise<ProjectContext> =>
    api.get(base(projectId)).then(r => r.data),
  getPrefill: (projectId: string, module: string): Promise<ModulePrefill> =>
    api.get(`${base(projectId)}/prefill/${module}`).then(r => r.data),
}
