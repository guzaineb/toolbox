import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  CohortStatus,
  CohortExpertStatus,
  ParticipationStatus,
} from '@prisma/client';
import { CreateCohortDto } from './dto/create-cohort.dto';
import { UpdateCohortDto } from './dto/update-cohort.dto';
import { NotificationEvent } from '../events/notification-event.enum';
import { NotificationPayload } from '../events/notification-payload.interface';
import { NotificationMessageBuilder } from '../events/notification-message-builder';
import { ModuleAccessService } from '../common/services/module-access.service';
import { GBM_STEPS } from '../gbm/step-config';

const ALLOWED_TRANSITIONS: Record<string, CohortStatus[]> = {
  DRAFT: [CohortStatus.OPEN, CohortStatus.ARCHIVED],
  OPEN: [CohortStatus.IN_PROGRESS, CohortStatus.CLOSED, CohortStatus.ARCHIVED],
  IN_PROGRESS: [CohortStatus.CLOSED, CohortStatus.ARCHIVED],
  CLOSED: [CohortStatus.ARCHIVED],
  ARCHIVED: [],
};

@Injectable()
export class CohortsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly messageBuilder: NotificationMessageBuilder,
    private readonly access: ModuleAccessService,
  ) {}

  async create(incubatorId: string, dto: CreateCohortDto, userId: string) {
    await this.access.assertCanManageCohorts(userId, incubatorId);

    const cohort = await this.prisma.cohort.create({
      data: {
        name: dto.name,
        program: dto.program,
        description: dto.description,
        capacity: dto.capacity,
        application_deadline: dto.application_deadline
          ? new Date(dto.application_deadline)
          : undefined,
        start_date: dto.start_date ? new Date(dto.start_date) : undefined,
        end_date: dto.end_date ? new Date(dto.end_date) : undefined,
        incubator_id: incubatorId,
        status: CohortStatus.DRAFT,
      },
    });

    const incubator = await this.prisma.incubator.findUnique({
      where: { id: incubatorId },
      select: { name: true },
    });
    const members = await this.prisma.incubatorMember.findMany({
      where: { incubator_id: incubatorId, status: 'ACTIVE' },
      select: { user_id: true },
    });
    const memberIds = members.map((m) => m.user_id);
    if (memberIds.length > 0) {
      const { title, message } = this.messageBuilder.cohortCreated({
        cohortName: cohort.name,
        incubatorName: incubator?.name ?? 'Incubateur',
      });
      this.eventEmitter.emit(NotificationEvent.COHORT_CREATED, {
        event: NotificationEvent.COHORT_CREATED,
        recipients: memberIds.map((id) => ({ userId: id })),
        title,
        message,
        link: `/incubator/${incubatorId}/cohorts/${cohort.id}`,
        senderId: userId,
        resourceType: 'COHORT',
        resourceId: cohort.id,
      } as NotificationPayload);
    }

    return cohort;
  }

  async findAllByIncubator(incubatorId: string) {
    return this.prisma.cohort.findMany({
      where: { incubator_id: incubatorId },
      include: {
        participations: {
          include: { project: { select: { id: true, name: true } } },
        },
        experts: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOpenCohorts() {
    return this.prisma.cohort.findMany({
      where: {
        status: CohortStatus.OPEN,
        OR: [
          { application_deadline: null },
          { application_deadline: { gte: new Date() } },
        ],
      },
      include: {
        _count: { select: { participations: true } },
        incubator: { select: { id: true, name: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  // ==================== COHORTES DISPONIBLES (pour un utilisateur connecté) ====================

  async findAvailableCohorts(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    const now = new Date();
    const whereBase: any = {
      status: CohortStatus.OPEN,
      OR: [
        { application_deadline: null },
        { application_deadline: { gte: now } },
      ],
    };

    if (user.role === 'EXPERT') {
      const myExpertIds = (
        await this.prisma.cohortExpert.findMany({
          where: {
            expert_user_id: userId,
            status: {
              in: [CohortExpertStatus.PENDING, CohortExpertStatus.ACTIVE],
            },
          },
          select: { cohort_id: true },
        })
      ).map((e) => e.cohort_id);

      if (myExpertIds.length > 0) {
        whereBase.NOT = { id: { in: myExpertIds } };
      }
    } else if (user.role === 'PROJECT_OWNER') {
      const myProjects = await this.prisma.project.findMany({
        where: { owner_id: userId },
        select: { id: true },
      });
      const myProjectIds = myProjects.map((p) => p.id);

      if (myProjectIds.length > 0) {
        const myCohortIds = (
          await this.prisma.cohortParticipation.findMany({
            where: {
              project_id: { in: myProjectIds },
              status: {
                in: [ParticipationStatus.PENDING, ParticipationStatus.ACCEPTED],
              },
            },
            select: { cohort_id: true },
          })
        ).map((p) => p.cohort_id);

        if (myCohortIds.length > 0) {
          whereBase.NOT = { id: { in: myCohortIds } };
        }
      }
    }

    const cohorts = await this.prisma.cohort.findMany({
      where: whereBase,
      include: {
        _count: { select: { participations: true } },
        incubator: { select: { id: true, name: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    return cohorts.filter((c) => {
      if (c.capacity && c.current_participants >= c.capacity) return false;
      return true;
    });
  }

  // ==================== MES COHORTES ====================

  async findMyCohorts(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    if (user.role === 'EXPERT') {
      return this.prisma.cohortExpert.findMany({
        where: { expert_user_id: userId },
        include: {
          cohort: {
            include: {
              incubator: { select: { id: true, name: true } },
              _count: { select: { participations: true } },
            },
          },
        },
        orderBy: { assigned_at: 'desc' },
      });
    }

    if (user.role === 'PROJECT_OWNER') {
      const myProjects = await this.prisma.project.findMany({
        where: { owner_id: userId },
        select: {
          id: true,
          name: true,
          description: true,
          owner_id: true,
          created_at: true,
          updated_at: true,
        },
      });
      const myProjectIds = myProjects.map((p) => p.id);

      if (myProjectIds.length === 0) return [];

      const participations = await this.prisma.cohortParticipation.findMany({
        where: { project_id: { in: myProjectIds } },
        include: {
          cohort: {
            include: {
              incubator: { select: { id: true, name: true } },
              _count: { select: { participations: true } },
            },
          },
          project: {
            select: { id: true, name: true, description: true, owner_id: true },
          },
        },
        orderBy: { applied_at: 'desc' },
      });

      return participations;
    }

    return [];
  }

  async findOne(id: string) {
    const cohort = await this.prisma.cohort.findUnique({
      where: { id },
      include: {
        participations: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                description: true,
                owner_id: true,
              },
            },
          },
        },
        experts: {
          include: {
            expertUser: {
              include: { profile: true, expertProfile: true },
            },
          },
        },
        incubator: { select: { id: true, name: true } },
      },
    });
    if (!cohort) throw new NotFoundException('Cohorte introuvable');
    return cohort;
  }

  async update(id: string, dto: UpdateCohortDto, userId: string) {
    const cohort = await this.prisma.cohort.findUnique({ where: { id } });
    if (!cohort) throw new NotFoundException('Cohorte introuvable');
    if (!cohort.incubator_id)
      throw new BadRequestException('Cohorte sans incubateur');

    await this.access.assertCanManageCohorts(userId, cohort.incubator_id);

    if (
      dto.capacity !== undefined &&
      cohort.current_participants > dto.capacity
    ) {
      throw new BadRequestException(
        `La capacité (${dto.capacity}) est inférieure au nombre actuel de participants (${cohort.current_participants})`,
      );
    }

    return this.prisma.cohort.update({
      where: { id },
      data: {
        name: dto.name,
        program: dto.program,
        description: dto.description,
        capacity: dto.capacity,
        application_deadline: dto.application_deadline
          ? new Date(dto.application_deadline)
          : undefined,
        start_date: dto.start_date ? new Date(dto.start_date) : undefined,
        end_date: dto.end_date ? new Date(dto.end_date) : undefined,
      },
    });
  }

  async changeStatus(id: string, targetStatus: CohortStatus, userId: string) {
    const cohort = await this.prisma.cohort.findUnique({ where: { id } });
    if (!cohort) throw new NotFoundException('Cohorte introuvable');
    if (!cohort.incubator_id)
      throw new BadRequestException('Cohorte sans incubateur');

    await this.access.assertCanManageCohorts(userId, cohort.incubator_id);

    const allowed = ALLOWED_TRANSITIONS[cohort.status] || [];
    if (!allowed.includes(targetStatus)) {
      throw new BadRequestException(
        `Transition invalide : ${cohort.status} → ${targetStatus}`,
      );
    }

    if (targetStatus === CohortStatus.OPEN) {
      if (cohort.capacity && cohort.current_participants >= cohort.capacity) {
        throw new BadRequestException('La cohorte est déjà pleine');
      }
    }

    return this.prisma.cohort.update({
      where: { id },
      data: { status: targetStatus },
    });
  }

  async publish(id: string, userId: string) {
    const cohort = await this.changeStatus(id, CohortStatus.OPEN, userId);

    const incubatorName = cohort.incubator_id
      ? (
          await this.prisma.incubator.findUnique({
            where: { id: cohort.incubator_id },
            select: { name: true },
          })
        )?.name
      : undefined;

    const members = cohort.incubator_id
      ? await this.prisma.incubatorMember.findMany({
          where: { incubator_id: cohort.incubator_id, status: 'ACTIVE' },
          select: { user_id: true },
        })
      : [];
    const memberIds = members.map((m) => m.user_id);
    if (memberIds.length > 0) {
      const { title, message } = this.messageBuilder.applicationOpen({
        cohortName: cohort.name,
        incubatorName: incubatorName ?? 'Incubateur',
      });
      this.eventEmitter.emit(NotificationEvent.APPLICATION_OPEN, {
        event: NotificationEvent.APPLICATION_OPEN,
        recipients: memberIds.map((id) => ({ userId: id })),
        title,
        message,
        link: `/incubator/${cohort.incubator_id}/cohorts/${cohort.id}`,
        senderId: userId,
        resourceType: 'COHORT',
        resourceId: cohort.id,
      } as NotificationPayload);
    }

    return cohort;
  }

  async start(id: string, userId: string) {
    return this.changeStatus(id, CohortStatus.IN_PROGRESS, userId);
  }

  async close(id: string, userId: string) {
    return this.changeStatus(id, CohortStatus.CLOSED, userId);
  }

  async archive(id: string, userId: string) {
    return this.changeStatus(id, CohortStatus.ARCHIVED, userId);
  }

  async closeCohortsAutomatically(): Promise<string[]> {
    const now = new Date();

    const openCohorts = await this.prisma.cohort.findMany({
      where: { status: CohortStatus.OPEN },
      select: {
        id: true,
        capacity: true,
        current_participants: true,
        application_deadline: true,
      },
    });

    const idsToClose = openCohorts
      .filter((c) => {
        if (c.capacity && c.current_participants >= c.capacity) return true;
        if (c.application_deadline && c.application_deadline < now) return true;
        return false;
      })
      .map((c) => c.id);

    if (idsToClose.length === 0) return [];

    await this.prisma.cohort.updateMany({
      where: { id: { in: idsToClose }, status: CohortStatus.OPEN },
      data: { status: CohortStatus.CLOSED },
    });

    return idsToClose;
  }

  // ==================== PROJETS DE COACHING D'UNE COHORTE POUR UN EXPERT ====================

  async findCoachingProjects(cohortId: string, userId: string) {
    const cohort = await this.prisma.cohort.findUnique({
      where: { id: cohortId },
      select: { id: true, name: true, incubator_id: true },
    });
    if (!cohort) throw new NotFoundException('Cohorte introuvable');

    const isCoach = await this.prisma.cohortExpert.findFirst({
      where: {
        cohort_id: cohortId,
        expert_user_id: userId,
        role: 'COACH',
        status: 'ACTIVE',
      },
      select: { id: true },
    });
    if (!isCoach) {
      throw new ForbiddenException(
        "Vous n'êtes pas coach actif dans cette cohorte",
      );
    }

    const participations = await this.prisma.cohortParticipation.findMany({
      where: {
        cohort_id: cohortId,
        status: ParticipationStatus.ACCEPTED,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            owner_id: true,
          },
        },
      },
      orderBy: { applied_at: 'desc' },
    });

    const projectIds = participations.map((p) => p.project_id);

    const assignments = await this.prisma.projectExpertAssignment.findMany({
      where: {
        project_id: { in: projectIds },
        expert_user_id: userId,
      },
      include: {
        project: { select: { id: true } },
      },
    });

    const assignmentsByProject = new Map(
      assignments.map((a) => [a.project_id, a]),
    );

    const sessionsByProject = new Map<string, number>();
    const recommendationsByProject = new Map<string, number>();
    const actionsByProject = new Map<
      string,
      { pending: number; total: number }
    >();
    const progressionByProject = new Map<string, number>();
    const documentsByProject = new Map<string, number>();
    let allSessions: Array<{
      assignment: { project_id: string } | null;
      status: string;
      scheduled_at: Date;
    }> = [];

    if (projectIds.length > 0) {
      const gbmStepKeys = new Set(GBM_STEPS.map((s) => s.stepKey));
      const [sessions, recommendations, actions, stepProgress, documents] =
        await Promise.all([
          this.prisma.coachingSession.findMany({
            where: {
              assignment: {
                project_id: { in: projectIds },
                expert_user_id: userId,
              },
            },
            select: {
              assignment: { select: { project_id: true } },
              status: true,
              scheduled_at: true,
            },
            orderBy: { scheduled_at: 'desc' },
          }),
          this.prisma.coachingRecommendation.findMany({
            where: { project_id: { in: projectIds }, author_id: userId },
            select: { project_id: true },
          }),
          this.prisma.coachingAction.findMany({
            where: { project_id: { in: projectIds } },
            select: { project_id: true, status: true },
          }),
          this.prisma.stepProgress.findMany({
            where: { project_id: { in: projectIds } },
            select: { project_id: true, step_key: true, status: true },
          }),
          this.prisma.generatedDocument.findMany({
            where: {
              project_id: { in: projectIds },
              status: { not: 'NOT_GENERATED' },
            },
            select: { project_id: true },
          }),
        ]);

      allSessions = sessions;

      for (const s of sessions) {
        const pid = s.assignment?.project_id;
        if (pid)
          sessionsByProject.set(pid, (sessionsByProject.get(pid) || 0) + 1);
      }
      for (const r of recommendations) {
        if (r.project_id) {
          recommendationsByProject.set(
            r.project_id,
            (recommendationsByProject.get(r.project_id) || 0) + 1,
          );
        }
      }
      for (const a of actions) {
        const current = actionsByProject.get(a.project_id) || {
          pending: 0,
          total: 0,
        };
        current.total++;
        if (['PENDING', 'IN_PROGRESS', 'SUBMITTED'].includes(a.status))
          current.pending++;
        actionsByProject.set(a.project_id, current);
      }

      const completedByProject = new Map<string, number>();
      for (const sp of stepProgress) {
        if (!gbmStepKeys.has(sp.step_key)) continue;
        if (sp.status === 'COMPLETED') {
          completedByProject.set(
            sp.project_id,
            (completedByProject.get(sp.project_id) || 0) + 1,
          );
        }
      }
      const gbmTotal = GBM_STEPS.length || 1;
      for (const pid of projectIds) {
        progressionByProject.set(
          pid,
          Math.round(((completedByProject.get(pid) || 0) / gbmTotal) * 100),
        );
      }

      for (const d of documents) {
        documentsByProject.set(
          d.project_id,
          (documentsByProject.get(d.project_id) || 0) + 1,
        );
      }
    }

    return participations.map((p) => {
      const assignment = assignmentsByProject.get(p.project_id);
      const lastSession = allSessions.find(
        (s) =>
          s.assignment?.project_id === p.project_id && s.status === 'COMPLETED',
      );

      let nextSession: { scheduled_at: Date } | null = null;
      const now = new Date();
      for (const s of allSessions) {
        if (
          s.assignment?.project_id === p.project_id &&
          s.status === 'SCHEDULED' &&
          new Date(s.scheduled_at) > now
        ) {
          nextSession = { scheduled_at: s.scheduled_at };
          break;
        }
      }

      return {
        project: p.project,
        assignment: assignment
          ? {
              id: assignment.id,
              role: assignment.role,
              status: assignment.status,
            }
          : null,
        cohort_participation: { status: p.status, applied_at: p.applied_at },
        stats: {
          sessions_count: sessionsByProject.get(p.project_id) || 0,
          last_session_at: lastSession?.scheduled_at ?? null,
          next_session_at: nextSession?.scheduled_at ?? null,
          recommendations_count:
            recommendationsByProject.get(p.project_id) || 0,
          actions_pending: actionsByProject.get(p.project_id)?.pending || 0,
          actions_total: actionsByProject.get(p.project_id)?.total || 0,
          gbm_progression: progressionByProject.get(p.project_id) ?? 0,
          documents_generated: documentsByProject.get(p.project_id) || 0,
        },
      };
    });
  }

  async getProgress(id: string) {
    const cohort = await this.prisma.cohort.findUnique({
      where: { id },
      select: { capacity: true, current_participants: true },
    });
    if (!cohort) throw new NotFoundException('Cohorte introuvable');

    return {
      capacity: cohort.capacity,
      current_participants: cohort.current_participants,
      is_full: cohort.capacity
        ? cohort.current_participants >= cohort.capacity
        : false,
      percentage: cohort.capacity
        ? Math.round((cohort.current_participants / cohort.capacity) * 100)
        : 0,
    };
  }
}
