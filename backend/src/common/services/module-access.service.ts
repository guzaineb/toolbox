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

  async assertCanManageIncubator(
    incubatorId: string,
    userId: string,
  ): Promise<void> {
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
      throw new ForbiddenException("Vous n'êtes pas le porteur de ce projet");
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

  /**
   * Toutes les cohortes acceptées d'un projet. Un projet peut appartenir à
   * plusieurs cohortes : les contrôles d'accès doivent toutes les considérer,
   * sinon un expert peut être refusé alors qu'il est coach/jury sur l'une
   * d'entre elles (la participation « trouvée en premier » n'est pas stable).
   */
  async getAcceptedCohortsForProject(projectId: string) {
    return this.prisma.cohortParticipation.findMany({
      where: {
        project_id: projectId,
        status: ParticipationStatus.ACCEPTED,
      },
      include: { cohort: true },
      orderBy: { updated_at: 'desc' },
    });
  }

  /** Coach actif (CohortExpert) sur l'une des cohortes indiquées. */
  private async isCohortCoachOnCohorts(
    cohortIds: string[],
    userId: string,
  ): Promise<boolean> {
    if (cohortIds.length === 0) return false;
    const coach = await this.prisma.cohortExpert.findFirst({
      where: {
        cohort_id: { in: cohortIds },
        expert_user_id: userId,
        role: CohortExpertRole.COACH,
        status: CohortExpertStatus.ACTIVE,
      },
      select: { id: true },
    });
    return !!coach;
  }

  /**
   * Coach de cohorte actif pour ce projet : expert marqué COACH (ACTIVE) sur
   * au moins une cohorte dans laquelle le projet est accepté.
   */
  async isCohortCoachOfProject(
    projectId: string,
    userId: string,
  ): Promise<boolean> {
    const participations = await this.getAcceptedCohortsForProject(projectId);
    return this.isCohortCoachOnCohorts(
      participations.map((p) => p.cohort_id),
      userId,
    );
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

  async assertProjectInCohort(
    projectId: string,
    cohortId: string,
  ): Promise<void> {
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

  /**
   * Accès en lecture au projet : porteur, coach/jury affecté, coach de la
   * cohorte du projet, ou membre de l'incubateur d'une des cohortes.
   */
  async assertCanAccessProject(
    projectId: string,
    userId: string,
  ): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, owner_id: true },
    });
    if (!project) throw new NotFoundException('Projet introuvable');
    if (project.owner_id === userId) return;

    const [assignedCoach, assignedJury] = await Promise.all([
      this.hasActiveAssignment(projectId, userId, CohortExpertRole.COACH),
      this.hasActiveAssignment(projectId, userId, CohortExpertRole.JURY),
    ]);
    if (assignedCoach || assignedJury) return;

    const participations = await this.getAcceptedCohortsForProject(projectId);
    const cohortIds = participations.map((p) => p.cohort_id);

    // Coach au niveau cohorte : accès aux livrables nécessaires à son accompagnement
    if (await this.isCohortCoachOnCohorts(cohortIds, userId)) return;

    // Jury au niveau cohorte ou via affectation d'évaluation
    if (await this.canEvaluateProject(projectId, userId)) return;

    for (const participation of participations) {
      const incubatorId = participation.cohort.incubator_id;
      if (!incubatorId) continue;
      if (await this.isIncubatorMember(userId, incubatorId)) return;
    }

    throw new ForbiddenException('Accès refusé à ce projet');
  }

  /**
   * Gestion du coaching / plan d'amélioration : coach affecté au projet,
   * coach actif d'une cohorte du projet, ou gestionnaire de l'incubateur.
   */
  async assertCanManageProjectCoaching(
    projectId: string,
    userId: string,
  ): Promise<void> {
    if (
      await this.hasActiveAssignment(projectId, userId, CohortExpertRole.COACH)
    )
      return;

    const participations = await this.getAcceptedCohortsForProject(projectId);
    if (participations.length === 0) {
      throw new BadRequestException(
        "Ce projet n'est pas accepté dans une cohorte",
      );
    }

    if (
      await this.isCohortCoachOnCohorts(
        participations.map((p) => p.cohort_id),
        userId,
      )
    ) {
      return;
    }

    for (const participation of participations) {
      const incubatorId = participation.cohort.incubator_id;
      if (!incubatorId) continue;
      const member = await this.isIncubatorMember(userId, incubatorId);
      if (member && (member.role === 'ADMIN' || member.can_manage_cohorts))
        return;
    }
    throw new ForbiddenException(
      "Vous n'êtes pas autorisé à gérer le coaching de ce projet",
    );
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

  // Accès évaluation : membre du jury (CohortExpert JURY) d'au moins une cohorte
  // acceptée du projet, OU affecté via EvaluationAssignment sur le projet.
  async canEvaluateProject(
    projectId: string,
    userId: string,
  ): Promise<boolean> {
    const [byEvaluationAssignment, participations] = await Promise.all([
      this.prisma.evaluationAssignment.findFirst({
        where: {
          project_id: projectId,
          jury_user_id: userId,
        },
        select: { id: true },
      }),
      this.getAcceptedCohortsForProject(projectId),
    ]);

    if (byEvaluationAssignment) return true;

    const cohortIds = participations.map((p) => p.cohort_id);
    if (cohortIds.length === 0) return false;

    const byCohortExpert = await this.prisma.cohortExpert.findFirst({
      where: {
        cohort_id: { in: cohortIds },
        expert_user_id: userId,
        role: CohortExpertRole.JURY,
        status: CohortExpertStatus.ACTIVE,
      },
      select: { id: true },
    });
    return !!byCohortExpert;
  }

  async assertCanEvaluateProject(
    projectId: string,
    userId: string,
  ): Promise<void> {
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
    this.eventEmitter.emit(params.event, {
      event: params.event,
      recipients: params.recipients,
      title: params.title,
      message: params.message,
      link: params.link,
      senderId: params.senderId,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
    } as NotificationPayload);
  }

  // ==================== MEMBRES INCUBATEUR ====================

  async isIncubatorMember(
    userId: string,
    incubatorId: string,
  ): Promise<{ role: string; can_manage_cohorts: boolean } | null> {
    const member = await this.prisma.incubatorMember.findUnique({
      where: {
        user_id_incubator_id: { user_id: userId, incubator_id: incubatorId },
      },
      select: { role: true, can_manage_cohorts: true },
    });
    return member ?? null;
  }

  async assertCanManageCohorts(
    userId: string,
    incubatorId: string,
  ): Promise<void> {
    const member = await this.isIncubatorMember(userId, incubatorId);
    if (!member) {
      throw new ForbiddenException("Vous n'êtes pas membre de cet incubateur");
    }
    if (member.role !== 'ADMIN' && !member.can_manage_cohorts) {
      throw new ForbiddenException('Permissions insuffisantes');
    }
  }

  async assertIncubatorAdmin(
    userId: string,
    incubatorId: string,
  ): Promise<void> {
    const member = await this.isIncubatorMember(userId, incubatorId);
    if (!member || member.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Seul un administrateur peut effectuer cette action',
      );
    }
  }
}
