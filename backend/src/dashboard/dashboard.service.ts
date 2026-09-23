import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MaturityScoreService } from '../maturity/maturity-score.service';
import { NotificationsService } from '../notifications/notifications.service';
import { GBM_STEPS } from '../gbm/step-config';

const GBM_TOTAL = GBM_STEPS.length;
const DAY_MS = 24 * 60 * 60 * 1000;
const OPEN_ACTION_STATUS = ['PENDING', 'IN_PROGRESS', 'SUBMITTED', 'OVERDUE'];

export interface ProjectProgress {
  overall: number;
  gbm: { done: number; total: number; percentage: number };
  businessPlan: { done: number; total: number; percentage: number };
}

export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  createdAt: string;
  isRead: boolean;
}

export interface NextStep {
  label: string;
  link: string;
}

export interface OwnerProjectItem {
  id: string;
  name: string;
  description: string | null;
  isGbmReviewed: boolean;
  gbmReviewedAt: string | null;
  isBusinessPlanFinalized: boolean;
  createdAt: string;
  documentsGenerated: number;
  progress: ProjectProgress;
  nextStep: NextStep;
}

export interface OwnerDashboardResponse {
  role: 'PROJECT_OWNER';
  projects: OwnerProjectItem[];
  stats: {
    totalProjects: number;
    gbmReviewed: number;
    notStarted: number;
    inProgress: number;
    averageProgress: number;
    documentsGenerated: number;
    recentlyCreated: number;
  };
  recentActivities: ActivityItem[];
}

export interface ExpertProjectItem {
  id: string;
  name: string;
  description: string | null;
  ownerName: string;
  role: string;
  assignedAt: string;
  progress: ProjectProgress;
  maturity: { score: number; computedAt: string } | null;
  nextAction: NextStep | null;
  lastEvent: { type: string; label: string; createdAt: string } | null;
}

export interface EvaluationTodoItem {
  assignmentId: string;
  projectId: string;
  projectName: string;
  cohortId: string;
  cohortName: string | null;
  deadline: string | null;
  createdAt: string;
}

export interface EvaluationProgressItem {
  evaluationId: string;
  projectId: string;
  projectName: string;
  updatedAt?: string;
  submittedAt?: string;
}

export interface UpcomingSessionItem {
  id: string;
  projectId: string;
  projectName: string;
  title: string | null;
  sessionType: string | null;
  scheduledAt: string;
  status: string;
}

export interface AlertItem {
  type: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  link: string | null;
}

export interface ExpertDashboardResponse {
  role: 'EXPERT';
  projects: ExpertProjectItem[];
  stats: {
    assignedProjects: number;
    activeCohorts: number;
    evaluationsTodo: number;
    upcomingSessions: number;
    openActionsCount: number;
  };
  evaluations: {
    todo: EvaluationTodoItem[];
    inProgress: EvaluationProgressItem[];
    done: EvaluationProgressItem[];
  };
  upcomingSessions: UpcomingSessionItem[];
  alerts: AlertItem[];
  recentActivities: ActivityItem[];
}

export interface PortfolioProjectItem {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  ownerName: string;
  cohortId: string;
  cohortName: string | null;
  isGbmReviewed: boolean;
  createdAt: string;
  progress: ProjectProgress;
}

export interface IncubatorSummaryItem {
  id: string;
  name: string;
  status: string;
  activeCohorts: number;
  portfolioSize: number;
}

export interface CohortSummaryItem {
  id: string;
  incubatorId: string;
  name: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  participants: number;
}

export interface ExpertSummaryItem {
  id: string;
  name: string;
  roles: { cohortId: string; cohortName: string; role: string }[];
}

export interface PendingEvaluationItem {
  projectId: string;
  projectName: string;
  cohortId: string;
  cohortName: string | null;
  pending: number;
}

export interface JurySessionItem {
  id: string;
  projectId: string;
  projectName: string;
  cohortId: string;
  cohortName: string;
  title: string | null;
  status: string;
  createdAt: string;
}

export interface IncubatorDashboardResponse {
  role: 'INCUBATOR_MEMBER';
  incubators: IncubatorSummaryItem[];
  cohorts: CohortSummaryItem[];
  portfolio: PortfolioProjectItem[];
  stats: {
    portfolioSize: number;
    activeProjects: number;
    notStarted: number;
    needsAttention: number;
    totalCohorts: number;
    activeCohorts: number;
    expertsActive: number;
    applicationsPending: number;
    averageProgress: number;
  };
  experts: ExpertSummaryItem[];
  pendingEvaluations: PendingEvaluationItem[];
  upcomingSessions: UpcomingSessionItem[];
  jurySessions: JurySessionItem[];
  alerts: AlertItem[];
  recentActivities: ActivityItem[];
}

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly maturity: MaturityScoreService,
    private readonly notifications: NotificationsService,
  ) {}

  // ==================== Helpers ====================

  private pct(done: number, total: number): number {
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }

  private computeProgress(
    rows: { step_key: string; status: string }[],
  ): ProjectProgress {
    const gbmDone = rows.filter(
      (r) => r.step_key.startsWith('gbm_') && r.status === 'COMPLETED',
    ).length;
    const bpRows = rows.filter((r) => r.step_key.startsWith('bp_'));
    const bpDone = bpRows.filter((r) => r.status === 'COMPLETED').length;
    return {
      overall: this.pct(gbmDone, GBM_TOTAL),
      gbm: {
        done: gbmDone,
        total: GBM_TOTAL,
        percentage: this.pct(gbmDone, GBM_TOTAL),
      },
      businessPlan: {
        done: bpDone,
        total: bpRows.length,
        percentage: this.pct(bpDone, bpRows.length),
      },
    };
  }

  private groupByProject<T extends { project_id: string }>(
    rows: T[],
  ): Map<string, T[]> {
    const map = new Map<string, T[]>();
    for (const r of rows) {
      const list = map.get(r.project_id) ?? [];
      list.push(r);
      map.set(r.project_id, list);
    }
    return map;
  }

  private async recentActivities(userId: string): Promise<ActivityItem[]> {
    const result = await this.notifications.findAllByUser(userId, {
      limit: 5,
      page: 1,
    });
    return result.items.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      link: n.link,
      createdAt: n.created_at.toISOString(),
      isRead: n.is_read,
    }));
  }

  private async ownerNames(ownerIds: string[]): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    if (ownerIds.length === 0) return map;
    const users = await this.prisma.user.findMany({
      where: { id: { in: ownerIds } },
      select: {
        id: true,
        profile: { select: { first_name: true, last_name: true } },
      },
    });
    for (const u of users) {
      const name = [u.profile?.first_name, u.profile?.last_name]
        .filter(Boolean)
        .join(' ');
      map.set(u.id, name || 'Porteur de projet');
    }
    return map;
  }

  private isUpcoming(
    s: { status: string; scheduled_at: Date },
    now: Date,
  ): boolean {
    return (
      (s.status === 'SCHEDULED' || s.status === 'IN_PROGRESS') &&
      s.scheduled_at.getTime() >= now.getTime()
    );
  }

  private ownerNextStep(
    p: {
      id: string;
      is_gbm_reviewed: boolean;
      business_plan_finalized_at: Date | null;
    },
    progress: ProjectProgress,
  ): NextStep {
    const base = `/dashboard/project-owner/projects/${p.id}`;
    if (!p.is_gbm_reviewed && progress.gbm.done === 0) {
      return {
        label: 'Commencer le business model canvas (GBM)',
        link: `${base}/gbm`,
      };
    }
    if (!p.is_gbm_reviewed) {
      return {
        label: `Poursuivre le GBM (${progress.gbm.done}/${progress.gbm.total} étapes réalisées)`,
        link: `${base}/gbm`,
      };
    }
    if (
      progress.businessPlan.total === 0 ||
      progress.businessPlan.done < progress.businessPlan.total
    ) {
      return {
        label: p.business_plan_finalized_at
          ? 'Relire son business plan'
          : progress.businessPlan.total > 0
            ? `Préparer le business plan (${progress.businessPlan.done}/${progress.businessPlan.total})`
            : 'Préparer le business plan',
        link: `${base}/business-plan`,
      };
    }
    return {
      label: 'Suivre son coaching et ses évaluations',
      link: `${base}/coachings`,
    };
  }

  private lastEvent(
    actions: { title: string | null; created_at: Date }[],
    recommendations: { title: string | null; created_at: Date }[],
    sessions: { title: string | null; created_at: Date }[],
  ): { type: string; label: string; createdAt: string } | null {
    const events = [
      ...actions.map((a) => ({
        type: 'ACTION',
        label: a.title || 'Action',
        time: a.created_at,
      })),
      ...recommendations.map((r) => ({
        type: 'RECOMMENDATION',
        label: r.title || 'Recommandation',
        time: r.created_at,
      })),
      ...sessions.map((s) => ({
        type: 'SESSION',
        label: s.title || 'Session',
        time: s.created_at,
      })),
    ];
    if (events.length === 0) return null;
    const latest = events.sort(
      (a, b) => b.time.getTime() - a.time.getTime(),
    )[0];
    return {
      type: latest.type,
      label: latest.label,
      createdAt: latest.time.toISOString(),
    };
  }

  private expertNextAction(
    projectId: string,
    ctx: {
      actions: { title: string | null; deadline: Date | null }[];
      sessions: { title: string | null }[];
      recommendations: { title: string | null; status: string }[];
    },
  ): NextStep | null {
    const base = `/dashboard/expert/coaching/${projectId}`;
    if (ctx.actions.length > 0) {
      const sorted = [...ctx.actions].sort(
        (a, b) =>
          (a.deadline?.getTime() ?? Number.POSITIVE_INFINITY) -
          (b.deadline?.getTime() ?? Number.POSITIVE_INFINITY),
      );
      return { label: sorted[0].title ?? 'Action à traiter', link: base };
    }
    if (ctx.sessions.length > 0) {
      return {
        label: ctx.sessions[0].title || 'Prochaine session',
        link: base,
      };
    }
    const openRec = ctx.recommendations.find(
      (r) => r.status === 'OPEN' || r.status === 'IN_PROGRESS',
    );
    if (openRec) {
      return { label: openRec.title || 'Recommandation ouverte', link: base };
    }
    return null;
  }

  // ==================== OWNER ====================

  async getOwnerDashboard(userId: string): Promise<OwnerDashboardResponse> {
    const projects = await this.prisma.project.findMany({
      where: { owner_id: userId },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        is_gbm_reviewed: true,
        gbm_reviewed_at: true,
        business_plan_finalized_at: true,
        created_at: true,
        _count: { select: { generated_documents: true } },
      },
    });

    const projectIds = projects.map((p) => p.id);
    const stepRows = projectIds.length
      ? await this.prisma.stepProgress.findMany({
          where: { project_id: { in: projectIds } },
          select: { project_id: true, step_key: true, status: true },
        })
      : [];
    const stepsByProject = this.groupByProject(stepRows);

    const items: OwnerProjectItem[] = projects.map((p) => {
      const progress = this.computeProgress(stepsByProject.get(p.id) ?? []);
      return {
        id: p.id,
        name: p.name,
        description: p.description,
        isGbmReviewed: p.is_gbm_reviewed,
        gbmReviewedAt: p.gbm_reviewed_at?.toISOString() ?? null,
        isBusinessPlanFinalized: p.business_plan_finalized_at !== null,
        createdAt: p.created_at.toISOString(),
        documentsGenerated: p._count.generated_documents,
        progress,
        nextStep: this.ownerNextStep(p, progress),
      };
    });

    const notStarted = items.filter((i) => i.progress.overall === 0).length;
    const inProgress = items.filter(
      (i) => i.progress.overall > 0 && i.progress.overall < 100,
    ).length;
    const gbmReviewed = items.filter((i) => i.isGbmReviewed).length;
    const averageProgress = items.length
      ? Math.round(
          items.reduce((s, i) => s + i.progress.overall, 0) / items.length,
        )
      : 0;
    const now = Date.now();
    const recentlyCreated = items.filter(
      (i) => now - new Date(i.createdAt).getTime() <= 30 * DAY_MS,
    ).length;
    const documentsGenerated = items.reduce(
      (s, i) => s + i.documentsGenerated,
      0,
    );

    return {
      role: 'PROJECT_OWNER',
      projects: items,
      stats: {
        totalProjects: items.length,
        gbmReviewed,
        notStarted,
        inProgress,
        averageProgress,
        documentsGenerated,
        recentlyCreated,
      },
      recentActivities: await this.recentActivities(userId),
    };
  }

  // ==================== EXPERT ====================

  async getExpertDashboard(userId: string): Promise<ExpertDashboardResponse> {
    const now = new Date();

    const [assignments, cohortExperts] = await Promise.all([
      this.prisma.projectExpertAssignment.findMany({
        where: { expert_user_id: userId, status: 'ACTIVE' },
        orderBy: { assigned_at: 'desc' },
        select: {
          id: true,
          project_id: true,
          role: true,
          assigned_at: true,
          project: {
            select: {
              id: true,
              name: true,
              description: true,
              owner_id: true,
            },
          },
        },
      }),
      this.prisma.cohortExpert.findMany({
        where: { expert_user_id: userId, status: 'ACTIVE' },
        select: { cohort_id: true },
      }),
    ]);

    const projectIds = [...new Set(assignments.map((a) => a.project_id))];
    const ownerMap = await this.ownerNames([
      ...new Set(assignments.map((a) => a.project.owner_id)),
    ]);

    type StepRow = { project_id: string; step_key: string; status: string };
    type SessionRow = {
      id: string;
      assignment_id: string;
      title: string | null;
      session_type: string | null;
      scheduled_at: Date;
      status: string;
      created_at: Date;
    };
    type ActionRow = {
      id: string;
      project_id: string;
      title: string | null;
      priority: string;
      status: string;
      deadline: Date | null;
      created_at: Date;
    };
    type RecommendationRow = {
      id: string;
      project_id: string | null;
      title: string | null;
      status: string;
      created_at: Date;
    };

    let stepRows: StepRow[] = [];
    let sessions: SessionRow[] = [];
    let actions: ActionRow[] = [];
    let recommendations: RecommendationRow[] = [];
    if (projectIds.length) {
      [stepRows, sessions, actions, recommendations] = await Promise.all([
        this.prisma.stepProgress.findMany({
          where: { project_id: { in: projectIds } },
          select: { project_id: true, step_key: true, status: true },
        }),
        this.prisma.coachingSession.findMany({
          where: { assignment: { project_id: { in: projectIds } } },
          orderBy: { scheduled_at: 'asc' },
          select: {
            id: true,
            assignment_id: true,
            title: true,
            session_type: true,
            scheduled_at: true,
            status: true,
            created_at: true,
          },
        }),
        this.prisma.coachingAction.findMany({
          where: { project_id: { in: projectIds } },
          orderBy: { deadline: 'asc' },
          select: {
            id: true,
            project_id: true,
            title: true,
            priority: true,
            status: true,
            deadline: true,
            created_at: true,
          },
        }),
        this.prisma.coachingRecommendation.findMany({
          where: { project_id: { in: projectIds } },
          orderBy: { created_at: 'desc' },
          select: {
            id: true,
            project_id: true,
            title: true,
            status: true,
            created_at: true,
          },
        }),
      ]);
    }
    const notifications = await this.recentActivities(userId);

    const projectByAssignmentId = new Map(
      assignments.map((a) => [a.id, a.project_id]),
    );
    const stepsByProject = this.groupByProject(stepRows);
    const actionsByProject = this.groupByProject(actions);
    const recommendationsByProject = this.groupByProject(
      recommendations.filter(
        (r): r is RecommendationRow & { project_id: string } =>
          r.project_id !== null,
      ),
    );

    const sessionsWithProject = sessions.map((s) => ({
      ...s,
      project_id: projectByAssignmentId.get(s.assignment_id) ?? '',
    }));

    const maturityResults = await Promise.all(
      projectIds.map((pid) =>
        this.maturity
          .compute(pid)
          .then((result) => ({ pid, result }))
          .catch(() => ({ pid, result: null })),
      ),
    );
    const maturityByProject = new Map(
      maturityResults.map((m) => [m.pid, m.result]),
    );

    const projects: ExpertProjectItem[] = assignments.map((a) => {
      const progress = this.computeProgress(
        stepsByProject.get(a.project_id) ?? [],
      );
      const projectActions = actionsByProject.get(a.project_id) ?? [];
      const projectRecommendations =
        recommendationsByProject.get(a.project_id) ?? [];
      const projectSessions = sessionsWithProject.filter(
        (s) => s.project_id === a.project_id && this.isUpcoming(s, now),
      );
      const maturity = maturityByProject.get(a.project_id);
      const nextAction = this.expertNextAction(a.project_id, {
        actions: projectActions,
        sessions: projectSessions,
        recommendations: projectRecommendations,
      });
      const lastEvent = this.lastEvent(
        projectActions,
        projectRecommendations,
        sessionsWithProject.filter((s) => s.project_id === a.project_id),
      );
      return {
        id: a.project_id,
        name: a.project.name,
        description: a.project.description,
        ownerName: ownerMap.get(a.project.owner_id) ?? 'Porteur de projet',
        role: a.role,
        assignedAt: a.assigned_at.toISOString(),
        progress,
        maturity: maturity
          ? { score: maturity.globalScore, computedAt: maturity.computedAt }
          : null,
        nextAction,
        lastEvent,
      };
    });

    const openActions = actions.filter((a) =>
      OPEN_ACTION_STATUS.includes(a.status),
    );

    const upcomingSessions: UpcomingSessionItem[] = sessionsWithProject
      .filter((s) => this.isUpcoming(s, now))
      .map((s) => {
        const project = projects.find((p) => p.id === s.project_id);
        return {
          id: s.id,
          projectId: s.project_id,
          projectName: project?.name ?? 'Projet',
          title: s.title,
          sessionType: s.session_type,
          scheduledAt: s.scheduled_at.toISOString(),
          status: s.status,
        };
      });

    const [evaluationAssignments, myEvaluations] = await Promise.all([
      this.prisma.evaluationAssignment.findMany({
        where: { jury_user_id: userId },
        orderBy: [{ deadline: 'asc' }, { created_at: 'desc' }],
        select: {
          id: true,
          project_id: true,
          project: { select: { name: true } },
          cohort_id: true,
          cohort: { select: { name: true } },
          deadline: true,
          created_at: true,
        },
      }),
      this.prisma.evaluation.findMany({
        where: { jury_user_id: userId },
        orderBy: { updated_at: 'desc' },
        select: {
          id: true,
          project_id: true,
          status: true,
          updated_at: true,
          submitted_at: true,
        },
      }),
    ]);

    const latestEvalByProject = new Map<
      string,
      (typeof myEvaluations)[number]
    >();
    for (const e of myEvaluations) {
      if (!latestEvalByProject.has(e.project_id)) {
        latestEvalByProject.set(e.project_id, e);
      }
    }

    const todo: EvaluationTodoItem[] = [];
    const inProgress: EvaluationProgressItem[] = [];
    for (const a of evaluationAssignments) {
      const evaluation = latestEvalByProject.get(a.project_id);
      if (!evaluation) {
        todo.push({
          assignmentId: a.id,
          projectId: a.project_id,
          projectName: a.project.name,
          cohortId: a.cohort_id,
          cohortName: a.cohort?.name ?? null,
          deadline: a.deadline?.toISOString() ?? null,
          createdAt: a.created_at.toISOString(),
        });
      } else if (evaluation.status === 'DRAFT') {
        inProgress.push({
          evaluationId: evaluation.id,
          projectId: a.project_id,
          projectName: a.project.name,
          updatedAt: evaluation.updated_at.toISOString(),
        });
      }
    }
    const done: EvaluationProgressItem[] = myEvaluations
      .filter((e) => e.status === 'SUBMITTED')
      .map((e) => ({
        evaluationId: e.id,
        projectId: e.project_id,
        projectName:
          evaluationAssignments.find((a) => a.project_id === e.project_id)
            ?.project.name ?? 'Projet',
        submittedAt: e.submitted_at?.toISOString() ?? undefined,
      }));

    const alerts: AlertItem[] = [];
    for (const a of todo) {
      alerts.push({
        type: 'EVALUATION',
        severity: 'high',
        title: `Évaluation à faire : ${a.projectName}`,
        message: a.deadline
          ? `À rendre avant le ${new Date(a.deadline).toLocaleDateString('fr-FR')}`
          : 'Affectation d’évaluation en attente',
        link: `/dashboard/expert/evaluations-todo/${a.assignmentId}`,
      });
    }
    const overdueActions = openActions.filter(
      (a) => a.deadline && a.deadline.getTime() < now.getTime(),
    );
    for (const a of overdueActions) {
      const project = projects.find((p) => p.id === a.project_id);
      alerts.push({
        type: 'ACTION',
        severity: 'high',
        title: `Action en retard : ${a.title || 'Action'}`,
        message: `Projet « ${project?.name ?? '—'} » — échéance dépassée`,
        link: `/dashboard/expert/coaching/${a.project_id}`,
      });
    }
    for (const p of projects) {
      if (p.maturity && p.maturity.score < 50) {
        alerts.push({
          type: 'PROJECT',
          severity: 'medium',
          title: `${p.name} — maturité faible`,
          message: `Score de maturité : ${p.maturity.score}/100`,
          link: `/dashboard/expert/coaching/${p.id}`,
        });
      }
    }
    alerts.splice(8);

    return {
      role: 'EXPERT',
      projects,
      stats: {
        assignedProjects: projectIds.length,
        activeCohorts: new Set(cohortExperts.map((c) => c.cohort_id)).size,
        evaluationsTodo: todo.length,
        upcomingSessions: upcomingSessions.length,
        openActionsCount: openActions.length,
      },
      evaluations: { todo, inProgress, done },
      upcomingSessions,
      alerts,
      recentActivities: notifications,
    };
  }

  // ==================== INCUBATOR ====================

  async getIncubatorDashboard(
    userId: string,
  ): Promise<IncubatorDashboardResponse> {
    const now = new Date();

    const memberships = await this.prisma.incubatorMember.findMany({
      where: { user_id: userId, status: 'ACTIVE' },
      select: {
        incubator_id: true,
        incubator: { select: { id: true, name: true, status: true } },
      },
    });
    const incubatorIds = [...new Set(memberships.map((m) => m.incubator_id))];
    const recentActivities = await this.recentActivities(userId);

    if (incubatorIds.length === 0) {
      return {
        role: 'INCUBATOR_MEMBER',
        incubators: [],
        cohorts: [],
        portfolio: [],
        stats: {
          portfolioSize: 0,
          activeProjects: 0,
          notStarted: 0,
          needsAttention: 0,
          totalCohorts: 0,
          activeCohorts: 0,
          expertsActive: 0,
          applicationsPending: 0,
          averageProgress: 0,
        },
        experts: [],
        pendingEvaluations: [],
        upcomingSessions: [],
        jurySessions: [],
        alerts: [],
        recentActivities,
      };
    }

    const cohorts = await this.prisma.cohort.findMany({
      where: { incubator_id: { in: incubatorIds } },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        incubator_id: true,
        name: true,
        status: true,
        start_date: true,
        end_date: true,
        current_participants: true,
      },
    });
    const cohortIds = cohorts.map((c) => c.id);

    const participations = cohortIds.length
      ? await this.prisma.cohortParticipation.findMany({
          where: { cohort_id: { in: cohortIds }, status: 'ACCEPTED' },
          orderBy: { created_at: 'desc' },
          select: {
            id: true,
            project_id: true,
            cohort_id: true,
            project: {
              select: {
                id: true,
                name: true,
                description: true,
                owner_id: true,
                is_gbm_reviewed: true,
                created_at: true,
              },
            },
          },
        })
      : [];

    const projectIds = [...new Set(participations.map((p) => p.project_id))];
    const ownerMap = await this.ownerNames([
      ...new Set(participations.map((p) => p.project.owner_id)),
    ]);

    const [
      cohortExperts,
      pendingApplicationRows,
      evaluationAssignments,
      submittedEvaluations,
      jurySessions,
      stepRows,
      coachingSessions,
    ] = cohortIds.length
      ? await Promise.all([
          this.prisma.cohortExpert.findMany({
            where: { cohort_id: { in: cohortIds }, status: 'ACTIVE' },
            select: {
              expert_user_id: true,
              cohort_id: true,
              role: true,
            },
          }),
          this.prisma.cohortParticipation.findMany({
            where: { cohort_id: { in: cohortIds }, status: 'PENDING' },
            select: { cohort_id: true },
          }),
          this.prisma.evaluationAssignment.findMany({
            where: { cohort_id: { in: cohortIds } },
            select: {
              id: true,
              project_id: true,
              jury_user_id: true,
              cohort_id: true,
            },
          }),
          projectIds.length
            ? this.prisma.evaluation.findMany({
                where: {
                  project_id: { in: projectIds },
                  status: 'SUBMITTED',
                },
                select: { project_id: true, jury_user_id: true },
              })
            : [],
          this.prisma.jurySession.findMany({
            where: {
              cohort_id: { in: cohortIds },
              status: { in: ['DRAFT', 'OPEN', 'DELIBERATION'] },
            },
            orderBy: { created_at: 'desc' },
            select: {
              id: true,
              project_id: true,
              cohort_id: true,
              title: true,
              status: true,
              created_at: true,
              project: { select: { name: true } },
              cohort: { select: { name: true } },
            },
          }),
          projectIds.length
            ? this.prisma.stepProgress.findMany({
                where: { project_id: { in: projectIds } },
                select: { project_id: true, step_key: true, status: true },
              })
            : [],
          projectIds.length
            ? this.prisma.coachingSession.findMany({
                where: { assignment: { project_id: { in: projectIds } } },
                orderBy: { scheduled_at: 'asc' },
                select: {
                  id: true,
                  title: true,
                  session_type: true,
                  scheduled_at: true,
                  status: true,
                  assignment: { select: { project_id: true } },
                },
              })
            : [],
        ])
      : [[], [], [], [], [], [], []];

    const stepsByProject = this.groupByProject(stepRows);
    const cohortNameById = new Map(cohorts.map((c) => [c.id, c.name]));

    const portfolio: PortfolioProjectItem[] = participations.map((p) => {
      const progress = this.computeProgress(
        stepsByProject.get(p.project_id) ?? [],
      );
      return {
        id: p.project.id,
        name: p.project.name,
        description: p.project.description,
        ownerId: p.project.owner_id,
        ownerName: ownerMap.get(p.project.owner_id) ?? 'Porteur de projet',
        cohortId: p.cohort_id,
        cohortName: cohortNameById.get(p.cohort_id) ?? null,
        isGbmReviewed: p.project.is_gbm_reviewed,
        createdAt: p.project.created_at.toISOString(),
        progress,
      };
    });

    const submittedKeys = new Set(
      submittedEvaluations.map(
        (e: { project_id: string; jury_user_id: string }) =>
          `${e.project_id}:${e.jury_user_id}`,
      ),
    );
    const pendingMap = new Map<
      string,
      { projectId: string; cohortId: string; pending: number }
    >();
    for (const a of evaluationAssignments) {
      if (submittedKeys.has(`${a.project_id}:${a.jury_user_id}`)) continue;
      const entry = pendingMap.get(a.project_id) ?? {
        projectId: a.project_id,
        cohortId: a.cohort_id,
        pending: 0,
      };
      entry.pending += 1;
      pendingMap.set(a.project_id, entry);
    }
    const pendingEvaluations: PendingEvaluationItem[] = [...pendingMap.values()]
      .map((entry) => {
        const participation = participations.find(
          (p) => p.project_id === entry.projectId,
        );
        return {
          projectId: entry.projectId,
          projectName: participation?.project.name ?? 'Projet',
          cohortId: entry.cohortId,
          cohortName: cohortNameById.get(entry.cohortId) ?? null,
          pending: entry.pending,
        };
      })
      .sort((a, b) => b.pending - a.pending);

    const portfolioByIncubator = new Map<string, number>();
    for (const p of participations) {
      const cohort = cohorts.find((c) => c.id === p.cohort_id);
      if (!cohort?.incubator_id) continue;
      portfolioByIncubator.set(
        cohort.incubator_id,
        (portfolioByIncubator.get(cohort.incubator_id) ?? 0) + 1,
      );
    }

    const incubators: IncubatorSummaryItem[] = incubatorIds.map((id) => {
      const incubator = memberships.find(
        (m) => m.incubator_id === id,
      )?.incubator;
      const cohortIdsForInc = cohorts
        .filter((c) => c.incubator_id === id)
        .map((c) => c.id);
      const activeCohorts = cohorts.filter(
        (c) =>
          cohortIdsForInc.includes(c.id) &&
          (c.status === 'OPEN' || c.status === 'IN_PROGRESS'),
      ).length;
      return {
        id,
        name: incubator?.name ?? 'Incubateur',
        status: incubator?.status ?? 'ACTIVE',
        activeCohorts,
        portfolioSize: portfolioByIncubator.get(id) ?? 0,
      };
    });

    const cohortSummary: CohortSummaryItem[] = cohorts.map((c) => ({
      id: c.id,
      incubatorId: c.incubator_id ?? '',
      name: c.name,
      status: c.status,
      startDate: c.start_date?.toISOString() ?? null,
      endDate: c.end_date?.toISOString() ?? null,
      participants: c.current_participants,
    }));

    const expertUserIds = [
      ...new Set(cohortExperts.map((e) => e.expert_user_id)),
    ];
    const expertNameMap = await this.ownerNames(expertUserIds);
    const expertMap = new Map<
      string,
      {
        id: string;
        name: string;
        roles: { cohortId: string; cohortName: string; role: string }[];
      }
    >();
    for (const ce of cohortExperts) {
      const entry = expertMap.get(ce.expert_user_id) ?? {
        id: ce.expert_user_id,
        name: expertNameMap.get(ce.expert_user_id) ?? 'Expert',
        roles: [],
      };
      entry.roles.push({
        cohortId: ce.cohort_id,
        cohortName: cohortNameById.get(ce.cohort_id) ?? 'Cohorte',
        role: ce.role,
      });
      expertMap.set(ce.expert_user_id, entry);
    }
    const experts: ExpertSummaryItem[] = [...expertMap.values()];

    const upcomingSessions: UpcomingSessionItem[] = coachingSessions
      .filter((s) => this.isUpcoming(s, now))
      .map((s) => {
        const project = portfolio.find(
          (p) => p.id === s.assignment?.project_id,
        );
        return {
          id: s.id,
          projectId: s.assignment?.project_id ?? '',
          projectName: project?.name ?? 'Projet',
          title: s.title,
          sessionType: s.session_type,
          scheduledAt: s.scheduled_at.toISOString(),
          status: s.status,
        };
      });

    const jurySessionItems: JurySessionItem[] = jurySessions.map((js) => ({
      id: js.id,
      projectId: js.project_id,
      projectName: js.project?.name ?? 'Projet',
      cohortId: js.cohort_id,
      cohortName: js.cohort?.name ?? 'Cohorte',
      title: js.title,
      status: js.status,
      createdAt: js.created_at.toISOString(),
    }));

    const notStartedProjects = portfolio.filter(
      (p) => p.progress.overall === 0,
    ).length;
    const applicationsPending = pendingApplicationRows.length;

    const stats = {
      portfolioSize: portfolio.length,
      activeProjects: portfolio.filter(
        (p) => p.progress.overall > 0 && p.progress.overall < 100,
      ).length,
      notStarted: notStartedProjects,
      needsAttention: notStartedProjects + pendingEvaluations.length,
      totalCohorts: cohorts.length,
      activeCohorts: cohorts.filter(
        (c) => c.status === 'OPEN' || c.status === 'IN_PROGRESS',
      ).length,
      expertsActive: experts.length,
      applicationsPending,
      averageProgress: portfolio.length
        ? Math.round(
            portfolio.reduce((s, p) => s + p.progress.overall, 0) /
              portfolio.length,
          )
        : 0,
    };

    const alerts: AlertItem[] = [];
    for (const item of pendingEvaluations.slice(0, 4)) {
      alerts.push({
        type: 'EVALUATION',
        severity: 'high',
        title: `Évaluations manquantes : ${item.projectName}`,
        message: `${item.pending} affectation(s) de jury sans évaluation soumise`,
        link: `/dashboard/incubator/${this.cohortIncubator(item.cohortId, cohorts)}/cohorts/${item.cohortId}`,
      });
    }
    const openJurySessions = jurySessionItems.filter(
      (js) => js.status === 'OPEN' || js.status === 'DELIBERATION',
    );
    for (const js of openJurySessions.slice(0, 3)) {
      alerts.push({
        type: 'JURY',
        severity: 'medium',
        title: `Session de jury en cours : ${js.projectName}`,
        message:
          js.title ??
          `Session ${js.status.toLowerCase()} sur la cohorte ${js.cohortName}`,
        link: `/dashboard/incubator/${this.cohortIncubator(js.cohortId, cohorts)}/cohorts/${js.cohortId}`,
      });
    }
    alerts.splice(8);

    return {
      role: 'INCUBATOR_MEMBER',
      incubators,
      cohorts: cohortSummary,
      portfolio,
      stats,
      experts,
      pendingEvaluations,
      upcomingSessions,
      jurySessions: jurySessionItems,
      alerts,
      recentActivities,
    };
  }

  private cohortIncubator(
    cohortId: string,
    cohorts: { id: string; incubator_id: string | null }[],
  ): string {
    return cohorts.find((c) => c.id === cohortId)?.incubator_id ?? '';
  }
}
