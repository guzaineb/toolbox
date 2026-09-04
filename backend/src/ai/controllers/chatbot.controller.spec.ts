import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ModuleAccessService } from '../../common/services/module-access.service';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from '../chatbot.service';

describe('ChatbotController (sécurité BOLA / IDOR)', () => {
  let controller: ChatbotController;
  const accessMock = {
    assertCanAccessProject: jest.fn(),
  };
  const chatbotMock = {
    ask: jest.fn(),
    indexProject: jest.fn(),
  };

  const req = (userId: string): { user: { id: string } } => ({
    user: { id: userId },
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatbotController],
      providers: [
        { provide: ChatbotService, useValue: chatbotMock },
        { provide: ModuleAccessService, useValue: accessMock },
      ],
    }).compile();

    controller = module.get<ChatbotController>(ChatbotController);
  });

  it('should be défini', () => {
    expect(controller).toBeDefined();
  });

  it('est protégé par JwtAuthGuard (utilisateur non authentifié rejeté au niveau garde)', () => {
    const guards = Reflect.getMetadata('__guards__', ChatbotController) as
      | Array<{ name?: string } | (new (...args: any[]) => unknown)>
      | undefined;
    expect(guards).toBeDefined();
    expect(guards?.some((g) => (g as any) === JwtAuthGuard)).toBe(true);
  });

  describe('POST /ai/chatbot/ask', () => {
    it('propriétaire autorisé : vérifie l’accès puis délègue au service', async () => {
      accessMock.assertCanAccessProject.mockResolvedValue(undefined);
      chatbotMock.ask.mockResolvedValue({
        answer: 'ok',
        sources: [],
        contextUsed: true,
      });

      const result = await controller.ask(
        {
          projectId: '11111111-1111-1111-1111-111111111111',
          question: 'question',
        },
        req('user-1'),
      );

      expect(accessMock.assertCanAccessProject).toHaveBeenCalledWith(
        '11111111-1111-1111-1111-111111111111',
        'user-1',
      );
      expect(chatbotMock.ask).toHaveBeenCalledWith(
        '11111111-1111-1111-1111-111111111111',
        'user-1',
        'question',
        undefined,
        undefined,
      );
      expect(result).toEqual({
        success: true,
        data: { answer: 'ok', sources: [], contextUsed: true },
      });
    });

    it('l’identité vient de req.user, jamais d’un userId envoyé par le client', async () => {
      accessMock.assertCanAccessProject.mockResolvedValue(undefined);
      chatbotMock.ask.mockResolvedValue({ answer: 'ok' });

      await controller.ask(
        // même si le corps contenait un champ userId, il n'est pas utilisé
        {
          projectId: '11111111-1111-1111-1111-111111111111',
          question: 'q',
          userId: 'evil-user',
        } as any,
        req('real-user'),
      );

      expect(accessMock.assertCanAccessProject).toHaveBeenCalledWith(
        '11111111-1111-1111-1111-111111111111',
        'real-user',
      );
      expect(accessMock.assertCanAccessProject).not.toHaveBeenCalledWith(
        expect.anything(),
        'evil-user',
      );
    });

    it('utilisateur non propriétaire / sans accès : rejeté 403, le service n’est pas appelé', async () => {
      accessMock.assertCanAccessProject.mockRejectedValue(
        new ForbiddenException('Accès refusé à ce projet'),
      );

      await expect(
        controller.ask(
          { projectId: '22222222-2222-2222-2222-222222222222', question: 'q' },
          req('other-user'),
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(chatbotMock.ask).not.toHaveBeenCalled();
    });

    it('projectId inexistant : rejeté 404 (NotFound du check d’accès)', async () => {
      accessMock.assertCanAccessProject.mockRejectedValue(
        new NotFoundException('Projet introuvable'),
      );

      await expect(
        controller.ask(
          { projectId: '33333333-3333-3333-3333-333333333333', question: 'q' },
          req('user-1'),
        ),
      ).rejects.toThrow(NotFoundException);
      expect(chatbotMock.ask).not.toHaveBeenCalled();
    });

    it('passe le module context quand fourni (GBM)', async () => {
      accessMock.assertCanAccessProject.mockResolvedValue(undefined);
      chatbotMock.ask.mockResolvedValue({ answer: 'ok' });

      await controller.ask(
        {
          projectId: '11111111-1111-1111-1111-111111111111',
          question: 'Explique cette étape',
          module: 'GBM',
          section: 'Idée initiale',
          step: 'gbm_1',
          context: 'ideaSketch: Solar farm',
        },
        req('user-1'),
      );

      expect(chatbotMock.ask).toHaveBeenCalledWith(
        '11111111-1111-1111-1111-111111111111',
        'user-1',
        'Explique cette étape',
        undefined,
        { module: 'GBM', section: 'Idée initiale', step: 'gbm_1', context: 'ideaSketch: Solar farm' },
      );
    });

    it('passe le module context pour BUSINESS_PLAN', async () => {
      accessMock.assertCanAccessProject.mockResolvedValue(undefined);
      chatbotMock.ask.mockResolvedValue({ answer: 'ok' });

      await controller.ask(
        {
          projectId: '11111111-1111-1111-1111-111111111111',
          question: 'Analyse ma réponse',
          module: 'BUSINESS_PLAN',
          section: '2.1 Gestion',
        },
        req('user-1'),
      );

      expect(chatbotMock.ask).toHaveBeenCalledWith(
        '11111111-1111-1111-1111-111111111111',
        'user-1',
        'Analyse ma réponse',
        undefined,
        { module: 'BUSINESS_PLAN', section: '2.1 Gestion', step: undefined, context: undefined },
      );
    });

    it('module context absent quand aucun champ module fourni', async () => {
      accessMock.assertCanAccessProject.mockResolvedValue(undefined);
      chatbotMock.ask.mockResolvedValue({ answer: 'ok' });

      await controller.ask(
        {
          projectId: '11111111-1111-1111-1111-111111111111',
          question: 'Question générale',
        },
        req('user-1'),
      );

      expect(chatbotMock.ask).toHaveBeenCalledWith(
        '11111111-1111-1111-1111-111111111111',
        'user-1',
        'Question générale',
        undefined,
        undefined,
      );
    });

    it('passe le module context pour MARKET', async () => {
      accessMock.assertCanAccessProject.mockResolvedValue(undefined);
      chatbotMock.ask.mockResolvedValue({ answer: 'ok' });

      await controller.ask(
        {
          projectId: '11111111-1111-1111-1111-111111111111',
          question: 'Quelles infos manquent ?',
          module: 'MARKET',
          section: 'Positionnement',
        },
        req('user-1'),
      );

      expect(chatbotMock.ask).toHaveBeenCalledWith(
        '11111111-1111-1111-1111-111111111111',
        'user-1',
        'Quelles infos manquent ?',
        undefined,
        { module: 'MARKET', section: 'Positionnement', step: undefined, context: undefined },
      );
    });

    it('passe le module context pour FUNDING', async () => {
      accessMock.assertCanAccessProject.mockResolvedValue(undefined);
      chatbotMock.ask.mockResolvedValue({ answer: 'ok' });

      await controller.ask(
        {
          projectId: '11111111-1111-1111-1111-111111111111',
          question: 'Prochaine étape ?',
          module: 'FUNDING',
          section: 'Questionnaire de maturité',
        },
        req('user-1'),
      );

      expect(chatbotMock.ask).toHaveBeenCalledWith(
        '11111111-1111-1111-1111-111111111111',
        'user-1',
        'Prochaine étape ?',
        undefined,
        { module: 'FUNDING', section: 'Questionnaire de maturité', step: undefined, context: undefined },
      );
    });

    it('passe le module context pour IMPACT', async () => {
      accessMock.assertCanAccessProject.mockResolvedValue(undefined);
      chatbotMock.ask.mockResolvedValue({ answer: 'ok' });

      await controller.ask(
        {
          projectId: '11111111-1111-1111-1111-111111111111',
          question: 'Améliore mon rapport',
          module: 'IMPACT',
          section: 'Rapport',
        },
        req('user-1'),
      );

      expect(chatbotMock.ask).toHaveBeenCalledWith(
        '11111111-1111-1111-1111-111111111111',
        'user-1',
        'Améliore mon rapport',
        undefined,
        { module: 'IMPACT', section: 'Rapport', step: undefined, context: undefined },
      );
    });

    it('passe le module context pour ECO_DESIGN', async () => {
      accessMock.assertCanAccessProject.mockResolvedValue(undefined);
      chatbotMock.ask.mockResolvedValue({ answer: 'ok' });

      await controller.ask(
        {
          projectId: '11111111-1111-1111-1111-111111111111',
          question: 'Incohérences ?',
          module: 'ECO_DESIGN',
          section: 'Configurer le cycle de vie',
        },
        req('user-1'),
      );

      expect(chatbotMock.ask).toHaveBeenCalledWith(
        '11111111-1111-1111-1111-111111111111',
        'user-1',
        'Incohérences ?',
        undefined,
        { module: 'ECO_DESIGN', section: 'Configurer le cycle de vie', step: undefined, context: undefined },
      );
    });
  });

  describe('POST /ai/chatbot/index', () => {
    it('tentative d’indexation d’un projet d’autrui : rejeté 403, index non appelé', async () => {
      accessMock.assertCanAccessProject.mockRejectedValue(
        new ForbiddenException('Accès refusé à ce projet'),
      );

      await expect(
        controller.indexProject(
          { projectId: '44444444-4444-4444-4444-444444444444' },
          req('other-user'),
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(chatbotMock.indexProject).not.toHaveBeenCalled();
    });

    it('propriétaire autorisé : peut indexer son projet', async () => {
      accessMock.assertCanAccessProject.mockResolvedValue(undefined);
      chatbotMock.indexProject.mockResolvedValue({ documentsIndexed: 5 });

      const result = await controller.indexProject(
        { projectId: '11111111-1111-1111-1111-111111111111' },
        req('user-1'),
      );

      expect(accessMock.assertCanAccessProject).toHaveBeenCalledWith(
        '11111111-1111-1111-1111-111111111111',
        'user-1',
      );
      expect(chatbotMock.indexProject).toHaveBeenCalledWith(
        '11111111-1111-1111-1111-111111111111',
      );
      expect(result).toEqual({ success: true, data: { documentsIndexed: 5 } });
    });
  });
});
