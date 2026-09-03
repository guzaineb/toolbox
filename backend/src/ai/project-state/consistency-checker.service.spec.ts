import { ConsistencyChecker, ConsistencyInput } from './consistency-checker.service';

function emptyProject(): ConsistencyInput {
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

describe('ConsistencyChecker', () => {
  let checker: ConsistencyChecker;

  beforeEach(() => {
    checker = new ConsistencyChecker();
  });

  describe('projet vide', () => {
    it('aucune incohérence sur projet vide', () => {
      const result = checker.check(emptyProject());
      expect(result.inconsistencies).toHaveLength(0);
      expect(result.score).toBe(100);
      expect(result.totalChecks).toBe(24);
      expect(result.passedChecks).toBe(24);
    });
  });

  describe('Projet "Bien-être durable" — projet sain', () => {
    it('pas d\'incohérence si toutes les données sont cohérentes', () => {
      const p = emptyProject();
      p.step_progresses = [
        { step_key: 'gbm_1', status: 'COMPLETED' },
        { step_key: 'gbm_5', status: 'COMPLETED' },
        { step_key: 'gbm_9', status: 'COMPLETED' },
        { step_key: 'gbm_16', status: 'COMPLETED' },
      ];
      p.idea_sketch = { idea_initial: 'Service de bien-être en entreprise' };
      p.mission_vision = { mission: 'Améliorer la santé mentale au travail' };
      p.value_proposition = {
        products_services: 'Ateliers de méditation',
        value_added: 'Réduction du stress de 30%',
      };
      p.customer_segment = [{ segment_name: 'PME tech' }];
      p.cost_structure = { fixed_costs: '10000', variable_costs: '500/mission' };
      p.revenue_stream = { revenue_sources: 'Abonnement', pricing_strategy: '200€/mois' };
      p.financial_plan = { point_depart: 'Apport personnel 20k€' };
      p.legal_plan = { statut_juridique: 'SAS' };
      p.swot_analysis = {
        strengths: 'Expert reconnu',
        weaknesses: 'Équipe petite',
        opportunities: 'Marché en croissance',
        threats: 'Concurrence croissante',
      };
      p.management_plan = { problemes_gestion: 'GestionRH externalisée' };
      p.marketing_plan = { analyse_marche: 'Marché PME Île-de-France' };
      p.indicator = { environmental_kpis: 'Empreinte carbone' };
      p.impact_measure = { methode_mesure: 'Enquêtes trimestrielles' };
      p.market_access = { positionnement: 'Premium bien-être' };
      p.cost_revenue_summary = { cost_summary: 'Synthèse coûts/revenus' };

      const result = checker.check(p);
      expect(result.inconsistencies).toHaveLength(0);
      expect(result.score).toBe(100);
    });
  });

  describe('Projet "FoodTech" — incohérences multiples', () => {
    let p: ConsistencyInput;

    beforeEach(() => {
      p = emptyProject();
      p.step_progresses = [
        { step_key: 'gbm_1', status: 'COMPLETED' },
        { step_key: 'gbm_5', status: 'COMPLETED' },
        { step_key: 'gbm_9', status: 'COMPLETED' },
        { step_key: 'gbm_16', status: 'COMPLETED' },
      ];
      p.idea_sketch = { idea_initial: 'App livraison végétal' };
      p.mission_vision = { mission: 'Démocratiser la nourriture saine' };
      p.value_proposition = { products_services: 'App mobile' };
      p.customer_segment = [{ segment_name: 'Étudiants' }];
      p.cost_structure = { fixed_costs: '30000' };
      p.revenue_stream = { revenue_sources: 'Commission 15%' };
      p.financial_plan = { point_depart: 'Subvention BPI' };
      p.legal_plan = { statut_juridique: 'SAS' };
      p.management_plan = { problemes_gestion: 'DAF à recruter' };
      p.marketing_plan = { analyse_marche: 'Marché restitution' };
      p.indicator = { environmental_kpis: 'Empreinte food' };
      p.impact_measure = { methode_mesure: 'Calcul carbone' };
      p.market_access = { positionnement: 'Accessible' };
      p.swot_analysis = {
        strengths: 'Techpropriétaire',
        weaknesses: '',
        opportunities: 'Végétalisme en hausse',
        threats: '',
      };
    });

    it('SWOT incomplet (faiblesses + menaces absentes)', () => {
      const result = checker.check(p);
      const swotIssues = result.inconsistencies.filter((i) => i.area === 'SWOT');
      expect(swotIssues.length).toBeGreaterThanOrEqual(2);
      expect(swotIssues.every((i) => i.severity === 'MEDIUM')).toBe(true);
    });

    it('coût défini sans revenus → MEDIUM', () => {
      p.revenue_stream = null;
      const result = checker.check(p);
      const finIssues = result.inconsistencies.filter(
        (i) => i.description.includes('revenus absents'),
      );
      expect(finIssues).toHaveLength(1);
      expect(finIssues[0].severity).toBe('MEDIUM');
    });

    it('mission définie mais proposition de valeur absente', () => {
      p.value_proposition = { products_services: '', value_added: '' };
      const result = checker.check(p);
      const cohIssues = result.inconsistencies.filter(
        (i) => i.description.includes('proposition de valeur absente'),
      );
      expect(cohIssues).toHaveLength(1);
      expect(cohIssues[0].severity).toBe('MEDIUM');
    });
  });

  describe('Projet "EcoBuild" — Business Plan FINAL incomplet', () => {
    it('BP FINAL sans plan financier → CRITICAL', () => {
      const p = emptyProject();
      p.business_plan_status = 'FINAL';
      p.financial_plan = null;
      p.management_plan = null;
      p.marketing_plan = null;
      p.legal_plan = null;

      const result = checker.check(p);
      const bpIssues = result.inconsistencies.filter(
        (i) => i.area === 'Business Plan',
      );
      expect(bpIssues.length).toBeGreaterThanOrEqual(1);
      expect(bpIssues.some((i) => i.severity === 'CRITICAL')).toBe(true);
    });

    it('BP FINAL sans plan de gestion → HIGH', () => {
      const p = emptyProject();
      p.business_plan_status = 'FINAL';
      p.financial_plan = { point_depart: 'OK' };
      p.management_plan = null;
      p.marketing_plan = { analyse_marche: 'OK' };
      p.legal_plan = { statut_juridique: 'SARL' };

      const result = checker.check(p);
      const mgmtIssue = result.inconsistencies.find(
        (i) => i.description.includes('plan de gestion absent'),
      );
      expect(mgmtIssue).toBeDefined();
      expect(mgmtIssue!.severity).toBe('HIGH');
    });
  });

  describe('Projet "FinAccess" — financement sans base', () => {
    it('stratégie levée de fonds sans plan financier → HIGH', () => {
      const p = emptyProject();
      p.funding_assessment = {
        strategie_levee_fonds: 'Seed 500k€',
      };
      p.financial_plan = null;

      const result = checker.check(p);
      const fundIssues = result.inconsistencies.filter(
        (i) => i.area === 'Financement',
      );
      expect(fundIssues.length).toBeGreaterThanOrEqual(1);
      expect(fundIssues.some((i) => i.severity === 'HIGH')).toBe(true);
    });

    it('stratégie levée de fonds sans coûts quantifiés → HIGH', () => {
      const p = emptyProject();
      p.funding_assessment = {
        strategie_levee_fonds: 'Série A 2M€',
      };
      p.cost_structure = null;
      p.financial_plan = { point_depart: 'OK' };

      const result = checker.check(p);
      const fundIssues = result.inconsistencies.filter(
        (i) => i.description.includes('besoins financiers non quantifiés'),
      );
      expect(fundIssues).toHaveLength(1);
      expect(fundIssues[0].severity).toBe('HIGH');
    });
  });

  describe('Projet "ImpactSanté" — impact sans indicateurs', () => {
    it('méthode mesure définie mais KPI absents → MEDIUM', () => {
      const p = emptyProject();
      p.impact_measure = { methode_mesure: 'Enquêtes' };
      p.indicator = null;

      const result = checker.check(p);
      const impactIssues = result.inconsistencies.filter(
        (i) => i.area === 'Impact',
      );
      expect(impactIssues).toHaveLength(1);
      expect(impactIssues[0].severity).toBe('MEDIUM');
    });

    it('KPI définis mais méthode mesure absente → MEDIUM', () => {
      const p = emptyProject();
      p.impact_measure = null;
      p.indicator = { environmental_kpis: 'CO2' };

      const result = checker.check(p);
      const impactIssues = result.inconsistencies.filter(
        (i) => i.description.includes('méthode de mesure absente'),
      );
      expect(impactIssues).toHaveLength(1);
      expect(impactIssues[0].severity).toBe('MEDIUM');
    });
  });

  describe('Projet "MarchéTech" — marché incohérent', () => {
    it('analyse marché BP mais positionnement absent → MEDIUM', () => {
      const p = emptyProject();
      p.marketing_plan = { analyse_marche: 'Marché PME' };
      p.market_access = null;

      const result = checker.check(p);
      const mktIssues = result.inconsistencies.filter(
        (i) => i.area === 'Marché',
      );
      expect(mktIssues).toHaveLength(1);
      expect(mktIssues[0].severity).toBe('MEDIUM');
    });

    it('positionnement défini mais analyse marché absente → MEDIUM', () => {
      const p = emptyProject();
      p.marketing_plan = null;
      p.market_access = { positionnement: 'Premium' };

      const result = checker.check(p);
      const mktIssues = result.inconsistencies.filter(
        (i) => i.description.includes('analyse marché absente'),
      );
      expect(mktIssues).toHaveLength(1);
      expect(mktIssues[0].severity).toBe('MEDIUM');
    });
  });

  describe('Projet "GBM fantôme" — étape complétée sans données', () => {
    it('gbm_1 COMPLETED mais idée vide → HIGH', () => {
      const p = emptyProject();
      p.step_progresses = [{ step_key: 'gbm_1', status: 'COMPLETED' }];
      p.idea_sketch = null;

      const result = checker.check(p);
      expect(result.inconsistencies.some((i) => i.severity === 'HIGH')).toBe(
        true,
      );
    });

    it('gbm_5 COMPLETED mais mission vide → HIGH', () => {
      const p = emptyProject();
      p.step_progresses = [{ step_key: 'gbm_5', status: 'COMPLETED' }];
      p.mission_vision = null;

      const result = checker.check(p);
      expect(result.inconsistencies.some((i) => i.severity === 'HIGH')).toBe(
        true,
      );
    });

    it('gbm_16 COMPLETED mais coûts vides → HIGH', () => {
      const p = emptyProject();
      p.step_progresses = [{ step_key: 'gbm_16', status: 'COMPLETED' }];
      p.cost_structure = null;

      const result = checker.check(p);
      expect(result.inconsistencies.some((i) => i.severity === 'HIGH')).toBe(
        true,
      );
    });
  });

  describe('Projet "Proposition incomplète" — clients sans valeur', () => {
    it('gbm_9 COMPLETED mais aucun segment client → HIGH', () => {
      const p = emptyProject();
      p.step_progresses = [{ step_key: 'gbm_9', status: 'COMPLETED' }];
      p.value_proposition = { products_services: 'Produit' };
      p.customer_segment = [];

      const result = checker.check(p);
      const clientIssues = result.inconsistencies.filter(
        (i) => i.area === 'Clients',
      );
      expect(clientIssues).toHaveLength(1);
      expect(clientIssues[0].severity).toBe('HIGH');
    });
  });

  describe('Score de cohérence', () => {
    it('score diminue avec chaque incohérence', () => {
      const p1 = emptyProject();
      const r1 = checker.check(p1);

      const p2 = emptyProject();
      p2.step_progresses = [{ step_key: 'gbm_1', status: 'COMPLETED' }];
      const r2 = checker.check(p2);

      expect(r2.score).toBeLessThan(r1.score);
    });

    it('CRITICAL pénalise plus que HIGH', () => {
      const pCritical = emptyProject();
      pCritical.business_plan_status = 'FINAL';
      pCritical.financial_plan = null;
      const rc = checker.check(pCritical);

      const pHigh = emptyProject();
      pHigh.step_progresses = [{ step_key: 'gbm_1', status: 'COMPLETED' }];
      pHigh.idea_sketch = null;
      const rh = checker.check(pHigh);

      expect(rc.score).toBeLessThan(rh.score);
    });
  });

  describe('Projet "Cohérence parfaite" — tous les cross-checks passent', () => {
    it('aucune incohérence sur projet complet et cohérent', () => {
      const p = emptyProject();
      p.step_progresses = [
        { step_key: 'gbm_1', status: 'COMPLETED' },
        { step_key: 'gbm_5', status: 'COMPLETED' },
        { step_key: 'gbm_9', status: 'COMPLETED' },
        { step_key: 'gbm_16', status: 'COMPLETED' },
      ];
      p.business_plan_status = 'FINAL';
      p.idea_sketch = { idea_initial: 'Idée' };
      p.mission_vision = { mission: 'Mission' };
      p.value_proposition = {
        products_services: 'Produit',
        value_added: 'Valeur',
      };
      p.customer_segment = [{ segment_name: 'Segment' }];
      p.cost_structure = { fixed_costs: '1000' };
      p.revenue_stream = {
        revenue_sources: 'Revenus',
        pricing_strategy: 'Prix',
      };
      p.financial_plan = { point_depart: 'Plan' };
      p.management_plan = { problemes_gestion: 'Gestion' };
      p.marketing_plan = { analyse_marche: 'Marché' };
      p.legal_plan = { statut_juridique: 'SARL' };
      p.swot_analysis = {
        strengths: 'S',
        weaknesses: 'W',
        opportunities: 'O',
        threats: 'T',
      };
      p.eco_design = { vision_durable: 'Vision' };
      p.eco_design_result = { eco_results: 'Résultats' };
      p.indicator = { environmental_kpis: 'KPI' };
      p.impact_measure = { methode_mesure: 'Mesure' };
      p.market_access = { positionnement: 'Position' };
      p.cost_revenue_summary = { cost_summary: 'Synthèse' };

      const result = checker.check(p);
      expect(result.inconsistencies).toHaveLength(0);
      expect(result.score).toBe(100);
    });
  });
});
