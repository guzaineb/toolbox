'use client'

import Link from 'next/link'
import { Clock, User, FolderKanban } from 'lucide-react'
import { SessionStatusBadge } from './SessionStatusBadge'
import { getSessionStatusAppearance } from './session-status-ui'
import type { CoachingSession } from '@/types/coaching'

/** Heure lisible d'une session (ex. « 09:00 »). */
export function formatSessionClock(scheduledAt: string) {
  return new Date(scheduledAt).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Événement compact d'une cellule de calendrier (vue Mois / Semaine).
 * Affiche l'heure et le titre ; un aperçu complet apparaît au survol / focus.
 * Le clic ouvre la page de détail existante (aucun second système de navigation).
 */
export function SessionCalendarEvent({
  session,
  mode,
  href,
}: {
  session: CoachingSession
  mode: 'owner' | 'expert'
  href: string
}) {
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
      className="group relative block rounded-[8px] border bg-surface shadow-sm outline-none transition-all duration-150 hover:shadow-[0_4px_14px_rgba(15,31,22,0.1)] focus-visible:ring-2 focus-visible:ring-moss/40"
    >
      <span className={`absolute inset-y-0 left-0 w-[3px] rounded-l-[8px] ${appearance.bar}`} aria-hidden="true" />
      <span className={`block rounded-[8px] border border-l-0 py-[3px] pl-[9px] pr-1.5 ${appearance.chip}`}>
        <span className="block text-[10px] font-semibold tabular-nums">
          {formatSessionClock(session.scheduled_at)}
        </span>
        <span className="block truncate text-[11px] font-semibold">{title}</span>
      </span>

      {/* Aperçu au survol / focus (données réelles uniquement) */}
      <span className="pointer-events-none absolute bottom-full left-0 z-30 mb-[6px] hidden w-[240px] rounded-[12px] border border-border bg-surface p-3 shadow-[0_10px_30px_rgba(15,31,22,0.16)] group-hover:block group-focus-within:block">
        <span className="block text-[13px] font-bold text-ink">{title}</span>
        {session.objective && (
          <span className="mt-0.5 line-clamp-2 block text-[11px] text-ink2">{session.objective}</span>
        )}
        <span className="mt-2 flex items-center gap-1 text-[11px] text-ink2">
          <Clock size={12} className="shrink-0 text-moss" />
          <span className="capitalize">{dateLabel}</span>
          <span aria-hidden="true">·</span>
          <span>{formatSessionClock(session.scheduled_at)}</span>
          {session.duration_minutes ? <span>· {session.duration_minutes} min</span> : null}
        </span>
        {mode === 'owner' && coach && (
          <span className="mt-1 flex items-center gap-1 text-[11px] text-ink2">
            <User size={12} className="shrink-0 text-moss" />
            Coach : {coach.first_name} {coach.last_name}
          </span>
        )}
        {mode === 'expert' && project && (
          <span className="mt-1 flex items-center gap-1 text-[11px] text-ink2">
            <FolderKanban size={12} className="shrink-0 text-moss" />
            {project.name}
          </span>
        )}
        <span className="mt-2 block">
          <SessionStatusBadge status={session.status} />
        </span>
      </span>
    </Link>
  )
}