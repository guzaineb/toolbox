'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { Button, ErrorAlert, Field, Input, Select, Textarea } from '@/components/shared/ui';

interface CreateIncubatorForm {
  name: string;
  legal_name?: string;
  slug: string;
  description?: string;
  organization_type?: string;
  email?: string;
  phone?: string;
  website_url?: string;
  address?: string;
  country?: string;
  city?: string;
}

const STEPS = [
  { id: 1, label: 'Identité',     icon: '🏢' },
  { id: 2, label: 'Contact',      icon: '📬' },
  { id: 3, label: 'Localisation', icon: '📍' },
];

export default function CreateIncubatorPage() {
  const { register, handleSubmit, formState: { errors }, setValue, watch, trigger } =
    useForm<CreateIncubatorForm>({ mode: 'onChange' });
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = e.target.value
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setValue('slug', slug);
  };

  const goNext = async () => {
    let valid = false;
    if (step === 1) valid = await trigger(['name', 'slug']);
    if (step === 2) valid = await trigger(['email']);
    if (step === 3) valid = true;
    if (valid) setStep(s => s + 1);
  };

  const onSubmit = async (data: CreateIncubatorForm) => {
    setServerError(null);
    setLoading(true);
    try {
      const res = await api.post('/incubators', data);
      router.push(`/dashboard/incubator/${res.data.id}`);
    } catch (err: any) {
      setServerError(err?.response?.data?.message ?? 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const progress = ((step - 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-[520px]">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-light text-[28px] mb-4">
            {STEPS[step - 1].icon}
          </div>
          <h1 className="font-display text-[28px] font-semibold mb-1">
            {step === 1 && 'Créez votre incubateur'}
            {step === 2 && 'Informations de contact'}
            {step === 3 && 'Où êtes-vous situés ?'}
          </h1>
          <p className="text-[13px] text-text-2">
            {step === 1 && 'Donnez une identité à votre structure'}
            {step === 2 && 'Comment peut-on vous joindre ?'}
            {step === 3 && 'Votre localisation géographique'}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          {/* Steps pills */}
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold transition-all duration-300
                      ${step > s.id
                        ? 'bg-accent text-white'
                        : step === s.id
                        ? 'bg-accent text-white ring-4 ring-accent/20'
                        : 'bg-border text-text-2'
                      }`}
                  >
                    {step > s.id ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      s.id
                    )}
                  </div>
                  <span className={`text-[11px] mt-1 font-medium transition-colors ${step >= s.id ? 'text-accent' : 'text-text-2'}`}>
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
        </div>

        {/* Card */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-surface rounded-2xl border border-border p-7 shadow-sm">

            {serverError && (
              <div className="mb-5"><ErrorAlert message={serverError} /></div>
            )}

            {/* ── Step 1 : Identité ── */}
            {step === 1 && (
              <div className="space-y-4">
                <Field label="Nom de l'incubateur *">
                  <Input
                    placeholder="ex: StartUp Tunisia Hub"
                    autoFocus
                    {...register('name', { required: 'Le nom est requis' })}
                    onChange={e => { register('name').onChange(e); handleNameChange(e); }}
                  />
                  {errors.name && (
                    <span className="text-[11px] text-red-500 mt-1 block">{errors.name.message}</span>
                  )}
                </Field>

                <Field label="Slug (URL unique) *">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-text-2 select-none">
                 
                    </span>
                    <Input
                      className="pl-[88px]"
                      placeholder="startup-tunisia-hub"
                      {...register('slug', { required: 'Le slug est requis' })}
                    />
                  </div>
                  {errors.slug && (
                    <span className="text-[11px] text-red-500 mt-1 block">{errors.slug.message}</span>
                  )}
                </Field>

                <Field label="Raison sociale">
                  <Input placeholder="Nom légal officiel" {...register('legal_name')} />
                </Field>

                <Field label="Type d'organisation">
                  <Select {...register('organization_type')}>
                    <option value="">— Sélectionner —</option>
                    <option value="public">Public</option>
                    <option value="private">Privé</option>
                    <option value="university">Université</option>
                    <option value="ngo">ONG</option>
                  </Select>
                </Field>

                <Field label="Description">
                  <Textarea
                    placeholder="Décrivez la mission de votre incubateur…"
                    rows={3}
                    {...register('description')}
                  />
                </Field>
              </div>
            )}

            {/* ── Step 2 : Contact ── */}
            {step === 2 && (
              <div className="space-y-4">
                <Field label="Email">
                  <Input
                    type="email"
                    placeholder="contact@incubateur.tn"
                    autoFocus
                    {...register('email')}
                  />
                </Field>

                <Field label="Téléphone">
                  <Input placeholder="+216 XX XXX XXX" {...register('phone')} />
                </Field>

                <Field label="Site web">
                  <Input placeholder="https://…" {...register('website_url')} />
                </Field>
              </div>
            )}

            {/* ── Step 3 : Localisation ── */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Pays">
                    <Select {...register('country')}>
                      <option value="">— Pays —</option>
                      <option value="TN">Tunisie</option>
                      <option value="MA">Maroc</option>
                      <option value="DZ">Algérie</option>
                      <option value="FR">France</option>
                      <option value="OTHER">Autre</option>
                    </Select>
                  </Field>
                  <Field label="Ville">
                    <Input placeholder="Tunis" autoFocus {...register('city')} />
                  </Field>
                </div>

                <Field label="Adresse">
                  <Input placeholder="Rue, Quartier, Code postal" {...register('address')} />
                </Field>

                {/* Récap visuel */}
                <div className="mt-2 rounded-xl bg-bg border border-border p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[.06em] text-text-2 mb-3">
                    Récapitulatif
                  </div>
                  <div className="space-y-1.5 text-[13px]">
                    <div className="flex gap-2">
                      <span className="text-text-2 w-28 flex-shrink-0">Nom</span>
                      <span className="font-medium truncate">{watch('name') || '—'}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-text-2 w-28 flex-shrink-0">Type</span>
                      <span className="truncate">{watch('organization_type') || '—'}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-text-2 w-28 flex-shrink-0">Email</span>
                      <span className="truncate">{watch('email') || '—'}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-text-2 w-28 flex-shrink-0">Téléphone</span>
                      <span className="truncate">{watch('phone') || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-3 mt-5">
            {step > 1 ? (
              <Button
                type="button"
                className="flex-1 justify-center"
                onClick={() => setStep(s => s - 1)}
              >
                ← Retour
              </Button>
            ) : (
              <Button
                type="button"
                className="flex-1 justify-center"
                onClick={() => router.back()}
              >
                Annuler
              </Button>
            )}

            {step < STEPS.length ? (
              <Button
                type="button"
                variant="primary"
                className="flex-1 justify-center"
                onClick={goNext}
              >
                Continuer →
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="flex-1 justify-center"
              >
                Créer l'incubateur ✓
              </Button>
            )}
          </div>

          {/* Step indicator text */}
          <p className="text-center text-[12px] text-text-2 mt-4">
            Étape {step} sur {STEPS.length}
          </p>
        </form>

      </div>
    </div>
  );
}