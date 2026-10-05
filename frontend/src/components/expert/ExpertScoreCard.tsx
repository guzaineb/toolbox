// components/expert/ExpertScoreCard.tsx
'use client';

import { ExpertScore } from '@/types/expert';
import { TrendingUp, Briefcase, Layers, Clock } from 'lucide-react';

interface ExpertScoreCardProps {
  score: ExpertScore;
  compact?: boolean;
}

export function ExpertScoreCard({ score, compact = false }: ExpertScoreCardProps) {
  if (compact) {
    return (
      <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white p-4 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-80">Score expert</p>
            <p className="text-3xl font-bold">{score.score}/100</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
            <TrendingUp className="w-8 h-8" />
          </div>
        </div>
        <div className="w-full bg-white/20 rounded-full mt-3 h-2">
          <div className="bg-green-400 h-2 rounded-full transition-all" style={{ width: `${score.score}%` }} />
        </div>
      </div>
    );
  }

  const details = [
    { icon: Briefcase, label: 'Expérience', value: `${score.details.experience.years} ans`, score: score.details.experience.score },
    { icon: Layers, label: 'Expertises', value: `${score.details.diversity.count} domaines`, score: score.details.diversity.score },
    { icon: TrendingUp, label: 'Niveau moyen', value: score.details.levels.average.toFixed(1), score: score.details.levels.score },
    { icon: Clock, label: 'Disponibilité', value: score.details.availability.status === 'AVAILABLE' ? 'Disponible' : score.details.availability.status === 'BUSY' ? 'Occupé' : 'Indisponible', score: score.details.availability.score },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Score d'expertise</h3>
        <div className="text-3xl font-bold text-gray-900">{score.score}<span className="text-lg text-gray-500">/100</span></div>
      </div>
      
      <div className="space-y-4">
        {details.map((detail, index) => (
          <div key={index}>
            <div className="flex items-center justify-between text-sm mb-1">
              <div className="flex items-center gap-2">
                <detail.icon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{detail.label}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-900 font-medium">{detail.value}</span>
                <span className="text-gray-500 text-xs w-8 text-right">{Math.round(detail.score)} pts</span>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-gray-900 h-1.5 rounded-full transition-all" style={{ width: `${(detail.score / 30) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}