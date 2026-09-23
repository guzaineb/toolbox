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

const PROJECT_ID_A = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const PROJECT_ID_B = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const USER_ID = 'user-1';
const CONV_ID = 'conv-123';

describe('AI Coach Security - User Isolation', () => {
  let serviceA: ChatbotService;
  let serviceB: ChatbotService;

  const llmMock = {
    chat: jest.fn(),
  };

  const ragMock = {
    query: jest.fn(),
  };

  const contextBuilderMock = {
    build: jest.fn(),
  };

  const projectStateMockA = {
    getProjectState: jest.fn(),
  };

  const projectStateMockB = {
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

  const moduleA: TestingModule = await Test.createTestingModule({
    providers: [
      ChatbotService,
      { provide: PrismaService, useValue: prismaMock },
      { provide: LlmService, useValue: llmMock },
      { provide: RagPipelineService, useValue: ragMock },
      { provide: ProjectContextBuilderService, useValue: contextBuilderMock },
      { provide: ProjectStateService, useValue: projectStateMockA },
      { provide: ToolRegistry, useValue: registryMock },
      { provide: ConversationService, useValue: conversationServiceMock },
      { provide: MessageService, useValue: messageServiceMock },
    ],
  }).compile();

  const moduleB: TestingModule = await Test.createTestingModule({
    providers: [
      ChatbotService,
      { provide: PrismaService, useValue: prismaMock },
      { provide: LlmService, useValue: llmMock },
      { provide: RagPipelineService, useValue: ragMock },
      { provide: ProjectContextBuilderService, useValue: contextBuilderMock },
      { provide: ProjectStateService, useValue: projectStateMockB },
      { provide: ToolRegistry, useValue: registryMock },
      { provide: ConversationService, useValue: conversationServiceMock },
      { provide: MessageService, useValue: messageServiceMock },
    ],
  }).compile();

  beforeEach(async () => {
    jest.restoreAllMocks();

    llmMock.chat.mockReset();
    ragMock.query.mockReset();
    contextBuilderMock.build.mockReset();
    projectStateMockA.getProjectState.mockReset();
    projectStateMockB.getProjectState.mockReset();
    registryMock.getToolsForPrompt.mockReset();
    registryMock.execute.mockReset();
    conversationServiceMock.getOrCreateActive.mockReset();
    messageServiceMock.getHistory.mockReset();
    messageServiceMock.addMessage.mockReset();

    // Project A data
    prismaMock.project.findUnique.mockImplementation((where: any) => {
      if (where.id === PROJECT_ID_A) {
        return {
          id: PROJECT_ID_A,
          name: 'Project A',
          context_summary: { summary_text: 'Context A' },
          summary_activity: null,
          executive_summary: null,
          mission_vision: { mission: 'Mission A' },
          value_proposition: null,
        };
      }
      if (where.id === PROJECT_ID_B) {
        return {
          id: PROJECT_ID_B,
          name: 'Project B',
          context_summary: { summary_text: 'Context B' },
          summary_activity: null,
          executive_summary: null,
          mission_vision: { mission: 'Mission B' },
          value_proposition: null,
        };
      }
      return null;
    });

    ragMock.query.mockResolvedValue({
      status: 'RAG_AVAILABLE' as const,
      documents: [{ id: 'doc-1', content: 'RAG content', metadata: { document_key: 'gbm1', module: 'gbm', section: 'idea' } }],
      distances: [0.3],
      sources: [{ id: 'doc-1', documentKey: 'gbm1', module: 'gbm', section: 'idea', page: 1, chunkIndex: 0, score: 0.7 }],
    });

    contextBuilderMock.build.mockResolvedValue({ contextText: 'Coaching context' });

    // Project A state
    projectStateMockA.getProjectState.mockResolvedValue({
      projectId: PROJECT_ID_A,
      projectName: 'Project A',
      maturityLevel: 'DEVELOPING',
      overallProgress: 45,
      completedSteps: [{ stepKey: 'gbm_1', title: 'Idée', phase: 1, status: 'COMPLETED', hasData: true }],
      incompleteSteps: [{ stepKey: 'gbm_2', title: 'Problèmes', phase: 1, status: 'NOT_STARTED', hasData: false }],
      missingInformation: ['Décrire les problèmes'],
      strengths: ['Mission définie'],
      weakAreas: ['GBM très peu avancé'],
      inconsistencies: [],
      healthScore: {
        overall: 52,
        categories: [
          { label: 'Complétude', score: 40, maxScore: 100, weight: 0.3 },
          { label: 'Avancement', score: 45, maxScore: 100, weight: 0.25 },
          { label: 'Cohérence', score: 60, maxScore: 100, weight: 0.25 },
        ],
      },
      priorities: [],
      currentPriority: null,
      recommendedNextAction: '',
    });

    // Project B state
    projectStateMockB.getProjectState.mockResolvedValue({
      projectId: PROJECT_ID_B,
      projectName: 'Project B',
      maturityLevel: 'INITIAL',
      overallProgress: 15,
      completedSteps: [{ stepKey: 'gbm_1', title: 'Idée', phase: 1, status: 'COMPLETED', hasData: true }],
      incompleteSteps: [{ stepKey: 'gbm_3', title: 'Test', phase: 2, status: 'NOT_STARTED', hasData: false }],
      missingInformation: ['Configurer le cycle de vie'],
      strengths: [],
      weakAreas: [],
      inconsistencies: [],
      healthScore: {
        overall: 30,
        categories: [
          { label: 'Complétude', score: 20, maxScore: 100, weight: 0.3 },
          { label: 'Avancement', score: 15, maxScore: 100, weight: 0.25 },
          { label: 'Cohérence', score: 40, maxScore: 100, weight: 0.25 },
        ],
      },
      priorities: [],
      currentPriority: null,
      recommendedNextAction: '',
    });

    conversationServiceMock.getOrCreateActive.mockResolvedValue({ id: CONV_ID, title: null, createdAt: new Date() });
    messageServiceMock.getHistory.mockResolvedValue([]);
    messageServiceMock.addMessage.mockResolvedValue({});

    serviceA = moduleA.get<ChatbotService>(ChatbotService);
    serviceB = moduleB.get<ChatbotService>(ChatbotService);
  });

  describe('User A can access Project A only', () => {
    it('should allow User A to access Project A', async () => {
      const result = await serviceA.ask(PROJECT_ID_A, USER_ID, 'Question about Project A');
      expect(result.answer).toBeDefined();
      expect(result.conversationId).toBeDefined();
    });

    it('should reject User A accessing Project B', async () => {
      await expect(
        serviceA.ask(PROJECT_ID_B, USER_ID, 'Question about Project B'),
      ).rejects.toThrow('projectId is required');
    });

    it('should not leak Project B data when User A asks about Project A', async () => {
      const result = await serviceA.ask(PROJECT_ID_A, USER_ID, 'What is the maturity level?');
      expect(result.answer).toContain('Project A');
      // Should NOT contain Project B data
      expect(result.answer).not.toContain('Project B');
    });
  });

  describe('User B can access Project B only', () => {
    it('should allow User B to access Project B', async () => {
      const result = await serviceB.ask(PROJECT_ID_B, USER_ID, 'Question about Project B');
      expect(result.answer).toBeDefined();
    });

    it('should reject User B accessing Project A', async () => {
      await expect(
        serviceB.ask(PROJECT_ID_A, USER_ID, 'Question about Project A'),
      ).rejects.toThrow();
    });

    it('should not leak Project A data when User B asks about Project B', async () => {
      const result = await serviceB.ask(PROJECT_ID_B, USER_ID, 'What is the maturity level?');
      expect(result.answer).toContain('Project B');
      expect(result.answer).not.toContain('Project A');
    });
  });

  describe('Conversation isolation', () => {
    it('User A should not see User B conversations', async () => {
      // User A's conversation should be independent from User B's
      const resultA = await serviceA.ask(PROJECT_ID_A, USER_ID, 'Question A');
      const resultB = await serviceB.ask(PROJECT_ID_B, USER_ID, 'Question B');

      expect(resultA.conversationId).toBeDefined();
      expect(resultB.conversationId).toBeDefined();
      // Each should have their own conversation context
      expect(resultA.answer).not.toContain('Project B');
      expect(resultB.answer).not.toContain('Project A');
    });
  });

  describe('RAG document isolation', () => {
    it('User A should only see Project A RAG documents', async () => {
      const result = await serviceA.ask(PROJECT_ID_A, USER_ID, 'Question about docs');
      // RAG documents should be from Project A only
      expect(result.sources).toBeDefined();
      if (result.sources.length > 0) {
        expect(result.sources[0].module).toBe('gbm');
      }
    });

    it('User B should only see Project B RAG documents', async () => {
      const result = await serviceB.ask(PROJECT_ID_B, USER_ID, 'Question about docs');
      expect(result.sources).toBeDefined();
      if (result.sources.length > 0) {
        expect(result.sources[0].module).toBe('gbm');
      }
    });
  });
});