import Link from 'next/link'
import { Card, Progress, StatBox } from '@/components/shared/ui'

export default function DashboardPage() {
  return (
    <div className="p-8 max-w-[max-w-6xl]">
      <h1 className="font-display text-[26px] text-text mb-1">Bonjour, Mehdi 👋</h1>
      <p className="text-[13px] text-text-2 mb-7">Voici un aperçu de votre activité sur ProjectStruct</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5 mb-7">
        <StatBox num={1} label="Incubateur rejoint" />
        <StatBox num={3} label="Domaines d'expertise" />
        <StatBox num="86%" label="Profil complété" />
      </div>

      {/* Progress */}
      <div className="mb-7">
        <div className="text-[11px] font-semibold uppercase tracking-[.06em] text-text-2 mb-3">
          Complétion du profil
        </div>
        <Progress value={86} />
        <div className="text-[12px] text-text-2 mt-1.5">
          86% · Il vous reste à ajouter vos expériences professionnelles
        </div>
      </div>

      {/* Quick access */}
      <div className="text-[11px] font-semibold uppercase tracking-[.06em] text-text-2 mb-3">
        Accès rapides
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Link href="/dashboard/profile/edit">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <div className="text-[13px] font-semibold mb-1">Compléter mon profil</div>
            <div className="text-[12px] text-text-2">Ajoutez vos expériences et compétences</div>
          </Card>
        </Link>
        <Link href="/dashboard/incubator/new">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <div className="text-[13px] font-semibold mb-1">Créer un incubateur</div>
            <div className="text-[12px] text-text-2">Lancez votre structure d'accompagnement</div>
          </Card>
        </Link>
        <Link href="/dashboard/expert">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <div className="text-[13px] font-semibold mb-1">Profil expert</div>
            <div className="text-[12px] text-text-2">Gérez vos domaines d'expertise</div>
          </Card>
        </Link>
        <Link href="/dashboard/incubator/members">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <div className="text-[13px] font-semibold mb-1">Équipe incubateur</div>
            <div className="text-[12px] text-text-2">7 membres · 2 admins</div>
          </Card>
        </Link>
      </div>
    </div>
  )
}
