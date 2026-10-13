// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createElement, type ReactNode } from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { expertService } from '@/services/expert.service'
import { cohortService } from '@/services/cohort.service'
import type { ExpertDirectoryPage, ExpertProfile } from '@/types/expert'
import type { Cohort } from '@/types/cohort'
import IncubatorExpertsPage from './page'

vi.mock('@/services/expert.service', () => ({
  __esModule: true,
  expertService: {
    getAllExpertiseAreas: vi.fn(),
    listExperts: vi.fn(),
  },
}))

vi.mock('@/services/cohort.service', () => ({
  __esModule: true,
  cohortService: {
    getIncubatorCohorts: vi.fn(),
    inviteExpert: vi.fn(),
  },
}))

vi.mock('next/navigation', () => ({
  __esModule: true,
  useParams: () => ({ incubatorId: 'inc-1' }),
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

function expert(overrides: Partial<ExpertProfile> = {}): ExpertProfile {
  return {
    id: 'expert-1',
    headline: 'Spécialiste climat',
    organization: 'GreenLab',
    position: 'Directrice R&D',
    years_of_experience: 12,
    availability_status: 'AVAILABLE',
    expertiseConnections: [
      {
        id: 'conn-1',
        level: 'senior',
        years_of_experience: 10,
        expertiseArea: {
          id: 'area-1',
          name: 'Climat',
          category: 'Environnement',
        },
      },
    ],
    user: {
      id: 'user-1',
      email: 'awa@test.com',
      profile: { first_name: 'Awa', last_name: 'Diallo' },
    },
    ...overrides,
  }
}

function page(items: ExpertProfile[]): ExpertDirectoryPage {
  return { items, total: items.length, page: 1, limit: 12 }
}

function cohort(): Cohort {
  return {
    id: 'cohort-1',
    name: 'Promotion Climat',
    current_participants: 0,
    status: 'OPEN',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  }
}

async function flush() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 5))
  })
}

async function waitFor(assert: () => void) {
  const deadline = Date.now() + 3000
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

function renderPage() {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  act(() => {
    root.render(createElement(IncubatorExpertsPage))
  })
  mountedRoots.push(root)
  return container
}

function text(container: HTMLElement, needle: string) {
  return (container.textContent ?? '').includes(needle)
}

function button(
  container: HTMLElement,
  label: string,
): HTMLButtonElement | null {
  return (
    Array.from(container.querySelectorAll('button')).find(
      (b) => (b.textContent ?? '').trim() === label,
    ) ?? null
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  ;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true
  mountedRoots = []
})

afterEach(() => {
  for (const root of mountedRoots) {
    act(() => {
      root.unmount()
    })
  }
  mountedRoots = []
  while (document.body.firstChild) document.body.removeChild(document.body.firstChild)
})

describe('IncubatorExpertsPage', () => {
  it('affiche les experts du catalogue avec leurs domaines d’expertise', async () => {
    vi.mocked(expertService.getAllExpertiseAreas).mockResolvedValue([
      { id: 'area-1', name: 'Climat', category: 'Environnement' },
    ])
    vi.mocked(expertService.listExperts).mockResolvedValue(page([expert()]))
    vi.mocked(cohortService.getIncubatorCohorts).mockResolvedValue([cohort()])

    const container = renderPage()

    await waitFor(() => expect(text(container, 'Awa Diallo')).toBe(true))
    expect(text(container, 'Spécialiste climat')).toBe(true)
    expect(text(container, 'Climat')).toBe(true)
    expect(text(container, 'Disponible')).toBe(true)
    expect(text(container, 'GreenLab')).toBe(true)
    expect(expertService.listExperts).toHaveBeenCalledWith(
      expect.objectContaining({ q: '', page: 1, limit: 12 }),
    )
  })

  it('affiche un état vide quand aucun expert ne correspond', async () => {
    vi.mocked(expertService.getAllExpertiseAreas).mockResolvedValue([])
    vi.mocked(expertService.listExperts).mockResolvedValue(page([]))
    vi.mocked(cohortService.getIncubatorCohorts).mockResolvedValue([])

    const container = renderPage()

    await waitFor(() =>
      expect(
        text(container, 'Aucun expert ne correspond à votre recherche'),
      ).toBe(true),
    )
  })

  it('invite un expert dans une cohorte de l’incubateur', async () => {
    vi.mocked(expertService.getAllExpertiseAreas).mockResolvedValue([])
    vi.mocked(expertService.listExperts).mockResolvedValue(page([expert()]))
    vi.mocked(cohortService.getIncubatorCohorts).mockResolvedValue([cohort()])
    vi.mocked(cohortService.inviteExpert).mockResolvedValue({} as never)

    const container = renderPage()

    await waitFor(() => expect(text(container, 'Awa Diallo')).toBe(true))
    act(() => {
      button(container, 'Inviter dans une cohorte')?.click()
    })
    await waitFor(() => expect(text(container, 'Inviter un expert')).toBe(true))
    await waitFor(() => expect(text(container, 'Promotion Climat')).toBe(true))

    act(() => {
      button(container, 'Envoyer l’invitation')?.click()
    })

    await waitFor(() =>
      expect(cohortService.inviteExpert).toHaveBeenCalledTimes(1),
    )
    expect(cohortService.inviteExpert).toHaveBeenCalledWith('cohort-1', {
      expertUserId: 'user-1',
      role: 'COACH',
    })
    await waitFor(() => expect(text(container, 'Invitation envoyée')).toBe(true))
  })

  it('remonte l’erreur backend de la liste', async () => {
    vi.mocked(expertService.getAllExpertiseAreas).mockResolvedValue([])
    vi.mocked(expertService.listExperts).mockRejectedValue(
      new Error('Accès refusé'),
    )
    vi.mocked(cohortService.getIncubatorCohorts).mockResolvedValue([])

    const container = renderPage()

    await waitFor(() => expect(text(container, 'Accès refusé')).toBe(true))
  })
})
