import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type ConversationSummary = {
  id: string;
  title: string | null;
  messageCount: number;
  lastMessageAt: Date | null;
  createdAt: Date;
};

@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    projectId: string,
    ownerId: string,
    title?: string,
  ): Promise<{ id: string; title: string | null; createdAt: Date }> {
    await this.verifyProjectAccess(projectId, ownerId);

    const conversation = await this.prisma.conversation.create({
      data: {
        project_id: projectId,
        owner_id: ownerId,
        title: title ?? null,
      },
    });

    this.logger.log(
      `Conversation ${conversation.id} created for project ${projectId}`,
    );
    return {
      id: conversation.id,
      title: conversation.title,
      createdAt: conversation.created_at,
    };
  }

  async listByProject(
    projectId: string,
    ownerId: string,
    page = 1,
    limit = 20,
  ): Promise<{ conversations: ConversationSummary[]; total: number }> {
    await this.verifyProjectAccess(projectId, ownerId);

    const where = { project_id: projectId, owner_id: ownerId };
    const skip = (page - 1) * limit;

    const [conversations, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
        include: {
          messages: {
            select: { id: true, created_at: true },
            orderBy: { created_at: 'desc' },
            take: 1,
          },
          _count: { select: { messages: true } },
        },
      }),
      this.prisma.conversation.count({ where }),
    ]);

    return {
      conversations: conversations.map((c) => ({
        id: c.id,
        title: c.title,
        messageCount: c._count.messages,
        lastMessageAt: c.messages[0]?.created_at ?? null,
        createdAt: c.created_at,
      })),
      total,
    };
  }

  async getById(
    conversationId: string,
    projectId: string,
    ownerId: string,
  ): Promise<{
    id: string;
    title: string | null;
    summary: string | null;
    createdAt: Date;
  }> {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation introuvable: ${conversationId}`);
    }
    if (conversation.project_id !== projectId) {
      throw new ForbiddenException(
        'Cette conversation n\'appartient pas à ce projet',
      );
    }
    if (conversation.owner_id !== ownerId) {
      throw new ForbiddenException(
        'Vous n\'êtes pas autorisé à accéder à cette conversation',
      );
    }

    return {
      id: conversation.id,
      title: conversation.title,
      summary: conversation.summary,
      createdAt: conversation.created_at,
    };
  }

  async updateTitle(
    conversationId: string,
    projectId: string,
    ownerId: string,
    title: string,
  ): Promise<void> {
    await this.getById(conversationId, projectId, ownerId);

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { title },
    });
  }

  async updateSummary(
    conversationId: string,
    summary: string,
  ): Promise<void> {
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { summary },
    });
  }

  async delete(
    conversationId: string,
    projectId: string,
    ownerId: string,
  ): Promise<void> {
    await this.getById(conversationId, projectId, ownerId);

    await this.prisma.conversation.delete({
      where: { id: conversationId },
    });

    this.logger.log(`Conversation ${conversationId} deleted`);
  }

  async getOrCreateActive(
    projectId: string,
    ownerId: string,
  ): Promise<{ id: string; title: string | null; createdAt: Date }> {
    await this.verifyProjectAccess(projectId, ownerId);

    const existing = await this.prisma.conversation.findFirst({
      where: { project_id: projectId, owner_id: ownerId },
      orderBy: { created_at: 'desc' },
      include: {
        _count: { select: { messages: true } },
      },
    });

    if (existing && existing._count.messages === 0) {
      return {
        id: existing.id,
        title: existing.title,
        createdAt: existing.created_at,
      };
    }

    return this.create(projectId, ownerId);
  }

  private async verifyProjectAccess(
    projectId: string,
    ownerId: string,
  ): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { owner_id: true },
    });

    if (!project) {
      throw new NotFoundException(`Projet introuvable: ${projectId}`);
    }
    if (project.owner_id !== ownerId) {
      throw new ForbiddenException(
        'Vous n\'êtes pas autorisé à accéder à ce projet',
      );
    }
  }
}
