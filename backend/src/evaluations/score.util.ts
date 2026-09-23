export interface CriterionLike {
  id: string;
  weight: number;
  max_score: number;
}

export interface ScoreLike {
  criterion_id: string;
  score: number;
  comment?: string | null;
}

export interface ComputationResult {
  total: number;
  total20: number;
  criterionResults: Array<{
    criterion_id: string;
    weight: number;
    max_score: number;
    score: number;
    percentage: number;
  }>;
}

export function computeWeightedScore(
  criteria: CriterionLike[],
  scores: ScoreLike[],
): ComputationResult {
  let total = 0;
  const criterionResults: ComputationResult['criterionResults'] = [];

  for (const criterion of criteria) {
    const found = scores.find((s) => s.criterion_id === criterion.id);
    const raw = found
      ? Math.max(0, Math.min(found.score, criterion.max_score))
      : 0;
    const percentage =
      criterion.max_score > 0 ? (raw / criterion.max_score) * 100 : 0;
    const contribution = (percentage / 100) * criterion.weight;
    total += contribution;

    criterionResults.push({
      criterion_id: criterion.id,
      weight: criterion.weight,
      max_score: criterion.max_score,
      score: raw,
      percentage: round2(percentage),
    });
  }

  const clamped = Math.max(0, Math.min(100, total));
  return {
    total: round2(clamped),
    total20: round2(clamped / 5),
    criterionResults,
  };
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
