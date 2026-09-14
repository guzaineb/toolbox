'use client'

import Link from 'next/link'
import { ChevronRight, Clock } from 'lucide-react'
import { SessionStatusBadge } from './SessionStatusBadge'
import { getSessionStatusAppearance } from './session-status-ui'
import { formatSessionClock } from './SessionCalendarEvent'
import type { CoachingSession } from '@/types/coaching'

/** Parties d'affichage d'une date de session (jour / mois / jour de semaine). */
export function sessionItemDateParts(scheduledAt: string) {
  const d = new Date(scheduledAt)
  return {
    day: d.getDate(),
    month: d.toLocaleDateString('fr-FR', { month: 'short' }),
    weekday: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
  }
}

/** Heure lisible + durée (ex. « 09:00 · 60 min »). */
export function formatSessionTime(scheduledAt: string, durationMinutes?: number) {
  return durationMinutes ? `${formatSessionClock(scheduledAt)} · ${durationMinutes} min` : formatSessionClock(scheduledAt)
}

/**
 * Carte d'une session dans l'agenda (vue chronologique). Indicateur coloré par
 * statut, hover doux, clic vers la page de détail existante.
 * mode="owner" → affiche le coach ; mode="expert" → affiche le projet.
 */
export function SessionCalendarItem({
  session,
  mode,
  href,
}: {
  session: CoachingSession
  mode: 'owner' | 'expert'
  href: string
}) {
  const { day, month, weekday } = sessionItemDateParts(session.scheduled_at)
  const appearance = getSessionStatusAppearance(session.status)
  const coach = session.assignment?.expertUser?.profile
  const project = session.assignment?.project
  const title = session.title || 'Session de coaching'
  const dateLabel = new Date(session.scheduled_at).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <Link
      href={href}
      aria-label={`${title} — ${dateLabel} à ${formatSessionClock(session.scheduled_at)}, ${appearance.label}`}
      className="group relative flex items-start gap-3 rounded-[14px] border border-border bg-surface p-3 outline-none transition-all duration-150 hover:border-moss/40 hover:shadow-[0_4px_16px_rgba(15,31,22,0.06)] focus-visible:ring-2 focus-visible:ring-moss/40 sm:gap-4 sm:p-4"
    >
      <span className={`absolute inset-y-3 left-0 w-[3px] rounded-full ${appearance.bar}`} aria-hidden="true" />

      <div className="flex flex-col items-center justify-center w-[52px] h-[58px] shrink-0 rounded-xl bg-moss-light border border-border">
        <span className="text-[9px] uppercase tracking-[0.08em] font-semibold text-moss">{weekday}</span>
        <span className="font-syne text-[18px] font-extrabold text-ink leading-none mt-[2px]">{day}</span>
        <span className="text-[10px] text-ink3 capitalize">{month}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <span className="text-[13px] font-semibold text-ink leading-snug">{title}</span>
          <SessionStatusBadge status={session.status} />
        </div>
        {session.objective && (
          <p className="text-[12px] text-ink2 mt-0.5 line-clamp-1">{session.objective}</p>
        )}
        <div className="flex items-center gap-1 text-[11px] text-ink3 mt-1 flex-wrap">
          <Clock size={11} className="text-moss shrink-0" />
          <span>{formatSessionTime(session.scheduled_at, session.duration_minutes)}</span>
          {mode === 'owner' && coach && (
            <span>· {coach.first_name} {coach.last_name}</span>
          )}
          {mode === 'expert' && project && <span>· {project.name}</span>}
        </div>
      </div>

      <ChevronRight size={16} className="self-center shrink-0 text-ink3 group-hover:text-moss transition-colors" />
    </Link>
  )
}