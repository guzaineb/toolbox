'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { Building2, Mail, MapPin, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '@/services/api'
import { Button, Card, ErrorAlert, Field, Input, Select, Textarea, ProgressBar } from '@/components/shared/ui'
import { COUNTRIES, DEFAULT_COUNTRY, type Country } from '@/lib/countries ' 

interface CreateIncubatorForm {
  name: string
  legal_name?: string
  slug: string
  description?: string
  organization_type?: string
  email?: string
  phone?: string
  website_url?: string
  address?: string
  country?: string   // stocke l'iso (ex: "TN", "FR")
  city?: string
}

const STEPS = [
  { id: 1, label: 'Identité', icon: Building2 },
  { id: 2, label: 'Contact', icon: Mail },
  { id: 3, label: 'Localisation', icon: MapPin },
]

export default function CreateIncubatorPage() {
  const { register, handleSubmit, formState: { errors }, setValue, watch, trigger } =
    useForm<CreateIncubatorForm>({ 
      mode: 'onChange',
      defaultValues: {
        country: DEFAULT_COUNTRY.iso  // présélectionne la Tunisie
      }
    })
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [serverError, setServerError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Génération automatique du slug à partir du nom
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = e.target.value
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    setValue('slug', slug, { shouldValidate: true })
  }

  // Navigation vers l'étape suivante (sans dépasser la dernière)
const goNext = async (e?: React.MouseEvent) => {
  e?.preventDefault(); 
    if (step >= STEPS.length) return

    let valid = false
    if (step === 1) valid = await trigger(['name', 'slug'])
    if (step === 2) valid = await trigger(['email'])
    if (step === 3) valid = true

    if (valid) setStep(step + 1)
  }

  // Soumission finale
  const onSubmit = async (data: CreateIncubatorForm) => {
    setServerError(null)
    setLoading(true)
    try {
      const res = await api.post('/incubators', data)
      router.push(`/dashboard/incubator/${res.data.id}`)
    } catch (err: any) {
      setServerError(err?.response?.data?.message ?? 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  // Sécurité : si on dépasse le nombre d'étapes
  if (step > STEPS.length) {
    return (
      <div className="min-h-screen bg-surface-2 flex items-center justify-center p-4">
        <Card className="p-6 text-center">
          <p className="text-red">État invalide, veuillez rafraîchir la page.</p>
          <Button onClick={() => router.back()} className="mt-4">Retour</Button>
        </Card>
      </div>
    )
  }

  const StepIcon = STEPS[step - 1].icon
  const progress = ((step - 1) / (STEPS.length - 1)) * 100
  const isLastStep = step === STEPS.length

  // Pour l'affichage du récapitulatif : récupérer le nom du pays sélectionné
  const selectedCountry = COUNTRIES.find(c => c.iso === watch('country'))
  const countryDisplayName = selectedCountry ? selectedCountry.name.fr : '—'

  return (
    <div className="min-h-screen bg-surface-2 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* En-tête avec icône et titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-[14px] bg-moss-light text-moss text-[28px] mb-4">
            <StepIcon size={28} />
          </div>
          <h1 className="font-syne text-[24px] font-extrabold text-ink mb-1">
            {step === 1 && 'Créez votre incubateur'}
            {step === 2 && 'Informations de contact'}
            {step === 3 && 'Où êtes-vous situés ?'}
          </h1>
          <p className="text-[13px] text-ink3">
            {step === 1 && 'Donnez une identité forte à votre structure'}
            {step === 2 && 'Comment les porteurs de projet peuvent vous joindre ?'}
            {step === 3 && 'Votre localisation géographique'}
          </p>
        </div>

        {/* Stepper visuel */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold transition-all duration-300
                      ${step > s.id ? 'bg-moss text-white' : step === s.id ? 'bg-moss text-white ring-4 ring-moss/20' : 'bg-border text-ink3'}`}
                  >
                    {step > s.id ? <Check size={14} /> : s.id}
                  </div>
                  <span className={`text-[11px] mt-1.5 font-semibold transition-colors ${step >= s.id ? 'text-moss' : 'text-ink3'}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-[2px] mx-3 mb-5 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full bg-moss transition-all duration-500 rounded-full"
                      style={{ width: step > s.id ? '100%' : '0%' }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <ProgressBar value={progress} />
        </div>

        {/* Formulaire */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isLastStep) {
              e.preventDefault()
            }
          }}
        >
          <Card className="p-6">
            {serverError && <div className="mb-5"><ErrorAlert message={serverError} /></div>}

            {/* Étape 1 : Identité */}
            {step === 1 && (
              <div className="space-y-4">
                <Field label="Nom de l'incubateur *" required>
                  <Input
                    placeholder="ex: StartUp Tunisia Hub"
                    autoFocus
                    {...register('name', { required: 'Le nom est requis' })}
                    onChange={(e) => { register('name').onChange(e); handleNameChange(e) }}
                  />
                  {errors.name && <span className="text-[11px] text-red mt-1 block">{errors.name.message}</span>}
                </Field>

                <Field label="Slug (URL unique) *" required>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-ink3 select-none font-mono">
                      /inc/
                    </span>
                    <Input className="pl-[52px]" placeholder="startup-tunisia-hub" {...register('slug', { required: 'Le slug est requis' })} />
                  </div>
                  {errors.slug && <span className="text-[11px] text-red mt-1 block">{errors.slug.message}</span>}
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
                  <Textarea placeholder="Décrivez la mission de votre incubateur…" rows={3} {...register('description')} />
                </Field>
              </div>
            )}

            {/* Étape 2 : Contact */}
            {step === 2 && (
              <div className="space-y-4">
                <Field label="Email">
                  <Input type="email" placeholder="contact@incubateur.tn" autoFocus {...register('email')} />
                </Field>
                <Field label="Téléphone">
                  <Input placeholder="+216 XX XXX XXX" {...register('phone')} />
                </Field>
                <Field label="Site web">
                  <Input placeholder="https://…" {...register('website_url')} />
                </Field>
              </div>
            )}

            {/* Étape 3 : Localisation avec liste des pays */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Pays">
                    <Select {...register('country')}>
                      {COUNTRIES.map((country) => (
                        <option key={country.iso} value={country.iso}>
                          {country.flag} {country.name.fr}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Ville">
                    <Input placeholder="Tunis" autoFocus {...register('city')} />
                  </Field>
                </div>
                <Field label="Adresse">
                  <Input placeholder="Rue, Quartier, Code postal" {...register('address')} />
                </Field>

                <div className="mt-2 rounded-[10px] bg-surface-2 border border-border p-4">
                  <div className="text-[11px] font-bold uppercase tracking-[0.07em] text-ink3 mb-3">
                    Récapitulatif
                  </div>
                  <div className="space-y-2 text-[13px]">
                    {[
                      { label: 'Nom', value: watch('name') },
                      { label: 'Type', value: watch('organization_type') },
                      { label: 'Email', value: watch('email') },
                      { label: 'Téléphone', value: watch('phone') },
                      { label: 'Localisation', value: [watch('city'), countryDisplayName].filter(Boolean).join(', ') },
                    ].map((item) => (
                      <div key={item.label} className="flex gap-2">
                        <span className="text-ink3 w-28 flex-shrink-0">{item.label}</span>
                        <span className="font-medium text-ink truncate">{item.value || '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Boutons de navigation */}
          <div className="flex gap-3 mt-5">
            {step > 1 ? (
              <Button type="button" className="flex-1 justify-center" onClick={() => setStep(step - 1)}>
                <ChevronLeft size={14} /> Retour
              </Button>
            ) : (
              <Button type="button" className="flex-1 justify-center" onClick={() => router.back()}>
                Annuler
              </Button>
            )}

            {!isLastStep ? (
              <Button type="button" variant="primary" className="flex-1 justify-center" onClick={(e) => goNext(e)}>
                Continuer <ChevronRight size={14} />
              </Button>
            ) : (
              <Button type="submit" variant="primary" loading={loading} className="flex-1 justify-center">
                Créer l'incubateur
              </Button>
            )}
          </div>

          <p className="text-center text-[12px] text-ink3 mt-4">
            Étape {step} sur {STEPS.length}
          </p>
        </form>
      </div>
    </div>
  )
}