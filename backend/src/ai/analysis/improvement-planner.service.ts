import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EvaluationAiService } from './evaluation-ai.service';
import { asNumber, asString } from './ai-json.util';
import {
  CoachingActionPriority,
  ImprovementObjectiveStatus,
} from '@prisma/client';

export interface GeneratedObjective {
  title: string;
  description: string;
  priority: CoachingActionPriority;
  currentScore: number | null;
  targetScore: number | null;
  targetArea: string;
}

export interface GeneratedPlan {
  title: string;
  description: string;
  targetAreas: string[];
  objectives: GeneratedObjective[];
}

/**
 * Transforme une analyse IA en plan d'amélioration structuré (brouillon).
 * Le plan reste au statut DRAFT tant que le coach ne l'a pas validé.
 */
@Injectable()
export class ImprovementPlannerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly evaluationAi: EvaluationAiService,
  ) {}

  async generateFromEvaluation(
    projectId: string,
    evaluationId: string,
    userId: string,
  ): Promise<
    | { planId: string; analysisAvailable: boolean }
    | { planId: null; analysisAvailable: false }
  > {
    const payload = await this.evaluationAi.analyzeEvaluation(
      projectId,
      evaluationId,
      userId,
    );
    if (!payload) return { planId: null, analysisAvailable: false };

    const analysis = await this.prisma.aiAnalysis.findFirst({
      where: {
        project_id: projectId,
        evaluation_id: evaluationId,
        type: 'EVALUATION_ANALYSIS',
        status: 'COMPLETED',
      },
      orderBy: { created_at: 'desc' },
    });
    if (!analysis) return { planId: null, analysisAvailable: false };

    const plan = this.buildDraft(payload);

    const created = await this.prisma.improvementPlan.create({
      data: {
        project_id: projectId,
        evaluation_id: evaluationId,
        ai_analysis_id: analysis.id,
        title: plan.title,
        description: plan.description,
        status: 'DRAFT',
        target_areas: plan.targetAreas,
        created_by: userId,
        objectives: {
          create: plan.objectives.map((o) => ({
            title: o.title,
            description: o.description,
            priority: o.priority,
            current_score: o.currentScore,
            target_score: o.targetScore,
            status: ImprovementObjectiveStatus.PENDING,
          })),
        },
      },
      select: { id: true },
    });

    return { planId: created.id, analysisAvailable: true };
  }

  buildDraft(payload: {
    summary: string;
    weaknesses: Array<{
      area: string;
      severity?: string;
      description: string;
      evidence?: string | null;
    }>;
    risks: Array<{ area: string; severity?: string; description: string }>;
    recommendations: Array<{ title: string; priority: string; reason: string }>;
  }): GeneratedPlan {
    const priorityMap: Record<string, CoachingActionPriority> = {
      HIGH: 'HIGH',
      MEDIUM: 'MEDIUM',
      LOW: 'LOW',
    };

    const objectives: GeneratedObjective[] = [];

    for (const recommendation of payload.recommendations.slice(0, 4)) {
      objectives.push({
        title: recommendation.title,
        description: recommendation.reason || '',
        priority: priorityMap[recommendation.priority] ?? 'MEDIUM',
        currentScore: null,
        targetScore: null,
        targetArea: 'general',
      });
    }

    const weakPoints = [...payload.weaknesses, ...payload.risks]
      .filter((w) => (w.severity ?? 'MEDIUM') === 'HIGH')
      .slice(0, 3);
    for (const weak of weakPoints) {
      if (objectives.some((o) => o.title.toLowerCase().includes(weak.area)))
        continue;
      objectives.push({
        title: `Réduire le risque : ${weak.area}`,
        description: weak.description,
        priority: 'HIGH',
        currentScore: null,
        targetScore: null,
        targetArea: weak.area,
      });
    }

    const targetAreas = [
      ...new Set(
        payload.weaknesses
          .map((w) => w.area)
          .concat(objectives.map((o) => o.targetArea)),
      ),
    ].slice(0, 6);

    return {
      title: "Plan d'amélioration (proposition IA)",
      description: payload.summary,
      targetAreas,
      objectives: objectives.slice(0, 6),
    };
  }
}
