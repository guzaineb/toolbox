'use client'

import { useMemo, useState } from 'react'
import { CalendarClock, CalendarDays, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { Button, Card, ErrorAlert, Select } from '@/components/shared/ui'
import { apiError, cn } from '@/lib/utils'
import { SessionCalendarItem } from './SessionCalendarItem'
import { SessionCalendarEvent } from './SessionCalendarEvent'
import { NextSessionPanel } from './NextSessionPanel'
import { SESSION_STATUS_LEGEND } from './session-status-ui'
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

export type CalendarView = 'month' | 'week' | 'agenda'

export const CALENDAR_VIEW_LABELS: Record<CalendarView, string> = {
  month: 'Mois',
  week: 'Semaine',
  agenda: 'Agenda',
}

/** Semaine française : commence le lundi. */
export const MONTH_DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const DAY_MS = 86_400_000

const asDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

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

/** Lundi de la semaine contenant `date`. */
export function startOfWeek(date: Date): Date {
  const d = asDay(date)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d
}

/** Grille de 42 jours (6 semaines, du lundi au dimanche) autour du mois de `anchor`. */
export function buildMonthGrid(anchor: Date): Date[] {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
  const start = asDay(first)
  start.setDate(first.getDate() - ((first.getDay() + 6) % 7))
  return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i))
}

/** Les 7 jours (lundi → dimanche) de la semaine contenant `anchor`. */
export function buildWeekDays(anchor: Date): Date[] {
  const start = startOfWeek(anchor)
  return Array.from({ length: 7 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i))
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

const byTimeAsc = (a: CoachingSession, b: CoachingSession) =>
  new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()

function emptyCard(label: string) {
  return (
    <Card className="text-center py-12">
      <CalendarClock size={24} className="mx-auto text-ink3 mb-2" />
      <p className="text-[12px] text-ink3">{label}</p>
    </Card>
  )
}

/**
 * Calendrier des sessions de coaching (Mois / Semaine / Agenda chronologique).
 * - mode="owner" : projet courant, le coach est affiché sur chaque événement.
 * - mode="expert" : toutes les sessions coachées par l'expert connecté, le projet est affiché.
 * Uniquement des améliorations d'interface : les données, le filtrage serveur et
 * la navigation vers la page de détail existante sont conservés à l'identique.
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
  const [view, setView] = useState<CalendarView>('agenda')
  const [statusFilter, setStatusFilter] = useState<CoachingSessionStatus | 'ALL'>('ALL')
  const [period, setPeriod] = useState<AgendaPeriod>('2w')
  const [anchor, setAnchor] = useState<Date>(() => asDay(today))
  const [focusDay, setFocusDay] = useState<Date | null>(null)

  const todayDay = useMemo(() => asDay(today), [today])
  const todayTime = todayDay.getTime()

  const filtered = useMemo(() => {
    if (statusFilter === 'ALL') return sessions
    return sessions.filter((s) => s.status === statusFilter)
  }, [sessions, statusFilter])

  // Vue Agenda : fenêtre glissante (2 semaines / 1 mois / toutes) + À venir / Passées.
  const interval = useMemo(() => {
    if (period === 'all') return null
    const days = AGENDA_PERIOD_DAYS[period]
    const start = asDay(anchor)
    return { start, end: new Date(start.getTime() + days * DAY_MS) }
  }, [period, anchor])

  const scoped = useMemo(() => {
    return filtered.filter((s) => {
      if (!interval) return true
      const t = new Date(s.scheduled_at).getTime()
      return t >= interval.start.getTime() && t < interval.end.getTime()
    })
  }, [filtered, interval])

  const upcoming = useMemo(
    () =>
      scoped
        .filter((s) => new Date(s.scheduled_at).getTime() >= todayTime)
        .sort(byTimeAsc),
    [scoped, todayTime],
  )

  const past = useMemo(
    () =>
      scoped
        .filter((s) => new Date(s.scheduled_at).getTime() < todayTime)
        .sort((a, b) => byTimeAsc(b, a)),
    [scoped, todayTime],
  )

  // Vues Mois / Semaine : grille des sessions filtrées par statut, groupées par jour.
  const monthDays = buildMonthGrid(anchor)
  const weekDays = buildWeekDays(anchor)

  const gridByDay = useMemo(() => {
    const map = new Map<string, CoachingSession[]>()
    for (const s of [...filtered].sort(byTimeAsc)) {
      const key = dayKey(new Date(s.scheduled_at))
      map.set(key, [...(map.get(key) ?? []), s])
    }
    return map
  }, [filtered])

  // Fallback mobile des vues Mois / Semaine : liste chronologique du cadre visible.
  const windowSessions = useMemo(() => {
    const days = view === 'month' ? monthDays : view === 'week' ? weekDays : []
    if (days.length === 0) return []
    const start = days[0].getTime()
    const end = days[days.length - 1].getTime() + DAY_MS
    return filtered
      .filter((s) => {
        const t = new Date(s.scheduled_at).getTime()
        return t >= start && t < end
      })
      .sort(byTimeAsc)
  }, [filtered, view, monthDays, weekDays])

  // Focus sur un jour précis (clic « +X autres » d'une cellule).
  const focusedSessions = useMemo(() => {
    if (!focusDay) return []
    const key = dayKey(focusDay)
    return filtered.filter((s) => dayKey(new Date(s.scheduled_at)) === key).sort(byTimeAsc)
  }, [focusDay, filtered])

  const anchorLabel = useMemo(() => {
    if (view === 'month') {
      const label = anchor.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
      return label.charAt(0).toUpperCase() + label.slice(1)
    }
    if (view === 'week') {
      const start = startOfWeek(anchor)
      const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6)
      const fmt = (d: Date) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
      return `Semaine du ${fmt(start)} au ${fmt(end)}`
    }
    return null
  }, [view, anchor])

  const shift = (delta: 1 | -1) => {
    if (view === 'agenda') {
      if (period === 'all') return
      const days = AGENDA_PERIOD_DAYS[period]
      setAnchor((current) => {
        const shifted = asDay(new Date(current.getTime() + delta * days * DAY_MS))
        return shifted
      })
      return
    }
    if (view === 'month') {
      setAnchor((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1))
      return
    }
    const sign = delta === 1 ? 1 : -1
    setAnchor((current) => asDay(new Date(current.getTime() + sign * 7 * DAY_MS)))
  }

  const resetAnchor = () => {
    setAnchor(asDay(today))
    setPeriod('2w')
    setFocusDay(null)
  }

  const goToDay = (day: Date) => {
    setFocusDay(asDay(day))
    setView('agenda')
  }

  if (isLoading) {
    return (
      <div aria-busy="true" className="space-y-3">
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="h-[72px] animate-pulse rounded-[10px] bg-ink/[.06]" />
          ))}
        </div>
        <p className="animate-pulse text-center text-[11px] font-semibold text-ink3">
          Chargement des sessions de coaching…
        </p>
      </div>
    )
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

  const renderCellEvents = (
    day: Date,
    max: number,
  ) => {
    const key = dayKey(day)
    const daySessions = gridByDay.get(key) ?? []
    return (
      <div className="space-y-1">
        {daySessions.slice(0, max).map((s) => (
          <SessionCalendarEvent key={s.id} session={s} mode={mode} href={getSessionHref(s)} />
        ))}
        {daySessions.length > max && (
          <button
            onClick={() => goToDay(day)}
            aria-label={`Afficher les ${daySessions.length} sessions du ${day.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`}
            className="self-start rounded-md px-1.5 py-0.5 text-[10px] font-bold text-moss transition-colors hover:bg-moss-light"
          >
            +{daySessions.length - max} autres
          </button>
        )}
      </div>
    )
  }

  const monthCell = (day: Date, index: number) => {
    const key = dayKey(day)
    const isToday = key === dayKey(todayDay)
    const inWindow = day.getMonth() === anchor.getMonth()
    const isLastCol = index % 7 === 6
    const isLastRow = index >= 35
    return (
      <div
        key={key}
        className={cn(
          'flex min-h-[96px] flex-col gap-1 border-r border-b border-border p-1.5',
          isLastCol && 'border-r-0',
          isLastRow && 'border-b-0',
          !inWindow && 'bg-bg/60',
          isToday && 'bg-moss/[.05]',
        )}
      >
        <div className="flex items-center justify-between">
          <span
            className={cn(
              'inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold',
              isToday ? 'bg-moss text-white' : 'text-ink2',
            )}
          >
            {day.getDate()}
          </span>
          {isToday && (
            <span className="text-[9px] font-bold uppercase tracking-[0.06em] text-moss">
              Aujourd&apos;hui
            </span>
          )}
        </div>
        {renderCellEvents(day, 3)}
      </div>
    )
  }

  const weekCell = (day: Date, index: number) => {
    const key = dayKey(day)
    const isToday = key === dayKey(todayDay)
    return (
      <div
        key={key}
        className={cn(
          'min-h-[200px] border-r border-border p-2',
          index === 6 && 'border-r-0',
          isToday && 'bg-moss/[.05]',
        )}
      >
        <div className="text-center">
          <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-ink3">
            {MONTH_DAY_LABELS[index]}
          </div>
          <div
            className={cn(
              'mx-auto mt-1 flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold',
              isToday ? 'bg-moss text-white' : 'text-ink',
            )}
          >
            {day.getDate()}
          </div>
          {isToday && (
            <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.06em] text-moss">
              Aujourd&apos;hui
            </div>
          )}
        </div>
        <div className="mt-2">{renderCellEvents(day, 5)}</div>
      </div>
    )
  }

  const windowGroups = groupByDay(windowSessions)

  return (
    <div className="space-y-4">
      {/* Barre de contrôle : vue + filtre + navigation + période */}
      <Card className="p-[14px_16px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div
              role="group"
              aria-label="Vue du calendrier"
              className="flex gap-[2px] rounded-[8px] border border-border bg-moss/[.06] p-[3px]"
            >
              {(Object.keys(CALENDAR_VIEW_LABELS) as CalendarView[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  aria-pressed={view === v}
                  className={cn(
                    'cursor-pointer rounded-[6px] border-none px-[10px] py-[5px] font-dm text-[11px] font-semibold transition-all duration-150',
                    view === v
                      ? 'bg-surface text-moss shadow-[0_1px_4px_rgba(15,31,22,0.08)]'
                      : 'text-ink3 hover:text-ink2',
                  )}
                >
                  {CALENDAR_VIEW_LABELS[v]}
                </button>
              ))}
            </div>
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
            {view === 'agenda' && !focusDay && (
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
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {interval && view === 'agenda' && !focusDay && (
              <span className="hidden md:inline text-[11px] text-ink3">
                {formatPeriodRange(interval.start, interval.end)}
              </span>
            )}
            {anchorLabel && (
              <span className="hidden md:inline text-[11px] font-semibold text-ink2">{anchorLabel}</span>
            )}
            <Button variant="outline" size="sm" onClick={() => shift(-1)} aria-label="Période précédente">
              <ChevronLeft size={13} /> Précédent
            </Button>
            <Button variant="outline" size="sm" onClick={() => shift(1)} aria-label="Période suivante">
              Suivant <ChevronRight size={13} />
            </Button>
            <Button variant="outline" size="sm" onClick={resetAnchor} aria-label="Revenir à aujourd&apos;hui">
              <RotateCcw size={13} /> Aujourd&apos;hui
            </Button>
          </div>
        </div>

        {/* Légende des statuts */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3">
          {SESSION_STATUS_LEGEND.map(({ status, label, dot }) => (
            <span key={status} className="inline-flex items-center gap-1.5 text-[10px] font-medium text-ink2">
              <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden="true" />
              {label}
            </span>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-4">
          {view === 'month' && (
            <>
              <div className="hidden rounded-[14px] border border-border bg-surface shadow-sm md:block">
                <div className="grid grid-cols-7 border-b border-border">
                  {MONTH_DAY_LABELS.map((label) => (
                    <div
                      key={label}
                      className="py-2 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-ink3"
                    >
                      {label}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7">{monthDays.map(monthCell)}</div>
              </div>
              {windowGroups.length > 0 && (
                <div className="space-y-[10px] md:hidden">
                  <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-moss">
                    {anchorLabel}
                  </div>
                  {windowGroups.map(renderDay)}
                </div>
              )}
            </>
          )}

          {view === 'week' && (
            <>
              <div className="hidden rounded-[14px] border border-border bg-surface shadow-sm md:block">
                <div className="grid grid-cols-7">{weekDays.map(weekCell)}</div>
              </div>
              {windowGroups.length > 0 && (
                <div className="space-y-[10px] md:hidden">
                  <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-moss">
                    {anchorLabel}
                  </div>
                  {windowGroups.map(renderDay)}
                </div>
              )}
            </>
          )}

          {view === 'agenda' && (
            <>
              {focusDay && (
                <div className="flex items-center gap-2 rounded-[10px] border border-moss/20 bg-moss/[.05] px-3 py-2">
                  <CalendarDays size={14} className="shrink-0 text-moss" />
                  <span className="text-[12px] font-semibold text-ink">
                    {agendaDayLabel(focusDay, today)}
                  </span>
                  <button
                    onClick={() => setFocusDay(null)}
                    className="ml-auto cursor-pointer text-[11px] font-semibold text-moss hover:underline"
                  >
                    Tout afficher
                  </button>
                </div>
              )}
              {focusDay ? (
                focusedSessions.length === 0 ? (
                  emptyCard("Aucune session pour cette journée")
                ) : (
                  <div className="space-y-5">{groupByDay(focusedSessions).map(renderDay)}</div>
                )
              ) : scoped.length === 0 ? (
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
                      {groupByDay(upcoming).map(renderDay)}
                    </div>
                  )}
                  {past.length > 0 && (
                    <div className="space-y-[10px]">
                      <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-ink3">
                        Passées ({past.length})
                      </div>
                      {groupByDay(past).map(renderDay)}
                    </div>
                  )}
                  <p className="text-[11px] text-ink3">{scoped.length} session(s) affichée(s)</p>
                </div>
              )}
            </>
          )}
        </div>

        <aside className="min-w-0">
          <NextSessionPanel sessions={filtered} mode={mode} getSessionHref={getSessionHref} today={todayDay} />
        </aside>
      </div>
    </div>
  )
}