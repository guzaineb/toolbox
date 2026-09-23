import { Test, TestingModule } from '@nestjs/testing';
import { MaturityScoreService, MATURITY_WEIGHTS } from './maturity-score.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MaturityScoreService', () => {
  let service: MaturityScoreService;
  const prismaMock = {
    stepProgress: { count: jest.fn() },
    coachingAction: { count: jest.fn() },
    coachingSession: { count: jest.fn() },
    coachingRecommendation: { count: jest.fn() },
    project: { findUnique: jest.fn() },
    testDiscovery: { findFirst: jest.fn() },
    evaluation: { findMany: jest.fn() },
  };

  const configureCounts = (opts: {
    gbmCompleted?: number;
    bpTotal?: number;
    bpCompleted?: number;
    actionsTotal?: number;
    actionsCompleted?: number;
    sessionsTotal?: number;
    sessionsCompleted?: number;
    recsTotal?: number;
    recsDone?: number;
  }) => {
    prismaMock.stepProgress.count.mockImplementation(({ where }: { where: Record<string, unknown> }) => {
      if (!where.status) return Promise.resolve(opts.bpTotal ?? 0);
      const prefix = (where.step_key as { startsWith?: string }).startsWith;
      return Promise.resolve(prefix === 'gbm_' ? (opts.gbmCompleted ?? 0) : (opts.bpCompleted ?? 0));
    });
    prismaMock.coachingAction.count.mockImplementation(({ where }: { where: Record<string, unknown> }) =>
      Promise.resolve(where.status ? (opts.actionsCompleted ?? 0) : (opts.actionsTotal ?? 0)),
    );
    prismaMock.coachingSession.count.mockImplementation(({ where }: { where: Record<string, unknown> }) =>
      Promise.resolve(where.status ? (opts.sessionsCompleted ?? 0) : (opts.sessionsTotal ?? 0)),
    );
    prismaMock.coachingRecommendation.count.mockImplementation(({ where }: { where: Record<string, unknown> }) =>
      Promise.resolve(where.status ? (opts.recsDone ?? 0) : (opts.recsTotal ?? 0)),
    );
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [MaturityScoreService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();
    service = module.get<MaturityScoreService>(MaturityScoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should use deterministic weights summing to 100', () => {
    const total = Object.values(MATURITY_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(total).toBe(100);
  });

  it('should score an empty project at 0', async () => {
    configureCounts({});
    prismaMock.project.findUnique.mockResolvedValue(null);
    prismaMock.testDiscovery.findFirst.mockResolvedValue(null);
    prismaMock.evaluation.findMany.mockResolvedValue([]);

    const result = await service.compute('p1');

    expect(result.globalScore).toBe(0);
    expect(result.dimensions).toHaveLength(6);
    for (const d of result.dimensions) {
      expect(d.score).toBe(0);
    }
  });

  it('should score a fully completed project at 100', async () => {
    configureCounts({
      gbmCompleted: 21,
      bpTotal: 5,
      bpCompleted: 5,
      actionsTotal: 4,
      actionsCompleted: 4,
      sessionsTotal: 3,
      sessionsCompleted: 3,
      recsTotal: 2,
      recsDone: 2,
    });
    prismaMock.project.findUnique.mockResolvedValue({
      marketing_plan: { analyse_marche: 'Analyse détaillée' },
      market_access: { positionnement: 'Premium éco-responsable' },
      impact_measure: {
        kpis_environnementaux: [{ name: 'CO2', value: 10 }],
        kpis_sociaux: [{ name: 'emplois', value: 2 }],
        resultats_actuels: 'Premiers clients',
      },
    });
    prismaMock.testDiscovery.findFirst.mockResolvedValue({ id: 't1' });
    prismaMock.evaluation.findMany.mockResolvedValue([
      {
        version: 1,
        template: { criteria: [{ id: 'c1', weight: 100, max_score: 20 }] },
        scores: [{ criterion_id: 'c1', score: 20 }],
      },
    ]);

    const result = await service.compute('p1');

    expect(result.globalScore).toBe(100);
    const byName = Object.fromEntries(result.dimensions.map((d) => [d.name, d]));
    expect(byName.evaluation.score).toBe(100);
    expect(byName.gbm.score).toBe(100);
    expect(byName.business_plan.score).toBe(100);
    expect(byName.market_validation.score).toBe(100);
    expect(byName.impact.score).toBe(100);
    expect(byName.coaching_progress.score).toBe(100);
  });

  it('should apply the weights on partial progress (evaluation /20 → x5)', async () => {
    configureCounts({
      gbmCompleted: 11,
      bpTotal: 4,
      bpCompleted: 1,
      actionsTotal: 4,
      actionsCompleted: 2,
      sessionsTotal: 0,
      recsTotal: 0,
    });
    prismaMock.project.findUnique.mockResolvedValue({
      marketing_plan: null,
      market_access: null,
      impact_measure: null,
    });
    prismaMock.testDiscovery.findFirst.mockResolvedValue({ id: 't1' });
    // Dernier tour de jury : version 2 uniquement (la v1 doit être ignorée)
    prismaMock.evaluation.findMany.mockResolvedValue([
      {
        version: 1,
        template: { criteria: [{ id: 'c1', weight: 100, max_score: 20 }] },
        scores: [{ criterion_id: 'c1', score: 20 }],
      },
      {
        version: 2,
        template: { criteria: [{ id: 'c1', weight: 100, max_score: 20 }] },
        scores: [{ criterion_id: 'c1', score: 12 }],
      },
    ]);

    const result = await service.compute('p1');
    const byName = Object.fromEntries(result.dimensions.map((d) => [d.name, d]));

    expect(byName.evaluation.score).toBe(60); // 12/20 → 60
    expect(byName.gbm.score).toBeCloseTo((11 / 21) * 100, 0);
    expect(byName.business_plan.score).toBe(25); // 1/4
    expect(byName.market_validation.score).toBeCloseTo(100 / 3, 0); // 1 signal sur 3
    expect(byName.impact.score).toBe(0);

    const expected =
      byName.evaluation.score * 0.3 +
      byName.gbm.score * 0.2 +
      byName.business_plan.score * 0.15 +
      byName.market_validation.score * 0.15 +
      byName.impact.score * 0.1 +
      byName.coaching_progress.score * 0.1;
    expect(result.globalScore).toBe(Math.round(expected * 100) / 100);
  });
});
