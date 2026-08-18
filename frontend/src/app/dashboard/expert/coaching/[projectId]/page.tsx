'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, HeartHandshake } from 'lucide-react'
import { Badge, Button, Card, LoadingState } from '@/components/shared/ui'
import { coachingService } from '@/services/coaching.service'
import { SessionsPanel, ActionsPanel, RecommendationsPanel } from '@/components/coaching/CoachingPanels'
import { CoachingOverview, ASSIGNMENT_ROLE_LABELS } from '@/types/coaching'

export default function ExpertCoachingProjectPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string

  const [overview, setOverview] = useState<CoachingOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOverview = useCallback(() => {
    if (!projectId) return
    setLoading(true)
    coachingService
      .getProjectCoachingOverview(projectId)
      .then(setOverview)
      .catch((err: any) => setError(err?.response?.data?.message ?? 'Erreur de chargement'))
      .finally(() => setLoading(false))
  }, [projectId])

  useEffect(() => { fetchOverview() }, [fetchOverview])

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-7 w-64 bg-border rounded-lg" />
          <div className="h-40 bg-border rounded-[14px]" />
          <div className="h-40 bg-border rounded-[14px]" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <Card className="text-center py-12">
          <p className="text-[13px] text-ink2">{error}</p>
          <Button className="mt-4" variant="outline" onClick={() => router.push('/dashboard/expert/coachings')}>
            <ArrowLeft size={14} /> Retour
          </Button>
        </Card>
      </div>
    )
  }

  const myAssignments = overview?.assignments ?? []
  const coaches = myAssignments.filter((a) => a.role === 'COACH')

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <button onClick={() => router.push('/dashboard/expert/coachings')} className="flex items-center gap-1 text-[11px] text-ink3 hover:text-moss transition-colors">
        <ArrowLeft size={12} /> Retour aux coachings
      </button>

      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div>
          <h1 className="font-syne text-[22px] font-extrabold text-ink mb-1">Suivi coaching</h1>
          <div className="flex items-center gap-2 text-[12px] text-ink3">
            <HeartHandshake size={14} className="text-moss" />
            Projet en accompagnement
            {coaches.length > 0 && (
              <Badge variant="blue">
                {coaches.length} coach{coaches.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {overview && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="p-4">
              <div className="font-syne text-[24px] font-extrabold text-ink leading-none">{overview.counts.sessions}</div>
              <div className="text-[10px] text-ink3 uppercase tracking-[0.06em] font-semibold mt-1">Sessions</div>
            </Card>
            <Card className="p-4">
              <div className="font-syne text-[24px] font-extrabold text-ink leading-none">{overview.counts.sessions_completed}</div>
              <div className="text-[10px] text-ink3 uppercase tracking-[0.06em] font-semibold mt-1">Sessions terminées</div>
            </Card>
            <Card className="p-4">
              <div className="font-syne text-[24px] font-extrabold text-moss leading-none">{overview.counts.actions_pending}</div>
              <div className="text-[10px] text-ink3 uppercase tracking-[0.06em] font-semibold mt-1">Actions en cours</div>
            </Card>
            <Card className="p-4">
              <div className="font-syne text-[24px] font-extrabold text-amber leading-none">{overview.counts.recommendations}</div>
              <div className="text-[10px] text-ink3 uppercase tracking-[0.06em] font-semibold mt-1">Recommandations</div>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <div className="px-[18px] py-[13px] border-b border-border bg-surface-2 font-syne text-[13px] font-bold text-ink">
              Sessions de coaching
            </div>
            <div className="p-[18px]">
              <SessionsPanel projectId={projectId} sessions={overview.sessions} canManage onRefresh={fetchOverview} />
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="px-[18px] py-[13px] border-b border-border bg-surface-2 font-syne text-[13px] font-bold text-ink">
              Actions
            </div>
            <div className="p-[18px]">
              <ActionsPanel projectId={projectId} actions={overview.actions} canManage onRefresh={fetchOverview} />
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="px-[18px] py-[13px] border-b border-border bg-surface-2 font-syne text-[13px] font-bold text-ink">
              Recommandations
            </div>
            <div className="p-[18px]">
              <RecommendationsPanel projectId={projectId} recommendations={overview.recommendations} canManage onRefresh={fetchOverview} />
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
