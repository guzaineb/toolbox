import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  CohortExpertRole,
  CohortExpertStatus,
  ParticipationStatus,
  ResourceType,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ModuleAccessService } from '../common/services/module-access.service';
import { AuditService } from '../audit/audit.service';
import { NotificationMessageBuilder } from '../events/notification-message-builder';
import { NotificationEvent } from '../events/notification-event.enum';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ModuleAccessService,
    private readonly audit: AuditService,
    private readonly messageBuilder: NotificationMessageBuilder,
  ) {}

  async assign(projectId: string, dto: CreateAssignmentDto, userId: string) {
    await this.access.assertProjectExists(projectId);
    const cohortId = await this.access.assertProjectAcceptedInCohort(projectId);
    await this.access.assertCanManageCohort(cohortId, userId);

    const expert = await this.prisma.user.findUnique({
      where: { id: dto.expertUserId },
      select: { id: true, role: true },
    });
    if (!expert) throw new NotFoundException('Expert introuvable');
    if (expert.role !== 'EXPERT') {
      throw new BadRequestException('L’utilisateur n’est pas un expert');
    }

    const existing = await this.prisma.projectExpertAssignment.findUnique({
      where: {
        project_id_expert_user_id_role: {
          project_id: projectId,
          expert_user_id: dto.expertUserId,
          role: dto.role,
        },
      },
    });
    if (existing) {
      throw new BadRequestException(
        'Cet expert est déjà affecté à ce projet avec ce rôle',
      );
    }

    const assignment = await this.prisma.projectExpertAssignment.create({
      data: {
        project_id: projectId,
        expert_user_id: dto.expertUserId,
        role: dto.role,
        status: CohortExpertStatus.ACTIVE,
        assigned_by: userId,
      },
      include: {
        project: { select: { id: true, name: true } },
        expertUser: {
          select: { id: true, email: true, profile: true },
        },
      },
    });

    await this.audit.log({
      actorId: userId,
      action: 'ASSIGNMENT_CREATE',
      entityType: 'ProjectExpertAssignment',
      entityId: assignment.id,
      metadata: {
        project_id: projectId,
        expert_user_id: dto.expertUserId,
        role: dto.role,
      },
    });

    if (dto.role === CohortExpertRole.COACH) {
      const { title, message } = this.messageBuilder.coachAssigned({
        projectName: assignment.project.name,
      });
      this.access.notify({
        event: NotificationEvent.COACH_ASSIGNED,
        recipients: [{ userId: dto.expertUserId }],
        title,
        message,
        link: `/expert/coaching/${projectId}`,
        senderId: userId,
        resourceType: ResourceType.COACHING,
        resourceId: projectId,
      });
    } else {
      const { title, message } = this.messageBuilder.evaluationAvailable({
        projectName: assignment.project.name,
      });
      this.access.notify({
        event: NotificationEvent.EVALUATION_AVAILABLE,
        recipients: [{ userId: dto.expertUserId }],
        title,
        message,
        link: `/expert/evaluations`,
        senderId: userId,
        resourceType: ResourceType.EVALUATION,
        resourceId: projectId,
      });
    }

    return assignment;
  }

  async findByProject(projectId: string, userId: string) {
    await this.access.assertProjectExists(projectId);
    await this.assertCanViewProjectAssignments(projectId, userId);

    return this.prisma.projectExpertAssignment.findMany({
      where: { project_id: projectId },
      include: {
        expertUser: {
          select: {
            id: true,
            email: true,
            profile: { select: { first_name: true, last_name: true } },
          },
        },
        assignedBy: {
          select: { id: true, email: true },
        },
      },
      orderBy: { assigned_at: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const assignment = await this.prisma.projectExpertAssignment.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true, owner_id: true } },
        expertUser: {
          select: {
            id: true,
            email: true,
            profile: { select: { first_name: true, last_name: true } },
          },
        },
      },
    });
    if (!assignment) throw new NotFoundException('Affectation introuvable');
    await this.assertCanViewProjectAssignments(assignment.project_id, userId);
    return assignment;
  }

  async update(id: string, dto: UpdateAssignmentDto, userId: string) {
    const assignment = await this.prisma.projectExpertAssignment.findUnique({
      where: { id },
      include: { project: { select: { id: true, name: true } } },
    });
    if (!assignment) throw new NotFoundException('Affectation introuvable');

    const cohortId = await this.access.assertProjectAcceptedInCohort(
      assignment.project_id,
    );
    await this.access.assertCanManageCohort(cohortId, userId);

    const updated = await this.prisma.projectExpertAssignment.update({
      where: { id },
      data: {
        role: dto.role,
        status: dto.status,
        removed_at:
          dto.status === CohortExpertStatus.INACTIVE ? new Date() : undefined,
      },
      include: {
        project: { select: { id: true, name: true } },
        expertUser: { select: { id: true, email: true } },
      },
    });

    await this.audit.log({
      actorId: userId,
      action: 'ASSIGNMENT_UPDATE',
      entityType: 'ProjectExpertAssignment',
      entityId: id,
      metadata: { ...dto },
    });

    if (
      dto.role === CohortExpertRole.COACH &&
      assignment.role !== CohortExpertRole.COACH
    ) {
      const { title, message } = this.messageBuilder.coachAssigned({
        projectName: updated.project.name,
      });
      this.access.notify({
        event: NotificationEvent.COACH_ASSIGNED,
        recipients: [{ userId: updated.expert_user_id }],
        title,
        message,
        link: `/expert/coaching/${updated.project_id}`,
        senderId: userId,
        resourceType: ResourceType.COACHING,
        resourceId: updated.project_id,
      });
    }

    if (dto.status === CohortExpertStatus.INACTIVE) {
      const { title, message } = this.messageBuilder.coachRemoved({
        projectName: updated.project.name,
      });
      this.access.notify({
        event: NotificationEvent.COACH_REMOVED,
        recipients: [{ userId: updated.expert_user_id }],
        title,
        message,
        link: `/expert`,
        senderId: userId,
        resourceType: ResourceType.COACHING,
        resourceId: updated.project_id,
      });
    }

    return updated;
  }

  async remove(id: string, userId: string) {
    const assignment = await this.prisma.projectExpertAssignment.findUnique({
      where: { id },
      include: { project: { select: { id: true, name: true } } },
    });
    if (!assignment) throw new NotFoundException('Affectation introuvable');

    const cohortId = await this.access.assertProjectAcceptedInCohort(
      assignment.project_id,
    );
    await this.access.assertCanManageCohort(cohortId, userId);

    const removed = await this.prisma.projectExpertAssignment.update({
      where: { id },
      data: { status: CohortExpertStatus.INACTIVE, removed_at: new Date() },
      include: { project: { select: { id: true, name: true } } },
    });

    await this.audit.log({
      actorId: userId,
      action: 'ASSIGNMENT_REMOVE',
      entityType: 'ProjectExpertAssignment',
      entityId: id,
    });

    const { title, message } = this.messageBuilder.coachRemoved({
      projectName: removed.project.name,
    });
    this.access.notify({
      event: NotificationEvent.COACH_REMOVED,
      recipients: [{ userId: assignment.expert_user_id }],
      title,
      message,
      link: `/expert`,
      senderId: userId,
      resourceType: ResourceType.COACHING,
      resourceId: removed.project_id,
    });

    return { success: true, id };
  }

  async findMyAssignments(userId: string) {
    const assignments = await this.prisma.projectExpertAssignment.findMany({
      where: { expert_user_id: userId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            owner_id: true,
          },
        },
      },
      orderBy: { assigned_at: 'desc' },
    });

    const projectIds = assignments.map((a) => a.project_id);
    const participations = await this.prisma.cohortParticipation.findMany({
      where: {
        project_id: { in: projectIds },
        status: ParticipationStatus.ACCEPTED,
      },
      include: {
        cohort: {
          select: {
            id: true,
            name: true,
            incubator: { select: { id: true, name: true } },
          },
        },
      },
    });

    const participationByProject = new Map(
      participations.map((p) => [p.project_id, p]),
    );

    return assignments.map((a) => {
      const participation = participationByProject.get(a.project_id);
      return {
        ...a,
        cohort: participation?.cohort ?? null,
      };
    });
  }

  private async assertCanViewProjectAssignments(
    projectId: string,
    userId: string,
  ): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { owner_id: true },
    });
    if (!project) throw new NotFoundException('Projet introuvable');

    if (project.owner_id === userId) return;

    const participation =
      await this.access.getAcceptedCohortForProject(projectId);
    if (participation) {
      const incubatorId = participation.cohort.incubator_id;
      if (incubatorId) {
        const member = await this.prisma.incubatorMember.findUnique({
          where: {
            user_id_incubator_id: {
              user_id: userId,
              incubator_id: incubatorId,
            },
          },
          select: { id: true },
        });
        if (member) return;
      }
    }

    const assignment = await this.prisma.projectExpertAssignment.findFirst({
      where: { project_id: projectId, expert_user_id: userId },
      select: { id: true },
    });
    if (assignment) return;

    throw new ForbiddenException('Accès refusé aux affectations de ce projet');
  }
}
