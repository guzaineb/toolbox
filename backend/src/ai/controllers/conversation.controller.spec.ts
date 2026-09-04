import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException, HttpException } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ModuleAccessService } from '../../common/services/module-access.service';
import { ConversationController } from './conversation.controller';
import { ConversationService } from '../conversation/conversation.service';
import { MessageService } from '../conversation/message.service';

describe('ConversationController', () => {
  let controller: ConversationController;

  const accessMock = {
    assertCanAccessProject: jest.fn(),
  };

  const conversationServiceMock = {
    listByProject: jest.fn(),
  };

  const messageServiceMock = {
    getMessages: jest.fn(),
  };

  const req = (userId: string): { user: { id: string } } => ({
    user: { id: userId },
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    accessMock.assertCanAccessProject.mockResolvedValue(undefined);
    conversationServiceMock.listByProject.mockResolvedValue({
      conversations: [],
      total: 0,
    });
    messageServiceMock.getMessages.mockResolvedValue({
      messages: [],
      total: 0,
      page: 1,
      limit: 50,
      hasMore: false,
    });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConversationController],
      providers: [
        { provide: ConversationService, useValue: conversationServiceMock },
        { provide: MessageService, useValue: messageServiceMock },
        { provide: ModuleAccessService, useValue: accessMock },
      ],
    }).compile();

    controller = module.get<ConversationController>(ConversationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('is protected by JwtAuthGuard', () => {
    const guards = Reflect.getMetadata('__guards__', ConversationController) as
      | Array<{ name?: string } | (new (...args: any[]) => unknown)>
      | undefined;
    expect(guards).toBeDefined();
    expect(guards?.some((g) => (g as any) === JwtAuthGuard)).toBe(true);
  });

  describe('GET /ai/conversations', () => {
    it('returns conversations for authorized user + project', async () => {
      conversationServiceMock.listByProject.mockResolvedValue({
        conversations: [
          { id: 'conv-1', title: 'Test', messageCount: 3, lastMessageAt: new Date(), createdAt: new Date() },
        ],
        total: 1,
      });

      const result = await controller.listByProject(
        '11111111-1111-1111-1111-111111111111',
        undefined,
        undefined,
        req('user-1'),
      );

      expect(accessMock.assertCanAccessProject).toHaveBeenCalledWith(
        '11111111-1111-1111-1111-111111111111',
        'user-1',
      );
      expect(conversationServiceMock.listByProject).toHaveBeenCalledWith(
        '11111111-1111-1111-1111-111111111111',
        'user-1',
        1,
        20,
      );
      expect(result.success).toBe(true);
      expect(result.data.conversations).toHaveLength(1);
    });

    it('rejects missing projectId', async () => {
      await expect(
        controller.listByProject(undefined as any, undefined, undefined, req('user-1')),
      ).rejects.toThrow(HttpException);
    });

    it('rejects unauthorized user (BOLA protection)', async () => {
      accessMock.assertCanAccessProject.mockRejectedValue(
        new ForbiddenException('Accès refusé'),
      );

      await expect(
        controller.listByProject(
          '22222222-2222-2222-2222-222222222222',
          undefined,
          undefined,
          req('other-user'),
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(conversationServiceMock.listByProject).not.toHaveBeenCalled();
    });

    it('User A cannot see User B conversations (project isolation)', async () => {
      conversationServiceMock.listByProject.mockResolvedValue({
        conversations: [],
        total: 0,
      });

      await controller.listByProject(
        '11111111-1111-1111-1111-111111111111',
        undefined,
        undefined,
        req('user-A'),
      );

      expect(conversationServiceMock.listByProject).toHaveBeenCalledWith(
        '11111111-1111-1111-1111-111111111111',
        'user-A',
        expect.any(Number),
        expect.any(Number),
      );
    });

    it('passes pagination params through', async () => {
      await controller.listByProject(
        '11111111-1111-1111-1111-111111111111',
        '2',
        '10',
        req('user-1'),
      );

      expect(conversationServiceMock.listByProject).toHaveBeenCalledWith(
        '11111111-1111-1111-1111-111111111111',
        'user-1',
        2,
        10,
      );
    });
  });

  describe('GET /ai/conversations/:id/messages', () => {
    it('returns messages for authorized user + conversation', async () => {
      messageServiceMock.getMessages.mockResolvedValue({
        messages: [
          { id: 'msg-1', role: 'user', content: 'Hello', sources: null, contextUsed: false, createdAt: new Date() },
          { id: 'msg-2', role: 'assistant', content: 'Hi there', sources: null, contextUsed: true, createdAt: new Date() },
        ],
        total: 2,
        page: 1,
        limit: 50,
        hasMore: false,
      });

      const result = await controller.getMessages(
        'conv-1',
        '11111111-1111-1111-1111-111111111111',
        undefined,
        undefined,
        req('user-1'),
      );

      expect(accessMock.assertCanAccessProject).toHaveBeenCalledWith(
        '11111111-1111-1111-1111-111111111111',
        'user-1',
      );
      expect(messageServiceMock.getMessages).toHaveBeenCalledWith(
        'conv-1',
        '11111111-1111-1111-1111-111111111111',
        'user-1',
        1,
        50,
      );
      expect(result.success).toBe(true);
      expect(result.data.messages).toHaveLength(2);
    });

    it('rejects missing projectId', async () => {
      await expect(
        controller.getMessages('conv-1', undefined as any, undefined, undefined, req('user-1')),
      ).rejects.toThrow(HttpException);
    });

    it('rejects unauthorized user (BOLA protection)', async () => {
      accessMock.assertCanAccessProject.mockRejectedValue(
        new ForbiddenException('Accès refusé'),
      );

      await expect(
        controller.getMessages(
          'conv-1',
          '22222222-2222-2222-2222-222222222222',
          undefined,
          undefined,
          req('other-user'),
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(messageServiceMock.getMessages).not.toHaveBeenCalled();
    });

    it('conversation not found (cross-project) returns 404', async () => {
      messageServiceMock.getMessages.mockRejectedValue(
        new NotFoundException('Cette conversation n\'appartient pas à ce projet'),
      );

      await expect(
        controller.getMessages(
          'conv-other',
          '11111111-1111-1111-1111-111111111111',
          undefined,
          undefined,
          req('user-1'),
        ),
      ).rejects.toThrow(HttpException);
    });

    it('User A cannot read User B messages', async () => {
      messageServiceMock.getMessages.mockResolvedValue({
        messages: [],
        total: 0,
        page: 1,
        limit: 50,
        hasMore: false,
      });

      await controller.getMessages(
        'conv-1',
        '11111111-1111-1111-1111-111111111111',
        undefined,
        undefined,
        req('user-A'),
      );

      expect(messageServiceMock.getMessages).toHaveBeenCalledWith(
        'conv-1',
        '11111111-1111-1111-1111-111111111111',
        'user-A',
        expect.any(Number),
        expect.any(Number),
      );
    });
  });
});
