import api from './api'
import type {
  OwnerDashboardResponse,
  ExpertDashboardResponse,
  IncubatorDashboardResponse,
} from '@/types/dashboard'

export const dashboardService = {
  async owner(): Promise<OwnerDashboardResponse> {
    const { data } = await api.get('/dashboard/owner')
    return data as OwnerDashboardResponse
  },

  async expert(): Promise<ExpertDashboardResponse> {
    const { data } = await api.get('/dashboard/expert')
    return data as ExpertDashboardResponse
  },

  async incubator(): Promise<IncubatorDashboardResponse> {
    const { data } = await api.get('/dashboard/incubator')
    return data as IncubatorDashboardResponse
  },
}