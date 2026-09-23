import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { computeWeightedScore, round2 } from '../evaluations/score.util';

export interface MaturityDimension {
  name: string;
  score: number;
  weight: number;
}

export interface MaturityScoreResult {
  globalScore: number;
  dimensions: MaturityDimension[];
  computedAt: string;
}

/**
 * Poids configurables du score de maturité (total = 100).
 * Score 100% déterministe : calculé par le backend, jamais par l'IA.
 */
export const MATURITY_WEIGHTS = {
  evaluation: 30,
  gbm: 20,
  businessPlan: 15,
  market: 15,
  impact: 10,
  coaching: 10,
} as const;

@Injectable()
export class MaturityScoreService {
  constructor(private readonly prisma: PrismaService) {}

  async compute(projectId: string): Promise<MaturityScoreResult> {
    const [
      latestEvaluation,
      gbmCompleted,
      bpTotal,
      bpCompleted,
      actionsTotal,
      actionsCompleted,
      sessionsTotal,
      sessionsCompleted,
      recommendationsTotal,
      recommendationsDone,
    ] = await Promise.all([
      this.getLatestEvaluationScore20(projectId),
      this.prisma.stepProgress.count({
        where: { project_id: projectId, status: 'COMPLETED', step_key: { startsWith: 'gbm_' } },
      }),
      this.prisma.stepProgress.count({
        where: { project_id: projectId, step_key: { startsWith: 'bp_' } },
      }),
      this.prisma.stepProgress.count({
        where: { project_id: projectId, status: 'COMPLETED', step_key: { startsWith: 'bp_' } },
      }),
      this.prisma.coachingAction.count({ where: { project_id: projectId } }),
      this.prisma.coachingAction.count({ where: { project_id: projectId, status: 'COMPLETED' } }),
      this.prisma.coachingSession.count({ where: { assignment: { project_id: projectId } } }),
      this.prisma.coachingSession.count({
        where: { assignment: { project_id: projectId }, status: 'COMPLETED' },
      }),
      this.prisma.coachingRecommendation.count({ where: { project_id: projectId } }),
      this.prisma.coachingRecommendation.count({ where: { project_id: projectId, status: 'DONE' } }),
    ]);

    const [project, testValidated] = await Promise.all([
      this.prisma.project.findUnique({
        where: { id: projectId },
        select: {
          marketing_plan: { select: { analyse_marche: true } },
          market_access: { select: { positionnement: true } },
          impact_measure: {
            select: { kpis_environnementaux: true, kpis_sociaux: true, resultats_actuels: true },
          },
        },
      }),
      this.prisma.testDiscovery.findFirst({
        where: { project_id: projectId, validated: true },
        select: { id: true },
      }),
    ]);

    // Évaluation (30%) : dernier score /20 (moyenne jurys) ramené sur 100
    const evaluationScore = latestEvaluation !== null ? round2(latestEvaluation * 5) : 0;

    // GBM (20%) : part des étapes complétées sur les 21 étapes du référentiel
    const gbmScore = round2(Math.min(100, (gbmCompleted / 21) * 100));

    // Business Plan (15%) : sections complétées sur les sections existantes
    const bpScore = bpTotal > 0 ? round2((bpCompleted / bpTotal) * 100) : 0;

    // Validation marché (15%) : moyenne de 3 signaux factuels
    const marketSignals: boolean[] = [
      nonEmpty(project?.marketing_plan?.analyse_marche),
      nonEmpty(project?.market_access?.positionnement),
      !!testValidated,
    ];
    const marketScore = round2((marketSignals.filter(Boolean).length / marketSignals.length) * 100);

    // Impact (10%) : moyenne de 3 signaux KPIs/résultats renseignés
    const impactSignals: boolean[] = [
      hasJsonValue(project?.impact_measure?.kpis_environnementaux),
      hasJsonValue(project?.impact_measure?.kpis_sociaux),
      hasJsonValue(project?.impact_measure?.resultats_actuels),
    ];
    const impactScore = round2((impactSignals.filter(Boolean).length / impactSignals.length) * 100);

    // Progression coaching (10%) : moyenne des taux d'actions complétées,
    // de sessions réalisées et de recommandations traitées
    const actionRate = actionsTotal > 0 ? actionsCompleted / actionsTotal : 0;
    const sessionRate = sessionsTotal > 0 ? sessionsCompleted / sessionsTotal : 0;
    const recommendationRate = recommendationsTotal > 0 ? recommendationsDone / recommendationsTotal : 0;
    const coachingScore = round2(((actionRate + sessionRate + recommendationRate) / 3) * 100);

    const dimensions: MaturityDimension[] = [
      { name: 'evaluation', score: evaluationScore, weight: MATURITY_WEIGHTS.evaluation },
      { name: 'gbm', score: gbmScore, weight: MATURITY_WEIGHTS.gbm },
      { name: 'business_plan', score: bpScore, weight: MATURITY_WEIGHTS.businessPlan },
      { name: 'market_validation', score: marketScore, weight: MATURITY_WEIGHTS.market },
      { name: 'impact', score: impactScore, weight: MATURITY_WEIGHTS.impact },
      { name: 'coaching_progress', score: coachingScore, weight: MATURITY_WEIGHTS.coaching },
    ];

    const globalScore = round2(
      dimensions.reduce((sum, d) => sum + (d.score * d.weight) / 100, 0),
    );

    return {
      globalScore,
      dimensions: dimensions.map(({ name, score, weight }) => ({ name, score, weight })),
      computedAt: new Date().toISOString(),
    };
  }

  /**
   * Dernier score d'évaluation soumis (/20), moyenné entre jurys sur la version la plus récente.
   */
  private async getLatestEvaluationScore20(projectId: string): Promise<number | null> {
    const evaluations = await this.prisma.evaluation.findMany({
      where: { project_id: projectId, status: 'SUBMITTED' },
      include: { template: { include: { criteria: true } }, scores: true },
      orderBy: { submitted_at: 'desc' },
      take: 8,
    });
    const withTemplate = evaluations.filter((e) => e.template);
    if (withTemplate.length === 0) return null;

    const latestVersion = Math.max(...withTemplate.map((e) => e.version));
    const latestRound = withTemplate.filter((e) => e.version === latestVersion);
    const scores = latestRound.map((e) =>
      computeWeightedScore(e.template!.criteria, e.scores).total20,
    );
    return round2(scores.reduce((a, b) => a + b, 0) / scores.length);
  }
}

function nonEmpty(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasJsonValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value as object).length > 0;
  return false;
}
