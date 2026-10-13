// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createElement, type ReactNode } from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import {
  projectService,
  type ProjectDirectoryEntry,
  type ProjectDirectoryPage,
} from '@/services/project.service'
import { cohortService } from '@/services/cohort.service'
import type { Cohort } from '@/types/cohort'
import IncubatorProjectsPage from './page'

vi.mock('@/services/project.service', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/services/project.service')>()
  return {
    ...actual,
    projectService: { ...actual.projectService, listDirectory: vi.fn() },
  }
})

vi.mock('@/services/cohort.service', () => ({
  __esModule: true,
  cohortService: {
    getIncubatorCohorts: vi.fn(),
    inviteToCohort: vi.fn(),
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

function project(
  overrides: Partial<ProjectDirectoryEntry> = {},
): ProjectDirectoryEntry {
  return {
    id: 'project-1',
    name: 'Ferme urbaine',
    description: 'Production maraîchère en circuit court pour la ville.',
    owner_id: 'owner-1',
    ownerName: 'Awa Diallo',
    created_at: '2026-01-05T00:00:00.000Z',
    is_gbm_reviewed: true,
    business_plan_status: null,
    context_summary: { summary_text: 'Contexte du projet.' },
    mission_vision: {
      mission: 'Nourrir la ville',
      vision: 'Une agriculture locale',
    },
    funding_assessment: { phase_maturite: 'VALIDATION', score_maturite: 62 },
    cohort_participations: [
      {
        id: 'part-1',
        status: 'PENDING',
        origin: 'INVITATION',
        cohort: { id: 'cohort-1', name: 'Promotion Climat', status: 'OPEN' },
      },
    ],
    ...overrides,
  }
}

function page(items: ProjectDirectoryEntry[]): ProjectDirectoryPage {
  return { items, total: items.length, page: 1, limit: 9 }
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
    root.render(createElement(IncubatorProjectsPage))
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

describe('IncubatorProjectsPage', () => {
  it('affiche la description détaillée et les informations clés du projet', async () => {
    vi.mocked(projectService.listDirectory).mockResolvedValue(page([project()]))
    vi.mocked(cohortService.getIncubatorCohorts).mockResolvedValue([cohort()])

    const container = renderPage()

    await waitFor(() => expect(text(container, 'Ferme urbaine')).toBe(true))
    expect(
      text(container, 'Production maraîchère en circuit court'),
    ).toBe(true)
    expect(text(container, 'Awa Diallo')).toBe(true)
    expect(text(container, 'GBM validé')).toBe(true)
    expect(text(container, 'Validation')).toBe(true)
    expect(text(container, 'Nourrir la ville')).toBe(true)
    expect(text(container, 'Promotion Climat')).toBe(true)
    expect(projectService.listDirectory).toHaveBeenCalledWith(
      expect.objectContaining({ q: '', page: 1, limit: 9 }),
    )
  })

  it('invite un projet dans une cohorte de l’incubateur', async () => {
    vi.mocked(projectService.listDirectory).mockResolvedValue(page([project()]))
    vi.mocked(cohortService.getIncubatorCohorts).mockResolvedValue([cohort()])
    vi.mocked(cohortService.inviteToCohort).mockResolvedValue({} as never)

    const container = renderPage()

    await waitFor(() => expect(text(container, 'Ferme urbaine')).toBe(true))
    act(() => {
      button(container, 'Inviter dans une cohorte')?.click()
    })
    await waitFor(() => expect(text(container, 'Inviter un projet')).toBe(true))

    act(() => {
      button(container, 'Envoyer l’invitation')?.click()
    })

    await waitFor(() =>
      expect(cohortService.inviteToCohort).toHaveBeenCalledTimes(1),
    )
    expect(cohortService.inviteToCohort).toHaveBeenCalledWith(
      'cohort-1',
      'project-1',
    )
    await waitFor(() => expect(text(container, 'Invitation envoyée')).toBe(true))
  })

  it('affiche un état vide quand aucun projet ne correspond', async () => {
    vi.mocked(projectService.listDirectory).mockResolvedValue(page([]))
    vi.mocked(cohortService.getIncubatorCohorts).mockResolvedValue([])

    const container = renderPage()

    await waitFor(() =>
      expect(
        text(container, 'Aucun projet ne correspond à votre recherche'),
      ).toBe(true),
    )
  })
})
