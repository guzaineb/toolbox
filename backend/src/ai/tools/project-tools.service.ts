import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ModuleAccessService } from '../../common/services/module-access.service';
import { ProjectStateService } from '../project-state/project-state.service';
import { ConsistencyChecker } from '../project-state/consistency-checker.service';
import { ProjectHealthService } from '../project-state/project-health.service';
import { ProjectAnalyzer } from '../project-state/project-analyzer.service';
import { ToolRegistry } from './tool-registry';
import {
  ProjectStateOutputSchema,
  ProjectProgressOutputSchema,
  GBMOutputSchema,
  BusinessPlanOutputSchema,
  MarketOutputSchema,
  FinancingOutputSchema,
  ImpactOutputSchema,
  EcoDesignOutputSchema,
  InconsistenciesOutputSchema,
  HealthScoreOutputSchema,
  NextBestActionOutputSchema,
  ToolInputSchema,
} from './tool-schemas';

const PROJECT_INCLUDE_GBM = {
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
  summary_activity: true,
  step_progresses: { select: { step_key: true, status: true } },
} as const;

const PROJECT_INCLUDE_BP = {
  financial_plan: true,
  management_plan: true,
  marketing_plan: true,
  legal_plan: true,
  executive_summary: true,
  cost_revenue_summary: true,
  cost_structure: true,
  revenue_stream: true,
} as const;

const PROJECT_INCLUDE_MARKET = {
  market_access: true,
  marketing_plan: true,
  customer_segment: true,
  customer_journey: true,
  pestel: true,
} as const;

const PROJECT_INCLUDE_FINANCING = {
  cost_structure: true,
  revenue_stream: true,
  financial_plan: true,
  funding_assessment: true,
  cost_revenue_summary: true,
} as const;

const PROJECT_INCLUDE_IMPACT = {
  impact_measure: true,
  indicator: true,
} as const;

const PROJECT_INCLUDE_ECODESIGN = {
  eco_design: true,
  eco_design_result: true,
} as const;

const PROJECT_INCLUDE_STATE = {
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
export class ProjectToolsService {
  private readonly logger = new Logger(ProjectToolsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ModuleAccessService,
    private readonly projectState: ProjectStateService,
    private readonly consistencyChecker: ConsistencyChecker,
    private readonly healthService: ProjectHealthService,
    private readonly analyzer: ProjectAnalyzer,
    private readonly registry: ToolRegistry,
  ) {
    this.registerTools();
  }

  private registerTools(): void {
    const tools = [
      {
        name: 'getProjectState',
        description: 'État complet du projet',
        inputSchema: ToolInputSchema,
        outputSchema: ProjectStateOutputSchema,
        handler: this.getProjectState.bind(this),
      },
      {
        name: 'getProjectProgress',
        description: "Avancement du projet",
        inputSchema: ToolInputSchema,
        outputSchema: ProjectProgressOutputSchema,
        handler: this.getProjectProgress.bind(this),
      },
      {
        name: 'getGBM',
        description: 'Données du Guide de Business Model',
        inputSchema: ToolInputSchema,
        outputSchema: GBMOutputSchema,
        handler: this.getGBM.bind(this),
      },
      {
        name: 'getBusinessPlan',
        description: 'Données du Business Plan',
        inputSchema: ToolInputSchema,
        outputSchema: BusinessPlanOutputSchema,
        handler: this.getBusinessPlan.bind(this),
      },
      {
        name: 'getMarket',
        description: 'Données marché',
        inputSchema: ToolInputSchema,
        outputSchema: MarketOutputSchema,
        handler: this.getMarket.bind(this),
      },
      {
        name: 'getFinancing',
        description: 'Données financières',
        inputSchema: ToolInputSchema,
        outputSchema: FinancingOutputSchema,
        handler: this.getFinancing.bind(this),
      },
      {
        name: 'getImpact',
        description: "Données d'impact",
        inputSchema: ToolInputSchema,
        outputSchema: ImpactOutputSchema,
        handler: this.getImpact.bind(this),
      },
      {
        name: 'getEcoDesign',
        description: "Données d'écoconception",
        inputSchema: ToolInputSchema,
        outputSchema: EcoDesignOutputSchema,
        handler: this.getEcoDesign.bind(this),
      },
      {
        name: 'detectInconsistencies',
        description: 'Détection des incohérences',
        inputSchema: ToolInputSchema,
        outputSchema: InconsistenciesOutputSchema,
        handler: this.detectInconsistencies.bind(this),
      },
      {
        name: 'calculateHealthScore',
        description: 'Score de santé du projet',
        inputSchema: ToolInputSchema,
        outputSchema: HealthScoreOutputSchema,
        handler: this.calculateHealthScore.bind(this),
      },
      {
        name: 'getNextBestAction',
        description: 'Prochaine action recommandée',
        inputSchema: ToolInputSchema,
        outputSchema: NextBestActionOutputSchema,
        handler: this.getNextBestAction.bind(this),
      },
    ];

    for (const tool of tools) {
      this.registry.register(tool);
    }

    this.logger.log(`Registered ${tools.length} project tools`);
  }

  private async verifyAccess(projectId: string, userId: string): Promise<void> {
    await this.access.assertCanAccessProject(projectId, userId);
  }

  private async getProjectState(
    params: { projectId: string },
    userId: string,
  ): Promise<unknown> {
    await this.verifyAccess(params.projectId, userId);
    return this.projectState.getProjectState(params.projectId);
  }

  private async getProjectProgress(
    params: { projectId: string },
    userId: string,
  ): Promise<unknown> {
    await this.verifyAccess(params.projectId, userId);

    const project = await this.prisma.project.findUnique({
      where: { id: params.projectId },
      include: {
        step_progresses: { select: { step_key: true, status: true } },
      },
    });

    if (!project) throw new Error('Projet introuvable');

    const progress = this.analyzer.analyzeProgress({
      step_progresses: project.step_progresses,
    });

    return {
      overallPercentage: progress.overallPercentage,
      gbmPercentage: progress.gbmPercentage,
      bpPercentage: progress.bpPercentage,
      completedCount: progress.completedCount,
      totalCount: progress.totalCount,
      modulePercentages: progress.modulePercentages,
    };
  }

  private async getGBM(
    params: { projectId: string },
    userId: string,
  ): Promise<unknown> {
    await this.verifyAccess(params.projectId, userId);

    const project = await this.prisma.project.findUnique({
      where: { id: params.projectId },
      include: PROJECT_INCLUDE_GBM,
    });

    if (!project) throw new Error('Projet introuvable');

    return {
      ideaSketch: project.idea_sketch ?? null,
      problemsNeeds: project.problems_needs ?? null,
      pestel: project.pestel ?? null,
      objective: project.objective ?? null,
      missionVision: project.mission_vision ?? null,
      contextSummary: project.context_summary ?? null,
      stakeholder: project.stakeholder ?? null,
      stakeholderMap: project.stakeholder_map ?? null,
      customerSegment: project.customer_segment ?? null,
      valueProposition: project.value_proposition ?? null,
      testDiscovery: project.test_discovery ?? null,
      valuePropositionPivot: project.value_proposition_pivot ?? null,
      customerRelationsChannel: project.customer_relations_channel ?? null,
      customerJourney: project.customer_journey ?? null,
      keyActivitiesResource: project.key_activities_resource ?? null,
      summaryActivity: project.summary_activity ?? null,
      stepProgresses: project.step_progresses.map((sp) => ({
        stepKey: sp.step_key,
        status: sp.status,
      })),
    };
  }

  private async getBusinessPlan(
    params: { projectId: string },
    userId: string,
  ): Promise<unknown> {
    await this.verifyAccess(params.projectId, userId);

    const project = await this.prisma.project.findUnique({
      where: { id: params.projectId },
      include: PROJECT_INCLUDE_BP,
    });

    if (!project) throw new Error('Projet introuvable');

    return {
      financialPlan: project.financial_plan ?? null,
      managementPlan: project.management_plan ?? null,
      marketingPlan: project.marketing_plan ?? null,
      legalPlan: project.legal_plan ?? null,
      executiveSummary: project.executive_summary ?? null,
      costRevenueSummary: project.cost_revenue_summary ?? null,
      costStructure: project.cost_structure ?? null,
      revenueStream: project.revenue_stream ?? null,
    };
  }

  private async getMarket(
    params: { projectId: string },
    userId: string,
  ): Promise<unknown> {
    await this.verifyAccess(params.projectId, userId);

    const project = await this.prisma.project.findUnique({
      where: { id: params.projectId },
      include: PROJECT_INCLUDE_MARKET,
    });

    if (!project) throw new Error('Projet introuvable');

    return {
      marketAccess: project.market_access ?? null,
      marketingPlan: project.marketing_plan ?? null,
      customerSegment: project.customer_segment ?? null,
      customerJourney: project.customer_journey ?? null,
      pestel: project.pestel ?? null,
    };
  }

  private async getFinancing(
    params: { projectId: string },
    userId: string,
  ): Promise<unknown> {
    await this.verifyAccess(params.projectId, userId);

    const project = await this.prisma.project.findUnique({
      where: { id: params.projectId },
      include: PROJECT_INCLUDE_FINANCING,
    });

    if (!project) throw new Error('Projet introuvable');

    return {
      costStructure: project.cost_structure ?? null,
      revenueStream: project.revenue_stream ?? null,
      financialPlan: project.financial_plan ?? null,
      fundingAssessment: project.funding_assessment ?? null,
      costRevenueSummary: project.cost_revenue_summary ?? null,
    };
  }

  private async getImpact(
    params: { projectId: string },
    userId: string,
  ): Promise<unknown> {
    await this.verifyAccess(params.projectId, userId);

    const project = await this.prisma.project.findUnique({
      where: { id: params.projectId },
      include: PROJECT_INCLUDE_IMPACT,
    });

    if (!project) throw new Error('Projet introuvable');

    return {
      impactMeasure: project.impact_measure ?? null,
      indicator: project.indicator ?? null,
    };
  }

  private async getEcoDesign(
    params: { projectId: string },
    userId: string,
  ): Promise<unknown> {
    await this.verifyAccess(params.projectId, userId);

    const project = await this.prisma.project.findUnique({
      where: { id: params.projectId },
      include: PROJECT_INCLUDE_ECODESIGN,
    });

    if (!project) throw new Error('Projet introuvable');

    return {
      ecoDesign: project.eco_design ?? null,
      ecoDesignResult: project.eco_design_result ?? null,
    };
  }

  private async detectInconsistencies(
    params: { projectId: string },
    userId: string,
  ): Promise<unknown> {
    await this.verifyAccess(params.projectId, userId);

    const project = await this.prisma.project.findUnique({
      where: { id: params.projectId },
      include: PROJECT_INCLUDE_STATE,
    });

    if (!project) throw new Error('Projet introuvable');

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

    const result = this.consistencyChecker.check(consistencyInput);
    return {
      inconsistencies: result.inconsistencies,
      score: result.score,
      totalChecks: result.totalChecks,
      passedChecks: result.passedChecks,
    };
  }

  private async calculateHealthScore(
    params: { projectId: string },
    userId: string,
  ): Promise<unknown> {
    await this.verifyAccess(params.projectId, userId);

    const project = await this.prisma.project.findUnique({
      where: { id: params.projectId },
      include: PROJECT_INCLUDE_STATE,
    });

    if (!project) throw new Error('Projet introuvable');

    const completeness = this.analyzer.analyzeCompleteness(project as any);
    const progress = this.analyzer.analyzeProgress({
      step_progresses: project.step_progresses,
    });

    const maturityResult = await this.prisma.$queryRaw`
      SELECT COALESCE(AVG(score), 0)::float as "avgScore"
      FROM evaluation_scores es
      JOIN evaluations e ON es.evaluation_id = e.id
      WHERE e.project_id = ${params.projectId} AND e.status = 'SUBMITTED'
    `.then((rows: any[]) => rows[0]?.avgScore ?? 0);

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

    const diagnostic = this.healthService.diagnose({
      completeness,
      progress,
      maturityScore: maturityResult,
      consistencyInput,
      coachingEngagement: 0,
      strengths: [],
      weakAreas: [],
    });

    return {
      overall: diagnostic.score,
      completenessScore: diagnostic.completenessScore,
      progressScore: diagnostic.progressScore,
      coherenceScore: diagnostic.coherenceScore,
      maturityScore: diagnostic.maturityScore,
      strengths: diagnostic.strengths,
      weakAreas: diagnostic.weakAreas,
    };
  }

  private async getNextBestAction(
    params: { projectId: string },
    userId: string,
  ): Promise<unknown> {
    await this.verifyAccess(params.projectId, userId);

    const state = await this.projectState.getProjectState(params.projectId);

    return {
      currentPriority: state.currentPriority,
      recommendedNextAction: state.recommendedNextAction,
      priorities: state.priorities,
      incompleteSteps: state.incompleteSteps.map((s) => ({
        stepKey: s.stepKey,
        title: s.title,
        phase: s.phase,
        status: s.status,
      })),
    };
  }
}
