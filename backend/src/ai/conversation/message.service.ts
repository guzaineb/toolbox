import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ModuleAccessService } from '../../common/services/module-access.service';

export type MessageRecord = {
  id: string;
  role: string;
  content: string;
  sources: unknown;
  contextUsed: boolean;
  createdAt: Date;
};

export type PaginatedMessages = {
  messages: MessageRecord[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ModuleAccessService,
  ) {}

  async addMessage(
    conversationId: string,
    projectId: string,
    ownerId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    sources?: unknown,
    contextUsed = false,
  ): Promise<MessageRecord> {
    await this.verifyConversationAccess(conversationId, projectId, ownerId);

    const message = await this.prisma.message.create({
      data: {
        conversation_id: conversationId,
        role,
        content,
        sources: sources ?? undefined,
        context_used: contextUsed,
      },
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updated_at: new Date() },
    });

    return {
      id: message.id,
      role: message.role,
      content: message.content,
      sources: message.sources,
      contextUsed: message.context_used,
      createdAt: message.created_at,
    };
  }

  async getMessages(
    conversationId: string,
    projectId: string,
    ownerId: string,
    page = 1,
    limit = 50,
  ): Promise<PaginatedMessages> {
    await this.verifyConversationAccess(conversationId, projectId, ownerId);

    const where = { conversation_id: conversationId };
    const skip = (page - 1) * limit;

    const [rawMessages, total] = await Promise.all([
      this.prisma.message.findMany({
        where,
        orderBy: { created_at: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.message.count({ where }),
    ]);

    const messages: MessageRecord[] = rawMessages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      sources: m.sources,
      contextUsed: m.context_used,
      createdAt: m.created_at,
    }));

    return {
      messages,
      total,
      page,
      limit,
      hasMore: skip + messages.length < total,
    };
  }

  async getHistory(
    conversationId: string,
    projectId: string,
    ownerId: string,
    maxMessages = 6,
  ): Promise<{ role: 'user' | 'assistant'; content: string }[]> {
    await this.verifyConversationAccess(conversationId, projectId, ownerId);

    const messages = await this.prisma.message.findMany({
      where: { conversation_id: conversationId },
      orderBy: { created_at: 'desc' },
      take: maxMessages,
      select: { role: true, content: true },
    });

    return messages.reverse() as { role: 'user' | 'assistant'; content: string }[];
  }

  async getMessageCount(
    conversationId: string,
  ): Promise<number> {
    return this.prisma.message.count({
      where: { conversation_id: conversationId },
    });
  }

  async deleteMessage(
    messageId: string,
    conversationId: string,
    projectId: string,
    ownerId: string,
  ): Promise<void> {
    await this.verifyConversationAccess(conversationId, projectId, ownerId);

    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message || message.conversation_id !== conversationId) {
      throw new NotFoundException('Message introuvable');
    }

    await this.prisma.message.delete({ where: { id: messageId } });
  }

  async deleteAllMessages(
    conversationId: string,
    projectId: string,
    ownerId: string,
  ): Promise<number> {
    await this.verifyConversationAccess(conversationId, projectId, ownerId);

    const result = await this.prisma.message.deleteMany({
      where: { conversation_id: conversationId },
    });

    return result.count;
  }

  async getRecentConversationsWithSummary(
    projectId: string,
    userId: string,
    limit = 5,
  ): Promise<
    {
      id: string;
      title: string | null;
      summary: string | null;
      messageCount: number;
    }[]
  > {
    await this.access.assertCanAccessProject(projectId, userId);

    const conversations = await this.prisma.conversation.findMany({
      where: { project_id: projectId },
      orderBy: { created_at: 'desc' },
      take: limit,
      include: {
        _count: { select: { messages: true } },
      },
    });

    return conversations.map((c) => ({
      id: c.id,
      title: c.title,
      summary: c.summary,
      messageCount: c._count.messages,
    }));
  }

  private async verifyConversationAccess(
    conversationId: string,
    projectId: string,
    userId: string,
  ): Promise<void> {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { project_id: true },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation introuvable: ${conversationId}`);
    }
    if (conversation.project_id !== projectId) {
      throw new NotFoundException(
        'Cette conversation n\'appartient pas à ce projet',
      );
    }
    await this.access.assertCanAccessProject(projectId, userId);
  }
}
