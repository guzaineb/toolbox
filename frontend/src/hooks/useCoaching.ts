'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { QueryClient, QueryKey } from '@tanstack/react-query'
import { coachingService } from '@/services/coaching.service'
import {
  ActionEvidence,
  CoachingAction,
  CoachingComment,
  CoachingOverview,
  CoachingRecommendation,
  CoachingSession,
  CreateActionDto,
  CreateCommentDto,
  CreateRecommendationDto,
  CreateSessionDto,
  ProjectAssignment,
  UpdateSessionDto,
} from '@/types/coaching'

/* =========================================================
   Query keys — chaque clé embarque projectId/sessionId/actionId
   pour garantir l'isolation par projet et une invalidation ciblée.
========================================================= */

export const coachingKeys = {
  all: ['coaching'] as const,
  overview: (projectId: string) => [...coachingKeys.all, 'projects', projectId, 'overview'] as const,
  assignments: (projectId: string) => [...coachingKeys.all, 'projects', projectId, 'assignments'] as const,
  sessions: (projectId: string) => [...coachingKeys.all, 'projects', projectId, 'sessions'] as const,
  /** Sessions des sessions de coaching assignées à l'expert connecté (GET /experts/me/coaching/sessions). */
  expertSessions: ['coaching', 'expert', 'sessions'] as const,
  session: (sessionId: string) => [...coachingKeys.all, 'sessions', sessionId] as const,
  sessionComments: (sessionId: string) => [...coachingKeys.session(sessionId), 'comments'] as const,
  actions: (projectId: string) => [...coachingKeys.all, 'projects', projectId, 'actions'] as const,
  action: (actionId: string) => [...coachingKeys.all, 'actions', actionId] as const,
  actionEvidences: (actionId: string) => [...coachingKeys.action(actionId), 'evidences'] as const,
  actionComments: (actionId: string) => [...coachingKeys.action(actionId), 'comments'] as const,
  recommendations: (projectId: string) => [...coachingKeys.all, 'projects', projectId, 'recommendations'] as const,
  recommendation: (recommendationId: string) => [...coachingKeys.all, 'recommendations', recommendationId] as const,
}

/* =========================================================
   Invalidation ciblée — mapping pur, testable.
   Les mutations invalident UNIQUEMENT les clés du projet/session
   concernés (jamais d'invalidation globale).
========================================================= */

export interface CoachingInvalidationIds {
  projectId?: string
  sessionId?: string
  actionId?: string
}

export function coachingInvalidations(operation: string, ids: CoachingInvalidationIds = {}): QueryKey[] {
  const { projectId, sessionId, actionId } = ids

  switch (operation) {
    case 'createSession':
      return projectId
        ? [coachingKeys.sessions(projectId), coachingKeys.overview(projectId), coachingKeys.expertSessions]
        : []
    case 'updateSession':
    case 'startSession':
    case 'completeSession':
      return [
        ...(sessionId ? [coachingKeys.session(sessionId)] : []),
        ...(sessionId ? [coachingKeys.expertSessions] : []),
        ...(projectId ? [coachingKeys.sessions(projectId), coachingKeys.overview(projectId)] : []),
      ]
    case 'createAction':
    case 'updateAction':
      return projectId ? [coachingKeys.actions(projectId), coachingKeys.overview(projectId)] : []
    case 'addEvidence':
    case 'reviewEvidence':
      return [
        ...(actionId ? [coachingKeys.actionEvidences(actionId)] : []),
        ...(projectId ? [coachingKeys.actions(projectId), coachingKeys.overview(projectId)] : []),
      ]
    case 'createRecommendation':
    case 'createRecommendationFromAi':
    case 'updateRecommendation':
      return projectId ? [coachingKeys.recommendations(projectId), coachingKeys.overview(projectId)] : []
    case 'addSessionComment':
      return sessionId ? [coachingKeys.sessionComments(sessionId)] : []
    case 'addActionComment':
      return actionId ? [coachingKeys.actionComments(actionId)] : []
    default:
      return []
  }
}

function invalidateCoaching(
  queryClient: QueryClient,
  operation: string,
  ids: CoachingInvalidationIds = {},
) {
  for (const key of coachingInvalidations(operation, ids)) {
    void queryClient.invalidateQueries({ queryKey: key })
  }
}

/* =========================================================
   Queries
========================================================= */

export function useProjectCoachingOverview(projectId: string) {
  return useQuery<CoachingOverview>({
    queryKey: coachingKeys.overview(projectId),
    queryFn: () => coachingService.getProjectCoachingOverview(projectId),
    enabled: !!projectId,
  })
}

export function useCoachingSession(sessionId: string) {
  return useQuery<CoachingSession>({
    queryKey: coachingKeys.session(sessionId),
    queryFn: () => coachingService.getSession(sessionId),
    enabled: !!sessionId,
  })
}

export function useProjectSessions(projectId: string) {
  return useQuery<CoachingSession[]>({
    queryKey: coachingKeys.sessions(projectId),
    queryFn: () => coachingService.getProjectSessions(projectId),
    enabled: !!projectId,
  })
}

export function useMyCoachingSessions() {
  return useQuery<CoachingSession[]>({
    queryKey: coachingKeys.expertSessions,
    queryFn: () => coachingService.getMyCoachingSessions(),
  })
}

export function useProjectActions(projectId: string) {
  return useQuery<CoachingAction[]>({
    queryKey: coachingKeys.actions(projectId),
    queryFn: () => coachingService.getProjectActions(projectId),
    enabled: !!projectId,
  })
}

export function useProjectRecommendations(projectId: string) {
  return useQuery<CoachingRecommendation[]>({
    queryKey: coachingKeys.recommendations(projectId),
    queryFn: () => coachingService.getProjectRecommendations(projectId),
    enabled: !!projectId,
  })
}

export function useProjectAssignments(projectId: string) {
  return useQuery<ProjectAssignment[]>({
    queryKey: coachingKeys.assignments(projectId),
    queryFn: () => coachingService.getProjectAssignments(projectId),
    enabled: !!projectId,
  })
}

export function useActionEvidences(actionId: string, enabled = true) {
  return useQuery<ActionEvidence[]>({
    queryKey: coachingKeys.actionEvidences(actionId),
    queryFn: () => coachingService.getEvidences(actionId),
    enabled: enabled && !!actionId,
  })
}

export function useActionComments(actionId: string, enabled = true) {
  return useQuery<CoachingComment[]>({
    queryKey: coachingKeys.actionComments(actionId),
    queryFn: () => coachingService.getActionComments(actionId),
    enabled: enabled && !!actionId,
  })
}

export function useSessionComments(sessionId: string, enabled = true) {
  return useQuery<CoachingComment[]>({
    queryKey: coachingKeys.sessionComments(sessionId),
    queryFn: () => coachingService.getSessionComments(sessionId),
    enabled: enabled && !!sessionId,
  })
}

/* =========================================================
   Mutations
========================================================= */

export function useCreateSession(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation<CoachingSession, unknown, CreateSessionDto>({
    mutationFn: (dto) => coachingService.createSession(projectId, dto),
    onSuccess: () => invalidateCoaching(queryClient, 'createSession', { projectId }),
  })
}

export function useUpdateSession() {
  const queryClient = useQueryClient()

  return useMutation<CoachingSession, unknown, { projectId: string; sessionId: string; dto: UpdateSessionDto }>({
    mutationFn: ({ sessionId, dto }) => coachingService.updateSession(sessionId, dto),
    onSuccess: (updated, { projectId, sessionId }) => {
      queryClient.setQueryData(coachingKeys.session(sessionId), updated)
      invalidateCoaching(queryClient, 'updateSession', { projectId, sessionId })
    },
  })
}

export function useStartSession() {
  const queryClient = useQueryClient()

  return useMutation<CoachingSession, unknown, { projectId: string; sessionId: string }>({
    mutationFn: ({ sessionId }) => coachingService.startSession(sessionId),
    onSuccess: (updated, { projectId, sessionId }) => {
      queryClient.setQueryData(coachingKeys.session(sessionId), updated)
      invalidateCoaching(queryClient, 'startSession', { projectId, sessionId })
    },
  })
}

export function useCompleteSession() {
  const queryClient = useQueryClient()

  return useMutation<
    CoachingSession,
    unknown,
    { projectId: string; sessionId: string; report?: string }
  >({
    mutationFn: ({ sessionId, report }) => coachingService.completeSession(sessionId, report),
    onSuccess: (updated, { projectId, sessionId }) => {
      queryClient.setQueryData(coachingKeys.session(sessionId), updated)
      invalidateCoaching(queryClient, 'completeSession', { projectId, sessionId })
    },
  })
}

export function useCreateAction(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation<CoachingAction, unknown, CreateActionDto>({
    mutationFn: (dto) => coachingService.createAction(projectId, dto),
    onSuccess: () => invalidateCoaching(queryClient, 'createAction', { projectId }),
  })
}

export function useUpdateAction(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation<
    CoachingAction,
    unknown,
    { actionId: string; dto: { title?: string; description?: string; status?: string; priority?: string; deadline?: string; responsibleUserId?: string | null; relatedDocumentKey?: string | null; objectiveId?: string | null } }
  >({
    mutationFn: ({ actionId, dto }) => coachingService.updateAction(actionId, dto),
    onSuccess: () => invalidateCoaching(queryClient, 'updateAction', { projectId }),
  })
}

export function useAddEvidence(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation<
    ActionEvidence,
    unknown,
    { actionId: string; dto: { type: string; title?: string; content?: string; url?: string } }
  >({
    mutationFn: ({ actionId, dto }) => coachingService.addEvidence(actionId, dto),
    onSuccess: (_evidence, { actionId }) =>
      invalidateCoaching(queryClient, 'addEvidence', { projectId, actionId }),
  })
}

export function useReviewEvidence(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation<
    ActionEvidence,
    unknown,
    { actionId: string; evidenceId: string; dto: { status: 'APPROVED' | 'REJECTED'; comment?: string } }
  >({
    mutationFn: ({ evidenceId, dto }) => coachingService.reviewEvidence(evidenceId, dto),
    onSuccess: (_evidence, { actionId }) =>
      invalidateCoaching(queryClient, 'reviewEvidence', { projectId, actionId }),
  })
}

export function useCreateRecommendation(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation<CoachingRecommendation, unknown, CreateRecommendationDto>({
    mutationFn: (dto) => coachingService.createRecommendation(projectId, dto),
    onSuccess: () => invalidateCoaching(queryClient, 'createRecommendation', { projectId }),
  })
}

export function useUpdateRecommendation(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation<
    CoachingRecommendation,
    unknown,
    { recommendationId: string; dto: { status?: string } }
  >({
    mutationFn: ({ recommendationId, dto }) => coachingService.updateRecommendation(recommendationId, dto),
    onSuccess: () => invalidateCoaching(queryClient, 'updateRecommendation', { projectId }),
  })
}

export function useCreateRecommendationFromAi(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation<
    CoachingRecommendation,
    unknown,
    { title: string; content: string; priority?: string; sessionId?: string; aiAnalysisId: string }
  >({
    mutationFn: (dto) => coachingService.createRecommendationFromAi(projectId, dto),
    onSuccess: () => invalidateCoaching(queryClient, 'createRecommendationFromAi', { projectId }),
  })
}

export function useAddSessionComment(sessionId: string) {
  const queryClient = useQueryClient()

  return useMutation<CoachingComment, unknown, CreateCommentDto>({
    mutationFn: (dto) => coachingService.addSessionComment(sessionId, dto),
    onSuccess: () => invalidateCoaching(queryClient, 'addSessionComment', { sessionId }),
  })
}

export function useAddActionComment(actionId: string) {
  const queryClient = useQueryClient()

  return useMutation<CoachingComment, unknown, CreateCommentDto>({
    mutationFn: (dto) => coachingService.addActionComment(actionId, dto),
    onSuccess: () => invalidateCoaching(queryClient, 'addActionComment', { actionId }),
  })
}

export function useAiSessionBrief(sessionId: string) {
  return useMutation({
    mutationFn: () => coachingService.aiSessionBrief(sessionId),
  })
}

export function useAiSessionSummary(sessionId: string) {
  return useMutation({
    mutationFn: () => coachingService.aiSessionSummary(sessionId),
  })
}