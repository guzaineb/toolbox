import { useQuery } from '@tanstack/react-query'
import { incubatorService } from '@/services/incubator.service'
import { IncubatorDashboard } from '@/types/incubator'

export function useIncubatorDashboard(incubatorId?: string) {
  const { data, isLoading, error } = useQuery<IncubatorDashboard>({
    queryKey: ['incubator-dashboard', incubatorId],
    queryFn: () => incubatorService.getDashboard(incubatorId!),
    enabled: !!incubatorId,
  })

  return {
    dashboard: data ?? null,
    loading: isLoading,
    error: error ? (error as Error).message : null,
  }
}
