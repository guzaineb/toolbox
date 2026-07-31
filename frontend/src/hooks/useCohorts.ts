import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cohortService } from '@/services/cohort.service'
import { Cohort, CohortExpert, CohortParticipation } from '@/types/cohort'

export function useAvailableCohorts() {
  return useQuery<Cohort[]>({
    queryKey: ['cohorts', 'available'],
    queryFn: () => cohortService.getAvailableCohorts(),
    staleTime: 30_000,
  })
}

export function useMyCohorts() {
  return useQuery<(CohortExpert | CohortParticipation)[]>({
    queryKey: ['cohorts', 'my'],
    queryFn: () => cohortService.getMyCohorts(),
    staleTime: 30_000,
  })
}

export function useApplyAsExpert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ cohortId, role }: { cohortId: string; role: string }) =>
      cohortService.applyAsExpert(cohortId, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cohorts', 'available'] })
      queryClient.invalidateQueries({ queryKey: ['cohorts', 'my'] })
    },
  })
}

export function useApplyToCohort() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ cohortId, projectId }: { cohortId: string; projectId: string }) =>
      cohortService.applyToCohort(cohortId, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cohorts', 'available'] })
      queryClient.invalidateQueries({ queryKey: ['cohorts', 'my'] })
    },
  })
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => cohortService.acceptParticipation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cohorts', 'my'] })
    },
  })
}

export function useRejectInvitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => cohortService.rejectParticipation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cohorts', 'my'] })
    },
  })
}

export function useWithdrawParticipation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => cohortService.withdrawParticipation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cohorts', 'my'] })
      queryClient.invalidateQueries({ queryKey: ['cohorts', 'available'] })
    },
  })
}

export function useAcceptExpertInvitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => cohortService.acceptExpertInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cohorts', 'my'] })
      queryClient.invalidateQueries({ queryKey: ['cohorts', 'available'] })
    },
  })
}

export function useRejectExpertInvitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => cohortService.rejectExpertInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cohorts', 'my'] })
      queryClient.invalidateQueries({ queryKey: ['cohorts', 'available'] })
    },
  })
}
