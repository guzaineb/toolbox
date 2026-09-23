import { Test, TestingModule } from '@nestjs/testing';
import { ConversationService } from './conversation.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ModuleAccessService } from '../../common/services/module-access.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('ConversationService', () => {
  let service: ConversationService;

  const prismaMock = {
    project: { findUnique: jest.fn() },
    conversation: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    message: { count: jest.fn() },
  };

  const accessMock = {
    assertCanAccessProject: jest.fn(),
  };

  beforeEach(() => {
    prismaMock.project.findUnique.mockReset();
    prismaMock.conversation.create.mockReset();
    prismaMock.conversation.findMany.mockReset();
    prismaMock.conversation.findFirst.mockReset();
    prismaMock.conversation.findUnique.mockReset();
    prismaMock.conversation.count.mockReset();
    prismaMock.conversation.update.mockReset();
    prismaMock.conversation.delete.mockReset();
    prismaMock.message.count.mockReset();
    accessMock.assertCanAccessProject.mockReset();
  });

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ModuleAccessService, useValue: accessMock },
      ],
    }).compile();

    service = module.get<ConversationService>(ConversationService);
  });

  function mockProjectAccess(projectId: string, _ownerId: string) {
    accessMock.assertCanAccessProject.mockImplementation(
      async (pid: string, _uid: string) => {
        if (pid === projectId) return;
        throw new ForbiddenException('Accès refusé');
      },
    );
  }

  function mockProjectDenied() {
    accessMock.assertCanAccessProject.mockRejectedValue(
      new ForbiddenException('Accès refusé'),
    );
  }

  describe('Création', () => {
    it('crée une conversation liée au projet et au propriétaire', async () => {
      mockProjectAccess('proj-a', 'user-1');
      prismaMock.conversation.create.mockResolvedValue({
        id: 'conv-1',
        title: null,
        created_at: new Date(),
      });

      const result = await service.create('proj-a', 'user-1');
      expect(result.id).toBe('conv-1');
      expect(prismaMock.conversation.create).toHaveBeenCalledWith({
        data: {
          project_id: 'proj-a',
          owner_id: 'user-1',
          title: null,
        },
      });
    });

    it('accepte un titre personnalisé', async () => {
      mockProjectAccess('proj-a', 'user-1');
      prismaMock.conversation.create.mockResolvedValue({
        id: 'conv-2',
        title: 'Mon titre',
        created_at: new Date(),
      });

      await service.create('proj-a', 'user-1', 'Mon titre');
      expect(prismaMock.conversation.create).toHaveBeenCalledWith({
        data: {
          project_id: 'proj-a',
          owner_id: 'user-1',
          title: 'Mon titre',
        },
      });
    });
  });

  describe('Isolation inter-projets', () => {
    it('les conversations du projet A ne sont pas visibles depuis le projet B', async () => {
      mockProjectAccess('proj-a', 'user-1');
      prismaMock.conversation.findMany.mockResolvedValue([]);
      prismaMock.conversation.count.mockResolvedValue(0);

      const resultA = await service.listByProject('proj-a', 'user-1');
      expect(resultA.conversations).toHaveLength(0);

      mockProjectAccess('proj-b', 'user-1');
      prismaMock.conversation.findMany.mockResolvedValue([
        {
          id: 'conv-b1',
          title: 'Conv B',
          created_at: new Date(),
          messages: [],
          _count: { messages: 3 },
        },
      ]);
      prismaMock.conversation.count.mockResolvedValue(1);

      const resultB = await service.listByProject('proj-b', 'user-1');
      expect(resultB.conversations).toHaveLength(1);
      expect(resultB.conversations[0].id).toBe('conv-b1');

      expect(resultA.conversations).toHaveLength(0);
    });

    it('un utilisateur sans accès au projet ne peut pas lire une conversation', async () => {
      prismaMock.conversation.findUnique.mockResolvedValue({
        id: 'conv-1',
        project_id: 'proj-a',
      });
      mockProjectDenied();

      await expect(
        service.getById('conv-1', 'proj-a', 'user-2'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('une conversation du projet A ne peut pas être lue depuis le projet B', async () => {
      prismaMock.conversation.findUnique.mockResolvedValue({
        id: 'conv-1',
        project_id: 'proj-a',
      });

      await expect(
        service.getById('conv-1', 'proj-b', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('un utilisateur sans accès ne peut pas supprimer la conversation', async () => {
      prismaMock.conversation.findUnique.mockResolvedValue({
        id: 'conv-1',
        project_id: 'proj-a',
      });
      mockProjectDenied();

      await expect(
        service.delete('conv-1', 'proj-a', 'user-2'),
      ).rejects.toThrow(ForbiddenException);
    });

  describe('getOrCreateActive', () => {
    it('crée une conversation si la dernière a des messages', async () => {
      mockProjectAccess('proj-a', 'user-1');
      prismaMock.conversation.findFirst.mockResolvedValue({
        id: 'conv-existing',
        title: null,
        created_at: new Date(),
        _count: { messages: 5 },
      });
      prismaMock.conversation.create.mockResolvedValue({
        id: 'conv-new',
        title: null,
        created_at: new Date(),
      });

      const result = await service.getOrCreateActive('proj-a', 'user-1');
      expect(result.id).toBe('conv-new');
    });

    it('réutilise une conversation vide existante', async () => {
      prismaMock.project.findUnique.mockResolvedValue({
        id: 'proj-a',
        owner_id: 'user-1',
      });
      prismaMock.conversation.findFirst.mockResolvedValue({
        id: 'conv-empty',
        title: null,
        created_at: new Date(),
        _count: { messages: 0 },
      });

      const result = await service.getOrCreateActive('proj-a', 'user-1');
      expect(result.id).toBe('conv-empty');
      expect(prismaMock.conversation.create).not.toHaveBeenCalled();
    });

    it('crée une nouvelle conversation si aucune n\'existe', async () => {
      prismaMock.project.findUnique.mockResolvedValue({
        id: 'proj-a',
        owner_id: 'user-1',
      });
      prismaMock.conversation.findFirst.mockResolvedValue(null);
      prismaMock.conversation.create.mockResolvedValue({
        id: 'conv-new',
        title: null,
        created_at: new Date(),
      });

      const result = await service.getOrCreateActive('proj-a', 'user-1');
      expect(result.id).toBe('conv-new');
    });
  });
  });

  describe('Pagination', () => {
    it('retourne les conversations avec count et pagination', async () => {
      mockProjectAccess('proj-a', 'user-1');
      prismaMock.conversation.findMany.mockResolvedValue([
        {
          id: 'conv-1',
          title: 'Conv 1',
          created_at: new Date(),
          messages: [{ created_at: new Date() }],
          _count: { messages: 10 },
        },
      ]);
      prismaMock.conversation.count.mockResolvedValue(15);

      const result = await service.listByProject('proj-a', 'user-1', 1, 10);
      expect(result.total).toBe(15);
      expect(result.conversations).toHaveLength(1);
      expect(result.conversations[0].messageCount).toBe(10);
    });
  });

  describe('Persistance des conversations', () => {
    it('listByProject retourne les conversations les plus récentes en premier', async () => {
      mockProjectAccess('proj-a', 'user-1');
      const now = new Date();
      const yesterday = new Date(now.getTime() - 86400000);
      prismaMock.conversation.findMany.mockResolvedValue([
        {
          id: 'conv-today',
          title: 'Aujourd\'hui',
          created_at: now,
          messages: [{ created_at: now }],
          _count: { messages: 2 },
        },
        {
          id: 'conv-yesterday',
          title: 'Hier',
          created_at: yesterday,
          messages: [{ created_at: yesterday }],
          _count: { messages: 5 },
        },
      ]);
      prismaMock.conversation.count.mockResolvedValue(2);

      const result = await service.listByProject('proj-a', 'user-1');
      expect(result.conversations).toHaveLength(2);
      expect(result.conversations[0].id).toBe('conv-today');
      expect(result.conversations[0].messageCount).toBe(2);
      expect(result.conversations[1].id).toBe('conv-yesterday');
      expect(result.conversations[1].messageCount).toBe(5);
    });

    it('listByProject retourne lastMessageAt basé sur le dernier message', async () => {
      mockProjectAccess('proj-a', 'user-1');
      const lastMsgDate = new Date('2026-03-01T15:00:00Z');
      prismaMock.conversation.findMany.mockResolvedValue([
        {
          id: 'conv-1',
          title: 'Conv 1',
          created_at: new Date('2026-01-01'),
          messages: [{ created_at: lastMsgDate }],
          _count: { messages: 8 },
        },
      ]);
      prismaMock.conversation.count.mockResolvedValue(1);

      const result = await service.listByProject('proj-a', 'user-1');
      expect(result.conversations[0].lastMessageAt).toEqual(lastMsgDate);
    });

    it('listByProject retourne lastMessageAt null si pas de messages', async () => {
      mockProjectAccess('proj-a', 'user-1');
      prismaMock.conversation.findMany.mockResolvedValue([
        {
          id: 'conv-empty',
          title: 'Vide',
          created_at: new Date(),
          messages: [],
          _count: { messages: 0 },
        },
      ]);
      prismaMock.conversation.count.mockResolvedValue(1);

      const result = await service.listByProject('proj-a', 'user-1');
      expect(result.conversations[0].lastMessageAt).toBeNull();
      expect(result.conversations[0].messageCount).toBe(0);
    });

    it('deux utilisateurs ont des conversations séparées dans le même projet', async () => {
      mockProjectAccess('proj-a', 'user-1');
      prismaMock.conversation.findMany.mockResolvedValue([
        { id: 'conv-u1', title: null, created_at: new Date(), messages: [], _count: { messages: 2 } },
      ]);
      prismaMock.conversation.count.mockResolvedValue(1);

      const result1 = await service.listByProject('proj-a', 'user-1');
      expect(result1.conversations).toHaveLength(1);
      expect(result1.conversations[0].id).toBe('conv-u1');

      prismaMock.conversation.findMany.mockResolvedValue([
        { id: 'conv-u2', title: null, created_at: new Date(), messages: [], _count: { messages: 4 } },
      ]);
      prismaMock.conversation.count.mockResolvedValue(1);

      const result2 = await service.listByProject('proj-a', 'user-2');
      expect(result2.conversations).toHaveLength(1);
      expect(result2.conversations[0].id).toBe('conv-u2');
    });
  });

  describe('Suppression', () => {
    it('supprime une conversation existante', async () => {
      prismaMock.conversation.findUnique.mockResolvedValue({
        id: 'conv-1',
        project_id: 'proj-a',
        owner_id: 'user-1',
      });
      prismaMock.conversation.delete.mockResolvedValue({});

      await service.delete('conv-1', 'proj-a', 'user-1');
      expect(prismaMock.conversation.delete).toHaveBeenCalledWith({
        where: { id: 'conv-1' },
      });
    });
  });

  describe('Inexistant', () => {
    it('lance une erreur si le projet n\'existe pas', async () => {
      accessMock.assertCanAccessProject.mockRejectedValue(
        new NotFoundException('Projet introuvable'),
      );

      await expect(
        service.create('proj-unknown', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('lance une erreur si la conversation n\'existe pas', async () => {
      prismaMock.conversation.findUnique.mockResolvedValue(null);

      await expect(
        service.getById('conv-unknown', 'proj-a', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
