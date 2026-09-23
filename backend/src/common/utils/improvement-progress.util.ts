import {
  CoachingActionStatus,
  ImprovementObjectiveStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Fermeture de la boucle D6 : la progression d'un objectif lié à des actions
 * est pilotée par l'état réel de ces actions (% de COMPLETED hors annulées).
 * La progression du plan est la moyenne des progressions de ses objectifs.
 *
 * Règle (validée) : objectif sans action → progression inchangée (PATCH manuel) ;
 * objectif avec action → progression = 100 × (COMPLETED / (total − CANCELLED)).
 */

/** Recalcule la progression d'un objectif depuis ses actions, puis celle du plan. */
export async function recomputeObjectiveProgress(
  prisma: PrismaService,
  objectiveId: string,
) {
  const objective = await prisma.improvementObjective.findUnique({
    where: { id: objectiveId },
    select: { id: true, plan_id: true },
  });
  if (!objective) return;

  const actions = await prisma.coachingAction.findMany({
    where: { objective_id: objectiveId },
    select: { status: true },
  });

  if (actions.length > 0) {
    const relevant = actions.filter(
      (a) => a.status !== CoachingActionStatus.CANCELLED,
    );
    const denominator = relevant.length;
    const completed = relevant.filter(
      (a) => a.status === CoachingActionStatus.COMPLETED,
    ).length;
    const progress =
      denominator > 0 ? Math.round((completed / denominator) * 100) : 0;

    const status: ImprovementObjectiveStatus =
      progress >= 100
        ? ImprovementObjectiveStatus.COMPLETED
        : progress > 0
          ? ImprovementObjectiveStatus.IN_PROGRESS
          : ImprovementObjectiveStatus.PENDING;

    await prisma.improvementObjective.update({
      where: { id: objectiveId },
      data: { progress, status },
    });
  }

  await recomputePlanProgress(prisma, objective.plan_id);
}

/** Recalcule la progression globale d'un plan = moyenne des objectifs. */
export async function recomputePlanProgress(
  prisma: PrismaService,
  planId: string,
) {
  const objectives = await prisma.improvementObjective.findMany({
    where: { plan_id: planId },
    select: { progress: true },
  });
  if (objectives.length === 0) return;

  const avg = Math.round(
    objectives.reduce((sum, o) => sum + o.progress, 0) / objectives.length,
  );
  await prisma.improvementPlan.update({
    where: { id: planId },
    data: {
      progress: avg,
      ...(avg >= 100 ? { status: 'COMPLETED' } : {}),
    },
  });
}
