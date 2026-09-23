'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, ChevronRight, X as XIcon, Clock } from 'lucide-react'
import api from '@/services/api'
import { cohortService } from '@/services/cohort.service'
import { Badge, Button, Card, ErrorAlert } from '@/components/shared/ui'
import {
  CohortParticipation,
  PARTICIPATION_STATUS_LABELS,
  PARTICIPATION_STATUS_COLORS,
  PARTICIPATION_ORIGIN_LABELS,
} from '@/types/cohort'

export default function ParticipationsPage() {
  const [participations, setParticipations] = useState<CohortParticipation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null)

  const fetchParticipations = () => {
    setLoading(true)
    api.get('/projects')
      .then(async (res) => {
        const allParticipations: CohortParticipation[] = []
        for (const project of res.data) {
          const parts = await cohortService.getProjectParticipations(project.id)
          allParticipations.push(...parts)
        }
        setParticipations(allParticipations)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchParticipations() }, [])

  const handleWithdraw = async (id: string) => {
    setError(null)
    setWithdrawingId(id)
    try {
      await cohortService.withdrawParticipation(id)
      fetchParticipations()
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erreur lors du retrait')
    } finally {
      setWithdrawingId(null)
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-7 w-64 bg-border rounded-lg" />
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-border rounded-[14px]" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <h1 className="font-syne text-[22px] font-extrabold text-ink mb-[2px]">Mes candidatures</h1>
      <p className="text-[12px] text-ink3 mb-6">Suivez l'état de vos candidatures aux cohortes</p>

      {error && <div className="mb-5"><ErrorAlert message={error} /></div>}

      {participations.length === 0 ? (
        <Card className="text-center py-14">
          <div className="w-14 h-14 rounded-full bg-moss-light text-moss flex items-center justify-center mx-auto mb-4">
            <FileText size={24} />
          </div>
          <p className="text-[15px] font-semibold text-ink mb-1">Aucune candidature</p>
          <p className="text-[12px] text-ink3 mb-6">Vous n'avez pas encore candidaté.</p>
          <Link href="/dashboard/project-owner/cohorts">
            <Button variant="primary">Voir les cohortes ouvertes</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-[10px]">
          {participations.map((p) => (
            <Card key={p.id} className="p-[16px_18px]">
              <div className="flex items-center gap-[14px]">
                <div className="w-[40px] h-[40px] rounded-[10px] bg-moss-light border border-border flex items-center justify-center flex-shrink-0">
                  <FileText size={18} className="text-moss" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-ink truncate">
                    {p.project?.name || 'Projet inconnu'}
                  </div>
                  <div className="text-[11px] text-ink3">
                    Cohorte : {p.cohort?.name || '—'} · {PARTICIPATION_ORIGIN_LABELS[p.origin]} · {new Date(p.applied_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <Badge variant={PARTICIPATION_STATUS_COLORS[p.status]?.includes('green') ? 'green' : PARTICIPATION_STATUS_COLORS[p.status]?.includes('yellow') ? 'amber' : PARTICIPATION_STATUS_COLORS[p.status]?.includes('red') ? 'red' : 'gray'}>
                  {PARTICIPATION_STATUS_LABELS[p.status]}
                </Badge>
                {(p.status === 'PENDING' || p.status === 'ACCEPTED') && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="!text-red"
                    loading={withdrawingId === p.id}
                    onClick={() => handleWithdraw(p.id)}
                  >
                    <XIcon size={13} />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
