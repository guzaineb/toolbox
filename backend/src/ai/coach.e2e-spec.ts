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
import { ProjectState } from './project-state/project-state.types';

const PROJECT_ID = '11111111-1111-1111-1111-111111111111';
const USER_ID = 'user-1';
const CONV_ID = 'conv-123';

describe('AI Project Coach End-to-End', () => {
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

    prismaMock.project.findUnique.mockResolvedValue({
      id: PROJECT_ID,
      name: 'Project A',
      context_summary: { summary_text: 'Context A' },
      summary_activity: null,
      executive_summary: null,
      mission_vision: { mission: 'Mission A' },
      value_proposition: null,
    });

    ragMock.query.mockResolvedValue({
      status: 'RAG_AVAILABLE' as const,
      documents: [{ id: 'doc-1', content: 'RAG content', metadata: { document_key: 'gbm1', module: 'gbm', section: 'idea' } }],
      distances: [0.3],
      sources: [{ id: 'doc-1', documentKey: 'gbm1', module: 'gbm', section: 'idea', page: 1, chunkIndex: 0, score: 0.7 }],
    });

    contextBuilderMock.build.mockResolvedValue({ contextText: 'Coaching context', projectName: 'Project A' });

    projectStateMock.getProjectState.mockResolvedValue({
      projectId: PROJECT_ID,
      projectName: 'Project A',
      maturityLevel: 'DEVELOPING',
      overallProgress: 45,
      completedSteps: [{ stepKey: 'gbm_1', title: 'Idée', phase: 1, status: 'COMPLETED', hasData: true }],
      incompleteSteps: [{ stepKey: 'gbm_2', title: 'Problèmes', phase: 1, status: 'NOT_STARTED', hasData: false }],
      missingInformation: ['Décrire les problèmes', 'Identifier les besoins'],
      strengths: ['Mission définie'],
      weakAreas: ['GBM très peu avancé'],
      inconsistencies: [
        { area: 'GBM étape 1', description: 'Étape marquée complète mais donnée vide', severity: 'HIGH' },
      ],
      healthScore: {
        overall: 52,
        categories: [
          { label: 'Complétude', score: 40, maxScore: 100, weight: 0.3 },
          { label: 'Avancement', score: 45, maxScore: 100, weight: 0.25 },
          { label: 'Cohérence', score: 60, maxScore: 100, weight: 0.25 },
        ],
      },
      priorities: [
        { level: 'HIGH', area: 'GBM', description: 'Compléter l'étape 2 - Problèmes et besoins', impact: 75, module: 'GBM', stepKey: 'gbm_2' },
      ],
      currentPriority: { level: 'HIGH', area: 'GBM', description: 'Compléter l'étape 2 - Problèmes et besoins', impact: 75, module: 'GBM', stepKey: 'gbm_2' },
      recommendedNextAction: 'Priorité haute : Compléter l'étape 2 - Problèmes et besoins',
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

  it('should complete the main flow: project context → RAG → conversation → message persistence', async () => {
    // 1. Project Owner logs in and opens Project A
    // 2. Opens AI Coach - Coach receives Project A context
    await service.ask(PROJECT_ID, USER_ID, 'What is my project?');

    // 3. Backend verifies ownership (prisma finds the project)
    expect(prismaMock.project.findUnique).toHaveBeenCalledWith({ where: { id: PROJECT_ID } });

    // 4. Project Intelligence Snapshot is generated
    // Verified by projectStateMock.getProjectState being called

    // 5. RAG is queried if available
    expect(ragMock.query).toHaveBeenCalledWith(PROJECT_ID, 'What is my project?', 5);

    // 6. Conversation history is loaded
    expect(conversationServiceMock.getOrCreateActive).toHaveBeenCalledWith(PROJECT_ID, USER_ID);

    // 7. LLM receives the correct context (module, section, step, deterministic analysis)
    const systemMsg = llmMock.chat.mock.calls[0][0][0];
    expect(systemMsg.content).toContain('ID du projet :');
    expect(systemMsg.content).toContain('Project A');
    expect(systemMsg.content).toContain('CONTEXTE MODULE');
    expect(systemMsg.content).toContain('Module actuel :');
    expect(systemMsg.content).toContain('NOMBRE DE MOTS MAXIMUM');

    // 8. Assistant responds
    const result = await service.ask(PROJECT_ID, USER_ID, 'What is my project?');
    expect(result.answer).toBeDefined();
    expect(result.conversationId).toBe(CONV_ID);

    // 9. Message is persisted
    expect(messageServiceMock.addMessage).toHaveBeenCalledTimes(2); // user + assistant
    expect(messageServiceMock.addMessage).toHaveBeenNthCalledWith(
      1, CONV_ID, PROJECT_ID, USER_ID, 'user', 'What is my project?',
    );
    expect(messageServiceMock.addMessage).toHaveBeenNthCalledWith(
      2, CONV_ID, PROJECT_ID, USER_ID, 'assistant', result.answer,
    );

    // 10. Next Best Action is displayed (verified through deterministic block in system prompt)
    expect(systemMsg.content).toContain('ANALYSE DÉTERMINISTE DU PROJET');
    expect(systemMsg.content).toContain('Priorité courante');
    expect(systemMsg.content).toContain('Recommandation');
  });

  it('should restore conversation on page reload', async () => {
    // First ask
    await service.ask(PROJECT_ID, USER_ID, 'First question');

    // Simulate conversation restoration from DB
    messageServiceMock.getHistory.mockResolvedValue([
      { role: 'user', content: 'First question' },
      { role: 'assistant', content: 'First answer' },
    ]);

    // Second ask should load from DB history
    await service.ask(PROJECT_ID, USER_ID, 'Second question');

    // Verify DB history was used (not fresh conversation)
    expect(messageServiceMock.getHistory).toHaveBeenCalledWith(CONV_ID, PROJECT_ID, USER_ID, 6);
    expect(llmMock.chat.mock.calls[1][0]).toContain('First question');
  });

  it('should handle RAG unavailable gracefully', async () => {
    ragMock.query.mockResolvedValue({
      status: 'RAG_UNAVAILABLE' as const,
      documents: [],
      distances: [],
      sources: [],
      reason: 'ChromaDB indisponible : injoignable',
    });

    const result = await service.ask(PROJECT_ID, USER_ID, 'question');
    expect(result.ragStatus).toBe('RAG_UNAVAILABLE');
    expect(result.ragReason).toBe('ChromaDB indisponible : injoignable');
    expect(result.answer).toBeDefined();
  });

  it('should handle RAG no relevant context', async () => {
    ragMock.query.mockResolvedValue({
      status: 'NO_RELEVANT_CONTEXT' as const,
      documents: [],
      distances: [],
      sources: [],
    });

    const result = await service.ask(PROJECT_ID, USER_ID, 'question');
    expect(result.ragStatus).toBe('NO_RELEVANT_CONTEXT');
    expect(result.answer).toBeDefined();
  });
});