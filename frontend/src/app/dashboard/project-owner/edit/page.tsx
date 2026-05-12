'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  User, Briefcase, BookOpen, GraduationCap, Link2,
  TrendingUp, CheckCircle2, X, Rocket, Loader2, ArrowLeft,
} from 'lucide-react'
import { useProjectOwnerProfile } from '@/hooks/useProjectOwnerProfile'
import {
  Button, Card, CardHeader, Field, Input, Select, Toggle,
  ErrorAlert, Sep,
} from '@/components/shared/ui'

const cleanForm = (data: any) => {
  const cleaned: any = {}
  Object.keys(data).forEach((key) => {
    const value = data[key]
    if (value !== '' && value !== null && value !== undefined) {
      cleaned[key] = value
    }
  })
  return cleaned
}

export default function ProjectOwnerEditPage() {
  const router = useRouter()
  const { profile, loading, saving, error, saveProfile, refetch } = useProjectOwnerProfile()

  const [form, setForm] = useState({
    current_status: '',
    education_level: '',
    field_of_study: '',
    occupation: '',
    entrepreneurial_experience_level: 0,
    has_previous_startup: false,
    linkedin_url: '',
  })

  useEffect(() => {
    if (profile) {
      setForm({
        current_status: profile.current_status || '',
        education_level: profile.education_level || '',
        field_of_study: profile.field_of_study || '',
        occupation: profile.occupation || '',
        entrepreneurial_experience_level: profile.entrepreneurial_experience_level || 0,
        has_previous_startup: profile.has_previous_startup || false,
        linkedin_url: profile.linkedin_url || '',
      })
    }
  }, [profile])

  const handleSubmit = async () => {
    try {
      await saveProfile(cleanForm(form))
      await refetch()
      router.push('/dashboard/project-owner')
    } catch {
      // L'erreur est déjà gérée dans le hook
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f2eb]">
        <div className="text-center">
          <Loader2 size={32} className="mx-auto text-moss animate-spin mb-3" />
          <p className="text-[13px] text-ink3">Chargement…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-[700px] mx-auto">
      <button
        onClick={() => router.back()}
        className="text-[11px] text-ink3 hover:text-moss transition-colors flex items-center gap-1 mb-4"
      >
        <ArrowLeft size={12} /> Retour
      </button>

      <div className="mb-6">
        <h1 className="font-syne text-[22px] font-extrabold text-ink mb-1">
          {profile ? 'Modifier mon profil' : 'Créer mon profil'}
        </h1>
        <p className="text-[12px] text-ink3">
          {profile
            ? 'Mettez à jour vos informations de porteur de projet.'
            : 'Complétez votre profil pour commencer.'}
        </p>
      </div>

      {error && <div className="mb-4"><ErrorAlert message={error} /></div>}

      <Card className="p-0 overflow-hidden">
        <CardHeader icon={<Rocket size={13} />} title="Informations générales" />
        <div className="p-[18px] space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Statut actuel">
              <Select
                value={form.current_status}
                onChange={(e) => setForm((f) => ({ ...f, current_status: e.target.value }))}
              >
                <option value="">— Sélectionner —</option>
                <option value="student">Étudiant</option>
                <option value="employee">Salarié</option>
                <option value="entrepreneur">Entrepreneur</option>
                <option value="unemployed">Sans emploi</option>
              </Select>
            </Field>
            <Field label="Niveau d'études">
              <Select
                value={form.education_level}
                onChange={(e) => setForm((f) => ({ ...f, education_level: e.target.value }))}
              >
                <option value="">— Sélectionner —</option>
                <option value="bac">Bac</option>
                <option value="bac+2">Bac+2</option>
                <option value="bac+3">Bac+3 (Licence)</option>
                <option value="bac+5">Bac+5 (Master)</option>
                <option value="doctorat">Doctorat</option>
              </Select>
            </Field>
          </div>

          <Field label="Domaine d'études" icon={<BookOpen size={13} />}>
            <Input
              value={form.field_of_study}
              onChange={(e) => setForm((f) => ({ ...f, field_of_study: e.target.value }))}
              placeholder="Informatique, Commerce, Ingénierie…"
            />
          </Field>

          <Field label="Occupation" icon={<Briefcase size={13} />}>
            <Input
              value={form.occupation}
              onChange={(e) => setForm((f) => ({ ...f, occupation: e.target.value }))}
              placeholder="Développeur, Consultant, Étudiant…"
            />
          </Field>

          <Field label="Expérience entrepreneuriale" icon={<TrendingUp size={13} />}>
            <Select
              value={form.entrepreneurial_experience_level}
              onChange={(e) =>
                setForm((f) => ({ ...f, entrepreneurial_experience_level: Number(e.target.value) }))
              }
            >
              <option value={0}>Aucune expérience</option>
              <option value={1}>Débutant (idée)</option>
              <option value={2}>Intermédiaire (1–3 startups)</option>
              <option value={3}>Avancé (3+ startups)</option>
            </Select>
          </Field>

          <div className="flex items-center justify-between py-2">
            <span className="text-[12px] font-medium text-ink2">
              Expérience startup précédente
            </span>
            <Toggle
              on={form.has_previous_startup}
              onToggle={() => setForm((f) => ({ ...f, has_previous_startup: !f.has_previous_startup }))}
            />
          </div>

          <Field label="LinkedIn" icon={<Link2 size={13} />}>
            <Input value={form.linkedin_url} onChange={(e) => setForm((f) => ({ ...f, linkedin_url: e.target.value }))} placeholder="https://linkedin.com/in/…"
            />
          </Field>
        </div>

        <div className="p-[14px_18px] bg-surface-2 border-t border-border flex gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            <X size={14} /> Annuler
          </Button>
          <Button
            variant="primary"
            className="flex-1 justify-center"
            onClick={handleSubmit}
            loading={saving}
          >
            <CheckCircle2 size={14} />
            {profile ? 'Enregistrer les modifications' : 'Créer mon profil'}
          </Button>
        </div>
      </Card>
    </div>
  )
}