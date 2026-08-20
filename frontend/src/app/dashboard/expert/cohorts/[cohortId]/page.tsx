'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Users, Calendar, FolderOpen, HeartHandshake,
  BarChart3, Clock, Lightbulb, ListTodo, ChevronRight,
} from 'lucide-react'
import { Badge, Button, Card, ErrorAlert } from '@/components/shared/ui'
import { cohortService } from '@/services/cohort.service'
import { Cohort, COHORT_STATUS_LABELS } from '@/types/cohort'

interface CoachingProject {
  project: { id: string; name: string; description?: string; owner_id: string }
  assignment: { id: string; role: string; status: string } | null
  cohort_participation: { status: string; applied_at: string }
  stats: {
    sessions_count: number
    last_session_at: string | null
    next_session_at: string | null
    recommendations_count: number
    actions_pending: number
    actions_total: number
  }
}

const STATUS_BADGE: Record<string, 'green' | 'blue' | 'amber' | 'red' | 'gray'> = {
  DRAFT: 'gray',
  OPEN: 'green',
  IN_PROGRESS: 'blue',
  CLOSED: 'red',
  ARCHIVED: 'gray',
}

export default function ExpertCohortDetailPage() {
  const params = useParams()
  const router = useRouter()
  const cohortId = params.cohortId as string

  const [cohort, setCohort] = useState<Cohort | null>(null)
  const [projects, setProjects] = useState<CoachingProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!cohortId) return
    setLoading(true)
    setError(null)
    try {
      const [cohortData, projectsData] = await Promise.all([
        cohortService.getCohortById(cohortId),
        cohortService.getCoachingProjects(cohortId),
      ])
      setCohort(cohortData)
      setProjects(projectsData)
    } catch (err: any) {
      const msg = err?.response?.data?.message
      if (Array.isArray(msg)) setError(msg[0])
      else if (typeof msg === 'string') setError(msg)
      else setError('Impossible de charger les données de la cohorte.')
    } finally {
      setLoading(false)
    }
  }, [cohortId])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-40 bg-border rounded" />
          <div className="h-8 w-64 bg-border rounded-lg" />
          <div className="h-4 w-96 bg-border rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
            {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-border rounded-[14px]" />)}
          </div>
        </div>
      </div>
    )
  }

  if (error || !cohort) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <button
          onClick={() => router.push('/dashboard/expert/coachings')}
          className="flex items-center gap-1 text-[11px] text-ink3 hover:text-moss transition-colors mb-4"
        >
          <ArrowLeft size={12} /> Retour aux coachings
        </button>
        <Card className="text-center py-12">
          <Users size={28} className="mx-auto text-ink3 mb-3" />
          <p className="text-[13px] text-ink2 mb-4">{error || 'Cohorte introuvable.'}</p>
          <Button variant="outline" onClick={() => router.push('/dashboard/expert/coachings')}>
            <ArrowLeft size={14} /> Retour
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <button
        onClick={() => router.push('/dashboard/expert/coachings')}
        className="flex items-center gap-1 text-[11px] text-ink3 hover:text-moss transition-colors"
      >
        <ArrowLeft size={12} /> Retour aux coachings
      </button>

      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <h1 className="font-syne text-[22px] font-extrabold text-ink truncate">{cohort.name}</h1>
            <Badge variant={STATUS_BADGE[cohort.status] || 'gray'}>
              {COHORT_STATUS_LABELS[cohort.status]}
            </Badge>
          </div>
          {cohort.description && (
            <p className="text-[12px] text-ink3 max-w-2xl">{cohort.description}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-[11px] text-ink3 flex-wrap">
            {cohort.incubator?.name && (
              <span className="flex items-center gap-1">
                <Users size={11} /> {cohort.incubator.name}
              </span>
            )}
            {cohort.start_date && (
              <span className="flex items-center gap-1">
                <Calendar size={11} /> Début : {new Date(cohort.start_date).toLocaleDateString('fr-FR')}
              </span>
            )}
            {cohort.end_date && (
              <span className="flex items-center gap-1">
                <Calendar size={11} /> Fin : {new Date(cohort.end_date).toLocaleDateString('fr-FR')}
              </span>
            )}
            <span className="flex items-center gap-1">
              <FolderOpen size={11} /> {projects.length} projet(s) à coacher
            </span>
          </div>
        </div>
      </div>

      {error && <ErrorAlert message={error} />}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="font-syne text-[22px] font-extrabold text-ink leading-none">
            {projects.length}
          </div>
          <div className="text-[10px] text-ink3 uppercase tracking-[0.06em] font-semibold mt-1">Projets</div>
        </Card>
        <Card className="p-4">
          <div className="font-syne text-[22px] font-extrabold text-moss leading-none">
            {projects.reduce((sum, p) => sum + p.stats.sessions_count, 0)}
          </div>
          <div className="text-[10px] text-ink3 uppercase tracking-[0.06em] font-semibold mt-1">Sessions</div>
        </Card>
        <Card className="p-4">
          <div className="font-syne text-[22px] font-extrabold text-amber leading-none">
            {projects.reduce((sum, p) => sum + p.stats.actions_pending, 0)}
          </div>
          <div className="text-[10px] text-ink3 uppercase tracking-[0.06em] font-semibold mt-1">Actions en cours</div>
        </Card>
        <Card className="p-4">
          <div className="font-syne text-[22px] font-extrabold text-blue-600 leading-none">
            {projects.reduce((sum, p) => sum + p.stats.recommendations_count, 0)}
          </div>
          <div className="text-[10px] text-ink3 uppercase tracking-[0.06em] font-semibold mt-1">Recommandations</div>
        </Card>
      </div>

      <div>
        <h2 className="font-syne text-[15px] font-bold text-ink mb-3">Projets à coacher</h2>

        {projects.length === 0 ? (
          <Card className="text-center py-14">
            <div className="w-14 h-14 rounded-full bg-moss-light text-moss flex items-center justify-center mx-auto mb-4">
              <HeartHandshake size={24} />
            </div>
            <p className="text-[15px] font-semibold text-ink mb-1">Aucun projet à coacher</p>
            <p className="text-[12px] text-ink3">
              Aucun projet n&apos;est actuellement accepté dans cette cohorte.
            </p>
          </Card>
        ) : (
          <div className="space-y-[10px]">
            {projects.map((item) => (
              <Link key={item.project.id} href={`/dashboard/expert/coaching/${item.project.id}`}>
                <Card className="p-[16px_18px] hover:shadow-md transition-shadow cursor-pointer group">
                  <div className="flex items-start gap-[14px]">
                    <div className="w-[42px] h-[42px] rounded-[10px] bg-moss-light border border-border flex items-center justify-center flex-shrink-0 mt-1">
                      <FolderOpen size={18} className="text-moss" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] font-semibold text-ink group-hover:text-moss transition-colors truncate">
                          {item.project.name}
                        </span>
                        {item.assignment && (
                          <Badge variant="blue">Coach affecté</Badge>
                        )}
                      </div>
                      {item.project.description && (
                        <p className="text-[11px] text-ink3 mt-0.5 line-clamp-1">
                          {item.project.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {item.stats.sessions_count > 0 && (
                          <span className="flex items-center gap-1 text-[10px] text-ink3">
                            <BarChart3 size={10} /> {item.stats.sessions_count} session(s)
                          </span>
                        )}
                        {item.stats.actions_pending > 0 && (
                          <span className="flex items-center gap-1 text-[10px] text-amber-600">
                            <ListTodo size={10} /> {item.stats.actions_pending} action(s) en cours
                          </span>
                        )}
                        {item.stats.recommendations_count > 0 && (
                          <span className="flex items-center gap-1 text-[10px] text-blue-600">
                            <Lightbulb size={10} /> {item.stats.recommendations_count} recommandation(s)
                          </span>
                        )}
                        {item.stats.next_session_at && (
                          <span className="flex items-center gap-1 text-[10px] text-moss">
                            <Clock size={10} /> Prochaine : {new Date(item.stats.next_session_at).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-ink3 group-hover:text-moss transition-colors mt-2 flex-shrink-0" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
