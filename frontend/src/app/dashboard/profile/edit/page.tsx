'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, User, Globe, Mail, Phone, MapPin, Calendar, FileText, Link2 } from 'lucide-react'
import api from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import {
  Button, Card, CardHeader, ErrorAlert, Field, Input, Select, Textarea, TabNav, Avatar, Sep,
} from '@/components/shared/ui'
import { ProfileForm } from '@/types/profile'

export default function ProfileEditPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [form, setForm] = useState<ProfileForm>({
    first_name: '',
    last_name: '',
    phone: '',
    birth_date: '',
    country: '',
    city: '',
    address: '',
    bio: '',
    linkedin: '',
    preferred_language: 'FR',
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (user?.profile) {
      const p = user.profile as any
      setForm({
        first_name: p.first_name ?? '',
        last_name: p.last_name ?? '',
        phone: p.phone ?? '',
        birth_date: p.birth_date ? new Date(p.birth_date).toISOString().split('T')[0] : '',
        country: p.country ?? '',
        city: p.city ?? '',
        address: p.address ?? '',
        bio: p.bio ?? '',
        linkedin: p.linkedin ?? '',
        preferred_language: p.preferred_language ?? 'FR',
      })
    }
  }, [user])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const payload: any = {}
      Object.keys(form).forEach((key) => {
        const value = (form as any)[key]
        if (value !== '' && value !== null) payload[key] = value
      })

      await api.patch('/users/profile', payload)
      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard/profile')
      }, 1500)
    } catch (err: any) {
      const backendMessage = err?.response?.data?.message
      setError(Array.isArray(backendMessage) ? backendMessage[0] : (backendMessage ?? 'Erreur lors de la sauvegarde'))
    } finally {
      setSaving(false)
    }
  }

  const initials = `${form.first_name?.charAt(0) || ''}${form.last_name?.charAt(0) || ''}`.toUpperCase() || '??'

  return (
    <div className="p-7 max-w-[820px] mx-auto">
      <TabNav
        tabs={[
          { id: 'public', label: 'Vue publique' },
          { id: 'edit', label: 'Modifier' },
        ]}
        active="edit"
        onChange={(id) => { if (id === 'public') router.push('/dashboard/profile') }}
      />

      <h1 className="font-syne text-[22px] font-extrabold text-ink mb-1">Modifier le profil</h1>
      <p className="text-[12px] text-ink3 mb-5">Ces informations sont visibles par les autres membres</p>

      {error && <div className="mb-4"><ErrorAlert message={error} /></div>}
      {success && (
        <div className="mb-4 p-3 rounded-lg bg-moss/[.08] border border-moss/20 text-moss text-[12px] flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          Profil mis à jour avec succès. Redirection…
        </div>
      )}

      <Card className="overflow-hidden">
        {/* Row d'en-tête */}
        <div className="flex items-center gap-[14px] p-[14px_18px] border-b border-border bg-surface-2">
          <div className="relative">
            <Avatar initials={initials} size="lg" />
            <button className="absolute bottom-0 right-0 w-[22px] h-[22px] bg-moss text-white rounded-full flex items-center justify-center shadow-sm hover:bg-moss-mid transition-colors">
              <Camera size={12} />
            </button>
          </div>
          <div>
            <div className="text-[13px] font-semibold text-ink">{form.first_name} {form.last_name}</div>
            <div className="text-[11px] text-ink3">{user?.email}</div>
          </div>
        </div>

        <div className="p-[16px_18px] space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Prénom">
              <Input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} placeholder="Votre prénom…" />
            </Field>
            <Field label="Nom">
              <Input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} placeholder="Votre nom…" />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Téléphone" icon={<Phone size={13} />}>
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+216 -- --- ---" />
            </Field>
            <Field label="Date de naissance" icon={<Calendar size={13} />}>
              <Input type="date" value={form.birth_date} onChange={e => setForm(f => ({ ...f, birth_date: e.target.value }))} />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Pays" icon={<Globe size={13} />}>
              <Select value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))}>
                <option value="">— Sélectionner —</option>
                <option value="TN">🇹🇳 Tunisie</option>
                <option value="MA">🇲🇦 Maroc</option>
                <option value="DZ">🇩🇿 Algérie</option>
                <option value="FR">🇫🇷 France</option>
              </Select>
            </Field>
            <Field label="Ville" icon={<MapPin size={13} />}>
              <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Tunis" />
            </Field>
          </div>

          <Field label="Adresse">
            <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Rue, immeuble, appartement…" />
          </Field>

          <Field label="Bio (Présentation)" icon={<FileText size={13} />}>
            <Textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} placeholder="Présentez-vous en quelques lignes…" />
          </Field>

          <Field label="Profil LinkedIn" icon={<Link2  size={13} />}>
            <Input value={form.linkedin} onChange={e => setForm(f => ({ ...f, linkedin: e.target.value }))} placeholder="https://linkedin.com/in/votre-profil" />
          </Field>

          <Field label="Langue préférée">
            <Select value={form.preferred_language} onChange={e => setForm(f => ({ ...f, preferred_language: e.target.value }))}>
              <option value="FR">Français</option>
              <option value="AR">Arabe</option>
              <option value="EN">Anglais</option>
            </Select>
          </Field>
        </div>

        <div className="p-[14px_18px] bg-surface-2 border-t border-border flex gap-3">
          <Link href="/dashboard/profile">
            <Button type="button" variant="ghost">Annuler</Button>
          </Link>
          <Button variant="primary" className="flex-1 justify-center" onClick={handleSave} loading={saving}>
            Enregistrer les modifications
          </Button>
        </div>
      </Card>
    </div>
  )
}