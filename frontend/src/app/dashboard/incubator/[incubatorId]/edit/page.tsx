'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Building2, Save, X, Mail, Phone, Globe, MapPin, FileText, Briefcase, Calendar, Hash } from 'lucide-react'
import api from '@/services/api'
import { Button, Card, CardHeader, ErrorAlert, Field, Input, Select, Textarea, Sep } from '@/components/shared/ui'

interface EditIncubatorForm {
  name: string
  legal_name?: string
  slug: string
  description?: string
  organization_type?: string
  email?: string
  phone?: string
  website_url?: string
  address?: string
  country?: string
  city?: string
  logo_url?: string
  tax_id?: string
  registration_number?: string
  foundation_date?: string
}

export default function EditIncubatorPage() {
  const { incubatorId } = useParams<{ incubatorId: string }>()
  const router = useRouter()
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<EditIncubatorForm>()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (incubatorId) {
      api.get(`/incubators/${incubatorId}`)
        .then((res) => {
          const data = res.data
          Object.keys(data).forEach((key) => {
            if (data[key] !== undefined && data[key] !== null) {
              setValue(key as keyof EditIncubatorForm, data[key])
            }
          })
        })
        .catch((err) => setError(err?.response?.data?.message))
        .finally(() => setLoading(false))
    }
  }, [incubatorId, setValue])

  const onSubmit = async (data: EditIncubatorForm) => {
    setSubmitting(true)
    setError(null)
    try {
      await api.patch(`/incubators/${incubatorId}`, data)
      router.push(`/dashboard/incubator/${incubatorId}`)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erreur lors de la modification')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-[700px] mx-auto">
        <div className="animate-pulse space-y-3">
          <div className="h-7 w-48 bg-border rounded-lg" />
          <div className="h-24 bg-border rounded-[14px] mt-4" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-[700px] mx-auto">
      <h1 className="font-syne text-[22px] font-extrabold text-ink mb-1">Modifier l'incubateur</h1>
      <p className="text-[12px] text-ink3 mb-6">Modifiez les informations de votre structure d'accompagnement</p>

      {error && <div className="mb-5"><ErrorAlert message={error} /></div>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="p-0 overflow-hidden">
          <CardHeader icon={<Building2 size={13} />} title="Informations générales" />
          <div className="p-[18px] space-y-4">
            <Field label="Nom de l'incubateur *" required>
              <Input {...register('name', { required: 'Le nom est requis' })} />
              {errors.name && <span className="text-red text-[11px] mt-1 block">{errors.name.message}</span>}
            </Field>

            <Field label="Slug *" required>
              <Input {...register('slug', { required: 'Le slug est requis' })} />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Raison sociale" icon={<Briefcase size={13} />}>
                <Input {...register('legal_name')} />
              </Field>
              <Field label="N° d'enregistrement" icon={<Hash size={13} />}>
                <Input {...register('registration_number')} />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="NIF (Tax ID)">
                <Input {...register('tax_id')} />
              </Field>
              <Field label="Date de fondation" icon={<Calendar size={13} />}>
                <Input type="date" {...register('foundation_date')} />
              </Field>
            </div>

            <Field label="Type d'organisation">
              <Select {...register('organization_type')}>
                <option value="">— Sélectionner —</option>
                <option value="public">Public</option>
                <option value="private">Privé</option>
                <option value="university">Université</option>
                <option value="ngo">ONG</option>
              </Select>
            </Field>

            <Field label="Description" icon={<FileText size={13} />}>
              <Textarea rows={4} {...register('description')} placeholder="Décrivez la mission et les activités de votre incubateur…" />
            </Field>
          </div>

          <Sep />

          <CardHeader icon={<Mail size={13} />} title="Contact" />
          <div className="p-[18px] space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Email" icon={<Mail size={13} />}>
                <Input type="email" {...register('email')} />
              </Field>
              <Field label="Téléphone" icon={<Phone size={13} />}>
                <Input {...register('phone')} />
              </Field>
            </div>
            <Field label="Site web" icon={<Globe size={13} />}>
              <Input {...register('website_url')} placeholder="https://..." />
            </Field>
          </div>

          <Sep />

          <CardHeader icon={<MapPin size={13} />} title="Localisation" />
          <div className="p-[18px] space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Pays">
                <Select {...register('country')}>
                  <option value="">— Pays —</option>
                  <option value="TN">Tunisie</option>
                  <option value="FR">France</option>
                  <option value="MA">Maroc</option>
                  <option value="DZ">Algérie</option>
                  <option value="SN">Sénégal</option>
                  <option value="CI">Côte d'Ivoire</option>
                </Select>
              </Field>
              <Field label="Ville">
                <Input {...register('city')} />
              </Field>
            </div>
            <Field label="Adresse">
              <Input {...register('address')} />
            </Field>
            <Field label="Logo URL">
              <Input {...register('logo_url')} placeholder="https://..." />
            </Field>
          </div>

          <div className="p-[14px_18px] bg-surface-2 border-t border-border flex gap-3">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              <X size={14} /> Annuler
            </Button>
            <Button type="submit" variant="primary" loading={submitting} className="flex-1 justify-center">
              <Save size={14} /> Enregistrer les modifications
            </Button>
          </div>
        </Card>
      </form>
    </div>
  )
}