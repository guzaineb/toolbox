import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MaturityScoreService } from '../../maturity/maturity-score.service';
import { ProjectAnalyzer } from './project-analyzer.service';
import { ConsistencyChecker } from './consistency-checker.service';
import { ProjectHealthService } from './project-health.service';
import { ProjectState, Priority, MaturityLevel, PriorityModule } from './project-state.types';

const WEIGHTS = {
  completeness: 0.30,
  progress: 0.25,
  coherence: 0.25,
  maturity: 0.20,
};

const PROJECT_INCLUDE = {
  idea_sketch: true,
  problems_needs: true,
  pestel: true,
  objective: true,
  mission_vision: true,
  context_summary: true,
  stakeholder: true,
  stakeholder_map: true,
  customer_segment: true,
  value_proposition: true,
  test_discovery: true,
  value_proposition_pivot: true,
  customer_relations_channel: true,
  customer_journey: true,
  key_activities_resource: true,
  eco_design: true,
  eco_design_result: true,
  summary_activity: true,
  cost_structure: true,
  revenue_stream: true,
  cost_revenue_summary: true,
  test_preparation: true,
  indicator: true,
  management_plan: true,
  marketing_plan: true,
  financial_plan: true,
  legal_plan: true,
  kpi: true,
  executive_summary: true,
  funding_assessment: true,
  market_access: true,
  impact_measure: true,
  swot_analysis: true,
  step_progresses: { select: { step_key: true, status: true } },
} as const;

@Injectable()
export class ProjectStateService {
  private readonly logger = new Logger(ProjectStateService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly maturity: MaturityScoreService,
    private readonly analyzer: ProjectAnalyzer,
    private readonly consistencyChecker: ConsistencyChecker,
    private readonly healthService: ProjectHealthService,
  ) {}

  async getProjectState(projectId: string): Promise<ProjectState> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: PROJECT_INCLUDE,
    });

    if (!project) {
      throw new Error(`Projet introuvable: ${projectId}`);
    }

    const maturityResult = await this.maturity.compute(projectId).catch(() => ({
      globalScore: 0,
      dimensions: [],
      computedAt: new Date().toISOString(),
    }));

    const completeness = this.analyzer.analyzeCompleteness(project as any);
    const progress = this.analyzer.analyzeProgress({
      step_progresses: project.step_progresses,
    });
    const maturityLevel = this.analyzer.analyzeMaturity(maturityResult.globalScore);
    const missingData = this.analyzer.detectMissingData(project as any);

    const consistencyInput = {
      step_progresses: project.step_progresses,
      idea_sketch: project.idea_sketch,
      problems_needs: project.problems_needs,
      pestel: project.pestel,
      objective: project.objective,
      mission_vision: project.mission_vision,
      value_proposition: project.value_proposition,
      customer_segment: project.customer_segment,
      key_activities_resource: project.key_activities_resource,
      cost_structure: project.cost_structure,
      revenue_stream: project.revenue_stream,
      financial_plan: project.financial_plan,
      legal_plan: project.legal_plan,
      indicator: project.indicator,
      eco_design: project.eco_design,
      eco_design_result: project.eco_design_result,
      swot_analysis: project.swot_analysis,
      market_access: project.market_access,
      impact_measure: project.impact_measure,
      funding_assessment: project.funding_assessment,
      management_plan: project.management_plan,
      marketing_plan: project.marketing_plan,
      cost_revenue_summary: project.cost_revenue_summary,
      business_plan_status: project.business_plan_status,
    };
    const consistencyResult = this.consistencyChecker.check(consistencyInput);
    const inconsistencies = consistencyResult.inconsistencies;

    const coachingData = await this.fetchCoachingData(projectId);

    const healthDiagnostic = this.healthService.diagnose({
      completeness,
      progress,
      maturityScore: maturityResult.globalScore,
      consistencyInput,
      coachingEngagement: coachingData.engagement,
      strengths: this.extractStrengths(project as any, completeness),
      weakAreas: this.extractWeakAreas(
        missingData,
        inconsistencies,
        maturityResult.globalScore,
        progress,
      ),
    });

    const priorities = this.analyzer.calculatePriorities({
      missingData,
      inconsistencies,
      progressPercentage: progress.overallPercentage,
      maturityScore: maturityResult.globalScore,
      hasCoachingActions: coachingData.hasActiveActions,
      hasEvaluations: coachingData.hasEvaluations,
    });

    const completedSteps = completeness.gbm.steps.filter(
      (s) => s.status === 'COMPLETED',
    );
    const incompleteSteps = completeness.gbm.steps.filter(
      (s) => s.status !== 'COMPLETED',
    );

    const enrichedPriorities = this.enrichPrioritiesWithRouting(
      priorities,
      incompleteSteps,
    );

    const currentPriority = enrichedPriorities.length > 0 ? enrichedPriorities[0] : null;
    const recommendedNextAction = this.buildRecommendedAction(
      currentPriority,
      incompleteSteps,
      missingData,
    );

    return {
      projectId,
      projectName: project.name,
      maturityLevel,
      overallProgress: progress.overallPercentage,
      completedSteps,
      incompleteSteps,
      missingInformation: missingData,
      strengths: healthDiagnostic.strengths,
      weakAreas: healthDiagnostic.weakAreas,
      inconsistencies,
      healthScore: {
        overall: healthDiagnostic.score,
        categories: [
          { label: 'Complétude', score: healthDiagnostic.completenessScore, maxScore: 100, weight: WEIGHTS.completeness },
          { label: 'Avancement', score: healthDiagnostic.progressScore, maxScore: 100, weight: WEIGHTS.progress },
          { label: 'Cohérence', score: healthDiagnostic.coherenceScore, maxScore: 100, weight: WEIGHTS.coherence },
          { label: 'Maturité', score: healthDiagnostic.maturityScore, maxScore: 100, weight: WEIGHTS.maturity },
        ],
      },
      priorities: enrichedPriorities,
      currentPriority,
      recommendedNextAction,
    };
  }

  private async fetchCoachingData(projectId: string) {
    const [actionsCount, activeActionsCount, sessionsCount, completedSessionsCount, recommendationsCount, doneRecommendationsCount, evaluationsCount] =
      await Promise.all([
        this.prisma.coachingAction.count({ where: { project_id: projectId } }),
        this.prisma.coachingAction.count({
          where: {
            project_id: projectId,
            status: { in: ['PENDING', 'IN_PROGRESS'] },
          },
        }),
        this.prisma.coachingSession.count({
          where: { assignment: { project_id: projectId } },
        }),
        this.prisma.coachingSession.count({
          where: {
            assignment: { project_id: projectId },
            status: 'COMPLETED',
          },
        }),
        this.prisma.coachingRecommendation.count({
          where: { project_id: projectId },
        }),
        this.prisma.coachingRecommendation.count({
          where: { project_id: projectId, status: 'DONE' },
        }),
        this.prisma.evaluation.count({
          where: { project_id: projectId, status: 'SUBMITTED' },
        }),
      ]);

    const actionRate = actionsCount > 0 ? activeActionsCount / actionsCount : 0;
    const sessionRate =
      sessionsCount > 0 ? completedSessionsCount / sessionsCount : 0;
    const recommendationRate =
      recommendationsCount > 0 ? doneRecommendationsCount / recommendationsCount : 0;
    const engagement = (actionRate + sessionRate + recommendationRate) / 3;

    return {
      engagement,
      hasActiveActions: activeActionsCount > 0,
      hasEvaluations: evaluationsCount > 0,
    };
  }

  private computeSwotBalance(project: {
    swot_analysis: {
      strengths: string | null;
      weaknesses: string | null;
      opportunities: string | null;
      threats: string | null;
    } | null;
  }): number {
    const swot = project.swot_analysis;
    if (!swot) return 0;

    const axes = [
      swot.strengths,
      swot.weaknesses,
      swot.opportunities,
      swot.threats,
    ];
    const filled = axes.filter(
      (a) => a !== null && a !== undefined && a.trim().length > 0,
    ).length;
    return filled / 4;
  }

  private extractStrengths(
    project: Record<string, any>,
    completeness: { gbm: { percentage: number }; businessPlan: { percentage: number } },
  ): string[] {
    const strengths: string[] = [];

    if (completeness.gbm.percentage >= 70)
      strengths.push(`GBM bien avancé (${completeness.gbm.percentage}%)`);
    if (completeness.businessPlan.percentage >= 50)
      strengths.push(`Business Plan partiellement complété (${completeness.businessPlan.percentage}%)`);

    if (nonEmpty(project.mission_vision?.mission))
      strengths.push('Mission définie');
    if (nonEmpty(project.value_proposition?.value_added))
      strengths.push('Proposition de valeur définie');
    if (nonEmpty(project.swot_analysis?.strengths))
      strengths.push('Analyse SWOT réalisée');
    if (nonEmpty(project.impact_measure?.methode_mesure))
      strengths.push("Méthode de mesure d'impact définie");
    if (nonEmpty(project.market_access?.positionnement))
      strengths.push('Positionnement marché défini');
    if (nonEmpty(project.eco_design?.vision_durable))
      strengths.push('Vision durable formulée');
    if (nonEmpty(project.financial_plan?.point_depart))
      strengths.push('Plan financier renseigné');
    if (project.test_discovery && project.test_discovery.length > 0)
      strengths.push(`${project.test_discovery.length} test(s) de validation réalisé(s)`);
    if (project.customer_segment && project.customer_segment.length >= 2)
      strengths.push(`${project.customer_segment.length} segments clients identifiés`);

    return strengths;
  }

  private extractWeakAreas(
    missingData: string[],
    inconsistencies: Array<{ severity: string }>,
    maturityScore: number,
    progress: { gbmPercentage: number; bpPercentage: number },
  ): string[] {
    const weak: string[] = [];

    if (progress.gbmPercentage < 30) weak.push('GBM très peu avancé');
    if (progress.bpPercentage < 20) weak.push('Business Plan quasi vide');
    if (maturityScore < 30) weak.push('Score de maturité faible');
    if (missingData.length > 8)
      weak.push(`${missingData.length} informations essentielles manquantes`);

    const highIssues = inconsistencies.filter((i) => i.severity === 'HIGH');
    if (highIssues.length > 0)
      weak.push(`${highIssues.length} incohérence(s) critique(s) détectée(s)`);

    return weak;
  }

  private buildRecommendedAction(
    currentPriority: Priority | null,
    incompleteSteps: Array<{ stepKey: string; title: string }>,
    missingData: string[],
  ): string {
    if (currentPriority) {
      if (currentPriority.level === 'HIGH') {
        return `Priorité haute : ${currentPriority.description}`;
      }
      if (currentPriority.level === 'MEDIUM') {
        return `À améliorer : ${currentPriority.description}`;
      }
    }

    if (incompleteSteps.length > 0) {
      const next = incompleteSteps[0];
      return `Continuer l'étape « ${next.title} » (${next.stepKey})`;
    }

    if (missingData.length > 0) {
      return `Compléter les données manquantes (${missingData.length} élément(s))`;
    }

    return 'Le projet est bien structuré — poursuivre l\'accompagnement';
  }

  private enrichPrioritiesWithRouting(
    priorities: Priority[],
    incompleteSteps: Array<{ stepKey: string; title: string }>,
  ): Priority[] {
    return priorities.map((p) => {
      const module = this.mapAreaToModule(p.area);
      let stepKey: string | undefined;

      if (module === 'GBM' && incompleteSteps.length > 0) {
        stepKey = incompleteSteps[0].stepKey;
      }

      return { ...p, module, stepKey };
    });
  }

  private mapAreaToModule(area: string): PriorityModule {
    const lower = area.toLowerCase();

    if (
      lower.includes('gbm') ||
      lower.includes('étape') ||
      lower.includes('avancement')
    ) {
      return 'GBM';
    }
    if (
      lower.includes('business plan') ||
      lower.includes('plan de gestion') ||
      lower.includes('management') ||
      lower.includes('marketing') ||
      lower.includes('financ') ||
      lower.includes('juridique') ||
      lower.includes('kpi') ||
      lower.includes('résumé') ||
      lower.includes('executive')
    ) {
      return 'BUSINESS_PLAN';
    }
    if (
      lower.includes('marché') ||
      lower.includes('client') ||
      lower.includes('segment') ||
      lower.includes('positionnement')
    ) {
      return 'MARKET';
    }
    if (
      lower.includes('financement') ||
      lower.includes('funding') ||
      lower.includes('subvention')
    ) {
      return 'FUNDING';
    }
    if (
      lower.includes('impact') ||
      lower.includes('environnement') ||
      lower.includes('social') ||
      lower.includes('kpi') && lower.includes('environnement')
    ) {
      return 'IMPACT';
    }
    if (
      lower.includes('éco-conception') ||
      lower.includes('eco-design') ||
      lower.includes('durable')
    ) {
      return 'ECO_DESIGN';
    }
    if (
      lower.includes('évaluation') ||
      lower.includes('jury') ||
      lower.includes('expert')
    ) {
      return 'EVALUATION';
    }
    if (
      lower.includes('coaching') ||
      lower.includes('accompagnement')
    ) {
      return 'COACHING';
    }
    if (lower.includes('données manquantes')) {
      return 'GENERAL';
    }

    return 'GENERAL';
  }
}

function nonEmpty(v: unknown): boolean {
  if (v === null || v === undefined) return false;
  if (typeof v === 'string') return v.trim().length > 0;
  return true;
}
