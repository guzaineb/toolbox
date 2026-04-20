'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ErrorAlert, Field, Input, Select, Textarea, Button } from '@/components/shared/ui';
import { useExpertiseAreas } from '@/hooks/useExpertiseAreas';
import { useExpertProfile } from '@/hooks/useExpertProfile';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 1, label: 'Identité',      icon: '👤' },
  { id: 2, label: 'Expertise',     icon: '🎯' },
  { id: 3, label: 'Disponibilité', icon: '📅' },
];

export default function ExpertOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [ready, setReady] = useState(false); // ← attend que les deux fetches soient finis

  const {
    allAreas,
    selectedAreaIds,
    areaLevels,
    setSelectedAreaIds,
    setAreaLevels,
    toggleArea,
    updateAreaLevel,
    updateAreaYears,
    groupedAreas,
    fetchAreas,
  } = useExpertiseAreas();

  const {
    form,
    saving,
    error,
    updateFormField,
    saveProfile,
    fetchProfile,
  } = useExpertProfile();

  // ── Chargement initial ──────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const [, profile] = await Promise.all([fetchAreas(), fetchProfile()]);
      if (profile?.expertiseAreas?.length) {
        setSelectedAreaIds(profile.expertiseAreas.map((a: any) => a.id));
        const levels: Record<string, any> = {};
        profile.expertiseAreas.forEach((a: any) => {
          levels[a.id] = { id: a.id, level: a.level || 'Expert', years: a.years || 1 };
        });
        setAreaLevels(levels);
      }
      setReady(true); // ← seulement ici, après les deux fetches
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFinish = async () => {
    await saveProfile(selectedAreaIds);
    router.push('/dashboard/expert');
  };

  // ── Loading skeleton ────────────────────────────────────────────
  if (!ready) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="w-full max-w-[560px] animate-pulse space-y-4">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-border" />
          <div className="mx-auto h-7 w-64 bg-border rounded" />
          <div className="mx-auto h-4 w-48 bg-border rounded" />
          <div className="h-48 bg-border rounded-2xl mt-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-[560px]">

        {/* ── Header ── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-light text-[28px] mb-4">
            {STEPS[step - 1].icon}
          </div>
          <h1 className="font-display text-[28px] font-semibold mb-1">
            {step === 1 && 'Votre identité professionnelle'}
            {step === 2 && "Vos domaines d'expertise"}
            {step === 3 && 'Votre disponibilité'}
          </h1>
          <p className="text-[13px] text-text-2">
            {step === 1 && 'Présentez-vous aux startups que vous accompagnerez'}
            {step === 2 && 'Sélectionnez vos domaines et précisez votre niveau'}
            {step === 3 && 'Indiquez votre disponibilité et finalisez votre profil'}
          </p>
        </div>

        {/* ── Stepper ── */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold transition-all duration-300',
                  step > s.id  ? 'bg-accent text-white' :
                  step === s.id ? 'bg-accent text-white ring-4 ring-accent/20' :
                                  'bg-border text-text-2'
                )}>
                  {step > s.id ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : s.id}
                </div>
                <span className={cn(
                  'text-[11px] mt-1 font-medium transition-colors',
                  step >= s.id ? 'text-accent' : 'text-text-2'
                )}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-[2px] mx-2 mb-4 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-500 rounded-full"
                    style={{ width: step > s.id ? '100%' : '0%' }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Card ── */}
        <div className="bg-surface rounded-2xl border border-border p-7 shadow-sm">
          {error && <div className="mb-5"><ErrorAlert message={error} /></div>}

          {/* Step 1 — Identité */}
          {step === 1 && (
            <div className="space-y-4">
              <Field label="Titre / Headline *">
                <Input
                  autoFocus
                  placeholder="Ex: Expert en financement de startups"
                  value={form.headline}
                  onChange={e => updateFormField('headline', e.target.value)}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Organisation">
                  <Input
                    placeholder="Nom de l'entreprise"
                    value={form.organization}
                    onChange={e => updateFormField('organization', e.target.value)}
                  />
                </Field>
                <Field label="Poste">
                  <Input
                    placeholder="CEO, Consultant…"
                    value={form.position}
                    onChange={e => updateFormField('position', e.target.value)}
                  />
                </Field>
              </div>
              <Field label="Années d'expérience">
                <Input
                  type="number"
                  placeholder="10"
                  value={form.years_of_experience}
                  onChange={e => updateFormField('years_of_experience', Number(e.target.value))}
                />
              </Field>
              <Field label="LinkedIn">
                <Input
                  placeholder="https://linkedin.com/in/…"
                  value={form.linkedin_url}
                  onChange={e => updateFormField('linkedin_url', e.target.value)}
                />
              </Field>
              <Field label="Bio">
                <Textarea
                  placeholder="Décrivez votre parcours et ce que vous apportez aux startups…"
                  rows={3}
                  value={form.bio}
                  onChange={e => updateFormField('bio', e.target.value)}
                />
              </Field>
            </div>
          )}

          {/* Step 2 — Expertise */}
          {step === 2 && (
            <div>
              <p className="text-[12px] text-text-2 mb-4">
                Cliquez sur les domaines qui correspondent à votre expertise
              </p>

              {/* Domaines groupés */}
              {Object.keys(groupedAreas).length === 0 ? (
                // Fallback si groupedAreas est vide malgré ready=true
                <div className="text-[13px] text-text-2 text-center py-8">
                  Aucun domaine disponible.
                </div>
              ) : (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 pb-1">
                  {Object.entries(groupedAreas).map(([cat, areas]) => (
                    <div key={cat}>
                      <div className="text-[11px] font-semibold uppercase tracking-[.06em] text-text-2 mb-2">
                        {cat}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {areas.map(area => (
                          <button
                            key={area.id}
                            type="button"
                            onClick={() => toggleArea(area.id)}
                            className={cn(
                              'text-[12px] px-3 py-1.5 rounded-full border transition-all',
                              selectedAreaIds.includes(area.id)
                                ? 'bg-accent-light text-accent border-accent font-medium'
                                : 'bg-bg text-text-2 border-border hover:border-accent'
                            )}
                          >
                            {area.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Détail niveau par expertise sélectionnée */}
              {selectedAreaIds.length > 0 && (
                <>
                  <div className="h-px bg-border my-4" />
                  <div className="text-[11px] font-semibold uppercase tracking-[.06em] text-text-2 mb-2.5">
                    Précisez votre niveau ({selectedAreaIds.length} sélectionné{selectedAreaIds.length > 1 ? 's' : ''})
                  </div>
                  <div className="max-h-[200px] overflow-y-auto">
                    {selectedAreaIds.map(id => {
                      const area = allAreas.find(a => a.id === id);
                      if (!area) return null;
                      const lvl = areaLevels[id] ?? { level: 'Expert', years: 1 };
                      return (
                        <div key={id} className="flex items-center gap-3 py-2.5 border-b border-border last:border-none">
                          <span className="text-[13px] font-medium flex-1 truncate">{area.name}</span>
                          <select
                            value={lvl.level}
                            onChange={e => updateAreaLevel(id, e.target.value)}
                            className="text-[12px] py-1 px-2 border border-border rounded bg-bg text-text-1 outline-none focus:border-accent"
                          >
                            <option>Expert</option>
                            <option>Intermédiaire</option>
                            <option>Débutant</option>
                          </select>
                          <input
                            type="number"
                            min={1}
                            value={lvl.years}
                            onChange={e => updateAreaYears(id, Number(e.target.value))}
                            className="w-14 text-[12px] py-1 px-2 text-center border border-border rounded bg-bg text-text-1 focus:border-accent outline-none"
                          />
                          <span className="text-[11px] text-text-2">ans</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Message si rien sélectionné */}
              {selectedAreaIds.length === 0 && Object.keys(groupedAreas).length > 0 && (
                <div className="mt-4 p-3 rounded-lg bg-bg border border-border text-[12px] text-text-2 text-center">
                  Sélectionnez au moins un domaine pour continuer
                </div>
              )}
            </div>
          )}

          {/* Step 3 — Disponibilité + récap */}
          {step === 3 && (
            <div className="space-y-4">
              <Field label="Disponibilité">
                <Select
                  value={form.availability_status}
                  onChange={e => updateFormField('availability_status', e.target.value)}
                >
                  <option value="available">Disponible</option>
                  <option value="partial">Partiellement disponible</option>
                  <option value="unavailable">Non disponible</option>
                </Select>
              </Field>

              {/* Récap */}
              <div className="rounded-xl bg-bg border border-border p-4 space-y-3">
                <div className="text-[11px] font-semibold uppercase tracking-[.06em] text-text-2">
                  Récapitulatif
                </div>
                <div className="space-y-1.5 text-[13px]">
                  <div className="flex gap-2">
                    <span className="text-text-2 w-32 flex-shrink-0">Headline</span>
                    <span className="font-medium truncate">{form.headline || '—'}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-text-2 w-32 flex-shrink-0">Organisation</span>
                    <span className="truncate">{form.organization || '—'}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-text-2 w-32 flex-shrink-0">Expérience</span>
                    <span>{form.years_of_experience ? `${form.years_of_experience} ans` : '—'}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-text-2 w-32 flex-shrink-0">Expertises</span>
                    <span className="text-accent font-medium">
                      {selectedAreaIds.length} domaine{selectedAreaIds.length > 1 ? 's' : ''} sélectionné{selectedAreaIds.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                {selectedAreaIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border">
                    {selectedAreaIds.slice(0, 6).map(id => {
                      const area = allAreas.find(a => a.id === id);
                      return area ? (
                        <span key={id} className="text-[11px] px-2 py-0.5 rounded-full bg-accent-light text-accent border border-accent/20">
                          {area.name}
                        </span>
                      ) : null;
                    })}
                    {selectedAreaIds.length > 6 && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-border text-text-2">
                        +{selectedAreaIds.length - 6}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Navigation ── */}
        <div className="flex gap-3 mt-5">
          {step > 1 ? (
            <Button type="button" className="flex-1 justify-center" onClick={() => setStep(s => s - 1)}>
              ← Retour
            </Button>
          ) : (
            <Button type="button" className="flex-1 justify-center" onClick={() => router.back()}>
              Annuler
            </Button>
          )}

          {step < STEPS.length ? (
            <Button
              type="button"
              variant="primary"
              className="flex-1 justify-center"
              disabled={step === 2 && selectedAreaIds.length === 0}
              onClick={() => setStep(s => s + 1)}
            >
              Continuer →
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              loading={saving}
              className="flex-1 justify-center"
              onClick={handleFinish}
            >
              Terminer ✓
            </Button>
          )}
        </div>

        <p className="text-center text-[12px] text-text-2 mt-4">
          Étape {step} sur {STEPS.length}
        </p>
      </div>
    </div>
  );
}