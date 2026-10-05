'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { expertService } from '@/services/expert.service';
import { cohortService } from '@/services/cohort.service';
import {
  LoadingState,
  Badge,
  ErrorAlert,
  SuccessAlert,
  Button,
} from '@/components/shared/ui';
import {
  ArrowLeft,
  Users,
  Briefcase,
  Star,
  Info,
  ExternalLink,
  UserCheck,
} from 'lucide-react';
import type { ExpertRecommendation, MatchedProject } from '@/types/expert';
import type { Cohort } from '@/types/cohort';
import { AVAILABILITY_LABELS } from '@/types/expert';
import { getErrorMessage } from '@/lib/utils';

function ExpertRecommendationsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialProjectId = searchParams.get('projectId') || '';
  const initialCohortId = searchParams.get('cohortId') || '';

  const [selectedType, setSelectedType] = useState<'jury' | 'coach'>('jury');
  const [projectId, setProjectId] = useState(initialProjectId);
  const [cohortId, setCohortId] = useState(initialCohortId);
  const [recommendations, setRecommendations] = useState<ExpertRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<'success' | 'error' | null>(null);

  const [matchedProjects, setMatchedProjects] = useState<MatchedProject[]>([]);
  const [openCohorts, setOpenCohorts] = useState<Cohort[]>([]);
  const [contextsLoading, setContextsLoading] = useState(true);

  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [assignedIds, setAssignedIds] = useState<Set<string>>(new Set());

  const hasContext = selectedType === 'jury' ? !!projectId : !!cohortId;

  // Contexte : projets correspondant au profil / cohortes ouvertes
  useEffect(() => {
    (async () => {
      setContextsLoading(true);
      try {
        const [projects, cohorts] = await Promise.all([
          expertService.getMatchedProjects(10),
          cohortService.getOpenCohorts().catch(() => []),
        ]);
        setMatchedProjects(projects || []);
        setOpenCohorts(cohorts || []);
      } finally {
        setContextsLoading(false);
      }
    })();
  }, []);

  // Synchronise la sélection dans l'URL (partageable)
  useEffect(() => {
    const params = new URLSearchParams();
    if (projectId) params.set('projectId', projectId);
    if (cohortId) params.set('cohortId', cohortId);
    const query = params.toString();
    router.replace(`/dashboard/expert/recommendations${query ? `?${query}` : ''}`, { scroll: false });
  }, [projectId, cohortId, router]);

  const loadRecommendations = useCallback(async () => {
    if (!hasContext) {
      setRecommendations([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data =
        selectedType === 'jury'
          ? await expertService.recommendJury(projectId, 5)
          : await expertService.recommendCoachs(cohortId, 5);
      setRecommendations(data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [selectedType, projectId, cohortId, hasContext]);

  useEffect(() => {
    void loadRecommendations();
  }, [loadRecommendations]);

  const switchType = (next: 'jury' | 'coach') => {
    setSelectedType(next);
    setRecommendations([]);
    setError(null);
    setActionMessage(null);
    setActionStatus(null);
  };

  const handleAssign = async (projectIdForRole: string, expertUserId: string, role: 'COACH' | 'JURY') => {
    setAssigningId(expertUserId);
    setActionMessage(null);
    setActionStatus(null);
    try {
      await expertService.assignToProject(projectIdForRole, expertUserId, role);
      setAssignedIds((prev) => new Set(prev).add(expertUserId));
      setActionMessage(`Expert ${role === 'COACH' ? 'coach' : 'jury'} affecté au projet avec succès.`);
      setActionStatus('success');
    } catch (err) {
      setActionMessage(getErrorMessage(err));
      setActionStatus('error');
    } finally {
      setAssigningId(null);
    }
  };

  const renderExpertCard = (rec: ExpertRecommendation, index: number) => {
    const expert = rec.expert;
    const displayName = expert.user?.profile
      ? `${expert.user.profile.first_name} ${expert.user.profile.last_name}`.trim()
      : expert.headline || 'Expert';
    const topAreas = (expert.expertiseConnections || [])
      .slice(0, 3)
      .map((c) => c.expertiseArea?.name)
      .filter(Boolean);
    const isAssigned = assignedIds.has(expert.id);
    const isAssigning = assigningId === expert.id;

    return (
      <div key={expert.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Score */}
          <div className="flex sm:flex-col items-start gap-2 sm:w-24 shrink-0">
            <div
              className={`flex items-center justify-center w-16 h-16 rounded-2xl text-xl font-bold ${
                rec.score >= 70
                  ? 'bg-green-100 text-green-700'
                  : rec.score >= 40
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {rec.score}%
            </div>
            <Badge variant={expert.availability_status === 'AVAILABLE' ? 'green' : 'amber'}>
              {AVAILABILITY_LABELS[expert.availability_status]}
            </Badge>
          </div>

          {/* Contenu */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h3 className="text-lg font-semibold text-gray-900">{expert.headline || displayName}</h3>
              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                #{index + 1}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-2">
              {displayName}
              {expert.years_of_experience !== undefined && expert.years_of_experience > 0 && (
                <> · {expert.years_of_experience} ans d&apos;expérience</>
              )}
            </p>

            {topAreas.length > 0 && (
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <Star className="w-4 h-4 text-yellow-500" />
                {topAreas.map((area) => (
                  <span key={area} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                    {area}
                  </span>
                ))}
              </div>
            )}

            {/* Explication IA */}
            {rec.explanation && (
              <p className="mt-3 text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-lg p-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                  Pourquoi cet expert&nbsp;?
                </span>
                {rec.explanation}
              </p>
            )}

            {/* Détails du score */}
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-500">Compétences</p>
                <p className="font-semibold text-gray-900">
                  {rec.skillsMatch.matched}/{rec.skillsMatch.required}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Expérience</p>
                <p className="font-semibold text-gray-900">
                  {rec.experienceMatch.years} / {rec.experienceMatch.required} ans
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Disponibilité</p>
                <p className="font-semibold text-gray-900">
                  {AVAILABILITY_LABELS[rec.availability]}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`/dashboard/expert/profile/${expert.id}`}
                className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Voir le profil
              </Link>
              {selectedType === 'jury' && projectId && rec.expert.user?.id && (
                isAssigned ? (
                  <span className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200">
                    <UserCheck className="w-4 h-4" />
                    Affecté au projet
                  </span>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={isAssigning}
                    disabled={isAssigning}
                    onClick={() => handleAssign(projectId, rec.expert.user!.id!, 'JURY')}
                  >
                    <UserCheck className="w-4 h-4" />
                    Affecter comme jury
                  </Button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <Link href="/dashboard/expert" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Retour
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Recommandations IA</h1>
        <p className="text-gray-600 mt-1">Experts recommandés à partir des exigences réelles du contexte sélectionné</p>
      </div>

      {/* Sélecteur de type */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => switchType('jury')}
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
          onClick={() => switchType('coach')}
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

      {/* Sélection du contexte (projet ou cohorte) */}
      <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200 space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Info className="w-4 h-4 text-gray-400" />
          <span>
            {selectedType === 'jury'
              ? 'Choisissez le projet pour lequel recommander des jurés'
              : 'Choisissez la cohorte pour laquelle recommander des coachs'}
          </span>
        </div>

        {contextsLoading ? (
          <div className="py-2 text-sm text-gray-500">Chargement du contexte…</div>
        ) : selectedType === 'jury' ? (
          matchedProjects.length === 0 ? (
            <p className="text-sm text-gray-500">
              Aucun projet en cohorte ouverte ou en cours ne correspond pour le moment à votre profil.
            </p>
          ) : (
            <select
              value={projectId}
              onChange={(e) => {
                setProjectId(e.target.value);
                setRecommendations([]);
                setError(null);
                setActionMessage(null);
                setActionStatus(null);
              }}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="">— Sélectionner un projet —</option>
              {matchedProjects.map((item) => (
                <option key={item.project.id} value={item.project.id}>
                  {item.project.name}
                  {item.cohort ? ` (${item.cohort.name})` : ''} — correspondance {item.score}%
                </option>
              ))}
            </select>
          )
        ) : openCohorts.length === 0 ? (
          <p className="text-sm text-gray-500">Aucune cohorte ouverte pour le moment.</p>
        ) : (
          <select
            value={cohortId}
            onChange={(e) => {
              setCohortId(e.target.value);
              setRecommendations([]);
              setError(null);
              setActionMessage(null);
              setActionStatus(null);
            }}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="">— Sélectionner une cohorte —</option>
            {openCohorts.map((cohort) => (
              <option key={cohort.id} value={cohort.id}>
                {cohort.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {actionMessage && actionStatus && (
        <div className="mb-6">
          {actionStatus === 'success' ? (
            <SuccessAlert message={actionMessage} />
          ) : (
            <ErrorAlert message={actionMessage} />
          )}
        </div>
      )}

      {error && (
        <div className="mb-6">
          <ErrorAlert message={error} />
        </div>
      )}

      {loading ? (
        <LoadingState label="Analyse des experts disponibles…" />
      ) : !hasContext ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-5xl mb-4 text-gray-300">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Contexte requis</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Sélectionnez un type de recommandation puis le projet ou la cohorte ci-dessus
            pour obtenir des propositions réelles.
          </p>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">🤖</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune recommandation</h3>
          <p className="text-gray-600">
            Aucun expert reporté n&apos;entre les exigences de votre profil pour ce contexte.
            Revenez plus tard.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec, index) => renderExpertCard(rec, index))}
        </div>
      )}
    </div>
  );
}

export default function ExpertRecommendationsPage() {
  return (
    <Suspense fallback={<LoadingState label="Chargement…" />}>
      <ExpertRecommendationsContent />
    </Suspense>
  );
}