'use client'

import Link from 'next/link'
import { CalendarClock, Clock, FolderKanban, User } from 'lucide-react'
import { Card, CardHeader } from '@/components/shared/ui'
import { SessionStatusBadge } from './SessionStatusBadge'
import { formatSessionTime } from './SessionCalendarItem'
import type { CoachingSession } from '@/types/coaching'

/** Statuts correspondant à un rendez-vous réellement à venir. */
const UPCOMING_STATUSES = new Set(['SCHEDULED', 'IN_PROGRESS', 'RESCHEDULED'])

export function pickNextSession(sessions: CoachingSession[], today: Date): CoachingSession | null {
  const todayTime = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  return (
    sessions
      .filter((s) => UPCOMING_STATUSES.has(s.status) && new Date(s.scheduled_at).getTime() >= todayTime)
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())[0] ?? null
  )
}

/**
 * Panneau « Prochaine session » : la prochaine session à venir parmi les
 * sessions affichées (respecte le filtre de statut choisi par l'utilisateur).
 * Responsable du contenu par mode : coach (owner) / projet (expert).
 */
export function NextSessionPanel({
  sessions,
  mode,
  getSessionHref,
  today,
}: {
  sessions: CoachingSession[]
  mode: 'owner' | 'expert'
  getSessionHref: (session: CoachingSession) => string
  today: Date
}) {
  const next = pickNextSession(sessions, today)
  const coach = next?.assignment?.expertUser?.profile
  const project = next?.assignment?.project
  const date = next ? new Date(next.scheduled_at) : null

  return (
    <Card>
      <CardHeader icon={<CalendarClock size={14} />} title="Prochaine session" />
      <div className="p-4">
        {!next || !date ? (
          <p className="text-[12px] text-ink3 leading-relaxed">Vous n&apos;avez aucune session à venir.</p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-[12px] border border-border bg-moss/[.04] p-3">
              <div className="flex h-[46px] w-[46px] shrink-0 flex-col items-center justify-center rounded-[10px] bg-moss-light border border-border">
                <span className="font-syne text-[17px] font-extrabold leading-none text-moss">
                  {date.getDate()}
                </span>
                <span className="text-[9px] font-semibold capitalize text-ink3">
                  {date.toLocaleDateString('fr-FR', { month: 'short' })}
                </span>
              </div>
              <div className="min-w-0">
                <span className="block truncate text-[13px] font-bold text-ink">
                  {next.title || 'Session de coaching'}
                </span>
                <span className="block text-[10px] capitalize text-ink3">
                  {date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
              </div>
            </div>

            {next.objective && (
              <p className="line-clamp-2 text-[11px] text-ink2 leading-snug">{next.objective}</p>
            )}

            <div className="space-y-1 text-[11px] text-ink2">
              <span className="flex items-center gap-1.5">
                <Clock size={12} className="shrink-0 text-moss" />
                {formatSessionTime(next.scheduled_at, next.duration_minutes)}
              </span>
              {mode === 'owner' && coach && (
                <span className="flex items-center gap-1.5">
                  <User size={12} className="shrink-0 text-moss" />
                  Coach : {coach.first_name} {coach.last_name}
                </span>
              )}
              {mode === 'expert' && project && (
                <span className="flex items-center gap-1.5">
                  <FolderKanban size={12} className="shrink-0 text-moss" />
                  {project.name}
                </span>
              )}
            </div>

            <div>
              <SessionStatusBadge status={next.status} />
            </div>

            <Link
              href={getSessionHref(next)}
              className="inline-flex w-full items-center justify-center gap-[5px] rounded-lg border border-moss/22 font-dm text-[11px] font-semibold text-moss transition-all duration-150 hover:bg-moss-light"
            >
              <span className="px-[11px] py-[6px]">Voir la session</span>
            </Link>
          </div>
        )}
      </div>
    </Card>
  )
}