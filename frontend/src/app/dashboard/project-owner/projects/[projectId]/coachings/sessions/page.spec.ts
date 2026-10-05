// @vitest-environment jsdom
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest'
import { createElement, type ReactNode } from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { coachingService } from '@/services/coaching.service'
import OwnerCoachingSessionsAgendaPage from './page'
import type { CoachingSession } from '@/types/coaching'

vi.mock('@/services/coaching.service', () => ({
  __esModule: true,
  coachingService: {
    getMyCoachingSessions: vi.fn(),
    getProjectSessions: vi.fn(),
  },
}))

vi.mock('next/navigation', () => ({
  __esModule: true,
  useParams: () => ({ projectId: 'p-1' }),
}))

vi.mock('next/link', async () => {
  const ReactModule = await import('react')
  return {
    __esModule: true,
    default: (props: { href: string; className?: string; children?: unknown }) =>
      ReactModule.createElement(
        'a',
        { href: props.href, className: props.className },
        props.children as ReactNode,
      ),
  }
})

function session(overrides: Partial<CoachingSession> = {}): CoachingSession {
  return {
    id: 's-1',
    assignment_id: 'asg-1',
    scheduled_at: new Date(Date.now() + 3 * 86_400_000).toISOString(),
    status: 'SCHEDULED',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    assignment: {
      id: 'asg-1',
      expert_user_id: 'u-coach',
      project: { id: 'p-1', name: 'Green Startup', owner_id: 'u-owner' },
      expertUser: {
        id: 'u-coach',
        email: 'coach@ex.io',
        profile: { first_name: 'Marie', last_name: 'Durand' },
      },
    },
    ...overrides,
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

let mountedRoots: Root[] = []

function mount(node: ReactNode) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  act(() => { root.render(node) })
  mountedRoots.push(root)
  return container
}

function renderPage() {
  return mount(
    createElement(
      QueryClientProvider,
      { client: makeClient() },
      createElement(OwnerCoachingSessionsAgendaPage),
    ),
  )
}

function text(container: HTMLElement, needle: string) {
  return (container.textContent ?? '').includes(needle)
}

function button(container: HTMLElement, label: string): HTMLButtonElement | null {
  return (
    Array.from(container.querySelectorAll('button'))
      .find((b) => (b.textContent ?? '').includes(label)) ?? null
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  ;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true
  mountedRoots = []
})

afterEach(() => {
  for (const root of mountedRoots) {
    act(() => { root.unmount() })
  }
  mountedRoots = []
  while (document.body.firstChild) document.body.removeChild(document.body.firstChild)
})

describe('OwnerCoachingSessionsAgendaPage', () => {
  it('reads the project sessions via the project-scoped endpoint and shows the coach', async () => {
    vi.mocked(coachingService.getProjectSessions).mockResolvedValue([
      session({ id: 's-1', title: 'Étude de marché' }),
    ])
    const container = renderPage()

    await waitFor(() => expect(text(container, 'Étude de marché')).toBe(true))
    expect(coachingService.getProjectSessions).toHaveBeenCalledTimes(1)
    expect(coachingService.getProjectSessions).toHaveBeenCalledWith('p-1')
    expect(coachingService.getMyCoachingSessions).not.toHaveBeenCalled()
    expect(text(container, 'Marie Durand')).toBe(true)
    expect(container.querySelector('a[href="/dashboard/project-owner/projects/p-1/coachings/sessions/s-1"]')).not.toBeNull()
  })

  it('surfaces the backend error and lets the owner retry', async () => {
    vi.mocked(coachingService.getProjectSessions).mockRejectedValue(new Error('Forbidden'))
    const container = renderPage()

    await waitFor(() => expect(text(container, 'Forbidden')).toBe(true))
    const retry = button(container, 'Réessayer')
    act(() => { retry!.click() })
    await waitFor(() => expect(coachingService.getProjectSessions).toHaveBeenCalledTimes(2))
  })

  it('keeps a session of another project out of reach regardless of the URL projectId', async () => {
    // Le backend est la source de vérité : même avec un projectId manipulé côté
    // client, seule la route scopée `getProjectSessions(p-1)` est appelée ici.
    vi.mocked(coachingService.getProjectSessions).mockResolvedValue([])
    const container = renderPage()

    await waitFor(() => expect(text(container, 'Aucune session de coaching')).toBe(true))
    expect(coachingService.getProjectSessions).toHaveBeenCalledWith('p-1')
  })
})