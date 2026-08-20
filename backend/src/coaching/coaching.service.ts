import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  CoachingActionPriority,
  CoachingActionStatus,
  CoachingRecommendationStatus,
  CoachingSessionStatus,
  CohortExpertRole,
  CohortExpertStatus,
  ParticipationStatus,
  ResourceType,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ModuleAccessService } from '../common/services/module-access.service';
import { AuditService } from '../audit/audit.service';
import { NotificationMessageBuilder } from '../events/notification-message-builder';
import { NotificationEvent } from '../events/notification-event.enum';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { UpdateRecommendationDto } from './dto/update-recommendation.dto';
import { CreateActionDto } from './dto/create-action.dto';
import { UpdateActionDto } from './dto/update-action.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CoachingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ModuleAccessService,
    private readonly audit: AuditService,
    private readonly messageBuilder: NotificationMessageBuilder,
  ) {}

  // ==================== SESSIONS ====================

  async createSession(projectId: string, dto: CreateSessionDto, userId: string) {
    await this.access.assertProjectExists(projectId);
    await this.assertCanCoachOrManage(projectId, userId);

    const assignment = await this.prisma.projectExpertAssignment.findFirst({
      where: {
        project_id: projectId,
        expert_user_id: userId,
        role: CohortExpertRole.COACH,
        status: CohortExpertStatus.ACTIVE,
      },
      select: { id: true },
    });
    if (!assignment) {
      throw new ForbiddenException(
        "Vous devez être le coach affecté pour créer une session",
      );
    }

    const session = await this.prisma.coachingSession.create({
      data: {
        assignment_id: assignment.id,
        title: dto.title,
        scheduled_at: new Date(dto.scheduledAt),
        duration_minutes: dto.durationMinutes,
        report: dto.report,
        created_by: userId,
        status: CoachingSessionStatus.SCHEDULED,
      },
      include: {
        assignment: { include: { project: { select: { id: true, name: true, owner_id: true } } } },
      },
    });

    await this.audit.log({
      actorId: userId,
      action: 'COACHING_SESSION_CREATE',
      entityType: 'CoachingSession',
      entityId: session.id,
      metadata: { project_id: projectId, scheduled_at: dto.scheduledAt },
    });

    const { title, message } = this.messageBuilder.coachingSessionScheduled({
      projectName: session.assignment.project.name,
      sessionTitle: session.title ?? undefined,
      scheduledAt: session.scheduled_at,
    });
    this.access.notify({
      event: NotificationEvent.COACHING_SESSION_SCHEDULED,
      recipients: [{ userId: session.assignment.project.owner_id }],
      title,
      message,
      link: `/project-owner/projects/${projectId}/coaching`,
      senderId: userId,
      resourceType: ResourceType.COACHING,
      resourceId: projectId,
    });

    return session;
  }

  async findSessionsByProject(projectId: string, userId: string) {
    await this.access.assertProjectExists(projectId);
    await this.assertCanViewCoaching(projectId, userId);

    return this.prisma.coachingSession.findMany({
      where: { assignment: { project_id: projectId } },
      include: {
        assignment: {
          include: {
            expertUser: { select: { id: true, email: true, profile: true } },
          },
        },
        actions: { select: { id: true, title: true, status: true } },
        recommendations: { select: { id: true, title: true, content: true } },
      },
      orderBy: { scheduled_at: 'desc' },
    });
  }

  async findSessionById(id: string, userId: string) {
    const session = await this.prisma.coachingSession.findUnique({
      where: { id },
      include: {
        assignment: {
          include: {
            project: { select: { id: true, name: true, owner_id: true } },
            expertUser: { select: { id: true, email: true, profile: true } },
          },
        },
        actions: true,
        recommendations: true,
        comments: { include: { author: { select: { id: true, email: true, profile: true } } }, orderBy: { created_at: 'asc' } },
      },
    });
    if (!session) throw new NotFoundException('Session introuvable');
    await this.assertCanViewCoaching(session.assignment.project_id, userId);
    return session;
  }

  async updateSession(id: string, dto: UpdateSessionDto, userId: string) {
    const session = await this.prisma.coachingSession.findUnique({
      where: { id },
      include: { assignment: { include: { project: { select: { id: true, name: true, owner_id: true } } } } },
    });
    if (!session) throw new NotFoundException('Session introuvable');

    await this.assertIsSessionCoachOrManager(session, userId);

    let status = session.status;
    if (dto.status) status = dto.status;
    if (!dto.status && dto.scheduledAt && new Date(dto.scheduledAt).getTime() !== session.scheduled_at.getTime()) {
      status = CoachingSessionStatus.RESCHEDULED;
    }

    const updated = await this.prisma.coachingSession.update({
      where: { id },
      data: {
        title: dto.title,
        scheduled_at: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        duration_minutes: dto.durationMinutes,
        report: dto.report,
        status,
        completed_at:
          status === CoachingSessionStatus.COMPLETED ? new Date() : session.completed_at,
      },
      include: { assignment: { include: { project: { select: { id: true, name: true, owner_id: true } } } } },
    });

    await this.audit.log({
      actorId: userId,
      action: 'COACHING_SESSION_UPDATE',
      entityType: 'CoachingSession',
      entityId: id,
      metadata: { ...dto },
    });

    const project = updated.assignment.project;
    if (status === CoachingSessionStatus.CANCELLED) {
      const { title, message } = this.messageBuilder.coachingSessionCancelled({
        projectName: project.name,
      });
      this.access.notify({
        event: NotificationEvent.COACHING_SESSION_CANCELLED,
        recipients: [{ userId: project.owner_id }],
        title,
        message,
        link: `/project-owner/projects/${project.id}/coaching`,
        senderId: userId,
        resourceType: ResourceType.COACHING,
        resourceId: project.id,
      });
    } else if (status === CoachingSessionStatus.COMPLETED) {
      const { title, message } = this.messageBuilder.coachingSessionCompleted({
        projectName: project.name,
      });
      this.access.notify({
        event: NotificationEvent.COACHING_SESSION_COMPLETED,
        recipients: [{ userId: project.owner_id }],
        title,
        message,
        link: `/project-owner/projects/${project.id}/coaching`,
        senderId: userId,
        resourceType: ResourceType.COACHING,
        resourceId: project.id,
      });
    } else if (status === CoachingSessionStatus.RESCHEDULED || dto.scheduledAt) {
      const { title, message } = this.messageBuilder.coachingSessionUpdated({
        projectName: project.name,
        scheduledAt: updated.scheduled_at,
      });
      this.access.notify({
        event: NotificationEvent.COACHING_SESSION_UPDATED,
        recipients: [{ userId: project.owner_id }],
        title,
        message,
        link: `/project-owner/projects/${project.id}/coaching`,
        senderId: userId,
        resourceType: ResourceType.COACHING,
        resourceId: project.id,
      });
    }

    return updated;
  }

  async completeSession(id: string, dto: { report?: string }, userId: string) {
    const session = await this.prisma.coachingSession.findUnique({
      where: { id },
      include: { assignment: { include: { project: { select: { id: true, name: true, owner_id: true } } } } },
    });
    if (!session) throw new NotFoundException('Session introuvable');

    const assignment = await this.prisma.projectExpertAssignment.findUnique({
      where: { id: session.assignment_id },
    });
    if (!assignment || assignment.expert_user_id !== userId || assignment.status !== CohortExpertStatus.ACTIVE) {
      throw new ForbiddenException("Seul le coach de la session peut la clôturer");
    }

    const completed = await this.prisma.coachingSession.update({
      where: { id },
      data: {
        status: CoachingSessionStatus.COMPLETED,
        completed_at: new Date(),
        report: dto.report ?? session.report,
      },
      include: { assignment: { include: { project: { select: { id: true, name: true, owner_id: true } } } } },
    });

    const { title, message } = this.messageBuilder.coachingSessionCompleted({
      projectName: completed.assignment.project.name,
    });
    this.access.notify({
      event: NotificationEvent.COACHING_SESSION_COMPLETED,
      recipients: [{ userId: completed.assignment.project.owner_id }],
      title,
      message,
      link: `/project-owner/projects/${completed.assignment.project.id}/coaching`,
      senderId: userId,
      resourceType: ResourceType.COACHING,
      resourceId: completed.assignment.project.id,
    });

    return completed;
  }

  // ==================== RECOMMANDATIONS ====================

  async createRecommendation(projectId: string, dto: CreateRecommendationDto, userId: string) {
    await this.access.assertProjectExists(projectId);
    await this.assertCanCoachOrManage(projectId, userId);

    if (dto.sessionId) {
      const session = await this.prisma.coachingSession.findUnique({
        where: { id: dto.sessionId },
        select: { assignment: { select: { project_id: true } } },
      });
      if (!session || session.assignment.project_id !== projectId) {
        throw new BadRequestException('La session indiquée ne concerne pas ce projet');
      }
    }

    const recommendation = await this.prisma.coachingRecommendation.create({
      data: {
        project_id: projectId,
        session_id: dto.sessionId ?? null,
        author_id: userId,
        title: dto.title,
        content: dto.content,
        priority: dto.priority ?? CoachingActionPriority.MEDIUM,
        status: CoachingRecommendationStatus.OPEN,
      },
      include: { project: { select: { id: true, name: true, owner_id: true } } },
    });

    await this.audit.log({
      actorId: userId,
      action: 'COACHING_RECOMMENDATION_CREATE',
      entityType: 'CoachingRecommendation',
      entityId: recommendation.id,
      metadata: { project_id: projectId },
    });

    const { title, message } = this.messageBuilder.coachingRecommendationAdded({
      projectName: recommendation.project?.name ?? 'Projet',
    });
    this.access.notify({
      event: NotificationEvent.COACHING_RECOMMENDATION_ADDED,
      recipients: [{ userId: recommendation.project?.owner_id ?? userId }],
      title,
      message,
      link: `/project-owner/projects/${projectId}/coaching`,
      senderId: userId,
      resourceType: ResourceType.COACHING,
      resourceId: projectId,
    });

    return recommendation;
  }

  async findRecommendationsByProject(projectId: string, userId: string) {
    await this.access.assertProjectExists(projectId);
    await this.assertCanViewCoaching(projectId, userId);
    return this.prisma.coachingRecommendation.findMany({
      where: { project_id: projectId },
      include: {
        author: { select: { id: true, email: true, profile: true } },
        session: { select: { id: true, title: true, scheduled_at: true } },
        actions: { select: { id: true, title: true, status: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async updateRecommendation(id: string, dto: UpdateRecommendationDto, userId: string) {
    const recommendation = await this.prisma.coachingRecommendation.findUnique({
      where: { id },
      include: { project: { select: { id: true, name: true, owner_id: true } } },
    });
    if (!recommendation) throw new NotFoundException('Recommandation introuvable');

    const isAuthor = recommendation.author_id === userId;
    const isOwner = recommendation.project?.owner_id === userId;
    if (!isAuthor && !isOwner) {
      await this.assertCanManageProjectCohort(recommendation.project_id ?? recommendation.project!.id, userId);
    }

    return this.prisma.coachingRecommendation.update({
      where: { id },
      data: {
        title: dto.title,
        content: dto.content,
        status: dto.status,
      },
      include: { project: { select: { id: true, name: true } } },
    });
  }

  // ==================== ACTIONS ====================

  async createAction(projectId: string, dto: CreateActionDto, userId: string) {
    await this.access.assertProjectExists(projectId);
    await this.assertCanCoachOwnerOrManage(projectId, userId);

    if (dto.assignmentId) {
      const assignment = await this.prisma.projectExpertAssignment.findUnique({
        where: { id: dto.assignmentId },
      });
      if (!assignment || assignment.project_id !== projectId) {
        throw new BadRequestException("L'affectation indiquée ne concerne pas ce projet");
      }
    }

    if (dto.recommendationId) {
      const rec = await this.prisma.coachingRecommendation.findUnique({
        where: { id: dto.recommendationId },
      });
      if (!rec || rec.project_id !== projectId) {
        throw new BadRequestException('La recommandation indiquée ne concerne pas ce projet');
      }
    }

    const action = await this.prisma.coachingAction.create({
      data: {
        project_id: projectId,
        session_id: dto.sessionId ?? null,
        assignment_id: dto.assignmentId ?? null,
        recommendation_id: dto.recommendationId ?? null,
        title: dto.title,
        description: dto.description,
        priority: dto.priority ?? CoachingActionPriority.MEDIUM,
        status: CoachingActionStatus.PENDING,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        created_by: userId,
      },
      include: { project: { select: { id: true, name: true, owner_id: true } } },
    });

    await this.audit.log({
      actorId: userId,
      action: 'COACHING_ACTION_CREATE',
      entityType: 'CoachingAction',
      entityId: action.id,
      metadata: { project_id: projectId },
    });

    const recipients = [{ userId: action.project.owner_id }];
    if (dto.assignmentId) {
      const assignee = await this.prisma.projectExpertAssignment.findUnique({
        where: { id: dto.assignmentId },
        select: { expert_user_id: true },
      });
      if (assignee) recipients.push({ userId: assignee.expert_user_id });
    }

    const { title, message } = this.messageBuilder.coachingActionAssigned({
      projectName: action.project.name,
      actionTitle: action.title,
    });
    this.access.notify({
      event: NotificationEvent.COACHING_ACTION_ASSIGNED,
      recipients,
      title,
      message,
      link: `/project-owner/projects/${projectId}/coaching`,
      senderId: userId,
      resourceType: ResourceType.COACHING,
      resourceId: projectId,
    });

    return action;
  }

  async findActionsByProject(projectId: string, userId: string) {
    await this.access.assertProjectExists(projectId);
    await this.assertCanViewCoaching(projectId, userId);
    return this.prisma.coachingAction.findMany({
      where: { project_id: projectId },
      include: {
        session: { select: { id: true, title: true, scheduled_at: true } },
        assignment: { include: { expertUser: { select: { id: true, email: true, profile: true } } } },
        recommendation: { select: { id: true, title: true } },
        createdBy: { select: { id: true, email: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async updateAction(id: string, dto: UpdateActionDto, userId: string) {
    const action = await this.prisma.coachingAction.findUnique({
      where: { id },
      include: { project: { select: { id: true, name: true, owner_id: true } } },
    });
    if (!action) throw new NotFoundException('Action introuvable');

    await this.assertCanCoachOwnerOrManage(action.project_id, userId);

    const now = new Date();
    const status =
      dto.status === CoachingActionStatus.COMPLETED ? CoachingActionStatus.COMPLETED : dto.status;

    const updated = await this.prisma.coachingAction.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        status,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        completed_at:
          status === CoachingActionStatus.COMPLETED
            ? now
            : status === CoachingActionStatus.REJECTED || status === CoachingActionStatus.CANCELLED
              ? null
              : action.completed_at,
      },
      include: { project: { select: { id: true, name: true, owner_id: true } } },
    });

    await this.audit.log({
      actorId: userId,
      action: 'COACHING_ACTION_UPDATE',
      entityType: 'CoachingAction',
      entityId: id,
      metadata: { ...dto },
    });

    if (status === CoachingActionStatus.COMPLETED) {
      const { title, message } = this.messageBuilder.coachingActionCompleted({
        actionTitle: updated.title,
      });
      this.access.notify({
        event: NotificationEvent.COACHING_ACTION_COMPLETED,
        recipients: [{ userId: updated.project.owner_id }],
        title,
        message,
        link: `/project-owner/projects/${updated.project.id}/coaching`,
        senderId: userId,
        resourceType: ResourceType.COACHING,
        resourceId: updated.project.id,
      });
    } else {
      const { title, message } = this.messageBuilder.coachingActionUpdated({
        projectName: updated.project.name,
        actionTitle: updated.title,
      });
      this.access.notify({
        event: NotificationEvent.COACHING_ACTION_UPDATED,
        recipients: [{ userId: updated.project.owner_id }],
        title,
        message,
        link: `/project-owner/projects/${updated.project.id}/coaching`,
        senderId: userId,
        resourceType: ResourceType.COACHING,
        resourceId: updated.project.id,
      });
    }

    return updated;
  }

  // ==================== COMMENTAIRES ====================

  async addComment(
    resource: { actionId?: string; sessionId?: string },
    dto: CreateCommentDto,
    userId: string,
  ) {
    let projectId: string;

    if (resource.actionId) {
      const action = await this.prisma.coachingAction.findUnique({
        where: { id: resource.actionId },
        select: { project_id: true },
      });
      if (!action) throw new NotFoundException('Action introuvable');
      projectId = action.project_id;
    } else if (resource.sessionId) {
      const session = await this.prisma.coachingSession.findUnique({
        where: { id: resource.sessionId },
        select: { assignment: { select: { project_id: true } } },
      });
      if (!session) throw new NotFoundException('Session introuvable');
      projectId = session.assignment.project_id;
    } else {
      throw new BadRequestException('Ressource de commentaire invalide');
    }

    await this.assertCanViewCoaching(projectId, userId);

    const comment = await this.prisma.coachingComment.create({
      data: {
        action_id: resource.actionId ?? null,
        session_id: resource.sessionId ?? null,
        author_id: userId,
        content: dto.content,
        resource_type: dto.resourceType as any ?? null,
        resource_id: dto.resourceId ?? null,
      },
      include: {
        author: { select: { id: true, email: true, profile: true } },
      },
    });

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, name: true, owner_id: true },
    });
    if (project && project.owner_id !== userId) {
      const { title, message } = this.messageBuilder.coachingCommentAdded({
        projectName: project.name,
      });
      this.access.notify({
        event: NotificationEvent.COACHING_COMMENT_ADDED,
        recipients: [{ userId: project.owner_id }],
        title,
        message,
        link: `/project-owner/projects/${projectId}/coaching`,
        senderId: userId,
        resourceType: ResourceType.COACHING,
        resourceId: projectId,
      });
    }

    return comment;
  }

  async findComments(
    resource: { actionId?: string; sessionId?: string },
    userId: string,
  ) {
    let projectId: string;

    if (resource.actionId) {
      const action = await this.prisma.coachingAction.findUnique({
        where: { id: resource.actionId },
        select: { project_id: true },
      });
      if (!action) throw new NotFoundException('Action introuvable');
      projectId = action.project_id;
    } else if (resource.sessionId) {
      const session = await this.prisma.coachingSession.findUnique({
        where: { id: resource.sessionId },
        select: { assignment: { select: { project_id: true } } },
      });
      if (!session) throw new NotFoundException('Session introuvable');
      projectId = session.assignment.project_id;
    } else {
      throw new BadRequestException('Ressource de commentaire invalide');
    }

    await this.assertCanViewCoaching(projectId, userId);

    return this.prisma.coachingComment.findMany({
      where: {
        action_id: resource.actionId ?? undefined,
        session_id: resource.sessionId ?? undefined,
      },
      include: { author: { select: { id: true, email: true, profile: true } } },
      orderBy: { created_at: 'asc' },
    });
  }

  // ==================== VUE EXPERT ====================

  async findMyCoachingSessions(userId: string) {
    return this.prisma.coachingSession.findMany({
      where: {
        assignment: {
          expert_user_id: userId,
          role: CohortExpertRole.COACH,
        },
      },
      include: {
        assignment: {
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
      },
      orderBy: { scheduled_at: 'desc' },
    });
  }

  async findMyCoachingActions(userId: string) {
    return this.prisma.coachingAction.findMany({
      where: {
        assignment: {
          expert_user_id: userId,
          role: CohortExpertRole.COACH,
        },
      },
      include: {
        project: { select: { id: true, name: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  // ==================== TABLEAU DE BORD PROJET ====================

  async getOverview(projectId: string, userId: string) {
    await this.access.assertProjectExists(projectId);
    await this.assertCanViewCoaching(projectId, userId);

    const [sessions, actions, recommendations, assignments] = await Promise.all([
      this.prisma.coachingSession.findMany({
        where: { assignment: { project_id: projectId } },
        orderBy: { scheduled_at: 'desc' },
      }),
      this.prisma.coachingAction.findMany({
        where: { project_id: projectId },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.coachingRecommendation.findMany({
        where: { project_id: projectId },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.projectExpertAssignment.findMany({
        where: { project_id: projectId },
        include: {
          expertUser: {
            select: {
              id: true,
              email: true,
              profile: { select: { first_name: true, last_name: true } },
            },
          },
        },
      }),
    ]);

    return {
      project_id: projectId,
      sessions,
      actions,
      recommendations,
      assignments,
      counts: {
        sessions: sessions.length,
        sessions_completed: sessions.filter((s) => s.status === CoachingSessionStatus.COMPLETED).length,
        actions: actions.length,
        actions_completed: actions.filter((a) => a.status === CoachingActionStatus.COMPLETED).length,
        actions_pending: actions.filter((a) =>
          ([CoachingActionStatus.PENDING, CoachingActionStatus.IN_PROGRESS, CoachingActionStatus.SUBMITTED] as CoachingActionStatus[]).includes(a.status),
        ).length,
        recommendations: recommendations.length,
        recommendations_done: recommendations.filter((r) => r.status === CoachingRecommendationStatus.DONE).length,
      },
    };
  }

  // ==================== ACCÈS ====================

  private async assertCanCoachOrManage(projectId: string, userId: string) {
    const isCoach = await this.access.hasActiveAssignment(projectId, userId, CohortExpertRole.COACH);
    if (isCoach) return;
    await this.assertCanManageProjectCohort(projectId, userId);
  }

  private async assertCanCoachOwnerOrManage(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { owner_id: true },
    });
    if (project && project.owner_id === userId) return;
    await this.assertCanCoachOrManage(projectId, userId);
  }

  private async assertCanViewCoaching(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { owner_id: true },
    });
    if (project && project.owner_id === userId) return;

    const isCoach = await this.access.hasActiveAssignment(projectId, userId, CohortExpertRole.COACH);
    if (isCoach) return;

    const participation = await this.access.getAcceptedCohortForProject(projectId);
    if (participation) {
      const incubatorId = participation.cohort.incubator_id;
      if (incubatorId) {
        const member = await this.prisma.incubatorMember.findUnique({
          where: { user_id_incubator_id: { user_id: userId, incubator_id: incubatorId } },
          select: { id: true },
        });
        if (member) return;
      }
      const cohortCoach = await this.prisma.cohortExpert.findFirst({
        where: {
          cohort_id: participation.cohort_id,
          expert_user_id: userId,
          role: CohortExpertRole.COACH,
          status: CohortExpertStatus.ACTIVE,
        },
        select: { id: true },
      });
      if (cohortCoach) return;
    }

    throw new ForbiddenException('Accès refusé au coaching de ce projet');
  }

  private async assertCanManageProjectCohort(projectId: string, userId: string) {
    const participation = await this.access.getAcceptedCohortForProject(projectId);
    if (!participation) {
      throw new BadRequestException(
        "Ce projet n'est pas accepté dans une cohorte",
      );
    }

    const cohortId = participation.cohort_id;
    const incubatorId = participation.cohort.incubator_id;

    if (incubatorId) {
      const member = await this.prisma.incubatorMember.findUnique({
        where: {
          user_id_incubator_id: { user_id: userId, incubator_id: incubatorId },
        },
        select: { id: true },
      });
      if (member) return;
    }

    const cohortCoach = await this.prisma.cohortExpert.findFirst({
      where: {
        cohort_id: cohortId,
        expert_user_id: userId,
        role: CohortExpertRole.COACH,
        status: CohortExpertStatus.ACTIVE,
      },
      select: { id: true },
    });
    if (cohortCoach) return;

    throw new ForbiddenException(
      "Vous n'êtes pas autorisé à gérer le coaching de ce projet",
    );
  }

  private async assertIsSessionCoachOrManager(
    session: { assignment_id: string; status: string },
    userId: string,
  ) {
    const assignment = await this.prisma.projectExpertAssignment.findUnique({
      where: { id: session.assignment_id },
    });
    if (!assignment) {
      throw new NotFoundException('Affectation du coaching introuvable');
    }
    if (assignment.expert_user_id === userId) return;
    await this.assertCanManageProjectCohort(assignment.project_id, userId);
  }
}
