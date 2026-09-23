import { Test, TestingModule } from '@nestjs/testing';
import { EvaluationAiService } from './evaluation-ai.service';
import { PrismaService } from '../../prisma/prisma.service';
import { LlmService } from '../llm.service';
import { ChromaService } from '../chroma.service';
import { EmbeddingsService } from '../embeddings.service';
import { ProjectContextBuilderService } from './project-context.service';

const VALID_PAYLOAD = {
  summary: 'Projet cohérent avec un marché identifié.',
  strengths: [{ area: 'impact', description: 'KPIs carbone définis', confidence: 0.8 }],
  weaknesses: [
    { area: 'finance', severity: 'HIGH', description: 'Aucun prévisionnel', evidence: 'bp vide' },
    { area: 'zone_inconnue', severity: 'EXTRÊME', description: 'Sévérité invalide', evidence: null },
  ],
  risks: [{ area: 'market', severity: 'MEDIUM', description: 'Concurrence forte' }],
  opportunities: [{ area: 'innovation', description: 'Subside vert régional' }],
  recommendations: [
    { title: 'Rédiger le prévisionnel 12 mois', priority: 'HIGH', reason: 'bloquant pour le financement' },
    { title: 'Sans raison', priority: 'URGENT' },
  ],
  suggestedQuestions: ['Quel prix de vente ?', '', 'Qui sont les concurrents ?'],
};

describe('EvaluationAiService', () => {
  let service: EvaluationAiService;
  const prismaMock = { aiAnalysis: { create: jest.fn(), update: jest.fn() } };
  const llmMock = { chat: jest.fn() };
  const embeddingsMock = { generate: jest.fn() };
  const chromaMock = { query: jest.fn() };
  const contextMock = { build: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvaluationAiService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: LlmService, useValue: llmMock },
        { provide: EmbeddingsService, useValue: embeddingsMock },
        { provide: ChromaService, useValue: chromaMock },
        { provide: ProjectContextBuilderService, useValue: contextMock },
      ],
    }).compile();
    service = module.get<EvaluationAiService>(EvaluationAiService);

    contextMock.build.mockResolvedValue({ projectName: 'ÉcoPot', contextText: 'Données du projet' });
    embeddingsMock.generate.mockResolvedValue([null]);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should validate and normalize a payload', () => {
    const result = service.validatePayload(VALID_PAYLOAD);
    expect(result).not.toBeNull();
    expect(result!.summary).toContain('cohérent');
    expect(result!.weaknesses[0].severity).toBe('HIGH');
    // zone/sévérité invalides → normalisées
    expect(result!.weaknesses[1].area).toBe('general');
    expect(result!.weaknesses[1].severity).toBeUndefined();
    // priorité inconnue → MEDIUM
    expect(result!.recommendations[1].priority).toBe('MEDIUM');
    // chaînes vides filtrées
    expect(result!.suggestedQuestions).toEqual(['Quel prix de vente ?', 'Qui sont les concurrents ?']);
  });

  it('should reject a payload without summary', () => {
    expect(service.validatePayload({ ...VALID_PAYLOAD, summary: '   ' })).toBeNull();
    expect(service.validatePayload(null)).toBeNull();
    expect(service.validatePayload('texte')).toBeNull();
  });

  it('should complete the analysis when the LLM returns valid JSON (even fenced)', async () => {
    llmMock.chat.mockResolvedValue({ content: '```json\n' + JSON.stringify(VALID_PAYLOAD) + '\n```' });
    prismaMock.aiAnalysis.create.mockResolvedValue({ id: 'ai1' });
    prismaMock.aiAnalysis.update.mockResolvedValue({});

    const payload = await service.analyzeEvaluation('p1', 'e1', 'u1');

    expect(payload).not.toBeNull();
    expect(payload!.strengths).toHaveLength(1);
    expect(prismaMock.aiAnalysis.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ type: 'EVALUATION_ANALYSIS', status: 'PENDING', project_id: 'p1' }),
      }),
    );
    expect(prismaMock.aiAnalysis.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'ai1' },
        data: expect.objectContaining({ status: 'COMPLETED' }),
      }),
    );
  });

  it('should mark the analysis FAILED and return null on invalid LLM output after retries', async () => {
    llmMock.chat.mockResolvedValue({ content: "Je ne peux pas répondre à ça." });
    prismaMock.aiAnalysis.create.mockResolvedValue({ id: 'ai2' });
    prismaMock.aiAnalysis.update.mockResolvedValue({});

    const payload = await service.analyzeEvaluation('p1', 'e1', 'u1');

    expect(payload).toBeNull();
    expect(llmMock.chat).toHaveBeenCalledTimes(2); // 1 tentative + 1 retry
    expect(prismaMock.aiAnalysis.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'ai2' },
        data: expect.objectContaining({ status: 'FAILED' }),
      }),
    );
  });

  it('should degrade gracefully (no RAG, no throw) when embeddings fail', async () => {
    embeddingsMock.generate.mockRejectedValue(new Error('chroma down'));
    llmMock.chat.mockResolvedValue({ content: JSON.stringify(VALID_PAYLOAD) });
    prismaMock.aiAnalysis.create.mockResolvedValue({ id: 'ai3' });
    prismaMock.aiAnalysis.update.mockResolvedValue({});

    const payload = await service.analyzeEvaluation('p1', 'e1', 'u1');
    expect(payload).not.toBeNull();
    expect(chromaMock.query).not.toHaveBeenCalled();
  });
});
