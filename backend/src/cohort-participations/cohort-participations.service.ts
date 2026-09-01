import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { ParticipationStatus, ParticipationOrigin, CohortStatus } from '@prisma/client';
import { NotificationEvent } from '../events/notification-event.enum';
import { NotificationPayload } from '../events/notification-payload.interface';
import { NotificationMessageBuilder } from '../events/notification-message-builder';
import { ModuleAccessService } from '../common/services/module-access.service';

@Injectable()
export class CohortParticipationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly notificationBuilder: NotificationMessageBuilder,
    private readonly access: ModuleAccessService,
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
      include: { incubator: { select: { name: true } } },
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
          status: 'ACTIVE',
          NOT: { user_id: userId },
        },
        select: { user_id: true },
      });

      const memberIds = members.map((m) => m.user_id);
      if (memberIds.length > 0) {
        const { title, message } = this.notificationBuilder.applicationSubmitted({
          projectName: project.name,
          cohortName: cohort.name,
          incubatorName: cohort.incubator!.name,
        });

        this.eventEmitter.emit(
          NotificationEvent.APPLICATION_SUBMITTED,
          {
            event: NotificationEvent.APPLICATION_SUBMITTED,
            recipients: memberIds.map((id) => ({ userId: id })),
            title,
            message,
            link: `/incubator/${cohort.incubator_id}/cohorts/${cohortId}`,
            senderId: userId,
            resourceType: 'COHORT',
            resourceId: cohortId,
          } as NotificationPayload,
        );
      }
    }

    return participation;
  }

  // ==================== INCUBATEUR — INVITER ====================

  async invite(cohortId: string, projectId: string, userId: string) {
    const cohort = await this.prisma.cohort.findUnique({
      where: { id: cohortId },
      include: { incubator: { select: { name: true } } },
    });
    if (!cohort) throw new NotFoundException('Cohorte introuvable');
    if (!cohort.incubator_id) {
      throw new BadRequestException('Cohorte sans incubateur');
    }

    await this.access.assertCanManageCohorts(userId, cohort.incubator_id);

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

    const { title, message } = this.notificationBuilder.invitationSent({
      projectName: project.name,
      cohortName: cohort.name,
      incubatorName: cohort.incubator!.name,
    });

    this.eventEmitter.emit(
      NotificationEvent.INVITATION_SENT,
      {
        event: NotificationEvent.INVITATION_SENT,
        recipients: [{ userId: project.owner_id }],
        title,
        message,
        link: `/project-owner/participations`,
        senderId: userId,
        resourceType: 'COHORT',
        resourceId: cohortId,
      } as NotificationPayload,
    );

    return participation;
  }

  // ==================== ACCEPTER ====================

  async accept(participationId: string, userId: string) {
    const participation = await this.prisma.cohortParticipation.findUnique({
      where: { id: participationId },
      include: { cohort: { include: { incubator: { select: { name: true } } } }, project: true },
    });
    if (!participation) throw new NotFoundException('Candidature introuvable');
    if (!participation.cohort.incubator_id) {
      throw new BadRequestException('Cohorte sans incubateur');
    }

    if (participation.origin === ParticipationOrigin.INVITATION) {
      if (participation.project.owner_id !== userId) {
        throw new ForbiddenException("Seul le porteur de projet peut accepter l'invitation");
      }
    } else {
      await this.access.assertCanManageCohorts(userId, participation.cohort.incubator_id);
    }

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
      const eventType = participation.origin === ParticipationOrigin.INVITATION
        ? NotificationEvent.INVITATION_ACCEPTED
        : NotificationEvent.APPLICATION_ACCEPTED;

      const { title, message } = this.notificationBuilder.participationAccepted({
        origin: participation.origin === ParticipationOrigin.INVITATION ? 'invitation' : 'application',
        cohortName: cohort.name,
        incubatorName: participation.cohort.incubator!.name,
      });

      this.eventEmitter.emit(
        eventType,
        {
          event: eventType,
          recipients: [{ userId: project.owner_id }],
          title,
          message,
          link: `/project-owner/participations`,
          senderId: userId,
          resourceType: 'COHORT',
          resourceId: participation.cohort_id,
        } as NotificationPayload,
      );
    }

    return updated[0];
  }

  // ==================== REFUSER ====================

  async reject(participationId: string, userId: string) {
    const participation = await this.prisma.cohortParticipation.findUnique({
      where: { id: participationId },
      include: { cohort: { include: { incubator: { select: { name: true } } } }, project: true },
    });
    if (!participation) throw new NotFoundException('Candidature introuvable');
    if (!participation.cohort.incubator_id) {
      throw new BadRequestException('Cohorte sans incubateur');
    }

    if (participation.origin === ParticipationOrigin.INVITATION) {
      if (participation.project.owner_id !== userId) {
        throw new ForbiddenException("Seul le porteur de projet peut refuser l'invitation");
      }
    } else {
      await this.access.assertCanManageCohorts(userId, participation.cohort.incubator_id);
    }

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
      const eventType = participation.origin === ParticipationOrigin.INVITATION
        ? NotificationEvent.INVITATION_REJECTED
        : NotificationEvent.APPLICATION_REJECTED;

      const { title, message } = this.notificationBuilder.participationRejected({
        origin: participation.origin === ParticipationOrigin.INVITATION ? 'invitation' : 'application',
        cohortName: participation.cohort.name,
        incubatorName: participation.cohort.incubator!.name,
      });

      this.eventEmitter.emit(
        eventType,
        {
          event: eventType,
          recipients: [{ userId: project.owner_id }],
          title,
          message,
          link: `/project-owner/participations`,
          senderId: userId,
          resourceType: 'COHORT',
          resourceId: participation.cohort_id,
        } as NotificationPayload,
      );
    }

    return result;
  }

  // ==================== PORTUEUR — RETIRER ====================

  async withdraw(participationId: string, userId: string) {
    const participation = await this.prisma.cohortParticipation.findUnique({
      where: { id: participationId },
      include: { project: true, cohort: { include: { incubator: { select: { name: true } } } } },
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
          status: 'ACTIVE',
          NOT: { user_id: userId },
        },
        select: { user_id: true },
      });

      const memberIds = members.map((m) => m.user_id);
      if (memberIds.length > 0) {
        const { title, message } = this.notificationBuilder.invitationDeclined({
          projectName: participation.project.name,
          cohortName: participation.cohort.name,
          incubatorName: participation.cohort.incubator!.name,
        });

        this.eventEmitter.emit(
          NotificationEvent.INVITATION_REJECTED,
          {
            event: NotificationEvent.INVITATION_REJECTED,
            recipients: memberIds.map((id) => ({ userId: id })),
            title,
            message,
            link: `/incubator/${participation.cohort.incubator_id}/cohorts/${participation.cohort_id}`,
            senderId: userId,
            resourceType: 'COHORT',
            resourceId: participation.cohort_id,
          } as NotificationPayload,
        );
      }
    }

    return results[0];
  }

  // ==================== LECTURE ====================

  async findByCohort(cohortId: string, userId: string) {
    await this.assertCanViewCohortParticipations(cohortId, userId);
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

  async findByProject(projectId: string, userId: string) {
    await this.assertCanViewProjectParticipations(projectId, userId);
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

  async findOne(id: string, userId: string) {
    const participation = await this.prisma.cohortParticipation.findUnique({
      where: { id },
      include: {
        cohort: { select: { id: true, name: true, incubator_id: true } },
        project: {
          select: { id: true, name: true, description: true, owner_id: true },
        },
      },
    });
    if (!participation) throw new NotFoundException('Candidature introuvable');

    const isOwner = participation.project.owner_id === userId;
    const isIncubatorMember = participation.cohort.incubator_id
      ? !!(await this.prisma.incubatorMember.findUnique({
          where: {
            user_id_incubator_id: {
              user_id: userId,
              incubator_id: participation.cohort.incubator_id,
            },
          },
          select: { id: true },
        }))
      : false;
    if (!isOwner && !isIncubatorMember) {
      throw new ForbiddenException(
        "Vous n'avez pas accès à cette candidature",
      );
    }

    return participation;
  }

  // ==================== VÉRIFICATIONS D'ACCÈS ====================

  private async assertCanViewCohortParticipations(
    cohortId: string,
    userId: string,
  ): Promise<void> {
    const cohort = await this.prisma.cohort.findUnique({
      where: { id: cohortId },
      select: { incubator_id: true },
    });
    if (cohort?.incubator_id) {
      const member = await this.prisma.incubatorMember.findUnique({
        where: {
          user_id_incubator_id: {
            user_id: userId,
            incubator_id: cohort.incubator_id,
          },
        },
        select: { id: true },
      });
      if (member) return;
    }
    throw new ForbiddenException(
      "Vous n'avez pas accès aux candidatures de cette cohorte",
    );
  }

  private async assertCanViewProjectParticipations(
    projectId: string,
    userId: string,
  ): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { owner_id: true },
    });
    if (!project) throw new NotFoundException('Projet introuvable');
    if (project.owner_id === userId) return;

    const participation = await this.prisma.cohortParticipation.findFirst({
      where: { project_id: projectId },
      select: { cohort_id: true },
    });
    if (!participation) return;
    const cohort = await this.prisma.cohort.findUnique({
      where: { id: participation.cohort_id },
      select: { incubator_id: true },
    });
    if (cohort?.incubator_id) {
      const member = await this.prisma.incubatorMember.findUnique({
        where: {
          user_id_incubator_id: {
            user_id: userId,
            incubator_id: cohort.incubator_id,
          },
        },
        select: { id: true },
      });
      if (member) return;
    }
    throw new ForbiddenException(
      "Vous n'avez pas accès aux candidatures de ce projet",
    );
  }

}
