import { ProjectAnalyzer } from './project-analyzer.service';

function emptyProject() {
  return {
    step_progresses: [],
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
    business_plan_status: null,
  };
}

describe('ProjectAnalyzer', () => {
  let analyzer: ProjectAnalyzer;

  beforeEach(() => {
    analyzer = new ProjectAnalyzer();
  });

  describe('analyzeCompleteness', () => {
    it('projet vide : 0% GBM, 0% BP', () => {
      const project = emptyProject();
      const result = analyzer.analyzeCompleteness(project as any);
      expect(result.gbm.completed).toBe(0);
      expect(result.gbm.total).toBe(24);
      expect(result.gbm.percentage).toBe(0);
      expect(result.businessPlan.completed).toBe(0);
      expect(result.businessPlan.percentage).toBe(0);
    });

    it('étape gbm_1 complétée avec données : gbm_1 dans completedSteps', () => {
      const project = emptyProject();
      project.step_progresses = [{ step_key: 'gbm_1', status: 'COMPLETED' }];
      project.idea_sketch = { idea_initial: 'Mon idée', product_service: 'Un produit' };
      const result = analyzer.analyzeCompleteness(project as any);
      expect(result.gbm.completed).toBe(1);
      const gbm1 = result.gbm.steps.find((s) => s.stepKey === 'gbm_1');
      expect(gbm1?.status).toBe('COMPLETED');
      expect(gbm1?.hasData).toBe(true);
    });

    it('étape gbm_1 marquée COMPLETED mais sans données : hasData = false', () => {
      const project = emptyProject();
      project.step_progresses = [{ step_key: 'gbm_1', status: 'COMPLETED' }];
      const result = analyzer.analyzeCompleteness(project as any);
      const gbm1 = result.gbm.steps.find((s) => s.stepKey === 'gbm_1');
      expect(gbm1?.status).toBe('COMPLETED');
      expect(gbm1?.hasData).toBe(false);
    });

    it('BP : management_plan + financial_plan présents = 2/6 sections', () => {
      const project = emptyProject();
      project.management_plan = { ressources_humaines: 'RH' };
      project.financial_plan = { point_depart: '50k' };
      const result = analyzer.analyzeCompleteness(project as any);
      expect(result.businessPlan.completed).toBe(2);
      expect(result.businessPlan.sections).toContain('management_plan');
      expect(result.businessPlan.sections).toContain('financial_plan');
    });
  });

  describe('analyzeProgress', () => {
    it('aucune étape : 0%', () => {
      const result = analyzer.analyzeProgress({ step_progresses: [] });
      expect(result.overallPercentage).toBe(0);
      expect(result.gbmPercentage).toBe(0);
      expect(result.completedCount).toBe(0);
    });

    it('8 étapes GBM sur 24 complétées (gbm_1..gbm_9) : calcule le bon pourcentage', () => {
      const keys = ['gbm_1','gbm_2','gbm_3','gbm_4','gbm_5','gbm_6','gbm_7a','gbm_7b'];
      const steps = keys.map((k) => ({ step_key: k, status: 'COMPLETED' }));
      const result = analyzer.analyzeProgress({ step_progresses: steps });
      expect(result.gbmPercentage).toBe(Math.round((8 / 24) * 100));
      expect(result.completedCount).toBe(8);
    });

    it('compte correctement les étapes IN_PROGRESS (non COMPLETED)', () => {
      const steps = [
        { step_key: 'gbm_1', status: 'COMPLETED' },
        { step_key: 'gbm_2', status: 'IN_PROGRESS' },
        { step_key: 'gbm_3', status: 'NOT_STARTED' },
      ];
      const result = analyzer.analyzeProgress({ step_progresses: steps });
      expect(result.completedCount).toBe(1);
    });
  });

  describe('analyzeMaturity', () => {
    it('score < 20 → NOT_STARTED', () => {
      expect(analyzer.analyzeMaturity(15)).toBe('NOT_STARTED');
    });
    it('score 20-39 → INITIAL', () => {
      expect(analyzer.analyzeMaturity(25)).toBe('INITIAL');
    });
    it('score 40-59 → DEVELOPING', () => {
      expect(analyzer.analyzeMaturity(45)).toBe('DEVELOPING');
    });
    it('score 60-79 → MATURE', () => {
      expect(analyzer.analyzeMaturity(65)).toBe('MATURE');
    });
    it('score >= 80 → OPTIMIZED', () => {
      expect(analyzer.analyzeMaturity(85)).toBe('OPTIMIZED');
    });
    it('score 0 → NOT_STARTED', () => {
      expect(analyzer.analyzeMaturity(0)).toBe('NOT_STARTED');
    });
    it('score 100 → OPTIMIZED', () => {
      expect(analyzer.analyzeMaturity(100)).toBe('OPTIMIZED');
    });
  });

  describe('detectMissingData', () => {
    it('projet vide : beaucoup de données manquantes', () => {
      const project = emptyProject();
      const missing = analyzer.detectMissingData(project as any);
      expect(missing.length).toBeGreaterThan(5);
      expect(missing.some((m) => m.includes('gbm_1'))).toBe(true);
      expect(missing.some((m) => m.includes('gbm_5'))).toBe(true);
    });

    it('projet complet : peu de données manquantes', () => {
      const project = emptyProject();
      project.idea_sketch = { idea_initial: 'Idée' };
      project.problems_needs = { customer_needs: 'Besoins' };
      project.pestel = { economic_what: 'Éco' };
      project.objective = { environmental_objectives: 'Obj' };
      project.mission_vision = { mission: 'Mission' };
      project.value_proposition = { products_services: 'Produit' };
      project.customer_segment = [{ segment_name: 'Segment 1' }];
      project.key_activities_resource = { key_activities: 'Act' };
      project.cost_structure = { fixed_costs: '1000' };
      project.revenue_stream = { revenue_sources: 'Revenus' };
      project.financial_plan = { point_depart: 'Plan' };
      project.legal_plan = { statut_juridique: 'SARL' };
      project.indicator = { environmental_kpis: 'KPI' };
      project.eco_design = { vision_durable: 'Vision' };
      project.impact_measure = { methode_mesure: 'Méthode' };
      project.market_access = { positionnement: 'Position' };
      project.swot_analysis = { strengths: 'Forces' };
      const missing = analyzer.detectMissingData(project as any);
      expect(missing.length).toBe(0);
    });
  });

  describe('detectInconsistencies', () => {
    it('aucune incohérence sur un projet vide', () => {
      const project = emptyProject();
      const issues = analyzer.detectInconsistencies(project as any);
      expect(issues).toEqual([]);
    });

    it('gbm_1 COMPLETED mais idea_sketch vide → incohérence HIGH', () => {
      const project = emptyProject();
      project.step_progresses = [{ step_key: 'gbm_1', status: 'COMPLETED' }];
      const issues = analyzer.detectInconsistencies(project as any);
      expect(issues.length).toBe(1);
      expect(issues[0].severity).toBe('HIGH');
      expect(issues[0].area).toBe('GBM');
    });

    it('SWOT forces sans faiblesses → incohérence MEDIUM', () => {
      const project = emptyProject();
      project.swot_analysis = { strengths: 'Forces', weaknesses: null, opportunities: null, threats: null };
      const issues = analyzer.detectInconsistencies(project as any);
      expect(issues.some((i) => i.description.includes('faiblesses'))).toBe(true);
    });

    it('coûts définis mais revenus absents → incohérence MEDIUM', () => {
      const project = emptyProject();
      project.cost_structure = { fixed_costs: '1000' };
      project.revenue_stream = null;
      const issues = analyzer.detectInconsistencies(project as any);
      expect(issues.some((i) => i.description.includes('revenus'))).toBe(true);
    });

    it('BP FINAL mais plan financier absent → incohérence HIGH', () => {
      const project = emptyProject();
      project.business_plan_status = 'FINAL';
      project.financial_plan = null;
      const issues = analyzer.detectInconsistencies(project as any);
      expect(issues.some((i) => i.severity === 'HIGH' && i.area === 'Business Plan')).toBe(true);
    });
  });

  describe('calculateHealthScore', () => {
    it('tous les axes à 100 → overall ~100', () => {
      const score = analyzer.calculateHealthScore({
        progressPercentage: 100,
        maturityScore: 100,
        swotBalance: 1,
        coachingEngagement: 1,
        consistencyPenalty: 0,
      });
      expect(score.overall).toBe(100);
      expect(score.categories).toHaveLength(5);
    });

    it('tous les axes à 0 → overall 0', () => {
      const score = analyzer.calculateHealthScore({
        progressPercentage: 0,
        maturityScore: 0,
        swotBalance: 0,
        coachingEngagement: 0,
        consistencyPenalty: 100,
      });
      expect(score.overall).toBe(0);
    });

    it('pénalité de cohérence réduit le score', () => {
      const base = analyzer.calculateHealthScore({
        progressPercentage: 50,
        maturityScore: 50,
        swotBalance: 0.5,
        coachingEngagement: 0.5,
        consistencyPenalty: 0,
      });
      const penalized = analyzer.calculateHealthScore({
        progressPercentage: 50,
        maturityScore: 50,
        swotBalance: 0.5,
        coachingEngagement: 0.5,
        consistencyPenalty: 60,
      });
      expect(penalized.overall).toBeLessThan(base.overall);
    });
  });

  describe('calculatePriorities', () => {
    it('aucune donnée manquante et bonne progression → priorité basse ou aucune', () => {
      const priorities = analyzer.calculatePriorities({
        missingData: [],
        inconsistencies: [],
        progressPercentage: 80,
        maturityScore: 70,
        hasCoachingActions: true,
        hasEvaluations: true,
      });
      expect(priorities.every((p) => p.level !== 'CRITICAL')).toBe(true);
    });

    it('beaucoup de données manquantes → priorité HIGH', () => {
      const priorities = analyzer.calculatePriorities({
        missingData: Array.from({ length: 10 }, (_, i) => `item ${i}`),
        inconsistencies: [],
        progressPercentage: 10,
        maturityScore: 5,
        hasCoachingActions: false,
        hasEvaluations: false,
      });
      expect(priorities.some((p) => p.level === 'HIGH')).toBe(true);
    });

    it('incohérences HIGH → dans les priorités', () => {
      const priorities = analyzer.calculatePriorities({
        missingData: [],
        inconsistencies: [
          { area: 'test', description: 'issue', severity: 'HIGH' },
        ],
        progressPercentage: 50,
        maturityScore: 50,
        hasCoachingActions: true,
        hasEvaluations: true,
      });
      expect(priorities.some((p) => p.area === 'test')).toBe(true);
    });

    it('triées par impact décroissant', () => {
      const priorities = analyzer.calculatePriorities({
        missingData: ['a', 'b', 'c'],
        inconsistencies: [
          { area: 'x', description: 'x', severity: 'HIGH' },
          { area: 'y', description: 'y', severity: 'LOW' },
        ],
        progressPercentage: 20,
        maturityScore: 10,
        hasCoachingActions: false,
        hasEvaluations: false,
      });
      for (let i = 1; i < priorities.length; i++) {
        expect(priorities[i - 1].impact).toBeGreaterThanOrEqual(
          priorities[i].impact,
        );
      }
    });
  });
});
