import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { CohortExpertStatus, ParticipationStatus } from '@prisma/client';
import { CreateCoachingDto, UpdateCoachingDto } from './dto/coaching.dto';
import { NotificationEvent } from '../events/notification-event.enum';
import { NotificationPayload } from '../events/notification-payload.interface';
import { NotificationMessageBuilder } from '../events/notification-message-builder';

@Injectable()
export class CoachingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly messageBuilder: NotificationMessageBuilder,
  ) {}

  async create(projectId: string, dto: CreateCoachingDto, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Projet introuvable');

    const participation = await this.prisma.cohortParticipation.findFirst({
      where: {
        project_id: projectId,
        status: ParticipationStatus.ACCEPTED,
      },
    });
    if (!participation) {
      throw new BadRequestException(
        "Ce projet n'est pas accepté dans une cohorte",
      );
    }

    const assignment = await this.prisma.cohortExpert.findFirst({
      where: {
        cohort_id: participation.cohort_id,
        expert_user_id: userId,
        role: 'COACH',
        status: CohortExpertStatus.ACTIVE,
      },
    });
    if (!assignment) {
      throw new BadRequestException(
        "Vous n'êtes pas coach affecté à la cohorte de ce projet",
      );
    }

    const existing = await this.prisma.coaching.findUnique({
      where: {
        project_id_coach_user_id: {
          project_id: projectId,
          coach_user_id: userId,
        },
      },
    });
    if (existing) {
      throw new BadRequestException(
        'Vous avez déjà un coaching pour ce projet. Utilisez la modification.',
      );
    }

    const coaching = await this.prisma.coaching.create({
      data: {
        project_id: projectId,
        coach_user_id: userId,
        feedback: dto.feedback,
      },
      include: {
        project: { select: { id: true, name: true } },
        coachUser: {
          select: { id: true, email: true, profile: true },
        },
      },
    });

    if (project) {
      const { title, message } = this.messageBuilder.coachingFeedback({ projectName: project.name });
      this.eventEmitter.emit(
        NotificationEvent.COACHING_FEEDBACK,
        {
          event: NotificationEvent.COACHING_FEEDBACK,
          recipients: [{ userId: project.owner_id }],
          title,
          message,
          link: `/project-owner/projects/${projectId}/coachings`,
          senderId: userId,
          resourceType: 'PROJECT',
          resourceId: projectId,
        } as NotificationPayload,
      );
    }

    return coaching;
  }

  async update(id: string, dto: UpdateCoachingDto, userId: string) {
    const coaching = await this.prisma.coaching.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            cohort_participations: {
              where: { status: ParticipationStatus.ACCEPTED },
              select: { cohort_id: true },
            },
          },
        },
      },
    });
    if (!coaching) throw new NotFoundException('Coaching introuvable');
    if (coaching.coach_user_id !== userId) {
      throw new BadRequestException(
        "Vous ne pouvez modifier que vos propres coachings",
      );
    }

    const cohortId = coaching.project.cohort_participations[0]?.cohort_id;
    if (!cohortId) {
      throw new BadRequestException(
        "Ce projet n'est associé à aucune cohorte",
      );
    }

    const assignment = await this.prisma.cohortExpert.findFirst({
      where: {
        cohort_id: cohortId,
        expert_user_id: userId,
        role: 'COACH',
        status: CohortExpertStatus.ACTIVE,
      },
    });
    if (!assignment) {
      throw new BadRequestException(
        "Vous n'êtes plus coach actif dans la cohorte de ce projet",
      );
    }

    return this.prisma.coaching.update({
      where: { id },
      data: {
        feedback: dto.feedback,
      },
      include: {
        project: { select: { id: true, name: true } },
        coachUser: {
          select: { id: true, email: true, profile: true },
        },
      },
    });
  }

  async findByProject(projectId: string) {
    return this.prisma.coaching.findMany({
      where: { project_id: projectId },
      include: {
        coachUser: {
          select: { id: true, email: true, profile: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findByCohort(cohortId: string) {
    const participations = await this.prisma.cohortParticipation.findMany({
      where: {
        cohort_id: cohortId,
        status: ParticipationStatus.ACCEPTED,
      },
      select: { project_id: true },
    });

    const projectIds = participations.map((p) => p.project_id);
    if (projectIds.length === 0) return [];

    return this.prisma.coaching.findMany({
      where: { project_id: { in: projectIds } },
      include: {
        project: { select: { id: true, name: true } },
        coachUser: {
          select: { id: true, email: true, profile: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findMyCoachings(userId: string) {
    return this.prisma.coaching.findMany({
      where: { coach_user_id: userId },
      include: {
        project: { select: { id: true, name: true, description: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    const coaching = await this.prisma.coaching.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true, description: true } },
        coachUser: {
          select: { id: true, email: true, profile: true },
        },
      },
    });
    if (!coaching) throw new NotFoundException('Coaching introuvable');
    return coaching;
  }
}
