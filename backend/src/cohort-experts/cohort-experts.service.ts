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
    if (expertUser.role !== 'expert') {
      throw new BadRequestException("Cet utilisateur n'a pas le rôle expert");
    }

    const existing = await this.prisma.cohortExpert.findUnique({
      where: {
        cohort_id_expert_user_id_role: {
          cohort_id: cohortId,
          expert_user_id: dto.expertUserId,
          role: dto.role,
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
        expert_user_id: dto.expertUserId,
        status: CohortExpertStatus.ACTIVE,
      },
    });
    if (existingOtherRole && existingOtherRole.role !== dto.role) {
      throw new BadRequestException(
        'Cet expert est déjà actif dans cette cohorte avec un autre rôle',
      );
    }

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

  async findByCohort(
    cohortId: string,
    filters?: { role?: CohortExpertRole; status?: CohortExpertStatus },
  ) {
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

  async findOne(id: string) {
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
  ) {
    const cohort = await this.prisma.cohort.findUnique({
      where: { id: cohortId },
    });
    if (!cohort) throw new NotFoundException('Cohorte introuvable');

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
      role: 'expert',
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
        'Permissions insuffisantes pour gérer les experts de cohorte',
      );
    }
  }
}
