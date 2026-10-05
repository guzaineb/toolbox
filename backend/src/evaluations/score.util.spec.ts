import { computeWeightedScore } from './score.util';

describe('computeWeightedScore', () => {
  const criteria = [
    { id: 'c1', weight: 40, max_score: 5 },
    { id: 'c2', weight: 60, max_score: 10 },
  ];

  it('should compute a weighted total and the /20 equivalent from full scores', () => {
    const result = computeWeightedScore(criteria, [
      { criterion_id: 'c1', score: 5 },
      { criterion_id: 'c2', score: 10 },
    ]);

    expect(result.total).toBe(100);
    expect(result.total20).toBe(20);
    expect(result.criterionResults).toHaveLength(2);
    expect(result.criterionResults[0].percentage).toBe(100);
    expect(result.criterionResults[1].percentage).toBe(100);
  });

  it('should contribute 0 for a criterion without a score', () => {
    const result = computeWeightedScore(criteria, [
      { criterion_id: 'c2', score: 10 },
    ]);

    expect(result.criterionResults[0].score).toBe(0);
    expect(result.criterionResults[0].percentage).toBe(0);
    expect(result.total).toBe(60);
    expect(result.total20).toBe(12);
  });

  it('should clamp a raw score above the max to the max score', () => {
    const result = computeWeightedScore(criteria, [
      { criterion_id: 'c1', score: 7 },
      { criterion_id: 'c2', score: 3 },
    ]);

    expect(result.criterionResults[0].score).toBe(5);
    expect(result.criterionResults[0].percentage).toBe(100);
    expect(result.total).toBe(58);
  });

  it('should clamp the total to the [0, 100] range and round to 2 decimals', () => {
    const thirds = [
      { id: 'a', weight: 50, max_score: 3 },
      { id: 'b', weight: 50, max_score: 3 },
    ];
    const partial = computeWeightedScore(thirds, [
      { criterion_id: 'a', score: 1 },
      { criterion_id: 'b', score: 1 },
    ]);
    expect(partial.total).toBe(33.33);
    expect(partial.total20).toBe(6.67);

    const overflow = computeWeightedScore(criteria, [
      { criterion_id: 'c1', score: 5 },
      { criterion_id: 'c2', score: 10 },
    ]);
    expect(overflow.total).toBe(100);
  });
});
