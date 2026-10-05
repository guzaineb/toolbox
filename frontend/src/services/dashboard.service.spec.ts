import { describe, it, expect, vi, beforeEach } from 'vitest'
import api from './api'
import { dashboardService } from './dashboard.service'

vi.mock('./api', () => ({
  __esModule: true,
  default: { get: vi.fn() },
}))
vi.mock('axios', () => ({ default: {} }))

const getMock = vi.mocked(api.get)

function ok(body: unknown) {
  return Promise.resolve({
    data: body,
  } as unknown as Awaited<ReturnType<typeof api.get>>)
}

describe('dashboardService', () => {
  beforeEach(() => {
    getMock.mockReset()
  })

  it('fetches the owner dashboard from /dashboard/owner', async () => {
    getMock.mockReturnValue(
      ok({
        role: 'PROJECT_OWNER',
        projects: [],
        stats: {
          totalProjects: 0,
          gbmReviewed: 0,
          notStarted: 0,
          inProgress: 0,
          averageProgress: 0,
          documentsGenerated: 0,
          recentlyCreated: 0,
        },
        recentActivities: [],
      }),
    )

    const result = await dashboardService.owner()

    expect(getMock).toHaveBeenCalledWith('/dashboard/owner')
    expect(result.role).toBe('PROJECT_OWNER')
    expect(result.stats.totalProjects).toBe(0)
  })

  it('fetches the expert dashboard from /dashboard/expert', async () => {
    getMock.mockReturnValue(
      ok({
        role: 'EXPERT',
        projects: [
          {
            id: 'proj-1',
            name: 'Projet Alpha',
            description: null,
            ownerName: 'Jean Dupont',
            role: 'COACH',
            assignedAt: '2026-01-01T00:00:00.000Z',
            progress: {
              overall: 50,
              gbm: { done: 12, total: 24, percentage: 50 },
              businessPlan: { done: 0, total: 0, percentage: 0 },
            },
            maturity: { score: 62, computedAt: '2026-01-01T00:00:00.000Z' },
            nextAction: { label: 'Relancer le porteur', link: '/dashboard/expert/coaching/proj-1' },
            lastEvent: {
              type: 'ACTION',
              label: 'Plan d\u2019actions',
              createdAt: '2026-01-01T00:00:00.000Z',
            },
          },
        ],
        stats: {
          assignedProjects: 1,
          activeCohorts: 0,
          evaluationsTodo: 2,
          upcomingSessions: 1,
          openActionsCount: 3,
        },
        evaluations: { todo: [], inProgress: [], done: [] },
        upcomingSessions: [],
        alerts: [],
        recentActivities: [],
      }),
    )

    const result = await dashboardService.expert()

    expect(getMock).toHaveBeenCalledWith('/dashboard/expert')
    expect(result.role).toBe('EXPERT')
    expect(result.projects[0].maturity?.score).toBe(62)
  })

  it('fetches the incubator dashboard from /dashboard/incubator', async () => {
    getMock.mockReturnValue(
      ok({
        role: 'INCUBATOR_MEMBER',
        incubators: [
          { id: 'inc-1', name: 'Incubateur', status: 'ACTIVE', activeCohorts: 1, portfolioSize: 2 },
        ],
        cohorts: [],
        portfolio: [],
        stats: {
          portfolioSize: 2,
          activeProjects: 1,
          notStarted: 1,
          needsAttention: 1,
          totalCohorts: 1,
          activeCohorts: 1,
          expertsActive: 0,
          applicationsPending: 0,
          averageProgress: 25,
        },
        experts: [],
        pendingEvaluations: [],
        upcomingSessions: [],
        jurySessions: [],
        alerts: [],
        recentActivities: [],
      }),
    )

    const result = await dashboardService.incubator()

    expect(getMock).toHaveBeenCalledWith('/dashboard/incubator')
    expect(result.role).toBe('INCUBATOR_MEMBER')
    expect(result.incubators[0].name).toBe('Incubateur')
  })
})