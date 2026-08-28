import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import {
  CohortExpertStatus,
  EvaluationStatus,
  ParticipationStatus,
  ResourceType,
} from '@prisma/client';
import { CreateEvaluationDto, UpdateEvaluationDto } from './dto/evaluation.dto';
import { SaveScoresDto } from './dto/save-scores.dto';
import { RequestReevaluationDto } from './dto/request-reevaluation.dto';
import { ModuleAccessService } from '../common/services/module-access.service';
import { AuditService } from '../audit/audit.service';
import { computeWeightedScore } from './score.util';
import { NotificationEvent } from '../events/notification-event.enum';
import { NotificationPayload } from '../events/notification-payload.interface';
import { NotificationMessageBuilder } from '../events/notification-message-builder';

@Injectable()
export class EvaluationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly messageBuilder: NotificationMessageBuilder,
    private readonly access: ModuleAccessService,
    private readonly audit: AuditService,
  ) {}

  async create(projectId: string, dto: CreateEvaluationDto, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Projet introuvable');

    const participations = await this.prisma.cohortParticipation.findMany({
      where: {
        project_id: projectId,
        status: ParticipationStatus.ACCEPTED,
      },
      select: { cohort_id: true },
    });
    if (participations.length === 0) {
      throw new BadRequestException(
        "Ce projet n'est pas accepté dans une cohorte",
      );
    }

    // Le jury peut être actif sur l'une des cohortes acceptées du projet
    const assignment = await this.prisma.cohortExpert.findFirst({
      where: {
        cohort_id: { in: participations.map((p) => p.cohort_id) },
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

    const existing = await this.prisma.evaluation.findFirst({
      where: {
        project_id: projectId,
        jury_user_id: userId,
      },
      orderBy: { version: 'desc' },
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
        status: 'SUBMITTED',
        submitted_at: new Date(),
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
      // 403 : l'évaluation existe mais n'appartient pas à cet utilisateur
      throw new ForbiddenException(
        'Vous ne pouvez modifier que vos propres évaluations',
      );
    }
    if (evaluation.status === EvaluationStatus.SUBMITTED) {
      throw new BadRequestException(
        'Une évaluation soumise ne peut plus être modifiée',
      );
    }

    const cohortIds = evaluation.project.cohort_participations.map((p) => p.cohort_id);
    if (cohortIds.length === 0) {
      throw new BadRequestException(
        "Ce projet n'est associé à aucune cohorte",
      );
    }

    const assignment = await this.prisma.cohortExpert.findFirst({
      where: {
        cohort_id: { in: cohortIds },
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

  async findByProject(projectId: string, userId: string) {
    await this.assertCanViewEvaluations(projectId, userId);
    // Les brouillons restent privés : seul leur auteur (le jury) les voit.
    // Le porteur et l'incubateur ne consultent que les évaluations soumises.
    return this.prisma.evaluation.findMany({
      where: {
        project_id: projectId,
        OR: [
          { status: EvaluationStatus.SUBMITTED },
          { jury_user_id: userId },
        ],
      },
      include: {
        juryUser: {
          select: { id: true, email: true, profile: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findByCohort(cohortId: string, userId: string) {
    await this.assertCanViewCohortEvaluations(cohortId, userId);
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

  async findOne(id: string, userId?: string) {
    const evaluation = await this.prisma.evaluation.findUnique({
      where: { id },
      include: {
        project: {
          select: { id: true, name: true, description: true, owner_id: true },
        },
        juryUser: {
          select: { id: true, email: true, profile: true },
        },
      },
    });
    if (!evaluation) throw new NotFoundException('Évaluation introuvable');

    if (userId) {
      const isOwner = evaluation.project.owner_id === userId;
      const isJury = evaluation.jury_user_id === userId;
      const isCohortMember =
        (await this.access.getAcceptedCohortForProject(evaluation.project.id)) &&
        (await this.access.canEvaluateProject(evaluation.project.id, userId));
      const isIncubatorMember = await this.isIncubatorMember(
        evaluation.project.id,
        userId,
      );
      if (!isOwner && !isJury && !isCohortMember && !isIncubatorMember) {
        throw new ForbiddenException('Accès refusé à cette évaluation');
      }
    }

    return evaluation;
  }

  private async isIncubatorMember(
    projectId: string,
    userId: string,
  ): Promise<boolean> {
    const participation = await this.access.getAcceptedCohortForProject(projectId);
    if (!participation?.cohort.incubator_id) return false;
    const member = await this.prisma.incubatorMember.findUnique({
      where: {
        user_id_incubator_id: {
          user_id: userId,
          incubator_id: participation.cohort.incubator_id,
        },
      },
      select: { id: true },
    });
    return !!member;
  }

  // ==================== MODULE ÉVALUATION (grilles / scores) ====================

  /** L'expert doit être jury ACTIF sur la cohorte (rôle défini par cohorte). */
  private async assertJuryActiveOnCohort(
    cohortId: string,
    userId: string,
  ): Promise<void> {
    const juryLink = await this.prisma.cohortExpert.findFirst({
      where: {
        cohort_id: cohortId,
        expert_user_id: userId,
        role: 'JURY',
        status: CohortExpertStatus.ACTIVE,
      },
      select: { id: true },
    });
    if (!juryLink) {
      throw new ForbiddenException(
        "Vous n'êtes pas jury actif dans la cohorte de ce projet",
      );
    }
  }

  async createDraft(assignmentId: string, userId: string) {
    const assignment = await this.prisma.evaluationAssignment.findUnique({
      where: { id: assignmentId },
    });
    if (!assignment) throw new NotFoundException('Affectation introuvable');
    if (assignment.jury_user_id !== userId) {
      throw new ForbiddenException(
        'Vous ne pouvez évaluer que les projets qui vous sont affectés',
      );
    }
    // L'expert doit toujours être jury actif dans la cohorte de l'affectation.
    await this.assertJuryActiveOnCohort(assignment.cohort_id, userId);

    const existing = await this.prisma.evaluation.findFirst({
      where: {
        project_id: assignment.project_id,
        jury_user_id: userId,
      },
      orderBy: { version: 'desc' },
    });
    if (existing && existing.status === EvaluationStatus.SUBMITTED) {
      throw new BadRequestException(
        'Vous avez déjà soumis une évaluation pour ce projet',
      );
    }

    const template = await this.prisma.evaluationTemplate.findFirst({
      where: {
        cohort_id: assignment.cohort_id,
        published: true,
      },
      include: { criteria: { orderBy: { sort_order: 'asc' } } },
      orderBy: { created_at: 'desc' },
    });
    if (!template) {
      throw new BadRequestException(
        'Aucune grille publiée disponible pour cette cohorte',
      );
    }

    if (existing) {
      return this.prisma.evaluation.update({
        where: { id: existing.id },
        data: { template_id: template.id },
        include: {
          scores: true,
          template: { include: { criteria: { orderBy: { sort_order: 'asc' } } } },
          project: { select: { id: true, name: true } },
        },
      });
    }

    const evaluation = await this.prisma.evaluation.create({
      data: {
        project_id: assignment.project_id,
        jury_user_id: userId,
        template_id: template.id,
        status: EvaluationStatus.DRAFT,
        version: 1,
      },
      include: {
        scores: true,
        template: { include: { criteria: { orderBy: { sort_order: 'asc' } } } },
        project: { select: { id: true, name: true } },
      },
    });

    await this.audit.log({
      actorId: userId,
      action: 'EVALUATION_DRAFT_CREATE',
      entityType: 'Evaluation',
      entityId: evaluation.id,
      metadata: { project_id: assignment.project_id },
    });

    return evaluation;
  }

  async saveScores(id: string, dto: SaveScoresDto, userId: string) {
    const evaluation = await this.prisma.evaluation.findUnique({
      where: { id },
      include: { template: { include: { criteria: true } } },
    });
    if (!evaluation) throw new NotFoundException('Évaluation introuvable');
    if (evaluation.jury_user_id !== userId) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que vos propres évaluations',
      );
    }
    if (evaluation.status === EvaluationStatus.SUBMITTED) {
      throw new BadRequestException(
        'Une évaluation soumise ne peut plus être modifiée',
      );
    }

    const validCriterionIds = new Set(evaluation.template?.criteria.map((c) => c.id) ?? []);
    const criteriaMap = new Map(
      (evaluation.template?.criteria ?? []).map((c) => [c.id, c]),
    );
    for (const item of dto.scores) {
      if (!validCriterionIds.has(item.criterionId)) {
        throw new BadRequestException(
          `Le critère « ${item.criterionId} » n'appartient pas à la grille de cette évaluation`,
        );
      }
      const criterion = criteriaMap.get(item.criterionId)!;
      if (item.score < 0 || item.score > criterion.max_score) {
        throw new BadRequestException(
          `Le score ${item.score} est hors limites (0-${criterion.max_score}) pour le critère « ${criterion.name} »`,
        );
      }
    }

    await this.prisma.$transaction(
      dto.scores.map((item) =>
        this.prisma.evaluationScore.upsert({
          where: {
            evaluation_id_criterion_id: {
              evaluation_id: id,
              criterion_id: item.criterionId,
            },
          },
          create: {
            evaluation_id: id,
            criterion_id: item.criterionId,
            score: item.score,
            comment: item.comment,
          },
          update: {
            score: item.score,
            comment: item.comment,
          },
        }),
      ),
    );

    const scores = await this.prisma.evaluationScore.findMany({
      where: { evaluation_id: id },
    });

    return {
      id,
      status: evaluation.status,
      scores,
    };
  }

  async submit(id: string, userId: string) {
    const evaluation = await this.prisma.evaluation.findUnique({
      where: { id },
      include: {
        template: {
          include: { criteria: { orderBy: { sort_order: 'asc' } } },
        },
        scores: true,
        project: { select: { id: true, name: true, owner_id: true } },
      },
    });
    if (!evaluation) throw new NotFoundException('Évaluation introuvable');
    if (evaluation.jury_user_id !== userId) {
      throw new ForbiddenException(
        'Vous ne pouvez soumettre que vos propres évaluations',
      );
    }
    if (evaluation.status === EvaluationStatus.SUBMITTED) {
      throw new BadRequestException('Évaluation déjà soumise');
    }

    if (!evaluation.template) {
      throw new BadRequestException(
        'Aucune grille associée à cette évaluation',
      );
    }

    const computation = computeWeightedScore(
      evaluation.template.criteria,
      evaluation.scores,
    );
    const allScored = evaluation.template.criteria.every((c) =>
      evaluation.scores.some((s) => s.criterion_id === c.id),
    );
    if (!allScored) {
      throw new BadRequestException(
        'Tous les critères doivent être notés avant la soumission',
      );
    }

    const submitted = await this.prisma.evaluation.update({
      where: { id },
      data: {
        status: EvaluationStatus.SUBMITTED,
        score: computation.total20,
        submitted_at: new Date(),
      },
      include: {
        scores: true,
        template: { include: { criteria: true } },
        project: { select: { id: true, name: true, owner_id: true } },
      },
    });

    await this.audit.log({
      actorId: userId,
      action: 'EVALUATION_SUBMIT',
      entityType: 'Evaluation',
      entityId: id,
      metadata: { total20: computation.total20 },
    });

    const { title, message } = this.messageBuilder.evaluationSubmitted({
      projectName: evaluation.project.name,
    });
    this.access.notify({
      event: NotificationEvent.EVALUATION_SUBMITTED,
      recipients: [{ userId: evaluation.project.owner_id }],
      title,
      message,
      link: `/project-owner/projects/${evaluation.project.id}/evaluations`,
      senderId: userId,
      resourceType: ResourceType.EVALUATION,
      resourceId: evaluation.project.id,
    });

    await this.checkAllSubmittedAndNotify(evaluation.project.id);

    return { ...submitted, total: computation.total, total20: computation.total20 };
  }

  private async checkAllSubmittedAndNotify(projectId: string) {
    const assignment = await this.prisma.evaluationAssignment.findFirst({
      where: { project_id: projectId },
    });
    if (!assignment) return;

    const [totalAssignments, submittedCount] = await Promise.all([
      this.prisma.evaluationAssignment.count({ where: { project_id: projectId } }),
      this.prisma.evaluation.count({
        where: { project_id: projectId, status: EvaluationStatus.SUBMITTED },
      }),
    ]);
    if (totalAssignments === 0 || submittedCount < totalAssignments) return;

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, name: true, owner_id: true },
    });
    if (!project) return;

    const cohortId = assignment.cohort_id;
    const members = await this.getIncubatorMembersForCohort(cohortId);
    const { title, message } = this.messageBuilder.evaluationAllCompleted({
      projectName: project.name,
    });
    this.access.notify({
      event: NotificationEvent.EVALUATION_ALL_COMPLETED,
      recipients: [
        { userId: project.owner_id },
        ...members.map((id) => ({ userId: id })),
      ],
      title,
      message,
      link: `/incubator/cohorts/${cohortId}/evaluations`,
      resourceType: ResourceType.EVALUATION,
      resourceId: projectId,
    });
  }

  private async getIncubatorMembersForCohort(cohortId: string): Promise<string[]> {
    const cohort = await this.prisma.cohort.findUnique({
      where: { id: cohortId },
      select: { incubator_id: true },
    });
    if (!cohort?.incubator_id) return [];
    const members = await this.prisma.incubatorMember.findMany({
      where: { incubator_id: cohort.incubator_id, status: 'ACTIVE' },
      select: { user_id: true },
    });
    return members.map((m) => m.user_id);
  }

  private async assertCanViewEvaluations(
    projectId: string,
    userId: string,
  ): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { owner_id: true },
    });
    if (!project) throw new NotFoundException('Projet introuvable');
    if (project.owner_id === userId) return;
    if (await this.access.canEvaluateProject(projectId, userId)) return;
    if (await this.isIncubatorMember(projectId, userId)) return;
    throw new ForbiddenException(
      "Vous n'avez pas accès aux évaluations de ce projet",
    );
  }

  private async assertCanViewCohortEvaluations(
    cohortId: string,
    userId: string,
  ): Promise<void> {
    const isCohortMember = await this.isCohortMember(cohortId, userId);
    if (isCohortMember) return;
    throw new ForbiddenException(
      "Vous n'avez pas accès aux évaluations de cette cohorte",
    );
  }

  private async isCohortMember(
    cohortId: string,
    userId: string,
  ): Promise<boolean> {
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

  async getProjectSummary(projectId: string, userId: string) {
    await this.access.assertProjectExists(projectId);
    const canView =
      (await this.access.getAcceptedCohortForProject(projectId)) &&
      (await this.canViewSummary(projectId, userId));
    if (!canView) {
      throw new ForbiddenException('Accès refusé au résumé des évaluations');
    }

    const evaluations = await this.prisma.evaluation.findMany({
      where: { project_id: projectId, status: EvaluationStatus.SUBMITTED },
      include: {
        juryUser: {
          select: {
            id: true,
            email: true,
            profile: { select: { first_name: true, last_name: true } },
          },
        },
        scores: true,
        template: { include: { criteria: { orderBy: { sort_order: 'asc' } } } },
      },
    });

    if (evaluations.length === 0) {
      return {
        project_id: projectId,
        submitted: 0,
        average20: null,
        min20: null,
        max20: null,
        byEvaluator: [],
        byCriterion: [],
      };
    }

    const totals = evaluations
      .map((e) => {
        if (!e.template) return null;
        const computation = computeWeightedScore(e.template.criteria, e.scores);
        return { evaluation: e, total: computation.total, total20: computation.total20 };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    const average20 =
      totals.length > 0
        ? Math.round((totals.reduce((s, x) => s + x.total20, 0) / totals.length) * 100) / 100
        : null;

    const criterionMap = new Map<string, { name: string; weight: number; max_score: number; sums: number[] }>();
    for (const t of totals) {
      const criteria = t.evaluation.template?.criteria ?? [];
      for (const c of criteria) {
        if (!criterionMap.has(c.id)) {
          criterionMap.set(c.id, { name: c.name, weight: c.weight, max_score: c.max_score, sums: [] });
        }
        const s = t.evaluation.scores.find((x) => x.criterion_id === c.id);
        criterionMap.get(c.id)!.sums.push(s ? s.score : 0);
      }
    }

    const byCriterion = [...criterionMap.entries()].map(([id, c]) => ({
      criterion_id: id,
      name: c.name,
      weight: c.weight,
      max_score: c.max_score,
      average:
        Math.round((c.sums.reduce((a, b) => a + b, 0) / c.sums.length) * 100) / 100,
    }));

    return {
      project_id: projectId,
      submitted: evaluations.length,
      average20,
      min20: Math.min(...totals.map((t) => t.total20)),
      max20: Math.max(...totals.map((t) => t.total20)),
      byEvaluator: totals.map((t) => ({
        juryMember: t.evaluation.juryUser,
        total: t.total,
        total20: t.total20,
        submitted_at: t.evaluation.submitted_at,
      })),
      byCriterion,
    };
  }

  private async canViewSummary(projectId: string, userId: string): Promise<boolean> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { owner_id: true },
    });
    if (project && project.owner_id === userId) return true;

    if (await this.access.canEvaluateProject(projectId, userId)) return true;

    const participation = await this.access.getAcceptedCohortForProject(projectId);
    if (participation?.cohort.incubator_id) {
      const member = await this.prisma.incubatorMember.findUnique({
        where: {
          user_id_incubator_id: {
            user_id: userId,
            incubator_id: participation.cohort.incubator_id,
          },
        },
        select: { id: true },
      });
      if (member) return true;
    }

    return false;
  }

  // ==================== RÉ-ÉVALUATION (boucle d'amélioration) ====================

  /**
   * Demande de ré-évaluation après exécution du plan d'amélioration :
   * crée un brouillon version+1 pour chaque jury affecté et le notifie.
   * Les scores restent exclusivement saisies par les jurys humains.
   */
  async requestReevaluation(
    projectId: string,
    dto: RequestReevaluationDto,
    userId: string,
  ) {
    await this.access.assertProjectExists(projectId);
    await this.access.assertCanManageProjectCoaching(projectId, userId);

    const participation = await this.access.getAcceptedCohortForProject(projectId);
    if (!participation) {
      throw new BadRequestException("Ce projet n'est pas accepté dans une cohorte");
    }

    const template = await this.prisma.evaluationTemplate.findFirst({
      where: { cohort_id: participation.cohort_id, published: true },
      orderBy: { created_at: 'desc' },
    });
    if (!template) {
      throw new BadRequestException('Aucune grille publiée pour cette cohorte');
    }

    const assignments = await this.prisma.evaluationAssignment.findMany({
      where: {
        project_id: projectId,
        ...(dto.juryUserIds && dto.juryUserIds.length > 0
          ? { jury_user_id: { in: dto.juryUserIds } }
          : {}),
      },
    });
    if (assignments.length === 0) {
      throw new BadRequestException('Aucun jury affecté à ce projet');
    }

    const created: Array<{ evaluationId: string; juryUserId: string; version: number }> = [];
    for (const assignment of assignments) {
      const latest = await this.prisma.evaluation.findFirst({
        where: {
          project_id: projectId,
          jury_user_id: assignment.jury_user_id,
          template_id: template.id,
        },
        orderBy: { version: 'desc' },
      });

      // Un brouillon existe déjà pour ce jury : pas de doublon
      if (latest && latest.status === EvaluationStatus.DRAFT) continue;

      const evaluation = await this.prisma.evaluation.create({
        data: {
          project_id: projectId,
          jury_user_id: assignment.jury_user_id,
          template_id: template.id,
          status: EvaluationStatus.DRAFT,
          version: (latest?.version ?? 0) + 1,
        },
        select: { id: true, jury_user_id: true, version: true },
      });
      created.push({
        evaluationId: evaluation.id,
        juryUserId: evaluation.jury_user_id,
        version: evaluation.version,
      });

      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        select: { name: true },
      });
      const { title, message } = this.messageBuilder.reEvaluationAvailable({
        projectName: project?.name ?? 'Projet',
      });
      this.access.notify({
        event: NotificationEvent.RE_EVALUATION_AVAILABLE,
        recipients: [{ userId: assignment.jury_user_id }],
        title,
        message,
        link: `/dashboard/jury/evaluations`,
        senderId: userId,
        resourceType: ResourceType.EVALUATION,
        resourceId: projectId,
      });
    }

    await this.audit.log({
      actorId: userId,
      action: 'EVALUATION_REEVALUATION_REQUEST',
      entityType: 'Evaluation',
      entityId: projectId,
      metadata: { created_count: created.length },
    });

    return { requested: created.length, evaluations: created };
  }
}
