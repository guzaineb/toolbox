import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LlmService } from '../llm.service';
import { computeWeightedScore } from '../../evaluations/score.util';
import { asString, asStringArray, parseWithRetry } from './ai-json.util';

export interface DimensionProgress {
  name: string;
  before: number | null;
  after: number | null;
  delta: number | null;
}

export interface ProgressComparison {
  overallBefore: number | null;
  overallAfter: number | null;
  overallDelta: number | null;
  dimensions: DimensionProgress[];
  actionsCompleted: number;
  actionsTotal: number;
  sessionsCompleted: number;
}

export interface ProgressAnalysisPayload extends ProgressComparison {
  narrative: string;
  improvements: string[];
  persistentWeaknesses: string[];
  newRisks: string[];
  nextPriorities: string[];
}

/**
 * Analyse de progression entre deux évaluations.
 * Les chiffres (scores, deltas) sont calculés par le backend — l'IA n'écrit que le narratif explicatif.
 */
@Injectable()
export class ProgressAnalysisService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly llm: LlmService,
  ) {}

  async compareEvaluations(
    evaluationBeforeId: string,
    evaluationAfterId: string,
  ): Promise<ProgressComparison> {
    const [before, after] = await Promise.all([
      this.prisma.evaluation.findUnique({
        where: { id: evaluationBeforeId },
        include: { template: { include: { criteria: true } }, scores: true },
      }),
      this.prisma.evaluation.findUnique({
        where: { id: evaluationAfterId },
        include: { template: { include: { criteria: true } }, scores: true },
      }),
    ]);

    const dimensions: DimensionProgress[] = [];
    let overallBefore: number | null = null;
    let overallAfter: number | null = null;

    if (before?.template) {
      const c = computeWeightedScore(before.template.criteria, before.scores);
      overallBefore = c.total20;
    }
    if (after?.template) {
      const c = computeWeightedScore(after.template.criteria, after.scores);
      overallAfter = c.total20;
    }

    if (after?.template) {
      for (const criterion of after.template.criteria) {
        const afterScore =
          after.scores.find((s) => s.criterion_id === criterion.id)?.score ??
          null;
        const beforeScore =
          (before?.template?.criteria &&
            before.scores.find((s) => s.criterion_id === criterion.id)
              ?.score) ??
          null;
        const beforePct =
          beforeScore !== null && before
            ? Math.round((beforeScore / Math.max(1, criterion.max_score)) * 100)
            : null;
        const afterPct =
          afterScore !== null
            ? Math.round((afterScore / Math.max(1, criterion.max_score)) * 100)
            : null;
        dimensions.push({
          name: criterion.name,
          before: beforePct,
          after: afterPct,
          delta:
            beforePct !== null && afterPct !== null
              ? Math.round((afterPct - beforePct) * 100) / 100
              : null,
        });
      }
    }

    const projectId = after?.project_id ?? before?.project_id ?? '';
    const [actionsTotal, actionsCompleted, sessionsCompleted] =
      await Promise.all([
        this.prisma.coachingAction.count({ where: { project_id: projectId } }),
        this.prisma.coachingAction.count({
          where: { project_id: projectId, status: 'COMPLETED' },
        }),
        this.prisma.coachingSession.count({
          where: { assignment: { project_id: projectId }, status: 'COMPLETED' },
        }),
      ]);

    return {
      overallBefore: round2(overallBefore),
      overallAfter: round2(overallAfter),
      overallDelta:
        overallBefore !== null && overallAfter !== null
          ? round2(overallAfter - overallBefore)
          : null,
      dimensions,
      actionsCompleted,
      actionsTotal,
      sessionsCompleted,
    };
  }

  async analyze(
    projectId: string,
    fromEvaluationId: string,
    toEvaluationId: string,
  ): Promise<ProgressAnalysisPayload | null> {
    const comparison = await this.compareEvaluations(
      fromEvaluationId,
      toEvaluationId,
    );

    const dataBlock = JSON.stringify(
      {
        scoreAvant: comparison.overallBefore,
        scoreApres: comparison.overallAfter,
        progressionGlobale: comparison.overallDelta,
        dimensions: comparison.dimensions.map((d) => ({
          critere: d.name,
          avant: d.before,
          apres: d.after,
          delta: d.delta,
        })),
        coaching: {
          actionsCompletes: `${comparison.actionsCompleted}/${comparison.actionsTotal}`,
          sessionsRealisees: comparison.sessionsCompleted,
        },
      },
      null,
      2,
    );

    const prompt = `Explique la progression d'un projet entre deux évaluations à partir des chiffres suivants (calculés par le système).

${dataBlock}

Produis UNIQUEMENT un JSON strict :
{
  "narrative": "analyse en 3-5 phrases expliquant les changements",
  "improvements": ["améliorations concrètes observées"],
  "persistentWeaknesses": ["faiblesses qui persistent"],
  "newRisks": ["nouveaux risques détectés"],
  "nextPriorities": ["priorités pour la suite"]
}
Les chiffres sont fournis : ne les recalcule pas et ne les contredis pas.`;

    const result = await parseWithRetry<
      Pick<
        ProgressAnalysisPayload,
        | 'narrative'
        | 'improvements'
        | 'persistentWeaknesses'
        | 'newRisks'
        | 'nextPriorities'
      >
    >(
      () =>
        this.llm
          .chat(
            [
              {
                role: 'system',
                content:
                  'Tu expliques des progressions de projets entrepreneuriaux à partir de données chiffrées fournies. Réponds UNIQUEMENT en JSON.',
              },
              { role: 'user', content: prompt },
            ],
            { temperature: 0.4, maxTokens: 1500 },
          )
          .then((r) => r.content),
      (parsed) => {
        if (!parsed || typeof parsed !== 'object') return null;
        const obj = parsed as Record<string, unknown>;
        const narrative = asString(obj.narrative);
        if (!narrative) return null;
        return {
          narrative,
          improvements: asStringArray(obj.improvements).slice(0, 6),
          persistentWeaknesses: asStringArray(obj.persistentWeaknesses).slice(
            0,
            6,
          ),
          newRisks: asStringArray(obj.newRisks).slice(0, 6),
          nextPriorities: asStringArray(obj.nextPriorities).slice(0, 6),
        };
      },
    );

    if (!result.data) return null;

    return { ...comparison, ...result.data };
  }
}

function round2(value: number | null): number | null {
  if (value === null || !Number.isFinite(value)) return null;
  return Math.round(value * 100) / 100;
}
