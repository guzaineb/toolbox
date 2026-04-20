'use client'

import Link from 'next/link'
import { Badge, Button, Card } from '@/components/shared/ui'
import { useAuth } from '@/hooks/useAuth'

export default function ProfilePage() {
  const { user } = useAuth()

  const profile = user?.profile as any

  const firstName = profile?.first_name ?? ''
  const lastName = profile?.last_name ?? ''
  const fullName = `${firstName} ${lastName}`.trim() || 'Utilisateur'

  const initials =
    `${firstName?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`.toUpperCase() ||
    '??'

  const email = user?.email ?? '—'
  const phone = profile?.phone ?? '—'
  const country = profile?.country ?? '—'
  const city = profile?.city ?? '—'
  const bio =
    profile?.bio ??
    "Aucune biographie renseignée pour le moment."

  const roleBadges: string[] = user?.role || user?.role ? [user?.role] : []

  return (
    <div className="p-8 max-w-[800px]">
      {/* Tabs */}
      <div className="flex gap-0.5 bg-bg p-[3px] rounded-sm mb-[22px] border border-border w-fit">
        <span className="px-3.5 py-1.5 rounded-[5px] text-[12px] font-medium bg-surface text-text shadow-sm">
          Vue publique
        </span>

        <Link href="/dashboard/profile/edit">
          <span className="px-3.5 py-1.5 rounded-[5px] text-[12px] font-medium bg-transparent text-text-2 hover:text-text cursor-pointer">
            Modifier
          </span>
        </Link>

        <Link href="/dashboard/settings">
          <span className="px-3.5 py-1.5 rounded-[5px] text-[12px] font-medium bg-transparent text-text-2 hover:text-text cursor-pointer">
            Paramètres
          </span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex gap-5 items-start mb-6">
        <div className="w-14 h-14 rounded-full bg-accent-light text-accent flex items-center justify-center text-[18px] font-semibold flex-shrink-0">
          {initials}
        </div>

        <div>
          <h1 className="text-[22px] font-bold mb-0.5">
            {fullName}
          </h1>

          <p className="text-[13px] text-text-2 mb-2">
            {city}, {country}
          </p>

          <div className="flex gap-1.5 flex-wrap">
            {roleBadges.length > 0 ? (
              roleBadges.map((role, i) => (
                <Badge key={i} variant="blue">
                  {role}
                </Badge>
              ))
            ) : (
              <Badge variant="gray">Utilisateur</Badge>
            )}
          </div>
        </div>

        <Link href="/dashboard/profile/edit" className="ml-auto">
          <Button>Modifier le profil</Button>
        </Link>
      </div>

      {/* About */}
      <Card className="mb-4">
        <div className="text-[11px] font-semibold uppercase tracking-[.06em] text-text-2 mb-3">
          À propos
        </div>
        <p className="text-[13px] text-text-2 leading-relaxed">
          {bio}
        </p>
      </Card>

      {/* Info */}
      <Card>
        <div className="text-[11px] font-semibold uppercase tracking-[.06em] text-text-2 mb-3">
          Informations
        </div>

        <div className="grid grid-cols-2 gap-2 text-[13px]">
          <div>
            <span className="text-text-3">Email</span><br />
            <span>{email}</span>
          </div>

          <div>
            <span className="text-text-3">Téléphone</span><br />
            <span>{phone}</span>
          </div>

          <div>
            <span className="text-text-3">Pays</span><br />
            <span>{country}</span>
          </div>

          <div>
            <span className="text-text-3">Ville</span><br />
            <span>{city}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}