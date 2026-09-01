import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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

    const { title, message } = this.messageBuilder.projectCreated({ projectName: project.name });
    this.eventEmitter.emit(
      NotificationEvent.PROJECT_CREATED,
      {
        event: NotificationEvent.PROJECT_CREATED,
        recipients: [{ userId }],
        title,
        message,
        link: `/project-owner/projects/${project.id}`,
        senderId: userId,
        resourceType: 'PROJECT',
        resourceId: project.id,
      } as NotificationPayload,
    );

    return project;
  }

  async findByOwner(userId: string) {
    return this.prisma.project.findMany({
      where: { owner_id: userId },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOwnedOrThrow(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Projet introuvable');
    if (project.owner_id !== userId) throw new ForbiddenException('Vous n\'êtes pas le propriétaire de ce projet');
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
}
