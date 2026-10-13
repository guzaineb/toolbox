import type { Cohort } from '@/types/cohort';

/** Option de contexte servant à recommander des experts (projet → jurés). */
export interface RecommendationContextOption {
  id: string;
  label: string;
  cohortId: string;
  cohortName?: string;
  score?: number;
}

/**
 * Projets acceptés dans les cohortes d'un incubateur, dédoublonnés.
 * `GET /incubators/:id/cohorts` renvoie déjà les participations : une seule
 * requête suffit pour alimenter le sélecteur de projets.
 */
export function buildIncubatorProjectOptions(
  cohorts: Cohort[],
): RecommendationContextOption[] {
  const projects = new Map<string, RecommendationContextOption>();

  cohorts.forEach((cohort) => {
    (cohort.participations ?? []).forEach((participation) => {
      const project = participation.project;
      if (participation.status !== 'ACCEPTED' || !project) return;
      if (projects.has(project.id)) return;

      projects.set(project.id, {
        id: project.id,
        label: project.name,
        cohortId: cohort.id,
        cohortName: cohort.name,
      });
    });
  });

  return [...projects.values()];
}

/** Cohortes proposées en mode coach : toutes sauf les archivées. */
export function selectableCohorts(cohorts: Cohort[]): Cohort[] {
  return cohorts.filter((cohort) => cohort.status !== 'ARCHIVED');
}
