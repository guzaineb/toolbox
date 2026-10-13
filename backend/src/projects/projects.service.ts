import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationEvent } from '../events/notification-event.enum';
import { NotificationPayload } from '../events/notification-payload.interface';
import { NotificationMessageBuilder } from '../events/notification-message-builder';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly messageBuilder: NotificationMessageBuilder,
  ) {}

  async create(userId: string, data: { name: string; description?: string }) {
    const project = await this.prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        owner_id: userId,
      },
    });

    const { title, message } = this.messageBuilder.projectCreated({
      projectName: project.name,
    });
    this.eventEmitter.emit(NotificationEvent.PROJECT_CREATED, {
      event: NotificationEvent.PROJECT_CREATED,
      recipients: [{ userId }],
      title,
      message,
      link: `/project-owner/projects/${project.id}`,
      senderId: userId,
      resourceType: 'PROJECT',
      resourceId: project.id,
    } as NotificationPayload);

    return project;
  }

  async findByOwner(userId: string) {
    return this.prisma.project.findMany({
      where: { owner_id: userId },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOwnedOrThrow(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Projet introuvable');
    if (project.owner_id !== userId)
      throw new ForbiddenException(
        "Vous n'êtes pas le propriétaire de ce projet",
      );
    return project;
  }

  async search(query: string) {
    if (!query || query.trim().length === 0) return [];

    return this.prisma.project.findMany({
      where: {
        name: { contains: query.trim(), mode: 'insensitive' },
      },
      select: { id: true, name: true, description: true, owner_id: true },
      take: 20,
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Annuaire des projets de la plateforme, destiné aux incubateurs : permet de
   * découvrir les projets, d'évaluer leur pertinence puis de les inviter dans
   * une cohorte. Renvoie une vue riche (description, mission/vision, maturité,
   * cohortes) — jamais les documents confidentiels du porteur.
   */
  async findDirectory(
    filters: { q?: string; page?: number; limit?: number } = {},
  ) {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit =
      filters.limit && filters.limit > 0 ? Math.min(50, filters.limit) : 12;

    const where: Prisma.ProjectWhereInput = {};
    const q = filters.q?.trim();
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        {
          context_summary: {
            is: { summary_text: { contains: q, mode: 'insensitive' } },
          },
        },
      ];
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          owner_id: true,
          created_at: true,
          is_gbm_reviewed: true,
          business_plan_status: true,
          context_summary: { select: { summary_text: true } },
          mission_vision: { select: { mission: true, vision: true } },
          funding_assessment: {
            select: { phase_maturite: true, score_maturite: true },
          },
          cohort_participations: {
            select: {
              id: true,
              status: true,
              origin: true,
              cohort: { select: { id: true, name: true, status: true } },
            },
            orderBy: { created_at: 'desc' },
          },
        },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.project.count({ where }),
    ]);

    const ownerNames = await this.ownerNames([
      ...new Set(items.map((project) => project.owner_id)),
    ]);

    return {
      items: items.map((project) => ({
        ...project,
        ownerName: ownerNames.get(project.owner_id) ?? 'Porteur de projet',
      })),
      total,
      page,
      limit,
    };
  }

  private async ownerNames(ownerIds: string[]): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    if (ownerIds.length === 0) return map;

    const users = await this.prisma.user.findMany({
      where: { id: { in: ownerIds } },
      select: {
        id: true,
        profile: { select: { first_name: true, last_name: true } },
      },
    });

    for (const user of users) {
      const name = [user.profile?.first_name, user.profile?.last_name]
        .filter(Boolean)
        .join(' ');
      map.set(user.id, name || 'Porteur de projet');
    }

    return map;
  }
}
