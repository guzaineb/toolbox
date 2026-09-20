// @vitest-environment jsdom
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest'
import { createElement, type ReactNode } from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { coachingService } from '@/services/coaching.service'
import { ActionRow } from '@/components/coaching/ActionRow'
import type { ActionEvidence, CoachingAction } from '@/types/coaching'

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

const PAST = '2026-01-01T00:00:00.000Z'
const FUTURE = new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString()

function action(overrides: Partial<CoachingAction> = {}): CoachingAction {
  return {
    id: 'a-1',
    project_id: 'p-1',
    created_by: 'u-1',
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
    title: 'Réaliser 10 interviews clients',
    status: 'PENDING',
    priority: 'HIGH',
    description: 'Interroger les premiers utilisateurs.',
    deadline: FUTURE,
    objective: { id: 'obj-1', title: 'Lancer le MVP' },
    ...overrides,
  }
}

function evidence(overrides: Partial<ActionEvidence> = {}): ActionEvidence {
  return {
    id: 'ev-1',
    action_id: 'a-1',
    type: 'LINK',
    title: 'Enquête résultats',
    url: 'https://ex.io/result',
    review_status: 'PENDING',
    submitted_by: 'owner-1',
    created_at: '2026-09-05T00:00:00.000Z',
    updated_at: '2026-09-05T00:00:00.000Z',
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

function renderAction(
  client: QueryClient,
  action: CoachingAction,
  mode: 'owner' | 'coach',
  canManage: boolean,
  documentTitle?: string,
) {
  const { root, container } = mount(
    createElement(
      QueryClientProvider,
      { client },
      createElement(ActionRow, { action, mode, canManage, documentTitle }),
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

function select(container: HTMLElement): HTMLSelectElement | null {
  return container.querySelector('select')
}

function click(el: HTMLElement | null) {
  if (!el) throw new Error('Element not found')
  act(() => { el.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}

function setValue(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string) {
  act(() => {
    const proto = el instanceof HTMLSelectElement
      ? HTMLSelectElement.prototype
      : el instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype
    Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(el, value)
    el.dispatchEvent(new Event(el instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }))
  })
}

describe('ActionRow', () => {
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

  it('owner mode exposes proof-of-work controls and never reveals review actions', async () => {
    const getEvidencesMock = vi.mocked(coachingService.getEvidences)
    getEvidencesMock.mockResolvedValue([])
    const container = renderAction(makeClient(), action(), 'owner', false)

    expect(text(container, 'Réaliser 10 interviews clients')).toBe(true)
    expect(text(container, 'Haute')).toBe(true)
    expect(text(container, 'En attente')).toBe(true)
    expect(text(container, 'Objectif lié :')).toBe(true)

    // Le porteur ne peut poser que PENDING / IN_PROGRESS / SUBMITTED.
    const status = select(container)
    expect(status).not.toBeNull()
    expect(Array.from(status!.querySelectorAll('option')).map((o) => o.value))
      .toEqual(['PENDING', 'IN_PROGRESS', 'SUBMITTED'])

    // Jamais de revue côté porteur.
    expect(button(container, 'Accepter')).toBeNull()
    expect(button(container, 'Refuser')).toBeNull()

    click(button(container, 'Preuves'))
    await waitFor(() => expect(getEvidencesMock).toHaveBeenCalledWith('a-1'))
    expect(text(container, 'Aucune preuve pour le moment.')).toBe(true)
    expect(button(container, 'Soumettre une preuve')).not.toBeNull()
  })

  it('coach mode offers the full arbitrable status set and never lets submission pass', async () => {
    vi.mocked(coachingService.getEvidences).mockResolvedValue([evidence()])
    const updateActionMock = vi.mocked(coachingService.updateAction)
      .mockResolvedValue(action({ status: 'SUBMITTED' }))
    const container = renderAction(makeClient(), action(), 'coach', true)

    // OVERDUE est piloté par le scheduler : jamais proposé à la saisie.
    const status = select(container)
    expect(status).not.toBeNull()
    expect(Array.from(status!.querySelectorAll('option')).map((o) => o.value))
      .toEqual(['PENDING', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED', 'REJECTED', 'CANCELLED'])
    expect(status!.querySelector('[value="OVERDUE"]')).toBeNull()

    // Le coach ne soumet jamais de preuve (rôle inverse du porteur).
    expect(button(container, 'Soumettre une preuve')).toBeNull()

    setValue(status!, 'SUBMITTED')
    await waitFor(() => expect(updateActionMock).toHaveBeenCalledWith('a-1', { status: 'SUBMITTED' }))
  })

  it('keeps SUBMITTED actionable for both roles without mixing permissions', async () => {
    vi.mocked(coachingService.getEvidences).mockResolvedValue([evidence({ review_status: 'PENDING' })])

    // Porteur : il peut encore joindre une preuve, jamais valider.
    const owner = renderAction(makeClient(), action({ status: 'SUBMITTED' }), 'owner', false)
    expect(text(owner, 'À valider')).toBe(true)
    click(button(owner, 'Preuves'))
    await waitFor(() => expect(button(owner, 'Soumettre une preuve')).not.toBeNull())
    expect(button(owner, 'Accepter')).toBeNull()
    expect(button(owner, 'Refuser')).toBeNull()

    // Coach : il valide la preuve, jamais il ne participe à sa soumission.
    const coach = renderAction(makeClient(), action({ status: 'SUBMITTED' }), 'coach', true)
    click(button(coach, 'Preuves'))
    await waitFor(() => expect(button(coach, 'Accepter')).not.toBeNull())
    expect(button(coach, 'Refuser')).not.toBeNull()
    expect(button(coach, 'Soumettre une preuve')).toBeNull()
  })

  it('renders submitted evidence and approves it with an optional comment', async () => {
    vi.mocked(coachingService.getEvidences).mockResolvedValue([
      evidence({ review_status: 'PENDING', url: 'https://ex.io/result', content: 'Chiffres clés du sondage' }),
    ])
    const reviewMock = vi.mocked(coachingService.reviewEvidence)
      .mockResolvedValue(evidence({ review_status: 'APPROVED' }))
    const container = renderAction(makeClient(), action(), 'coach', true)

    click(button(container, 'Preuves'))
    await waitFor(() => expect(text(container, 'Chiffres clés du sondage')).toBe(true))
    expect(text(container, 'https://ex.io/result')).toBe(true)

    setValue(container.querySelector('input[placeholder="Commentaire (optionnel)"]') as HTMLInputElement, 'Preuve recevable')
    click(button(container, 'Accepter'))
    await waitFor(() => expect(reviewMock).toHaveBeenCalledWith('ev-1', {
      status: 'APPROVED', comment: 'Preuve recevable',
    }))
  })

  it('rejects evidence with a corrective comment and reports review failures inline', async () => {
    vi.mocked(coachingService.getEvidences).mockResolvedValue([evidence({ review_status: 'PENDING' })])
    const reviewMock = vi.mocked(coachingService.reviewEvidence)
      .mockRejectedValue(new Error())
    const container = renderAction(makeClient(), action(), 'coach', true)

    click(button(container, 'Preuves'))
    await waitFor(() => expect(button(container, 'Refuser')).not.toBeNull())
    setValue(container.querySelector('input[placeholder="Commentaire (optionnel)"]') as HTMLInputElement, 'Point à préciser')
    click(button(container, 'Refuser'))
    await waitFor(() => expect(reviewMock).toHaveBeenCalledWith('ev-1', {
      status: 'REJECTED', comment: 'Point à préciser',
    }))
    await waitFor(() => expect(text(container, 'La revue de la preuve a échoué')).toBe(true))
  })

  it('REJECTED action: the owner loses the status picker but may resubmit evidence', async () => {
    vi.mocked(coachingService.getEvidences).mockResolvedValue([
      evidence({ review_status: 'REJECTED', coach_comment: 'Pas de preuve chiffrée' }),
    ])
    const container = renderAction(makeClient(), action({ status: 'REJECTED' }), 'owner', false)

    expect(text(container, 'Refusée')).toBe(true)
    expect(select(container)).toBeNull()

    click(button(container, 'Preuves'))
    await waitFor(() => expect(text(container, 'À corriger')).toBe(true))
    expect(text(container, 'Commentaire : Pas de preuve chiffrée')).toBe(true)
    expect(button(container, 'Soumettre une preuve')).not.toBeNull()
  })

  it('COMPLETED action closes the evidence submission for the owner', async () => {
    vi.mocked(coachingService.getEvidences).mockResolvedValue([])
    const container = renderAction(makeClient(), action({ status: 'COMPLETED', deadline: PAST }), 'owner', false)

    expect(text(container, 'Terminée')).toBe(true)
    expect(select(container)).toBeNull()

    click(button(container, 'Preuves'))
    await waitFor(() => expect(text(container, 'Aucune preuve pour le moment.')).toBe(true))
    expect(button(container, 'Soumettre une preuve')).toBeNull()
  })

  it('marks overdue open actions without ever exposing OVERDUE as a settable status', async () => {
    const coach = renderAction(makeClient(), action({ deadline: PAST }), 'coach', true)
    expect(text(coach, 'En retard')).toBe(true)
    const status = select(coach)
    expect(Array.from(status!.querySelectorAll('option')).some((o) => o.value === 'OVERDUE')).toBe(false)

    const onTime = renderAction(makeClient(), action({ deadline: FUTURE }), 'coach', true)
    expect(text(onTime, 'En retard')).toBe(false)

    // Actions terminées ou annulées : le retard ne s'affiche plus.
    const done = renderAction(makeClient(), action({ status: 'COMPLETED', deadline: PAST }), 'coach', true)
    expect(text(done, 'En retard')).toBe(false)
  })

  it('owner submits a LINK evidence and the form resets', async () => {
    vi.mocked(coachingService.getEvidences).mockResolvedValue([])
    const addEvidenceMock = vi.mocked(coachingService.addEvidence)
      .mockResolvedValue(evidence({ review_status: 'PENDING' }))
    const container = renderAction(makeClient(), action(), 'owner', false)

    click(button(container, 'Preuves'))
    await waitFor(() => expect(button(container, 'Soumettre une preuve')).not.toBeNull())
    click(button(container, 'Soumettre une preuve'))

    setValue(container.querySelector('input[placeholder^="Ex. Résultats"]') as HTMLInputElement, 'Enquête clients')
    setValue(container.querySelector('input[placeholder^="https://"]') as HTMLInputElement, 'https://ex.io/enquete')
    click(button(container, 'Soumettre au coach'))

    await waitFor(() => expect(addEvidenceMock).toHaveBeenCalledWith('a-1', {
      type: 'LINK',
      title: 'Enquête clients',
      content: undefined,
      url: 'https://ex.io/enquete',
    }))
    expect(button(container, 'Soumettre au coach')).toBeNull()
  })

  it('surfaces a status update failure inline in the row', async () => {
    vi.mocked(coachingService.updateAction).mockRejectedValue(new Error())
    const container = renderAction(makeClient(), action(), 'coach', true)

    setValue(select(container)!, 'COMPLETED')
    await waitFor(() => expect(text(container, 'La mise à jour du statut a échoué')).toBe(true))
    expect(vi.mocked(coachingService.updateAction)).toHaveBeenCalledWith('a-1', { status: 'COMPLETED' })
  })
})