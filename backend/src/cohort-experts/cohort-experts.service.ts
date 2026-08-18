import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { CohortExpertRole, CohortExpertStatus } from '@prisma/client';
import { CreateCohortExpertDto } from './dto/create-cohort-expert.dto';
import { InviteExpertDto } from './dto/invite-expert.dto';
import { ApplyExpertDto } from './dto/apply-expert.dto';
import { UpdateCohortExpertDto } from './dto/update-cohort-expert.dto';
import { NotificationEvent } from '../events/notification-event.enum';
import { NotificationPayload } from '../events/notification-payload.interface';
import { NotificationMessageBuilder } from '../events/notification-message-builder';

@Injectable()
export class CohortExpertsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly messageBuilder: NotificationMessageBuilder,
  ) {}

  // ==================== ASSIGNEMENT DIRECT (existant) ====================

  async assign(cohortId: string, dto: CreateCohortExpertDto, userId: string) {
    const cohort = await this.prisma.cohort.findUnique({
      where: { id: cohortId },
      include: { incubator: true },
    });
    if (!cohort) throw new NotFoundException('Cohorte introuvable');
    if (!cohort.incubator_id || !cohort.incubator) {
      throw new BadRequestException('Cohorte sans incubateur');
    }

    await this.assertCanManageCohorts(cohort.incubator_id, userId);

    const expertUser = await this.prisma.user.findUnique({
      where: { id: dto.expertUserId },
      include: { expertProfile: true },
    });
    if (!expertUser) throw new NotFoundException('Expert introuvable');
    if (expertUser.role !== 'EXPERT') {
      throw new BadRequestException("Cet utilisateur n'a pas le rôle expert");
    }

    await this.assertNoDuplicate(cohortId, dto.expertUserId, dto.role);

    const assignment = await this.prisma.cohortExpert.create({
      data: {
        cohort_id: cohortId,
        expert_user_id: dto.expertUserId,
        role: dto.role,
        status: CohortExpertStatus.ACTIVE,
        assigned_by: userId,
      },
      include: {
        expertUser: {
          include: { profile: true, expertProfile: true },
        },
      },
    });

    const event = dto.role === 'COACH' ? NotificationEvent.ASSIGNED_AS_COACH : NotificationEvent.ASSIGNED_AS_JURY;
    const { title, message } = this.messageBuilder.expertAssignment({
      role: dto.role as 'JURY' | 'COACH',
      cohortName: cohort.name,
      incubatorName: cohort.incubator.name,
    });

    this.eventEmitter.emit(
      event,
      {
        event,
        recipients: [{ userId: dto.expertUserId }],
        title,
        message,
        link: `/incubator/cohorts/${cohortId}`,
        senderId: userId,
        resourceType: 'COHORT',
        resourceId: cohortId,
      } as NotificationPayload,
    );

    return assignment;
  }

  // ==================== INVITATION D'UN EXPERT PAR L'INCUBATEUR ====================

  async invite(cohortId: string, dto: InviteExpertDto, userId: string) {
    const cohort = await this.prisma.cohort.findUnique({
      where: { id: cohortId },
      include: { incubator: { select: { name: true } } },
    });
    if (!cohort) throw new NotFoundException('Cohorte introuvable');
    if (!cohort.incubator_id) {
      throw new BadRequestException('Cohorte sans incubateur');
    }

    await this.assertCanManageCohorts(cohort.incubator_id, userId);

    const expertUser = await this.prisma.user.findUnique({
      where: { id: dto.expertUserId },
      include: { expertProfile: true },
    });
    if (!expertUser) throw new NotFoundException('Expert introuvable');
    if (expertUser.role !== 'EXPERT') {
      throw new BadRequestException("Cet utilisateur n'a pas le rôle expert");
    }

    await this.assertNoDuplicate(cohortId, dto.expertUserId, dto.role);

    const invitation = await this.prisma.cohortExpert.create({
      data: {
        cohort_id: cohortId,
        expert_user_id: dto.expertUserId,
        role: dto.role,
        status: CohortExpertStatus.PENDING,
        assigned_by: userId,
        invited_at: new Date(),
      },
      include: {
        cohort: { select: { id: true, name: true, incubator_id: true } },
        expertUser: {
          include: { profile: true, expertProfile: true },
        },
      },
    });

    const { title, message } = this.messageBuilder.expertInvitationSent({
      role: dto.role as 'JURY' | 'COACH',
      cohortName: cohort.name,
      incubatorName: cohort.incubator!.name,
    });

    this.eventEmitter.emit(
      NotificationEvent.INVITATION_SENT,
      {
        event: NotificationEvent.INVITATION_SENT,
        recipients: [{ userId: dto.expertUserId }],
        title,
        message,
        link: `/incubator/cohorts/${cohortId}`,
        senderId: userId,
        resourceType: 'COHORT',
        resourceId: cohortId,
      } as NotificationPayload,
    );

    return invitation;
  }

  // ==================== CANDIDATURE D'UN EXPERT ====================

  async apply(cohortId: string, dto: ApplyExpertDto, userId: string) {
    const cohort = await this.prisma.cohort.findUnique({
      where: { id: cohortId },
      include: { incubator: { select: { name: true } } },
    });
    if (!cohort) throw new NotFoundException('Cohorte introuvable');
    if (!cohort.incubator_id) {
      throw new BadRequestException('Cohorte sans incubateur');
    }

    const expertUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { expertProfile: true },
    });
    if (!expertUser) throw new NotFoundException('Utilisateur introuvable');
    if (expertUser.role !== 'EXPERT') {
      throw new BadRequestException("Vous n'avez pas le rôle expert");
    }

    await this.assertNoDuplicate(cohortId, userId, dto.role);

    const application = await this.prisma.cohortExpert.create({
      data: {
        cohort_id: cohortId,
        expert_user_id: userId,
        role: dto.role,
        status: CohortExpertStatus.PENDING,
        assigned_by: userId,
      },
      include: {
        cohort: { select: { id: true, name: true, incubator_id: true } },
        expertUser: {
          include: { profile: true, expertProfile: true },
        },
      },
    });

    const members = await this.prisma.incubatorMember.findMany({
      where: {
        incubator_id: cohort.incubator_id,
        status: 'ACTIVE',
      },
      select: { user_id: true },
    });

    const memberIds = members.map((m) => m.user_id);
    if (memberIds.length > 0) {
      const { title, message } = this.messageBuilder.expertApplicationSubmitted({
        role: dto.role as 'JURY' | 'COACH',
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
          link: `/incubator/cohorts/${cohortId}`,
          senderId: userId,
          resourceType: 'COHORT',
          resourceId: cohortId,
        } as NotificationPayload,
      );
    }

    return application;
  }

  // ==================== EXPERT — ACCEPTER UNE INVITATION ====================

  async acceptInvitation(id: string, userId: string) {
    const assignment = await this.prisma.cohortExpert.findUnique({
      where: { id },
      include: {
        cohort: { include: { incubator: { select: { name: true } } } },
      },
    });
    if (!assignment) throw new NotFoundException('Invitation introuvable');
    if (assignment.expert_user_id !== userId) {
      throw new ForbiddenException("Cette invitation ne vous est pas destinée");
    }
    if (assignment.status !== CohortExpertStatus.PENDING) {
      throw new BadRequestException("Seules les invitations en attente peuvent être acceptées");
    }

    const updated = await this.prisma.cohortExpert.update({
      where: { id },
      data: {
        status: CohortExpertStatus.ACTIVE,
        responded_at: new Date(),
      },
      include: {
        cohort: { select: { id: true, name: true } },
        expertUser: {
          include: { profile: true, expertProfile: true },
        },
      },
    });

    const incubatorName = assignment.cohort.incubator?.name ?? 'Incubateur';
    const { title, message } = this.messageBuilder.invitationAcceptedByRecipient({
      entityType: 'expert',
      role: assignment.role as 'JURY' | 'COACH',
      cohortName: assignment.cohort.name,
      incubatorName,
    });

    this.eventEmitter.emit(
      NotificationEvent.INVITATION_ACCEPTED,
      {
        event: NotificationEvent.INVITATION_ACCEPTED,
        recipients: [{ userId: assignment.assigned_by }],
        title,
        message,
        link: `/incubator/cohorts/${assignment.cohort_id}`,
        senderId: userId,
        resourceType: 'COHORT',
        resourceId: assignment.cohort_id,
      } as NotificationPayload,
    );

    return updated;
  }

  // ==================== EXPERT — REFUSER UNE INVITATION ====================

  async rejectInvitation(id: string, userId: string) {
    const assignment = await this.prisma.cohortExpert.findUnique({
      where: { id },
      include: {
        cohort: { include: { incubator: { select: { name: true } } } },
      },
    });
    if (!assignment) throw new NotFoundException('Invitation introuvable');
    if (assignment.expert_user_id !== userId) {
      throw new ForbiddenException("Cette invitation ne vous est pas destinée");
    }
    if (assignment.status !== CohortExpertStatus.PENDING) {
      throw new BadRequestException("Seules les invitations en attente peuvent être refusées");
    }

    const updated = await this.prisma.cohortExpert.update({
      where: { id },
      data: {
        status: CohortExpertStatus.INACTIVE,
        responded_at: new Date(),
      },
    });

    const incubatorName = assignment.cohort.incubator?.name ?? 'Incubateur';
    const { title, message } = this.messageBuilder.invitationRejectedByRecipient({
      entityType: 'expert',
      role: assignment.role as 'JURY' | 'COACH',
      cohortName: assignment.cohort.name,
      incubatorName,
    });

    this.eventEmitter.emit(
      NotificationEvent.INVITATION_REJECTED,
      {
        event: NotificationEvent.INVITATION_REJECTED,
        recipients: [{ userId: assignment.assigned_by }],
        title,
        message,
        link: `/incubator/cohorts/${assignment.cohort_id}`,
        senderId: userId,
        resourceType: 'COHORT',
        resourceId: assignment.cohort_id,
      } as NotificationPayload,
    );

    return updated;
  }

  // ==================== INCUBATEUR — ACCEPTER UNE CANDIDATURE EXPERT ====================

  async approveApplication(id: string, userId: string) {
    const assignment = await this.prisma.cohortExpert.findUnique({
      where: { id },
      include: {
        cohort: { include: { incubator: { select: { name: true } } } },
      },
    });
    if (!assignment) throw new NotFoundException('Candidature introuvable');
    if (!assignment.cohort.incubator_id) {
      throw new BadRequestException('Cohorte sans incubateur');
    }

    await this.assertCanManageCohorts(assignment.cohort.incubator_id, userId);

    if (assignment.status !== CohortExpertStatus.PENDING) {
      throw new BadRequestException("Seules les candidatures en attente peuvent être acceptées");
    }

    const updated = await this.prisma.cohortExpert.update({
      where: { id },
      data: {
        status: CohortExpertStatus.ACTIVE,
        responded_at: new Date(),
      },
      include: {
        cohort: { select: { id: true, name: true } },
        expertUser: {
          include: { profile: true, expertProfile: true },
        },
      },
    });

    const incubatorName = assignment.cohort.incubator?.name ?? 'Incubateur';
    const { title, message } = this.messageBuilder.expertApplicationAccepted({
      role: assignment.role as 'JURY' | 'COACH',
      cohortName: assignment.cohort.name,
      incubatorName,
    });

    const event = assignment.role === 'COACH' ? NotificationEvent.ASSIGNED_AS_COACH : NotificationEvent.ASSIGNED_AS_JURY;
    this.eventEmitter.emit(
      event,
      {
        event,
        recipients: [{ userId: assignment.expert_user_id }],
        title,
        message,
        link: `/incubator/cohorts/${assignment.cohort_id}`,
        senderId: userId,
        resourceType: 'COHORT',
        resourceId: assignment.cohort_id,
      } as NotificationPayload,
    );

    return updated;
  }

  // ==================== INCUBATEUR — REFUSER UNE CANDIDATURE EXPERT ====================

  async declineApplication(id: string, userId: string) {
    const assignment = await this.prisma.cohortExpert.findUnique({
      where: { id },
      include: {
        cohort: { include: { incubator: { select: { name: true } } } },
      },
    });
    if (!assignment) throw new NotFoundException('Candidature introuvable');
    if (!assignment.cohort.incubator_id) {
      throw new BadRequestException('Cohorte sans incubateur');
    }

    await this.assertCanManageCohorts(assignment.cohort.incubator_id, userId);

    if (assignment.status !== CohortExpertStatus.PENDING) {
      throw new BadRequestException("Seules les candidatures en attente peuvent être refusées");
    }

    const updated = await this.prisma.cohortExpert.update({
      where: { id },
      data: {
        status: CohortExpertStatus.INACTIVE,
        responded_at: new Date(),
      },
    });

    const incubatorName = assignment.cohort.incubator?.name ?? 'Incubateur';
    const { title, message } = this.messageBuilder.expertApplicationRejected({
      role: assignment.role as 'JURY' | 'COACH',
      cohortName: assignment.cohort.name,
      incubatorName,
    });

    this.eventEmitter.emit(
      NotificationEvent.APPLICATION_REJECTED,
      {
        event: NotificationEvent.APPLICATION_REJECTED,
        recipients: [{ userId: assignment.expert_user_id }],
        title,
        message,
        link: `/incubator/cohorts/${assignment.cohort_id}`,
        senderId: userId,
        resourceType: 'COHORT',
        resourceId: assignment.cohort_id,
      } as NotificationPayload,
    );

    return updated;
  }

  // ==================== LECTURE (existants) ====================

  async findByCohort(
    cohortId: string,
    filters?: { role?: CohortExpertRole; status?: CohortExpertStatus },
    userId?: string,
  ) {
    if (userId) {
      const access = await this.hasCohortReadAccess(cohortId, userId);
      if (!access) {
        throw new ForbiddenException(
          "Vous n'avez pas accÃ¨s aux experts de cette cohorte",
        );
      }
    }
    const where: any = { cohort_id: cohortId };
    if (filters?.role) where.role = filters.role;
    if (filters?.status) where.status = filters.status;

    return this.prisma.cohortExpert.findMany({
      where,
      include: {
        expertUser: {
          include: { profile: true, expertProfile: true },
        },
      },
      orderBy: { assigned_at: 'desc' },
    });
  }

  async findOne(id: string, userId?: string) {
    const assignment = await this.prisma.cohortExpert.findUnique({
      where: { id },
      include: {
        expertUser: {
          include: { profile: true, expertProfile: true },
        },
        cohort: { select: { id: true, name: true, incubator_id: true } },
      },
    });
    if (!assignment) throw new NotFoundException('Affectation introuvable');

    if (userId) {
      const isExpert = assignment.expert_user_id === userId;
      const isIncubatorMember = assignment.cohort.incubator_id
        ? !!(await this.prisma.incubatorMember.findUnique({
            where: {
              user_id_incubator_id: {
                user_id: userId,
                incubator_id: assignment.cohort.incubator_id,
              },
            },
            select: { id: true },
          }))
        : false;
      if (!isExpert && !isIncubatorMember) {
        throw new ForbiddenException(
          "Vous n'avez pas accÃ¨s Ã  cette affectation",
        );
      }
    }

    return assignment;
  }

  async update(
    id: string,
    dto: UpdateCohortExpertDto,
    userId: string,
  ) {
    const assignment = await this.prisma.cohortExpert.findUnique({
      where: { id },
      include: { cohort: true },
    });
    if (!assignment) throw new NotFoundException('Affectation introuvable');
    if (!assignment.cohort.incubator_id) {
      throw new BadRequestException('Cohorte sans incubateur');
    }

    await this.assertCanManageCohorts(assignment.cohort.incubator_id, userId);

    if (dto.role && dto.role !== assignment.role) {
      const duplicate = await this.prisma.cohortExpert.findUnique({
        where: {
          cohort_id_expert_user_id_role: {
            cohort_id: assignment.cohort_id,
            expert_user_id: assignment.expert_user_id,
            role: dto.role,
          },
        },
      });
      if (duplicate) {
        throw new BadRequestException(
          'Cet expert est déjà affecté à cette cohorte avec ce rôle',
        );
      }
    }

    return this.prisma.cohortExpert.update({
      where: { id },
      data: {
        role: dto.role,
        status: dto.status,
      },
      include: {
        expertUser: {
          include: { profile: true, expertProfile: true },
        },
      },
    });
  }

  async deactivate(id: string, userId: string) {
    const assignment = await this.prisma.cohortExpert.findUnique({
      where: { id },
      include: { cohort: true },
    });
    if (!assignment) throw new NotFoundException('Affectation introuvable');
    if (!assignment.cohort.incubator_id) {
      throw new BadRequestException('Cohorte sans incubateur');
    }

    await this.assertCanManageCohorts(assignment.cohort.incubator_id, userId);

    return this.prisma.cohortExpert.update({
      where: { id },
      data: { status: CohortExpertStatus.INACTIVE },
      include: {
        expertUser: {
          include: { profile: true, expertProfile: true },
        },
      },
    });
  }

  async findAvailable(
    cohortId: string,
    filters?: { expertiseAreaId?: string; availability?: string },
    userId?: string,
  ) {
    const cohort = await this.prisma.cohort.findUnique({
      where: { id: cohortId },
    });
    if (!cohort) throw new NotFoundException('Cohorte introuvable');

    if (userId && cohort.incubator_id) {
      const member = await this.prisma.incubatorMember.findUnique({
        where: {
          user_id_incubator_id: {
            user_id: userId,
            incubator_id: cohort.incubator_id,
          },
        },
        select: { id: true },
      });
      if (!member) {
        throw new ForbiddenException(
          "Vous n'avez pas accÃ¨s aux experts disponibles de cette cohorte",
        );
      }
    }

    const assignedExpertIds = (
      await this.prisma.cohortExpert.findMany({
        where: {
          cohort_id: cohortId,
          status: CohortExpertStatus.ACTIVE,
        },
        select: { expert_user_id: true },
      })
    ).map((e) => e.expert_user_id);

    const where: any = {
      role: 'EXPERT',
      expertProfile: {
        is: {},
      },
    };

    if (assignedExpertIds.length > 0) {
      where.id = { notIn: assignedExpertIds };
    }

    if (filters?.availability) {
      where.expertProfile.availability_status = filters.availability;
    }

    if (filters?.expertiseAreaId) {
      where.expertProfile.expertiseConnections = {
        some: { expertise_area_id: filters.expertiseAreaId },
      };
    }

    const users = await this.prisma.user.findMany({
      where,
      include: {
        profile: true,
        expertProfile: {
          include: {
            expertiseConnections: {
              include: { expertiseArea: true },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return users.filter((u) => u.expertProfile);
  }

  // ==================== VÉRIFICATIONS ====================

  private async assertNoDuplicate(
    cohortId: string,
    expertUserId: string,
    role: CohortExpertRole,
  ): Promise<void> {
    const existing = await this.prisma.cohortExpert.findUnique({
      where: {
        cohort_id_expert_user_id_role: {
          cohort_id: cohortId,
          expert_user_id: expertUserId,
          role,
        },
      },
    });
    if (existing) {
      throw new BadRequestException(
        'Cet expert est déjà affecté à cette cohorte avec ce rôle',
      );
    }

    const existingOtherRole = await this.prisma.cohortExpert.findFirst({
      where: {
        cohort_id: cohortId,
        expert_user_id: expertUserId,
        status: CohortExpertStatus.ACTIVE,
      },
    });
    if (existingOtherRole && existingOtherRole.role !== role) {
      throw new BadRequestException(
        'Cet expert est déjà actif dans cette cohorte avec un autre rôle',
      );
    }
  }

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
    if (member.role !== 'ADMIN' && !member.can_manage_cohorts) {
      throw new ForbiddenException(
        'Permissions insuffisantes pour gérer les experts de cohorte',
      );
    }
  }

  private async hasCohortReadAccess(
    cohortId: string,
    userId: string,
  ): Promise<boolean> {
    const isExpert = !!(await this.prisma.cohortExpert.findFirst({
      where: { cohort_id: cohortId, expert_user_id: userId },
      select: { id: true },
    }));
    if (isExpert) return true;

    const cohort = await this.prisma.cohort.findUnique({
      where: { id: cohortId },
      select: { incubator_id: true },
    });
    if (!cohort?.incubator_id) return false;

    const member = await this.prisma.incubatorMember.findUnique({
      where: {
        user_id_incubator_id: {
          user_id: userId,
          incubator_id: cohort.incubator_id,
        },
      },
      select: { id: true },
    });
    return !!member;
  }
}
