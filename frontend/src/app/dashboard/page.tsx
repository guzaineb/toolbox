'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Card, Progress, StatBox } from '@/components/shared/ui'
import { ROLE_ROUTES } from '@/hooks/useAuth'

export default function DashboardPage() {
  const { user } = useAuth()

  const firstName = user?.profile?.first_name || 'Utilisateur'
  const role = user?.role

  const incubatorCount = user?.incubatorMembers?.length ?? 0
  const hasExpertProfile = !!user?.expertProfile
  const hasProjectOwnerProfile = !!user?.projectOwnerProfile

  return (
    <div className="p-8 max-w-[max-w-6xl]">
      <h1 className="font-display text-[26px] text-text mb-1">Bonjour, {firstName} 👋</h1>
      <p className="text-[13px] text-text-2 mb-7">Voici un aperçu de votre activité sur ToolBox</p>

      <div className="grid grid-cols-3 gap-2.5 mb-7">
        {role === 'INCUBATOR_MEMBER' && (
          <StatBox num={incubatorCount} label="Incubateur(s) rejoint(s)" />
        )}
        {role === 'EXPERT' && (
          <StatBox num={hasExpertProfile ? '1' : '0'} label="Profil expert" />
        )}
        {role === 'PROJECT_OWNER' && (
          <StatBox num={hasProjectOwnerProfile ? '1' : '0'} label="Profil porteur" />
        )}
        {role === 'ADMIN' && (
          <StatBox num="Admin" label="Rôle administrateur" />
        )}
        <StatBox num={user?.is_verified ? '✓' : '—'} label="Email vérifié" />
        <StatBox num={user?.is_active ? 'Actif' : 'Inactif'} label="Statut du compte" />
      </div>

      <div className="text-[11px] font-semibold uppercase tracking-[.06em] text-text-2 mb-3">
        Accès rapides
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Link href="/dashboard/profile">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <div className="text-[13px] font-semibold mb-1">Mon profil</div>
            <div className="text-[12px] text-text-2">Consultez et modifiez vos informations</div>
          </Card>
        </Link>
        {role === 'PROJECT_OWNER' && (
          <Link href="/dashboard/project-owner/projects">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <div className="text-[13px] font-semibold mb-1">Mes projets</div>
              <div className="text-[12px] text-text-2">Gérez vos projets entrepreneuriaux</div>
            </Card>
          </Link>
        )}
        {role === 'EXPERT' && (
          <Link href="/dashboard/expert">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <div className="text-[13px] font-semibold mb-1">Profil expert</div>
              <div className="text-[12px] text-text-2">Gérez vos domaines d'expertise</div>
            </Card>
          </Link>
        )}
        {role === 'INCUBATOR_MEMBER' && (
          <Link href="/dashboard/incubator">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <div className="text-[13px] font-semibold mb-1">Mon incubateur</div>
              <div className="text-[12px] text-text-2">Accédez à votre espace incubateur</div>
            </Card>
          </Link>
        )}
        {role === 'ADMIN' && (
          <Link href="/dashboard/admin/experts">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <div className="text-[13px] font-semibold mb-1">Administration</div>
              <div className="text-[12px] text-text-2">Gérez les experts et porteurs de projet</div>
            </Card>
          </Link>
        )}
        <Link href="/dashboard/notifications">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <div className="text-[13px] font-semibold mb-1">Notifications</div>
            <div className="text-[12px] text-text-2">Consultez vos alertes et messages</div>
          </Card>
        </Link>
      </div>
    </div>
  )
}
