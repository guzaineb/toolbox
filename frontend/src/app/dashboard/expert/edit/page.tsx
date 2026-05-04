'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button, Input, Field } from '@/components/shared/ui';
import { ArrowLeft, Save, Trash2, Plus } from 'lucide-react';
import { ExpertiseLevel, ExpertiseArea, SelectedExpertise } from '@/types/expert';
import { useExpertProfile } from '@/hooks/expert/useExpertProfile';
import { useExpertiseAreas } from '@/hooks/expert/useExpertiseAreas';



export default function ExpertEditPage() {
  const router = useRouter();
  const { 
    profile, loading, saveProfile, 
    addExpertise, updateExpertiseLevel, removeExpertise, 
    saving, deleteProfile, 
    refetch
  } = useExpertProfile();
  const { allAreas, groupedAreas, loading: loadingAreas } = useExpertiseAreas();
  const [form, setForm] = useState({
    headline: '',
    bio: '',
    organization: '',
    position: '',
    years_of_experience: '',
    linkedin_url: '',
  });
  const [expertises, setExpertises] = useState<SelectedExpertise[]>([]);
  const [localError, setLocalError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddExpertise, setShowAddExpertise] = useState(false);
  
  // États pour le nouveau domaine d'expertise
  const [newExpertiseAreaId, setNewExpertiseAreaId] = useState('');
  const [newExpertiseLevel, setNewExpertiseLevel] = useState<ExpertiseLevel>('intermediate');
  const [newExpertiseYears, setNewExpertiseYears] = useState('');

  useEffect(() => {
    if (profile) {
      setForm({
        headline: profile.headline || '',
        bio: profile.bio || '',
        organization: profile.organization || '',
        position: profile.position || '',
        years_of_experience: profile.years_of_experience?.toString() || '',
        linkedin_url: profile.linkedin_url || '',
      });
      setExpertises(
        profile.expertiseConnections?.map(conn => ({
          id: conn.id,
          areaId: conn.expertiseArea.id,
          areaName: conn.expertiseArea.name,
          level: conn.level,
          yearsOfExperience: conn.years_of_experience,
          connectionId: conn.id, // Stocker l'ID de connexion
        })) || []
      );
    }
  }, [profile]);

  useEffect(() => {
    if (!loading && !profile) {
      router.push('/dashboard/expert/create');
    }
  }, [loading, profile, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    
    if (!form.headline.trim()) {
      setLocalError('Le titre professionnel est requis');
      return;
    }
    
    try {
      // Ne pas envoyer les expertiseAreaIds car elles sont gérées séparément
      await saveProfile({
        headline: form.headline,
        bio: form.bio || undefined,
        organization: form.organization || undefined,
        position: form.position || undefined,
        years_of_experience: form.years_of_experience ? parseInt(form.years_of_experience) : undefined,
        linkedin_url: form.linkedin_url || undefined,
      });
      router.push('/dashboard/expert');
    } catch (err: any) {
      setLocalError(err.message);
    }
  };

  const handleDelete = async () => {
    await deleteProfile();
    router.push('/dashboard/expert');
  };

  const handleUpdateExpertise = async (connectionId: string, areaId: string, level: ExpertiseLevel, years: number) => {
    try {
      // Utiliser l'ID de connexion ou l'areaId selon ce que votre API attend
      await updateExpertiseLevel(areaId, level, years);
      await refetch(); // Rafraîchir pour obtenir les données à jour
    } catch (err: any) {
      setLocalError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleRemoveExpertise = async (areaId: string) => {
    try {
      await removeExpertise(areaId);
      await refetch(); // Rafraîchir pour mettre à jour la liste
    } catch (err: any) {
      setLocalError(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleAddExpertise = async () => {
    if (!newExpertiseAreaId) {
      setLocalError('Veuillez sélectionner un domaine d\'expertise.');
      return;
    }

    if (expertises.some(exp => exp.areaId === newExpertiseAreaId)) {
      setLocalError('Ce domaine d\'expertise est déjà ajouté à votre profil.');
      return;
    }

    const area = allAreas.find(a => a.id === newExpertiseAreaId);
    if (!area) {
      setLocalError('Domaine d\'expertise introuvable.');
      return;
    }

    let yearsOfExp: number | undefined = undefined;
    if (newExpertiseYears && newExpertiseYears.trim() !== '') {
      const parsed = parseInt(newExpertiseYears);
      if (!isNaN(parsed) && parsed > 0) {
        yearsOfExp = parsed;
      }
    }

    try {
      await addExpertise({
        expertiseAreaId: newExpertiseAreaId,
        level: newExpertiseLevel,
        years_of_experience: yearsOfExp,
      });
      await refetch(); // Rafraîchir le profil pour obtenir la nouvelle expertise
      setShowAddExpertise(false);
      setNewExpertiseAreaId('');
      setNewExpertiseLevel('intermediate');
      setNewExpertiseYears('');
      setLocalError('');
    } catch (err: any) {
      if (err.response?.status === 409) {
        setLocalError('Ce domaine d\'expertise est déjà associé à votre profil (conflit).');
      } else {
        setLocalError(err.response?.data?.message || 'Erreur lors de l\'ajout. Veuillez réessayer.');
      }
    }
  };

  if (loading || loadingAreas) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto py-12">
      <Link href="/dashboard/expert" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Retour au dashboard
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Modifier mon profil expert</h1>
      <p className="text-gray-600 mb-6">Mettez à jour vos informations professionnelles</p>

      {localError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {localError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations professionnelles */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Identité professionnelle</h2>
          
          <Field label="Titre professionnel *">
            <Input 
              value={form.headline} 
              onChange={(e) => setForm({...form, headline: e.target.value})} 
              placeholder="Ex: Expert en Product Management" 
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Organisation">
              <Input 
                value={form.organization} 
                onChange={(e) => setForm({...form, organization: e.target.value})} 
                placeholder="Startup Academy" 
              />
            </Field>
            <Field label="Poste">
              <Input 
                value={form.position}  
                onChange={(e) => setForm({...form, position: e.target.value})} 
                placeholder="Directeur"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Années d'expérience">
              <Input 
                type="number" 
                value={form.years_of_experience} 
                onChange={(e) => setForm({...form, years_of_experience: e.target.value})} 
                placeholder="5" 
              />
            </Field>
            <Field label="LinkedIn">
              <Input 
                type="url" 
                value={form.linkedin_url} 
                onChange={(e) => setForm({...form, linkedin_url: e.target.value})} 
                placeholder="https://linkedin.com/in/..."
              />
            </Field>
          </div>
          
          <Field label="Biographie">
            <textarea 
              rows={4} 
              value={form.bio} 
              onChange={(e) => setForm({...form, bio: e.target.value})} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900" 
              placeholder="Décrivez votre parcours..."
            />
          </Field>
        </div>

        {/* Gestion des expertises */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Mes domaines d'expertise</h2>
            <button
              type="button"
              onClick={() => {
                setLocalError('');
                setNewExpertiseAreaId('');
                setNewExpertiseLevel('intermediate');
                setNewExpertiseYears('');
                setShowAddExpertise(true);
              }}
              className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
              disabled={saving}
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </button>
          </div>
          
          {expertises.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucun domaine sélectionné.</p>
          ) : (
            <div className="space-y-4">
              {expertises.map(exp => (
                <div key={exp.id} className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900 min-w-[180px]">{exp.areaName}</span>
                  <select
                    value={exp.level}
                    onChange={(e) => handleUpdateExpertise(
                      exp.connectionId || exp.id, 
                      exp.areaId, 
                      e.target.value as ExpertiseLevel, 
                      exp.yearsOfExperience
                    )}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900"
                    disabled={saving}
                  >
                    <option value="junior">Junior</option>
                    <option value="intermediate">Intermédiaire</option>
                    <option value="senior">Senior</option>
                    <option value="expert">Expert</option>
                  </select>
                  <input
                    type="number"
                    value={exp.yearsOfExperience || ''}
                    onChange={(e) => {
                      const years = e.target.value === '' ? 0 : parseInt(e.target.value);
                      handleUpdateExpertise(
                        exp.connectionId || exp.id,
                        exp.areaId, 
                        exp.level, 
                        isNaN(years) ? 0 : years
                      );
                    }}
                    className="w-24 px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900"
                    placeholder="Années"
                    disabled={saving}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveExpertise(exp.areaId)}
                    className="ml-auto text-red-600 hover:text-red-800"
                    disabled={saving}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Boutons actions */}
        <div className="flex justify-between gap-3">
          <Button type="button" variant="danger" onClick={() => setShowDeleteConfirm(true)} disabled={saving}>
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer mon profil
          </Button>
          <div className="flex gap-3">
            <Link href="/dashboard/expert">
              <Button variant="secondary" disabled={saving}>Annuler</Button>
            </Link>
            <Button type="submit" variant="primary" loading={saving}>
              <Save className="w-4 h-4 mr-2" />
              Mettre à jour
            </Button>
          </div>
        </div>
      </form>

      {/* Modal suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Supprimer mon profil</h3>
            <p className="text-gray-600 mb-4">
              Êtes-vous sûr de vouloir supprimer votre profil expert ? Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)} 
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button 
                onClick={handleDelete} 
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ajout expertise */}
      {showAddExpertise && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Ajouter un domaine d'expertise</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Domaine *</label>
                <select
                  value={newExpertiseAreaId}
                  onChange={(e) => setNewExpertiseAreaId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                >
                  <option value="">Sélectionnez un domaine</option>
                  {Object.entries(groupedAreas).map(([category, areas]) => (
                    <optgroup key={category} label={category}>
                      {(areas as ExpertiseArea[]).map((area) => (
                        <option key={area.id} value={area.id}>{area.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Niveau *</label>
                <select
                  value={newExpertiseLevel}
                  onChange={(e) => setNewExpertiseLevel(e.target.value as ExpertiseLevel)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                >
                  <option value="junior">Junior</option>
                  <option value="intermediate">Intermédiaire</option>
                  <option value="senior">Senior</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Années d'expérience (optionnel)</label>
                <input
                  type="number"
                  value={newExpertiseYears}
                  onChange={(e) => setNewExpertiseYears(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                  placeholder="ex: 5"
                  min="0"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddExpertise(false);
                  setLocalError('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleAddExpertise}
                disabled={saving}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}