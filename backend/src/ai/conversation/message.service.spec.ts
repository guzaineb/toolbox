import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from './message.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ModuleAccessService } from '../../common/services/module-access.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('MessageService', () => {
  let service: MessageService;

  const prismaMock = {
    conversation: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    message: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  const accessMock = {
    assertCanAccessProject: jest.fn(),
  };

  beforeEach(() => {
    prismaMock.conversation.findUnique.mockReset();
    prismaMock.conversation.update.mockReset();
    prismaMock.message.create.mockReset();
    prismaMock.message.findMany.mockReset();
    prismaMock.message.findUnique.mockReset();
    prismaMock.message.count.mockReset();
    prismaMock.message.delete.mockReset();
    prismaMock.message.deleteMany.mockReset();
    accessMock.assertCanAccessProject.mockReset();
  });

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ModuleAccessService, useValue: accessMock },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
  });

  function mockConversationAccess(
    convId: string,
    projectId: string,
    _ownerId: string,
  ) {
    prismaMock.conversation.findUnique.mockImplementation(
      async (args: { where: { id: string } }) => {
        if (args.where.id === convId) {
          return { project_id: projectId };
        }
        return null;
      },
    );
    accessMock.assertCanAccessProject.mockImplementation(
      async (pid: string) => {
        if (pid === projectId) return;
        throw new ForbiddenException('Accès refusé');
      },
    );
  }

  describe('Ajout de message', () => {
    it('ajoute un message user à une conversation', async () => {
      mockConversationAccess('conv-1', 'proj-a', 'user-1');
      prismaMock.message.create.mockResolvedValue({
        id: 'msg-1',
        role: 'user',
        content: 'Bonjour',
        sources: null,
        context_used: false,
        created_at: new Date(),
      });
      prismaMock.conversation.update.mockResolvedValue({});

      const result = await service.addMessage(
        'conv-1',
        'proj-a',
        'user-1',
        'user',
        'Bonjour',
      );
      expect(result.role).toBe('user');
      expect(result.content).toBe('Bonjour');
    });

    it('ajoute un message assistant avec sources', async () => {
      mockConversationAccess('conv-1', 'proj-a', 'user-1');
      prismaMock.message.create.mockResolvedValue({
        id: 'msg-2',
        role: 'assistant',
        content: 'Voici la réponse',
        sources: [{ documentKey: 'gbm1' }],
        context_used: true,
        created_at: new Date(),
      });
      prismaMock.conversation.update.mockResolvedValue({});

      const result = await service.addMessage(
        'conv-1',
        'proj-a',
        'user-1',
        'assistant',
        'Voici la réponse',
        [{ documentKey: 'gbm1' }],
        true,
      );
      expect(result.sources).toEqual([{ documentKey: 'gbm1' }]);
      expect(result.contextUsed).toBe(true);
    });
  });

  describe('Isolation inter-projets', () => {
    it('un message du projet A ne peut pas être ajouté depuis le projet B', async () => {
      mockConversationAccess('conv-1', 'proj-a', 'user-1');

      await expect(
        service.addMessage('conv-1', 'proj-b', 'user-1', 'user', 'Test'),
      ).rejects.toThrow(NotFoundException);
    });

    it('les messages du projet A ne sont pas lisibles depuis le projet B', async () => {
      mockConversationAccess('conv-1', 'proj-a', 'user-1');

      await expect(
        service.getMessages('conv-1', 'proj-b', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('un utilisateur sans accès ne peut pas lire les messages', async () => {
      mockConversationAccess('conv-1', 'proj-a', 'user-1');
      accessMock.assertCanAccessProject.mockRejectedValue(
        new ForbiddenException('Accès refusé'),
      );

      await expect(
        service.getMessages('conv-1', 'proj-a', 'user-2'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('l\'historique est isolé par conversation', async () => {
      mockConversationAccess('conv-1', 'proj-a', 'user-1');
      prismaMock.message.findMany.mockResolvedValue([
        { role: 'assistant', content: 'Réponse A' },
        { role: 'user', content: 'Question A' },
      ]);

      const history = await service.getHistory('conv-1', 'proj-a', 'user-1');
      expect(history).toHaveLength(2);
      expect(history[0].content).toBe('Question A');
    });

    it('getHistory ignore maxMessages et retourne les derniers messages', async () => {
      mockConversationAccess('conv-1', 'proj-a', 'user-1');
      prismaMock.message.findMany.mockResolvedValue([
        { role: 'assistant', content: 'Réponse 3' },
      ]);

      const history = await service.getHistory(
        'conv-1',
        'proj-a',
        'user-1',
        2,
      );
      expect(prismaMock.message.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 2 }),
      );
    });
  });

  describe('Pagination', () => {
    it('retourne les messages avec pagination', async () => {
      mockConversationAccess('conv-1', 'proj-a', 'user-1');
      prismaMock.message.findMany.mockResolvedValue([
        {
          id: 'msg-1',
          role: 'user',
          content: 'Q1',
          sources: null,
          context_used: false,
          created_at: new Date(),
        },
      ]);
      prismaMock.message.count.mockResolvedValue(25);

      const result = await service.getMessages('conv-1', 'proj-a', 'user-1', 1, 10);
      expect(result.total).toBe(25);
      expect(result.hasMore).toBe(true);
      expect(result.messages).toHaveLength(1);
    });

    it('hasMore est false à la dernière page', async () => {
      mockConversationAccess('conv-1', 'proj-a', 'user-1');
      prismaMock.message.findMany.mockResolvedValue([
        { id: 'msg-11', role: 'user', content: 'Q11' },
        { id: 'msg-12', role: 'user', content: 'Q12' },
        { id: 'msg-13', role: 'user', content: 'Q13' },
        { id: 'msg-14', role: 'user', content: 'Q14' },
        { id: 'msg-15', role: 'user', content: 'Q15' },
      ]);
      prismaMock.message.count.mockResolvedValue(15);

      const result = await service.getMessages('conv-1', 'proj-a', 'user-1', 2, 10);
      expect(result.hasMore).toBe(false);
    });
  });

  describe('Suppression', () => {
    it('supprime un message spécifique', async () => {
      mockConversationAccess('conv-1', 'proj-a', 'user-1');
      prismaMock.message.findUnique.mockResolvedValue({
        id: 'msg-1',
        conversation_id: 'conv-1',
      });
      prismaMock.message.delete.mockResolvedValue({});

      await service.deleteMessage('msg-1', 'conv-1', 'proj-a', 'user-1');
      expect(prismaMock.message.delete).toHaveBeenCalledWith({
        where: { id: 'msg-1' },
      });
    });

    it('supprime tous les messages d\'une conversation', async () => {
      mockConversationAccess('conv-1', 'proj-a', 'user-1');
      prismaMock.message.deleteMany.mockResolvedValue({ count: 15 });

      const count = await service.deleteAllMessages(
        'conv-1',
        'proj-a',
        'user-1',
      );
      expect(count).toBe(15);
    });

    it('ne peut pas supprimer un message d\'une autre conversation', async () => {
      mockConversationAccess('conv-1', 'proj-a', 'user-1');
      prismaMock.message.findUnique.mockResolvedValue({
        id: 'msg-1',
        conversation_id: 'conv-other',
      });

      await expect(
        service.deleteMessage('msg-1', 'conv-1', 'proj-a', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('Résumés de conversations récentes', () => {
    it('retourne les conversations récentes avec résumé', async () => {
      prismaMock.conversation.findUnique
        .mockResolvedValueOnce({ project_id: 'proj-a', owner_id: 'user-1' })
        .mockResolvedValue({ project_id: 'proj-a', owner_id: 'user-1' });

      prismaMock.conversation.findMany = jest.fn().mockResolvedValue([
        {
          id: 'conv-1',
          title: 'Conv 1',
          summary: 'Résumé 1',
          _count: { messages: 10 },
        },
        {
          id: 'conv-2',
          title: 'Conv 2',
          summary: null,
          _count: { messages: 5 },
        },
      ]);

      const result = await service.getRecentConversationsWithSummary(
        'proj-a',
        'user-1',
        5,
      );
      expect(result).toHaveLength(2);
      expect(result[0].summary).toBe('Résumé 1');
      expect(result[1].summary).toBeNull();
    });
  });
});
