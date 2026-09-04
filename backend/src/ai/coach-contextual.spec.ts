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
const CONV_ID = 'conv-123';

const MODULE_GBM = 'GBM';
const MODULE_BUSINESS_PLAN = 'BUSINESS_PLAN';
const MODULE_FUNDING = 'FUNDING';

const SECTION_GBM = 'Idée initiale';
const SECTION_BUSINESS_PLAN = '2.1 Gestion';
const SECTION_FUNDING = 'Questionnaire de maturité';

const STEP_GBM = 'gbm_1';

describe('AI Project Coach - Contextual Module Tests', () => {
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

  const modules = [MODULE_GBM, MODULE_BUSINESS_PLAN, MODULE_FUNDING];
  const sections = [SECTION_GBM, SECTION_BUSINESS_PLAN, SECTION_FUNDING];
  const steps = [STEP_GBM, 'management', 'questionnaire de maturité'];

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
      name: 'Test Project',
      context_summary: { summary_text: 'Context' },
      summary_activity: null,
      executive_summary: null,
      mission_vision: { mission: 'Mission' },
      value_proposition: null,
    });

    ragMock.query.mockResolvedValue({
      status: 'RAG_AVAILABLE' as const,
      documents: [{ id: 'doc-1', content: 'RAG content', metadata: { document_key: 'gbm1', module: 'gbm', section: 'idea' } }],
      distances: [0.3],
      sources: [{ id: 'doc-1', documentKey: 'gbm1', module: 'gbm', section: 'idea', page: 1, chunkIndex: 0, score: 0.7 }],
    });

    contextBuilderMock.build.mockResolvedValue({ contextText: 'Coaching context' });

    projectStateMock.getProjectState.mockResolvedValue({
      projectId: PROJECT_ID,
      projectName: 'Test Project',
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

  describe.each([
    { module: MODULE_GBM, section: SECTION_GBM, step: STEP_GBM },
    { module: MODULE_BUSINESS_PLAN, section: SECTION_BUSINESS_PLAN, step: 'management' },
    { module: MODULE_FUNDING, section: SECTION_FUNDING, step: 'questionnaire de maturité' },
 ])('Module: $module, Section: $section, Step: $step', ({ module, section, step }) => {
    it('should include module context in system prompt', async () => {
      await service.ask(PROJECT_ID, USER_ID, 'Question');

      const systemMsg = llmMock.chat.mock.calls[0][0][0];
      expect(systemMsg.content).toContain('CONTEXTE MODULE');
      expect(systemMsg.content).toContain(`Module actuel : ${module}`);
      expect(systemMsg.content).toContain(`Section : ${section}`);
      expect(systemMsg.content).toContain(`Étape : ${step}`);
      expect(systemMsg.content).toContain('Concentre ta réponse sur cette section');
    });

    it('should include module-specific priority in deterministic analysis', async () => {
      await service.ask(PROJECT_ID, USER_ID, 'Question');

      const systemMsg = llmMock.chat.mock.calls[0][0][0];
      expect(systemMsg.content).toContain('ANALYSE DÉTERMINISTE DU PROJET');
      expect(systemMsg.content).toContain('Priorité courante');
      expect(systemMsg.content).toContain(module);
    });

    it('should include recommended next action in deterministic block', async () => {
      await service.ask(PROJECT_ID, USER_ID, 'Question');

      const systemMsg = llmMock.chat.mock.calls[0][0][0];
      expect(systemMsg.content).toContain('Recommandation :');
      expect(systemMsg.content).toContain('Priorité haute');
    });
  });

  it('GBM should preserve step context (gbm_1, gbm_2, etc.)', async () => {
    await service.ask(PROJECT_ID, USER_ID, 'Question about gbm_1');

    const systemMsg = llmMock.chat.mock.calls[0][0][0];
    expect(systemMsg.content).toContain('Étape : gbm_1');
    expect(systemMsg.content).toContain('gbm_2');
  });

  it('Business Plan should preserve section context (2.1, 2.2, etc.)', async () => {
    await service.ask(PROJECT_ID, USER_ID, 'Question about section 2.1');

    const systemMsg = llmMock.chat.mock.calls[0][0][0];
    expect(systemMsg.content).toContain('Section : 2.1 Gestion');
  });

  it('Financing should preserve module context (FUNDING)', async () => {
    await service.ask(PROJECT_ID, USER_ID, 'Question about financing');

    const systemMsg = llmMock.chat.mock.calls[0][0][0];
    expect(systemMsg.content).toContain('Module actuel : FUNDING');
    expect(systemMsg.content).toContain('Section : Questionnaire de maturité');
  });

  it('should enforce structured explanation format across all modules', async () => {
    await service.ask(PROJECT_ID, USER_ID, 'question');

    const systemMsg = llmMock.chat.mock.calls[0][0][0];
    expect(systemMsg.content).toContain('RÈGLES POUR LES EXPLICATIONS');
    expect(systemMsg.content).toContain('Observation');
    expect(systemMsg.content).toContain('Pourquoi c\'est important');
    expect(systemMsg.content).toContain('Action recommandée');
    expect(systemMsg.content).toContain('Comment faire');
    expect(systemMsg.content).toContain('Étape suivante');
  });

  it('should forbid LLM from inventing priorities across all modules', async () => {
    await service.ask(PROJECT_ID, USER_ID, 'question');

    const systemMsg = llmMock.chat.mock.calls[0][0][0];
    expect(systemMsg.content).toContain('NE JAMAIS en inventer');
  });
});