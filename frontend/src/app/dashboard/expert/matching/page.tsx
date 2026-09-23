'use client';

import { useState } from 'react';
import Link from 'next/link';

import { Button } from '@/components/shared/ui';
import { ArrowLeft, Target, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { ExpertiseArea } from '@/types/expert';
import { useExpertMatching } from '@/hooks/expert/useExpertMatching';
import { useExpertiseAreas } from '@/hooks/expert/useExpertiseAreas';

export default function ExpertMatchingPage() {
  const { matchProject, matchResult, matching, error, clearMatch } = useExpertMatching();
  const { allAreas, groupedAreas, loading } = useExpertiseAreas();
  
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [minYears, setMinYears] = useState<number>(3);
  const [hasMatched, setHasMatched] = useState(false);

  const handleMatch = async () => {
    if (selectedAreas.length === 0) return;
    await matchProject(selectedAreas, minYears);
    setHasMatched(true);
  };

  const toggleArea = (id: string) => {
    setSelectedAreas(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const resetMatch = () => {
    clearMatch();
    setHasMatched(false);
    setSelectedAreas([]);
    setMinYears(3);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <Link href="/dashboard/expert" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Retour
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Matching avec projets</h1>
          <p className="text-gray-600 mt-1">Trouvez les projets qui correspondent à votre profil</p>
        </div>
        {hasMatched && (
          <Button variant="secondary" onClick={resetMatch}>
            Nouvelle recherche
          </Button>
        )}
      </div>

      {!hasMatched ? (
        <div className="space-y-6">
          {/* Sélection des expertises */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">1. Domaines requis</h2>
            <div className="space-y-4">
              {Object.entries(groupedAreas).map(([category, areas]) => (
                <div key={category}>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">{category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {(areas as ExpertiseArea[]).map(area => (
                      <button key={area.id}
                        type="button"
                        onClick={() => toggleArea(area.id)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                          selectedAreas.includes(area.id)
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {area.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expérience minimale */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">2. Expérience minimale</h2>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="20"
                value={minYears}
                onChange={(e) => setMinYears(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-lg font-semibold text-gray-900 min-w-[80px]">
                {minYears} ans
              </span>
            </div>
          </div>

          {/* Bouton match */}
          <Button
            variant="primary"
            size="lg"
            onClick={handleMatch}
            disabled={selectedAreas.length === 0 || matching}
            loading={matching}
            fullWidth
          >
            <Target className="w-4 h-4 mr-2" />
            Trouver ma compatibilité
          </Button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}
        </div>
      ) : (
        /* Résultats du matching */
        <div className="space-y-6">
          {/* Score global */}
          <div className={`p-6 rounded-xl border-2 ${
            matchResult && matchResult.matchPercentage >= 70
              ? 'bg-green-50 border-green-200'
              : matchResult && matchResult.matchPercentage >= 40
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                {matchResult?.matchPercentage}%
              </div>
              <p className="text-gray-600">Taux de compatibilité</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full mt-4 h-3">
              <div 
                className={`h-3 rounded-full transition-all ${
                  matchResult && matchResult.matchPercentage >= 70
                    ? 'bg-green-600'
                    : matchResult && matchResult.matchPercentage >= 40
                    ? 'bg-yellow-600'
                    : 'bg-gray-600'
                }`}
                style={{ width: `${matchResult?.matchPercentage}%` }}
              />
            </div>
          </div>

          {/* Détails du matching */}
          {matchResult && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Détails de l'évaluation</h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`w-5 h-5 ${matchResult.details.skillsMatch.matched > 0 ? 'text-green-600' : 'text-gray-400'}`} />
                    <span>Compétences requises</span>
                  </div>
                  <span className="font-semibold">
                    {matchResult.details.skillsMatch.matched}/{matchResult.details.skillsMatch.required}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-gray-400" />
                    <span>Expérience</span>
                  </div>
                  <span>
                    {matchResult.details.experienceMatch.years} / {matchResult.details.experienceMatch.required} ans requis
                  </span>
                </div>
                
                {matchResult.details.availabilityBonus && (
                  <div className="flex items-center justify-between text-green-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      <span>Bonus disponibilité</span>
                    </div>
                    <span>+10%</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="secondary" onClick={resetMatch} fullWidth>
              Nouvelle recherche
            </Button>
            <Button variant="primary" fullWidth>
              Voir les projets correspondants
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}