import { Test, TestingModule } from '@nestjs/testing';
import { RiskAnalysisService } from './risk-analysis.service';
import { PrismaService } from '../../prisma/prisma.service';
import { LlmService } from '../llm.service';
import { ProjectContextBuilderService } from './project-context.service';

const VALID_PAYLOAD = {
  overallLevel: 'HIGH',
  risks: [
    {
      category: 'financial',
      severity: 'HIGH',
      description: 'Trésorerie insuffisante pour 6 mois',
      evidence: 'Aucun prévisionnel',
      recommendedAction: 'Établir un plan de trésorerie 12 mois',
    },
    {
      category: 'categorie_inconnue',
      severity: 'CRITIQUE',
      description: 'Risque à normaliser',
      evidence: '',
    },
  ],
};

describe('RiskAnalysisService', () => {
  let service: RiskAnalysisService;
  const prismaMock = { aiAnalysis: { create: jest.fn() } };
  const llmMock = { chat: jest.fn() };
  const contextMock = { build: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RiskAnalysisService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: LlmService, useValue: llmMock },
        { provide: ProjectContextBuilderService, useValue: contextMock },
      ],
    }).compile();
    service = module.get<RiskAnalysisService>(RiskAnalysisService);

    contextMock.build.mockResolvedValue({
      projectName: 'ÉcoPot',
      contextText: 'Données réelles',
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return null when the project has no context data', async () => {
    contextMock.build.mockResolvedValue({
      projectName: 'Vide',
      contextText: '',
    });
    await expect(service.analyze('p1', 'u1')).resolves.toBeNull();
    expect(llmMock.chat).not.toHaveBeenCalled();
  });

  it('should validate and normalize risks (unknown category/severity → défauts)', () => {
    const result = service.validate(VALID_PAYLOAD);
    expect(result).not.toBeNull();
    expect(result!.overallLevel).toBe('HIGH');
    expect(result!.risks[0].category).toBe('financial');
    expect(result!.risks[1]).toMatchObject({
      category: 'execution',
      severity: 'MEDIUM',
      evidence: null,
      recommendedAction: null,
    });
  });

  it('should reject payloads without valid risks or a missing level array', () => {
    expect(service.validate({ ...VALID_PAYLOAD, risks: [] })).toBeNull();
    expect(service.validate({ overallLevel: 'HIGH' })).toBeNull();
    expect(service.validate(null)).toBeNull();
  });

  it('should analyze and persist a COMPLETED risk analysis', async () => {
    llmMock.chat.mockResolvedValue({ content: JSON.stringify(VALID_PAYLOAD) });
    prismaMock.aiAnalysis.create.mockResolvedValue({ id: 'ai1' });

    const payload = await service.analyze('p1', 'u1');

    expect(payload).not.toBeNull();
    expect(payload!.risks).toHaveLength(2);
    // Le prompt impose de ne pas inventer d'informations
    const promptArg = llmMock.chat.mock.calls[0][0][1].content as string;
    expect(promptArg).toContain('ne jamais inventer');
    expect(prismaMock.aiAnalysis.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          project_id: 'p1',
          type: 'RISK_ANALYSIS',
          status: 'COMPLETED',
          created_by: 'u1',
        }),
      }),
    );
  });

  it('should still return the payload if persisting fails (best effort)', async () => {
    llmMock.chat.mockResolvedValue({ content: JSON.stringify(VALID_PAYLOAD) });
    prismaMock.aiAnalysis.create.mockRejectedValue(new Error('db down'));

    await expect(service.analyze('p1', 'u1')).resolves.not.toBeNull();
  });

  it('should return null when the LLM output stays invalid after retries', async () => {
    llmMock.chat.mockResolvedValue({ content: 'pas de json ici' });
    await expect(service.analyze('p1', 'u1')).resolves.toBeNull();
    expect(llmMock.chat).toHaveBeenCalledTimes(2);
  });
});
