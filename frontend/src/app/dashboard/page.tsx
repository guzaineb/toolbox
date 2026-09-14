'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle,
  ArrowRight,
  Award,
  Bell,
  Bot,
  Briefcase,
  Building2,
  CalendarClock,
  CheckCircle,
  ChevronRight,
  ClipboardCheck,
  Clock,
  FileText,
  FolderKanban,
  Gauge,
  GraduationCap,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@/hooks/useAuth'
import { useRoleDashboard } from '@/hooks/useRoleDashboard'
import {
  Badge,
  Button,
  Card,
  CardHeader,
  ErrorAlert,
  LoadingState,
  Progress,
} from '@/components/shared/ui'
import { cn, formatDate, formatDateTime, getErrorMessage, getRelativeTime } from '@/lib/utils'
import type {
  ActivityItem,
  AlertItem,
  ExpertDashboardResponse,
  IncubatorDashboardResponse,
  OwnerDashboardResponse,
  UpcomingSessionItem,
} from '@/types/dashboard'

// ─────────────────────────────────────────────────────────────
// Shared building blocks
// ─────────────────────────────────────────────────────────────

function DashboardHeader({ firstName, role }: { firstName?: string; role: UserRole | null }) {
  const labels: Partial<Record<UserRole, string>> = {
    PROJECT_OWNER: 'Vue porteur de projet',
    EXPERT: 'Vue expert',
    INCUBATOR_MEMBER: 'Vue incubateur',
    ADMIN: 'Panneau administrateur',
  }
  return (
    <div className="mb-6">
      <h1 className="font-syne text-[24px] font-bold text-ink mb-1">
        {role === 'ADMIN' ? 'Administration' : `Bonjour, ${firstName || 'Utilisateur'} 👋`}
      </h1>
      <p className="text-[13px] text-ink2">{labels[role as UserRole] ?? 'Bienvenue sur ToolBox'}</p>
    </div>
  )
}

function SectionHeading({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn('font-syne text-[15px] font-bold text-ink mb-3', className)}>
      {children}
    </h2>
  )
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="bg-moss/[.05] border border-border rounded-[10px] p-[14px] flex items-center gap-3">
      <div className="w-[34px] h-[34px] rounded-[8px] bg-moss-light text-moss flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="font-syne text-[20px] font-extrabold text-ink leading-none">{value}</div>
        <div className="text-[10px] text-ink3 uppercase tracking-[0.06em] font-semibold mt-[3px] truncate">
          {label}
        </div>
      </div>
    </div>
  )
}

function ProgressInline({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex-1">
        <Progress value={value} />
      </div>
      <span className="text-[11px] font-bold text-moss shrink-0 w-[34px] text-right">{value}%</span>
    </div>
  )
}

function LoadingCard({ label }: { label: string }) {
  return (
    <Card className="p-6">
      <LoadingState label={label} />
    </Card>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card className="p-6">
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <AlertTriangle className="w-7 h-7 text-red" />
        <ErrorAlert message={message} />
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="w-3.5 h-3.5" /> Réessayer
          </Button>
        )}
      </div>
    </Card>
  )
}

function EmptyState({
  icon,
  title,
  message,
  ctaLabel,
  ctaHref,
}: {
  icon: React.ReactNode
  title: string
  message: string
  ctaLabel?: string
  ctaHref?: string
}) {
  return (
    <Card className="p-8 text-center border border-dashed border-border">
      <div className="mx-auto mb-3 text-ink3 flex justify-center">{icon}</div>
      <h2 className="font-syne text-[15px] font-bold text-ink mb-1">{title}</h2>
      <p className="text-[12px] text-ink2 mb-4">{message}</p>
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-moss hover:text-moss-dark transition-colors"
        >
          {ctaLabel} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </Card>
  )
}

const ALERT_BADGE: Record<AlertItem['severity'], 'red' | 'amber' | 'blue'> = {
  high: 'red',
  medium: 'amber',
  low: 'blue',
}

function AlertsCard({ alerts, className }: { alerts: AlertItem[]; className?: string }) {
  if (!alerts || alerts.length === 0) return null
  return (
    <Card className={className}>
      <CardHeader icon={<AlertTriangle className="w-3.5 h-3.5" />} title="Alertes" />
      <ul className="divide-y divide-border">
        {alerts.map((a, i) => (
          <li key={`${a.type}-${i}`}>
            <Link
              href={a.link ?? '/'}
              className="flex items-start gap-2.5 px-4 py-3 hover:bg-moss/[.04] transition-colors"
            >
              <Badge variant={ALERT_BADGE[a.severity]} className="mt-0.5 shrink-0">
                {a.title}
              </Badge>
              <span className="text-[11px] text-ink2 font-dm leading-relaxed">{a.message}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function ActivitiesCard({
  activities,
  className,
}: {
  activities: ActivityItem[]
  className?: string
}) {
  if (!activities || activities.length === 0) return null
  return (
    <Card className={className}>
      <CardHeader icon={<Bell className="w-3.5 h-3.5" />} title="Dernières activités" />
      <ul className="divide-y divide-border">
        {activities.map((a) => {
          const content = (
            <div className="flex items-start gap-2.5 px-4 py-3">
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full mt-1.5 shrink-0',
                  a.isRead ? 'bg-ink3/40' : 'bg-moss',
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold text-ink font-dm truncate">{a.title}</p>
                <p className="text-[11px] text-ink2 font-dm leading-relaxed line-clamp-2">{a.message}</p>
                <p className="text-[10px] text-ink3 font-dm mt-0.5">{getRelativeTime(a.createdAt)}</p>
              </div>
            </div>
          )
          return a.link ? (
            <Link key={a.id} href={a.link} className="block hover:bg-moss/[.04] transition-colors">
              {content}
            </Link>
          ) : (
            <div key={a.id}>{content}</div>
          )
        })}
      </ul>
    </Card>
  )
}

function UpcomingSessionsCard({
  sessions,
  hrefFor,
  className,
}: {
  sessions: UpcomingSessionItem[]
  hrefFor?: (s: UpcomingSessionItem) => string
  className?: string
}) {
  if (!sessions || sessions.length === 0) return null
  return (
    <Card className={className}>
      <CardHeader icon={<CalendarClock className="w-3.5 h-3.5" />} title="Prochaines sessions" />
      <ul className="divide-y divide-border">
        {sessions.slice(0, 5).map((s) => {
          const row = (
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-ink font-dm truncate">
                  {s.title ?? s.projectName}
                </p>
                <p className="text-[11px] text-ink2 font-dm truncate">{s.projectName}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={s.status === 'IN_PROGRESS' ? 'amber' : 'blue'}>
                  {s.status === 'IN_PROGRESS' ? 'En cours' : 'Planifiée'}
                </Badge>
                <span className="text-[10px] text-ink3 font-dm whitespace-nowrap">
                  {formatDateTime(s.scheduledAt)}
                </span>
              </div>
            </div>
          )
          const href = hrefFor?.(s)
          return href ? (
            <Link key={s.id} href={href} className="block hover:bg-moss/[.04] transition-colors">
              {row}
            </Link>
          ) : (
            <div key={s.id}>{row}</div>
          )
        })}
      </ul>
    </Card>
  )
}

function QuickAccess({ role }: { role: UserRole }) {
  const links = [
    { href: '/dashboard/profile', title: 'Mon profil', subtitle: 'Consultez et modifiez vos informations', icon: <Users className="w-4 h-4" /> },
    { href: '/dashboard/notifications', title: 'Notifications', subtitle: 'Consultez vos alertes et messages', icon: <Bell className="w-4 h-4" /> },
    ...(role === 'PROJECT_OWNER'
      ? [{ href: '/dashboard/project-owner/projects', title: 'Mes projets', subtitle: 'Gérez vos projets entrepreneuriaux', icon: <FolderKanban className="w-4 h-4" /> }]
      : []),
    ...(role === 'EXPERT'
      ? [{ href: '/dashboard/expert', title: 'Profil expert', subtitle: 'Gérez vos domaines d\u2019expertise', icon: <Award className="w-4 h-4" /> }]
      : []),
    ...(role === 'INCUBATOR_MEMBER'
      ? [{ href: '/dashboard/incubator', title: 'Mon incubateur', subtitle: 'Accédez à votre espace incubateur', icon: <Building2 className="w-4 h-4" /> }]
      : []),
  ]
  return (
    <div>
      <SectionHeading>Accès rapides</SectionHeading>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {links.map((l) => (
          <Link key={l.href} href={l.href}>
            <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow flex items-center gap-3">
              <div className="w-[30px] h-[30px] rounded-[7px] bg-moss-light text-moss flex items-center justify-center shrink-0">
                {l.icon}
              </div>
              <div>
                <div className="text-[13px] font-semibold text-ink mb-0.5">{l.title}</div>
                <div className="text-[12px] text-ink2">{l.subtitle}</div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// PROJECT_OWNER
// ─────────────────────────────────────────────────────────────

function OwnerDashboard({ role }: { role: UserRole }) {
  const router = useRouter()
  const { data, isLoading, error, refetch } = useRoleDashboard(role)

  if (isLoading) return <LoadingCard label="Chargement de votre tableau de bord..." />
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
  if (!data) return null

  const d = data.data as OwnerDashboardResponse
  const s = d.stats

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <StatCard icon={<FolderKanban className="w-4 h-4" />} value={s.totalProjects} label="Projets" />
        <StatCard icon={<CheckCircle className="w-4 h-4" />} value={s.gbmReviewed} label="GBM validés" />
        <StatCard icon={<TrendingUp className="w-4 h-4" />} value={`${s.averageProgress}%`} label="Progression moyenne" />
        <StatCard icon={<Sparkles className="w-4 h-4" />} value={s.inProgress} label="En cours" />
        <StatCard icon={<Clock className="w-4 h-4" />} value={s.notStarted} label="Non démarrés" />
        <StatCard icon={<FileText className="w-4 h-4" />} value={s.documentsGenerated} label="Documents" />
      </div>

      {d.projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban size={36} />}
          title="Aucun projet pour l\u2019instant"
          message="Créez votre premier projet pour activer le coaching IA et le suivi de progression."
          ctaLabel="Créer un projet"
          ctaHref="/dashboard/project-owner/projects"
        />
      ) : (
        <div>
          <div className="flex items-center justify-between gap-4">
            <SectionHeading>Vos projets</SectionHeading>
            <Link
              href="/dashboard/project-owner/projects"
              className="text-[12px] font-semibold text-moss hover:text-moss-dark transition-colors flex items-center gap-1 shrink-0"
            >
              Tout voir <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {d.projects.map((p) => (
              <Card
                key={p.id}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/dashboard/project-owner/projects/${p.id}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-ink text-[13px] font-dm">{p.name}</h3>
                      {p.isGbmReviewed && <Badge variant="green">GBM validé</Badge>}
                      {p.isBusinessPlanFinalized && <Badge variant="blue">Business plan finalisé</Badge>}
                    </div>
                    {p.description && (
                      <p className="text-[11px] text-ink2 font-dm line-clamp-1 mb-3">{p.description}</p>
                    )}
                    <ProgressInline value={p.progress.overall} />
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                      <span className="text-[10px] text-ink3 font-dm">
                        GBM {p.progress.gbm.done}/{p.progress.gbm.total}
                      </span>
                      <span className="text-[10px] text-ink3 font-dm">
                        Business plan {p.progress.businessPlan.done}/{p.progress.businessPlan.total}
                      </span>
                      <span className="text-[10px] text-ink3 font-dm">
                        {p.documentsGenerated} document(s)
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Link
                      href={`/dashboard/project-owner/projects/${p.id}/coach`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-accent bg-accent/10 hover:bg-accent/20 rounded-lg px-2.5 py-1.5 transition-colors"
                    >
                      <Bot className="w-3.5 h-3.5" /> Coaching IA
                    </Link>
                    <Link
                      href={p.nextStep.link}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-[12px] text-moss hover:text-moss-dark transition-colors font-medium"
                    >
                      <Sparkles className="w-3 h-3" /> {p.nextStep.label} <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {d.recentActivities.length > 0 && <ActivitiesCard activities={d.recentActivities} />}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// EXPERT
// ─────────────────────────────────────────────────────────────

function ExpertDashboard({ role }: { role: UserRole }) {
  const router = useRouter()
  const { data, isLoading, error, refetch } = useRoleDashboard(role)

  if (isLoading) return <LoadingCard label="Chargement de votre tableau de bord..." />
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
  if (!data) return null

  const d = data.data as ExpertDashboardResponse
  const s = d.stats

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
        <StatCard icon={<Briefcase className="w-4 h-4" />} value={s.assignedProjects} label="Projets assignés" />
        <StatCard icon={<GraduationCap className="w-4 h-4" />} value={s.activeCohorts} label="Cohortes actives" />
        <StatCard icon={<ClipboardCheck className="w-4 h-4" />} value={s.evaluationsTodo} label="Évaluations à faire" />
        <StatCard icon={<CalendarClock className="w-4 h-4" />} value={s.upcomingSessions} label="Sessions à venir" />
        <StatCard icon={<Gauge className="w-4 h-4" />} value={s.openActionsCount} label="Actions ouvertes" />
      </div>

      {d.alerts.length > 0 && <AlertsCard alerts={d.alerts} />}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          <SectionHeading>Projets suivis</SectionHeading>
          {d.projects.length === 0 ? (
            <EmptyState
              icon={<Briefcase size={36} />}
              title="Aucun projet assigné"
              message="Consultez le matching pour découvrir les projets qui correspondent à vos expertises."
              ctaLabel="Voir le matching"
              ctaHref="/dashboard/expert/matching"
            />
          ) : (
            d.projects.map((p) => (
              <Card
                key={p.id}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/dashboard/expert/coaching/${p.id}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-ink text-[13px] font-dm">{p.name}</h3>
                      <Badge variant="secondary">{p.role}</Badge>
                      {p.maturity && (
                        <Badge variant={p.maturity.score >= 50 ? 'green' : 'amber'}>
                          Maturité {p.maturity.score}
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-ink2 font-dm mb-2">Porteur : {p.ownerName}</p>
                    <ProgressInline value={p.progress.overall} />
                    {p.nextAction && (
                      <p className="text-[11px] text-ink2 font-dm mt-2">
                        <span className="font-semibold text-ink">À faire :</span> {p.nextAction.label}
                      </p>
                    )}
                    {p.lastEvent && (
                      <p className="text-[10px] text-ink3 font-dm mt-1">
                        {p.lastEvent.label} · {getRelativeTime(p.lastEvent.createdAt)}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-ink3 shrink-0 mt-2" />
                </div>
              </Card>
            ))
          )}
        </div>

        <div className="space-y-6">
          <div>
            <SectionHeading>Évaluations à rendre</SectionHeading>
            {d.evaluations.todo.length === 0 ? (
              <p className="text-[12px] text-ink3 font-dm">
                {s.evaluationsTodo === 0 ? 'Aucune évaluation en attente.' : 'Chargement…'}
              </p>
            ) : (
              <div className="space-y-2">
                {d.evaluations.todo.map((t) => (
                  <Card
                    key={t.assignmentId}
                    className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => router.push(`/dashboard/expert/evaluations-todo/${t.assignmentId}`)}
                  >
                    <p className="text-[12px] font-semibold text-ink font-dm">{t.projectName}</p>
                    <p className="text-[10px] text-ink2 font-dm">
                      {t.deadline ? `À rendre avant le ${formatDate(t.deadline)}` : 'Sans échéance'} ·{' '}
                      {t.cohortName ?? 'Cohorte'}
                    </p>
                  </Card>
                ))}
              </div>
            )}
            {d.evaluations.done.length > 0 && (
              <p className="text-[10px] text-ink3 font-dm mt-2">
                {d.evaluations.done.length} évaluation(s) soumise(s)
              </p>
            )}
          </div>
          <UpcomingSessionsCard
            sessions={d.upcomingSessions}
            hrefFor={(se) => `/dashboard/expert/coaching/${se.projectId}`}
          />
        </div>
      </div>

      {d.recentActivities.length > 0 && <ActivitiesCard activities={d.recentActivities} />}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// INCUBATOR_MEMBER
// ─────────────────────────────────────────────────────────────

const JURY_STATUS: Record<string, { label: string; variant: 'gray' | 'blue' | 'amber' | 'green' }> = {
  DRAFT: { label: 'Brouillon', variant: 'gray' },
  OPEN: { label: 'Ouverte', variant: 'blue' },
  DELIBERATION: { label: 'Délibération', variant: 'amber' },
  CLOSED: { label: 'Clôturée', variant: 'green' },
}

function IncubatorDashboard({ role }: { role: UserRole }) {
  const router = useRouter()
  const { data, isLoading, error, refetch } = useRoleDashboard(role)

  if (isLoading) return <LoadingCard label="Chargement de votre tableau de bord..." />
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
  if (!data) return null

  const d = data.data as IncubatorDashboardResponse
  const s = d.stats

  if (d.incubators.length === 0) {
    return (
      <EmptyState
        icon={<Building2 size={36} />}
        title="Aucun incubateur rejoint"
        message="Rejoignez ou créez un incubateur pour piloter cohortes, portfolio et évaluations."
        ctaLabel="Créer ou rejoindre un incubateur"
        ctaHref="/dashboard/incubator"
      />
    )
  }

  const incubatorIdOf = (cohortId: string) =>
    d.cohorts.find((c) => c.id === cohortId)?.incubatorId ?? ''

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <StatCard icon={<FolderKanban className="w-4 h-4" />} value={s.portfolioSize} label="Projets (portfolio)" />
        <StatCard icon={<TrendingUp className="w-4 h-4" />} value={s.activeProjects} label="Projets en cours" />
        <StatCard icon={<GraduationCap className="w-4 h-4" />} value={`${s.activeCohorts}/${s.totalCohorts}`} label="Cohortes actives" />
        <StatCard icon={<Users className="w-4 h-4" />} value={s.applicationsPending} label="Candidatures en attente" />
        <StatCard icon={<Gauge className="w-4 h-4" />} value={`${s.averageProgress}%`} label="Progression moyenne" />
        <StatCard icon={<AlertTriangle className="w-4 h-4" />} value={s.needsAttention} label="À suivre" />
      </div>

      {d.alerts.length > 0 && <AlertsCard alerts={d.alerts} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {d.incubators.map((inc) => (
          <Card
            key={inc.id}
            className="p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push(`/dashboard/incubator/${inc.id}`)}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="font-bold text-ink text-[13px] font-dm truncate">{inc.name}</h3>
              <ChevronRight className="w-4 h-4 text-ink3 shrink-0" />
            </div>
            <div className="flex gap-4 text-[11px] text-ink2 font-dm">
              <span>{inc.activeCohorts} cohorte(s) active(s)</span>
              <span>{inc.portfolioSize} projet(s)</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          <SectionHeading>Portfolio des cohortes</SectionHeading>
          {d.portfolio.length === 0 ? (
            <EmptyState
              icon={<FolderKanban size={36} />}
              title="Portfolio vide"
              message="Aucun projet accepté dans les cohortes de cet incubateur pour l\u2019instant."
            />
          ) : (
            d.portfolio.map((p) => {
              const cohortHref =
                p.cohortId && incubatorIdOf(p.cohortId)
                  ? `/dashboard/incubator/${incubatorIdOf(p.cohortId)}/cohorts/${p.cohortId}`
                  : null
              return (
                <Card
                  key={p.id}
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => cohortHref && router.push(cohortHref)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-ink text-[13px] font-dm">{p.name}</h3>
                        {p.cohortName && <Badge variant="secondary">{p.cohortName}</Badge>}
                        {p.isGbmReviewed && <Badge variant="green">GBM validé</Badge>}
                      </div>
                      <p className="text-[11px] text-ink2 font-dm mb-2">
                        Porteur : {p.ownerName} · depuis {formatDate(p.createdAt)}
                      </p>
                      <ProgressInline value={p.progress.overall} />
                    </div>
                    <ChevronRight className="w-4 h-4 text-ink3 shrink-0 mt-2" />
                  </div>
                </Card>
              )
            })
          )}
        </div>

        <div className="space-y-6">
          <div>
            <SectionHeading>Évaluations en attente</SectionHeading>
            {d.pendingEvaluations.length === 0 ? (
              <p className="text-[12px] text-ink3 font-dm">Aucune évaluation manquante.</p>
            ) : (
              <div className="space-y-2">
                {d.pendingEvaluations.slice(0, 5).map((e) => (
                  <Card
                    key={e.projectId}
                    className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() =>
                      router.push(
                        `/dashboard/incubator/${incubatorIdOf(e.cohortId)}/cohorts/${e.cohortId}`,
                      )
                    }
                  >
                    <p className="text-[12px] font-semibold text-ink font-dm">{e.projectName}</p>
                    <p className="text-[10px] text-ink2 font-dm">
                      {e.pending} affectation(s) sans évaluation soumise
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {d.jurySessions.length > 0 && (
            <div>
              <SectionHeading>Sessions de jury</SectionHeading>
              <Card>
                <ul className="divide-y divide-border">
                  {d.jurySessions.slice(0, 5).map((j) => {
                    const meta = JURY_STATUS[j.status] ?? { label: j.status, variant: 'gray' as const }
                    return (
                      <li key={j.id}>
                        <Link
                          href={`/dashboard/incubator/${incubatorIdOf(j.cohortId)}/cohorts/${j.cohortId}`}
                          className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-moss/[.04] transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="text-[12px] font-semibold text-ink font-dm truncate">
                              {j.title ?? j.projectName}
                            </p>
                            <p className="text-[10px] text-ink2 font-dm truncate">{j.projectName}</p>
                          </div>
                          <Badge variant={meta.variant}>{meta.label}</Badge>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </Card>
            </div>
          )}

          <UpcomingSessionsCard sessions={d.upcomingSessions} />

          {d.experts.length > 0 && (
            <div>
              <SectionHeading>Experts actifs</SectionHeading>
              <Card>
                <ul className="divide-y divide-border">
                  {d.experts.map((e) => (
                    <li key={e.id} className="px-4 py-3">
                      <p className="text-[12px] font-semibold text-ink font-dm">{e.name}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {e.roles.slice(0, 3).map((r, i) => (
                          <Badge key={`${r.cohortId}-${i}`} variant="secondary">
                            {r.role} · {r.cohortName}
                          </Badge>
                        ))}
                        {e.roles.length > 3 && (
                          <Badge variant="gray">+{e.roles.length - 3}</Badge>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          )}
        </div>
      </div>

      {d.recentActivities.length > 0 && <ActivitiesCard activities={d.recentActivities} />}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// ADMIN fallback
// ─────────────────────────────────────────────────────────────

function AdminFallback() {
  const links = [
    { href: '/dashboard/admin/experts', title: 'Experts', subtitle: 'Gérez les experts et leurs expertises', icon: <Award className="w-4 h-4" /> },
    { href: '/dashboard/admin/project-owners', title: 'Porteurs de projet', subtitle: 'Consultez les profils porteurs', icon: <Briefcase className="w-4 h-4" /> },
    { href: '/dashboard/profile', title: 'Mon profil', subtitle: 'Consultez et modifiez vos informations', icon: <Users className="w-4 h-4" /> },
    { href: '/dashboard/notifications', title: 'Notifications', subtitle: 'Consultez vos alertes et messages', icon: <Bell className="w-4 h-4" /> },
  ]
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {links.map((l) => (
        <Link key={l.href} href={l.href}>
          <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow flex items-center gap-3">
            <div className="w-[30px] h-[30px] rounded-[7px] bg-moss-light text-moss flex items-center justify-center shrink-0">
              {l.icon}
            </div>
            <div>
              <div className="text-[13px] font-semibold text-ink mb-0.5">{l.title}</div>
              <div className="text-[12px] text-ink2">{l.subtitle}</div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Root page: role dispatch
// ─────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, loading } = useAuth()

  if (loading || !user) {
    return (
      <div className="p-8 max-w-6xl">
        <LoadingState label="Chargement de votre session…" />
      </div>
    )
  }

  const role = user.role
  const firstName = user.profile?.first_name

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <DashboardHeader firstName={firstName} role={role} />
      {role === 'PROJECT_OWNER' && <OwnerDashboard role={role} />}
      {role === 'EXPERT' && <ExpertDashboard role={role} />}
      {role === 'INCUBATOR_MEMBER' && <IncubatorDashboard role={role} />}
      {role === 'ADMIN' && (
        <div className="space-y-8">
          <AdminFallback />
        </div>
      )}
      {role && role !== 'ADMIN' && (
        <div className="mt-8">
          <QuickAccess role={role} />
        </div>
      )}
    </div>
  )
}