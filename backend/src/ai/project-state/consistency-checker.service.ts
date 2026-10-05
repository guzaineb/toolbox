import { Injectable } from '@nestjs/common';
import {
  ConsistencyResult,
  Inconsistency,
  InconsistencySeverity,
} from './project-state.types';

type Model = Record<string, any> | null | undefined;
type ModelArray = Record<string, any>[] | undefined;

function nonEmpty(v: unknown): boolean {
  if (v === null || v === undefined) return false;
  if (typeof v === 'string') return v.trim().length > 0;
  if (typeof v === 'number') return true;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'object') return Object.keys(v).length > 0;
  return false;
}

function hasAnyField(record: Model, keys: string[]): boolean {
  if (!record || typeof record !== 'object') return false;
  return keys.some((k) => nonEmpty(record[k]));
}

function nonEmptyCount(items: ModelArray): number {
  if (!items || items.length === 0) return 0;
  return items.length;
}

const SEVERITY_WEIGHT: Record<InconsistencySeverity, number> = {
  CRITICAL: 30,
  HIGH: 20,
  MEDIUM: 10,
  LOW: 5,
};

export type ConsistencyInput = {
  step_progresses: { step_key: string; status: string }[];
  idea_sketch: Model;
  problems_needs: Model;
  pestel: Model;
  objective: Model;
  mission_vision: Model;
  value_proposition: Model;
  customer_segment: ModelArray;
  key_activities_resource: Model;
  cost_structure: Model;
  revenue_stream: Model;
  financial_plan: Model;
  legal_plan: Model;
  indicator: Model;
  eco_design: Model;
  eco_design_result: Model;
  swot_analysis: Model;
  market_access: Model;
  impact_measure: Model;
  funding_assessment: Model;
  management_plan: Model;
  marketing_plan: Model;
  cost_revenue_summary: Model;
  business_plan_status: string | null;
};

@Injectable()
export class ConsistencyChecker {
  check(project: ConsistencyInput): ConsistencyResult {
    const issues: Inconsistency[] = [];
    const stepMap = new Map(
      project.step_progresses.map((sp) => [sp.step_key, sp.status]),
    );
    const stepDone = (key: string) => stepMap.get(key) === 'COMPLETED';

    this.checkStepDataConsistency(project, stepDone, issues);
    this.checkSwotConsistency(project, issues);
    this.checkEcoDesignConsistency(project, issues);
    this.checkFinancialConsistency(project, stepDone, issues);
    this.checkMissionValueConsistency(project, issues);
    this.checkCustomerConsistency(project, stepDone, issues);
    this.checkBusinessPlanConsistency(project, issues);
    this.checkMarketConsistency(project, issues);
    this.checkImpactConsistency(project, issues);
    this.checkFundingConsistency(project, issues);
    this.checkBPFieldsConsistency(project, issues);

    const totalChecks = 24;
    const passedChecks = totalChecks - issues.length;
    const penalty = issues.reduce(
      (sum, inc) => sum + SEVERITY_WEIGHT[inc.severity],
      0,
    );
    const score = Math.max(0, Math.min(100, 100 - penalty));

    return { inconsistencies: issues, score, totalChecks, passedChecks };
  }

  private checkStepDataConsistency(
    p: ConsistencyInput,
    stepDone: (k: string) => boolean,
    issues: Inconsistency[],
  ): void {
    if (stepDone('gbm_1') && !nonEmpty(p.idea_sketch?.idea_initial)) {
      issues.push({
        area: 'GBM',
        description: "Étape gbm_1 marquée complétée mais l'idée initiale est vide",
        severity: 'HIGH',
      });
    }
    if (stepDone('gbm_5') && !nonEmpty(p.mission_vision?.mission)) {
      issues.push({
        area: 'GBM',
        description: 'Étape gbm_5 marquée complétée mais la mission est vide',
        severity: 'HIGH',
      });
    }
    if (
      stepDone('gbm_16') &&
      !hasAnyField(p.cost_structure, ['fixed_costs', 'variable_costs'])
    ) {
      issues.push({
        area: 'Finances',
        description: 'Étape gbm_16 marquée complétée mais structure des coûts vide',
        severity: 'HIGH',
      });
    }
  }

  private checkSwotConsistency(
    p: ConsistencyInput,
    issues: Inconsistency[],
  ): void {
    const swot = p.swot_analysis;
    if (!swot) return;

    if (nonEmpty(swot.strengths) && !nonEmpty(swot.weaknesses)) {
      issues.push({
        area: 'SWOT',
        description: 'SWOT : forces renseignées mais faiblesses absentes',
        severity: 'MEDIUM',
      });
    }
    if (nonEmpty(swot.weaknesses) && !nonEmpty(swot.strengths)) {
      issues.push({
        area: 'SWOT',
        description: 'SWOT : faiblesses renseignées mais forces absentes',
        severity: 'MEDIUM',
      });
    }
    if (nonEmpty(swot.opportunities) && !nonEmpty(swot.threats)) {
      issues.push({
        area: 'SWOT',
        description: 'SWOT : opportunités renseignées mais menaces absentes',
        severity: 'MEDIUM',
      });
    }
    if (nonEmpty(swot.threats) && !nonEmpty(swot.opportunities)) {
      issues.push({
        area: 'SWOT',
        description: 'SWOT : menaces renseignées mais opportunités absentes',
        severity: 'MEDIUM',
      });
    }
  }

  private checkEcoDesignConsistency(
    p: ConsistencyInput,
    issues: Inconsistency[],
  ): void {
    if (nonEmpty(p.eco_design) && !nonEmpty(p.eco_design_result)) {
      issues.push({
        area: 'Éco-conception',
        description: 'Éco-conception initialisée mais résultats absents',
        severity: 'LOW',
      });
    }
  }

  private checkFinancialConsistency(
    p: ConsistencyInput,
    stepDone: (k: string) => boolean,
    issues: Inconsistency[],
  ): void {
    if (nonEmpty(p.cost_structure) && !nonEmpty(p.revenue_stream)) {
      issues.push({
        area: 'Finances',
        description: 'Coûts définis mais flux de revenus absents',
        severity: 'MEDIUM',
      });
    }
    if (nonEmpty(p.revenue_stream) && !nonEmpty(p.cost_structure)) {
      issues.push({
        area: 'Finances',
        description: 'Revenus définis mais structure des coûts absente',
        severity: 'MEDIUM',
      });
    }
    if (
      p.business_plan_status === 'FINAL' &&
      !nonEmpty(p.financial_plan?.point_depart)
    ) {
      issues.push({
        area: 'Business Plan',
        description: 'Business Plan marqué FINAL mais plan financier absent',
        severity: 'CRITICAL',
      });
    }
    if (
      p.business_plan_status === 'FINAL' &&
      !nonEmpty(p.management_plan?.problemes_gestion)
    ) {
      issues.push({
        area: 'Business Plan',
        description: 'Business Plan marqué FINAL mais plan de gestion absent',
        severity: 'HIGH',
      });
    }
    if (
      p.business_plan_status === 'FINAL' &&
      !nonEmpty(p.marketing_plan?.analyse_marche)
    ) {
      issues.push({
        area: 'Business Plan',
        description: 'Business Plan marqué FINAL mais plan marketing absent',
        severity: 'HIGH',
      });
    }
  }

  private checkMissionValueConsistency(
    p: ConsistencyInput,
    issues: Inconsistency[],
  ): void {
    if (
      !nonEmpty(p.mission_vision?.mission) &&
      nonEmpty(p.value_proposition?.value_added)
    ) {
      issues.push({
        area: 'Cohérence',
        description: 'Proposition de valeur définie mais mission non formulée',
        severity: 'MEDIUM',
      });
    }
    if (
      nonEmpty(p.mission_vision?.mission) &&
      !nonEmpty(p.value_proposition?.products_services) &&
      !nonEmpty(p.value_proposition?.value_added)
    ) {
      issues.push({
        area: 'Cohérence',
        description: 'Mission définie mais proposition de valeur absente',
        severity: 'MEDIUM',
      });
    }
  }

  private checkCustomerConsistency(
    p: ConsistencyInput,
    stepDone: (k: string) => boolean,
    issues: Inconsistency[],
  ): void {
    const segmentsCount = nonEmptyCount(p.customer_segment);
    if (segmentsCount === 0 && stepDone('gbm_9')) {
      issues.push({
        area: 'Clients',
        description:
          'Proposition de valeur définie mais aucun segment client identifié',
        severity: 'HIGH',
      });
    }
  }

  private checkBusinessPlanConsistency(
    p: ConsistencyInput,
    issues: Inconsistency[],
  ): void {
    if (
      p.business_plan_status === 'FINAL' &&
      !nonEmpty(p.legal_plan?.statut_juridique)
    ) {
      issues.push({
        area: 'Business Plan',
        description: 'Business Plan marqué FINAL mais statut juridique absent',
        severity: 'HIGH',
      });
    }
  }

  private checkMarketConsistency(
    p: ConsistencyInput,
    issues: Inconsistency[],
  ): void {
    if (
      nonEmpty(p.marketing_plan?.analyse_marche) &&
      !nonEmpty(p.market_access?.positionnement)
    ) {
      issues.push({
        area: 'Marché',
        description:
          'Analyse marché dans BP mais positionnement marché non défini',
        severity: 'MEDIUM',
      });
    }
    if (
      nonEmpty(p.market_access?.positionnement) &&
      !nonEmpty(p.marketing_plan?.analyse_marche)
    ) {
      issues.push({
        area: 'Marché',
        description:
          'Positionnement marché défini mais analyse marché absente du BP',
        severity: 'MEDIUM',
      });
    }
  }

  private checkImpactConsistency(
    p: ConsistencyInput,
    issues: Inconsistency[],
  ): void {
    if (
      nonEmpty(p.impact_measure?.methode_mesure) &&
      !hasAnyField(p.indicator, [
        'environmental_kpis',
        'social_kpis',
        'economic_kpis',
      ])
    ) {
      issues.push({
        area: 'Impact',
        description:
          "Méthode de mesure d'impact définie mais indicateurs KPI absents",
        severity: 'MEDIUM',
      });
    }
    if (
      hasAnyField(p.indicator, [
        'environmental_kpis',
        'social_kpis',
        'economic_kpis',
      ]) &&
      !nonEmpty(p.impact_measure?.methode_mesure)
    ) {
      issues.push({
        area: 'Impact',
        description:
          'Indicateurs KPI définis mais méthode de mesure absente',
        severity: 'MEDIUM',
      });
    }
  }

  private checkFundingConsistency(
    p: ConsistencyInput,
    issues: Inconsistency[],
  ): void {
    const funding = p.funding_assessment;
    if (
      nonEmpty(funding?.strategie_levee_fonds) &&
      !nonEmpty(p.financial_plan?.point_depart)
    ) {
      issues.push({
        area: 'Financement',
        description:
          'Stratégie de levée de fonds définie mais plan financier absent',
        severity: 'HIGH',
      });
    }
    if (
      nonEmpty(funding?.strategie_levee_fonds) &&
      !hasAnyField(p.cost_structure, ['fixed_costs', 'variable_costs'])
    ) {
      issues.push({
        area: 'Financement',
        description:
          'Stratégie de levée de fonds définie mais besoins financiers non quantifiés',
        severity: 'HIGH',
      });
    }
  }

  private checkBPFieldsConsistency(
    p: ConsistencyInput,
    issues: Inconsistency[],
  ): void {
    if (
      nonEmpty(p.marketing_plan?.offre_prix) &&
      !nonEmpty(p.revenue_stream?.pricing_strategy)
    ) {
      issues.push({
        area: 'Cohérence',
        description:
          'Offre et prix dans BP mais stratégie de tarification absente',
        severity: 'LOW',
      });
    }
    if (
      nonEmpty(p.cost_structure?.fixed_costs) &&
      nonEmpty(p.revenue_stream?.revenue_sources) &&
      !nonEmpty(p.cost_revenue_summary?.cost_summary)
    ) {
      issues.push({
        area: 'Cohérence',
        description:
          'Coûts et revenus définis mais synthèse coûts/revenus absente',
        severity: 'LOW',
      });
    }
  }
}
