'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  CalendarClock, CalendarDays, ChevronRight, ListTodo, RotateCcw, ShieldCheck,
} from 'lucide-react'
import { Badge, Button, Card, CardHeader, ErrorAlert } from '@/components/shared/ui'
import {
  ACTION_STATUS_COLORS, ACTION_STATUS_LABELS, EVIDENCE_TYPE_LABELS, PRIORITY_LABELS,
} from '@/types/coaching'
import type {
  ActionEvidence, CoachingAction, CoachingActionPriority, CoachingActionStatus,
  CoachingSession, CoachingSessionStatus,
} from '@/types/coaching'
import { apiError, cn, formatDate } from '@/lib/utils'
import { SessionCalendarItem } from './SessionCalendarItem'
import type { PendingEvidenceEntry } from '@/hooks/useCoaching'

/* =========================================================
   Aides pures (testables) — catégorisation des sessions et actions
   selon « aujourd'hui » injectable. Les statuts actifs excluent
   COMPLETED / CANCELLED pour ne pas compter l'historique.
========================================================= */

const ACTIVE_SESSION_STATUSES: CoachingSessionStatus[] = ['SCHEDULED', 'IN_PROGRESS', 'RESCHEDULED']
const LATE_ACTION_STATUSES: CoachingActionStatus[] = ['PENDING', 'IN_PROGRESS', 'SUBMITTED', 'OVERDUE']
const PRIORITY_RANK: Record<CoachingActionPriority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 }

function dayStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function isTodaySession(session: CoachingSession, today: Date): boolean {
  const t = new Date(session.scheduled_at).getTime()
  const start = dayStart(today).getTime()
  return t >= start && t < start + 86_400_000
}

export function isUpcomingSession(session: CoachingSession, today: Date): boolean {
  return (
    ACTIVE_SESSION_STATUSES.includes(session.status) &&
    new Date(session.scheduled_at).getTime() >= dayStart(today).getTime()
  )
}

export function isLateSession(session: CoachingSession, today: Date): boolean {
  return (
    ACTIVE_SESSION_STATUSES.includes(session.status) &&
    new Date(session.scheduled_at).getTime() < dayStart(today).getTime()
  )
}

export function isActionLate(action: CoachingAction, today: Date): boolean {
  return (
    !!action.deadline &&
    new Date(action.deadline).getTime() < dayStart(today).getTime() &&
    LATE_ACTION_STATUSES.includes(action.status)
  )
}

/* =========================================================
   Types de filtre + libellés
========================================================= */

export type SessionDashboardFilter = 'upcoming' | 'today' | 'late' | 'all'
export type ActionDashboardFilter = 'todo' | 'inProgress' | 'submitted' | 'late' | 'all'

export const SESSION_DASHBOARD_FILTER_LABELS: Record<SessionDashboardFilter, string> = {
  upcoming: 'À venir',
  today: 'Du jour',
  late: 'En retard',
  all: 'Toutes',
}

export const ACTION_DASHBOARD_FILTER_LABELS: Record<ActionDashboardFilter, string> = {
  todo: 'À traiter',
  inProgress: 'En cours',
  submitted: 'À valider',
  late: 'En retard',
  all: 'Toutes',
}

export const SESSION_DASHBOARD_FILTER_EMPTY: Record<SessionDashboardFilter, string> = {
  upcoming: 'Aucune session à venir.',
  today: 'Aucune session aujourd’hui.',
  late: 'Aucune session en retard.',
  all: 'Aucune session de coaching.',
}

export const ACTION_DASHBOARD_FILTER_EMPTY: Record<ActionDashboardFilter, string> = {
  todo: 'Aucune action à traiter.',
  inProgress: 'Aucune action en cours.',
  submitted: 'Aucune action à valider.',
  late: 'Aucune action en retard.',
  all: 'Aucune action définie.',
}

/* =========================================================
   Lien d'ouverture : routes existantes, jamais de nouveau
   second système de navigation. Le serveur restreint l'accès.
========================================================= */

const sessionHref = (session: CoachingSession) =>
  session.assignment?.project?.id
    ? `/dashboard/expert/coaching/${session.assignment.project.id}/sessions/${session.id}`
    : '#'

const projectHref = (projectId: string) => `/dashboard/expert/coaching/${projectId}`
const actionsHref = (projectId: string) => `${projectHref(projectId)}?tab=actions`

/* =========================================================
   Pastilles de filtre (compteurs réels, style segmenté du calendrier)
========================================================= */

function FilterChips<T extends string>({
  ariaLabel, options, value, onChange,
}: {
  ariaLabel: string
  options: Array<{ value: T; label: string; count?: number }>
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="flex flex-wrap gap-[2px] rounded-[8px] border border-border bg-moss/[.06] p-[3px]"
    >
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={cn(
            'cursor-pointer rounded-[6px] border-none px-[10px] py-[5px] font-dm text-[11px] font-semibold transition-all duration-150',
            value === option.value
              ? 'bg-surface text-moss shadow-[0_1px_4px_rgba(15,31,22,0.08)]'
              : 'text-ink3 hover:text-ink2',
          )}
        >
          {option.label}{' '}
          {typeof option.count === 'number' && (
            <span className={cn('ml-1.5 text-[10px]', value === option.value ? 'text-moss' : 'text-ink3')}>
              {option.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

function StatTile({
  icon, label, count, accent,
}: {
  icon: React.ReactNode
  label: string
  count: number
  accent: string
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <span className={accent}>{icon}</span>
        <span className={cn('font-syne text-[24px] font-extrabold leading-none', accent)}>{count}</span>
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.06em] font-semibold text-ink3">{label}</div>
    </Card>
  )
}

/** Ligne d'action : à traiter / en cours / à valider / en retard, avec ouverture vers ?tab=actions. */
function CoachActionItem({ action, today }: { action: CoachingAction; today: Date }) {
  const late = isActionLate(action, today)
  return (
    <Link
      href={actionsHref(action.project_id)}
      aria-label={`${action.title} — ${ACTION_STATUS_LABELS[action.status]}`}
      className={cn(
        'group flex items-start gap-3 rounded-[14px] border bg-surface p-3 outline-none transition-all duration-150 hover:border-moss/40 hover:shadow-[0_4px_16px_rgba(15,31,22,0.06)] focus-visible:ring-2 focus-visible:ring-moss/40 sm:p-4',
        late ? 'border-red-300 bg-red-50/60' : 'border-border',
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[13px] font-semibold text-ink leading-snug">{action.title}</span>
          <Badge variant={action.priority === 'HIGH' ? 'red' : action.priority === 'MEDIUM' ? 'blue' : 'gray'}>
            {PRIORITY_LABELS[action.priority]}
          </Badge>
          <Badge variant={ACTION_STATUS_COLORS[action.status]}>{ACTION_STATUS_LABELS[action.status]}</Badge>
          {late && <Badge variant="red">En retard</Badge>}
        </div>
        {action.description && <p className="mt-0.5 line-clamp-1 text-[12px] text-ink2">{action.description}</p>}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink3 mt-1">
          {action.deadline && (
            <span>
              Échéance : <span className="font-semibold text-ink2">{formatDate(action.deadline)}</span>
            </span>
          )}
          {action.project?.name && (
            <span>
              Projet : <span className="font-semibold text-ink2">{action.project.name}</span>
            </span>
          )}
        </div>
      </div>
      <ChevronRight size={16} className="self-center shrink-0 text-ink3 group-hover:text-moss transition-colors" />
    </Link>
  )
}

/* =========================================================
   TABLEAU DE BORD « MON COACHING » (expert / coach)
========================================================= */

export function ExpertCoachingDashboard({
  sessions,
  actions,
  pendingEvidences,
  evidenceLoading = false,
  evidenceError = false,
  isLoading = false,
  error,
  onRetry,
  today = new Date(),
}: {
  sessions: CoachingSession[]
  actions: CoachingAction[]
  pendingEvidences: PendingEvidenceEntry[]
  /** Les preuves sont en train de charger (actions soumises présentes). */
  evidenceLoading?: boolean
  /** Une requête de preuves a échoué (les autres sections restent affichées). */
  evidenceError?: boolean
  isLoading?: boolean
  error?: unknown
  onRetry?: () => void
  /** Injectable pour des tests déterministes ; par défaut « aujourd'hui ». */
  today?: Date
}) {
  const [sessionFilter, setSessionFilter] = useState<SessionDashboardFilter>('upcoming')
  const [actionFilter, setActionFilter] = useState<ActionDashboardFilter>('todo')
  const todayDay = useMemo(() => dayStart(today), [today])

  const upcoming = useMemo(
    () => sessions.filter((s) => isUpcomingSession(s, todayDay)).sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()),
    [sessions, todayDay],
  )
  const todaySessions = useMemo(
    () => sessions.filter((s) => isTodaySession(s, todayDay)),
    [sessions, todayDay],
  )
  const lateSessions = useMemo(
    () => sessions.filter((s) => isLateSession(s, todayDay)).sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()),
    [sessions, todayDay],
  )

  const shownSessions = useMemo(() => {
    const list =
      sessionFilter === 'upcoming' ? upcoming
        : sessionFilter === 'today' ? todaySessions
          : sessionFilter === 'late' ? lateSessions
            : sessions
    return [...list].sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
  }, [sessionFilter, sessions, upcoming, todaySessions, lateSessions])

  const todoActions = useMemo(() => actions.filter((a) => a.status === 'PENDING'), [actions])
  const inProgressActions = useMemo(() => actions.filter((a) => a.status === 'IN_PROGRESS'), [actions])
  const submittedActions = useMemo(() => actions.filter((a) => a.status === 'SUBMITTED'), [actions])
  const lateActions = useMemo(() => actions.filter((a) => isActionLate(a, todayDay)), [actions, todayDay])

  const shownActions = useMemo(() => {
    const list =
      actionFilter === 'todo' ? todoActions
        : actionFilter === 'inProgress' ? inProgressActions
          : actionFilter === 'submitted' ? submittedActions
            : actionFilter === 'late' ? lateActions
              : actions
    return [...list].sort((a, b) => {
      const rank = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
      if (rank !== 0) return rank
      const dA = a.deadline ? new Date(a.deadline).getTime() : Infinity
      const dB = b.deadline ? new Date(b.deadline).getTime() : Infinity
      return dA - dB
    })
  }, [actionFilter, actions, todoActions, inProgressActions, submittedActions, lateActions])

  if (isLoading) {
    return (
      <div aria-busy="true" className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 animate-pulse rounded-[14px] bg-ink/[.06]" />)}
        </div>
        <div className="h-48 animate-pulse rounded-[14px] bg-ink/[.06]" />
        <div className="h-48 animate-pulse rounded-[14px] bg-ink/[.06]" />
        <p className="animate-pulse text-center text-[11px] font-semibold text-ink3">
          Chargement de votre tableau de coaching…
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="text-center py-12">
        <ErrorAlert message={apiError(error, 'Erreur de chargement du tableau de bord')} className="mb-4" />
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            <RotateCcw size={14} /> Réessayer
          </Button>
        )}
      </Card>
    )
  }

  if (sessions.length === 0 && actions.length === 0) {
    return (
      <Card className="text-center py-14">
        <div className="w-14 h-14 rounded-full bg-moss-light text-moss flex items-center justify-center mx-auto mb-4">
          <CalendarClock size={24} />
        </div>
        <p className="text-[15px] font-semibold text-ink mb-1">Aucune activité de coaching</p>
        <p className="text-[12px] text-ink3 mb-4">
          Vos sessions planifiées et les actions de vos projets apparaîtront ici.
        </p>
        <Link href="/dashboard/expert/coachings">
          <Button variant="primary" size="sm">
            Voir mes cohortes de coaching
          </Button>
        </Link>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Compteurs réels (jamais de statistiques fabriquées) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile
          icon={<CalendarClock size={14} />}
          label="Sessions à venir"
          count={upcoming.length}
          accent="text-ink"
        />
        <StatTile
          icon={<CalendarDays size={14} />}
          label="Sessions du jour"
          count={todaySessions.length}
          accent="text-blue"
        />
        <StatTile
          icon={<ListTodo size={14} />}
          label="Actions à traiter"
          count={todoActions.length}
          accent="text-amber"
        />
        <StatTile
          icon={<ShieldCheck size={14} />}
          label="Preuves à valider"
          count={pendingEvidences.length}
          accent="text-violet-700"
        />
      </div>

      {/* SESSIONS : prochaines · du jour · en retard · statut · projet · date */}
      <Card className="overflow-hidden">
        <CardHeader icon={<CalendarClock size={13} />} title={`Sessions (${sessions.length})`}>
          <FilterChips
            ariaLabel="Filtrer les sessions"
            value={sessionFilter}
            onChange={setSessionFilter}
            options={(Object.keys(SESSION_DASHBOARD_FILTER_LABELS) as SessionDashboardFilter[]).map((key) => ({
              value: key,
              label: SESSION_DASHBOARD_FILTER_LABELS[key],
              count:
                key === 'upcoming' ? upcoming.length
                  : key === 'today' ? todaySessions.length
                    : key === 'late' ? lateSessions.length
                      : sessions.length,
            }))}
          />
        </CardHeader>
        <div className="p-[18px] space-y-[10px]">
          {sessions.length === 0 ? (
            <p className="text-[12px] text-ink3">Aucune session de coaching pour le moment.</p>
          ) : shownSessions.length === 0 ? (
            <p className="text-[12px] text-ink3">{SESSION_DASHBOARD_FILTER_EMPTY[sessionFilter]}</p>
          ) : (
            shownSessions.map((session) => (
              <SessionCalendarItem key={session.id} session={session} mode="expert" href={sessionHref(session)} />
            ))
          )}
        </div>
      </Card>

      {/* ACTIONS : à traiter · en cours · soumises · en retard · priorité · échéance · projet */}
      <Card className="overflow-hidden">
        <CardHeader icon={<ListTodo size={13} />} title={`Actions (${actions.length})`}>
          <FilterChips
            ariaLabel="Filtrer les actions"
            value={actionFilter}
            onChange={setActionFilter}
            options={(Object.keys(ACTION_DASHBOARD_FILTER_LABELS) as ActionDashboardFilter[]).map((key) => ({
              value: key,
              label: ACTION_DASHBOARD_FILTER_LABELS[key],
              count:
                key === 'todo' ? todoActions.length
                  : key === 'inProgress' ? inProgressActions.length
                    : key === 'submitted' ? submittedActions.length
                      : key === 'late' ? lateActions.length
                        : actions.length,
            }))}
          />
        </CardHeader>
        <div className="p-[18px] space-y-[10px]">
          {actions.length === 0 ? (
            <p className="text-[12px] text-ink3">Aucune action de coaching pour le moment.</p>
          ) : shownActions.length === 0 ? (
            <p className="text-[12px] text-ink3">{ACTION_DASHBOARD_FILTER_EMPTY[actionFilter]}</p>
          ) : (
            shownActions.map((action) => <CoachActionItem key={action.id} action={action} today={todayDay} />)
          )}
        </div>
      </Card>

      {/* EVIDENCE : preuves nécessitant une validation (uniquement les données existantes) */}
      <Card className="overflow-hidden">
        <CardHeader icon={<ShieldCheck size={13} />} title={`Preuves à valider (${pendingEvidences.length})`} />
        <div className="p-[18px]">
          {submittedActions.length === 0 ? (
            <p className="text-[12px] text-ink3">
              Aucune preuve à valider : les preuves soumises par les porteurs apparaissent ici.
            </p>
          ) : evidenceLoading ? (
            <p className="animate-pulse text-[12px] font-semibold text-ink3">Chargement des preuves…</p>
          ) : evidenceError ? (
            <p className="text-[12px] text-red-600">Impossible de charger certaines preuves.</p>
          ) : pendingEvidences.length === 0 ? (
            <p className="text-[12px] text-ink3">Aucune preuve en attente de validation.</p>
          ) : (
            <div className="space-y-[10px]">
              {pendingEvidences.map(({ evidence, action }) => (
                <Link
                  key={evidence.id}
                  href={actionsHref(action.project_id)}
                  className="group block rounded-[12px] border border-border bg-surface p-3 outline-none transition-all duration-150 hover:border-moss/40 hover:shadow-[0_4px_16px_rgba(15,31,22,0.06)] focus-visible:ring-2 focus-visible:ring-moss/40"
                >
                  <div className="flex items-start gap-2 flex-wrap">
                    <Badge variant={EVIDENCE_BADGE[evidence.type]}>{EVIDENCE_TYPE_LABELS[evidence.type]}</Badge>
                    <span className="text-[12px] font-semibold text-ink">{evidence.title || 'Preuve soumise'}</span>
                    <Badge variant="amber">En attente</Badge>
                  </div>
                  {evidence.url && (
                    <p className="mt-1 truncate text-[11px] text-ink3">{evidence.url}</p>
                  )}
                  {evidence.content && (
                    <p className="mt-1 line-clamp-2 text-[11px] text-ink2">{evidence.content}</p>
                  )}
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <span className="truncate text-[11px] text-ink3">
                      {action.title} · {action.project?.name}
                    </span>
                    <span className="shrink-0 text-[11px] font-semibold text-moss flex items-center gap-1">
                      Ouvrir la revue <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

const EVIDENCE_BADGE: Record<ActionEvidence['type'], 'gray' | 'blue' | 'violet' | 'green'> = {
  LINK: 'blue',
  TEXT: 'gray',
  DOCUMENT: 'violet',
  RESULT: 'green',
}