import { Injectable } from '@nestjs/common';
import { GBM_STEPS } from '../../gbm/step-config';
import {
  CompletenessResult,
  HealthScore,
  Inconsistency,
  MaturityLevel,
  Priority,
  PriorityLevel,
  ProgressResult,
  StepInfo,
} from './project-state.types';

type OneToOneModel = Record<string, any> | null | undefined;
type OneToManyModel = Record<string, any>[] | undefined;

const BP_SECTIONS = [
  'management_plan',
  'marketing_plan',
  'financial_plan',
  'legal_plan',
  'kpi',
  'executive_summary',
] as const;

const TRANSVERSAL_AREAS = [
  'funding_assessment',
  'market_access',
  'impact_measure',
  'swot_analysis',
  'eco_design',
  'eco_design_result',
] as const;

function nonEmpty(v: unknown): boolean {
  if (v === null || v === undefined) return false;
  if (typeof v === 'string') return v.trim().length > 0;
  if (typeof v === 'number') return true;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'object') return Object.keys(v).length > 0;
  return false;
}

function hasAnyField(record: OneToOneModel, keys: string[]): boolean {
  if (!record || typeof record !== 'object') return false;
  return keys.some((k) => nonEmpty(record[k]));
}

function nonEmptyCount(items: OneToManyModel): number {
  if (!items || items.length === 0) return 0;
  return items.length;
}

@Injectable()
export class ProjectAnalyzer {
  analyzeCompleteness(project: {
    step_progresses: { step_key: string; status: string }[];
    idea_sketch: OneToOneModel;
    problems_needs: OneToOneModel;
    pestel: OneToOneModel;
    objective: OneToOneModel;
    mission_vision: OneToOneModel;
    context_summary: OneToOneModel;
    stakeholder: OneToManyModel;
    stakeholder_map: OneToManyModel;
    customer_segment: OneToManyModel;
    value_proposition: OneToOneModel;
    test_discovery: OneToManyModel;
    value_proposition_pivot: OneToOneModel;
    customer_relations_channel: OneToOneModel;
    customer_journey: OneToManyModel;
    key_activities_resource: OneToOneModel;
    eco_design: OneToOneModel;
    eco_design_result: OneToOneModel;
    summary_activity: OneToOneModel;
    cost_structure: OneToOneModel;
    revenue_stream: OneToOneModel;
    cost_revenue_summary: OneToOneModel;
    test_preparation: OneToOneModel;
    indicator: OneToOneModel;
    management_plan: OneToOneModel;
    marketing_plan: OneToOneModel;
    financial_plan: OneToOneModel;
    legal_plan: OneToOneModel;
    kpi: OneToOneModel;
    executive_summary: OneToOneModel;
    funding_assessment: OneToOneModel;
    market_access: OneToOneModel;
    impact_measure: OneToOneModel;
    swot_analysis: OneToOneModel;
  }): CompletenessResult {
    const stepMap = new Map(
      project.step_progresses.map((sp) => [sp.step_key, sp.status]),
    );

    const steps: StepInfo[] = GBM_STEPS.map((cfg) => {
      const status = stepMap.get(cfg.stepKey) || 'NOT_STARTED';
      const hasData = this.stepHasData(cfg.stepKey, project);
      return {
        stepKey: cfg.stepKey,
        title: cfg.title,
        phase: cfg.phase,
        status,
        hasData,
      };
    });

    const completed = steps.filter((s) => s.status === 'COMPLETED').length;
    const total = steps.length;

    const bpCompleted = BP_SECTIONS.filter((key) => nonEmpty(project[key])).length;

    const transversal: Record<string, boolean> = {};
    for (const key of TRANSVERSAL_AREAS) {
      transversal[key] = nonEmpty(project[key]);
    }

    return {
      gbm: {
        completed,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        steps,
      },
      businessPlan: {
        completed: bpCompleted,
        total: BP_SECTIONS.length,
        percentage:
          BP_SECTIONS.length > 0
            ? Math.round((bpCompleted / BP_SECTIONS.length) * 100)
            : 0,
        sections: BP_SECTIONS.filter((key) => nonEmpty(project[key])),
      },
      transversal,
    };
  }

  analyzeProgress(project: {
    step_progresses: { step_key: string; status: string }[];
  }): ProgressResult {
    const steps = project.step_progresses;
    const stepMap = new Map(steps.map((s) => [s.step_key, s.status]));
    const gbmKeys = GBM_STEPS.map((s) => s.stepKey);

    const gbmCompleted = gbmKeys.filter(
      (k) => stepMap.get(k) === 'COMPLETED',
    ).length;
    const bpCompleted = BP_SECTIONS.filter(
      (k) => stepMap.get(`bp_${k}`) === 'COMPLETED',
    ).length;
    const overallCompleted = steps.filter(
      (s) => s.status === 'COMPLETED',
    ).length;

    const modulePercentages: Record<string, number> = {};
    for (const phase of [1, 2, 3, 4, 5]) {
      const phaseSteps = GBM_STEPS.filter((s) => s.phase === phase);
      const phaseCompleted = phaseSteps.filter(
        (s) => stepMap.get(s.stepKey) === 'COMPLETED',
      ).length;
      modulePercentages[`phase_${phase}`] =
        phaseSteps.length > 0
          ? Math.round((phaseCompleted / phaseSteps.length) * 100)
          : 0;
    }

    const gbmPercentage =
      gbmKeys.length > 0
        ? Math.round((gbmCompleted / gbmKeys.length) * 100)
        : 0;
    const bpPercentage =
      BP_SECTIONS.length > 0
        ? Math.round((bpCompleted / BP_SECTIONS.length) * 100)
        : 0;
    const overallPercentage =
      steps.length > 0
        ? Math.round((overallCompleted / steps.length) * 100)
        : 0;

    return {
      overallPercentage,
      gbmPercentage,
      bpPercentage,
      modulePercentages,
      completedCount: overallCompleted,
      totalCount: steps.length,
    };
  }

  analyzeMaturity(maturityScore: number): MaturityLevel {
    if (maturityScore >= 80) return 'OPTIMIZED';
    if (maturityScore >= 60) return 'MATURE';
    if (maturityScore >= 40) return 'DEVELOPING';
    if (maturityScore >= 20) return 'INITIAL';
    return 'NOT_STARTED';
  }

  detectMissingData(project: {
    idea_sketch: OneToOneModel;
    problems_needs: OneToOneModel;
    pestel: OneToOneModel;
    objective: OneToOneModel;
    mission_vision: OneToOneModel;
    value_proposition: OneToOneModel;
    customer_segment: OneToManyModel;
    key_activities_resource: OneToOneModel;
    cost_structure: OneToOneModel;
    revenue_stream: OneToOneModel;
    financial_plan: OneToOneModel;
    legal_plan: OneToOneModel;
    indicator: OneToOneModel;
    eco_design: OneToOneModel;
    impact_measure: OneToOneModel;
    market_access: OneToOneModel;
    swot_analysis: OneToOneModel;
  }): string[] {
    const missing: string[] = [];

    if (!nonEmpty(project.idea_sketch?.idea_initial))
      missing.push("Idée initiale non définie (gbm_1)");
    if (!nonEmpty(project.problems_needs?.customer_needs))
      missing.push("Besoins clients non identifiés (gbm_2)");
    if (!nonEmpty(project.pestel?.political_what) && !nonEmpty(project.pestel?.economic_what) && !nonEmpty(project.pestel?.social_what) && !nonEmpty(project.pestel?.technological_what) && !nonEmpty(project.pestel?.environmental_what) && !nonEmpty(project.pestel?.legal_what))
      missing.push("Analyse PESTEL incomplète (gbm_3)");
    if (!nonEmpty(project.objective?.environmental_objectives) && !nonEmpty(project.objective?.social_objectives) && !nonEmpty(project.objective?.customer_objectives) && !nonEmpty(project.objective?.team_objectives))
      missing.push("Objectifs non fixés (gbm_4)");
    if (!nonEmpty(project.mission_vision?.mission))
      missing.push("Mission non définie (gbm_5)");
    if (!nonEmpty(project.value_proposition?.products_services))
      missing.push("Proposition de valeur incomplète (gbm_9)");
    if (nonEmptyCount(project.customer_segment) === 0)
      missing.push("Aucun segment client identifié (gbm_8)");
    if (!hasAnyField(project.key_activities_resource, [
      'key_activities', 'key_resources',
    ]))
      missing.push("Activités et ressources non définies (gbm_13)");
    if (!hasAnyField(project.cost_structure, ['fixed_costs', 'variable_costs']))
      missing.push("Structure des coûts non renseignée (gbm_16)");
    if (!hasAnyField(project.revenue_stream, [
      'revenue_sources', 'pricing_strategy',
    ]))
      missing.push("Flux de revenus non définis (gbm_17)");
    if (!nonEmpty(project.financial_plan?.point_depart))
      missing.push("Plan financier absent (bp_financial_plan)");
    if (!nonEmpty(project.legal_plan?.statut_juridique))
      missing.push("Statut juridique non défini (bp_legal_plan)");
    if (!hasAnyField(project.indicator, [
      'environmental_kpis', 'social_kpis', 'economic_kpis',
    ]))
      missing.push("Indicateurs KPIs non renseignés (gbm_20)");
    if (!nonEmpty(project.eco_design?.vision_durable))
      missing.push("Vision durable non définie (gbm_14a)");
    if (!nonEmpty(project.impact_measure?.methode_mesure))
      missing.push("Méthode de mesure d'impact non définie (impact)");
    if (!nonEmpty(project.market_access?.positionnement))
      missing.push("Positionnement marché non défini (market_access)");
    if (!nonEmpty(project.swot_analysis?.strengths))
      missing.push("Analyse SWOT absente (gbm_21)");

    return missing;
  }

  detectInconsistencies(project: {
    step_progresses: { step_key: string; status: string }[];
    idea_sketch: OneToOneModel;
    problems_needs: OneToOneModel;
    mission_vision: OneToOneModel;
    value_proposition: OneToOneModel;
    eco_design: OneToOneModel;
    eco_design_result: OneToOneModel;
    swot_analysis: OneToOneModel;
    customer_segment: OneToManyModel;
    cost_structure: OneToOneModel;
    revenue_stream: OneToOneModel;
    business_plan_status: string | null;
    management_plan: OneToOneModel;
    marketing_plan: OneToOneModel;
    financial_plan: OneToOneModel;
  }): Inconsistency[] {
    const issues: Inconsistency[] = [];
    const stepMap = new Map(
      project.step_progresses.map((sp) => [sp.step_key, sp.status]),
    );

    const stepDone = (key: string) => stepMap.get(key) === 'COMPLETED';

    if (stepDone('gbm_1') && !nonEmpty(project.idea_sketch?.idea_initial)) {
      issues.push({
        area: 'GBM',
        description: "Étape gbm_1 marquée complétée mais l'idée initiale est vide",
        severity: 'HIGH',
      });
    }

    if (
      stepDone('gbm_5') &&
      !nonEmpty(project.mission_vision?.mission)
    ) {
      issues.push({
        area: 'GBM',
        description: 'Étape gbm_5 marquée complétée mais la mission est vide',
        severity: 'HIGH',
      });
    }

    if (
      nonEmpty(project.swot_analysis?.strengths) &&
      !nonEmpty(project.swot_analysis?.weaknesses)
    ) {
      issues.push({
        area: 'SWOT',
        description: 'SWOT : forces renseignées mais faiblesses absentes',
        severity: 'MEDIUM',
      });
    }
    if (
      nonEmpty(project.swot_analysis?.opportunities) &&
      !nonEmpty(project.swot_analysis?.threats)
    ) {
      issues.push({
        area: 'SWOT',
        description: 'SWOT : opportunités renseignées mais menaces absentes',
        severity: 'MEDIUM',
      });
    }

    if (
      nonEmpty(project.eco_design) &&
      !nonEmpty(project.eco_design_result)
    ) {
      issues.push({
        area: 'Éco-conception',
        description: "Éco-conception initialisée mais résultats absents",
        severity: 'LOW',
      });
    }

    const segmentsCount = nonEmptyCount(project.customer_segment);
    if (
      segmentsCount === 0 &&
      stepDone('gbm_9')
    ) {
      issues.push({
        area: 'Clients',
        description: 'Proposition de valeur définie mais aucun segment client identifié',
        severity: 'HIGH',
      });
    }

    if (
      stepDone('gbm_16') &&
      !hasAnyField(project.cost_structure, ['fixed_costs', 'variable_costs'])
    ) {
      issues.push({
        area: 'Finances',
        description: 'Étape gbm_16 marquée complétée mais structure des coûts vide',
        severity: 'HIGH',
      });
    }

    if (
      nonEmpty(project.cost_structure) &&
      !nonEmpty(project.revenue_stream)
    ) {
      issues.push({
        area: 'Finances',
        description: 'Coûts définis mais flux de revenus absents',
        severity: 'MEDIUM',
      });
    }

    if (
      project.business_plan_status === 'FINAL' &&
      !nonEmpty(project.financial_plan?.point_depart)
    ) {
      issues.push({
        area: 'Business Plan',
        description: 'Business Plan marqué FINAL mais plan financier absent',
        severity: 'HIGH',
      });
    }

    if (
      !nonEmpty(project.mission_vision?.mission) &&
      nonEmpty(project.value_proposition?.value_added)
    ) {
      issues.push({
        area: 'Cohérence',
        description: 'Proposition de valeur définie mais mission non formulée',
        severity: 'MEDIUM',
      });
    }

    return issues;
  }

  calculateHealthScore(data: {
    progressPercentage: number;
    maturityScore: number;
    swotBalance: number;
    coachingEngagement: number;
    consistencyPenalty: number;
  }): HealthScore {
    const categories = [
      { label: 'Avancement', score: data.progressPercentage, maxScore: 100, weight: 0.30 },
      { label: 'Maturité', score: data.maturityScore, maxScore: 100, weight: 0.25 },
      { label: 'SWOT', score: Math.round(data.swotBalance * 100), maxScore: 100, weight: 0.15 },
      { label: 'Coaching', score: Math.round(data.coachingEngagement * 100), maxScore: 100, weight: 0.15 },
      { label: 'Cohérence', score: Math.max(0, 100 - data.consistencyPenalty), maxScore: 100, weight: 0.15 },
    ];

    const overall = Math.round(
      categories.reduce((sum, c) => sum + (c.score * c.weight), 0),
    );

    return { overall: Math.max(0, Math.min(100, overall)), categories };
  }

  calculatePriorities(data: {
    missingData: string[];
    inconsistencies: Inconsistency[];
    progressPercentage: number;
    maturityScore: number;
    hasCoachingActions: boolean;
    hasEvaluations: boolean;
  }): Priority[] {
    const priorities: Priority[] = [];

    const highInconsistencies = data.inconsistencies.filter(
      (i) => i.severity === 'HIGH',
    );
    for (const inc of highInconsistencies) {
      priorities.push({
        level: 'HIGH',
        area: inc.area,
        description: inc.description,
        impact: 80,
      });
    }

    if (data.missingData.length > 5) {
      priorities.push({
        level: 'HIGH',
        area: 'Données manquantes',
        description: `${data.missingData.length} informations essentielles manquantes`,
        impact: 75,
      });
    } else if (data.missingData.length > 0) {
      priorities.push({
        level: 'MEDIUM',
        area: 'Données manquantes',
        description: `${data.missingData.length} informations à compléter`,
        impact: 50,
      });
    }

    if (data.progressPercentage < 30) {
      priorities.push({
        level: 'HIGH',
        area: 'Avancement',
        description: "Progression globale faible — focus sur les étapes GBM fondamentales",
        impact: 70,
      });
    }

    if (data.maturityScore < 40 && data.progressPercentage > 30) {
      priorities.push({
        level: 'MEDIUM',
        area: 'Maturité',
        description: 'Maturité faible malgré un avancement correct — approfondissement nécessaire',
        impact: 60,
      });
    }

    if (!data.hasEvaluations) {
      priorities.push({
        level: 'MEDIUM',
        area: 'Évaluation',
        description: 'Aucune évaluation jury soumise — solliciter un retour expert',
        impact: 55,
      });
    }

    if (data.hasCoachingActions === false && data.progressPercentage > 20) {
      priorities.push({
        level: 'LOW',
        area: 'Coaching',
        description: 'Aucune action de coaching active — envisager un accompagnement',
        impact: 30,
      });
    }

    priorities.sort((a, b) => b.impact - a.impact);
    return priorities;
  }

  private stepHasData(
    stepKey: string,
    project: Record<string, any>,
  ): boolean {
    switch (stepKey) {
      case 'gbm_1': return nonEmpty(project.idea_sketch?.idea_initial) || nonEmpty(project.idea_sketch?.product_service);
      case 'gbm_2': return hasAnyField(project.problems_needs, ['environmental_challenges', 'social_challenges', 'customer_needs', 'team_motivations']);
      case 'gbm_3': return hasAnyField(project.pestel, ['political_what', 'economic_what', 'social_what', 'technological_what', 'environmental_what', 'legal_what']);
      case 'gbm_4': return hasAnyField(project.objective, ['environmental_objectives', 'social_objectives', 'customer_objectives', 'team_objectives']);
      case 'gbm_5': return nonEmpty(project.mission_vision?.mission) || nonEmpty(project.mission_vision?.vision);
      case 'gbm_6': return nonEmpty(project.context_summary?.summary_text);
      case 'gbm_7a': return nonEmptyCount(project.stakeholder) > 0;
      case 'gbm_7b': return nonEmptyCount(project.stakeholder_map) > 0;
      case 'gbm_8': return nonEmptyCount(project.customer_segment) > 0;
      case 'gbm_9': return hasAnyField(project.value_proposition, ['products_services', 'value_added', 'environmental_value']);
      case 'gbm_10': return nonEmptyCount(project.test_discovery) > 0;
      case 'gbm_11': return hasAnyField(project.value_proposition_pivot, ['pivot_decision', 'new_value_proposition']);
      case 'gbm_12a': return hasAnyField(project.customer_relations_channel, ['channels', 'customer_relationships']);
      case 'gbm_12b': return nonEmptyCount(project.customer_journey) > 0;
      case 'gbm_13': return hasAnyField(project.key_activities_resource, ['key_activities', 'key_resources']);
      case 'gbm_14a': return nonEmpty(project.eco_design?.vision_durable) || nonEmpty(project.eco_design?.equipe_eco);
      case 'gbm_14b': return nonEmpty(project.eco_design_result?.eco_results);
      case 'gbm_15': return nonEmpty(project.summary_activity?.activities_summary);
      case 'gbm_16': return hasAnyField(project.cost_structure, ['fixed_costs', 'variable_costs']);
      case 'gbm_17': return hasAnyField(project.revenue_stream, ['revenue_sources', 'pricing_strategy']);
      case 'gbm_18': return nonEmpty(project.cost_revenue_summary?.cost_summary);
      case 'gbm_19': return hasAnyField(project.test_preparation, ['test_objectives', 'test_method']);
      case 'gbm_20': return hasAnyField(project.indicator, ['environmental_kpis', 'social_kpis', 'economic_kpis']);
      case 'gbm_21': return nonEmpty(project.swot_analysis?.strengths) || nonEmpty(project.swot_analysis?.weaknesses);
      default: return false;
    }
  }
}
