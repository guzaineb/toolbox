import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';
import { MaturityScoreService } from '../maturity/maturity-score.service';
import { NotificationsService } from '../notifications/notifications.service';

const project = (overrides: Record<string, unknown> = {}) => ({
  id: 'p1',
  name: 'Startup Green',
  description: 'Projet écologique',
  is_gbm_reviewed: false,
  gbm_reviewed_at: null,
  business_plan_finalized_at: null,
  created_at: new Date('2026-01-10T10:00:00.000Z'),
  _count: { generated_documents: 2 },
  ...overrides,
});

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: Record<string, Record<string, jest.Mock>>;
  let maturity: { compute: jest.Mock };
  let notifications: { findAllByUser: jest.Mock };

  beforeEach(async () => {
    const empty = () => jest.fn();
    prisma = {
      project: { findMany: empty() },
      stepProgress: { findMany: empty() },
      user: { findMany: empty() },
      projectExpertAssignment: { findMany: empty() },
      cohortExpert: { findMany: empty() },
      coachingSession: { findMany: empty() },
      coachingAction: { findMany: empty() },
      coachingRecommendation: { findMany: empty() },
      evaluationAssignment: { findMany: empty() },
      evaluation: { findMany: empty() },
      incubatorMember: { findMany: empty() },
      cohort: { findMany: empty() },
      cohortParticipation: { findMany: empty() },
      jurySession: { findMany: empty() },
    };
    maturity = { compute: jest.fn() };
    notifications = {
      findAllByUser: jest.fn().mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        limit: 5,
        totalPages: 0,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: prisma },
        { provide: MaturityScoreService, useValue: maturity },
        { provide: NotificationsService, useValue: notifications },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOwnerDashboard', () => {
    it('scopes projects to the signed-in owner only', async () => {
      prisma.project.findMany.mockResolvedValue([project()]);
      prisma.stepProgress.findMany.mockResolvedValue([]);

      await service.getOwnerDashboard('owner-1');

      expect(prisma.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { owner_id: 'owner-1' } }),
      );
    });

    it('returns real progress computed from step progresses (no fake numbers)', async () => {
      prisma.project.findMany.mockResolvedValue([
        project({ is_gbm_reviewed: true }),
      ]);
      const stepRows = [];
      for (let i = 1; i <= 12; i++) {
        stepRows.push({
          project_id: 'p1',
          step_key: `gbm_${i}`,
          status: 'COMPLETED',
        });
      }
      prisma.stepProgress.findMany.mockResolvedValue(stepRows);

      const result = await service.getOwnerDashboard('owner-1');

      expect(result.projects[0].progress.overall).toBe(50);
      expect(result.projects[0].progress.gbm.done).toBe(12);
      expect(result.projects[0].progress.gbm.total).toBe(24);
    });

    it('maps the next action from the real project state', async () => {
      prisma.project.findMany.mockResolvedValue([project()]);
      prisma.stepProgress.findMany.mockResolvedValue([]);

      const notStarted = await service.getOwnerDashboard('owner-1');
      expect(notStarted.projects[0].nextStep.label).toContain('Commencer');

      prisma.project.findMany.mockResolvedValue([
        project({ is_gbm_reviewed: true, business_plan_finalized_at: null }),
      ]);
      prisma.stepProgress.findMany.mockResolvedValue([
        { project_id: 'p1', step_key: 'gbm_1', status: 'COMPLETED' },
      ]);

      const reviewed = await service.getOwnerDashboard('owner-1');
      expect(reviewed.projects[0].nextStep.label).toContain('business plan');
      expect(reviewed.stats.gbmReviewed).toBe(1);
    });

    it('returns an empty real dashboard when the owner has no project', async () => {
      prisma.project.findMany.mockResolvedValue([]);

      const result = await service.getOwnerDashboard('owner-1');

      expect(result.projects).toEqual([]);
      expect(result.stats).toEqual({
        totalProjects: 0,
        gbmReviewed: 0,
        notStarted: 0,
        inProgress: 0,
        averageProgress: 0,
        documentsGenerated: 0,
        recentlyCreated: 0,
      });
      expect(prisma.stepProgress.findMany).not.toHaveBeenCalled();
    });
  });

  describe('getExpertDashboard', () => {
    const assignment = {
      id: 'a1',
      project_id: 'p1',
      role: 'COACH',
      assigned_at: new Date('2026-02-01T10:00:00.000Z'),
      project: {
        id: 'p1',
        name: 'Startup Green',
        description: 'Projet écologique',
        owner_id: 'owner-1',
      },
    };

    it('scopes listings to ACTIVE assignments of the signed-in expert', async () => {
      prisma.projectExpertAssignment.findMany.mockResolvedValue([assignment]);
      prisma.cohortExpert.findMany.mockResolvedValue([{ cohort_id: 'c1' }]);
      prisma.user.findMany.mockResolvedValue([
        { id: 'owner-1', profile: { first_name: 'Jean', last_name: 'Dupont' } },
      ]);
      prisma.stepProgress.findMany.mockResolvedValue([]);
      prisma.coachingSession.findMany.mockResolvedValue([]);
      prisma.coachingAction.findMany.mockResolvedValue([]);
      prisma.coachingRecommendation.findMany.mockResolvedValue([]);
      prisma.evaluationAssignment.findMany.mockResolvedValue([]);
      prisma.evaluation.findMany.mockResolvedValue([]);
      maturity.compute.mockResolvedValue({
        globalScore: 80,
        dimensions: [],
        computedAt: '2026-02-02T00:00:00.000Z',
      });

      const result = await service.getExpertDashboard('expert-1');

      expect(prisma.projectExpertAssignment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { expert_user_id: 'expert-1', status: 'ACTIVE' },
        }),
      );
      expect(result.projects[0].ownerName).toBe('Jean Dupont');
      expect(result.projects[0].maturity?.score).toBe(80);
      expect(result.stats.activeCohorts).toBe(1);
    });

    it('lists evaluations to submit from real jury assignments', async () => {
      prisma.projectExpertAssignment.findMany.mockResolvedValue([]);
      prisma.cohortExpert.findMany.mockResolvedValue([]);
      prisma.evaluationAssignment.findMany.mockResolvedValue([
        {
          id: 'ea1',
          project_id: 'p1',
          project: { name: 'Startup Green' },
          cohort_id: 'c1',
          cohort: { name: 'Cohorte Éco' },
          deadline: new Date('2026-03-01T10:00:00.000Z'),
          created_at: new Date('2026-02-10T10:00:00.000Z'),
        },
      ]);
      prisma.evaluation.findMany.mockResolvedValue([]);

      const result = await service.getExpertDashboard('expert-1');

      expect(result.stats.evaluationsTodo).toBe(1);
      expect(result.evaluations.todo[0].projectName).toBe('Startup Green');
      expect(result.evaluations.todo[0].cohortName).toBe('Cohorte Éco');
      expect(result.evaluations.done).toEqual([]);
      expect(result.alerts.some((a) => a.type === 'EVALUATION')).toBe(true);
    });

    it('only keeps future sessions in upcoming sessions', async () => {
      prisma.projectExpertAssignment.findMany.mockResolvedValue([assignment]);
      prisma.cohortExpert.findMany.mockResolvedValue([]);
      prisma.user.findMany.mockResolvedValue([]);
      prisma.stepProgress.findMany.mockResolvedValue([]);
      prisma.coachingSession.findMany.mockResolvedValue([
        {
          id: 's1',
          assignment_id: 'a1',
          title: 'Séance à venir',
          session_type: 'PLAN',
          scheduled_at: new Date(Date.now() + 86400000 * 2),
          status: 'SCHEDULED',
          created_at: new Date('2026-01-20T10:00:00.000Z'),
        },
        {
          id: 's2',
          assignment_id: 'a1',
          title: 'Séance passée',
          session_type: 'PLAN',
          scheduled_at: new Date(Date.now() - 86400000),
          status: 'SCHEDULED',
          created_at: new Date('2026-01-19T10:00:00.000Z'),
        },
      ]);
      prisma.coachingAction.findMany.mockResolvedValue([]);
      prisma.coachingRecommendation.findMany.mockResolvedValue([]);
      prisma.evaluationAssignment.findMany.mockResolvedValue([]);
      prisma.evaluation.findMany.mockResolvedValue([]);
      maturity.compute.mockResolvedValue({
        globalScore: 80,
        dimensions: [],
        computedAt: '2026-02-02T00:00:00.000Z',
      });

      const result = await service.getExpertDashboard('expert-1');

      expect(result.upcomingSessions.length).toBe(1);
      expect(result.upcomingSessions[0].title).toBe('Séance à venir');
      expect(result.projects[0].nextAction).not.toBeNull();
    });

    it('returns an empty real dashboard for an expert without any workload', async () => {
      prisma.projectExpertAssignment.findMany.mockResolvedValue([]);
      prisma.cohortExpert.findMany.mockResolvedValue([]);
      prisma.evaluationAssignment.findMany.mockResolvedValue([]);
      prisma.evaluation.findMany.mockResolvedValue([]);

      const result = await service.getExpertDashboard('expert-1');

      expect(result.projects).toEqual([]);
      expect(result.stats).toEqual({
        assignedProjects: 0,
        activeCohorts: 0,
        evaluationsTodo: 0,
        upcomingSessions: 0,
        openActionsCount: 0,
      });
      expect(result.evaluations).toEqual({
        todo: [],
        inProgress: [],
        done: [],
      });
      expect(result.alerts).toEqual([]);
    });
  });

  describe('getIncubatorDashboard', () => {
    it('scopes data to the incubators the user is an ACTIVE member of', async () => {
      prisma.incubatorMember.findMany.mockResolvedValue([
        {
          incubator_id: 'i1',
          incubator: { id: 'i1', name: 'Incub Éco', status: 'ACTIVE' },
        },
      ]);
      prisma.cohort.findMany.mockResolvedValue([
        {
          id: 'c1',
          incubator_id: 'i1',
          name: 'Cohorte 1',
          status: 'OPEN',
          start_date: null,
          end_date: null,
          current_participants: 3,
        },
      ]);
      prisma.cohortParticipation.findMany
        .mockResolvedValueOnce([
          {
            id: 'cp1',
            project_id: 'p1',
            cohort_id: 'c1',
            project: {
              id: 'p1',
              name: 'ProjetA',
              description: null,
              owner_id: 'owner-1',
              is_gbm_reviewed: false,
              created_at: new Date('2026-01-10T10:00:00.000Z'),
            },
          },
        ])
        .mockResolvedValueOnce([]);
      prisma.user.findMany.mockResolvedValue([
        { id: 'owner-1', profile: { first_name: 'Jean', last_name: 'Dupont' } },
      ]);
      prisma.cohortExpert.findMany.mockResolvedValue([
        { expert_user_id: 'e1', cohort_id: 'c1', role: 'COACH' },
      ]);
      prisma.evaluationAssignment.findMany.mockResolvedValue([
        { id: 'ea1', project_id: 'p1', jury_user_id: 'j1', cohort_id: 'c1' },
      ]);
      prisma.evaluation.findMany.mockResolvedValue([]);
      prisma.jurySession.findMany.mockResolvedValue([]);
      prisma.stepProgress.findMany.mockResolvedValue([]);
      prisma.coachingSession.findMany.mockResolvedValue([]);

      const result = await service.getIncubatorDashboard('member-1');

      expect(prisma.incubatorMember.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: 'member-1', status: 'ACTIVE' },
        }),
      );
      expect(result.stats.portfolioSize).toBe(1);
      expect(result.portfolio[0].ownerName).toBe('Jean Dupont');
      expect(result.incubators[0].portfolioSize).toBe(1);
      expect(result.stats.expertsActive).toBe(1);
      expect(result.stats.notStarted).toBe(1);
      expect(result.stats.averageProgress).toBe(0);
    });

    it('lists jury evaluations still missing from submitted ones', async () => {
      prisma.incubatorMember.findMany.mockResolvedValue([
        {
          incubator_id: 'i1',
          incubator: { id: 'i1', name: 'Incub Éco', status: 'ACTIVE' },
        },
      ]);
      prisma.cohort.findMany.mockResolvedValue([
        {
          id: 'c1',
          incubator_id: 'i1',
          name: 'Cohorte 1',
          status: 'OPEN',
          start_date: null,
          end_date: null,
          current_participants: 2,
        },
      ]);
      prisma.cohortParticipation.findMany
        .mockResolvedValueOnce([
          {
            id: 'cp1',
            project_id: 'p1',
            cohort_id: 'c1',
            project: {
              id: 'p1',
              name: 'ProjetA',
              description: null,
              owner_id: 'owner-1',
              is_gbm_reviewed: false,
              created_at: new Date('2026-01-10T10:00:00.000Z'),
            },
          },
        ])
        .mockResolvedValueOnce([]);
      prisma.user.findMany.mockResolvedValue([]);
      prisma.cohortExpert.findMany.mockResolvedValue([]);
      prisma.evaluationAssignment.findMany.mockResolvedValue([
        { id: 'ea1', project_id: 'p1', jury_user_id: 'j1', cohort_id: 'c1' },
        { id: 'ea2', project_id: 'p1', jury_user_id: 'j2', cohort_id: 'c1' },
      ]);
      prisma.evaluation.findMany.mockResolvedValue([
        { project_id: 'p1', jury_user_id: 'j1' },
      ]);
      prisma.jurySession.findMany.mockResolvedValue([]);
      prisma.stepProgress.findMany.mockResolvedValue([]);
      prisma.coachingSession.findMany.mockResolvedValue([]);

      const result = await service.getIncubatorDashboard('member-1');

      expect(result.pendingEvaluations).toHaveLength(1);
      expect(result.pendingEvaluations[0].projectName).toBe('ProjetA');
      expect(result.pendingEvaluations[0].pending).toBe(1);
      expect(result.stats.needsAttention).toBe(2);
    });

    it('returns an empty real dashboard for a member without incubator', async () => {
      prisma.incubatorMember.findMany.mockResolvedValue([]);

      const result = await service.getIncubatorDashboard('member-1');

      expect(result.incubators).toEqual([]);
      expect(result.cohorts).toEqual([]);
      expect(result.portfolio).toEqual([]);
      expect(result.stats.portfolioSize).toBe(0);
      expect(prisma.cohort.findMany).not.toHaveBeenCalled();
    });
  });
});
