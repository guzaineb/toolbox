import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  CohortExpertRole,
  CohortExpertStatus,
  ResourceType,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ModuleAccessService } from '../common/services/module-access.service';
import { AuditService } from '../audit/audit.service';
import { NotificationMessageBuilder } from '../events/notification-message-builder';
import { NotificationEvent } from '../events/notification-event.enum';
import { AssignEvaluatorsDto } from './dto/assign-evaluators.dto';

@Injectable()
export class EvaluationAssignmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ModuleAccessService,
    private readonly audit: AuditService,
    private readonly messageBuilder: NotificationMessageBuilder,
  ) {}

  async assign(cohortId: string, dto: AssignEvaluatorsDto, userId: string) {
    await this.access.assertCanManageCohort(cohortId, userId);

    const template = dto.templateId
      ? await this.prisma.evaluationTemplate.findUnique({
          where: { id: dto.templateId },
        })
      : null;
    if (dto.templateId && !template)
      throw new NotFoundException('Grille introuvable');
    if (template && template.cohort_id !== cohortId) {
      throw new BadRequestException(
        'La grille indiquée ne concerne pas cette cohorte',
      );
    }
    if (template && !template.published) {
      throw new BadRequestException(
        "La grille doit être publiée avant d'affecter des membres du jury",
      );
    }

    const deadline = dto.deadline ? new Date(dto.deadline) : undefined;
    const created: { id: string; project_id: string; jury_user_id: string }[] =
      [];

    for (const item of dto.assignments) {
      await this.access.assertProjectInCohort(item.projectId, cohortId);

      for (const juryUserId of item.juryUserIds) {
        const existing = await this.prisma.evaluationAssignment.findUnique({
          where: {
            cohort_id_project_id_jury_user_id: {
              cohort_id: cohortId,
              project_id: item.projectId,
              jury_user_id: juryUserId,
            },
          },
        });
        if (existing) continue;

        const assignment = await this.prisma.evaluationAssignment.create({
          data: {
            cohort_id: cohortId,
            project_id: item.projectId,
            jury_user_id: juryUserId,
            assigned_by: userId,
            deadline,
          },
        });
        created.push(assignment);
      }
    }

    if (created.length > 0) {
      await this.audit.log({
        actorId: userId,
        action: 'EVALUATION_ASSIGN_CREATE',
        entityType: 'EvaluationAssignment',
        entityId: created[0].id,
        metadata: { cohort_id: cohortId, count: created.length },
      });

      const projects = await this.prisma.project.findMany({
        where: { id: { in: created.map((c) => c.project_id) } },
        select: { id: true, name: true },
      });
      const projectName = new Map(projects.map((p) => [p.id, p.name]));

      const recipientsByUser = new Map<string, string[]>();
      for (const c of created) {
        const list = recipientsByUser.get(c.jury_user_id) ?? [];
        list.push(projectName.get(c.project_id) ?? 'projet');
        recipientsByUser.set(c.jury_user_id, list);
      }

      for (const [juryUserId, names] of recipientsByUser) {
        const { title, message } = this.messageBuilder.evaluationAvailable({
          projectName: names.join(', '),
        });
        this.access.notify({
          event: NotificationEvent.EVALUATION_AVAILABLE,
          recipients: [{ userId: juryUserId }],
          title,
          message,
          link: `/expert/evaluations/todo`,
          senderId: userId,
          resourceType: ResourceType.EVALUATION,
          resourceId: cohortId,
        });
      }
    }

    return { created: created.length, assignments: created };
  }

  async findByCohort(cohortId: string, userId: string) {
    await this.access.assertCanManageCohort(cohortId, userId);

    const assignments = await this.prisma.evaluationAssignment.findMany({
      where: { cohort_id: cohortId },
      include: {
        project: { select: { id: true, name: true } },
        juryUser: {
          select: {
            id: true,
            email: true,
            profile: { select: { first_name: true, last_name: true } },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    const projectIds = assignments.map((a) => a.project_id);
    const evaluations = projectIds.length
      ? await this.prisma.evaluation.findMany({
          where: {
            project_id: { in: projectIds },
            jury_user_id: {
              in: [...new Set(assignments.map((a) => a.jury_user_id))],
            },
          },
          select: {
            project_id: true,
            jury_user_id: true,
            score: true,
            status: true,
            version: true,
          },
        })
      : [];

    return assignments.map((a) => {
      // Dernière version par (projet, jury) : après une demande de
      // ré-évaluation, un brouillon v+1 signifie « pas encore soumis ».
      const latest = this.latestEvaluationFor(
        evaluations,
        a.project_id,
        a.jury_user_id,
      );
      return {
        ...a,
        submitted: latest?.status === 'SUBMITTED',
      };
    });
  }

  /** Évaluation de plus haute version pour un couple (projet, jury). */
  private latestEvaluationFor<
    T extends { project_id: string; jury_user_id?: string; version: number },
  >(evaluations: T[], projectId: string, juryUserId: string): T | undefined {
    return evaluations
      .filter(
        (e) => e.project_id === projectId && e.jury_user_id === juryUserId,
      )
      .sort((x, y) => y.version - x.version)[0];
  }

  async findOne(id: string, userId: string) {
    const assignment = await this.prisma.evaluationAssignment.findUnique({
      where: { id },
      include: {
        cohort: { select: { id: true, name: true } },
        project: { select: { id: true, name: true, owner_id: true } },
        juryUser: {
          select: {
            id: true,
            email: true,
            profile: { select: { first_name: true, last_name: true } },
          },
        },
      },
    });
    if (!assignment) throw new NotFoundException('Affectation introuvable');

    // Scénarios 15/20 : seuls le jury affecté, le porteur du projet et
    // l'incubateur de la cohorte consultent une affectation (et ses scores).
    // Un autre jury du même projet est refusé (403).
    const canView =
      assignment.jury_user_id === userId ||
      assignment.project.owner_id === userId;

    if (!canView) {
      const incubatorId = await this.access.getCohortIncubatorId(
        assignment.cohort_id,
      );
      const member = incubatorId
        ? await this.prisma.incubatorMember.findUnique({
            where: {
              user_id_incubator_id: {
                user_id: userId,
                incubator_id: incubatorId,
              },
            },
            select: { id: true },
          })
        : null;
      if (!member) {
        throw new ForbiddenException('Accès refusé à cette affectation');
      }
    }

    const evaluations = await this.prisma.evaluation.findMany({
      where: {
        project_id: assignment.project_id,
        jury_user_id: assignment.jury_user_id,
      },
      orderBy: { version: 'desc' },
    });

    return { ...assignment, evaluations };
  }

  async findMyTodo(userId: string) {
    // Le rôle est défini par cohorte (cohort_experts) : on ne retient que les
    // affectations des cohortes où l'utilisateur est jury ACTIF. Un assignment
    // orphelin (jury désactivé ou jamais jury de la cohorte) n'apparaît pas.
    const assignments = await this.prisma.evaluationAssignment.findMany({
      where: {
        jury_user_id: userId,
        cohort: {
          experts: {
            some: {
              expert_user_id: userId,
              role: CohortExpertRole.JURY,
              status: CohortExpertStatus.ACTIVE,
            },
          },
        },
      },
      include: {
        cohort: { select: { id: true, name: true } },
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            owner_id: true,
          },
        },
      },
      orderBy: { deadline: 'asc' },
    });

    const evaluations = await this.prisma.evaluation.findMany({
      where: { jury_user_id: userId },
      select: {
        id: true,
        project_id: true,
        status: true,
        template_id: true,
        version: true,
      },
    });

    return assignments
      .map((a) => {
        // La tâche porte sur la dernière version : un brouillon v+1 (demande
        // de ré-évaluation) doit réapparaître dans le todo même si une
        // version précédente a été soumise.
        const ev = evaluations
          .filter((e) => e.project_id === a.project_id)
          .sort((x, y) => y.version - x.version)[0];
        const todo = !ev || ev.status === 'DRAFT';
        return {
          ...a,
          todo,
          evaluation_id: ev?.id ?? null,
          evaluation_status: ev?.status ?? null,
          template_id: ev?.template_id ?? null,
          version: ev?.version ?? null,
        };
      })
      .sort((a, b) => Number(a.todo) - Number(b.todo));
  }
}
