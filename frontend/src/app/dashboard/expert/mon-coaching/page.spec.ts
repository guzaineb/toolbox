// @vitest-environment jsdom
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest'
import { createElement, type ReactNode } from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { coachingService } from '@/services/coaching.service'
import ExpertMonCoachingPage from './page'
import type { CoachingAction, CoachingSession } from '@/types/coaching'

vi.mock('@/services/coaching.service', () => ({
  __esModule: true,
  coachingService: {
    getMyCoachingSessions: vi.fn(),
    getMyCoachingActions: vi.fn(),
    getProjectSessions: vi.fn(),
    getProjectActions: vi.fn(),
    getEvidences: vi.fn(),
  },
}))

vi.mock('next/link', async () => {
  const ReactModule = await import('react')
  return {
    __esModule: true,
    default: (props: { href: string; className?: string; 'aria-label'?: string; children?: unknown }) =>
      ReactModule.createElement(
        'a',
        { href: props.href, className: props.className, 'aria-label': props['aria-label'] },
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
    },
    ...overrides,
  }
}

function action(overrides: Partial<CoachingAction> = {}): CoachingAction {
  return {
    id: 'a-1',
    project_id: 'p-1',
    title: 'Réaliser 10 interviews',
    status: 'PENDING',
    priority: 'MEDIUM',
    created_by: 'u-coach',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    project: { id: 'p-1', name: 'Green Startup' },
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
      createElement(ExpertMonCoachingPage),
    ),
  )
}

function text(container: HTMLElement, needle: string) {
  return (container.textContent ?? '').includes(needle)
}

function button(container: HTMLElement, label: string): HTMLButtonElement | null {
  return (
    Array.from(container.querySelectorAll('button'))
      .find((b) => (b.textContent ?? '').trim() === label) ?? null
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

describe('ExpertMonCoachingPage', () => {
  it('charge sessions et actions du coach connecté et ouvre les onglets existants', async () => {
    vi.mocked(coachingService.getMyCoachingSessions).mockResolvedValue([
      session({ id: 's-1', title: 'Session pivot' }),
    ])
    vi.mocked(coachingService.getMyCoachingActions).mockResolvedValue([
      action({ id: 'a-1', title: 'Interviews clients' }),
    ])
    const container = renderPage()

    await waitFor(() => expect(text(container, 'Green Startup')).toBe(true))
    expect(text(container, 'Mon coaching')).toBe(true)
    expect(text(container, 'Session pivot')).toBe(true)
    expect(text(container, 'Interviews clients')).toBe(true)
    expect(coachingService.getMyCoachingSessions).toHaveBeenCalledTimes(1)
    expect(coachingService.getMyCoachingActions).toHaveBeenCalledTimes(1)
    expect(coachingService.getProjectSessions).not.toHaveBeenCalled()
    expect(coachingService.getProjectActions).not.toHaveBeenCalled()
    expect(container.querySelector('a[href="/dashboard/expert/coaching/p-1/sessions/s-1"]')).not.toBeNull()
    expect(container.querySelector('a[href="/dashboard/expert/coaching/p-1?tab=actions"]')).not.toBeNull()
  })

  it('surfaces une erreur backend et permet de réessayer les deux requêtes', async () => {
    vi.mocked(coachingService.getMyCoachingSessions).mockResolvedValue([
      session({ id: 's-1', title: 'Session pivot' }),
    ])
    vi.mocked(coachingService.getMyCoachingActions).mockRejectedValue(new Error('Forbidden'))
    const container = renderPage()

    await waitFor(() => expect(text(container, 'Forbidden')).toBe(true))
    const retry = button(container, 'Réessayer')
    act(() => { retry!.click() })

    await waitFor(() => expect(coachingService.getMyCoachingActions).toHaveBeenCalledTimes(2))
    expect(coachingService.getMyCoachingSessions).toHaveBeenCalledTimes(2)
  })
})