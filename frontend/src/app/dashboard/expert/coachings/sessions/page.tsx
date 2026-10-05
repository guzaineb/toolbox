'use client'

import Link from 'next/link'
import { CalendarClock } from 'lucide-react'
import { CoachingSessionsAgenda } from '@/components/coaching/CoachingSessionsAgenda'
import { useMyCoachingSessions } from '@/hooks/useCoaching'
import type { CoachingSession } from '@/types/coaching'

export default function ExpertCoachingSessionsAgendaPage() {
  const { data: sessions, isLoading, error, refetch } = useMyCoachingSessions()

  const getSessionHref = (session: CoachingSession) =>
    session.assignment?.project?.id
      ? `/dashboard/expert/coaching/${session.assignment.project.id}/sessions/${session.id}`
      : '#'

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <nav className="flex items-center gap-1 text-[11px] text-ink3 flex-wrap">
        <Link href="/dashboard/expert/coachings" className="hover:text-moss transition-colors">
          Coachings
        </Link>
        <span>/</span>
        <span className="text-ink font-medium">Mes sessions</span>
      </nav>

      <div className="flex items-center gap-3">
        <div className="w-[36px] h-[36px] rounded-[10px] bg-moss-light border border-border flex items-center justify-center">
          <CalendarClock size={16} className="text-moss" />
        </div>
        <div>
          <h1 className="font-syne text-[20px] font-extrabold text-ink leading-tight">Agenda de mes sessions</h1>
          <p className="text-[11px] text-ink3">
            Les sessions dont vous êtes le coach : l&apos;agenda est filtré par le serveur, ouvrez une
            session pour la préparer, la dérouler et la clôturer.
          </p>
        </div>
      </div>

      <CoachingSessionsAgenda
        mode="expert"
        sessions={sessions ?? []}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        getSessionHref={getSessionHref}
      />
    </div>
  )
}