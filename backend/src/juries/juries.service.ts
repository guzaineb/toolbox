import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { JurySessionStatus, ResourceType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ModuleAccessService } from '../common/services/module-access.service';
import { AuditService } from '../audit/audit.service';
import { NotificationMessageBuilder } from '../events/notification-message-builder';
import { NotificationEvent } from '../events/notification-event.enum';
import { CreateJurySessionDto } from './dto/create-jury-session.dto';
import { UpdateJurySessionDto } from './dto/update-jury-session.dto';

const JURY_TRANSITIONS: Record<string, JurySessionStatus[]> = {
  DRAFT: [JurySessionStatus.OPEN],
  OPEN: [JurySessionStatus.DELIBERATION, JurySessionStatus.CLOSED],
  DELIBERATION: [JurySessionStatus.CLOSED],
  CLOSED: [],
};

@Injectable()
export class JuriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ModuleAccessService,
    private readonly audit: AuditService,
    private readonly messageBuilder: NotificationMessageBuilder,
  ) {}

  async create(projectId: string, dto: CreateJurySessionDto, userId: string) {
    await this.access.assertProjectExists(projectId);
    const cohortId = await this.access.assertProjectAcceptedInCohort(projectId);
    await this.access.assertCanManageCohort(cohortId, userId);

    await this.validateMembers(projectId, cohortId, dto.memberUserIds);

    const session = await this.prisma.jurySession.create({
      data: {
        project_id: projectId,
        cohort_id: cohortId,
        title: dto.title,
        status: JurySessionStatus.DRAFT,
        created_by: userId,
        members: {
          create: dto.memberUserIds.map((member_user_id) => ({ member_user_id })),
        },
      },
      include: {
        members: { include: { member: { select: { id: true, email: true, profile: true } } } },
        project: { select: { id: true, name: true, owner_id: true } },
      },
    });

    await this.audit.log({
      actorId: userId,
      action: 'JURY_SESSION_CREATE',
      entityType: 'JurySession',
      entityId: session.id,
      metadata: { project_id: projectId },
    });

    return session;
  }

  async findByProject(projectId: string, userId: string) {
    await this.access.assertProjectExists(projectId);
    await this.assertCanViewJury(projectId, userId);

    return this.prisma.jurySession.findMany({
      where: { project_id: projectId },
      include: {
        members: { include: { member: { select: { id: true, email: true, profile: true } } } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const session = await this.prisma.jurySession.findUnique({
      where: { id },
      include: {
        members: { include: { member: { select: { id: true, email: true, profile: true } } } },
        project: { select: { id: true, name: true, owner_id: true } },
      },
    });
    if (!session) throw new NotFoundException('Session du jury introuvable');
    await this.assertCanViewJury(session.project_id, userId);
    return session;
  }

  async update(id: string, dto: UpdateJurySessionDto, userId: string) {
    const session = await this.prisma.jurySession.findUnique({
      where: { id },
    });
    if (!session) throw new NotFoundException('Session du jury introuvable');
    await this.access.assertCanManageCohort(session.cohort_id, userId);

    if (dto.status && dto.status !== session.status) {
      const allowed = JURY_TRANSITIONS[session.status] ?? [];
      if (!allowed.includes(dto.status)) {
        throw new BadRequestException(
          `Transition invalide : ${session.status} → ${dto.status}`,
        );
      }
    }

    const status = dto.status ?? session.status;
    const data: Record<string, unknown> = {
      title: dto.title,
      observations: dto.observations,
      status,
      reevaluation_requested:
        dto.reevaluation_requested !== undefined
          ? dto.reevaluation_requested
          : session.reevaluation_requested,
      closed_at: status === JurySessionStatus.CLOSED ? new Date() : undefined,
    };

    if (dto.memberUserIds) {
      await this.validateMembers(session.project_id, session.cohort_id, dto.memberUserIds);
      data.members = {
        deleteMany: {},
        create: dto.memberUserIds.map((member_user_id) => ({ member_user_id })),
      };
    }

    const updated = await this.prisma.jurySession.update({
      where: { id },
      data,
      include: {
        members: { include: { member: { select: { id: true, email: true, profile: true } } } },
        project: { select: { id: true, name: true, owner_id: true } },
      },
    });

    await this.audit.log({
      actorId: userId,
      action: 'JURY_SESSION_UPDATE',
      entityType: 'JurySession',
      entityId: id,
      metadata: { ...dto },
    });

    return updated;
  }

  async close(id: string, userId: string) {
    return this.update(id, { status: JurySessionStatus.CLOSED }, userId);
  }

  private async validateMembers(projectId: string, cohortId: string, memberUserIds: string[]) {
    for (const memberUserId of memberUserIds) {
      const user = await this.prisma.user.findUnique({
        where: { id: memberUserId },
        select: { id: true, role: true },
      });
      if (!user) throw new NotFoundException('Membre du jury introuvable');

      const isJuryCohortExpert = await this.prisma.cohortExpert.findFirst({
        where: {
          cohort_id: cohortId,
          expert_user_id: memberUserId,
          role: 'JURY',
          status: 'ACTIVE',
        },
        select: { id: true },
      });
      const isJuryAssignment = await this.prisma.projectExpertAssignment.findFirst({
        where: {
          project_id: projectId,
          expert_user_id: memberUserId,
          role: 'JURY',
          status: 'ACTIVE',
        },
        select: { id: true },
      });

      if (!isJuryCohortExpert && !isJuryAssignment) {
        throw new BadRequestException(
          `L'utilisateur n'est pas jury actif pour cette cohorte/projet`,
        );
      }
    }
  }

  private async assertCanViewJury(projectId: string, userId: string) {
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

    throw new ForbiddenException('Accès refusé aux sessions du jury');
  }
}
