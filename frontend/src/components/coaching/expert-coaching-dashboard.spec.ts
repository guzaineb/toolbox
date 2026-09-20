// @vitest-environment jsdom
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest'
import { createElement, type ReactNode } from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { ExpertCoachingDashboard } from './ExpertCoachingDashboard'
import type { ActionEvidence, CoachingAction, CoachingSession } from '@/types/coaching'

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

const TODAY = new Date(2026, 0, 15)

function session(overrides: Partial<CoachingSession> = {}): CoachingSession {
  return {
    id: 's-1',
    assignment_id: 'asg-1',
    scheduled_at: new Date(TODAY.getTime() + 3 * 86_400_000).toISOString(),
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

function evidence(overrides: Partial<ActionEvidence> = {}): ActionEvidence {
  return {
    id: 'ev-1',
    action_id: 'a-3',
    type: 'RESULT',
    title: 'Résultats enquête',
    content: '10 interviews clients réalisées.',
    review_status: 'PENDING',
    submitted_by: 'u-owner',
    created_at: '2026-01-12T00:00:00.000Z',
    updated_at: '2026-01-12T00:00:00.000Z',
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

function renderDashboard(props: React.ComponentProps<typeof ExpertCoachingDashboard>) {
  return mount(createElement(ExpertCoachingDashboard, props))
}

function text(container: HTMLElement, needle: string) {
  return (container.textContent ?? '').includes(needle)
}

/** Bouton dont le texte exact (avec ses compteurs) correspond. */
function button(container: HTMLElement, label: string): HTMLButtonElement | null {
  return (
    Array.from(container.querySelectorAll('button'))
      .find((b) => (b.textContent ?? '').trim() === label) ?? null
  )
}

function click(container: HTMLElement, label: string) {
  const el = button(container, label)
  if (!el) throw new Error(`Bouton introuvable : ${label}`)
  act(() => { el.click() })
}

beforeEach(() => {
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

describe('ExpertCoachingDashboard', () => {
  it('squelette de chargement pendant le fetch', () => {
    const container = renderDashboard({
      sessions: [], actions: [], pendingEvidences: [], isLoading: true, today: TODAY,
    })
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull()
    expect(text(container, 'Chargement de votre tableau de coaching…')).toBe(true)
  })

  it('affiche l’erreur de chargement et permet de réessayer', () => {
    let retried = 0
    const container = renderDashboard({
      sessions: [], actions: [], pendingEvidences: [],
      error: new Error('Forbidden'), onRetry: () => { retried += 1 }, today: TODAY,
    })
    expect(text(container, 'Forbidden')).toBe(true)
    click(container, 'Réessayer')
    expect(retried).toBe(1)
  })

  it('état vide avec appel à l’action vers les cohortes de coaching', () => {
    const container = renderDashboard({ sessions: [], actions: [], pendingEvidences: [], today: TODAY })
    expect(text(container, 'Aucune activité de coaching')).toBe(true)
    expect(container.querySelector('a[href="/dashboard/expert/coachings"]')).not.toBeNull()
  })

  it('catégorise les sessions (à venir / du jour / en retard) avec compteurs et liens', () => {
    const sessions = [
      session({ id: 's-up', title: 'Session pivot', scheduled_at: '2026-01-18T10:00:00.000Z' }),
      session({ id: 's-day', title: 'Session du jour', scheduled_at: '2026-01-15T09:00:00.000Z' }),
      session({ id: 's-late', title: 'Session en retard', scheduled_at: '2026-01-10T09:00:00.000Z' }),
      session({ id: 's-done', title: 'Session passée', scheduled_at: '2026-01-08T09:00:00.000Z', status: 'COMPLETED' }),
    ]
    const container = renderDashboard({ sessions, actions: [], pendingEvidences: [], today: TODAY })

    // Filtre par défaut « À venir » : inclut aujourd'hui, exclut passé/terminées.
    expect(text(container, 'Session pivot')).toBe(true)
    expect(text(container, 'Session du jour')).toBe(true)
    expect(text(container, 'Session en retard')).toBe(false)
    expect(text(container, 'Session passée')).toBe(false)
    expect(container.querySelector('a[href="/dashboard/expert/coaching/p-1/sessions/s-up"]')).not.toBeNull()
    expect(container.querySelector('a[href="/dashboard/expert/coaching/p-1/sessions/s-day"]')).not.toBeNull()
    expect(container.querySelector('a[href="/dashboard/expert/coaching/p-1/sessions/s-late"]')).toBeNull()

    // Compteurs réels dans les pastilles.
    expect(text(container, 'À venir 2')).toBe(true)
    expect(text(container, 'Du jour 1')).toBe(true)
    expect(text(container, 'En retard 1')).toBe(true)
    expect(text(container, 'Toutes 4')).toBe(true)

    click(container, 'Du jour 1')
    expect(text(container, 'Session du jour')).toBe(true)
    expect(text(container, 'Session pivot')).toBe(false)

    click(container, 'En retard 1')
    expect(text(container, 'Session en retard')).toBe(true)
    expect(container.querySelector('a[href="/dashboard/expert/coaching/p-1/sessions/s-late"]')).not.toBeNull()

    click(container, 'Toutes 4')
    expect(text(container, 'Session passée')).toBe(true)
  })

  it('présente les actions en cours avec priorité, échéance, projet et lien vers l’onglet actions', () => {
    const actions = [
      action({ id: 'a-1', title: 'Interviews clients', status: 'PENDING', priority: 'HIGH', deadline: '2026-01-20T00:00:00.000Z' }),
      action({ id: 'a-2', title: 'Préparer le pitch', status: 'IN_PROGRESS', priority: 'MEDIUM', deadline: '2026-01-18T00:00:00.000Z' }),
      action({ id: 'a-5', title: 'Action en retard échéance passée', status: 'PENDING', priority: 'MEDIUM', deadline: '2026-01-10T00:00:00.000Z' }),
      action({ id: 'a-4', title: 'Ancienne action', status: 'COMPLETED', priority: 'LOW' }),
    ]
    const container = renderDashboard({ sessions: [], actions, pendingEvidences: [], today: TODAY })

    // Filtre par défaut « À traiter » : uniquement PENDING, priorité puis échéance.
    expect(text(container, 'Interviews clients')).toBe(true)
    expect(text(container, 'Action en retard échéance passée')).toBe(true)
    expect(text(container, 'Préparer le pitch')).toBe(false)
    expect(text(container, 'Ancienne action')).toBe(false)
    expect(text(container, 'À traiter 2')).toBe(true)

    const highCard = container.querySelector('a[href="/dashboard/expert/coaching/p-1?tab=actions"][aria-label^="Interviews clients"]')
    expect(highCard?.textContent ?? '').toContain('Haute')
    expect(highCard?.textContent ?? '').not.toContain('En retard')

    const lateCard = container.querySelector('a[href="/dashboard/expert/coaching/p-1?tab=actions"][aria-label^="Action en retard échéance passée"]')
    expect(lateCard?.textContent ?? '').toContain('En retard')
    expect((container.textContent ?? '').indexOf('Interviews clients'))
      .toBeLessThan((container.textContent ?? '').indexOf('Action en retard échéance passée'))

    click(container, 'En retard 1')
    expect(text(container, 'Action en retard échéance passée')).toBe(true)
    expect(text(container, 'Interviews clients')).toBe(false)
  })

  it('liste les actions soumises à validation', () => {
    const actions = [
      action({ id: 'a-3', title: 'Envoyer le dossier', status: 'SUBMITTED', priority: 'LOW' }),
    ]
    const container = renderDashboard({ sessions: [], actions, pendingEvidences: [], today: TODAY })

    expect(text(container, 'À valider 1')).toBe(true)
    click(container, 'À valider 1')
    expect(text(container, 'Envoyer le dossier')).toBe(true)
  })

  it('affiche les preuves à valider avec ouverture vers la revue existante', () => {
    const submitted = action({ id: 'a-3', title: 'Envoyer le dossier', status: 'SUBMITTED', priority: 'LOW' })
    const pending = [{ evidence: evidence(), action: submitted }]
    const container = renderDashboard({
      sessions: [], actions: [submitted], pendingEvidences: pending, today: TODAY,
    })

    expect(text(container, 'Preuves à valider (1)')).toBe(true)
    expect(text(container, 'Résultats enquête')).toBe(true)
    expect(text(container, 'Ouvrir la revue')).toBe(true)
    expect(container.querySelector('a[href="/dashboard/expert/coaching/p-1?tab=actions"]')).not.toBeNull()
  })

  it('gère les états de chargement et d’erreur des preuves sans casser le reste', () => {
    const submitted = action({ id: 'a-3', title: 'Envoyer le dossier', status: 'SUBMITTED', priority: 'LOW' })

    const loading = renderDashboard({
      sessions: [], actions: [submitted], pendingEvidences: [], evidenceLoading: true, today: TODAY,
    })
    expect(text(loading, 'Chargement des preuves…')).toBe(true)

    const empty = renderDashboard({ sessions: [], actions: [submitted], pendingEvidences: [], today: TODAY })
    expect(text(empty, 'Aucune preuve en attente de validation.')).toBe(true)

    const failed = renderDashboard({
      sessions: [], actions: [submitted], pendingEvidences: [], evidenceError: true, today: TODAY,
    })
    expect(text(failed, 'Impossible de charger certaines preuves.')).toBe(true)
  })

  it('indique l’absence de preuves quand aucune action n’est soumise', () => {
    const container = renderDashboard({
      sessions: [],
      actions: [action({ id: 'a-1', status: 'PENDING', title: 'Interviews clients' })],
      pendingEvidences: [],
      today: TODAY,
    })
    expect(text(container, 'Aucune preuve à valider')).toBe(true)
  })
})