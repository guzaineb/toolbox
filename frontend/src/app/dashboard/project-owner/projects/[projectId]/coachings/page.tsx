'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, HeartHandshake, Bot, Target, CalendarClock } from 'lucide-react'
import { Card } from '@/components/shared/ui'
import { coachingService } from '@/services/coaching.service'
import { SessionsPanel, ActionsPanel, RecommendationsPanel } from '@/components/coaching/CoachingPanels'
import { MaturityCard } from '@/components/coaching/MaturityCard'
import { ImprovementPlanPanel } from '@/components/coaching/ImprovementPlanPanel'
import { GbmChatbot } from '@/components/gbm/GbmChatbot'
import { CoachingOverview, ASSIGNMENT_ROLE_LABELS } from '@/types/coaching'

export default function ProjectCoachingPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string

  const [overview, setOverview] = useState<CoachingOverview | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchOverview = useCallback(() => {
    if (!projectId) return
    setLoading(true)
    coachingService
      .getProjectCoachingOverview(projectId)
      .then(setOverview)
      .finally(() => setLoading(false))
  }, [projectId])

  useEffect(() => { fetchOverview() }, [fetchOverview])

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-7 w-64 bg-border rounded-lg" />
          <div className="h-40 bg-border rounded-[14px]" />
        </div>
      </div>
    )
  }

  const coaches = (overview?.assignments ?? []).filter((a) => a.role === 'COACH')

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <button onClick={() => router.push(`/dashboard/project-owner/projects/${projectId}`)} className="flex items-center gap-1 text-[11px] text-ink3 hover:text-moss transition-colors">
        <ArrowLeft size={12} /> Retour au projet
      </button>

      <div className="flex items-start gap-4">
        <div className="w-[40px] h-[40px] rounded-[10px] bg-moss-light border border-border flex items-center justify-center flex-shrink-0">
          <HeartHandshake size={18} className="text-moss" />
        </div>
        <div>
          <h1 className="font-syne text-[22px] font-extrabold text-ink mb-1">Suivi coaching</h1>
          {coaches.length > 0 ? (
            <p className="text-[12px] text-ink3">
              Coach{coaches.length > 1 ? 's' : ''} : {coaches.map((c) => {
                const p = c.expertUser?.profile
                return p ? `${p.first_name} ${p.last_name}` : c.expertUser?.email
              }).join(', ')}
            </p>
          ) : (
            <p className="text-[12px] text-ink3">Aucun coach affecté pour le moment.</p>
          )}
        </div>
      </div>

      {overview && (
        <>
          <div className="grid lg:grid-cols-[1fr_1.4fr] gap-4 items-start">
            <MaturityCard projectId={projectId} />
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Card className="p-4">
                  <div className="font-syne text-[24px] font-extrabold text-moss leading-none">{overview.counts.actions_completed}</div>
                  <div className="text-[10px] text-ink3 uppercase tracking-[0.06em] font-semibold mt-1">Actions terminées</div>
                </Card>
                <Card className="p-4">
                  <div className="font-syne text-[24px] font-extrabold text-amber leading-none">{overview.counts.actions_pending}</div>
                  <div className="text-[10px] text-ink3 uppercase tracking-[0.06em] font-semibold mt-1">Actions en cours</div>
                </Card>
              </div>
              {overview.sessions.filter((s) => s.status !== 'COMPLETED').slice(0, 1).map((s) => (
                <Card key={s.id} className="p-4 flex items-center gap-3">
                  <CalendarClock size={16} className="text-moss shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] text-ink3 uppercase tracking-[0.06em] font-semibold">Prochaine session</div>
                    <div className="text-[13px] text-ink font-medium truncate">
                      {new Date(s.scheduled_at).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}
                      {s.title ? ` — ${s.title}` : ''}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <Card className="overflow-hidden">
            <div className="px-[18px] py-[13px] border-b border-border bg-surface-2 font-syne text-[13px] font-bold text-ink flex items-center gap-2">
              <Bot size={14} className="text-moss" /> AI Coach — posez vos questions sur votre suivi
            </div>
            <div className="p-[18px]">
              <GbmChatbot projectId={projectId} />
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="px-[18px] py-[13px] border-b border-border bg-surface-2 font-syne text-[13px] font-bold text-ink flex items-center gap-2">
              <Target size={14} className="text-moss" /> Plan d'amélioration & objectifs
            </div>
            <div className="p-[18px]">
              <ImprovementPlanPanel projectId={projectId} canManage={false} />
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="px-[18px] py-[13px] border-b border-border bg-surface-2 font-syne text-[13px] font-bold text-ink">
              Sessions de coaching
            </div>
            <div className="p-[18px]">
              <SessionsPanel projectId={projectId} sessions={overview.sessions} canManage={false} onRefresh={fetchOverview} />
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="px-[18px] py-[13px] border-b border-border bg-surface-2 font-syne text-[13px] font-bold text-ink">
              Mes actions — soumettez vos preuves de réalisation
            </div>
            <div className="p-[18px]">
              <ActionsPanel projectId={projectId} actions={overview.actions} canManage={false} isOwner onRefresh={fetchOverview} />
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="px-[18px] py-[13px] border-b border-border bg-surface-2 font-syne text-[13px] font-bold text-ink">
              Recommandations du coach
            </div>
            <div className="p-[18px]">
              <RecommendationsPanel projectId={projectId} recommendations={overview.recommendations} canManage={false} onRefresh={fetchOverview} />
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
