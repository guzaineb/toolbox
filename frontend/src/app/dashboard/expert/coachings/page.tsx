'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  HeartHandshake, Users, Calendar, ChevronRight, FolderOpen,
} from 'lucide-react'
import { Badge, Button, Card, ErrorAlert } from '@/components/shared/ui'
import { cohortService } from '@/services/cohort.service'
import { CohortExpert, COHORT_STATUS_LABELS } from '@/types/cohort'

const STATUS_BADGE: Record<string, 'green' | 'blue' | 'amber' | 'red' | 'gray'> = {
  DRAFT: 'gray',
  OPEN: 'green',
  IN_PROGRESS: 'blue',
  CLOSED: 'red',
  ARCHIVED: 'gray',
}

export default function ExpertCoachingsPage() {
  const [cohorts, setCohorts] = useState<CohortExpert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCoachings = () => {
    setLoading(true)
    setError(null)
    cohortService
      .getMyCohorts()
      .then((data) => {
        const all = data as CohortExpert[]
        setCohorts(
          all.filter(
            (c) => c.role === 'COACH' && c.status === 'ACTIVE',
          ),
        )
      })
      .catch(() => setError('Impossible de charger vos cohortes de coaching.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchCoachings() }, [])

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-7 w-64 bg-border rounded-lg" />
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-border rounded-[14px]" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <h1 className="font-syne text-[22px] font-extrabold text-ink mb-[2px]">Mes cohortes de coaching</h1>
      <p className="text-[12px] text-ink3 mb-6">
        Les cohortes dans lesquelles vous êtes affecté comme coach.
      </p>

      {error && <div className="mb-5"><ErrorAlert message={error} /></div>}

      {cohorts.length === 0 ? (
        <Card className="text-center py-14">
          <div className="w-14 h-14 rounded-full bg-moss-light text-moss flex items-center justify-center mx-auto mb-4">
            <HeartHandshake size={24} />
          </div>
          <p className="text-[15px] font-semibold text-ink mb-1">Aucune cohorte de coaching</p>
          <p className="text-[12px] text-ink3 mb-4">
            Vous n&apos;êtes coach d&apos;aucune cohorte actuellement.
          </p>
          <Link href="/dashboard/expert/cohorts">
            <Button variant="outline" size="sm">
              Explorer les cohortes disponibles
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-[10px]">
          {cohorts.map((ce) => {
            const cohort = ce.cohort
            if (!cohort) return null

            return (
              <Link key={ce.id} href={`/dashboard/expert/cohorts/${cohort.id}`}>
                <Card className="p-[16px_18px] hover:shadow-md transition-shadow cursor-pointer group">
                  <div className="flex items-start gap-[14px]">
                    <div className="w-[46px] h-[46px] rounded-[12px] bg-moss-light border border-border flex items-center justify-center flex-shrink-0 mt-1">
                      <Users size={22} className="text-moss" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-syne text-[15px] font-bold text-ink group-hover:text-moss transition-colors truncate">
                          {cohort.name}
                        </h3>
                        <Badge variant={STATUS_BADGE[cohort.status] || 'gray'}>
                          {COHORT_STATUS_LABELS[cohort.status]}
                        </Badge>
                        <Badge variant="blue">Coach</Badge>
                      </div>
                      <div className="text-[11px] text-ink3 mt-0.5">
                        {cohort.incubator?.name || 'Incubateur inconnu'}
                        {cohort._count?.participations != null && (
                          <span> · {cohort._count.participations} projet(s)</span>
                        )}
                      </div>
                      {cohort.description && (
                        <p className="text-[12px] text-ink2 mt-[6px] line-clamp-2">
                          {cohort.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {cohort.start_date && (
                          <span className="flex items-center gap-1 text-[10px] text-ink3">
                            <Calendar size={10} /> Début : {new Date(cohort.start_date).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                        {cohort.end_date && (
                          <span className="flex items-center gap-1 text-[10px] text-ink3">
                            <Calendar size={10} /> Fin : {new Date(cohort.end_date).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                        {cohort.application_deadline && (
                          <Badge variant="amber">
                            <Calendar size={9} className="mr-1" />
                            Limite : {new Date(cohort.application_deadline).toLocaleDateString('fr-FR')}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 mt-2">
                      <FolderOpen size={14} className="text-ink3 group-hover:text-moss transition-colors" />
                      <ChevronRight size={14} className="text-ink3 group-hover:text-moss transition-colors" />
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
