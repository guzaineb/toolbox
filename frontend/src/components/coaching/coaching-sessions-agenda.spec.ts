// @vitest-environment jsdom
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import { createElement, type ReactNode } from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { SessionStatusBadge } from '@/components/coaching/SessionStatusBadge'
import { SessionCalendarItem } from '@/components/coaching/SessionCalendarItem'
import { NextSessionPanel, pickNextSession } from '@/components/coaching/NextSessionPanel'
import { getSessionStatusAppearance, SESSION_STATUS_LEGEND } from '@/components/coaching/session-status-ui'
import {
  CoachingSessionsAgenda,
  agendaDayLabel,
  buildMonthGrid,
  buildWeekDays,
  dayKey,
  groupByDay,
  startOfWeek,
} from '@/components/coaching/CoachingSessionsAgenda'
import { COACHING_SESSION_STATUS_LABELS } from '@/types/coaching'
import type { CoachingSession, CoachingSessionStatus } from '@/types/coaching'

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
    scheduled_at: new Date(2026, 8, 15, 9, 0).toISOString(),
    status: 'SCHEDULED',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
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

afterEach(() => {
  for (const root of mountedRoots) {
    act(() => { root.unmount() })
  }
  mountedRoots = []
  while (document.body.firstChild) document.body.removeChild(document.body.firstChild)
})

function text(container: HTMLElement, needle: string) {
  return (container.textContent ?? '').includes(needle)
}

function button(container: HTMLElement, label: string): HTMLButtonElement | null {
  return (
    Array.from(container.querySelectorAll('button'))
      .find((b) => (b.textContent ?? '').includes(label)) ?? null
  )
}

function selectByLabel(container: HTMLElement, label: string): HTMLSelectElement | null {
  return container.querySelector(`select[aria-label="${label}"]`)
}

function changeSelect(select: HTMLSelectElement, value: string) {
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')!.set!.call(select, value)
    select.dispatchEvent(new Event('change', { bubbles: true }))
  })
}

const TODAY = new Date(2026, 8, 15)

beforeEach(() => {
  ;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true
})

describe('agendaDayLabel', () => {
  it('labels today and tomorrow and capitalizes other days', () => {
    expect(agendaDayLabel(new Date(2026, 8, 15), TODAY)).toBe("Aujourd'hui")
    expect(agendaDayLabel(new Date(2026, 8, 16), TODAY)).toBe('Demain')
    const other = agendaDayLabel(new Date(2026, 8, 10), TODAY)
    expect(other.charAt(0)).toBe(other.charAt(0).toUpperCase())
    expect(other).not.toBe("Aujourd'hui")
  })
})

describe('groupByDay', () => {
  it('groups by local date while preserving order', () => {
    const groups = groupByDay([
      session({ id: 'a', scheduled_at: new Date(2026, 8, 15, 9).toISOString() }),
      session({ id: 'b', scheduled_at: new Date(2026, 8, 14, 10).toISOString() }),
      session({ id: 'c', scheduled_at: new Date(2026, 8, 15, 14).toISOString() }),
    ])
    expect(groups.map((g) => g.key)).toEqual([
      dayKey(new Date(2026, 8, 15)),
      dayKey(new Date(2026, 8, 14)),
    ])
    expect(groups[0].sessions.map((s) => s.id)).toEqual(['a', 'c'])
  })
})

describe('SessionStatusBadge', () => {
  it('renders the French label of every session status', () => {
    const statuses = Object.keys(COACHING_SESSION_STATUS_LABELS) as CoachingSessionStatus[]
    for (const status of statuses) {
      const container = mount(createElement(SessionStatusBadge, { status }))
      expect(text(container, COACHING_SESSION_STATUS_LABELS[status])).toBe(true)
    }
  })
})

describe('SessionCalendarItem', () => {
  it('renders title, time, duration and opens the detail page', () => {
    const container = mount(
      createElement(SessionCalendarItem, {
        session: session({ title: 'Étude de marché', duration_minutes: 60 }),
        mode: 'owner',
        href: '/dashboard/project-owner/projects/p-1/coachings/sessions/s-1',
      }),
    )
    expect(text(container, 'Étude de marché')).toBe(true)
    expect(text(container, '09:00')).toBe(true)
    expect(text(container, '60 min')).toBe(true)
    expect(container.querySelector('a[href="/dashboard/project-owner/projects/p-1/coachings/sessions/s-1"]')).not.toBeNull()
  })

  it('falls back to a generic title and shows the coach in owner mode', () => {
    const container = mount(
      createElement(SessionCalendarItem, {
        session: session({
          title: undefined,
          objective: 'Valider les segments clients',
          assignment: {
            id: 'asg-1',
            expert_user_id: 'u-coach',
            expertUser: {
              id: 'u-coach',
              email: 'coach@ex.io',
              profile: { first_name: 'Marie', last_name: 'Durand' },
            },
          },
        }),
        mode: 'owner',
        href: '/owner/detail',
      }),
    )
    expect(text(container, 'Session de coaching')).toBe(true)
    expect(text(container, 'Valider les segments clients')).toBe(true)
    expect(text(container, 'Marie Durand')).toBe(true)
  })

  it('shows the project name in expert mode', () => {
    const container = mount(
      createElement(SessionCalendarItem, {
        session: session({
          assignment: { id: 'asg-1', expert_user_id: 'u-coach', project: { id: 'p-1', name: 'Green Startup', owner_id: 'u-owner' } },
        }),
        mode: 'expert',
        href: '/dashboard/expert/coaching/p-1/sessions/s-1',
      }),
    )
    expect(text(container, 'Green Startup')).toBe(true)
    expect(container.querySelector('a[href="/dashboard/expert/coaching/p-1/sessions/s-1"]')).not.toBeNull()
  })
})

describe('CoachingSessionsAgenda', () => {
  const makeAgenda = (props: Partial<Parameters<typeof CoachingSessionsAgenda>[0]> = {}) => {
    const container = mount(
      createElement(CoachingSessionsAgenda, {
        mode: 'owner',
        sessions: [],
        today: TODAY,
        getSessionHref: (s) => `/detail/${s.id}`,
        ...props,
      }),
    )
    return container
  }

  it('shows a loading state', () => {
    const container = makeAgenda({ sessions: [session()], isLoading: true })
    expect(text(container, 'Chargement des sessions de coaching…')).toBe(true)
  })

  it('shows the error message and retries', () => {
    const onRetry = vi.fn()
    const container = makeAgenda({ sessions: [session()], error: new Error('Forbidden'), onRetry })
    expect(text(container, 'Forbidden')).toBe(true)
    const retry = button(container, 'Réessayer')
    expect(retry).not.toBeNull()
    act(() => { retry!.click() })
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('shows an empty state when there are no sessions', () => {
    const container = makeAgenda({ sessions: [] })
    expect(text(container, 'Aucune session de coaching')).toBe(true)
  })

  it('groups today and upcoming sessions and hides past ones outside the window', () => {
    const container = makeAgenda({
      sessions: [
        session({ id: 'today', scheduled_at: new Date(2026, 8, 15, 9).toISOString() }),
        session({ id: 'upcoming', scheduled_at: new Date(2026, 8, 20, 14).toISOString() }),
        session({ id: 'past', scheduled_at: new Date(2026, 7, 30, 10).toISOString() }),
      ],
    })
    expect(text(container, "Aujourd'hui")).toBe(true)
    expect(text(container, 'À venir (2)')).toBe(true)
    expect(text(container, 'Passées')).toBe(false)
    expect(container.querySelector('a[href="/detail/past"]')).toBeNull()
  })

  it('navigates to the previous period to reveal past sessions', () => {
    const container = makeAgenda({
      sessions: [
        session({ id: 'today', scheduled_at: new Date(2026, 8, 15, 9).toISOString() }),
        session({ id: 'past', scheduled_at: new Date(2026, 8, 1, 10).toISOString() }),
      ],
    })
    expect(text(container, 'Passées (1)')).toBe(false)
    const prev = button(container, 'Précédent')
    act(() => { prev!.click() })
    expect(text(container, 'Passées (1)')).toBe(true)
  })

  it('filters by status', () => {
    const container = makeAgenda({
      sessions: [
        session({ id: 'done', status: 'COMPLETED', scheduled_at: new Date(2026, 8, 15, 9).toISOString() }),
        session({ id: 'planned', status: 'SCHEDULED', scheduled_at: new Date(2026, 8, 20, 14).toISOString() }),
      ],
    })
    const statusSelect = selectByLabel(container, 'Filtrer par statut')
    changeSelect(statusSelect!, 'COMPLETED')
    expect(container.querySelector('a[href="/detail/done"]')).not.toBeNull()
    expect(container.querySelector('a[href="/detail/planned"]')).toBeNull()
    expect(text(container, 'Terminée')).toBe(true)
  })

  it('switching to all dates shows sessions from every period', () => {
    const container = makeAgenda({
      sessions: [
        session({ id: 'today', scheduled_at: new Date(2026, 8, 15, 9).toISOString() }),
        session({ id: 'past', scheduled_at: new Date(2026, 7, 30, 10).toISOString() }),
      ],
    })
    expect(container.querySelector('a[href="/detail/past"]')).toBeNull()
    const periodSelect = selectByLabel(container, 'Période')
    changeSelect(periodSelect!, 'all')
    expect(container.querySelector('a[href="/detail/past"]')).not.toBeNull()
    expect(text(container, 'Passées (1)')).toBe(true)
  })

  it('renders an empty state when the filtered window has no sessions', () => {
    const container = makeAgenda({
      sessions: [
        session({ id: 'future', scheduled_at: new Date(2027, 0, 10, 9).toISOString() }),
      ],
    })
    expect(text(container, 'future')).toBe(false)
    expect(text(container, 'Aucune session entre')).toBe(true)
  })

  it('switches to the month view with weekday headers and today highlighted', () => {
    const container = makeAgenda({
      sessions: [session({ id: 'm-1', title: 'Revue GBM', scheduled_at: new Date(2026, 8, 15, 10).toISOString() })],
    })
    act(() => { button(container, 'Mois')!.click() })
    expect(text(container, 'Lun')).toBe(true)
    expect(text(container, 'Dim')).toBe(true)
    expect(text(container, 'Revue GBM')).toBe(true)
    expect(text(container, "Aujourd'hui")).toBe(true)
    expect(container.querySelector('a[href="/detail/m-1"]')).not.toBeNull()
  })

  it('switches to the week view and shows the week range', () => {
    const container = makeAgenda({
      sessions: [session({ id: 'wk-1', scheduled_at: new Date(2026, 8, 15, 9).toISOString() })],
    })
    act(() => { button(container, 'Semaine')!.click() })
    expect(text(container, 'Semaine du')).toBe(true)
    expect(container.querySelector('a[href="/detail/wk-1"]')).not.toBeNull()
  })

  it('caps the events of a busy day and focuses it in the agenda from +X autres', () => {
    const busy = Array.from({ length: 5 }, (_, i) =>
      session({ id: `b-${i}`, scheduled_at: new Date(2026, 8, 15, 9 + i).toISOString() }),
    )
    const container = makeAgenda({ sessions: busy })
    act(() => { button(container, 'Mois')!.click() })
    expect(text(container, '+2 autres')).toBe(true)
    act(() => { button(container, '+2 autres')!.click() })
    expect(text(container, 'Tout afficher')).toBe(true)
    for (let i = 0; i < 5; i += 1) {
      expect(container.querySelector(`a[href="/detail/b-${i}"]`)).not.toBeNull()
    }
  })

  it('renders the legend with every status label', () => {
    const container = makeAgenda({ sessions: [session()] })
    for (const label of Object.values(COACHING_SESSION_STATUS_LABELS)) {
      expect(text(container, label)).toBe(true)
    }
  })

  it('renders the next session panel with a real upcoming session', () => {
    const container = makeAgenda({
      sessions: [session({ id: 'n-1', title: 'Atelier GBM', scheduled_at: new Date(2026, 8, 20, 14).toISOString() })],
    })
    expect(text(container, 'Prochaine session')).toBe(true)
    expect(text(container, 'Atelier GBM')).toBe(true)
    expect(text(container, 'Voir la session')).toBe(true)
  })

  it('shows a friendly message when no upcoming live session exists', () => {
    const container = makeAgenda({
      sessions: [session({ status: 'COMPLETED', scheduled_at: new Date(2026, 8, 20, 9).toISOString() })],
    })
    expect(text(container, 'aucune session à venir')).toBe(true)
  })

  it('shows a skeleton while loading', () => {
    const container = makeAgenda({ sessions: [], isLoading: true })
    expect(text(container, 'Chargement des sessions de coaching…')).toBe(true)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })
})

describe('calendar grid helpers', () => {
  it('builds a 42-day month grid starting on Monday', () => {
    const grid = buildMonthGrid(new Date(2026, 8, 15))
    expect(grid).toHaveLength(42)
    expect(grid[0].getDay()).toBe(1)
    expect(dayKey(grid[0])).toBe(dayKey(new Date(2026, 7, 31)))
  })

  it('builds a monday-to-sunday week', () => {
    const week = buildWeekDays(new Date(2026, 8, 15))
    expect(week).toHaveLength(7)
    expect(dayKey(week[0])).toBe(dayKey(new Date(2026, 8, 14)))
    expect(dayKey(week[6])).toBe(dayKey(new Date(2026, 8, 20)))
    expect(dayKey(startOfWeek(new Date(2026, 8, 15)))).toBe(dayKey(new Date(2026, 8, 14)))
  })
})

describe('session status UI', () => {
  it('maps every status to a distinct dot/bar/chip and the French label', () => {
    const statuses = Object.keys(COACHING_SESSION_STATUS_LABELS) as CoachingSessionStatus[]
    for (const status of statuses) {
      const appearance = getSessionStatusAppearance(status)
      expect(appearance.label).toBe(COACHING_SESSION_STATUS_LABELS[status])
      expect(appearance.dot.length).toBeGreaterThan(0)
      expect(appearance.bar.length).toBeGreaterThan(0)
      expect(appearance.chip.length).toBeGreaterThan(0)
    }
    expect(new Set(SESSION_STATUS_LEGEND.map((entry) => entry.status))).toEqual(new Set(statuses))
  })
})

describe('pickNextSession', () => {
  it('returns the closest upcoming live session and ignores past or completed ones', () => {
    const now = pickNextSession(
      [
        session({ id: 'past', scheduled_at: new Date(2026, 8, 1, 9).toISOString() }),
        session({ id: 'done', status: 'COMPLETED', scheduled_at: new Date(2026, 8, 15, 8).toISOString() }),
        session({ id: 'today', scheduled_at: new Date(2026, 8, 15, 10).toISOString() }),
        session({ id: 'later', scheduled_at: new Date(2026, 8, 20, 9).toISOString() }),
      ],
      TODAY,
    )
    expect(now?.id).toBe('today')
  })

  it('returns null when nothing is upcoming', () => {
    expect(
      pickNextSession([session({ status: 'COMPLETED', scheduled_at: new Date(2026, 8, 15, 9).toISOString() })], TODAY),
    ).toBeNull()
  })
})

describe('NextSessionPanel', () => {
  it('shows the coach in owner mode and the project in expert mode', () => {
    const base = session({
      assignment: {
        id: 'asg-1',
        expert_user_id: 'u-coach',
        expertUser: {
          id: 'u-coach',
          email: 'coach@ex.io',
          profile: { first_name: 'Marie', last_name: 'Durand' },
        },
        project: { id: 'p-1', name: 'Green Startup', owner_id: 'u-owner' },
      },
    })
    const owner = mount(
      createElement(NextSessionPanel, {
        sessions: [base],
        mode: 'owner',
        getSessionHref: (s) => `/detail/${s.id}`,
        today: TODAY,
      }),
    )
    expect(text(owner, 'Marie Durand')).toBe(true)
    expect(text(owner, 'Voir la session')).toBe(true)

    const expert = mount(
      createElement(NextSessionPanel, {
        sessions: [base],
        mode: 'expert',
        getSessionHref: (s) => `/detail/${s.id}`,
        today: TODAY,
      }),
    )
    expect(text(expert, 'Green Startup')).toBe(true)
  })
})