import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CohortStatus } from '@prisma/client';
import { CreateCohortDto } from './dto/create-cohort.dto';
import { UpdateCohortDto } from './dto/update-cohort.dto';
import { NotificationEvent } from '../events/notification-event.enum';
import { NotificationPayload } from '../events/notification-payload.interface';
import { NotificationMessageBuilder } from '../events/notification-message-builder';

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
  ) {}

  async create(incubatorId: string, dto: CreateCohortDto, userId: string) {
    await this.assertCanManageCohorts(incubatorId, userId);

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

    const incubator = await this.prisma.incubator.findUnique({ where: { id: incubatorId }, select: { name: true } });
    const members = await this.prisma.incubatorMember.findMany({
      where: { incubator_id: incubatorId, status: 'active' },
      select: { user_id: true },
    });
    const memberIds = members.map(m => m.user_id);
    if (memberIds.length > 0) {
      const { title, message } = this.messageBuilder.cohortCreated({
        cohortName: cohort.name,
        incubatorName: incubator?.name ?? 'Incubateur',
      });
      this.eventEmitter.emit(
        NotificationEvent.COHORT_CREATED,
        {
          event: NotificationEvent.COHORT_CREATED,
          recipients: memberIds.map(id => ({ userId: id })),
          title,
          message,
          link: `/incubator/${incubatorId}/cohorts/${cohort.id}`,
          senderId: userId,
          resourceType: 'COHORT',
          resourceId: cohort.id,
        } as NotificationPayload,
      );
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
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    const cohort = await this.prisma.cohort.findUnique({
      where: { id },
      include: {
        participations: {
          include: {
            project: {
              select: { id: true, name: true, description: true, owner_id: true },
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
    if (!cohort.incubator_id) throw new BadRequestException('Cohorte sans incubateur');

    await this.assertCanManageCohorts(cohort.incubator_id, userId);

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
    if (!cohort.incubator_id) throw new BadRequestException('Cohorte sans incubateur');

    await this.assertCanManageCohorts(cohort.incubator_id, userId);

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
      ? (await this.prisma.incubator.findUnique({ where: { id: cohort.incubator_id }, select: { name: true } }))?.name
      : undefined;

    const members = cohort.incubator_id ? await this.prisma.incubatorMember.findMany({
      where: { incubator_id: cohort.incubator_id, status: 'active' },
      select: { user_id: true },
    }) : [];
    const memberIds = members.map(m => m.user_id);
    if (memberIds.length > 0) {
      const { title, message } = this.messageBuilder.applicationOpen({
        cohortName: cohort.name,
        incubatorName: incubatorName ?? 'Incubateur',
      });
      this.eventEmitter.emit(
        NotificationEvent.APPLICATION_OPEN,
        {
          event: NotificationEvent.APPLICATION_OPEN,
          recipients: memberIds.map(id => ({ userId: id })),
          title,
          message,
          link: `/incubator/${cohort.incubator_id}/cohorts/${cohort.id}`,
          senderId: userId,
          resourceType: 'COHORT',
          resourceId: cohort.id,
        } as NotificationPayload,
      );
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
        'Permissions insuffisantes pour gérer les cohortes',
      );
    }
  }
}
