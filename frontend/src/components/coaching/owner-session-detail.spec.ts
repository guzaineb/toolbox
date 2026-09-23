// @vitest-environment jsdom
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest'
import { createElement, type ReactNode } from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { coachingService } from '@/services/coaching.service'
import { gbmService } from '@/services/gbm.service'
import { OwnerSessionDetail } from '@/components/coaching/OwnerSessionDetail'
import type { CoachingAction, CoachingComment, CoachingRecommendation, CoachingSession, SessionBlocker } from '@/types/coaching'

vi.mock('@/services/coaching.service', () => ({
  __esModule: true,
  coachingService: {
    getProjectCoachingOverview: vi.fn(),
    getSession: vi.fn(),
    getProjectSessions: vi.fn(),
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

vi.mock('@/services/gbm.service', () => ({
  __esModule: true,
  gbmService: { getProgress: vi.fn() },
}))

vi.mock('next/link', async () => {
  const ReactModule = await import('react')
  return {
    __esModule: true,
    default: (props: { href: string; className?: string; children?: unknown }) =>
      ReactModule.createElement(
        'a',
        { href: props.href, className: props.className },
        props.children as import('react').ReactNode,
      ),
  }
})

function action(overrides: Partial<CoachingAction> = {}): CoachingAction {
  return {
    id: 'a-1',
    project_id: 'p-1',
    created_by: 'u-coach',
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-10T00:00:00.000Z',
    title: 'Réaliser 10 interviews clients',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    description: 'Interroger les premiers utilisateurs.',
    deadline: '2026-09-25T00:00:00.000Z',
    ...overrides,
  }
}

function recommendation(overrides: Partial<CoachingRecommendation> = {}): CoachingRecommendation {
  return {
    id: 'r-1',
    project_id: 'p-1',
    session_id: 's-1',
    content: 'Tester la vente directe auprès de 20 clients potentiels.',
    priority: 'MEDIUM',
    status: 'OPEN',
    source: 'COACH',
    author_id: 'u-coach',
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
    ...overrides,
  }
}

function comment(overrides: Partial<CoachingComment> = {}): CoachingComment {
  return {
    id: 'c-1',
    content: 'Bonne dynamique, à consolider la semaine prochaine.',
    author_id: 'u-coach',
    session_id: 's-1',
    created_at: '2026-09-10T11:00:00.000Z',
    author: { id: 'u-coach', email: 'coach@ex.io', profile: { first_name: 'Marie', last_name: 'Durand' } },
    ...overrides,
  }
}

function blocker(id: string, title: string, resolved: boolean): SessionBlocker {
  return { id, title, resolved, ...(resolved ? { resolvedAt: '2026-09-01T00:00:00.000Z' } : {}) }
}

function session(overrides: Partial<CoachingSession> = {}): CoachingSession {
  return {
    id: 's-1',
    assignment_id: 'as-1',
    title: 'Étude de marché',
    objective: 'Valider les segments clients',
    scheduled_at: '2026-09-10T09:00:00.000Z',
    duration_minutes: 60,
    session_type: 'Suivi',
    status: 'COMPLETED',
    notes: 'Le porteur partage les premiers retours terrain.',
    findings: "Le canal web n'est pas encore validé par des données.",
    topics_discussed: 'Segments clients\nProposition de valeur',
    blockers: [
      blocker('b-1', 'Données marché manquantes', false),
      blocker('b-2', 'Financement différé', true),
    ],
    decisions: 'Le porteur réalisera 10 interviews avant la prochaine session.',
    summary: 'La proposition de valeur gagne en clarté.',
    next_objectives: 'Vérifier les résultats des interviews',
    objective_result: 'PARTIALLY_ACHIEVED',
    objective_result_reason: 'Il reste à consolider les données terrain.',
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-10T12:00:00.000Z',
    assignment: {
      id: 'as-1',
      expert_user_id: 'u-coach',
      project: { id: 'p-1', name: 'TerraCycle', owner_id: 'u-owner' },
      expertUser: { id: 'u-coach', email: 'coach@ex.io', profile: { first_name: 'Marie', last_name: 'Durand' } },
    },
    actions: [action()],
    recommendations: [recommendation()],
    ...overrides,
  }
}

function makeClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

let mountedRoots: Root[] = []

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

function renderDetail(sessionId = 's-1') {
  const { root, container } = mount(
    createElement(
      QueryClientProvider,
      { client: makeClient() },
      createElement(OwnerSessionDetail, {
        projectId: 'p-1',
        sessionId,
        backToCoachingHref: '/dashboard/project-owner/projects/p-1/coachings',
      }),
    ),
  )
  mountedRoots.push(root)
  return container
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

function linkByHref(container: HTMLElement, href: string): HTMLAnchorElement | null {
  return (
    Array.from(container.querySelectorAll('a')).find((a) => a.getAttribute('href') === href) ?? null
  )
}

function click(el: HTMLElement | null) {
  if (!el) throw new Error('Element not found')
  act(() => { el.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}

function setValue(el: HTMLInputElement | HTMLSelectElement, value: string) {
  act(() => {
    const proto = el instanceof HTMLSelectElement
      ? HTMLSelectElement.prototype
      : HTMLInputElement.prototype
    Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(el, value)
    el.dispatchEvent(new Event(el instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }))
  })
}

describe('OwnerSessionDetail', () => {
  const progress = {
    total: 24,
    completed: 8,
    inProgress: 3,
    blocked: 0,
    notStarted: 13,
    percentage: 33,
    phases: [{ phase: 1, total: 6, completed: 4, percentage: 66 }],
    steps: [
      { step_key: 'gbm_1', status: 'COMPLETED' as const },
      { step_key: 'gbm_2', status: 'IN_PROGRESS' as const },
    ],
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true
    mountedRoots = []
    vi.mocked(coachingService.getSessionComments).mockResolvedValue([])
    vi.mocked(coachingService.getEvidences).mockResolvedValue([])
    vi.mocked(gbmService.getProgress).mockResolvedValue(progress)
  })

  afterEach(() => {
    for (const root of mountedRoots) {
      act(() => { root.unmount() })
    }
    while (document.body.firstChild) document.body.removeChild(document.body.firstChild)
  })

  it('renders the full session content in a read-only owner view', async () => {
    vi.mocked(coachingService.getSession).mockResolvedValue(session())
    const container = renderDetail()

    await waitFor(() => expect(text(container, 'Étude de marché')).toBe(true))
    expect(text(container, 'Terminée')).toBe(true)
    expect(text(container, 'Marie Durand')).toBe(true) // coach
    expect(text(container, 'Valider les segments clients')).toBe(true) // objectif
    expect(text(container, 'Segments clients')).toBe(true) // sujets discutés
    expect(text(container, 'Le porteur partage les premiers retours terrain.')).toBe(true)
    expect(text(container, "Le canal web n'est pas encore validé par des données.")).toBe(true)
    expect(text(container, 'Données marché manquantes')).toBe(true)
    expect(text(container, 'Résolu')).toBe(true)
    expect(text(container, 'Le porteur réalisera 10 interviews avant la prochaine session.')).toBe(true)
    expect(text(container, 'Partiellement atteint')).toBe(true)
    expect(text(container, 'La proposition de valeur gagne en clarté.')).toBe(true)
    expect(text(container, 'Tester la vente directe auprès de 20 clients potentiels.')).toBe(true)
    expect(text(container, 'Réaliser 10 interviews clients')).toBe(true)
    expect(text(container, '33%')).toBe(true) // progression globale
    expect(text(container, 'Retour au suivi coaching')).toBe(true)
    expect(linkByHref(container, '/dashboard/project-owner/projects/p-1/coachings')).not.toBeNull()
  })

  it('shows dedicated empty states for a session without actions, recommendations or summary', async () => {
    vi.mocked(coachingService.getSession).mockResolvedValue(
      session({
        actions: [],
        recommendations: [],
        summary: undefined,
        next_objectives: undefined,
        blockers: [],
        topics_discussed: '',
        decisions: '',
        objective_result: null,
        objective_result_reason: null,
      }),
    )
    const container = renderDetail()

    await waitFor(() => expect(text(container, 'Aucune action liée à cette session.')).toBe(true))
    expect(text(container, 'Aucune recommandation rattachée à cette session.')).toBe(true)
    expect(text(container, 'Aucun résumé disponible pour cette session.')).toBe(true)
    expect(text(container, 'Aucun blocage identifié pour cette session.')).toBe(true)
    expect(text(container, 'Aucune décision enregistrée pour cette session.')).toBe(true)
    expect(text(container, 'Non renseigné à la clôture.')).toBe(true)
  })

  it('shows an explicit 403 message when access is forbidden', async () => {
    vi.mocked(coachingService.getSession).mockRejectedValue({
      response: { status: 403, data: { message: 'Accès refusé' } },
    })
    const container = renderDetail()

    await waitFor(() =>
      expect(text(container, 'Accès non autorisé : vous ne pouvez pas consulter cette session.')).toBe(true),
    )
  })

  it('reports a missing session when the query resolves nothing', async () => {
    vi.mocked(coachingService.getSession).mockResolvedValue(null as unknown as CoachingSession)
    const container = renderDetail()

    await waitFor(() => expect(text(container, 'Session introuvable')).toBe(true))
  })

  it('shows a loading state while the session is being fetched', async () => {
    let resolveSession: (value: CoachingSession) => void = () => undefined
    vi.mocked(coachingService.getSession).mockImplementation(
      () => new Promise((resolve) => { resolveSession = resolve }),
    )
    const container = renderDetail()

    expect(text(container, 'Chargement de la session…')).toBe(true)

    act(() => resolveSession(session()))
    await waitFor(() => expect(text(container, 'Étude de marché')).toBe(true))
  })

  it('exposes owner proof-of-work on session actions, with no review controls', async () => {
    vi.mocked(coachingService.getSession).mockResolvedValue(session())
    const container = renderDetail()

    await waitFor(() => expect(text(container, 'Réaliser 10 interviews clients')).toBe(true))

    const status = container.querySelector('select')
    expect(status).not.toBeNull()
    expect(Array.from(status!.querySelectorAll('option')).map((o) => o.value))
      .toEqual(['PENDING', 'IN_PROGRESS', 'SUBMITTED'])
    expect(button(container, 'Accepter')).toBeNull()
    expect(button(container, 'Refuser')).toBeNull()

    click(button(container, 'Preuves'))
    await waitFor(() => expect(button(container, 'Soumettre une preuve')).not.toBeNull())
    expect(vi.mocked(coachingService.getEvidences)).toHaveBeenCalledWith('a-1')
  })

  it('links actions that reference a GBM deliverable to the existing GBM module only', async () => {
    vi.mocked(coachingService.getSession).mockResolvedValue(
      session({
        actions: [
          action({ id: 'a-1', related_document_key: 'customer_segments' }),
          action({ id: 'a-2', title: 'Préparer le plan financier', related_document_key: 'financial_plan' }),
        ],
      }),
    )
    const container = renderDetail()

    await waitFor(() => expect(text(container, 'Préparer le plan financier')).toBe(true))

    const gbmLink = linkByHref(container, '/dashboard/project-owner/projects/p-1/gbm?step=gbm_8')
    expect(gbmLink).not.toBeNull()
    expect(text(container, 'Étape 8 — Segments de clientèle')).toBe(true)
    // Le livrable non-GBM ne produit aucune redirection.
    expect(linkByHref(container, '/dashboard/project-owner/projects/p-1/gbm?step=gbm_18')).toBeNull()
  })

  it('renders session comments and lets the owner post a new one', async () => {
    vi.mocked(coachingService.getSession).mockResolvedValue(session())
    vi.mocked(coachingService.getSessionComments).mockResolvedValue([comment()])
    const addSessionCommentMock = vi.mocked(coachingService.addSessionComment)
      .mockResolvedValue(comment({ id: 'c-2', content: 'Merci coach !', author_id: 'u-owner' }))
    const container = renderDetail()

    await waitFor(() => expect(text(container, 'Bonne dynamique, à consolider la semaine prochaine.')).toBe(true))
    expect(text(container, 'Marie Durand')).toBe(true) // auteur du commentaire

    setValue(container.querySelector('input[placeholder="Ajouter un commentaire…"]') as HTMLInputElement, 'Merci coach !')
    click(button(container, 'Envoyer'))
    await waitFor(() => expect(addSessionCommentMock).toHaveBeenCalledWith('s-1', { content: 'Merci coach !' }))
  })
})