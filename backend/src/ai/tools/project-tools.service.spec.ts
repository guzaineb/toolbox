import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ProjectToolsService } from './project-tools.service';
import { ToolRegistry } from './tool-registry';
import { PrismaService } from '../../prisma/prisma.service';
import { ModuleAccessService } from '../../common/services/module-access.service';
import { ProjectStateService } from '../project-state/project-state.service';
import { ConsistencyChecker } from '../project-state/consistency-checker.service';
import { ProjectHealthService } from '../project-state/project-health.service';
import { ProjectAnalyzer } from '../project-state/project-analyzer.service';

const PROJECT_ID = '11111111-1111-1111-1111-111111111111';
const USER_ID = 'user-1';
const OTHER_PROJECT_ID = '22222222-2222-2222-2222-222222222222';
const OTHER_USER_ID = 'user-2';

const mockProject = {
  id: PROJECT_ID,
  name: 'Test Project',
  idea_sketch: { idea_initial: 'Solar energy for rural areas' },
  problems_needs: { customer_needs: 'Access to clean energy' },
  pestel: { political_what: 'Supportive regulations' },
  objective: { environmental_objectives: 'Reduce carbon footprint' },
  mission_vision: { mission: 'Clean energy for all' },
  context_summary: { summary_text: 'Project context summary' },
  stakeholder: null,
  stakeholder_map: null,
  customer_segment: { segment_name: 'Rural households' },
  value_proposition: { products_services: 'Solar kits' },
  test_discovery: null,
  value_proposition_pivot: null,
  customer_relations_channel: null,
  customer_journey: null,
  key_activities_resource: { key_activities: 'Installation, maintenance' },
  summary_activity: { activities_summary: 'Installation and maintenance' },
  eco_design: { projet_eco: 'Low-carbon solar design' },
  eco_design_result: { eco_results: '30% emission reduction' },
  cost_structure: { fixed_costs: '10000', variable_costs: '500 per unit' },
  revenue_stream: { revenue_sources: 'Sales + subscription' },
  cost_revenue_summary: { financial_health: 'Positive outlook' },
  financial_plan: { seuil_rentabilite: 50000 },
  management_plan: { problemes_gestion: 'Team building' },
  marketing_plan: { analyse_marche: 'Growing market' },
  legal_plan: { statut_juridique: 'SARL' },
  executive_summary: { resume_executif: 'Strong solar business' },
  funding_assessment: { strategie_levee_fonds: 'Seed round' },
  market_access: { positionnement: 'Premium eco brand' },
  impact_measure: { methode_mesure: 'LCA methodology' },
  indicator: { environmental_kpis: 'CO2 avoided' },
  swot_analysis: { strengths: 'Strong team', weaknesses: 'Limited capital' },
  step_progresses: [
    { step_key: 'gbm_1', status: 'COMPLETED' },
    { step_key: 'gbm_2', status: 'IN_PROGRESS' },
    { step_key: 'gbm_3', status: 'NOT_STARTED' },
  ],
  business_plan_status: 'IN_PROGRESS',
};

const mockProjectState = {
  projectId: PROJECT_ID,
  projectName: 'Test Project',
  maturityLevel: 'DEVELOPING' as const,
  overallProgress: 45,
  completedSteps: [{ stepKey: 'gbm_1', title: 'Idea', phase: 1, status: 'COMPLETED', hasData: true }],
  incompleteSteps: [{ stepKey: 'gbm_2', title: 'Problems', phase: 1, status: 'IN_PROGRESS', hasData: false }],
  missingInformation: ['PESTEL analysis incomplete'],
  strengths: ['Strong mission'],
  weakAreas: ['Financial planning'],
  inconsistencies: [{ area: 'finances', description: 'Costs without revenue', severity: 'HIGH' }],
  healthScore: { overall: 55, categories: [] },
  priorities: [{ level: 'HIGH', area: 'finances', description: 'Complete financial plan', impact: 20 }],
  currentPriority: { level: 'HIGH', area: 'finances', description: 'Complete financial plan', impact: 20 },
  recommendedNextAction: 'Complete the financial plan section',
};

describe('ProjectToolsService', () => {
  let service: ProjectToolsService;
  let registry: ToolRegistry;

  const accessMock = {
    assertCanAccessProject: jest.fn(),
  };

  const prismaMock = {
    project: {
      findUnique: jest.fn(),
    },
    $queryRaw: jest.fn().mockResolvedValue([{ avgScore: 0 }]),
  };

  const projectStateMock = {
    getProjectState: jest.fn().mockResolvedValue(mockProjectState),
  };

  const consistencyCheckerMock = {
    check: jest.fn().mockReturnValue({
      inconsistencies: [{ area: 'finances', description: 'Missing revenue', severity: 'HIGH' }],
      score: 75,
      totalChecks: 10,
      passedChecks: 8,
    }),
  };

  const healthServiceMock = {
    diagnose: jest.fn().mockReturnValue({
      score: 62,
      completenessScore: 70,
      progressScore: 55,
      coherenceScore: 60,
      maturityScore: 50,
      strengths: ['Good mission'],
      weakAreas: ['Financial plan'],
    }),
  };

  const analyzerMock = {
    analyzeCompleteness: jest.fn().mockReturnValue({
      gbm: { completed: 1, total: 24, percentage: 4, steps: [] },
      businessPlan: { completed: 0, total: 6, percentage: 0, sections: [] },
      transversal: {},
    }),
    analyzeProgress: jest.fn().mockReturnValue({
      overallPercentage: 12,
      gbmPercentage: 4,
      bpPercentage: 0,
      modulePercentages: { phase_1: 33 },
      completedCount: 1,
      totalCount: 3,
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    accessMock.assertCanAccessProject.mockResolvedValue(undefined);
    prismaMock.project.findUnique.mockResolvedValue(mockProject);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectToolsService,
        ToolRegistry,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ModuleAccessService, useValue: accessMock },
        { provide: ProjectStateService, useValue: projectStateMock },
        { provide: ConsistencyChecker, useValue: consistencyCheckerMock },
        { provide: ProjectHealthService, useValue: healthServiceMock },
        { provide: ProjectAnalyzer, useValue: analyzerMock },
      ],
    }).compile();

    registry = module.get<ToolRegistry>(ToolRegistry);
    service = module.get<ProjectToolsService>(ProjectToolsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register all 11 tools in the registry', () => {
    const expectedTools = [
      'getProjectState', 'getProjectProgress', 'getGBM', 'getBusinessPlan',
      'getMarket', 'getFinancing', 'getImpact', 'getEcoDesign',
      'detectInconsistencies', 'calculateHealthScore', 'getNextBestAction',
    ];
    for (const name of expectedTools) {
      expect(registry.hasTool(name)).toBe(true);
    }
  });

  describe('access control', () => {
    it('rejects when user has no access to project', async () => {
      accessMock.assertCanAccessProject.mockRejectedValue(
        new ForbiddenException('Accès refusé à ce projet'),
      );

      const result = await registry.execute(
        'getProjectState',
        JSON.stringify({ projectId: PROJECT_ID }),
        OTHER_USER_ID,
      );
      const parsed = JSON.parse(result);
      expect(parsed.error).toContain('Accès refusé');
    });

    it('rejects when project does not exist', async () => {
      accessMock.assertCanAccessProject.mockRejectedValue(
        new NotFoundException('Projet introuvable'),
      );

      const result = await registry.execute(
        'getProjectState',
        JSON.stringify({ projectId: OTHER_PROJECT_ID }),
        USER_ID,
      );
      const parsed = JSON.parse(result);
      expect(parsed.error).toContain('introuvable');
    });
  });

  describe('getProjectState', () => {
    it('returns project state with access check', async () => {
      const result = await registry.execute(
        'getProjectState',
        JSON.stringify({ projectId: PROJECT_ID }),
        USER_ID,
      );
      const parsed = JSON.parse(result);
      expect(parsed.projectId).toBe(PROJECT_ID);
      expect(parsed.maturityLevel).toBe('DEVELOPING');
      expect(accessMock.assertCanAccessProject).toHaveBeenCalledWith(PROJECT_ID, USER_ID);
    });
  });

  describe('getProjectProgress', () => {
    it('returns progress data with access check', async () => {
      const result = await registry.execute(
        'getProjectProgress',
        JSON.stringify({ projectId: PROJECT_ID }),
        USER_ID,
      );
      const parsed = JSON.parse(result);
      expect(parsed.overallPercentage).toBe(12);
      expect(parsed.completedCount).toBe(1);
      expect(parsed.totalCount).toBe(3);
    });
  });

  describe('getGBM', () => {
    it('returns GBM data with correct shape', async () => {
      const result = await registry.execute(
        'getGBM',
        JSON.stringify({ projectId: PROJECT_ID }),
        USER_ID,
      );
      const parsed = JSON.parse(result);
      expect(parsed.ideaSketch).toEqual({ idea_initial: 'Solar energy for rural areas' });
      expect(parsed.problemsNeeds).toEqual({ customer_needs: 'Access to clean energy' });
      expect(parsed.pestel).toEqual({ political_what: 'Supportive regulations' });
      expect(parsed.stepProgresses).toEqual([
        { stepKey: 'gbm_1', status: 'COMPLETED' },
        { stepKey: 'gbm_2', status: 'IN_PROGRESS' },
        { stepKey: 'gbm_3', status: 'NOT_STARTED' },
      ]);
    });
  });

  describe('getBusinessPlan', () => {
    it('returns BP data with correct shape', async () => {
      const result = await registry.execute(
        'getBusinessPlan',
        JSON.stringify({ projectId: PROJECT_ID }),
        USER_ID,
      );
      const parsed = JSON.parse(result);
      expect(parsed.financialPlan).toEqual({ seuil_rentabilite: 50000 });
      expect(parsed.marketingPlan).toEqual({ analyse_marche: 'Growing market' });
      expect(parsed.executiveSummary).toEqual({ resume_executif: 'Strong solar business' });
    });
  });

  describe('getMarket', () => {
    it('returns market data', async () => {
      const result = await registry.execute(
        'getMarket',
        JSON.stringify({ projectId: PROJECT_ID }),
        USER_ID,
      );
      const parsed = JSON.parse(result);
      expect(parsed.marketAccess).toEqual({ positionnement: 'Premium eco brand' });
      expect(parsed.customerSegment).toEqual({ segment_name: 'Rural households' });
    });
  });

  describe('getFinancing', () => {
    it('returns financing data', async () => {
      const result = await registry.execute(
        'getFinancing',
        JSON.stringify({ projectId: PROJECT_ID }),
        USER_ID,
      );
      const parsed = JSON.parse(result);
      expect(parsed.costStructure).toEqual({ fixed_costs: '10000', variable_costs: '500 per unit' });
      expect(parsed.fundingAssessment).toEqual({ strategie_levee_fonds: 'Seed round' });
    });
  });

  describe('getImpact', () => {
    it('returns impact data', async () => {
      const result = await registry.execute(
        'getImpact',
        JSON.stringify({ projectId: PROJECT_ID }),
        USER_ID,
      );
      const parsed = JSON.parse(result);
      expect(parsed.impactMeasure).toEqual({ methode_mesure: 'LCA methodology' });
      expect(parsed.indicator).toEqual({ environmental_kpis: 'CO2 avoided' });
    });
  });

  describe('getEcoDesign', () => {
    it('returns eco design data', async () => {
      const result = await registry.execute(
        'getEcoDesign',
        JSON.stringify({ projectId: PROJECT_ID }),
        USER_ID,
      );
      const parsed = JSON.parse(result);
      expect(parsed.ecoDesign).toEqual({ projet_eco: 'Low-carbon solar design' });
      expect(parsed.ecoDesignResult).toEqual({ eco_results: '30% emission reduction' });
    });
  });

  describe('detectInconsistencies', () => {
    it('returns inconsistency check results', async () => {
      const result = await registry.execute(
        'detectInconsistencies',
        JSON.stringify({ projectId: PROJECT_ID }),
        USER_ID,
      );
      const parsed = JSON.parse(result);
      expect(parsed.score).toBe(75);
      expect(parsed.totalChecks).toBe(10);
      expect(parsed.passedChecks).toBe(8);
      expect(parsed.inconsistencies).toHaveLength(1);
      expect(parsed.inconsistencies[0].severity).toBe('HIGH');
    });
  });

  describe('calculateHealthScore', () => {
    it('returns health diagnostic', async () => {
      const result = await registry.execute(
        'calculateHealthScore',
        JSON.stringify({ projectId: PROJECT_ID }),
        USER_ID,
      );
      const parsed = JSON.parse(result);
      expect(parsed.overall).toBe(62);
      expect(parsed.completenessScore).toBe(70);
      expect(parsed.progressScore).toBe(55);
      expect(parsed.coherenceScore).toBe(60);
      expect(parsed.maturityScore).toBe(50);
      expect(parsed.strengths).toContain('Good mission');
      expect(parsed.weakAreas).toContain('Financial plan');
    });
  });

  describe('getNextBestAction', () => {
    it('returns next best action with priorities', async () => {
      const result = await registry.execute(
        'getNextBestAction',
        JSON.stringify({ projectId: PROJECT_ID }),
        USER_ID,
      );
      const parsed = JSON.parse(result);
      expect(parsed.recommendedNextAction).toBe('Complete the financial plan section');
      expect(parsed.currentPriority.level).toBe('HIGH');
      expect(parsed.priorities).toHaveLength(1);
      expect(parsed.incompleteSteps).toHaveLength(1);
    });
  });

  describe('isolation: userId never exposed to LLM', () => {
    it('handler is called with userId from server, not from args', async () => {
      await registry.execute(
        'getProjectState',
        JSON.stringify({ projectId: PROJECT_ID }),
        'real-user-id',
      );

      expect(accessMock.assertCanAccessProject).toHaveBeenCalledWith(PROJECT_ID, 'real-user-id');
    });
  });
});
