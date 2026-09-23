'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Settings, Plus, X, TrendingUp, Users, Award,
  Calendar, Briefcase, Target, Clock, Star, Edit3, CheckCircle, AlertCircle,
  ClipboardCheck, HeartHandshake
} from 'lucide-react';
import { Button, Card } from '@/components/shared/ui';
import { AvailabilityBadge } from '@/components/expert/AvailabilityBadge';
import { ExpertiseSelector } from '@/components/expert/ExpertiseSelector';
import { LEVEL_LABELS, LEVEL_COLORS, ExpertiseLevel } from '@/types/expert';
import { useExpertScore } from '@/hooks/expert/useExpertScore';
import { useExpertiseAreas } from '@/hooks/expert/useExpertiseAreas';
import { useExpertProfile } from '@/hooks/expert/useExpertProfile';
import { AvailabilityModal } from '@/components/expert/AvailabilityModal';
import { ExpertiseManagementModal } from '@/components/expert/ExpertiseManagementModal';

// Composant de notification toast
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bg = type === 'success' ? 'bg-green-50 border-green-300 text-green-800' : 'bg-red-50 border-red-300 text-red-800';
  const Icon = type === 'success' ? CheckCircle : AlertCircle;

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg border shadow-lg ${bg}`}>
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

export default function ExpertDashboardPage() {
  const {
    profile, loading, updateAvailability, removeExpertise,
    addExpertise, updateExpertiseLevel, saving, refetch
  } = useExpertProfile();
  const { score, loading: scoreLoading, refetch: refetchScore } = useExpertScore();
  const { allAreas, groupedAreas, loading: areasLoading } = useExpertiseAreas();

  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [showExpertiseModal, setShowExpertiseModal] = useState(false);
  const [editingExpertise, setEditingExpertise] = useState<{
    connectionId: string;
    areaId: string;
    areaName: string;
    level: ExpertiseLevel;
    years: number;
  } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expertiseToDelete, setExpertiseToDelete] = useState<{
    areaId: string;
    areaName: string;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  // Rafraîchir les données après chaque mutation
  const refreshData = async () => {
    await refetch();
    await refetchScore();
  };

  if (loading || scoreLoading || areasLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-moss" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🧠</div>
          <h1 className="font-syne text-2xl font-extrabold text-ink mb-2">Créez votre profil expert</h1>
          <p className="text-ink3 mb-6 max-w-md mx-auto">
            Devenez expert et soyez sollicité pour accompagner des projets innovants
          </p>
          <Link href="/dashboard/expert/create">
            <Button variant="primary" size="lg">+ Créer mon profil expert</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Statistiques
  const totalExpertises = profile.expertiseConnections?.length || 0;
  const avgLevel = profile.expertiseConnections?.reduce((acc, conn) => {
    const levelValue = { junior: 1, intermediate: 2, senior: 3, expert: 4 }[conn.level] || 0;
    return acc + levelValue;
  }, 0) / (totalExpertises || 1);

  const levelDistribution = {
    junior: profile.expertiseConnections?.filter(c => c.level === 'junior').length || 0,
    intermediate: profile.expertiseConnections?.filter(c => c.level === 'intermediate').length || 0,
    senior: profile.expertiseConnections?.filter(c => c.level === 'senior').length || 0,
    expert: profile.expertiseConnections?.filter(c => c.level === 'expert').length || 0,
  };

  const handleAddExpertise = async (areaId: string, level: ExpertiseLevel, years: number) => {
    try {
      await addExpertise({ expertiseAreaId: areaId, level, years_of_experience: years });
      await refreshData();
      showToast('Expertise ajoutée avec succès', 'success');
      setShowExpertiseModal(false);
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de l’ajout', 'error');
    }
  };

  const handleUpdateExpertise = async (areaId: string, level: ExpertiseLevel, years: number) => {
    try {
      await updateExpertiseLevel(areaId, level, years);
      await refreshData();
      showToast('Expertise mise à jour', 'success');
      setShowExpertiseModal(false);
      setEditingExpertise(null);
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la mise à jour', 'error');
    }
  };

  const handleRemoveExpertise = (areaId: string, areaName: string) => {
    setExpertiseToDelete({ areaId, areaName });
    setShowDeleteConfirm(true);
  };

  const handleDeleteExpertise = async () => {
    if (!expertiseToDelete) return;

    try {
      await removeExpertise(expertiseToDelete.areaId);
      await refreshData();
      showToast(`"${expertiseToDelete.areaName}" a été supprimé`, 'success');
      setShowDeleteConfirm(false);
      setExpertiseToDelete(null);
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la suppression', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="font-syne text-2xl font-extrabold text-ink">Tableau de bord expert</h1>
          <p className="text-ink3 mt-1">Gérez votre profil et suivez votre impact</p>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0 flex-wrap">
          <Link href="/dashboard/expert/evaluations">
            <Button variant="secondary" size="sm">
              <ClipboardCheck className="w-4 h-4 mr-2" />
              À évaluer
            </Button>
          </Link>
          <Link href="/dashboard/expert/coachings">
            <Button variant="secondary" size="sm">
              <HeartHandshake className="w-4 h-4 mr-2" />
              Suivi coaching
            </Button>
          </Link>
          <Link href="/dashboard/expert/matching">
            <Button variant="secondary" size="sm">
              <Target className="w-4 h-4 mr-2" />
              Matching projets
            </Button>
          </Link>
          <Link href="/dashboard/expert/edit">
            <Button variant="primary" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Modifier le profil
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h2 className="text-xl font-semibold text-ink">{profile.headline}</h2>
                  <AvailabilityBadge status={profile.availability_status} size="md" />
                </div>
                {(profile.organization || profile.position) && (
                  <p className="text-ink2">
                    {profile.position}{profile.position && profile.organization && ' chez '}{profile.organization}
                  </p>
                )}
                {profile.years_of_experience && (
                  <p className="text-sm text-ink3 mt-1 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    {profile.years_of_experience} ans d'expérience globale
                  </p>
                )}
              </div>
            </div>
            {profile.bio && (
              <p className="text-ink mt-4 border-t border-border pt-4">{profile.bio}</p>
            )}
            {profile.linkedin_url && (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-moss hover:text-moss/80 mt-4"
              >
                Voir profil LinkedIn →
              </a>
            )}
          </Card>

          {/* Expertises */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-ink">Mes domaines d'expertise</h3>
              <Button variant="primary" size="sm" onClick={() => setShowExpertiseModal(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Gérer
              </Button>
            </div>
            {totalExpertises === 0 ? (
              <div className="text-center py-8">
                <p className="text-ink3">Aucun domaine d'expertise renseigné</p>
                <Button variant="secondary" size="sm" className="mt-3" onClick={() => setShowExpertiseModal(true)}>
                  Ajouter mes expertises
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {profile.expertiseConnections.map((conn) => (
                  <div key={conn.id} className="flex items-center justify-between p-3 bg-moss/[.03] rounded-lg border border-moss/10">
                    <div>
                      <p className="font-medium text-ink">{conn.expertiseArea.name}</p>
                      <div className="flex items-center gap-2 text-sm text-ink3 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${LEVEL_COLORS[conn.level]}`}>
                          {LEVEL_LABELS[conn.level]}
                        </span>
                        <span>•</span>
                        <span>{conn.years_of_experience} ans</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingExpertise({
                            connectionId: conn.id,
                            areaId: conn.expertiseArea.id,
                            areaName: conn.expertiseArea.name,
                            level: conn.level,
                            years: conn.years_of_experience,
                          });
                          setShowExpertiseModal(true);
                        }}
                        className="text-moss hover:text-moss/80"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveExpertise(conn.expertiseArea.id, conn.expertiseArea.name)}
                        disabled={saving}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Colonne droite - stats */}
        <div className="space-y-6">
          {score && (
            <div className="bg-gradient-to-r from-moss-dark to-moss text-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium opacity-80">Score d'expertise</p>
                  <p className="text-4xl font-bold">{score.score}/100</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8" />
                </div>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div className="bg-white/80 h-2 rounded-full" style={{ width: `${score.score}%` }} />
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Expérience</span>
                  <span>{Math.round(score.details.experience.score)}/30</span>
                </div>
                <div className="flex justify-between">
                  <span>Diversité</span>
                  <span>{Math.round(score.details.diversity.score)}/20</span>
                </div>
                <div className="flex justify-between">
                  <span>Niveaux</span>
                  <span>{Math.round(score.details.levels.score)}/30</span>
                </div>
                <div className="flex justify-between">
                  <span>Disponibilité</span>
                  <span>{Math.round(score.details.availability.score)}/20</span>
                </div>
              </div>
            </div>
          )}

          <Card className="p-6">
            <h3 className="text-sm font-semibold text-ink3 uppercase tracking-wider mb-4">Statistiques détaillées</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-ink3" />
                  <span className="text-ink2">Total expertises</span>
                </div>
                <span className="font-semibold text-ink">{totalExpertises}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-ink3" />
                  <span className="text-ink2">Niveau moyen</span>
                </div>
                <span className="font-semibold text-ink">{avgLevel.toFixed(1)}/4</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-ink3" />
                  <span className="text-ink2">Statut</span>
                </div>
                <AvailabilityBadge status={profile.availability_status} size="sm" showLabel={false} />
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-ink3" />
                  <span className="text-ink2">Membre depuis</span>
                </div>
                <span className="font-semibold text-ink">
                  {new Date(profile.created_at || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-semibold text-ink3 uppercase tracking-wider mb-4">Distribution des niveaux</h3>
            <div className="space-y-3">
              {Object.entries(levelDistribution).map(([level, count]) => {
                const percent = totalExpertises ? (count / totalExpertises) * 100 : 0;
                let color = '';
                if (level === 'junior') color = 'bg-blue-500';
                else if (level === 'intermediate') color = 'bg-green-500';
                else if (level === 'senior') color = 'bg-yellow-500';
                else color = 'bg-purple-500';
                return (
                  <div key={level}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize">{level}</span>
                      <span>{count}</span>
                    </div>
                    <div className="w-full bg-moss/10 rounded-full h-2">
                      <div className={`${color} h-2 rounded-full`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <button
            onClick={() => setShowAvailabilityModal(true)}
            className="w-full bg-moss/[.03] hover:bg-moss/10 rounded-xl p-4 text-left transition-colors border border-moss/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink">Changer ma disponibilité</p>
                <p className="text-xs text-ink3 mt-1">Modifiez votre statut pour être visible</p>
              </div>
              <Clock className="w-5 h-5 text-moss" />
            </div>
          </button>
        </div>
      </div>

      {/* Modals */}
      {showAvailabilityModal && (
        <AvailabilityModal
          currentStatus={profile.availability_status}
          onClose={() => setShowAvailabilityModal(false)}
          onUpdate={updateAvailability}
          showToast={showToast}
          refreshData={refreshData}
        />
      )}

      {showExpertiseModal && (
        <ExpertiseManagementModal
          allAreas={allAreas}
          groupedAreas={groupedAreas}
          currentExpertises={profile.expertiseConnections || []}
          editingExpertise={editingExpertise}
          onAdd={handleAddExpertise}
          onUpdate={handleUpdateExpertise}
          onClose={() => {
            setShowExpertiseModal(false);
            setEditingExpertise(null);
          }}
          saving={saving}
        />
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && expertiseToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Supprimer un domaine d’expertise
            </h3>
            <p className="text-gray-600 mb-4">
              Êtes-vous sûr de vouloir supprimer le domaine :
              <span className="font-semibold text-gray-900"> {expertiseToDelete.areaName}</span> ?
              Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setExpertiseToDelete(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteExpertise}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}