'use client'

import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/services/dashboard.service'
import type { RoleDashboardResult } from '@/types/dashboard'
import type { UserRole } from './useAuth'

export function useRoleDashboard(role?: UserRole | null) {
  const isDashboardRole =
    role === 'PROJECT_OWNER' || role === 'EXPERT' || role === 'INCUBATOR_MEMBER'

  return useQuery<RoleDashboardResult>({
    queryKey: ['dashboard', role],
    queryFn: async () => {
      switch (role) {
        case 'PROJECT_OWNER':
          return { role: 'PROJECT_OWNER', data: await dashboardService.owner() }
        case 'EXPERT':
          return { role: 'EXPERT', data: await dashboardService.expert() }
        case 'INCUBATOR_MEMBER':
          return { role: 'INCUBATOR_MEMBER', data: await dashboardService.incubator() }
        default:
          throw new Error('Rôle non pris en charge')
      }
    },
    enabled: isDashboardRole,
    staleTime: 30_000,
  })
}