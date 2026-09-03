import { ProjectHealthService } from './project-health.service';
import { ProjectAnalyzer } from './project-analyzer.service';
import { ConsistencyChecker } from './consistency-checker.service';
import { ConsistencyInput } from './consistency-checker.service';

function emptyConsistencyInput(): ConsistencyInput {
  return {
    step_progresses: [],
    idea_sketch: null,
    problems_needs: null,
    pestel: null,
    objective: null,
    mission_vision: null,
    value_proposition: null,
    customer_segment: [],
    key_activities_resource: null,
    cost_structure: null,
    revenue_stream: null,
    financial_plan: null,
    legal_plan: null,
    indicator: null,
    eco_design: null,
    eco_design_result: null,
    swot_analysis: null,
    market_access: null,
    impact_measure: null,
    funding_assessment: null,
    management_plan: null,
    marketing_plan: null,
    cost_revenue_summary: null,
    business_plan_status: null,
  };
}

describe('ProjectHealthService', () => {
  let service: ProjectHealthService;
  let analyzer: ProjectAnalyzer;
  let checker: ConsistencyChecker;

  beforeEach(() => {
    analyzer = new ProjectAnalyzer();
    checker = new ConsistencyChecker();
    service = new ProjectHealthService(analyzer, checker);
  });

  describe('Projet vide', () => {
    it('score très faible, weakAreas non vide', () => {
      const result = service.diagnose({
        completeness: {
          gbm: { percentage: 0, completed: 0, total: 24 },
          businessPlan: { percentage: 0, completed: 0, total: 6 },
          transversal: {},
        },
        progress: {
          overallPercentage: 0,
          gbmPercentage: 0,
          bpPercentage: 0,
        },
        maturityScore: 0,
        consistencyInput: emptyConsistencyInput(),
        coachingEngagement: 0,
        strengths: [],
        weakAreas: [],
      });

      expect(result.score).toBe(25);
      expect(result.completenessScore).toBe(0);
      expect(result.progressScore).toBe(0);
      expect(result.coherenceScore).toBe(100);
      expect(result.maturityScore).toBe(0);
      expect(result.weakAreas.length).toBeGreaterThan(0);
    });
  });

  describe('Projet "Bien-être durable" — projet sain', () => {
    it('score élevé, strengths multiples', () => {
      const ci = emptyConsistencyInput();
      ci.step_progresses = [
        { step_key: 'gbm_1', status: 'COMPLETED' },
        { step_key: 'gbm_2', status: 'COMPLETED' },
        { step_key: 'gbm_5', status: 'COMPLETED' },
        { step_key: 'gbm_9', status: 'COMPLETED' },
        { step_key: 'gbm_16', status: 'COMPLETED' },
        { step_key: 'gbm_21', status: 'COMPLETED' },
      ];
      ci.idea_sketch = { idea_initial: 'Bien-être' };
      ci.mission_vision = { mission: 'Mission' };
      ci.value_proposition = {
        products_services: 'Ateliers',
        value_added: 'Valeur ajoutée',
      };
      ci.customer_segment = [{ segment_name: 'PME' }];
      ci.cost_structure = { fixed_costs: '10000' };
      ci.revenue_stream = { revenue_sources: 'Abonnement', pricing_strategy: '200€' };
      ci.financial_plan = { point_depart: 'Apport' };
      ci.legal_plan = { statut_juridique: 'SAS' };
      ci.swot_analysis = {
        strengths: 'Expert',
        weaknesses: 'Petite équipe',
        opportunities: 'Marché en croissance',
        threats: 'Concurrence',
      };
      ci.management_plan = { problemes_gestion: 'Externalisée' };
      ci.marketing_plan = { analyse_marche: 'Marché IDF' };
      ci.indicator = { environmental_kpis: 'CO2' };
      ci.impact_measure = { methode_mesure: 'Enquêtes' };
      ci.market_access = { positionnement: 'Premium' };
      ci.cost_revenue_summary = { cost_summary: 'Synthèse' };

      const result = service.diagnose({
        completeness: {
          gbm: { percentage: 75, completed: 18, total: 24 },
          businessPlan: { percentage: 80, completed: 5, total: 6 },
          transversal: {
            funding_assessment: true,
            market_access: true,
            impact_measure: true,
            swot_analysis: true,
            eco_design: true,
            eco_design_result: true,
          },
        },
        progress: {
          overallPercentage: 65,
          gbmPercentage: 75,
          bpPercentage: 80,
        },
        maturityScore: 70,
        consistencyInput: ci,
        coachingEngagement: 0.8,
        strengths: ['Mission définie', 'SWOT complet'],
        weakAreas: [],
      });

      expect(result.score).toBeGreaterThanOrEqual(60);
      expect(result.completenessScore).toBeGreaterThanOrEqual(60);
      expect(result.progressScore).toBe(65);
      expect(result.coherenceScore).toBe(100);
      expect(result.maturityScore).toBe(70);
      expect(result.strengths.length).toBeGreaterThan(0);
    });
  });

  describe('Projet "FoodTech" — incohérences', () => {
    it('coherenceScore pénalisé par les incohérences', () => {
      const ci = emptyConsistencyInput();
      ci.step_progresses = [
        { step_key: 'gbm_1', status: 'COMPLETED' },
        { step_key: 'gbm_5', status: 'COMPLETED' },
      ];
      ci.idea_sketch = { idea_initial: 'App' };
      ci.mission_vision = { mission: 'Mission' };
      ci.value_proposition = { products_services: 'App' };
      ci.swot_analysis = {
        strengths: 'Tech',
        weaknesses: '',
        opportunities: 'Marché',
        threats: '',
      };
      ci.cost_structure = { fixed_costs: '30000' };
      ci.revenue_stream = null;

      const result = service.diagnose({
        completeness: {
          gbm: { percentage: 30, completed: 7, total: 24 },
          businessPlan: { percentage: 0, completed: 0, total: 6 },
          transversal: {},
        },
        progress: {
          overallPercentage: 25,
          gbmPercentage: 30,
          bpPercentage: 0,
        },
        maturityScore: 25,
        consistencyInput: ci,
        coachingEngagement: 0.3,
        strengths: [],
        weakAreas: [],
      });

      expect(result.coherenceScore).toBeLessThan(100);
      expect(result.score).toBeLessThan(50);
      expect(result.weakAreas.length).toBeGreaterThan(0);
    });
  });

  describe('Projet "EcoBuild" — BP FINAL incomplet', () => {
    it('coherenceScore très pénalisé', () => {
      const ci = emptyConsistencyInput();
      ci.business_plan_status = 'FINAL';
      ci.financial_plan = null;
      ci.management_plan = null;
      ci.marketing_plan = null;
      ci.legal_plan = null;

      const result = service.diagnose({
        completeness: {
          gbm: { percentage: 50, completed: 12, total: 24 },
          businessPlan: { percentage: 0, completed: 0, total: 6 },
          transversal: {},
        },
        progress: {
          overallPercentage: 45,
          gbmPercentage: 50,
          bpPercentage: 0,
        },
        maturityScore: 40,
        consistencyInput: ci,
        coachingEngagement: 0.5,
        strengths: [],
        weakAreas: [],
      });

      expect(result.coherenceScore).toBeLessThan(80);
      expect(
        result.weakAreas.some((w) => w.includes('incohérence')),
      ).toBe(true);
    });
  });

  describe('Calcul du score global', () => {
    it('score = weighted sum des 4 composantes', () => {
      const result = service.diagnose({
        completeness: {
          gbm: { percentage: 80, completed: 19, total: 24 },
          businessPlan: { percentage: 60, completed: 4, total: 6 },
          transversal: { a: true, b: true },
        },
        progress: {
          overallPercentage: 70,
          gbmPercentage: 80,
          bpPercentage: 60,
        },
        maturityScore: 60,
        consistencyInput: emptyConsistencyInput(),
        coachingEngagement: 0.7,
        strengths: [],
        weakAreas: [],
      });

      const expectedCompleteness = Math.round(80 * 0.5 + 60 * 0.3 + 100 * 0.2);
      const expected = Math.round(
        expectedCompleteness * 0.3 +
          70 * 0.25 +
          100 * 0.25 +
          60 * 0.2,
      );
      expect(result.score).toBe(expected);
    });

    it('score est toujours entre 0 et 100', () => {
      const result = service.diagnose({
        completeness: {
          gbm: { percentage: 100, completed: 24, total: 24 },
          businessPlan: { percentage: 100, completed: 6, total: 6 },
          transversal: { a: true },
        },
        progress: {
          overallPercentage: 100,
          gbmPercentage: 100,
          bpPercentage: 100,
        },
        maturityScore: 100,
        consistencyInput: emptyConsistencyInput(),
        coachingEngagement: 1,
        strengths: [],
        weakAreas: [],
      });

      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.score).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Forces et faiblesses', () => {
    it('complétude >= 70 ajoute une force', () => {
      const result = service.diagnose({
        completeness: {
          gbm: { percentage: 90, completed: 22, total: 24 },
          businessPlan: { percentage: 80, completed: 5, total: 6 },
          transversal: {
            funding_assessment: true,
            market_access: true,
            impact_measure: true,
            swot_analysis: true,
            eco_design: true,
            eco_design_result: true,
          },
        },
        progress: {
          overallPercentage: 60,
          gbmPercentage: 75,
          bpPercentage: 50,
        },
        maturityScore: 50,
        consistencyInput: emptyConsistencyInput(),
        coachingEngagement: 0.5,
        strengths: [],
        weakAreas: [],
      });

      expect(
        result.strengths.some((s) => s.includes('Complétude')),
      ).toBe(true);
    });

    it('complétude < 40 ajoute une faiblesse', () => {
      const result = service.diagnose({
        completeness: {
          gbm: { percentage: 20, completed: 5, total: 24 },
          businessPlan: { percentage: 0, completed: 0, total: 6 },
          transversal: {},
        },
        progress: {
          overallPercentage: 15,
          gbmPercentage: 20,
          bpPercentage: 0,
        },
        maturityScore: 10,
        consistencyInput: emptyConsistencyInput(),
        coachingEngagement: 0,
        strengths: [],
        weakAreas: [],
      });

      expect(
        result.weakAreas.some((w) => w.includes('Complétude')),
      ).toBe(true);
    });
  });
});
