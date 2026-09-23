'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button, Input, Field } from '@/components/shared/ui';
import { AvailabilityBadge } from '@/components/expert/AvailabilityBadge';
import { ArrowLeft, Check, User, Tag, FileCheck } from 'lucide-react';
import { ExpertiseArea, ExpertiseLevel, LEVEL_LABELS, LEVEL_COLORS, AvailabilityStatus, AddExpertiseDto } from '@/types/expert';
import { useExpertProfile } from '@/hooks/expert/useExpertProfile';
import { useExpertiseAreas } from '@/hooks/expert/useExpertiseAreas';

interface SelectedExpertise {
  areaId: string;
  areaName: string;
  level: ExpertiseLevel;
  yearsOfExperience: number;
}

export default function ExpertCreatePage() {
  const router = useRouter();
  const { saveProfile, addMultipleExpertises, saving, error: profileError } = useExpertProfile();
  const { allAreas, groupedAreas, loading: loadingAreas, error: areasError } = useExpertiseAreas();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    headline: '',
    bio: '',
    organization: '',
    position: '',
    years_of_experience: '',
    linkedin_url: '',
    availability_status: 'available' as AvailabilityStatus,
  });
  const [selectedExpertises, setSelectedExpertises] = useState<SelectedExpertise[]>([]);
  const [localError, setLocalError] = useState('');

  const steps = [
    { number: 1, title: 'Informations', icon: User },
    { number: 2, title: 'Expertises', icon: Tag },
    { number: 3, title: 'Confirmation', icon: FileCheck },
  ];

  const handleNext = () => {
    if (step === 1 && !form.headline.trim()) {
      setLocalError('Le titre professionnel est requis');
      return;
    }
    if (step === 2 && selectedExpertises.length === 0) {
      setLocalError('Sélectionnez au moins un domaine d\'expertise');
      return;
    }
    if (step < 3) {
      setStep(step + 1);
      setLocalError('');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setLocalError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ⚠️ NE PAS SOUMETTRE avant l'étape 3
    if (step !== 3) return;

    setLocalError('');

    if (selectedExpertises.length === 0) {
      setLocalError('Sélectionnez au moins un domaine d\'expertise');
      return;
    }

    try {
      const profile = await saveProfile({
        headline: form.headline,
        bio: form.bio,
        organization: form.organization,
        position: form.position,
        years_of_experience: form.years_of_experience ? parseInt(form.years_of_experience) : undefined,
        linkedin_url: form.linkedin_url,
        availability_status: form.availability_status,
        expertiseAreaIds: [],
      });

      const expertiseDtos: AddExpertiseDto[] = selectedExpertises.map(exp => ({
        expertiseAreaId: exp.areaId,
        level: exp.level,
        years_of_experience: exp.yearsOfExperience,
      }));

      if (expertiseDtos.length > 0) {
        await addMultipleExpertises(expertiseDtos);
      }

      router.push('/dashboard/expert');
    } catch (err: any) {
      setLocalError(err.message || 'Une erreur est survenue');
    }
  };

  const addExpertise = (area: ExpertiseArea) => {
    if (selectedExpertises.some(e => e.areaId === area.id)) {
      setSelectedExpertises(prev => prev.filter(e => e.areaId !== area.id));
    } else {
      const globalYears = form.years_of_experience ? parseInt(form.years_of_experience) : 0;
      setSelectedExpertises(prev => [...prev, {
        areaId: area.id,
        areaName: area.name,
        level: 'intermediate',
        yearsOfExperience: globalYears,
      }]);
    }
  };

  const removeExpertise = (areaId: string) => {
    setSelectedExpertises(prev => prev.filter(e => e.areaId !== areaId));
  };

  const updateExpertiseLevel = (areaId: string, level: ExpertiseLevel) => {
    setSelectedExpertises(prev => prev.map(e =>
      e.areaId === areaId ? { ...e, level } : e
    ));
  };

  const updateExpertiseYears = (areaId: string, yearsOfExperience: number) => {
    setSelectedExpertises(prev => prev.map(e =>
      e.areaId === areaId ? { ...e, yearsOfExperience } : e
    ));
  };

  const syncYearsWithGlobal = () => {
    const globalYears = form.years_of_experience ? parseInt(form.years_of_experience) : 0;
    setSelectedExpertises(prev => prev.map(exp => ({
      ...exp,
      yearsOfExperience: globalYears
    })));
  };

  if (loadingAreas) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-moss" />
      </div>
    );
  }

  if (areasError) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          Erreur : {areasError}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <Link href="/dashboard/expert" className="inline-flex items-center gap-2 text-sm text-ink3 hover:text-moss mb-6 transition">
        <ArrowLeft className="w-4 h-4" />
        Retour
      </Link>

      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((s, idx) => (
            <div key={s.number} className="flex-1 relative">
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                  s.number <= step
                    ? 'border-moss bg-moss text-white'
                    : 'border-border bg-surface text-ink3'
                }`}>
                  <s.icon className="w-5 h-5" />
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 transition-all ${
                    s.number < step ? 'bg-moss' : 'bg-border'
                  }`} />
                )}
              </div>
              <p className="text-xs text-ink3 mt-2">{s.title}</p>
            </div>
          ))}
        </div>
      </div>

      <h1 className="text-2xl font-syne font-extrabold text-ink mb-2">Créer mon profil expert</h1>
      <p className="text-ink3 mb-6">
        {step === 1 && 'Renseignez vos informations professionnelles et disponibilité'}
        {step === 2 && 'Sélectionnez vos domaines d\'expertise avec niveaux'}
        {step === 3 && 'Confirmez et créez votre profil'}
      </p>

      {(localError || profileError) && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {localError || profileError}
        </div>
      )}

      <form onSubmit={handleSubmit} onKeyDown={(e) => {
        if (step !== 3 && e.key === 'Enter') e.preventDefault();
      }}>
        {/* Étape 1 : Informations */}
        {step === 1 && (
          <div className="bg-white rounded-xl border border-border p-8 space-y-4 shadow-sm">
            <Field label="Titre professionnel *" required>
              <Input
                value={form.headline}
                onChange={(e) => setForm({...form, headline: e.target.value})}
                placeholder="Ex: Expert en Product Management"
                autoFocus
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Organisation">
                <Input value={form.organization} onChange={(e) => setForm({...form, organization: e.target.value})} placeholder="Startup Academy"/>
              </Field>
              <Field label="Poste">
                <Input value={form.position} onChange={(e) => setForm({...form, position: e.target.value})} placeholder="Directeur" />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Années d'expérience globale">
                <Input
                  type="number"
                  min="0"
                  max="50"
                  value={form.years_of_experience}
                  onChange={(e) => {
                    setForm({...form, years_of_experience: e.target.value});
                    if (selectedExpertises.length > 0 && window.confirm('Voulez-vous mettre à jour les années d\'expérience pour toutes vos expertises ?')) {
                      const years = e.target.value ? parseInt(e.target.value) : 0;
                      setSelectedExpertises(prev => prev.map(exp => ({ ...exp, yearsOfExperience: years })));
                    }
                  }}
                  placeholder="5"
                />
                <p className="text-xs text-ink3 mt-1">Utilisée par défaut pour vos expertises</p>
              </Field>
              <Field label="LinkedIn">
                <Input type="url" value={form.linkedin_url} onChange={(e) => setForm({...form, linkedin_url: e.target.value})} placeholder="https://linkedin.com/in/..." />
              </Field>
            </div>

            <Field label="Biographie">
              <textarea
                rows={3}
                value={form.bio}
                onChange={(e) => setForm({...form, bio: e.target.value})}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-moss/30 focus:border-moss"
                placeholder="Décrivez votre parcours, vos réalisations, ce qui vous passionne..."
              />
            </Field>

            <div>
              <label className="block text-sm font-medium text-ink2 mb-2">
                Disponibilité *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['available', 'busy', 'unavailable'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setForm({...form, availability_status: status})}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${
                      form.availability_status === status
                        ? 'border-moss bg-moss/[.04]'
                        : 'border-border hover:border-moss/40'
                    }`}
                  >
                    <AvailabilityBadge status={status} size="md" showLabel={true} />
                  </button>
                ))}
              </div>
              <p className="text-xs text-ink3 mt-2">
                Votre disponibilité détermine si vous serez visible pour les projets
              </p>
            </div>
          </div>
        )}

        {/* Étape 2 : Expertises */}
        {step === 2 && (
          <div className="space-y-6">
            {selectedExpertises.length > 0 && (
              <div className="bg-white rounded-xl border border-border p-8 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-ink">
                    Expertises sélectionnées ({selectedExpertises.length})
                  </h2>
                  {form.years_of_experience && (
                    <button
                      type="button"
                      onClick={syncYearsWithGlobal}
                      className="text-sm text-moss hover:text-moss/80 font-medium"
                    >
                      Synchroniser avec l'expérience globale
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {selectedExpertises.map((exp) => (
                    <div key={exp.areaId} className="p-4 bg-moss/[.03] rounded-lg border border-moss/10">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-ink">{exp.areaName}</h3>
                        <button
                          type="button"
                          onClick={() => removeExpertise(exp.areaId)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Retirer
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-ink2 mb-1">
                            Niveau d'expertise
                          </label>
                          <select
                            value={exp.level}
                            onChange={(e) => updateExpertiseLevel(exp.areaId, e.target.value as ExpertiseLevel)}
                            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-moss/30 focus:border-moss bg-white"
                          >
                            <option value="junior">Junior</option>
                            <option value="intermediate">Intermédiaire</option>
                            <option value="senior">Senior</option>
                            <option value="expert">Expert</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-ink2 mb-1">
                            Années d'expérience
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={exp.yearsOfExperience}
                            onChange={(e) => updateExpertiseYears(exp.areaId, parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-moss/30 focus:border-moss bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-border p-8 shadow-sm">
              <h2 className="text-lg font-semibold text-ink mb-4">
                Ajouter des domaines d'expertise
              </h2>
              <div className="space-y-4">
                {Object.entries(groupedAreas).map(([category, areas]) => {
                  const availableAreas = (areas as ExpertiseArea[]).filter(
                    area => !selectedExpertises.some(e => e.areaId === area.id)
                  );
                  if (availableAreas.length === 0) return null;
                  return (
                    <div key={category}>
                      <h3 className="text-md font-medium text-ink2 mb-2">{category}</h3>
                      <div className="flex flex-wrap gap-2">
                        {availableAreas.map((area) => (
                          <button
                            key={area.id}
                            type="button"
                            onClick={() => addExpertise(area)}
                            className="px-3 py-1.5 bg-moss/[.06] text-moss rounded-full text-sm hover:bg-moss/20 transition-colors"
                          >
                            + {area.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Étape 3 : Confirmation */}
        {step === 3 && (
          <div className="bg-white rounded-xl border border-border p-8 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-semibold text-ink">Récapitulatif</h3>
              <button type="button" onClick={() => setStep(1)} className="text-sm text-moss hover:text-moss/80">
                Modifier
              </button>
            </div>
            <div>
              <p className="text-sm text-ink3">Titre</p>
              <p className="font-medium text-ink">{form.headline}</p>
            </div>
            {(form.organization || form.position) && (
              <div>
                <p className="text-sm text-ink3">Poste</p>
                <p className="font-medium text-ink">
                  {form.position}{form.position && form.organization && ' chez '}{form.organization}
                </p>
              </div>
            )}
            {form.years_of_experience && (
              <div>
                <p className="text-sm text-ink3">Expérience globale</p>
                <p className="font-medium text-ink">{form.years_of_experience} ans</p>
              </div>
            )}
            <div>
              <p className="text-sm text-ink3">Disponibilité</p>
              <p className="font-medium text-ink">
                <AvailabilityBadge status={form.availability_status} size="md" />
              </p>
            </div>
            <div>
              <p className="text-sm text-ink3">Domaines d'expertise ({selectedExpertises.length})</p>
              <div className="space-y-2 mt-2">
                {selectedExpertises.map(exp => (
                  <div key={exp.areaId} className="flex items-center justify-between p-2 bg-moss/[.03] rounded border border-moss/10">
                    <span className="font-medium text-ink">{exp.areaName}</span>
                    <div className="text-sm text-ink2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${LEVEL_COLORS[exp.level]}`}>
                        {LEVEL_LABELS[exp.level]}
                      </span>
                      <span className="ml-2">{exp.yearsOfExperience} ans</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Boutons de navigation */}
        <div className="flex justify-between mt-6">
          {step > 1 && (
            <Button type="button" variant="secondary" onClick={handleBack}>
              Retour
            </Button>
          )}
          {step < 3 ? (
            <Button type="button" variant="primary" onClick={handleNext} className={step === 1 ? 'ml-auto' : ''}>
              Suivant
            </Button>
          ) : (
            <Button type="submit" variant="primary" loading={saving} className="ml-auto">
              <Check className="w-4 h-4 mr-2" />
              Créer mon profil
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}