import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ParticipationStatus, ParticipationOrigin, CohortStatus, NotificationType } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CohortParticipationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ==================== PORTUEUR — CANDIDATER ====================

  async apply(cohortId: string, projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Projet introuvable');
    if (project.owner_id !== userId) {
      throw new ForbiddenException("Vous n'êtes pas le propriétaire de ce projet");
    }

    const cohort = await this.prisma.cohort.findUnique({
      where: { id: cohortId },
    });
    if (!cohort) throw new NotFoundException('Cohorte introuvable');
    if (cohort.status !== CohortStatus.OPEN) {
      throw new BadRequestException('Cette cohorte n\'est pas ouverte aux candidatures');
    }
    if (
      cohort.application_deadline &&
      new Date() > cohort.application_deadline
    ) {
      throw new BadRequestException('La date limite de candidature est dépassée');
    }
    if (
      cohort.capacity &&
      cohort.current_participants >= cohort.capacity
    ) {
      throw new BadRequestException('La cohorte est complète');
    }

    const activeParticipation = await this.prisma.cohortParticipation.findFirst({
      where: {
        project_id: projectId,
        status: { in: [ParticipationStatus.PENDING, ParticipationStatus.ACCEPTED] },
      },
    });
    if (activeParticipation) {
      throw new BadRequestException(
        'Ce projet a déjà une participation active dans une cohorte',
      );
    }

    const existingInCohort = await this.prisma.cohortParticipation.findUnique({
      where: { cohort_id_project_id: { cohort_id: cohortId, project_id: projectId } },
    });
    if (existingInCohort) {
      throw new BadRequestException('Ce projet a déjà candidaté pour cette cohorte');
    }

    const participation = await this.prisma.cohortParticipation.create({
      data: {
        cohort_id: cohortId,
        project_id: projectId,
        status: ParticipationStatus.PENDING,
        origin: ParticipationOrigin.APPLICATION,
      },
      include: {
        cohort: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
    });

    if (cohort.incubator_id) {
      const members = await this.prisma.incubatorMember.findMany({
        where: {
          incubator_id: cohort.incubator_id,
          status: 'active',
          NOT: { user_id: userId },
        },
        select: { user_id: true },
      });

      const memberIds = members.map((m) => m.user_id);
      if (memberIds.length > 0) {
        await this.notificationsService.createMany(
          memberIds,
          NotificationType.APPLICATION_SUBMITTED,
          'Nouvelle candidature',
          `Le projet « ${project.name} » a soumis une candidature à la cohorte « ${cohort.name} ».`,
          `/incubator/${cohort.incubator_id}/cohorts/${cohortId}`,
        );
      }
    }

    return participation;
  }

  // ==================== INCUBATEUR — INVITER ====================

  async invite(cohortId: string, projectId: string, userId: string) {
    const cohort = await this.prisma.cohort.findUnique({
      where: { id: cohortId },
    });
    if (!cohort) throw new NotFoundException('Cohorte introuvable');
    if (!cohort.incubator_id) {
      throw new BadRequestException('Cohorte sans incubateur');
    }

    await this.assertCanManageCohorts(cohort.incubator_id, userId);

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Projet introuvable');

    if (
      cohort.capacity &&
      cohort.current_participants >= cohort.capacity
    ) {
      throw new BadRequestException('La cohorte est complète');
    }

    const existing = await this.prisma.cohortParticipation.findUnique({
      where: { cohort_id_project_id: { cohort_id: cohortId, project_id: projectId } },
    });
    if (existing) {
      throw new BadRequestException('Ce projet a déjà une participation pour cette cohorte');
    }

    const participation = await this.prisma.cohortParticipation.create({
      data: {
        cohort_id: cohortId,
        project_id: projectId,
        status: ParticipationStatus.PENDING,
        origin: ParticipationOrigin.INVITATION,
        invited_at: new Date(),
      },
      include: {
        cohort: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
    });

    await this.notificationsService.create(
      project.owner_id,
      NotificationType.INVITATION_RECEIVED,
      'Invitation à une cohorte',
      `Vous avez été invité à rejoindre la cohorte « ${cohort.name} ».`,
      `/project-owner/participations`,
    );

    return participation;
  }

  // ==================== INCUBATEUR — ACCEPTER ====================

  async accept(participationId: string, userId: string) {
    const participation = await this.prisma.cohortParticipation.findUnique({
      where: { id: participationId },
      include: { cohort: true, project: true },
    });
    if (!participation) throw new NotFoundException('Candidature introuvable');
    if (!participation.cohort.incubator_id) {
      throw new BadRequestException('Cohorte sans incubateur');
    }

    await this.assertCanManageCohorts(participation.cohort.incubator_id, userId);

    if (participation.status !== ParticipationStatus.PENDING) {
      throw new BadRequestException('Seules les candidatures en attente peuvent être acceptées');
    }

    const cohort = participation.cohort;
    if (
      cohort.capacity &&
      cohort.current_participants >= cohort.capacity
    ) {
      throw new BadRequestException('La cohorte est complète');
    }

    const updated = await this.prisma.$transaction([
      this.prisma.cohortParticipation.update({
        where: { id: participationId },
        data: {
          status: ParticipationStatus.ACCEPTED,
          responded_at: new Date(),
        },
        include: {
          cohort: { select: { id: true, name: true } },
          project: { select: { id: true, name: true } },
        },
      }),
      this.prisma.cohort.update({
        where: { id: participation.cohort_id },
        data: { current_participants: { increment: 1 } },
      }),
    ]);

    const project = participation.project;
    if (project) {
      const notificationType = participation.origin === ParticipationOrigin.INVITATION
        ? NotificationType.INVITATION_ACCEPTED
        : NotificationType.APPLICATION_ACCEPTED;

      const title = participation.origin === ParticipationOrigin.INVITATION
        ? 'Invitation acceptée'
        : 'Candidature acceptée';

      const message = participation.origin === ParticipationOrigin.INVITATION
        ? `Votre invitation à la cohorte « ${cohort.name} » a été acceptée.`
        : `Votre candidature à la cohorte « ${cohort.name} » a été acceptée.`;

      await this.notificationsService.create(
        project.owner_id,
        notificationType,
        title,
        message,
        `/project-owner/participations`,
      );
    }

    return updated[0];
  }

  // ==================== INCUBATEUR — REFUSER ====================

  async reject(participationId: string, userId: string) {
    const participation = await this.prisma.cohortParticipation.findUnique({
      where: { id: participationId },
      include: { cohort: true, project: true },
    });
    if (!participation) throw new NotFoundException('Candidature introuvable');
    if (!participation.cohort.incubator_id) {
      throw new BadRequestException('Cohorte sans incubateur');
    }

    await this.assertCanManageCohorts(participation.cohort.incubator_id, userId);

    if (participation.status !== ParticipationStatus.PENDING) {
      throw new BadRequestException('Seules les candidatures en attente peuvent être refusées');
    }

    const result = await this.prisma.cohortParticipation.update({
      where: { id: participationId },
      data: {
        status: ParticipationStatus.REJECTED,
        responded_at: new Date(),
      },
      include: {
        cohort: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
    });

    const project = participation.project;
    if (project) {
      const notificationType = participation.origin === ParticipationOrigin.INVITATION
        ? NotificationType.INVITATION_REJECTED
        : NotificationType.APPLICATION_REJECTED;

      const title = participation.origin === ParticipationOrigin.INVITATION
        ? 'Invitation refusée'
        : 'Candidature refusée';

      const message = participation.origin === ParticipationOrigin.INVITATION
        ? `Votre invitation à la cohorte « ${participation.cohort.name} » a été refusée.`
        : `Votre candidature à la cohorte « ${participation.cohort.name} » a été refusée.`;

      await this.notificationsService.create(
        project.owner_id,
        notificationType,
        title,
        message,
        `/project-owner/participations`,
      );
    }

    return result;
  }

  // ==================== PORTUEUR — RETIRER ====================

  async withdraw(participationId: string, userId: string) {
    const participation = await this.prisma.cohortParticipation.findUnique({
      where: { id: participationId },
      include: { project: true, cohort: true },
    });
    if (!participation) throw new NotFoundException('Candidature introuvable');
    if (participation.project.owner_id !== userId) {
      throw new ForbiddenException("Vous n'êtes pas le propriétaire de ce projet");
    }

    if (
      participation.status !== ParticipationStatus.PENDING &&
      participation.status !== ParticipationStatus.ACCEPTED
    ) {
      throw new BadRequestException(
        'Seules les candidatures en attente ou acceptées peuvent être retirées',
      );
    }

    const operations: any[] = [
      this.prisma.cohortParticipation.update({
        where: { id: participationId },
        data: { status: ParticipationStatus.WITHDRAWN },
        include: {
          cohort: { select: { id: true, name: true } },
          project: { select: { id: true, name: true } },
        },
      }),
    ];

    if (participation.status === ParticipationStatus.ACCEPTED) {
      operations.push(
        this.prisma.cohort.update({
          where: { id: participation.cohort_id },
          data: { current_participants: { decrement: 1 } },
        }),
      );
    }

    const results = await this.prisma.$transaction(operations);

    if (participation.origin === ParticipationOrigin.INVITATION && participation.cohort.incubator_id) {
      const members = await this.prisma.incubatorMember.findMany({
        where: {
          incubator_id: participation.cohort.incubator_id,
          status: 'active',
          NOT: { user_id: userId },
        },
        select: { user_id: true },
      });

      const memberIds = members.map((m) => m.user_id);
      if (memberIds.length > 0) {
        await this.notificationsService.createMany(
          memberIds,
          NotificationType.INVITATION_REJECTED,
          'Invitation déclinée',
          `Le projet « ${participation.project.name} » a décliné l'invitation à la cohorte « ${participation.cohort.name} ».`,
          `/incubator/${participation.cohort.incubator_id}/cohorts/${participation.cohort_id}`,
        );
      }
    }

    return results[0];
  }

  // ==================== LECTURE ====================

  async findByCohort(cohortId: string) {
    return this.prisma.cohortParticipation.findMany({
      where: { cohort_id: cohortId },
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
  }

  async findByProject(projectId: string) {
    return this.prisma.cohortParticipation.findMany({
      where: { project_id: projectId },
      include: {
        cohort: {
          select: {
            id: true,
            name: true,
            program: true,
            status: true,
            start_date: true,
            end_date: true,
          },
        },
      },
      orderBy: { applied_at: 'desc' },
    });
  }

  async findOne(id: string) {
    const participation = await this.prisma.cohortParticipation.findUnique({
      where: { id },
      include: {
        cohort: true,
        project: {
          select: { id: true, name: true, description: true, owner_id: true },
        },
      },
    });
    if (!participation) throw new NotFoundException('Candidature introuvable');
    return participation;
  }

  // ==================== VÉRIFICATIONS ====================

  private async assertCanManageCohorts(
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
    if (member.role !== 'admin' && !member.can_manage_cohorts) {
      throw new ForbiddenException(
        'Permissions insuffisantes pour gérer les candidatures',
      );
    }
  }
}
