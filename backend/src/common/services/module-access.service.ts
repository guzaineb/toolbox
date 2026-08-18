import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  CohortExpertRole,
  CohortExpertStatus,
  ParticipationStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationEvent } from '../../events/notification-event.enum';
import { NotificationPayload } from '../../events/notification-payload.interface';
import { NotificationRecipient } from '../../events/notification-payload.interface';

@Injectable()
export class ModuleAccessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ==================== INCUBATEUR / COHORTE ====================

  async assertCanManageCohort(cohortId: string, userId: string): Promise<void> {
    const cohort = await this.prisma.cohort.findUnique({
      where: { id: cohortId },
      select: { id: true, incubator_id: true },
    });
    if (!cohort) throw new NotFoundException('Cohorte introuvable');
    if (!cohort.incubator_id) {
      throw new BadRequestException('Cohorte sans incubateur');
    }
    await this.assertCanManageIncubator(cohort.incubator_id, userId);
  }

  async assertCanManageIncubator(incubatorId: string, userId: string): Promise<void> {
    const member = await this.prisma.incubatorMember.findUnique({
      where: {
        user_id_incubator_id: { user_id: userId, incubator_id: incubatorId },
      },
    });
    if (!member) {
      throw new ForbiddenException("Vous n'êtes pas membre de cet incubateur");
    }
    if (member.role !== 'ADMIN' && !member.can_manage_cohorts) {
      throw new ForbiddenException(
        'Permissions insuffisantes pour gérer les cohortes',
      );
    }
  }

  async getCohortIncubatorId(cohortId: string): Promise<string | undefined> {
    const cohort = await this.prisma.cohort.findUnique({
      where: { id: cohortId },
      select: { incubator_id: true },
    });
    return cohort?.incubator_id ?? undefined;
  }

  // ==================== PROJET ====================

  async assertProjectExists(projectId: string): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });
    if (!project) throw new NotFoundException('Projet introuvable');
  }

  async assertProjectOwner(projectId: string, userId: string): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { owner_id: true },
    });
    if (!project) throw new NotFoundException('Projet introuvable');
    if (project.owner_id !== userId) {
      throw new ForbiddenException(
        "Vous n'êtes pas le porteur de ce projet",
      );
    }
  }

  // Cohorte active (participation ACCEPTED) d'un projet
  async getAcceptedCohortForProject(projectId: string) {
    return this.prisma.cohortParticipation.findFirst({
      where: {
        project_id: projectId,
        status: ParticipationStatus.ACCEPTED,
      },
      include: { cohort: true },
      orderBy: { updated_at: 'desc' },
    });
  }

  async assertProjectAcceptedInCohort(projectId: string): Promise<string> {
    const participation = await this.getAcceptedCohortForProject(projectId);
    if (!participation) {
      throw new BadRequestException(
        "Ce projet n'est pas accepté dans une cohorte",
      );
    }
    return participation.cohort_id;
  }

  async assertProjectInCohort(projectId: string, cohortId: string): Promise<void> {
    const participation = await this.prisma.cohortParticipation.findFirst({
      where: {
        project_id: projectId,
        cohort_id: cohortId,
        status: ParticipationStatus.ACCEPTED,
      },
      select: { id: true },
    });
    if (!participation) {
      throw new BadRequestException(
        "Ce projet n'est pas accepté dans la cohorte indiquée",
      );
    }
  }

  // ==================== AFFECTATIONS EXPERT / PROJET ====================

  async hasActiveAssignment(
    projectId: string,
    userId: string,
    role: CohortExpertRole,
  ): Promise<boolean> {
    const assignment = await this.prisma.projectExpertAssignment.findFirst({
      where: {
        project_id: projectId,
        expert_user_id: userId,
        role,
        status: CohortExpertStatus.ACTIVE,
      },
      select: { id: true },
    });
    return !!assignment;
  }

  async assertActiveAssignment(
    projectId: string,
    userId: string,
    role: CohortExpertRole,
  ): Promise<void> {
    const ok = await this.hasActiveAssignment(projectId, userId, role);
    if (!ok) {
      throw new ForbiddenException(
        `Vous n'êtes pas ${role === CohortExpertRole.COACH ? 'le coach' : 'membre du jury'} affecté à ce projet`,
      );
    }
  }

  // Accès évaluation : membre du jury (CohortExpert JURY) de la cohorte du projet,
  // OU affecté via EvaluationAssignment.
  async canEvaluateProject(projectId: string, userId: string): Promise<boolean> {
    const participation = await this.getAcceptedCohortForProject(projectId);
    if (!participation) return false;

    const [byCohortExpert, byEvaluationAssignment] = await Promise.all([
      this.prisma.cohortExpert.findFirst({
        where: {
          cohort_id: participation.cohort_id,
          expert_user_id: userId,
          role: CohortExpertRole.JURY,
          status: CohortExpertStatus.ACTIVE,
        },
        select: { id: true },
      }),
      this.prisma.evaluationAssignment.findFirst({
        where: {
          project_id: projectId,
          jury_user_id: userId,
        },
        select: { id: true },
      }),
    ]);

    return !!(byCohortExpert || byEvaluationAssignment);
  }

  async assertCanEvaluateProject(projectId: string, userId: string): Promise<void> {
    const ok = await this.canEvaluateProject(projectId, userId);
    if (!ok) {
      throw new ForbiddenException(
        "Vous n'êtes pas membre du jury affecté à ce projet",
      );
    }
  }

  // ==================== NOTIFICATION HELPER ====================

  notify(params: {
    event: NotificationEvent;
    recipients: NotificationRecipient[];
    title: string;
    message: string;
    link?: string;
    senderId?: string;
    resourceType?: string;
    resourceId?: string;
  }) {
    if (params.recipients.length === 0) return;
    this.eventEmitter.emit(
      params.event,
      {
        event: params.event,
        recipients: params.recipients,
        title: params.title,
        message: params.message,
        link: params.link,
        senderId: params.senderId,
        resourceType: params.resourceType,
        resourceId: params.resourceId,
      } as NotificationPayload,
    );
  }
}
