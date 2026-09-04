import { Test, TestingModule } from '@nestjs/testing';
import { ChatbotService } from './chatbot.service';
import { PrismaService } from '../prisma/prisma.service';
import { LlmService } from './llm.service';
import { RagPipelineService } from './rag/rag-pipeline.service';
import { ProjectContextBuilderService } from './analysis/project-context.service';
import { ProjectStateService } from './project-state/project-state.service';
import { ToolRegistry } from './tools/tool-registry';
import { ConversationService } from './conversation/conversation.service';
import { MessageService } from './conversation/message.service';

const PROJECT_ID = '11111111-1111-1111-1111-111111111111';
const USER_ID = 'user-1';

const ragMock = {
  query: jest.fn(),
};

const contextBuilderMock = {
  build: jest.fn(),
};

const projectStateMock = {
  getProjectState: jest.fn(),
};

const registryMock = {
  getToolsForPrompt: jest.fn(),
  execute: jest.fn(),
};

const conversationServiceMock = {
  getOrCreateActive: jest.fn(),
};

const messageServiceMock = {
  getHistory: jest.fn(),
  addMessage: jest.fn(),
};

const prismaMock = {
  project: {
    findUnique: jest.fn(),
  },
};

describe('AI Project Coach - RAG Tests', () => {
  let service: ChatbotService;

  beforeEach(async () => {
    jest.restoreAllMocks();

    ragMock.query.mockReset();
    contextBuilderMock.build.mockReset();
    projectStateMock.getProjectState.mockReset();
    registryMock.getToolsForPrompt.mockReset();
    registryMock.execute.mockReset();
    conversationServiceMock.getOrCreateActive.mockReset();
    messageServiceMock.getHistory.mockReset();
    messageServiceMock.addMessage.mockReset();

    prismaMock.project.findUnique.mockResolvedValue({
      id: PROJECT_ID,
      name: 'Test Project',
      context_summary: { summary_text: 'Context' },
      summary_activity: null,
      executive_summary: null,
      mission_vision: { mission: 'Mission' },
      value_proposition: null,
    });

    conversationServiceMock.getOrCreateActive.mockResolvedValue({ id: 'conv-123', title: null, createdAt: new Date() });
    messageServiceMock.getHistory.mockResolvedValue([]);
    messageServiceMock.addMessage.mockResolvedValue({});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatbotService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: LlmService, useValue: { chat: jest.fn() } },
        { provide: RagPipelineService, useValue: ragMock },
        { provide: ProjectContextBuilderService, useValue: contextBuilderMock },
        { provide: ProjectStateService, useValue: projectStateMock },
        { provide: ToolRegistry, useValue: registryMock },
        { provide: ConversationService, useValue: conversationServiceMock },
        { provide: MessageService, useValue: messageServiceMock },
      ],
    }).compile();

    service = module.get<ChatbotService>(ChatbotService);
  });

  describe('RAG Available', () => {
    beforeEach(() => {
      ragMock.query.mockResolvedValue({
        status: 'RAG_AVAILABLE' as const,
        documents: [{ id: 'doc-1', content: 'Relevant content', metadata: { document_key: 'gbm1', module: 'gbm', section: 'idea' } }],
        distances: [0.3],
        sources: [{ id: 'doc-1', documentKey: 'gbm1', module: 'gbm', section: 'idea', page: 1, chunkIndex: 0, score: 0.8 }],
      });
    });

    it('should return RAG_AVAILABLE status', async () => {
      const result = await service.ask(PROJECT_ID, USER_ID, 'question');
      expect(result.ragStatus).toBe('RAG_AVAILABLE');
      expect(result.sources).toBeDefined();
      expect(result.sources.length).toBeGreaterThan(0);
      expect(result.contextUsed).toBe(true);
    });

    it('should include RAG sources in the answer', async () => {
      const result = await service.ask(PROJECT_ID, USER_ID, 'question');
      expect(result.answer).toContain('Relevant content');
      expect(result.sourcesUsed).toBeDefined();
    });
  });

  describe('RAG Unavailable', () => {
    beforeEach(() => {
      ragMock.query.mockResolvedValue({
        status: 'RAG_UNAVAILABLE' as const,
        documents: [],
        distances: [],
        sources: [],
        reason: 'ChromaDB indisponible : injoignable',
      });
    });

    it('should return RAG_UNAVAILABLE status', async () => {
      const result = await service.ask(PROJECT_ID, USER_ID, 'question');
      expect(result.ragStatus).toBe('RAG_UNAVAILABLE');
      expect(result.ragReason).toBe('ChromaDB indisponible : injoignable');
      expect(result.answer).toBeDefined();
    });

    it('should indicate RAG is unavailable in the answer', async () => {
      const result = await service.ask(PROJECT_ID, USER_ID, 'question');
      expect(result.answer).toContain('indisponible');
    });
  });

  describe('RAG No Relevant Context', () => {
    beforeEach(() => {
      ragMock.query.mockResolvedValue({
        status: 'NO_RELEVANT_CONTEXT' as const,
        documents: [],
        distances: [],
        sources: [],
      });
    });

    it('should return NO_RELEVANT_CONTEXT status', async () => {
      const result = await service.ask(PROJECT_ID, USER_ID, 'question');
      expect(result.ragStatus).toBe('NO_RELEVANT_CONTEXT');
      expect(result.ragReason).toBeUndefined();
      expect(result.answer).toBeDefined();
    });

    it('should indicate no relevant document in the answer', async () => {
      const result = await service.ask(PROJECT_ID, USER_ID, 'question');
      expect(result.answer).toContaucun document pertinent trouvé;
    });
  });

  describe('RAG with deterministic analysis', () => {
    beforeEach(() => {
      ragMock.query.mockResolvedValue({
        status: 'RAG_AVAILABLE' as const,
        documents: [{ id: 'doc-1', content: 'Test doc', metadata: { document_key: 'gbm1', module: 'gbm', section: 'idea' } }],
        distances: [0.3],
        sources: [{ id: 'doc-1', documentKey: 'gbm1', module: 'gbm', section: 'idea', page: 1, chunkIndex: 0, score: 0.9 }],
      });
    });

    it('should combine RAG with deterministic analysis', async () => {
      const result = await service.ask(PROJECT_ID, USER_ID, 'question');
      expect(result.ragStatus).toBe('RAG_AVAILABLE');
      expect(result.contextUsed).toBe(true);
      expect(result.toolsUsed).toBeDefined();
      expect(result.answer).toBeDefined();
    });

    it('should include both RAG sources and deterministic block in system prompt', async () => {
      await service.ask(PROJECT_ID, USER_ID, 'question');

      const systemMsg = llmMock.chat.mock.calls[0][0][0];
      expect(systemMsg.content).toContain('ANALYSE DÉTERMINISTE DU PROJET');
      expect(systemMsg.content).toContain('DOCUMENTS PERTINENTS');
      expect(systemMsg.content).toContain('--- DOCUMENTS PERTINENTS (de votre projet) ---');
    });
  });
});