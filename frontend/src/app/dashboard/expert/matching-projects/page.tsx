'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { expertService } from '@/services/expert.service';
import {
  LoadingState,
  Badge,
  ErrorAlert,
  Button,
} from '@/components/shared/ui';
import { ArrowLeft, Target, TrendingUp, ExternalLink } from 'lucide-react';
import type { MatchedProject } from '@/types/expert';
import { getErrorMessage } from '@/lib/utils';

export default function MatchedProjectsPage() {
  const [projects, setProjects] = useState<MatchedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await expertService.getMatchedProjects(10);
        setProjects(data || []);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <Link href="/dashboard/expert" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Retour
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projets correspondants</h1>
          <p className="text-gray-600 mt-1">
            Projets des cohortes ouvertes ou en cours, alignés sur votre profil d&apos;expert
          </p>
        </div>
        <Link
          href="/dashboard/expert/recommendations"
          className="inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors"
        >
          <Target className="w-4 h-4" />
          Recommandations IA
        </Link>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorAlert message={error} />
        </div>
      )}

      {loading ? (
        <LoadingState label="Analyse des projets en cours…" />
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">🗂️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun projet correspondant</h3>
          <p className="text-gray-600">
            Aucun projet issu des cohortes ouvertes ne correspond pour le moment à votre profil. Revenez plus tard.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((entry) => (
            <div key={entry.project.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex sm:flex-col items-start gap-2 sm:w-24 shrink-0">
                  <div
                    className={`flex items-center justify-center w-16 h-16 rounded-2xl text-xl font-bold ${
                      entry.score >= 70
                        ? 'bg-green-100 text-green-700'
                        : entry.score >= 40
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {entry.score}%
                  </div>
                  {entry.cohort && <Badge variant="blue">{entry.cohort.name}</Badge>}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900">{entry.project.name}</h3>
                  {entry.project.description && (
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{entry.project.description}</p>
                  )}

                  {entry.requirements.requiredAreaNames.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span className="text-xs font-medium text-gray-500">Domaines requis&nbsp;:</span>
                      {entry.requirements.requiredAreaNames.map((name) => (
                        <span key={name} className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full">
                          {name}
                        </span>
                      ))}
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                        {entry.requirements.minYearsExperience} ans min.
                      </span>
                    </div>
                  )}

                  <p className="mt-3 text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-lg p-3">
                    {entry.explanation}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2 text-sm">
                    <span className="inline-flex items-center gap-1.5 text-gray-600">
                      <Target className="w-4 h-4 text-gray-400" />
                      Compétences&nbsp;: {entry.skillsMatch.matched}/{entry.skillsMatch.required}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-gray-600">
                      <TrendingUp className="w-4 h-4 text-gray-400" />
                      Expérience&nbsp;: {entry.experienceMatch.years} / {entry.experienceMatch.required} ans
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={`/dashboard/expert/recommendations?projectId=${entry.project.id}`}
                    >
                      <Button variant="secondary" size="sm">
                        <ExternalLink className="w-4 h-4" />
                        Voir les experts recommandés
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}