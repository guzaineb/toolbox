// @vitest-environment jsdom
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest'
import { createElement, type ReactNode } from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { coachingService } from '@/services/coaching.service'
import { ActionComments } from '@/components/coaching/ActionComments'
import type { CoachingComment } from '@/types/coaching'

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

function comment(overrides: Partial<CoachingComment> = {}): CoachingComment {
  return {
    id: 'c-1',
    content: 'Précisez le périmètre des interviews.',
    author_id: 'u-coach',
    action_id: 'a-1',
    created_at: '2026-09-10T09:00:00.000Z',
    author: { id: 'u-coach', email: 'coach@ex.io', profile: { first_name: 'Marie', last_name: 'Durand' } },
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

function renderComments(actionId = 'a-1') {
  const { root, container } = mount(
    createElement(
      QueryClientProvider,
      { client: makeClient() },
      createElement(ActionComments, { actionId }),
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

function click(el: HTMLElement | null) {
  if (!el) throw new Error('Element not found')
  act(() => { el.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}

function setValue(el: HTMLInputElement, value: string) {
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(el, value)
    el.dispatchEvent(new Event('input', { bubbles: true }))
  })
}

describe('ActionComments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true
    mountedRoots = []
    vi.mocked(coachingService.getActionComments).mockResolvedValue([])
  })

  afterEach(() => {
    for (const root of mountedRoots) {
      act(() => { root.unmount() })
    }
    while (document.body.firstChild) document.body.removeChild(document.body.firstChild)
  })

  it('renders the list with the author, the date and the content', async () => {
    vi.mocked(coachingService.getActionComments).mockResolvedValue([
      comment(),
      comment({ id: 'c-2', content: 'Ok, je prends en compte.', author_id: 'u-owner' }),
    ])
    const container = renderComments()

    await waitFor(() => expect(text(container, 'Précisez le périmètre des interviews.')).toBe(true))
    expect(text(container, 'Marie Durand')).toBe(true)
    expect(text(container, 'Ok, je prends en compte.')).toBe(true)
    expect(text(container, 'Commentaires (2)')).toBe(true)
    // Récupération des commentaires de l'action uniquement (jamais d'autre ressource).
    expect(vi.mocked(coachingService.getActionComments)).toHaveBeenCalledWith('a-1')
  })

  it('shows a loading message while fetching and an empty state when there is none', async () => {
    let resolveComments: (value: CoachingComment[]) => void = () => undefined
    vi.mocked(coachingService.getActionComments).mockImplementation(
      () => new Promise((resolve) => { resolveComments = resolve }),
    )
    const container = renderComments()

    expect(text(container, 'Chargement des commentaires…')).toBe(true)

    act(() => resolveComments([]))
    await waitFor(() => expect(text(container, 'Aucun commentaire pour cette action.')).toBe(true))
  })

  it('reports a backend access error inline (forbidden project)', async () => {
    vi.mocked(coachingService.getActionComments).mockRejectedValue({
      response: { status: 403, data: { message: 'Accès refusé au coaching de ce projet' } },
    })
    const container = renderComments()

    await waitFor(() =>
      expect(text(container, 'Accès refusé au coaching de ce projet')).toBe(true),
    )
  })

  it('posts a comment without reloading the page: targeted refetch updates the list', async () => {
    const commentsBackend = [
      comment(),
      comment({ id: 'c-2', content: 'Ok, je prends en compte.', author_id: 'u-owner' }),
    ]
    vi.mocked(coachingService.getActionComments).mockImplementation(async () => commentsBackend.slice())
    vi.mocked(coachingService.addActionComment).mockImplementation(async (_actionId, dto) => {
      const created = comment({ id: 'c-3', content: dto.content, author_id: 'u-owner' })
      commentsBackend.push(created)
      return created
    })
    const container = renderComments()

    await waitFor(() => expect(text(container, 'Précisez le périmètre des interviews.')).toBe(true))
    const initialCalls = vi.mocked(coachingService.getActionComments).mock.calls.length

    setValue(container.querySelector('input[placeholder="Ajouter un commentaire…"]') as HTMLInputElement, 'Interviews confirmées !')
    click(button(container, 'Envoyer'))

    await waitFor(() =>
      expect(vi.mocked(coachingService.addActionComment)).toHaveBeenCalledWith('a-1', { content: 'Interviews confirmées !' }),
    )

    // Retour de la mutation : le commentaire apparaît dans la liste après invalidation ciblée.
    await waitFor(() => expect(text(container, 'Interviews confirmées !')).toBe(true))
    // Invalidation → refetch de la SEULE clé actionComments (aucune requête projet).
    expect(vi.mocked(coachingService.getActionComments).mock.calls.length).toBeGreaterThan(initialCalls)
    // La zone de saisie est vidée et le feedback de succès est affiché.
    expect((container.querySelector('input[placeholder="Ajouter un commentaire…"]') as HTMLInputElement).value).toBe('')
    expect(text(container, 'Commentaire ajouté.')).toBe(true)
  })

  it('keeps the input and surfaces the error when the server refuses the comment', async () => {
    vi.mocked(coachingService.getActionComments).mockResolvedValue([])
    vi.mocked(coachingService.addActionComment).mockRejectedValue({
      response: { status: 400, data: { message: 'Le contenu du commentaire est requis' } },
    })
    const container = renderComments()

    await waitFor(() => expect(text(container, 'Aucun commentaire pour cette action.')).toBe(true))

    setValue(container.querySelector('input[placeholder="Ajouter un commentaire…"]') as HTMLInputElement, 'Contenu invalide')
    click(button(container, 'Envoyer'))

    await waitFor(() =>
      expect(text(container, 'Le contenu du commentaire est requis')).toBe(true),
    )
    expect(text(container, 'Commentaire ajouté.')).toBe(false)
    // La saisie n'est pas perdue : l'utilisateur peut corriger puis renvoyer.
    expect((container.querySelector('input[placeholder="Ajouter un commentaire…"]') as HTMLInputElement).value).toBe('Contenu invalide')
  })

  it('submits with the Enter key and ignores empty drafts', async () => {
    vi.mocked(coachingService.getActionComments).mockResolvedValue([])
    const addCommentMock = vi.mocked(coachingService.addActionComment).mockResolvedValue(
      comment({ id: 'c-9', content: 'Via Enter', author_id: 'u-owner' }),
    )
    const container = renderComments()

    await waitFor(() => expect(text(container, 'Aucun commentaire pour cette action.')).toBe(true))

    const input = container.querySelector('input[placeholder="Ajouter un commentaire…"]') as HTMLInputElement
    act(() => {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    })
    expect(addCommentMock).not.toHaveBeenCalled()

    setValue(input, 'Via Enter')
    act(() => {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    })
    await waitFor(() => expect(addCommentMock).toHaveBeenCalledWith('a-1', { content: 'Via Enter' }))
  })
})