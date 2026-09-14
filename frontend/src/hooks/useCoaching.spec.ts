// @vitest-environment jsdom
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest'
import { createElement, type ReactNode } from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { coachingService } from '@/services/coaching.service'
import {
  coachingKeys,
  coachingInvalidations,
  useCoachingSession,
  useMyCoachingSessions,
  useProjectCoachingOverview,
  useProjectSessions,
  useUpdateSession,
} from '@/hooks/useCoaching'
import type { CoachingSession, CoachingOverview } from '@/types/coaching'

vi.mock('@/services/coaching.service', () => ({
  __esModule: true,
  coachingService: {
    getProjectCoachingOverview: vi.fn(),
    getSession: vi.fn(),
    getProjectSessions: vi.fn(),
    getMyCoachingSessions: vi.fn(),
    getProjectActions: vi.fn(),
    getProjectRecommendations: vi.fn(),
    getProjectAssignments: vi.fn(),
    getEvidences: vi.fn(),
    getSessionComments: vi.fn(),
    getActionComments: vi.fn(),
    createSession: vi.fn(),
    updateSession: vi.fn(),
    startSession: vi.fn(),
    completeSession: vi.fn(),
    createAction: vi.fn(),
    updateAction: vi.fn(),
    addEvidence: vi.fn(),
    reviewEvidence: vi.fn(),
    createRecommendation: vi.fn(),
    updateRecommendation: vi.fn(),
    createRecommendationFromAi: vi.fn(),
    addSessionComment: vi.fn(),
    addActionComment: vi.fn(),
    aiSessionBrief: vi.fn(),
    aiSessionSummary: vi.fn(),
  },
}))

function session(id: string, notes = ''): CoachingSession {
  return {
    id,
    assignment_id: 'asg-1',
    scheduled_at: '2026-01-15T10:00:00.000Z',
    status: 'SCHEDULED',
    notes,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  }
}

function overview(projectId: string): CoachingOverview {
  return {
    project_id: projectId,
    sessions: [session('s-1')],
    actions: [],
    recommendations: [],
    assignments: [],
    counts: {
      sessions: 1,
      sessions_completed: 0,
      actions: 0,
      actions_completed: 0,
      actions_pending: 0,
      recommendations: 0,
      recommendations_done: 0,
    },
  }
}

function makeClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

async function flush() {
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 5)) })
}

async function waitFor(assert: () => void) {
  const deadline = Date.now() + 2000
  for (;;) {
    await flush()
    try {
      assert()
      return
    } catch (err) {
      if (Date.now() > deadline) throw err
    }
  }
}

function mount(node: ReactNode) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  act(() => { root.render(node) })
  return { root, container }
}

let mountedRoots: Root[] = []

function useHarness<T>(harness: () => T, client: QueryClient) {
  const state: { current?: T } = {}
  function Probe() {
    state.current = harness()
    return null
  }
  const { root } = mount(createElement(QueryClientProvider, { client }, createElement(Probe)))
  mountedRoots.push(root)
  return state
}

describe('coachingKeys', () => {
  it('embeds project/session/action ids so projects stay isolated', () => {
    expect(coachingKeys.sessions('p-1')).toContain('p-1')
    expect(coachingKeys.overview('p-1')).toContain('p-1')
    expect(coachingKeys.sessions('p-1')).not.toEqual(coachingKeys.sessions('p-2'))
    expect(coachingKeys.recommendations('p-1')).not.toEqual(coachingKeys.recommendations('p-2'))
    expect([...coachingKeys.expertSessions].slice(-2)).toEqual(['expert', 'sessions'])
    expect(coachingKeys.expertSessions).not.toEqual(coachingKeys.sessions('p-1'))
  })

  it('nests session/action sub-resources under their parent key', () => {
    expect([...coachingKeys.sessionComments('s-1')].slice(-2)).toEqual(['s-1', 'comments'])
    expect([...coachingKeys.actionEvidences('a-1')].slice(-2)).toEqual(['a-1', 'evidences'])
    expect(coachingKeys.actionComments('a-1')).toEqual([...coachingKeys.action('a-1'), 'comments'])
  })
})

describe('coachingInvalidations', () => {
  it('returns nothing for unknown operations or missing ids', () => {
    expect(coachingInvalidations('unknown')).toEqual([])
    expect(coachingInvalidations('createSession')).toEqual([])
    expect(coachingInvalidations('createSession', { sessionId: 's-1' })).toEqual([])
  })

  it('invalidates only the concerned project lists on session/action mutations', () => {
    expect(coachingInvalidations('createSession', { projectId: 'p-1' })).toEqual([
      coachingKeys.sessions('p-1'),
      coachingKeys.overview('p-1'),
      coachingKeys.expertSessions,
    ])
    expect(coachingInvalidations('updateSession', { projectId: 'p-1', sessionId: 's-1' })).toEqual([
      coachingKeys.session('s-1'),
      coachingKeys.expertSessions,
      coachingKeys.sessions('p-1'),
      coachingKeys.overview('p-1'),
    ])
    expect(coachingInvalidations('startSession', { projectId: 'p-1', sessionId: 's-1' })).toEqual([
      coachingKeys.session('s-1'),
      coachingKeys.expertSessions,
      coachingKeys.sessions('p-1'),
      coachingKeys.overview('p-1'),
    ])
    expect(coachingInvalidations('updateAction', { projectId: 'p-1' })).toEqual([
      coachingKeys.actions('p-1'),
      coachingKeys.overview('p-1'),
    ])
  })

  it('scopes evidence and comment invalidations to the exact action/session', () => {
    expect(coachingInvalidations('addEvidence', { projectId: 'p-1', actionId: 'a-1' })).toEqual([
      coachingKeys.actionEvidences('a-1'),
      coachingKeys.actions('p-1'),
      coachingKeys.overview('p-1'),
    ])
    expect(coachingInvalidations('addSessionComment', { sessionId: 's-1' })).toEqual([
      coachingKeys.sessionComments('s-1'),
    ])
    expect(coachingInvalidations('addActionComment', { actionId: 'a-1' })).toEqual([
      coachingKeys.actionComments('a-1'),
    ])
  })
})

describe('useCoaching query hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true
    mountedRoots = []
  })

  afterEach(() => {
    for (const root of mountedRoots) {
      act(() => { root.unmount() })
    }
    while (document.body.firstChild) document.body.removeChild(document.body.firstChild)
  })

  it('fetches the overview of the requested project and exposes its data', async () => {
    vi.mocked(coachingService.getProjectCoachingOverview).mockResolvedValue(overview('p-1'))
    const client = makeClient()
    const state = useHarness(() => useProjectCoachingOverview('p-1'), client)

    await waitFor(() => expect(state.current?.isSuccess).toBe(true))
    expect(coachingService.getProjectCoachingOverview).toHaveBeenCalledTimes(1)
    expect(coachingService.getProjectCoachingOverview).toHaveBeenCalledWith('p-1')
    expect(state.current?.data?.counts.sessions).toBe(1)
  })

  it('fetches only the coaching sessions assigned to the connected expert', async () => {
    vi.mocked(coachingService.getMyCoachingSessions).mockResolvedValue([session('s-1')])
    const client = makeClient()
    const state = useHarness(() => useMyCoachingSessions(), client)

    await waitFor(() => expect(state.current?.isSuccess).toBe(true))
    expect(coachingService.getMyCoachingSessions).toHaveBeenCalledTimes(1)
    expect(coachingService.getProjectSessions).not.toHaveBeenCalled()
    expect(state.current?.data?.map((s) => s.id)).toEqual(['s-1'])
  })

  it('surfaces query errors instead of crashing', async () => {
    vi.mocked(coachingService.getProjectCoachingOverview).mockRejectedValue(new Error('Forbidden'))
    const client = makeClient()
    const state = useHarness(() => useProjectCoachingOverview('p-1'), client)

    await waitFor(() => expect(state.current?.isError).toBe(true))
    expect(state.current?.error).toBeInstanceOf(Error)
  })

  it('updateSession primes the session cache and refetches only the concerned project', async () => {
    const overviewMock = vi.mocked(coachingService.getProjectCoachingOverview)
    const sessionsMock = vi.mocked(coachingService.getProjectSessions)
    const sessionMock = vi.mocked(coachingService.getSession)
    const updateSessionMock = vi.mocked(coachingService.updateSession)
    let sharedNotes = ''
    overviewMock.mockImplementation(async (projectId) => overview(projectId))
    sessionsMock.mockImplementation(async (projectId) => [session(projectId === 'p-1' ? 's-1' : 's-2')])
    sessionMock.mockImplementation(async () => session('s-1', sharedNotes))
    updateSessionMock.mockImplementation(async (_sessionId, payload) => {
      sharedNotes = payload.notes ?? ''
      return session('s-1', sharedNotes)
    })

    const client = makeClient()
    const state = useHarness(
      () => ({
        overviewA: useProjectCoachingOverview('p-1'),
        overviewB: useProjectCoachingOverview('p-2'),
        sessionsA: useProjectSessions('p-1'),
        session: useCoachingSession('s-1'),
        updateSession: useUpdateSession(),
      }),
      client,
    )

    await waitFor(() => expect(state.current?.overviewA.isSuccess).toBe(true))
    await waitFor(() => expect(state.current?.overviewB.isSuccess).toBe(true))

    const overviewCallsForP2Before = overviewMock.mock.calls.filter((call) => call[0] === 'p-2').length
    const overviewCallsForP1Before = overviewMock.mock.calls.filter((call) => call[0] === 'p-1').length
    const sessionsCallsForP1Before = sessionsMock.mock.calls.filter((call) => call[0] === 'p-1').length

    await act(async () => {
      await state.current!.updateSession.mutateAsync({ projectId: 'p-1', sessionId: 's-1', dto: { notes: 'x' } })
    })

    await waitFor(() => expect(state.current?.session.data?.notes).toBe('x'))
    expect(updateSessionMock).toHaveBeenCalledWith('s-1', { notes: 'x' })

    await waitFor(() => {
      expect(sessionsMock.mock.calls.filter((call) => call[0] === 'p-1').length)
        .toBeGreaterThan(sessionsCallsForP1Before)
      expect(overviewMock.mock.calls.filter((call) => call[0] === 'p-1').length)
        .toBe(overviewCallsForP1Before + 1)
    })
    expect(overviewMock.mock.calls.filter((call) => call[0] === 'p-2').length)
      .toBe(overviewCallsForP2Before)
  })
})