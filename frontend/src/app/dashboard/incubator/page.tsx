import Link from 'next/link'
import { AdminGuard, Badge, Button, Card, StatBox } from '@/components/shared/ui'

export default function IncubatorPage() {
  return (
    <div className="p-8 max-w-[800px]">
      <h1 className="font-display text-[26px] mb-1">Incubateur</h1>
      <p className="text-[13px] text-text-2 mb-7">Gérez votre structure d'accompagnement</p>

      {/* Incubator card */}
      <Card className="flex items-center gap-[14px] mb-5">
        <div className="w-14 h-14 rounded-[10px] bg-[#fdf0ec] text-[#8a3a1a] flex items-center justify-center text-[20px] flex-shrink-0">
          🏢
        </div>
        <div>
          <div className="text-[16px] font-semibold">StartUp Tunisia Hub</div>
          <div className="text-[12px] text-text-2">startup-tunisia-hub · Privé · Tunis</div>
          <div className="flex gap-1.5 mt-1.5">
            <Badge variant="amber">En attente de validation</Badge>
            <Badge variant="blue">Actif</Badge>
          </div>
        </div>
        <div className="ml-auto flex gap-1.5">
          <Link href="/dashboard/incubator/manage">
            <Button className="text-[12px]">Modifier</Button>
          </Link>
          <Link href="/dashboard/incubator/new">
            <Button variant="primary" className="text-[12px]">+ Créer</Button>
          </Link>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        <StatBox num={7} label="Membres" />
        <StatBox num="2/4" label="Documents validés" />
        <StatBox num={2021} label="Année de création" />
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <Link href="/dashboard/incubator/members">
          <Button>Gérer l'équipe →</Button>
        </Link>
        <Link href="/dashboard/incubator/documents">
          <Button>Documents vérification →</Button>
        </Link>
        <Link href="/dashboard/incubator/manage">
          <Button>Informations <AdminGuard /></Button>
        </Link>
      </div>
    </div>
  )
}
