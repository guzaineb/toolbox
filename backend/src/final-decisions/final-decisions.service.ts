import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  ConditionStatus,
  FinalDecisionType,
  ResourceType,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ModuleAccessService } from '../common/services/module-access.service';
import { AuditService } from '../audit/audit.service';
import { NotificationMessageBuilder } from '../events/notification-message-builder';
import { NotificationEvent } from '../events/notification-event.enum';
import { CreateDecisionDto } from './dto/create-decision.dto';
import { UpdateDecisionDto } from './dto/update-decision.dto';
import { AddConditionsDto } from './dto/conditions.dto';

const DECISION_LABELS: Record<FinalDecisionType, string> = {
  ACCEPTED: 'Accepté',
  REJECTED: 'Refusé',
  CONDITIONAL: 'Accepté avec conditions',
  EXTENDED: 'Accompagnement prolongé',
  REEVALUATION_REQUIRED: 'Réévaluation requise',
};

@Injectable()
export class FinalDecisionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ModuleAccessService,
    private readonly audit: AuditService,
    private readonly messageBuilder: NotificationMessageBuilder,
  ) {}

  async makeDecision(projectId: string, dto: CreateDecisionDto, userId: string) {
    await this.access.assertProjectExists(projectId);
    const cohortId = await this.access.assertProjectAcceptedInCohort(projectId);
    await this.access.assertCanManageCohort(cohortId, userId);

    if (dto.decision === FinalDecisionType.CONDITIONAL && (!dto.conditions || dto.conditions.length === 0)) {
      throw new BadRequestException(
        'Une décision avec conditions requiert au moins une condition',
      );
    }
    if (dto.decision === FinalDecisionType.EXTENDED && !dto.new_end_date) {
      throw new BadRequestException(
        'Une décision de prolongement requiert une nouvelle date de fin',
      );
    }

    const existing = await this.prisma.finalDecision.findFirst({
      where: { project_id: projectId, cohort_id: cohortId },
      orderBy: { decided_at: 'desc' },
      include: { conditions: true },
    });

    let decision;
    if (existing && existing.conditions.length === 0 && existing.decision === dto.decision) {
      decision = await this.prisma.finalDecision.update({
        where: { id: existing.id },
        data: {
          decision: dto.decision,
          final_score: dto.final_score,
          justification: dto.justification,
          new_end_date: dto.new_end_date ? new Date(dto.new_end_date) : undefined,
        },
        include: {
          conditions: true,
          project: { select: { id: true, name: true, owner_id: true } },
        },
      });
      await this.audit.log({
        actorId: userId,
        action: 'FINAL_DECISION_UPDATE',
        entityType: 'FinalDecision',
        entityId: decision.id,
        metadata: { decision: dto.decision },
      });
    } else {
      decision = await this.prisma.finalDecision.create({
        data: {
          project_id: projectId,
          cohort_id: cohortId,
          decision: dto.decision,
          final_score: dto.final_score,
          justification: dto.justification,
          new_end_date: dto.new_end_date ? new Date(dto.new_end_date) : undefined,
          decided_by: userId,
          conditions: dto.conditions?.length
            ? {
                create: dto.conditions.map((c) => ({
                  description: c.description,
                  deadline: c.deadline ? new Date(c.deadline) : undefined,
                  status: ConditionStatus.PENDING,
                })),
              }
            : undefined,
        },
        include: {
          conditions: true,
          project: { select: { id: true, name: true, owner_id: true } },
        },
      });
      await this.audit.log({
        actorId: userId,
        action: 'FINAL_DECISION_CREATE',
        entityType: 'FinalDecision',
        entityId: decision.id,
        metadata: { decision: dto.decision, cohort_id: cohortId },
      });
    }

    const { title, message } = this.messageBuilder.finalDecisionMade({
      projectName: decision.project.name,
      decision: DECISION_LABELS[decision.decision],
    });
    this.access.notify({
      event: NotificationEvent.FINAL_DECISION_MADE,
      recipients: [{ userId: decision.project.owner_id }],
      title,
      message,
      link: `/project-owner/projects/${projectId}/evaluations`,
      senderId: userId,
      resourceType: ResourceType.EVALUATION,
      resourceId: projectId,
    });

    if (dto.decision === FinalDecisionType.REEVALUATION_REQUIRED) {
      const { title: rTitle, message: rMessage } = this.messageBuilder.reevaluationRequested({
        projectName: decision.project.name,
      });
      this.access.notify({
        event: NotificationEvent.REEVALUATION_REQUESTED,
        recipients: [{ userId: decision.project.owner_id }],
        title: rTitle,
        message: rMessage,
        link: `/project-owner/projects/${projectId}/evaluations`,
        senderId: userId,
        resourceType: ResourceType.EVALUATION,
        resourceId: projectId,
      });
    }

    return decision;
  }

  async findByProject(projectId: string, userId: string) {
    await this.access.assertProjectExists(projectId);
    await this.assertCanViewDecisions(projectId, userId);

    const decisions = await this.prisma.finalDecision.findMany({
      where: { project_id: projectId },
      include: {
        conditions: true,
        decidedBy: {
          select: {
            id: true,
            email: true,
            profile: { select: { first_name: true, last_name: true } },
          },
        },
      },
      orderBy: { decided_at: 'desc' },
    });

    return {
      project_id: projectId,
      decisions,
      latest: decisions[0] ?? null,
    };
  }

  async findOne(id: string, userId: string) {
    const decision = await this.prisma.finalDecision.findUnique({
      where: { id },
      include: {
        conditions: true,
        decidedBy: {
          select: {
            id: true,
            email: true,
            profile: { select: { first_name: true, last_name: true } },
          },
        },
      },
    });
    if (!decision) throw new NotFoundException('Décision introuvable');
    await this.assertCanViewDecisions(decision.project_id, userId);
    return decision;
  }

  async update(id: string, dto: UpdateDecisionDto, userId: string) {
    const decision = await this.prisma.finalDecision.findUnique({
      where: { id },
    });
    if (!decision) throw new NotFoundException('Décision introuvable');
    await this.access.assertCanManageCohort(decision.cohort_id, userId);

    if (dto.decision === FinalDecisionType.EXTENDED && !dto.new_end_date) {
      throw new BadRequestException(
        'Une décision de prolongement requiert une nouvelle date de fin',
      );
    }

    const updated = await this.prisma.finalDecision.update({
      where: { id },
      data: {
        decision: dto.decision,
        final_score: dto.final_score,
        justification: dto.justification,
        new_end_date: dto.new_end_date ? new Date(dto.new_end_date) : undefined,
      },
      include: {
        conditions: true,
        project: { select: { id: true, name: true, owner_id: true } },
      },
    });

    await this.audit.log({
      actorId: userId,
      action: 'FINAL_DECISION_UPDATE',
      entityType: 'FinalDecision',
      entityId: id,
      metadata: { ...dto },
    });

    const { title, message } = this.messageBuilder.finalDecisionUpdated({
      projectName: updated.project.name,
      decision: DECISION_LABELS[updated.decision],
    });
    this.access.notify({
      event: NotificationEvent.FINAL_DECISION_UPDATED,
      recipients: [{ userId: updated.project.owner_id }],
      title,
      message,
      link: `/project-owner/projects/${updated.project.id}/evaluations`,
      senderId: userId,
      resourceType: ResourceType.EVALUATION,
      resourceId: updated.project.id,
    });

    return updated;
  }

  async addConditions(id: string, dto: AddConditionsDto, userId: string) {
    const decision = await this.prisma.finalDecision.findUnique({
      where: { id },
      include: { project: { select: { id: true, name: true, owner_id: true } } },
    });
    if (!decision) throw new NotFoundException('Décision introuvable');
    await this.access.assertCanManageCohort(decision.cohort_id, userId);

    const conditions = await this.prisma.$transaction(
      dto.conditions.map((c) =>
        this.prisma.finalDecisionCondition.create({
          data: {
            decision_id: id,
            description: c.description,
            deadline: c.deadline ? new Date(c.deadline) : undefined,
            status: ConditionStatus.PENDING,
          },
        }),
      ),
    );

    await this.audit.log({
      actorId: userId,
      action: 'FINAL_DECISION_CONDITIONS_ADD',
      entityType: 'FinalDecision',
      entityId: id,
      metadata: { count: conditions.length },
    });

    const { title, message } = this.messageBuilder.finalDecisionConditionsAdded({
      projectName: decision.project.name,
      count: conditions.length,
    });
    this.access.notify({
      event: NotificationEvent.FINAL_DECISION_CONDITIONS_ADDED,
      recipients: [{ userId: decision.project.owner_id }],
      title,
      message,
      link: `/project-owner/projects/${decision.project.id}/evaluations`,
      senderId: userId,
      resourceType: ResourceType.EVALUATION,
      resourceId: decision.project.id,
    });

    return conditions;
  }

  async updateCondition(id: string, dto: { description?: string; deadline?: string }, userId: string) {
    const condition = await this.prisma.finalDecisionCondition.findUnique({
      where: { id },
      include: { decision: true },
    });
    if (!condition) throw new NotFoundException('Condition introuvable');
    await this.access.assertCanManageCohort(condition.decision.cohort_id, userId);

    return this.prisma.finalDecisionCondition.update({
      where: { id },
      data: {
        description: dto.description,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
      },
    });
  }

  async validateCondition(id: string, userId: string) {
    const condition = await this.prisma.finalDecisionCondition.findUnique({
      where: { id },
      include: {
        decision: { include: { project: { select: { id: true, name: true, owner_id: true } } } },
      },
    });
    if (!condition) throw new NotFoundException('Condition introuvable');
    await this.access.assertCanManageCohort(condition.decision.cohort_id, userId);

    const validated = await this.prisma.finalDecisionCondition.update({
      where: { id },
      data: {
        status: ConditionStatus.COMPLETED,
        validated_by: userId,
        validated_at: new Date(),
      },
      include: { decision: true },
    });

    await this.audit.log({
      actorId: userId,
      action: 'CONDITION_VALIDATE',
      entityType: 'FinalDecisionCondition',
      entityId: id,
    });

    const { title, message } = this.messageBuilder.conditionValidated({
      conditionDescription: condition.description,
    });
    this.access.notify({
      event: NotificationEvent.CONDITION_VALIDATED,
      recipients: [{ userId: condition.decision.project.owner_id }],
      title,
      message,
      link: `/project-owner/projects/${condition.decision.project.id}/evaluations`,
      senderId: userId,
      resourceType: ResourceType.EVALUATION,
      resourceId: condition.decision.project.id,
    });

    return validated;
  }

  private async assertCanViewDecisions(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { owner_id: true },
    });
    if (project && project.owner_id === userId) return;

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
      if (member) return;
    }

    if (await this.access.canEvaluateProject(projectId, userId)) return;

    throw new ForbiddenException('Accès refusé aux décisions de ce projet');
  }
}
