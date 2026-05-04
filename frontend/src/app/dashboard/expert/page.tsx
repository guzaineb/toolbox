'use client';

import { useState } from 'react';
import Link from 'next/link';

import { AvailabilityBadge } from '@/components/expert/AvailabilityBadge';
import { Button } from '@/components/shared/ui';
import { Settings, Plus, X,  TrendingUp,Users, Award, Calendar, Briefcase, Target, BarChart3,CheckCircle,Clock,Star} from 'lucide-react';
import { LEVEL_LABELS, LEVEL_COLORS, ExpertiseArea } from '@/types/expert';
import { useExpertScore } from '@/hooks/expert/useExpertScore';
import { useExpertiseAreas } from '@/hooks/expert/useExpertiseAreas';
import { useExpertProfile } from '@/hooks/expert/useExpertProfile';

export default function ExpertDashboardPage() {
  const { profile, loading, updateAvailability, removeExpertise, saving } = useExpertProfile();
  const { score, loading: scoreLoading } = useExpertScore();
  const { allAreas, groupedAreas, loading: areasLoading } = useExpertiseAreas();
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);

  if (loading || scoreLoading || areasLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="text-center">
          <div className="text-6xl mb-4">🧠</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Créez votre profil expert</h1>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Devenez expert et soyez sollicité pour accompagner des projets innovants
          </p>
          <Link href="/dashboard/expert/create">
            <Button variant="primary" size="lg">+ Créer mon profil expert</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Calcul des statistiques
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

  return (
    <div className="max-w-7xl mx-auto py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord expert</h1>
          <p className="text-gray-600 mt-1">Gérez votre profil et suivez votre impact</p>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
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
        <div className="lg:col-span-2 space-y-6">
          {/* Carte de profil */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h2 className="text-xl font-semibold text-gray-900">{profile.headline}</h2>
                  <AvailabilityBadge status={profile.availability_status} size="md" />
                </div>
                
                {(profile.organization || profile.position) && (
                  <p className="text-gray-600">
                    {profile.position}{profile.position && profile.organization && ' chez '}{profile.organization}
                  </p>
                )}
                
                {profile.years_of_experience && (
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    {profile.years_of_experience} ans d'expérience globale
                  </p>
                )}
              </div>
            </div>
            
            {profile.bio && (
              <p className="text-gray-700 mt-4 border-t border-gray-100 pt-4">{profile.bio}</p>
            )}
            
            {profile.linkedin_url && (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mt-4"
              >
                Voir profil LinkedIn →
              </a>
            )}
          </div>

          {/* Mes expertises sélectionnées */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Mes domaines d'expertise</h3>
              <Link href="/dashboard/expert/edit">
                <Button variant="ghost" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Gérer
                </Button>
              </Link>
            </div>
            
            {profile.expertiseConnections?.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Aucun domaine d'expertise renseigné</p>
                <Link href="/dashboard/expert/edit">
                  <Button variant="secondary" size="sm" className="mt-3">
                    Ajouter mes expertises
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {profile.expertiseConnections?.map(conn => (
                  <div key={conn.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{conn.expertiseArea.name}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${LEVEL_COLORS[conn.level]}`}>
                          {LEVEL_LABELS[conn.level]}
                        </span>
                        <span>•</span>
                        <span>{conn.years_of_experience} ans</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeExpertise(conn.expertiseArea.id)}
                      disabled={saving}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Colonne de droite - Statistiques et score */}
        <div className="space-y-6">
          {/* Score card */}
          {score && (
            <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-xl p-6">
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
                <div className="bg-green-400 h-2 rounded-full transition-all" style={{ width: `${score.score}%` }} />
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

          {/* Statistiques détaillées */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">  Statistiques détaillées  </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Total expertises</span>
                </div>
                <span className="font-semibold text-gray-900">{totalExpertises}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Niveau moyen</span>
                </div>
                <span className="font-semibold text-gray-900">{avgLevel.toFixed(1)}/4</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Statut</span>
                </div>
                <AvailabilityBadge status={profile.availability_status} size="sm" showLabel={false} />
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Membre depuis</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {new Date(profile.created_at || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Distribution des niveaux */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
              Distribution des niveaux
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Junior</span>
                  <span>{levelDistribution.junior}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(levelDistribution.junior / totalExpertises) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Intermédiaire</span>
                  <span>{levelDistribution.intermediate}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(levelDistribution.intermediate / totalExpertises) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Senior</span>
                  <span>{levelDistribution.senior}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(levelDistribution.senior / totalExpertises) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Expert</span>
                  <span>{levelDistribution.expert}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(levelDistribution.expert / totalExpertises) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Bouton changer disponibilité */}
          <button onClick={() => setShowAvailabilityModal(true)} className="w-full bg-gray-50 hover:bg-gray-100 rounded-xl p-4 text-left transition-colors border border-gray-200" >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Changer ma disponibilité</p>
                <p className="text-xs text-gray-500 mt-1">Modifiez votre statut pour être visible</p>
              </div>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
          </button>
        </div>
      </div>
      {showAvailabilityModal && (
        <AvailabilityModal currentStatus={profile.availability_status} onClose={() => setShowAvailabilityModal(false)} onUpdate={updateAvailability} />
      )}
    </div>
  );
}

// Modal pour la disponibilité
function AvailabilityModal({ currentStatus, onClose, onUpdate }: {
  currentStatus: string;
  onClose: () => void;
  onUpdate: (status: any) => Promise<void>;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    setUpdating(true);
    await onUpdate(status);
    setUpdating(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Changer ma disponibilité</h3>
        <div className="space-y-3 mb-6">
          {(['available', 'busy', 'unavailable'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                status === s ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <AvailabilityBadge status={s} size="lg" />
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Annuler
          </button>
          <button onClick={handleUpdate} disabled={updating} className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50">
            {updating ? 'Mise à jour...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}