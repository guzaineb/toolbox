'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, HeartHandshake, CalendarClock, ListTodo, Lightbulb,
  BarChart3, CheckCircle2, BrainCircuit, ClipboardList, TrendingUp,
} from 'lucide-react'
import { Badge, Button, Card, ErrorAlert } from '@/components/shared/ui'
import { coachingService } from '@/services/coaching.service'
import { SessionsPanel, ActionsPanel, RecommendationsPanel } from '@/components/coaching/CoachingPanels'
import { MaturityCard } from '@/components/coaching/MaturityCard'
import { AiAnalysisPanel } from '@/components/coaching/AiAnalysisPanel'
import { ImprovementPlanPanel } from '@/components/coaching/ImprovementPlanPanel'
import { ProgressPanel } from '@/components/coaching/ProgressPanel'
import { CoachingOverview } from '@/types/coaching'

type Tab = 'overview' | 'ai' | 'plan' | 'sessions' | 'actions' | 'recommendations' | 'progress'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: <BarChart3 size={13} /> },
  { id: 'ai', label: 'Analyse IA', icon: <BrainCircuit size={13} /> },
  { id: 'plan', label: "Plan d'amélioration", icon: <ClipboardList size={13} /> },
  { id: 'sessions', label: 'Sessions', icon: <CalendarClock size={13} /> },
  { id: 'actions', label: 'Actions', icon: <ListTodo size={13} /> },
  { id: 'recommendations', label: 'Recommandations', icon: <Lightbulb size={13} /> },
  { id: 'progress', label: 'Progression', icon: <TrendingUp size={13} /> },
]

export default function ExpertCoachingProjectPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = params.projectId as string
  const cohortId = searchParams.get('cohortId')

  const [overview, setOverview] = useState<CoachingOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('overview')

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
          <div className="h-5 w-48 bg-border rounded" />
          <div className="h-7 w-64 bg-border rounded-lg" />
          <div className="h-4 w-96 bg-border rounded" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-border rounded-[14px]" />)}
          </div>
          <div className="h-64 bg-border rounded-[14px] mt-4" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <button
          onClick={() => cohortId ? router.push(`/dashboard/expert/cohorts/${cohortId}`) : router.push('/dashboard/expert/coachings')}
          className="flex items-center gap-1 text-[11px] text-ink3 hover:text-moss transition-colors mb-4"
        >
          <ArrowLeft size={12} /> Retour
        </button>
        <Card className="text-center py-12">
          <p className="text-[13px] text-ink2">{error}</p>
          <Button className="mt-4" variant="outline" onClick={() => cohortId ? router.push(`/dashboard/expert/cohorts/${cohortId}`) : router.push('/dashboard/expert/coachings')}>
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
      <nav className="flex items-center gap-1 text-[11px] text-ink3 flex-wrap">
        <Link href="/dashboard/expert/coachings" className="hover:text-moss transition-colors">
          Coachings
        </Link>
        <span>/</span>
        {cohortId && (
          <>
            <Link href={`/dashboard/expert/cohorts/${cohortId}`} className="hover:text-moss transition-colors">
              Cohorte
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-ink font-medium">Projet</span>
      </nav>

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
              <div className="flex items-center gap-2">
                <CalendarClock size={14} className="text-ink3" />
                <div className="font-syne text-[24px] font-extrabold text-ink leading-none">{overview.counts.sessions}</div>
              </div>
              <div className="text-[10px] text-ink3 uppercase tracking-[0.06em] font-semibold mt-1">Sessions</div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-moss" />
                <div className="font-syne text-[24px] font-extrabold text-moss leading-none">{overview.counts.sessions_completed}</div>
              </div>
              <div className="text-[10px] text-ink3 uppercase tracking-[0.06em] font-semibold mt-1">Terminées</div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <ListTodo size={14} className="text-amber" />
                <div className="font-syne text-[24px] font-extrabold text-amber leading-none">{overview.counts.actions_pending}</div>
              </div>
              <div className="text-[10px] text-ink3 uppercase tracking-[0.06em] font-semibold mt-1">Actions en cours</div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Lightbulb size={14} className="text-blue-600" />
                <div className="font-syne text-[24px] font-extrabold text-blue-600 leading-none">{overview.counts.recommendations}</div>
              </div>
              <div className="text-[10px] text-ink3 uppercase tracking-[0.06em] font-semibold mt-1">Recommandations</div>
            </Card>
          </div>

          <div className="flex gap-[2px] bg-surface-2 rounded-[10px] p-1 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-[8px] text-[12px] font-medium transition-colors whitespace-nowrap ${
                  tab === t.id
                    ? 'bg-surface text-ink shadow-sm'
                    : 'text-ink3 hover:text-ink'
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {error && <ErrorAlert message={error} />}

          {tab === 'overview' && (
            <div className="space-y-4">
              <div className="grid lg:grid-cols-[1fr_1.4fr] gap-4 items-start">
                <MaturityCard projectId={projectId} />
                <Card className="overflow-hidden">
                  <div className="px-[18px] py-[13px] border-b border-border bg-surface-2 font-syne text-[13px] font-bold text-ink">
                    Prochaines sessions
                  </div>
                  <div className="p-[18px]">
                    <SessionsPanel
                      projectId={projectId}
                      sessions={overview.sessions.filter((s) => s.status !== 'COMPLETED').slice(0, 3)}
                      canManage
                      onRefresh={fetchOverview}
                      sessionHref={(id) => `/dashboard/expert/coaching/${projectId}/sessions/${id}`}
                    />
                  </div>
                </Card>
              </div>
              <Card className="overflow-hidden">
                <div className="px-[18px] py-[13px] border-b border-border bg-surface-2 font-syne text-[13px] font-bold text-ink">
                  Actions récentes
                </div>
                <div className="p-[18px]">
                  <ActionsPanel projectId={projectId} actions={overview.actions.slice(0, 5)} canManage onRefresh={fetchOverview} />
                </div>
              </Card>
              <Card className="overflow-hidden">
                <div className="px-[18px] py-[13px] border-b border-border bg-surface-2 font-syne text-[13px] font-bold text-ink">
                  Recommandations récentes
                </div>
                <div className="p-[18px]">
                  <RecommendationsPanel projectId={projectId} recommendations={overview.recommendations.slice(0, 5)} canManage onRefresh={fetchOverview} />
                </div>
              </Card>
            </div>
          )}

          {tab === 'ai' && (
            <AiAnalysisPanel projectId={projectId} onRecommendationCreated={fetchOverview} />
          )}

          {tab === 'plan' && (
            <ImprovementPlanPanel projectId={projectId} canManage />
          )}

          {tab === 'sessions' && (
            <Card className="overflow-hidden">
              <div className="px-[18px] py-[13px] border-b border-border bg-surface-2 font-syne text-[13px] font-bold text-ink">
                Sessions de coaching
              </div>
              <div className="p-[18px]">
                <SessionsPanel
                  projectId={projectId}
                  sessions={overview.sessions}
                  canManage
                  onRefresh={fetchOverview}
                  sessionHref={(id) => `/dashboard/expert/coaching/${projectId}/sessions/${id}`}
                />
              </div>
            </Card>
          )}

          {tab === 'actions' && (
            <Card className="overflow-hidden">
              <div className="px-[18px] py-[13px] border-b border-border bg-surface-2 font-syne text-[13px] font-bold text-ink">
                Actions
              </div>
              <div className="p-[18px]">
                <ActionsPanel projectId={projectId} actions={overview.actions} canManage onRefresh={fetchOverview} />
              </div>
            </Card>
          )}

          {tab === 'recommendations' && (
            <Card className="overflow-hidden">
              <div className="px-[18px] py-[13px] border-b border-border bg-surface-2 font-syne text-[13px] font-bold text-ink">
                Recommandations
              </div>
              <div className="p-[18px]">
                <RecommendationsPanel projectId={projectId} recommendations={overview.recommendations} canManage onRefresh={fetchOverview} />
              </div>
            </Card>
          )}

          {tab === 'progress' && (
            <div className="space-y-4">
              <ProgressPanel projectId={projectId} />
              <ImprovementPlanPanel projectId={projectId} canManage />
            </div>
          )}
        </>
      )}
    </div>
  )
}
