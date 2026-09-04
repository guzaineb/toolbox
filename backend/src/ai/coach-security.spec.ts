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

const PROJECT_ID_A = 'aaaaffff-1111-1111-1111-111111111111';
const PROJECT_ID_B = 'bbbbeeee-2222-2222-2222-222222222222';
const USER_ID = 'user-1';
const CONV_ID = 'conv-123';

describe('AI Project Coach Security - User Isolation', () => {
  let service: ChatbotService;

  const llmMock = {
    chat: jest.fn(),
  };

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

  const userBPrismaMock = {
    project: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.restoreAllMocks();

    llmMock.chat.mockReset();
    ragMock.query.mockReset();
    contextBuilderMock.build.mockReset();
    projectStateMock.getProjectState.mockReset();
    registryMock.getToolsForPrompt.mockReset();
    registryMock.execute.mockReset();
    conversationServiceMock.getOrCreateActive.mockReset();
    messageServiceMock.getHistory.mockReset();
    messageServiceMock.addMessage.mockReset();

    // Project A data
    prismaMock.project.findUnique.mockImplementation((where: any) => {
      if (where.id === PROJECT_ID_A) {
        return Promise.resolve({
          id: PROJECT_ID_A,
          name: 'Project A',
          context_summary: { summary_text: 'Context A' },
          summary_activity: null,
          executive_summary: null,
          mission_vision: { mission: 'Mission A' },
          value_proposition: null,
        });
      }
      if (where.id === PROJECT_ID_B) {
        return Promise.resolve({
          id: PROJECT_ID_B,
          name: 'Project B',
          context_summary: { summary_text: 'Context B' },
          summary_activity: null,
          executive_summary: null,
          mission_vision: { mission: 'Mission B' },
          value_proposition: null,
        });
      }
      return Promise.resolve(null);
    });

    // User B's prisma (simulates different user context)
    userBPrismaMock.project.findUnique.mockImplementation((where: any) => {
      if (where.id === PROJECT_ID_A) {
        return Promise.resolve({
          id: PROJECT_ID_A,
          name: 'Project A',
          context_summary: { summary_text: 'Context A' },
          summary_activity: null,
          executive_summary: null,
          mission_vision: { mission: 'Mission A' },
          value_proposition: null,
        });
      }
      if (where.id === PROJECT_ID_B) {
        return Promise.resolve({
          id: PROJECT_ID_B,
          name: 'Project B',
          context_summary: { summary_text: 'Context B' },
          summary_activity: null,
          executive_summary: null,
          mission_vision: { mission: 'Mission B' },
          value_proposition: null,
        });
      }
      return Promise.resolve(null);
    });

    ragMock.query.mockResolvedValue({
      status: 'RAG_AVAILABLE' as const,
      documents: [{ id: 'doc-1', content: 'RAG content', metadata: { document_key: 'gbm1', module: 'gbm', section: 'idea' } }],
      distances: [0.3],
      sources: [{ id: 'doc-1', documentKey: 'gbm1', module: 'gbm', section: 'idea', page: 1, chunkIndex: 0, score: 0.7 }],
    });

    contextBuilderMock.build.mockResolvedValue({ contextText: 'Coaching context', projectName: 'Project A' });

    projectStateMock.getProjectState.mockResolvedValue({
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
      recommendedNextAction: null,
    });

    registryMock.getToolsForPrompt.mockReturnValue([
      { type: 'function', function: { name: 'getGBM', description: 'Get GBM data', parameters: {} } },
    ]);

    conversationServiceMock.getOrCreateActive.mockResolvedValue({ id: CONV_ID, title: null, createdAt: new Date() });
    messageServiceMock.getHistory.mockResolvedValue([]);
    messageServiceMock.addMessage.mockResolvedValue({});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatbotService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: LlmService, useValue: llmMock },
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

  it('User A should access Project A only', async () => {
    const result = await service.ask(PROJECT_ID_A, USER_ID, 'What is my project?');
    expect(result.answer).toContain('Project A');
    expect(prismaMock.project.findUnique).toHaveBeenCalledWith({ where: { id: PROJECT_ID_A } });
  });

  it('User A should NOT access Project B', async () => {
    // When asking about Project A, prisma should NOT find Project B
    await service.ask(PROJECT_ID_A, USER_ID, 'question');
    // Verify Project B was not queried
    const callArgs = (prismaMock.project.findUnique as jest.Mock).mock.calls;
    const askedForB = callArgs.some((args: any) => args.where.id === PROJECT_ID_B);
    expect(askedForB).toBeFalsy();
  });

  it('User B should NOT access Project A', async () => {
    // Set up User B's session - asking about Project B should only see Project B
    const serviceBModule: TestingModule = await Test.createTestingModule({
      providers: [
        ChatbotService,
        { provide: PrismaService, useValue: userBPrismaMock },
        { provide: LlmService, useValue: llmMock },
        { provide: RagPipelineService, useValue: ragMock },
        { provide: ProjectContextBuilderService, useValue: contextBuilderMock },
        { provide: ProjectStateService, useValue: projectStateMock },
        { provide: ToolRegistry, useValue: registryMock },
        { provide: ConversationService, useValue: conversationServiceMock },
        { provide: MessageService, useValue: messageServiceMock },
      ],
    }).compile();

    const serviceB = serviceBModule.get<ChatbotService>(ChatbotService);

    const result = await serviceB.ask(PROJECT_ID_B, USER_ID, 'What is my project?');
    expect(result.answer).toContain('Project B');
    expect((userBPrismaMock.project.findUnique as jest.Mock).mock.calls[0].where.id).toBe(PROJECT_ID_B);
  });

  it('User B should NOT see Project A data when asking about Project B', async () => {
    const serviceBModule: TestingModule = await Test.createTestingModule({
      providers: [
        ChatbotService,
        { provide: PrismaService, useValue: userBPrismaMock },
        { provide: LlmService, useValue: llmMock },
        { provide: RagPipelineService, useValue: ragMock },
        { provide: ProjectContextBuilderService, useValue: contextBuilderMock },
        { provide: ProjectStateService, useValue: projectStateMock },
        { provide: ToolRegistry, useValue: registryMock },
        { provide: ConversationService, useValue: conversationServiceMock },
        { provide: MessageService, useValue: messageServiceMock },
      ],
    }).compile();

    const serviceB = serviceBModule.get<ChatbotService>(ChatbotService);

    await serviceB.ask(PROJECT_ID_B, USER_ID, 'question');

    // Verify Project A data (context_summary, mission) is NOT in the system prompt
    const systemMsg = llmMock.chat.mock.calls[0][0][0];
    expect(systemMsg.content).not.toContain('Mission A');
    expect(systemMsg.content).not.toContain('Context A');
    expect(systemMsg.content).toContain('Project B');
  });
});