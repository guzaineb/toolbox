'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { User, Mail, Phone, MapPin, Calendar, Link2, Globe, Pencil, Info } from 'lucide-react'
import { Avatar, Badge, Button, Card, CardHeader, Progress, TabNav } from '@/components/shared/ui'

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const profile = user?.profile

  if (loading) return (
    <div className="p-7 max-w-[900px] mx-auto">
      <div className="animate-pulse space-y-4">
        <div className="h-[72px] w-[72px] rounded-full bg-border" />
        <div className="h-7 w-56 bg-border rounded-lg" />
        <div className="grid grid-cols-2 gap-[14px] mt-6">
          <div className="h-48 bg-border rounded-[14px]" />
          <div className="h-48 bg-border rounded-[14px]" />
        </div>
      </div>
    </div>
  )

  if (!user) return <div className="p-8">Non authentifié</div>

  const fullName  = `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || 'Utilisateur'
  const initials  = `${profile?.first_name?.charAt(0) ?? ''}${profile?.last_name?.charAt(0) ?? ''}`.toUpperCase() || '?'
  const email     = user.email
  const phone     = profile?.phone     || 'Non renseigné'
  const country   = profile?.country   || 'Non renseigné'
  const city      = profile?.city      || 'Non renseigné'
  const bio       = profile?.bio       || 'Aucune biographie renseignée pour le moment.'
  const birthDate = profile?.birth_date ? new Date(profile.birth_date).toLocaleDateString('fr-FR') : null
  const linkedinUrl = profile?.linkedin

  const roleMap: Record<string, { label: string; variant: 'green' | 'blue' | 'amber' | 'gray' }> = {
    admin:            { label: 'Administrateur',    variant: 'amber' },
    expert:           { label: 'Expert',            variant: 'blue'  },
    project_owner:    { label: 'Porteur de projet', variant: 'green' },
    incubator_membre: { label: 'Membre incubateur', variant: 'gray'  },
  }
  const roleInfo = user.role ? roleMap[user.role] : null

  const completionFields = [
    !!profile?.first_name && !!profile?.last_name,
    !!email,
    !!profile?.phone,
    !!profile?.country,
    !!profile?.city,
    !!profile?.bio,
    !!profile?.birth_date,
    !!profile?.linkedin,
  ]
  const completionPercent = Math.round(
    (completionFields.filter(Boolean).length / completionFields.length) * 100,
  )

  return (
    <div className="p-7 max-w-[900px] mx-auto">
      <TabNav
        tabs={[
          { id: 'public', label: 'Vue publique' },
          { id: 'edit',   label: 'Modifier'     },
        ]}
        active="public"
        onChange={(id) => { if (id === 'edit') window.location.href = '/dashboard/profile/edit' }}
      />

      {/* ── Hero ── */}
      <div className="flex items-start justify-between gap-5 mb-6">
        <div className="flex gap-[18px] items-start">
          <div className="w-[72px] h-[72px] rounded-full flex-shrink-0 flex items-center justify-center
            bg-gradient-to-br from-moss to-[#1a5c3a] shadow-[0_0_0_3px_rgba(45,122,82,0.2),0_2px_12px_rgba(45,122,82,0.15)]
            font-syne text-[22px] font-extrabold text-[#a0e0b8]">
            {initials}
          </div>
          <div>
            <h1 className="font-syne text-[22px] font-extrabold text-ink leading-tight mb-1">
              {fullName}
            </h1>
            <div className="text-[12px] text-ink3 flex items-center gap-1 mb-2">
              <MapPin size={12} /> {city}, {country}
            </div>
            <div className="flex gap-[5px] flex-wrap">
              {roleInfo && <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>}
              {completionPercent < 100 && (
                <Badge variant="gray">Complétion {completionPercent}%</Badge>
              )}
              <Badge variant="green">
                <span className="w-[5px] h-[5px] rounded-full bg-green-400 inline-block" />
                Actif
              </Badge>
            </div>
          </div>
        </div>
        <Link href="/dashboard/profile/edit">
          <Button variant="primary" size="md">
            <Pencil size={12} />
            Modifier le profil
          </Button>
        </Link>
      </div>

      {/* ── Cards grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[14px]">

        {/* À propos */}
        <Card>
          <CardHeader icon={<User size={13} />} title="À propos" />
          <div className="p-[16px_18px]">
            <p className="text-[13px] text-ink2 leading-[1.65]">{bio}</p>
          </div>
          <div className="px-[18px] pb-[16px] pt-[12px] border-t border-border bg-surface-2">
            <div className="flex justify-between text-[10px] font-bold text-ink3 uppercase tracking-[0.05em] mb-[6px]">
              <span>Complétion du profil</span>
              <span className="text-moss">{completionPercent}%</span>
            </div>
            <Progress value={completionPercent} />
          </div>
        </Card>

        {/* Informations */}
        <Card>
          <CardHeader icon={<Info size={13} />} title="Informations" />
          <div className="px-[18px] py-2 divide-y divide-border">
            {[
              { icon: <Mail size={13} />,    label: 'Email',        value: email },
              { icon: <Phone size={13} />,   label: 'Téléphone',    value: phone },
              { icon: <MapPin size={13} />,  label: 'Localisation', value: `${city}, ${country}` },
              ...(birthDate ? [{ icon: <Calendar size={13} />, label: 'Date de naissance', value: birthDate }] : []),
            ].map((row) => (
              <div key={row.label} className="flex items-start gap-[9px] py-[9px]">
                <div className="w-[20px] flex-shrink-0 mt-[1px] text-ink3">{row.icon}</div>
                <div>
                  <div className="text-[10px] font-bold text-ink3 uppercase tracking-[0.07em] mb-[2px]">{row.label}</div>
                  <div className="text-[13px] font-medium text-ink">{row.value}</div>
                </div>
              </div>
            ))}
            {linkedinUrl && (
              <div className="flex items-start gap-[9px] py-[9px]">
                <div className="w-[20px] flex-shrink-0 mt-[1px] text-ink3"><Link2 size={13} /></div>
                <div>
                  <div className="text-[10px] font-bold text-ink3 uppercase tracking-[0.07em] mb-[2px]">LinkedIn</div>
                  <a href={linkedinUrl} target="_blank" rel="noopener noreferrer"
                    className="text-[13px] font-medium text-moss hover:underline">
                    Voir le profil →
                  </a>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Préférences */}
        {profile?.preferred_language && (
          <Card className="lg:col-span-2">
            <CardHeader icon={<Globe size={13} />} title="Préférences" />
            <div className="px-[18px] py-3 flex items-center gap-2">
              <span className="text-[12px] text-ink3">Langue préférée :</span>
              <Badge variant="green">
                {profile.preferred_language === 'fr' ? '🇫🇷 Français'
                  : profile.preferred_language === 'ar' ? '🇸🇦 Arabe'
                  : '🇬🇧 Anglais'}
              </Badge>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}