import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ModuleAccessService } from '../../common/services/module-access.service';

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

  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ModuleAccessService,
  ) {}

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
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{ conversations: ConversationSummary[]; total: number }> {
    await this.verifyProjectAccess(projectId, userId);

    const where = { project_id: projectId };
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
    userId: string,
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
      throw new NotFoundException(
        'Cette conversation n\'appartient pas à ce projet',
      );
    }
    await this.verifyProjectAccess(projectId, userId);

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
    projectId?: string,
    userId?: string,
  ): Promise<void> {
    if (projectId && userId) {
      await this.verifyProjectAccess(projectId, userId);
    }

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
    userId: string,
  ): Promise<{ id: string; title: string | null; createdAt: Date }> {
    await this.verifyProjectAccess(projectId, userId);

    const existing = await this.prisma.conversation.findFirst({
      where: { project_id: projectId },
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

    return this.create(projectId, userId);
  }

  private async verifyProjectAccess(
    projectId: string,
    userId: string,
  ): Promise<void> {
    await this.access.assertCanAccessProject(projectId, userId);
  }
}
