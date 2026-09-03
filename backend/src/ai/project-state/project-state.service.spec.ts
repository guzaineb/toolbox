import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { MaturityScoreService } from '../../maturity/maturity-score.service';
import { ProjectAnalyzer } from './project-analyzer.service';
import { ConsistencyChecker } from './consistency-checker.service';
import { ProjectHealthService } from './project-health.service';
import { ProjectStateService } from './project-state.service';

describe('ProjectStateService', () => {
  let service: ProjectStateService;

  const prismaMock = {
    project: {
      findUnique: jest.fn(),
    },
    coachingAction: { count: jest.fn() },
    coachingSession: { count: jest.fn() },
    coachingRecommendation: { count: jest.fn() },
    evaluation: { count: jest.fn() },
  };

  const maturityMock = {
    compute: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    prismaMock.coachingAction.count.mockResolvedValue(0);
    prismaMock.coachingSession.count.mockResolvedValue(0);
    prismaMock.coachingRecommendation.count.mockResolvedValue(0);
    prismaMock.evaluation.count.mockResolvedValue(0);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectStateService,
        ProjectAnalyzer,
        ConsistencyChecker,
        ProjectHealthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: MaturityScoreService, useValue: maturityMock },
      ],
    }).compile();

    service = module.get<ProjectStateService>(ProjectStateService);
  });

  function mockProject(overrides: Record<string, any> = {}) {
    const base = {
      id: 'proj-1',
      name: 'Projet Test',
      business_plan_status: null,
      idea_sketch: null,
      problems_needs: null,
      pestel: null,
      objective: null,
      mission_vision: null,
      context_summary: null,
      stakeholder: [],
      stakeholder_map: [],
      customer_segment: [],
      value_proposition: null,
      test_discovery: [],
      value_proposition_pivot: null,
      customer_relations_channel: null,
      customer_journey: [],
      key_activities_resource: null,
      eco_design: null,
      eco_design_result: null,
      summary_activity: null,
      cost_structure: null,
      revenue_stream: null,
      cost_revenue_summary: null,
      test_preparation: null,
      indicator: null,
      management_plan: null,
      marketing_plan: null,
      financial_plan: null,
      legal_plan: null,
      kpi: null,
      executive_summary: null,
      funding_assessment: null,
      market_access: null,
      impact_measure: null,
      swot_analysis: null,
      step_progresses: [],
      ...overrides,
    };
    prismaMock.project.findUnique.mockResolvedValue(base);
    return base;
  }

  describe('getProjectState', () => {
    it('projet inexistant → lance une erreur', async () => {
      prismaMock.project.findUnique.mockResolvedValue(null);
      await expect(service.getProjectState('unknown')).rejects.toThrow(
        'Projet introuvable',
      );
    });

    it('projet vide → état initial avec toutes les propriétés', async () => {
      mockProject();
      maturityMock.compute.mockResolvedValue({
        globalScore: 0,
        dimensions: [],
        computedAt: new Date().toISOString(),
      });

      const state = await service.getProjectState('proj-1');

      expect(state.projectId).toBe('proj-1');
      expect(state.projectName).toBe('Projet Test');
      expect(state.maturityLevel).toBe('NOT_STARTED');
      expect(state.overallProgress).toBe(0);
      expect(state.completedSteps).toEqual([]);
      expect(state.incompleteSteps.length).toBe(24);
      expect(state.missingInformation.length).toBeGreaterThan(0);
      expect(state.healthScore.overall).toBeGreaterThanOrEqual(0);
      expect(state.healthScore.categories).toHaveLength(4);
      expect(state.currentPriority).not.toBeNull();
      expect(typeof state.recommendedNextAction).toBe('string');
    });

    it('projet bien rempli → strengths non vide, healthy score', async () => {
      mockProject({
        idea_sketch: { idea_initial: 'Mon idée', product_service: 'Produit' },
        problems_needs: { customer_needs: 'Besoins clients' },
        pestel: { economic_what: 'Contexte éco' },
        objective: { environmental_objectives: 'Obj env' },
        mission_vision: { mission: 'Ma mission', vision: 'Ma vision' },
        value_proposition: { products_services: 'Produit', value_added: 'Valeur' },
        customer_segment: [{ segment_name: 'Segment 1' }, { segment_name: 'Segment 2' }],
        key_activities_resource: { key_activities: 'Activités', key_resources: 'Ressources' },
        cost_structure: { fixed_costs: '5000', variable_costs: '2000' },
        revenue_stream: { revenue_sources: 'Revenus', pricing_strategy: 'Prix' },
        financial_plan: { point_depart: 'Plan financier' },
        legal_plan: { statut_juridique: 'SARL' },
        indicator: { environmental_kpis: 'KPI env' },
        eco_design: { vision_durable: 'Vision durable' },
        impact_measure: { methode_mesure: 'Mesure' },
        market_access: { positionnement: 'Position' },
        swot_analysis: { strengths: 'Forces', weaknesses: 'Faiblesses', opportunities: 'Opp', threats: 'Menaces' },
        management_plan: { ressources_humaines: 'RH' },
        step_progresses: [
          { step_key: 'gbm_1', status: 'COMPLETED' },
          { step_key: 'gbm_2', status: 'COMPLETED' },
          { step_key: 'gbm_3', status: 'COMPLETED' },
          { step_key: 'gbm_4', status: 'COMPLETED' },
          { step_key: 'gbm_5', status: 'COMPLETED' },
        ],
      });
      maturityMock.compute.mockResolvedValue({
        globalScore: 65,
        dimensions: [],
        computedAt: new Date().toISOString(),
      });
      prismaMock.coachingAction.count.mockResolvedValue(3);
      prismaMock.coachingSession.count.mockResolvedValue(2);
      prismaMock.evaluation.count.mockResolvedValue(1);

      const state = await service.getProjectState('proj-1');

      expect(state.maturityLevel).toBe('MATURE');
      expect(state.completedSteps.length).toBe(5);
      expect(state.strengths.length).toBeGreaterThan(0);
      expect(state.healthScore.overall).toBeGreaterThan(30);
      expect(state.recommendedNextAction).toBeTruthy();
    });

    it('erreur maturity → fallback score 0, ne plante pas', async () => {
      mockProject();
      maturityMock.compute.mockRejectedValue(new Error('DB down'));

      const state = await service.getProjectState('proj-1');
      expect(state.maturityLevel).toBe('NOT_STARTED');
      expect(state.healthScore.overall).toBeGreaterThanOrEqual(0);
    });

    it('incohérences remontées dans l état', async () => {
      mockProject({
        step_progresses: [{ step_key: 'gbm_1', status: 'COMPLETED' }],
      });
      maturityMock.compute.mockResolvedValue({
        globalScore: 0,
        dimensions: [],
        computedAt: new Date().toISOString(),
      });

      const state = await service.getProjectState('proj-1');
      expect(state.inconsistencies.length).toBeGreaterThanOrEqual(1);
      expect(state.inconsistencies.some((i) => i.area === 'GBM')).toBe(true);
    });
  });
});
