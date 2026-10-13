import { describe, it, expect } from 'vitest';
import {
  buildIncubatorProjectOptions,
  selectableCohorts,
} from './recommendation-context';
import type { Cohort, CohortParticipation } from '@/types/cohort';

function cohort(over: Partial<Cohort> & { id: string; name: string }): Cohort {
  return {
    current_participants: 0,
    status: 'OPEN',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    ...over,
  };
}

function participation(
  over: Partial<CohortParticipation> & { id: string; project_id: string },
): CohortParticipation {
  return {
    cohort_id: 'cohort-1',
    status: 'ACCEPTED',
    origin: 'APPLICATION',
    applied_at: '2026-01-01T00:00:00.000Z',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    ...over,
  };
}

describe('buildIncubatorProjectOptions', () => {
  it('keeps only accepted participations that expose a project', () => {
    const options = buildIncubatorProjectOptions([
      cohort({
        id: 'cohort-1',
        name: 'Promo 1',
        participations: [
          participation({
            id: 'p-1',
            project_id: 'proj-1',
            status: 'ACCEPTED',
            project: { id: 'proj-1', name: 'BioCare' },
          }),
          participation({
            id: 'p-2',
            project_id: 'proj-2',
            status: 'PENDING',
            project: { id: 'proj-2', name: 'AgriSmart' },
          }),
          participation({ id: 'p-3', project_id: 'proj-3', status: 'ACCEPTED' }),
        ],
      }),
    ]);

    expect(options).toEqual([
      {
        id: 'proj-1',
        label: 'BioCare',
        cohortId: 'cohort-1',
        cohortName: 'Promo 1',
      },
    ]);
  });

  it('deduplicates a project participating in several cohorts', () => {
    const options = buildIncubatorProjectOptions([
      cohort({
        id: 'cohort-1',
        name: 'Promo 1',
        participations: [
          participation({
            id: 'p-1',
            project_id: 'proj-1',
            cohort_id: 'cohort-1',
            project: { id: 'proj-1', name: 'EcoPack' },
          }),
        ],
      }),
      cohort({
        id: 'cohort-2',
        name: 'Promo 2',
        participations: [
          participation({
            id: 'p-2',
            project_id: 'proj-1',
            cohort_id: 'cohort-2',
            project: { id: 'proj-1', name: 'EcoPack' },
          }),
        ],
      }),
    ]);

    expect(options).toHaveLength(1);
    expect(options[0].cohortId).toBe('cohort-1');
  });

  it('returns an empty list when participations are absent', () => {
    expect(
      buildIncubatorProjectOptions([cohort({ id: 'cohort-1', name: 'Promo 1' })]),
    ).toEqual([]);
  });
});

describe('selectableCohorts', () => {
  it('drops archived cohorts only', () => {
    const selected = selectableCohorts([
      cohort({ id: 'c-1', name: 'Ouverte', status: 'OPEN' }),
      cohort({ id: 'c-2', name: 'Terminée', status: 'CLOSED' }),
      cohort({ id: 'c-3', name: 'Archivée', status: 'ARCHIVED' }),
    ]);

    expect(selected.map((c) => c.id)).toEqual(['c-1', 'c-2']);
  });
});
