'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, Plus, ChevronRight, Calendar, UserCheck } from 'lucide-react'
import { cohortService } from '@/services/cohort.service'
import { Badge, Button, Card } from '@/components/shared/ui'
import {
  Cohort,
  COHORT_STATUS_LABELS,
  COHORT_STATUS_COLORS,
} from '@/types/cohort'

export default function CohortsListPage() {
  const { incubatorId } = useParams<{ incubatorId: string }>()
  const [cohorts, setCohorts] = useState<Cohort[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (incubatorId) {
      cohortService
        .getIncubatorCohorts(incubatorId)
        .then(setCohorts)
        .finally(() => setLoading(false))
    }
  }, [incubatorId])

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-7 w-64 bg-border rounded-lg" />
          <div className="h-24 bg-border rounded-[14px] mt-4" />
          <div className="h-24 bg-border rounded-[14px]" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-[5px] text-[11px] text-ink3 mb-2">
        <Link href="/dashboard/incubator" className="hover:text-moss transition-colors">Incubateurs</Link>
        <ChevronRight size={11} />
        <Link href={`/dashboard/incubator/${incubatorId}`} className="hover:text-moss transition-colors">Détail</Link>
        <ChevronRight size={11} />
        <span className="text-ink font-medium">Cohortes</span>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-syne text-[22px] font-extrabold text-ink mb-[2px]">Cohortes</h1>
          <p className="text-[12px] text-ink3">Gérez les cohortes de votre incubateur</p>
        </div>
        <Link href={`/dashboard/incubator/${incubatorId}/cohorts/create`}>
          <Button variant="primary">
            <Plus size={12} />
            Créer une cohorte
          </Button>
        </Link>
      </div>

      {cohorts.length === 0 ? (
        <Card className="text-center py-14">
          <div className="w-14 h-14 rounded-full bg-moss-light text-moss flex items-center justify-center mx-auto mb-4 text-[22px]">
            <Users size={24} />
          </div>
          <p className="text-[15px] font-semibold text-ink mb-1">Aucune cohorte</p>
          <p className="text-[12px] text-ink3 mb-6 max-w-[280px] mx-auto">
            Créez votre première cohorte pour commencer à recruter des projets.
          </p>
          <Link href={`/dashboard/incubator/${incubatorId}/cohorts/create`}>
            <Button variant="primary">
              <Plus size={12} />
              Créer une cohorte
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-[10px]">
          {cohorts.map((cohort) => (
            <Link key={cohort.id} href={`/dashboard/incubator/${incubatorId}/cohorts/${cohort.id}`}>
              <Card className="hover:shadow-[0_3px_16px_rgba(45,122,82,0.09)] hover:border-border-2 transition-all cursor-pointer">
                <div className="p-[16px_18px] flex items-center gap-[14px]">
                  <div className="w-[46px] h-[46px] rounded-[12px] bg-moss-light border border-border flex items-center justify-center text-[22px] flex-shrink-0">
                    <Users size={22} className="text-moss" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-syne text-[15px] font-bold text-ink mb-[2px] truncate">{cohort.name}</h3>
                    <p className="text-[11px] text-ink3 mb-[6px]">
                      {cohort.program || 'Programme non défini'}
                      {cohort.start_date
                        ? ` · ${new Date(cohort.start_date).toLocaleDateString('fr-FR')}`
                        : ''}
                    </p>
                    <div className="flex gap-[5px] flex-wrap">
                      <Badge variant={COHORT_STATUS_COLORS[cohort.status]?.includes('green') ? 'green' : COHORT_STATUS_COLORS[cohort.status]?.includes('blue') ? 'blue' : COHORT_STATUS_COLORS[cohort.status]?.includes('red') ? 'red' : COHORT_STATUS_COLORS[cohort.status]?.includes('yellow') ? 'amber' : 'gray'}>
                        {COHORT_STATUS_LABELS[cohort.status]}
                      </Badge>
                    </div>
                  </div>

                  <div className="hidden sm:flex gap-[18px] mr-3">
                    <div className="text-center">
                      <div className="font-syne text-[18px] font-extrabold text-ink leading-none">
                        {cohort.current_participants}
                        {cohort.capacity ? <span className="text-[11px] text-ink3 font-normal">/{cohort.capacity}</span> : null}
                      </div>
                      <div className="text-[9px] text-ink3 uppercase tracking-[0.06em] font-semibold mt-1">Participants</div>
                    </div>
                    <div className="text-center">
                      <div className="font-syne text-[18px] font-extrabold text-ink leading-none">
                        {cohort.experts?.length ?? 0}
                      </div>
                      <div className="text-[9px] text-ink3 uppercase tracking-[0.06em] font-semibold mt-1">Experts</div>
                    </div>
                  </div>

                  <Button variant="outline" size="sm">
                    Gérer
                    <ChevronRight size={11} />
                  </Button>
                </div>
              </Card>
            </Link>
          ))}

          <Link href={`/dashboard/incubator/${incubatorId}/cohorts/create`}>
            <div className="border-[1.5px] border-dashed border-moss/20 bg-moss/[.02] rounded-[14px] p-6 flex items-center justify-center cursor-pointer hover:border-moss/40 hover:bg-moss/[.04] transition-all">
              <div className="text-center">
                <div className="w-10 h-10 rounded-[12px] bg-moss-light border border-border flex items-center justify-center mx-auto mb-[10px] text-[20px]">
                  <Plus size={20} className="text-moss" />
                </div>
                <div className="text-[13px] font-semibold text-ink mb-1">Créer une nouvelle cohorte</div>
                <Button variant="primary" size="sm"><Plus size={11} /> Créer</Button>
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}
