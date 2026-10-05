'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { CalendarClock } from 'lucide-react'
import { ErrorAlert } from '@/components/shared/ui'
import { CoachingSessionsAgenda } from '@/components/coaching/CoachingSessionsAgenda'
import { useProjectSessions } from '@/hooks/useCoaching'
import type { CoachingSession } from '@/types/coaching'

export default function OwnerCoachingSessionsAgendaPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const { data: sessions, isLoading, error, refetch } = useProjectSessions(projectId)

  if (!projectId) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <ErrorAlert message="Projet introuvable" />
      </div>
    )
  }

  const getSessionHref = (session: CoachingSession) =>
    `/dashboard/project-owner/projects/${projectId}/coachings/sessions/${session.id}`

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <nav className="flex items-center gap-1 text-[11px] text-ink3 flex-wrap">
        <Link
          href={`/dashboard/project-owner/projects/${projectId}`}
          className="hover:text-moss transition-colors"
        >
          Projet
        </Link>
        <span>/</span>
        <Link
          href={`/dashboard/project-owner/projects/${projectId}/coachings`}
          className="hover:text-moss transition-colors"
        >
          Suivi coaching
        </Link>
        <span>/</span>
        <span className="text-ink font-medium">Agenda des sessions</span>
      </nav>

      <div className="flex items-center gap-3">
        <div className="w-[36px] h-[36px] rounded-[10px] bg-moss-light border border-border flex items-center justify-center">
          <CalendarClock size={16} className="text-moss" />
        </div>
        <div>
          <h1 className="font-syne text-[20px] font-extrabold text-ink leading-tight">Agenda des sessions</h1>
          <p className="text-[11px] text-ink3">
            Suivez les sessions de coaching de votre projet. Ouvrez une session pour consulter son
            déroulé en lecture seule.
          </p>
        </div>
      </div>

      <CoachingSessionsAgenda
        mode="owner"
        sessions={sessions ?? []}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        getSessionHref={getSessionHref}
      />
    </div>
  )
}