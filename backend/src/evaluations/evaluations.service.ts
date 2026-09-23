import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { CohortExpertStatus, ParticipationStatus } from '@prisma/client';
import { CreateEvaluationDto, UpdateEvaluationDto } from './dto/evaluation.dto';
import { NotificationEvent } from '../events/notification-event.enum';
import { NotificationPayload } from '../events/notification-payload.interface';
import { NotificationMessageBuilder } from '../events/notification-message-builder';

@Injectable()
export class EvaluationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly messageBuilder: NotificationMessageBuilder,
  ) {}

  async create(projectId: string, dto: CreateEvaluationDto, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Projet introuvable');

    const participation = await this.prisma.cohortParticipation.findFirst({
      where: {
        project_id: projectId,
        status: ParticipationStatus.ACCEPTED,
      },
      include: { cohort: true },
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
        role: 'JURY',
        status: CohortExpertStatus.ACTIVE,
      },
    });
    if (!assignment) {
      throw new BadRequestException(
        "Vous n'êtes pas jury affecté à la cohorte de ce projet",
      );
    }

    const existing = await this.prisma.evaluation.findUnique({
      where: {
        project_id_jury_user_id: {
          project_id: projectId,
          jury_user_id: userId,
        },
      },
    });
    if (existing) {
      throw new BadRequestException(
        'Vous avez déjà évalué ce projet. Utilisez la modification.',
      );
    }

    const evaluation = await this.prisma.evaluation.create({
      data: {
        project_id: projectId,
        jury_user_id: userId,
        score: dto.score,
        comment: dto.comment,
      },
      include: {
        project: { select: { id: true, name: true } },
        juryUser: {
          select: { id: true, email: true, profile: true },
        },
      },
    });

    if (project) {
      const { title, message } = this.messageBuilder.newEvaluation({ projectName: project.name });
      this.eventEmitter.emit(
        NotificationEvent.NEW_EVALUATION,
        {
          event: NotificationEvent.NEW_EVALUATION,
          recipients: [{ userId: project.owner_id }],
          title,
          message,
          link: `/project-owner/projects/${projectId}/evaluations`,
          senderId: userId,
          resourceType: 'PROJECT',
          resourceId: projectId,
        } as NotificationPayload,
      );
    }

    return evaluation;
  }

  async update(id: string, dto: UpdateEvaluationDto, userId: string) {
    const evaluation = await this.prisma.evaluation.findUnique({
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
    if (!evaluation) throw new NotFoundException('Évaluation introuvable');
    if (evaluation.jury_user_id !== userId) {
      throw new BadRequestException(
        "Vous ne pouvez modifier que vos propres évaluations",
      );
    }

    const cohortId = evaluation.project.cohort_participations[0]?.cohort_id;
    if (!cohortId) {
      throw new BadRequestException(
        "Ce projet n'est associé à aucune cohorte",
      );
    }

    const assignment = await this.prisma.cohortExpert.findFirst({
      where: {
        cohort_id: cohortId,
        expert_user_id: userId,
        role: 'JURY',
        status: CohortExpertStatus.ACTIVE,
      },
    });
    if (!assignment) {
      throw new BadRequestException(
        "Vous n'êtes plus jury actif dans la cohorte de ce projet",
      );
    }

    return this.prisma.evaluation.update({
      where: { id },
      data: {
        score: dto.score,
        comment: dto.comment,
      },
      include: {
        project: { select: { id: true, name: true } },
        juryUser: {
          select: { id: true, email: true, profile: true },
        },
      },
    });
  }

  async findByProject(projectId: string) {
    return this.prisma.evaluation.findMany({
      where: { project_id: projectId },
      include: {
        juryUser: {
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

    return this.prisma.evaluation.findMany({
      where: { project_id: { in: projectIds } },
      include: {
        project: { select: { id: true, name: true } },
        juryUser: {
          select: { id: true, email: true, profile: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findMyEvaluations(userId: string) {
    return this.prisma.evaluation.findMany({
      where: { jury_user_id: userId },
      include: {
        project: { select: { id: true, name: true, description: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    const evaluation = await this.prisma.evaluation.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true, description: true } },
        juryUser: {
          select: { id: true, email: true, profile: true },
        },
      },
    });
    if (!evaluation) throw new NotFoundException('Évaluation introuvable');
    return evaluation;
  }
}
