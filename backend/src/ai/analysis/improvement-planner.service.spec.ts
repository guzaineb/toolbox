import { Test, TestingModule } from '@nestjs/testing';
import { ImprovementPlannerService } from './improvement-planner.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EvaluationAiService } from './evaluation-ai.service';

describe('ImprovementPlannerService', () => {
  let service: ImprovementPlannerService;
  const prismaMock = {
    aiAnalysis: { findFirst: jest.fn() },
    improvementPlan: { create: jest.fn() },
  };
  const evaluationAiMock = { analyzeEvaluation: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImprovementPlannerService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: EvaluationAiService, useValue: evaluationAiMock },
      ],
    }).compile();
    service = module.get<ImprovementPlannerService>(ImprovementPlannerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('buildDraft', () => {
    it('should turn recommendations into objectives and HIGH weaknesses into risk objectives', () => {
      const draft = service.buildDraft({
        summary: 'Résumé de synthèse',
        weaknesses: [
          {
            area: 'finance',
            severity: 'HIGH',
            description: 'Prévisionnel absent',
          },
          {
            area: 'team',
            severity: 'LOW',
            description: 'Compétence à renforcer',
          },
        ],
        risks: [
          { area: 'market', severity: 'HIGH', description: 'Marché saturé' },
          { area: 'legal', severity: 'MEDIUM', description: 'Risque moyen' },
        ],
        recommendations: [
          {
            title: 'Objectif finance',
            priority: 'HIGH',
            reason: 'priorité n°1',
          },
          { title: 'Objectif market', priority: 'MEDIUM', reason: '' },
        ],
      });

      expect(draft.title).toContain('proposition IA');
      expect(draft.description).toBe('Résumé de synthèse');

      // 2 recommandations ; les points HIGH (finance, market) sont déjà couverts
      // par les titres de recommandations → pas d'objectif de risque dupliqué
      expect(draft.objectives).toHaveLength(2);
      expect(draft.objectives[0]).toMatchObject({
        title: 'Objectif finance',
        priority: 'HIGH',
        currentScore: null,
        targetScore: null,
      });
      expect(draft.objectives[1].priority).toBe('MEDIUM');
      const riskObjectives = draft.objectives.filter((o) =>
        o.title.startsWith('Réduire le risque'),
      );
      expect(riskObjectives).toEqual([]);
      for (const o of riskObjectives) {
        expect(o.priority).toBe('HIGH');
      }
    });

    it('should deduplicate targetAreas and cap objectives at 6', () => {
      const draft = service.buildDraft({
        summary: 's',
        weaknesses: [
          { area: 'finance', severity: 'MEDIUM', description: 'w1' },
          { area: 'finance', severity: 'LOW', description: 'w2' },
        ],
        risks: [],
        recommendations: Array.from({ length: 8 }, (_, i) => ({
          title: `Rec ${i}`,
          priority: 'LOW',
          reason: '',
        })),
      });

      // max 4 recommandations + faiblesses MEDIUM non éligibles au risque → 4 objectifs
      expect(draft.objectives).toHaveLength(4);
      expect(draft.targetAreas).toEqual(['finance', 'general']);
    });

    it('should not duplicate a risk objective whose area is already covered by a recommendation title', () => {
      const draft = service.buildDraft({
        summary: 's',
        weaknesses: [{ area: 'finance', severity: 'HIGH', description: 'w' }],
        risks: [],
        recommendations: [
          {
            title: 'Renforcer la FINANCE rapidement',
            priority: 'HIGH',
            reason: '',
          },
        ],
      });

      expect(draft.objectives).toHaveLength(1);
      expect(draft.objectives[0].title).not.toContain('Réduire le risque');
    });
  });

  describe('generateFromEvaluation', () => {
    it('should return planId null when the analysis is unavailable', async () => {
      evaluationAiMock.analyzeEvaluation.mockResolvedValue(null);

      const result = await service.generateFromEvaluation('p1', 'e1', 'u1');
      expect(result).toEqual({ planId: null, analysisAvailable: false });
      expect(prismaMock.improvementPlan.create).not.toHaveBeenCalled();
    });

    it('should return planId null when no COMPLETED analysis is persisted', async () => {
      evaluationAiMock.analyzeEvaluation.mockResolvedValue({
        summary: 'ok',
        weaknesses: [],
        risks: [],
        recommendations: [],
      });
      prismaMock.aiAnalysis.findFirst.mockResolvedValue(null);

      const result = await service.generateFromEvaluation('p1', 'e1', 'u1');
      expect(result).toEqual({ planId: null, analysisAvailable: false });
    });

    it('should create a DRAFT plan with pending objectives linked to the analysis', async () => {
      evaluationAiMock.analyzeEvaluation.mockResolvedValue({
        summary: 'Synthèse',
        weaknesses: [
          {
            area: 'finance',
            severity: 'HIGH',
            description: 'Prévisionnel manquant',
          },
        ],
        risks: [],
        recommendations: [
          {
            title: 'Faire le prévisionnel',
            priority: 'HIGH',
            reason: 'bloquant',
          },
        ],
      });
      prismaMock.aiAnalysis.findFirst.mockResolvedValue({ id: 'analysis-1' });
      prismaMock.improvementPlan.create.mockResolvedValue({ id: 'plan-1' });

      const result = await service.generateFromEvaluation('p1', 'e1', 'u1');

      expect(result).toEqual({ planId: 'plan-1', analysisAvailable: true });
      expect(prismaMock.improvementPlan.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            project_id: 'p1',
            ai_analysis_id: 'analysis-1',
            status: 'DRAFT',
            created_by: 'u1',
            objectives: {
              create: expect.arrayContaining([
                expect.objectContaining({
                  status: 'PENDING',
                  priority: 'HIGH',
                }),
              ]),
            },
          }),
        }),
      );
    });
  });
});
