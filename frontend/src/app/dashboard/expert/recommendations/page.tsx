'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { expertService } from '@/services/expert.service';
import { Button } from '@/components/shared/ui';
import { ArrowLeft, Star, Users, Briefcase, TrendingUp } from 'lucide-react';

interface Recommendation {
  id: string;
  headline: string;
  organization?: string;
  position?: string;
  matchPercentage: number;
  reason: string;
}

export default function ExpertRecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<'jury' | 'coach'>('jury');

  useEffect(() => {
    loadRecommendations();
  }, [selectedType]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      // Exemple - à adapter selon votre logique
      const data = selectedType === 'jury'
        ? await expertService.recommendJury('project-id-example', 5)
        : await expertService.recommendCoachs('cohort-id-example', 5);
      
      // Transformer les données
      setRecommendations(data.map((item: any, index: number) => ({
        id: item.id,
        headline: item.headline,
        organization: item.organization,
        position: item.position,
        matchPercentage: 85 - index * 5,
        reason: selectedType === 'jury' 
          ? 'Excellent alignement avec les compétences requises'
          : 'Expérience en mentoring et pédagogie avérée',
      })));
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <Link href="/dashboard/expert" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Retour
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Recommandations IA</h1>
        <p className="text-gray-600 mt-1">Suggestions personnalisées pour vous</p>
      </div>

      {/* Sélecteur de type */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setSelectedType('jury')}
          className={`flex-1 py-3 px-4 rounded-lg text-center transition-all ${
            selectedType === 'jury'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Users className="w-5 h-5 mx-auto mb-1" />
          Jury de projets
        </button>
        <button
          onClick={() => setSelectedType('coach')}
          className={`flex-1 py-3 px-4 rounded-lg text-center transition-all ${
            selectedType === 'coach'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Briefcase className="w-5 h-5 mx-auto mb-1" />
          Coach pour cohortes
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">🤖</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune recommandation</h3>
          <p className="text-gray-600">
            Nous n'avons pas trouvé de correspondances pour le moment.
            Revenez plus tard ou mettez à jour votre profil.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div key={rec.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{rec.headline}</h3>
                    <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">
                      {rec.matchPercentage}% match
                    </span>
                  </div>
                  
                  {(rec.organization || rec.position) && (
                    <p className="text-gray-600 text-sm mb-2">
                      {rec.position}{rec.position && rec.organization && ' chez '}{rec.organization}
                    </p>
                  )}
                  
                  <div className="flex items-start gap-2 mt-3">
                    <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600">{rec.reason}</p>
                  </div>
                </div>
                
                <Button variant="primary" size="sm">
                  Voir le profil
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}