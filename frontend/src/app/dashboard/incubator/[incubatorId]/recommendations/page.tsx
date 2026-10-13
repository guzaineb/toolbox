'use client';

import { useParams } from 'next/navigation';
import ExpertRecommendationsView from '@/components/recommendations/ExpertRecommendationsView';

/**
 * Espace incubateur : recommandation **et affectation** des experts
 * (jury d'un projet, coach d'une cohorte) au sein de l'incubateur.
 */
export default function IncubatorRecommendationsPage() {
  const { incubatorId } = useParams<{ incubatorId: string }>();

  return (
    <ExpertRecommendationsView
      mode="incubator"
      canAssign
      incubatorId={incubatorId}
    />
  );
}
