import { Test, TestingModule } from '@nestjs/testing';
import { ChatbotService } from './chatbot.service';
import { PrismaService } from '../prisma/prisma.service';
import { LlmService } from './llm.service';
import { RagPipelineService } from './rag/rag-pipeline.service';
import { ProjectContextBuilderService } from './analysis/project-context.service';
import { ToolRegistry } from './tools/tool-registry';
import { ConversationService } from './conversation/conversation.service';
import { MessageService } from './conversation/message.service';

const PROJECT_ID = '11111111-1111-1111-1111-111111111111';
const USER_ID = 'user-1';
const CONV_ID = 'conv-123';

describe('ChatbotService (tool loop + memory)', () => {
  let service: ChatbotService;

  const llmMock = {
    chat: jest.fn(),
  };

  const ragMock = {
    query: jest.fn().mockResolvedValue({
      status: 'RAG_AVAILABLE',
      documents: [{ id: 'doc-1', content: 'RAG content', metadata: { document_key: 'gbm1', module: 'gbm', section: 'idea' } }],
      distances: [0.3],
      sources: [{ id: 'doc-1', documentKey: 'gbm1', module: 'gbm', section: 'idea', page: 1, chunkIndex: 0, score: 0.7 }],
    }),
  };

  const contextBuilderMock = {
    build: jest.fn().mockResolvedValue({ contextText: 'Coaching context' }),
  };

  const prismaMock = {
    project: {
      findUnique: jest.fn().mockResolvedValue({
        id: PROJECT_ID,
        context_summary: { summary_text: 'Context' },
        summary_activity: null,
        executive_summary: null,
        mission_vision: { mission: 'Mission' },
        value_proposition: null,
      }),
    },
  };

  const registryMock = {
    getToolsForPrompt: jest.fn().mockReturnValue([
      { type: 'function', function: { name: 'getGBM', description: 'Get GBM data', parameters: {} } },
    ]),
    execute: jest.fn(),
  };

  const conversationServiceMock = {
    getOrCreateActive: jest.fn().mockResolvedValue({ id: CONV_ID, title: null, createdAt: new Date() }),
  };

  const messageServiceMock = {
    getHistory: jest.fn().mockResolvedValue([]),
    addMessage: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    jest.restoreAllMocks();
    llmMock.chat.mockReset();
    ragMock.query.mockReset();
    contextBuilderMock.build.mockReset();
    prismaMock.project.findUnique.mockReset();
    registryMock.getToolsForPrompt.mockReset();
    registryMock.execute.mockReset();
    conversationServiceMock.getOrCreateActive.mockReset();
    messageServiceMock.getHistory.mockReset();
    messageServiceMock.addMessage.mockReset();

    ragMock.query.mockResolvedValue({
      status: 'RAG_AVAILABLE',
      documents: [{ id: 'doc-1', content: 'RAG content', metadata: { document_key: 'gbm1', module: 'gbm', section: 'idea' } }],
      distances: [0.3],
      sources: [{ id: 'doc-1', documentKey: 'gbm1', module: 'gbm', section: 'idea', page: 1, chunkIndex: 0, score: 0.7 }],
    });

    contextBuilderMock.build.mockResolvedValue({ contextText: 'Coaching context' });

    prismaMock.project.findUnique.mockResolvedValue({
      id: PROJECT_ID,
      context_summary: { summary_text: 'Context' },
      summary_activity: null,
      executive_summary: null,
      mission_vision: { mission: 'Mission' },
      value_proposition: null,
    });

    registryMock.getToolsForPrompt.mockReturnValue([
      { type: 'function', function: { name: 'getGBM', description: 'Get GBM data', parameters: {} } },
    ]);

    conversationServiceMock.getOrCreateActive.mockResolvedValue({ id: CONV_ID, title: null, createdAt: new Date() });
    messageServiceMock.getHistory.mockResolvedValue([]);
    messageServiceMock.addMessage.mockResolvedValue({});

    llmMock.chat.mockResolvedValue({
      content: 'Here is my answer about your project',
      toolCalls: undefined,
      finishReason: 'stop',
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatbotService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: LlmService, useValue: llmMock },
        { provide: RagPipelineService, useValue: ragMock },
        { provide: ProjectContextBuilderService, useValue: contextBuilderMock },
        { provide: ToolRegistry, useValue: registryMock },
        { provide: ConversationService, useValue: conversationServiceMock },
        { provide: MessageService, useValue: messageServiceMock },
      ],
    }).compile();

    service = module.get<ChatbotService>(ChatbotService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('ask - basic flow (no tool calls)', () => {
    it('creates conversation, persists messages, returns result with toolsUsed', async () => {
      const result = await service.ask(PROJECT_ID, USER_ID, 'What is my project?');

      expect(conversationServiceMock.getOrCreateActive).toHaveBeenCalledWith(PROJECT_ID, USER_ID);
      expect(messageServiceMock.getHistory).toHaveBeenCalledWith(CONV_ID, PROJECT_ID, USER_ID, 6);

      expect(messageServiceMock.addMessage).toHaveBeenCalledTimes(2);
      expect(messageServiceMock.addMessage).toHaveBeenNthCalledWith(
        1, CONV_ID, PROJECT_ID, USER_ID, 'user', 'What is my project?',
      );
      expect(messageServiceMock.addMessage).toHaveBeenNthCalledWith(
        2, CONV_ID, PROJECT_ID, USER_ID, 'assistant',
        'Here is my answer about your project',
        expect.any(Array),
        true,
      );

      expect(result.answer).toBe('Here is my answer about your project');
      expect(result.toolsUsed).toEqual([]);
      expect(result.conversationId).toBe(CONV_ID);
    });

    it('passes tools to LlmService when tools are registered', async () => {
      await service.ask(PROJECT_ID, USER_ID, 'question');

      expect(llmMock.chat).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({
          tools: expect.arrayContaining([
            expect.objectContaining({ type: 'function' }),
          ]),
          toolChoice: 'auto',
        }),
      );
    });
  });

  describe('ask - tool calling loop', () => {
    it('executes tool call, feeds result back, produces final answer', async () => {
      llmMock.chat
        .mockResolvedValueOnce({
          content: '',
          toolCalls: [
            { id: 'call-1', type: 'function', function: { name: 'getGBM', arguments: '{"projectId":"proj"}' } },
          ],
          finishReason: 'tool_calls',
        })
        .mockResolvedValueOnce({
          content: 'Based on the GBM data, your project has...',
          toolCalls: undefined,
          finishReason: 'stop',
        });

      registryMock.execute.mockResolvedValue(JSON.stringify({ ideaSketch: { idea_initial: 'Solar' } }));

      const result = await service.ask(PROJECT_ID, USER_ID, 'What are my GBM data?');

      expect(registryMock.execute).toHaveBeenCalledWith(
        'getGBM',
        '{"projectId":"proj"}',
        USER_ID,
      );

      expect(llmMock.chat).toHaveBeenCalledTimes(2);

      const secondCallMessages = llmMock.chat.mock.calls[1][0];
      expect(secondCallMessages).toContainEqual(
        expect.objectContaining({ role: 'tool', content: expect.stringContaining('ideaSketch') }),
      );

      expect(result.answer).toBe('Based on the GBM data, your project has...');
      expect(result.toolsUsed).toEqual(['getGBM']);
    });

    it('limits iterations to MAX_TOOL_ITERATIONS (4)', async () => {
      llmMock.chat.mockResolvedValue({
        content: '',
        toolCalls: [
          { id: 'call-1', type: 'function', function: { name: 'getGBM', arguments: '{}' } },
        ],
        finishReason: 'tool_calls',
      });

      registryMock.execute.mockResolvedValue(JSON.stringify({ ok: true }));

      const result = await service.ask(PROJECT_ID, USER_ID, 'question');

      expect(llmMock.chat).toHaveBeenCalledTimes(4);
      expect(result.answer).toContain("pas pu générer de réponse finale");
    });

    it('returns fallback answer when max iterations exhausted', async () => {
      llmMock.chat.mockResolvedValue({
        content: '',
        toolCalls: [
          { id: 'call-1', type: 'function', function: { name: 'getGBM', arguments: '{}' } },
        ],
        finishReason: 'tool_calls',
      });

      registryMock.execute.mockResolvedValue(JSON.stringify({ ok: true }));

      const result = await service.ask(PROJECT_ID, USER_ID, 'q');
      expect(result.answer).toContain("pas pu générer de réponse finale");
    });
  });

  describe('ask - memory fallback', () => {
    it('uses conversationHistory when DB history is empty', async () => {
      messageServiceMock.getHistory.mockResolvedValue([]);

      await service.ask(PROJECT_ID, USER_ID, 'question', [
        { role: 'user', content: 'old question' },
        { role: 'assistant', content: 'old answer' },
      ]);

      const messages = llmMock.chat.mock.calls[0][0];
      const contentList = messages.map((m: any) => `${m.role}:${m.content}`);
      expect(contentList).toContain('user:old question');
      expect(contentList).toContain('assistant:old answer');
      expect(contentList).toContain('user:question');
      expect(contentList).toHaveLength(4);
    });

    it('uses DB history over conversationHistory when DB history exists', async () => {
      messageServiceMock.getHistory.mockResolvedValue([
        { role: 'user', content: 'db question' },
        { role: 'assistant', content: 'db answer' },
      ]);

      await service.ask(PROJECT_ID, USER_ID, 'new question', [
        { role: 'user', content: 'client history' },
      ]);

      const messages = llmMock.chat.mock.calls[0][0];
      const contentList = messages.map((m: any) => `${m.role}:${m.content}`);
      expect(contentList).toContain('user:db question');
      expect(contentList).toContain('assistant:db answer');
      expect(contentList).toContain('user:new question');
      expect(contentList).not.toContain('user:client history');
    });
  });

  describe('ask - error handling', () => {
    it('handles RAG failure gracefully', async () => {
      ragMock.query.mockRejectedValue(new Error('ChromaDB down'));

      const result = await service.ask(PROJECT_ID, USER_ID, 'question');
      expect(result.ragStatus).toBe('RAG_UNAVAILABLE');
      expect(result.answer).toBeDefined();
    });

    it('includes ragReason when RAG is unavailable', async () => {
      ragMock.query.mockResolvedValue({
        status: 'RAG_UNAVAILABLE',
        documents: [],
        distances: [],
        sources: [],
        reason: 'ChromaDB indisponible : injoignable',
      });

      const result = await service.ask(PROJECT_ID, USER_ID, 'question');
      expect(result.ragStatus).toBe('RAG_UNAVAILABLE');
      expect(result.ragReason).toBe('ChromaDB indisponible : injoignable');
    });

    it('returns ragReason undefined when RAG is available', async () => {
      ragMock.query.mockResolvedValue({
        status: 'RAG_AVAILABLE',
        documents: [{ id: 'd1', content: 'text', metadata: {} }],
        distances: [0.2],
        sources: [{ id: 'd1', documentKey: 'k', module: 'm', section: 's', source: 'src', chunkIndex: 0, score: 0.8 }],
      });

      const result = await service.ask(PROJECT_ID, USER_ID, 'question');
      expect(result.ragStatus).toBe('RAG_AVAILABLE');
      expect(result.ragReason).toBeUndefined();
    });

    it('returns ragReason undefined when no relevant context', async () => {
      ragMock.query.mockResolvedValue({
        status: 'NO_RELEVANT_CONTEXT',
        documents: [],
        distances: [],
        sources: [],
      });

      const result = await service.ask(PROJECT_ID, USER_ID, 'question');
      expect(result.ragStatus).toBe('NO_RELEVANT_CONTEXT');
      expect(result.ragReason).toBeUndefined();
    });

    it('handles conversation service failure', async () => {
      conversationServiceMock.getOrCreateActive.mockRejectedValue(new Error('DB error'));

      await expect(
        service.ask(PROJECT_ID, USER_ID, 'question'),
      ).rejects.toThrow('DB error');
    });
  });

  describe('ask - project identity in system prompt', () => {
    it('includes project name and UUID in system message', async () => {
      prismaMock.project.findUnique.mockResolvedValue({
        id: PROJECT_ID,
        name: 'Solar Farm Alpha',
        context_summary: null,
        summary_activity: null,
        executive_summary: null,
        mission_vision: null,
        value_proposition: null,
      });

      await service.ask(PROJECT_ID, USER_ID, 'question');

      const systemMsg = llmMock.chat.mock.calls[0][0][0];
      expect(systemMsg.content).toContain('Nom du projet : Solar Farm Alpha');
      expect(systemMsg.content).toContain(`ID du projet : ${PROJECT_ID}`);
    });

    it('includes anti-UUID instruction', async () => {
      await service.ask(PROJECT_ID, USER_ID, 'question');

      const systemMsg = llmMock.chat.mock.calls[0][0][0];
      expect(systemMsg.content).toContain('NE DEMANDE JAMAIS');
      expect(systemMsg.content).toContain('UUID');
    });

    it('falls back to coachingContext.projectName when Prisma returns null', async () => {
      prismaMock.project.findUnique.mockResolvedValue(null);
      contextBuilderMock.build.mockResolvedValue({
        contextText: 'context',
        projectName: 'Coaching Project',
      });

      await service.ask(PROJECT_ID, USER_ID, 'question');

      const systemMsg = llmMock.chat.mock.calls[0][0][0];
      expect(systemMsg.content).toContain('Nom du projet : Coaching Project');
    });

    it('falls back to "Projet" when both sources are null', async () => {
      prismaMock.project.findUnique.mockResolvedValue(null);
      contextBuilderMock.build.mockResolvedValue({
        contextText: 'context',
        projectName: undefined,
      });

      await service.ask(PROJECT_ID, USER_ID, 'question');

      const systemMsg = llmMock.chat.mock.calls[0][0][0];
      expect(systemMsg.content).toContain('Nom du projet : Projet');
    });
  });

  describe('ask - projectId validation', () => {
    it('rejects empty projectId', async () => {
      await expect(
        service.ask('', USER_ID, 'question'),
      ).rejects.toThrow('projectId is required');
    });

    it('rejects whitespace-only projectId', async () => {
      await expect(
        service.ask('   ', USER_ID, 'question'),
      ).rejects.toThrow('projectId is required');
    });
  });

  describe('ask - userId never in args', () => {
    it('userId comes from server, not from request body', async () => {
      await service.ask(PROJECT_ID, 'server-user', 'question');

      expect(conversationServiceMock.getOrCreateActive).toHaveBeenCalledWith(PROJECT_ID, 'server-user');
      expect(messageServiceMock.addMessage).toHaveBeenCalledWith(
        CONV_ID, PROJECT_ID, 'server-user', expect.anything(), expect.anything(),
      );
    });
  });

  describe('ask - module context in system prompt', () => {
    it('includes module context when provided (GBM)', async () => {
      await service.ask(PROJECT_ID, USER_ID, 'question', undefined, {
        module: 'GBM',
        section: 'Idée initiale',
        step: 'gbm_1',
        context: 'ideaSketch: Solar farm',
      });

      const systemMsg = llmMock.chat.mock.calls[0][0][0];
      expect(systemMsg.content).toContain('CONTEXTE MODULE');
      expect(systemMsg.content).toContain('Module actuel : GBM');
      expect(systemMsg.content).toContain('Section : Idée initiale');
      expect(systemMsg.content).toContain('Étape : gbm_1');
      expect(systemMsg.content).toContain('ideaSketch: Solar farm');
      expect(systemMsg.content).toContain('Concentre ta réponse sur cette section');
    });

    it('includes module context for BUSINESS_PLAN', async () => {
      await service.ask(PROJECT_ID, USER_ID, 'question', undefined, {
        module: 'BUSINESS_PLAN',
        section: '2.1 Gestion',
      });

      const systemMsg = llmMock.chat.mock.calls[0][0][0];
      expect(systemMsg.content).toContain('Module actuel : BUSINESS_PLAN');
      expect(systemMsg.content).toContain('Section : 2.1 Gestion');
    });

    it('includes module context for MARKET', async () => {
      await service.ask(PROJECT_ID, USER_ID, 'question', undefined, {
        module: 'MARKET',
        section: 'Positionnement',
      });

      const systemMsg = llmMock.chat.mock.calls[0][0][0];
      expect(systemMsg.content).toContain('Module actuel : MARKET');
      expect(systemMsg.content).toContain('Section : Positionnement');
    });

    it('includes module context for FUNDING', async () => {
      await service.ask(PROJECT_ID, USER_ID, 'question', undefined, {
        module: 'FUNDING',
        section: 'Questionnaire de maturité',
      });

      const systemMsg = llmMock.chat.mock.calls[0][0][0];
      expect(systemMsg.content).toContain('Module actuel : FUNDING');
    });

    it('includes module context for IMPACT', async () => {
      await service.ask(PROJECT_ID, USER_ID, 'question', undefined, {
        module: 'IMPACT',
        section: 'Rapport',
      });

      const systemMsg = llmMock.chat.mock.calls[0][0][0];
      expect(systemMsg.content).toContain('Module actuel : IMPACT');
      expect(systemMsg.content).toContain('Section : Rapport');
    });

    it('includes module context for ECO_DESIGN', async () => {
      await service.ask(PROJECT_ID, USER_ID, 'question', undefined, {
        module: 'ECO_DESIGN',
        section: 'Configurer le cycle de vie',
      });

      const systemMsg = llmMock.chat.mock.calls[0][0][0];
      expect(systemMsg.content).toContain('Module actuel : ECO_DESIGN');
      expect(systemMsg.content).toContain('Section : Configurer le cycle de vie');
    });

    it('omits CONTEXTE MODULE block when no module context provided', async () => {
      await service.ask(PROJECT_ID, USER_ID, 'question');

      const systemMsg = llmMock.chat.mock.calls[0][0][0];
      expect(systemMsg.content).not.toContain('CONTEXTE MODULE');
      expect(systemMsg.content).not.toContain('Module actuel');
    });

    it('includes suggested actions list in module context', async () => {
      await service.ask(PROJECT_ID, USER_ID, 'question', undefined, {
        module: 'GBM',
        section: 'Idée initiale',
      });

      const systemMsg = llmMock.chat.mock.calls[0][0][0];
      expect(systemMsg.content).toContain('expliquer');
      expect(systemMsg.content).toContain('identifier les informations manquantes');
      expect(systemMsg.content).toContain('détecter les incohérences');
      expect(systemMsg.content).toContain('suggérer des améliorations');
      expect(systemMsg.content).toContain('analyser la réponse');
      expect(systemMsg.content).toContain('prochaine étape');
    });
  });
});
