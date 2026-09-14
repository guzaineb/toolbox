'use client'

import { useMemo, useState } from 'react'
import { CalendarClock, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { Button, Card, ErrorAlert, LoadingState, Select } from '@/components/shared/ui'
import { apiError } from '@/lib/utils'
import { SessionCalendarItem } from './SessionCalendarItem'
import { COACHING_SESSION_STATUS_LABELS } from '@/types/coaching'
import type { CoachingSession, CoachingSessionStatus } from '@/types/coaching'

export type AgendaPeriod = '2w' | '1m' | 'all'

export const AGENDA_PERIOD_LABELS: Record<AgendaPeriod, string> = {
  '2w': '2 semaines',
  '1m': '1 mois',
  all: 'Toutes les dates',
}

export const AGENDA_PERIOD_DAYS: Record<Exclude<AgendaPeriod, 'all'>, number> = {
  '2w': 14,
  '1m': 30,
}

const DAY_MS = 86_400_000

export function startOfToday(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

export function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

export function agendaDayLabel(date: Date, today: Date): string {
  const target = dayKey(date)
  if (target === dayKey(today)) return "Aujourd'hui"
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
  if (target === dayKey(tomorrow)) return 'Demain'
  const label = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function formatPeriodRange(anchor: Date, end: Date) {
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
  return `Du ${anchor.toLocaleDateString('fr-FR', options)} au ${end.toLocaleDateString('fr-FR', options)}`
}

/** Groupe les sessions par jour unique, en conservant l'ordre de tri fourni. */
export function groupByDay(
  sessions: CoachingSession[],
): Array<{ key: string; date: Date; sessions: CoachingSession[] }> {
  const groups = new Map<string, { key: string; date: Date; sessions: CoachingSession[] }>()
  const order: string[] = []
  for (const s of sessions) {
    const d = new Date(s.scheduled_at)
    const key = dayKey(d)
    const existing = groups.get(key)
    if (!existing) {
      groups.set(key, { key, date: d, sessions: [s] })
      order.push(key)
    } else {
      existing.sessions.push(s)
    }
  }
  return order.map((key) => groups.get(key)!)
}

function emptyCard(label: string) {
  return (
    <Card className="text-center py-12">
      <CalendarClock size={24} className="mx-auto text-ink3 mb-2" />
      <p className="text-[12px] text-ink3">{label}</p>
    </Card>
  )
}

/**
 * Agenda partagé des sessions de coaching.
 * - mode="owner" : projet courant, le coach est affiché sur chaque session.
 * - mode="expert" : toutes les sessions coachées par l'expert connecté, le projet est affiché.
 * États gérés : chargement, erreur (+ réessayer), aucune session, fenêtre vide.
 */
export function CoachingSessionsAgenda({
  sessions,
  mode,
  isLoading,
  error,
  onRetry,
  getSessionHref,
  today = startOfToday(),
}: {
  sessions: CoachingSession[]
  mode: 'owner' | 'expert'
  isLoading?: boolean
  error?: unknown
  onRetry?: () => void
  getSessionHref: (session: CoachingSession) => string
  /** Injectable pour des tests déterministes ; par défaut « aujourd'hui ». */
  today?: Date
}) {
  const [statusFilter, setStatusFilter] = useState<CoachingSessionStatus | 'ALL'>('ALL')
  const [period, setPeriod] = useState<AgendaPeriod>('2w')
  const [anchor, setAnchor] = useState<Date>(() =>
    new Date(today.getFullYear(), today.getMonth(), today.getDate()),
  )

  const filtered = useMemo(() => {
    if (statusFilter === 'ALL') return sessions
    return sessions.filter((s) => s.status === statusFilter)
  }, [sessions, statusFilter])

  const interval = useMemo(() => {
    if (period === 'all') return null
    const days = AGENDA_PERIOD_DAYS[period]
    return { start: anchor, end: new Date(anchor.getTime() + days * DAY_MS) }
  }, [period, anchor])

  const scoped = useMemo(() => {
    return filtered.filter((s) => {
      if (!interval) return true
      const t = new Date(s.scheduled_at).getTime()
      return t >= interval.start.getTime() && t < interval.end.getTime()
    })
  }, [filtered, interval])

  const todayTime = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()

  const upcoming = useMemo(
    () =>
      scoped
        .filter((s) => new Date(s.scheduled_at).getTime() >= todayTime)
        .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()),
    [scoped, todayTime],
  )

  const past = useMemo(
    () =>
      scoped
        .filter((s) => new Date(s.scheduled_at).getTime() < todayTime)
        .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()),
    [scoped, todayTime],
  )

  const shiftPeriod = (delta: 1 | -1) => {
    if (period === 'all') return
    const days = AGENDA_PERIOD_DAYS[period]
    setAnchor((current) => {
      const shifted = new Date(current.getTime() + delta * days * DAY_MS)
      return new Date(shifted.getFullYear(), shifted.getMonth(), shifted.getDate())
    })
  }

  const resetAnchor = () => {
    setAnchor(new Date(today.getFullYear(), today.getMonth(), today.getDate()))
    setPeriod('2w')
  }

  if (isLoading) {
    return <LoadingState label="Chargement des sessions de coaching…" />
  }

  if (error) {
    return (
      <Card className="text-center py-12">
        <ErrorAlert message={apiError(error, 'Erreur de chargement des sessions')} className="mb-4" />
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            <RotateCcw size={14} /> Réessayer
          </Button>
        )}
      </Card>
    )
  }

  if (sessions.length === 0) {
    return emptyCard('Aucune session de coaching')
  }

  const renderDay = (day: { key: string; date: Date; sessions: CoachingSession[] }) => (
    <div key={day.key} className="space-y-[8px]">
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-moss shrink-0" />
        <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-ink">
          {agendaDayLabel(day.date, today)}
        </span>
        <span className="text-[10px] text-ink3">
          {day.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>
      {day.sessions.map((s) => (
        <SessionCalendarItem key={s.id} session={s} mode={mode} href={getSessionHref(s)} />
      ))}
    </div>
  )

  const upcomingGroups = groupByDay(upcoming)
  const pastGroups = groupByDay(past)

  return (
    <div className="space-y-3">
      <Card className="p-[14px_16px]">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Select
              aria-label="Filtrer par statut"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CoachingSessionStatus | 'ALL')}
              className="w-[170px]"
            >
              <option value="ALL">Tous les statuts</option>
              {(Object.keys(COACHING_SESSION_STATUS_LABELS) as CoachingSessionStatus[]).map((status) => (
                <option key={status} value={status}>
                  {COACHING_SESSION_STATUS_LABELS[status]}
                </option>
              ))}
            </Select>
            <Select
              aria-label="Période"
              value={period}
              onChange={(e) => setPeriod(e.target.value as AgendaPeriod)}
              className="w-[160px]"
            >
              {(Object.keys(AGENDA_PERIOD_LABELS) as AgendaPeriod[]).map((p) => (
                <option key={p} value={p}>
                  {AGENDA_PERIOD_LABELS[p]}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-center gap-2">
            {interval && (
              <span className="text-[11px] text-ink3 hidden md:inline">
                {formatPeriodRange(interval.start, interval.end)}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={() => shiftPeriod(-1)} aria-label="Période précédente">
              <ChevronLeft size={13} /> Précédent
            </Button>
            <Button variant="outline" size="sm" onClick={() => shiftPeriod(1)} aria-label="Période suivante">
              Suivant <ChevronRight size={13} />
            </Button>
            <Button variant="outline" size="sm" onClick={resetAnchor} aria-label="Revenir à aujourd&apos;hui">
              <RotateCcw size={13} /> Aujourd&apos;hui
            </Button>
          </div>
        </div>
      </Card>

      {scoped.length === 0 ? (
        emptyCard(
          interval
            ? `Aucune session entre (${formatPeriodRange(interval.start, interval.end)})`
            : 'Aucune session pour ce filtre',
        )
      ) : (
        <div className="space-y-5">
          {upcoming.length > 0 && (
            <div className="space-y-[10px]">
              <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-moss">
                À venir ({upcoming.length})
              </div>
              {upcomingGroups.map(renderDay)}
            </div>
          )}
          {past.length > 0 && (
            <div className="space-y-[10px]">
              <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-ink3">
                Passées ({past.length})
              </div>
              {pastGroups.map(renderDay)}
            </div>
          )}
          <p className="text-[11px] text-ink3">{scoped.length} session(s) affichée(s)</p>
        </div>
      )}
    </div>
  )
}