'use client';

import ExpertRecommendationsView from '@/components/recommendations/ExpertRecommendationsView';

/**
 * Espace expert : consultation en lecture seule des experts recommandés.
 * L'affectation (projet/cohorte) est réalisée par l'incubateur.
 */
export default function ExpertRecommendationsPage() {
  return <ExpertRecommendationsView mode="expert" canAssign={false} />;
}
