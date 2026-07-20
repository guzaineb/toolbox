'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, ChevronRight, Calendar, Clock } from 'lucide-react'
import { cohortService } from '@/services/cohort.service'
import { Badge, Button, Card } from '@/components/shared/ui'
import { Cohort, COHORT_STATUS_LABELS, COHORT_STATUS_COLORS } from '@/types/cohort'

export default function OpenCohortsPage() {
  const [cohorts, setCohorts] = useState<Cohort[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cohortService
      .getOpenCohorts()
      .then(setCohorts)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-7 w-64 bg-border rounded-lg" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-border rounded-[14px]" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <h1 className="font-syne text-[22px] font-extrabold text-ink mb-[2px]">Cohortes ouvertes</h1>
      <p className="text-[12px] text-ink3 mb-6">Découvrez les cohortes disponibles et candiditez</p>

      {cohorts.length === 0 ? (
        <Card className="text-center py-14">
          <div className="w-14 h-14 rounded-full bg-moss-light text-moss flex items-center justify-center mx-auto mb-4">
            <Users size={24} />
          </div>
          <p className="text-[15px] font-semibold text-ink mb-1">Aucune cohorte ouverte</p>
          <p className="text-[12px] text-ink3">Revenez plus tard pour découvrir de nouvelles opportunités.</p>
        </Card>
      ) : (
        <div className="space-y-[10px]">
          {cohorts.map((cohort) => (
            <Link key={cohort.id} href={`/dashboard/project-owner/cohorts/${cohort.id}`}>
              <Card className="hover:shadow-[0_3px_16px_rgba(45,122,82,0.09)] hover:border-border-2 transition-all cursor-pointer">
                <div className="p-[16px_18px] flex items-center gap-[14px]">
                  <div className="w-[46px] h-[46px] rounded-[12px] bg-moss-light border border-border flex items-center justify-center flex-shrink-0">
                    <Users size={22} className="text-moss" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-syne text-[15px] font-bold text-ink mb-[2px] truncate">{cohort.name}</h3>
                    <p className="text-[11px] text-ink3 mb-[6px]">
                      {cohort.program || 'Programme non défini'}
                      {cohort.capacity ? ` · ${cohort._count?.participations ?? 0}/${cohort.capacity} participants` : ''}
                    </p>
                    <div className="flex gap-[5px] flex-wrap">
                      {cohort.application_deadline && (
                        <Badge variant="amber">
                          <Calendar size={10} className="mr-1" />
                          Limite : {new Date(cohort.application_deadline).toLocaleDateString('fr-FR')}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Voir <ChevronRight size={11} />
                  </Button>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
