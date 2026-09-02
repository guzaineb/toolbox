import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { EvaluationStage, ResourceType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ModuleAccessService } from '../common/services/module-access.service';
import { AuditService } from '../audit/audit.service';
import { NotificationMessageBuilder } from '../events/notification-message-builder';
import { NotificationEvent } from '../events/notification-event.enum';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

const WEIGHT_TOLERANCE = 0.5;

@Injectable()
export class EvaluationTemplatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ModuleAccessService,
    private readonly audit: AuditService,
    private readonly messageBuilder: NotificationMessageBuilder,
  ) {}

  async create(cohortId: string, dto: CreateTemplateDto, userId: string) {
    await this.access.assertCanManageCohort(cohortId, userId);

    if (dto.stage === undefined || dto.stage === null)
      dto.stage = EvaluationStage.FINAL;

    const cohort = await this.prisma.cohort.findUnique({
      where: { id: cohortId },
      select: { name: true },
    });
    if (!cohort) throw new NotFoundException('Cohorte introuvable');

    const template = await this.prisma.evaluationTemplate.create({
      data: {
        cohort_id: cohortId,
        name: dto.name,
        description: dto.description,
        stage: dto.stage,
        published: false,
        created_by: userId,
        criteria: {
          create: dto.criteria.map((c, i) => ({
            name: c.name,
            description: c.description,
            weight: c.weight,
            max_score: c.max_score ?? 5,
            sort_order: c.sort_order ?? i,
          })),
        },
      },
      include: { criteria: { orderBy: { sort_order: 'asc' } } },
    });

    await this.audit.log({
      actorId: userId,
      action: 'EVALUATION_TEMPLATE_CREATE',
      entityType: 'EvaluationTemplate',
      entityId: template.id,
      metadata: { cohort_id: cohortId },
    });

    const members = await this.getCohortMembers(cohortId);
    if (members.length > 0) {
      const { title, message } = this.messageBuilder.evaluationTemplateCreated({
        templateName: template.name,
        cohortName: cohort.name,
      });
      this.access.notify({
        event: NotificationEvent.EVALUATION_TEMPLATE_CREATED,
        recipients: members.map((id) => ({ userId: id })),
        title,
        message,
        link: `/incubator/cohorts/${cohortId}/evaluations`,
        senderId: userId,
        resourceType: ResourceType.EVALUATION,
        resourceId: template.id,
      });
    }

    return template;
  }

  async findByCohort(cohortId: string, userId: string) {
    const cohort = await this.prisma.cohort.findUnique({
      where: { id: cohortId },
      select: { id: true },
    });
    if (!cohort) throw new NotFoundException('Cohorte introuvable');
    const incubatorId = await this.access.getCohortIncubatorId(cohortId);
    if (incubatorId) {
      const member = await this.prisma.incubatorMember.findUnique({
        where: {
          user_id_incubator_id: { user_id: userId, incubator_id: incubatorId },
        },
        select: { id: true },
      });
      if (!member) {
        throw new ForbiddenException(
          "Vous n'êtes pas membre de l'incubateur de cette cohorte",
        );
      }
    }

    return this.prisma.evaluationTemplate.findMany({
      where: { cohort_id: cohortId },
      include: { criteria: { orderBy: { sort_order: 'asc' } } },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string, userId?: string) {
    const template = await this.prisma.evaluationTemplate.findUnique({
      where: { id },
      include: { criteria: { orderBy: { sort_order: 'asc' } } },
    });
    if (!template) throw new NotFoundException('Grille introuvable');

    if (userId) {
      if (template.published) return template;
      const cohort = await this.prisma.cohort.findUnique({
        where: { id: template.cohort_id },
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
        if (member) return template;
      }
      throw new ForbiddenException(
        "Vous n'avez pas accès à cette grille d'évaluation",
      );
    }

    return template;
  }

  async update(id: string, dto: UpdateTemplateDto, userId: string) {
    const template = await this.prisma.evaluationTemplate.findUnique({
      where: { id },
    });
    if (!template) throw new NotFoundException('Grille introuvable');
    if (template.published) {
      throw new BadRequestException(
        'Une grille publiée ne peut plus être modifiée',
      );
    }
    await this.access.assertCanManageCohort(template.cohort_id, userId);

    const update: Record<string, unknown> = {
      name: dto.name,
      description: dto.description,
      stage: dto.stage,
    };

    if (dto.criteria) {
      const total = dto.criteria.reduce((sum, c) => sum + c.weight, 0);
      if (Math.abs(total - 100) > WEIGHT_TOLERANCE) {
        throw new BadRequestException(
          `La somme des poids des critères doit être de 100 (actuellement ${total})`,
        );
      }
      update.criteria = {
        deleteMany: {},
        create: dto.criteria.map((c, i) => ({
          name: c.name,
          description: c.description,
          weight: c.weight,
          max_score: c.max_score ?? 5,
          sort_order: c.sort_order ?? i,
        })),
      };
    }

    const updated = await this.prisma.evaluationTemplate.update({
      where: { id },
      data: update,
      include: { criteria: { orderBy: { sort_order: 'asc' } } },
    });

    await this.audit.log({
      actorId: userId,
      action: 'EVALUATION_TEMPLATE_UPDATE',
      entityType: 'EvaluationTemplate',
      entityId: id,
      metadata: JSON.parse(JSON.stringify(dto)),
    });

    return updated;
  }

  async publish(id: string, userId: string) {
    const template = await this.prisma.evaluationTemplate.findUnique({
      where: { id },
      include: { criteria: true },
    });
    if (!template) throw new NotFoundException('Grille introuvable');

    await this.access.assertCanManageCohort(template.cohort_id, userId);

    if (template.criteria.length === 0) {
      throw new BadRequestException(
        'La grille doit contenir au moins un critère',
      );
    }
    const total = template.criteria.reduce((sum, c) => sum + c.weight, 0);
    if (Math.abs(total - 100) > WEIGHT_TOLERANCE) {
      throw new BadRequestException(
        `La somme des poids doit être de 100 avant publication (actuellement ${total})`,
      );
    }

    const published = await this.prisma.evaluationTemplate.update({
      where: { id },
      data: { published: true, locked_at: new Date() },
      include: { criteria: { orderBy: { sort_order: 'asc' } } },
    });

    await this.audit.log({
      actorId: userId,
      action: 'EVALUATION_TEMPLATE_PUBLISH',
      entityType: 'EvaluationTemplate',
      entityId: id,
    });

    return published;
  }

  private async getCohortMembers(cohortId: string): Promise<string[]> {
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
}
