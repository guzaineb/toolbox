'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Target } from 'lucide-react'
import { Badge, ErrorAlert, TabNav } from '@/components/shared/ui'
import { documentsService } from '@/services/documents.service'
import { gbmService } from '@/services/gbm.service'
import { useAuth } from '@/hooks/useAuth'
import {
  COACHING_SESSION_STATUS_COLORS, COACHING_SESSION_STATUS_LABELS,
} from '@/types/coaching'
import type { CoachingSession } from '@/types/coaching'
import type { GeneratedDocument } from '@/services/documents.service'
import type { GbmProgress } from '@/types/gbm'
import type { CoachingBriefPayload, SessionSummaryPayload } from '@/types/ai-analysis'
import { apiError, formatDateTime } from '@/lib/utils'
import {
  useAiSessionBrief, useAiSessionSummary, useCoachingSession, useCompleteSession,
  useProjectActions, useProjectAssignments, useProjectRecommendations, useProjectSessions,
  useStartSession, useUpdateSession,
} from '@/hooks/useCoaching'
import { PreparationTab } from './PreparationTab'
import { RunningTab } from './RunningTab'
import { DecisionsTab } from './DecisionsTab'
import { ActionsTab } from './ActionsTab'
import { ClosureTab } from './ClosureTab'
import { SessionBackNote, StickyActionBar } from './session-workspace-ui'
import type { ObjectiveResultDraft, SessionDraft } from './session-types'

const CLOSED_STATUSES = ['COMPLETED', 'CANCELLED', 'MISSED']
const ACTIVE_NEXT_STATUSES = ['SCHEDULED', 'RESCHEDULED', 'IN_PROGRESS']

/**
 * Workspace de session de coaching — parcours complet du coach :
 * PRÉPARER (brief IA + livrables + historique) → DÉROULER (notes, constats,
 * blocages) → DÉCIDER (recommandations, décisions, résultat d'objectif) →
 * AGIR (actions avec responsable/livrable/échéance) → CLÔTURER (résumé IA
 * validé, objectifs de la prochaine session, prochaine étape).
 *
 * L'IA propose, le coach vérifie, modifie et valide : rien n'est enregistré
 * automatiquement. Le mode gestion est réservé au coach assigné ; les autres
 * lecteurs autorisés voient la session en lecture seule.
 */
export function SessionWorkspace({
  projectId, sessionId,
  basePath = `/dashboard/expert/coaching/${projectId}`,
  backToCoachingHref = '/dashboard/expert/coachings',
}: {
  projectId: string
  sessionId: string
  /** Route socle du suivi coaching (liens précédente/suivante, planification). */
  basePath?: string
  /** Route de retour hors espace de session. */
  backToCoachingHref?: string
}) {
  const { user } = useAuth()
  const { data: session, isLoading, error: sessionError } = useCoachingSession(sessionId)
  const { data: projectActions } = useProjectActions(projectId)
  const { data: projectRecommendations } = useProjectRecommendations(projectId)
  const { data: projectSessions } = useProjectSessions(projectId)
  const { data: projectAssignments } = useProjectAssignments(projectId)
  const [documents, setDocuments] = useState<GeneratedDocument[]>([])
  const [progress, setProgress] = useState<GbmProgress | null>(null)
  const [error, setError] = useState<string | null>(null)
  const loading = isLoading

  const updateSession = useUpdateSession()
  const startSessionMutation = useStartSession()
  const completeSessionMutation = useCompleteSession()
  const briefMutation = useAiSessionBrief(sessionId)
  const summaryMutation = useAiSessionSummary(sessionId)

  const actions = useMemo(
    () => (projectActions ?? []).filter((a) => a.session?.id === sessionId),
    [projectActions, sessionId],
  )
  const recommendations = useMemo(
    () => (projectRecommendations ?? []).filter((r) => r.session_id === sessionId),
    [projectRecommendations, sessionId],
  )
  const allSessions = useMemo(() => projectSessions ?? [], [projectSessions])
  const assignments = useMemo(() => projectAssignments ?? [], [projectAssignments])

  const loadError = sessionError ? apiError(sessionError, 'Erreur de chargement de la session') : error

  const canManage =
    !!session && !!user && session.assignment?.expert_user_id === user.id
  const isClosed = !!session && CLOSED_STATUSES.includes(session.status)

  // Onglet actif
  const [tab, setTab] = useState('preparation')

  // Brief IA (proposition, jamais persistée comme décision)
  const [brief, setBrief] = useState<CoachingBriefPayload | null>(null)
  const [briefLoading, setBriefLoading] = useState(false)

  // Brouillon unique de tous les champs éditables de la session
  const [draft, setDraft] = useState<SessionDraft>({
    objective: '', notes: '', findings: '', topicsDiscussed: '',
    decisions: '', summary: '', nextObjectives: '',
    objectiveResult: '', objectiveResultReason: '', blockers: [],
  })
  const baselineRef = useRef<string>('')
  const [saving, setSaving] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)

  // Résumé IA → édition coach → sauvegarde explicite
  const [summaryLoading, setSummaryLoading] = useState(false)

  // Nouvelle action liée à la session
  const [showActionForm, setShowActionForm] = useState(false)

  const setField = <K extends keyof SessionDraft>(key: K, value: SessionDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))

  const sessionToDraft = useCallback((s: CoachingSession): SessionDraft => ({
    objective: s.objective ?? '',
    notes: s.notes ?? '',
    findings: s.findings ?? '',
    topicsDiscussed: s.topics_discussed ?? '',
    decisions: s.decisions ?? '',
    summary: s.summary ?? '',
    nextObjectives: s.next_objectives ?? '',
    objectiveResult: (s.objective_result ?? '') as ObjectiveResultDraft,
    objectiveResultReason: s.objective_result_reason ?? '',
    blockers: Array.isArray(s.blockers) ? s.blockers.map((b) => ({ ...b })) : [],
  }), [])

  // Livrables + progression GBM restent chargés manuellement (hors périmètre coaching).
  useEffect(() => {
    if (!projectId) return
    let cancelled = false
    documentsService
      .getDocumentsList(projectId)
      .then((docs) => { if (!cancelled) setDocuments(docs) })
      .catch(() => undefined)
    gbmService
      .getProgress(projectId)
      .then((p) => { if (!cancelled) setProgress(p) })
      .catch(() => undefined)
    return () => { cancelled = true }
  }, [projectId])

  // Synchronise le brouillon éditable depuis la session (chargement + mises à jour après sauvegarde).
  useEffect(() => {
    if (!session) return
    const serialized = JSON.stringify(sessionToDraft(session))
    if (baselineRef.current === serialized) return
    baselineRef.current = serialized
    setDraft(sessionToDraft(session))
  }, [session, sessionToDraft])

  /** Payload des champs réellement modifiés (envoyé au PATCH). */
  const buildPayload = (): Record<string, unknown> => {
    const p: Record<string, unknown> = {}
    if (!isClosed && draft.objective !== (session?.objective ?? '')) p.objective = draft.objective
    if (draft.notes !== (session?.notes ?? '')) p.notes = draft.notes
    if (draft.findings !== (session?.findings ?? '')) p.findings = draft.findings
    if (draft.topicsDiscussed !== (session?.topics_discussed ?? '')) p.topicsDiscussed = draft.topicsDiscussed
    if (draft.decisions !== (session?.decisions ?? '')) p.decisions = draft.decisions
    if (draft.summary !== (session?.summary ?? '')) p.summary = draft.summary
    if (draft.nextObjectives !== (session?.next_objectives ?? '')) p.nextObjectives = draft.nextObjectives
    if (draft.objectiveResult !== ((session?.objective_result ?? '') as ObjectiveResultDraft)) {
      if (draft.objectiveResult) p.objectiveResult = draft.objectiveResult
    }
    if (draft.objectiveResultReason !== (session?.objective_result_reason ?? '')) p.objectiveResultReason = draft.objectiveResultReason
    const original = Array.isArray(session?.blockers) ? session!.blockers! : []
    if (JSON.stringify(draft.blockers) !== JSON.stringify(original)) {
      p.blockers = draft.blockers.map(({ id, title, detail, resolved }) => ({ id, title, detail, resolved }))
    }
    return p
  }

  const dirty = Object.keys(buildPayload()).length > 0

  const save = async (): Promise<boolean> => {
    const payload = buildPayload()
    if (Object.keys(payload).length === 0) return true
    setSaving(true)
    setError(null)
    try {
      await updateSession.mutateAsync({ projectId, sessionId, dto: payload })
      setSavedFlash(true)
      setTimeout(() => setSavedFlash(false), 2500)
      return true
    } catch (err) {
      setError(apiError(err, 'La sauvegarde de la session a échoué'))
      return false
    } finally {
      setSaving(false)
    }
  }

  const generateBrief = async () => {
    setError(null)
    setBriefLoading(true)
    try {
      const res = await briefMutation.mutateAsync()
      if (res.success && res.data) setBrief(res.data)
      else setError('Le brief IA est indisponible pour le moment (service IA ou données insuffisantes).')
    } catch (err) {
      setError(apiError(err, 'La génération du brief a échoué'))
    } finally {
      setBriefLoading(false)
    }
  }

  /** Accepter l'objectif proposé par l'IA : remplit le champ, le coach garde la main (et sauvegarde). */
  const acceptObjective = () => {
    if (!brief) return
    setField('objective', brief.objective)
    setTab('deroulement')
  }

  const generateSummary = async () => {
    setError(null)
    setSummaryLoading(true)
    try {
      const res = await summaryMutation.mutateAsync()
      const data = res.data as SessionSummaryPayload | null
      if (res.success && data) {
        // Proposition affichée dans les champs éditables : rien n'est sauvegardé sans validation du coach
        setField('summary', data.summary)
        setField('nextObjectives', data.nextObjectives.join('\n'))
      } else {
        setError("Le résumé IA est indisponible — vérifiez que les notes de session sont renseignées.")
      }
    } catch (err) {
      setError(apiError(err, 'La génération du résumé a échoué'))
    } finally {
      setSummaryLoading(false)
    }
  }

  const startSession = async () => {
    setError(null)
    try {
      await startSessionMutation.mutateAsync({ projectId, sessionId })
    } catch (err) {
      setError(apiError(err, 'Le démarrage de la session a échoué'))
    }
  }

  const completeSession = async () => {
    setError(null)
    const ok = await save()
    if (!ok) return
    try {
      await completeSessionMutation.mutateAsync({ projectId, sessionId, report: draft.summary || undefined })
    } catch (err) {
      setError(apiError(err, 'La clôture de la session a échoué'))
    }
  }

  // ===== Suivi inter-sessions (boucle §22) =====
  const previousSession = useMemo(() => {
    if (!session) return null
    return allSessions
      .filter((s) =>
        s.id !== sessionId &&
        s.status === 'COMPLETED' &&
        new Date(s.scheduled_at).getTime() <= new Date(session.scheduled_at).getTime())
      .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())[0] ?? null
  }, [allSessions, session, sessionId])

  const nextSession = useMemo(() => {
    if (!session) return null
    return allSessions
      .filter((s) => s.id !== sessionId && ACTIVE_NEXT_STATUSES.includes(s.status))
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())[0] ?? null
  }, [allSessions, session, sessionId])

  const previousStats = useMemo(() => {
    const list = actions.filter((a) => a.session?.id === previousSession?.id)
    const now = Date.now()
    return {
      total: list.length,
      completed: list.filter((a) => a.status === 'COMPLETED').length,
      inFlight: list.filter((a) => ['PENDING', 'IN_PROGRESS'].includes(a.status)).length,
      submitted: list.filter((a) => a.status === 'SUBMITTED').length,
      overdue: list.filter(
        (a) => a.deadline && new Date(a.deadline).getTime() < now &&
          !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(a.status),
      ).length,
    }
  }, [actions, previousSession])

  const carriedBlockers = useMemo(
    () => (previousSession?.blockers ?? []).filter((b) => !b.resolved),
    [previousSession],
  )

  const responsableOptions = useMemo(() => {
    const ownerId = session?.assignment?.project?.owner_id
    const coachId = session?.assignment?.expert_user_id
    const seen = new Set<string>()
    const opts: Array<{ id: string; label: string }> = []
    const push = (id: string | undefined, label: string) => {
      if (!id || seen.has(id)) return
      seen.add(id)
      opts.push({ id, label })
    }
    push(ownerId, 'Porteur du projet')
    assignments.forEach((a) => {
      const prof = a.expertUser?.profile
      const name = prof ? `${prof.first_name} ${prof.last_name}` : (a.expertUser?.email ?? 'Expert')
      const roleLabel = a.role === 'COACH' ? `Coach — ${name}` : name
      if (a.expert_user_id === coachId) push(a.expert_user_id, `Vous (coach)`)
      else push(a.expert_user_id, roleLabel)
    })
    return opts
  }, [assignments, session])

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-72 bg-border rounded" />
        <div className="h-10 w-full bg-border rounded" />
        <div className="h-40 bg-border rounded-[14px]" />
        <div className="h-64 bg-border rounded-[14px]" />
      </div>
    )
  }

  if (!session) {
    return <ErrorAlert message={loadError ?? 'Session introuvable'} />
  }

  const tabs = [
    { id: 'preparation', label: '1 · Préparation' },
    { id: 'deroulement', label: '2 · Déroulement' },
    { id: 'decisions', label: '3 · Décisions' },
    { id: 'actions', label: '4 · Actions' },
    { id: 'cloture', label: '5 · Clôture' },
  ]

  return (
    <div className="space-y-5">
      {/* ===== HEADER ===== */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-syne text-[18px] font-extrabold text-ink">
              {session.title || 'Session de coaching'}
            </h2>
            <Badge variant={COACHING_SESSION_STATUS_COLORS[session.status]}>
              {COACHING_SESSION_STATUS_LABELS[session.status]}
            </Badge>
          </div>
          <div className="text-[11px] text-ink3 mt-1">
            {formatDateTime(session.scheduled_at, { dateStyle: 'long', timeStyle: 'short' })}
            {session.duration_minutes ? ` · ${session.duration_minutes} min` : ''}
            {session.session_type ? ` · ${session.session_type}` : ''}
            {session.assignment?.expertUser?.profile &&
              ` · Coach : ${session.assignment.expertUser.profile.first_name} ${session.assignment.expertUser.profile.last_name}`}
          </div>
          {(draft.objective || session.objective) && (
            <div className="text-[12px] text-ink2 mt-1.5 flex items-start gap-1.5">
              <Target size={13} className="text-moss mt-[1px] shrink-0" />
              <span className="italic">{draft.objective || session.objective}</span>
            </div>
          )}
        </div>
      </div>

      {loadError && <ErrorAlert message={loadError} />}

      {/* ===== NAVIGATION PARCOURS ===== */}
      <TabNav tabs={tabs} active={tab} onChange={setTab} />

      {/* ===== TAB 1 — PRÉPARATION ===== */}
      {tab === 'preparation' && (
        <PreparationTab
          projectId={projectId}
          sessionId={sessionId}
          basePath={basePath}
          canManage={canManage}
          isClosed={isClosed}
          allSessions={allSessions}
          previousSession={previousSession}
          previousStats={previousStats}
          carriedBlockers={carriedBlockers}
          progress={progress}
          brief={brief}
          briefLoading={briefLoading}
          onGenerateBrief={generateBrief}
          onAcceptObjective={acceptObjective}
          onGoToRunning={() => setTab('deroulement')}
        />
      )}

      {/* ===== TAB 2 — DÉROULEMENT ===== */}
      {tab === 'deroulement' && (
        <RunningTab draft={draft} setField={setField} canManage={canManage} isClosed={isClosed} />
      )}

      {/* ===== TAB 3 — DÉCISIONS ===== */}
      {tab === 'decisions' && (
        <DecisionsTab
          session={session}
          projectId={projectId}
          sessionId={sessionId}
          recommendations={recommendations}
          canManage={canManage}
          draft={draft}
          setField={setField}
        />
      )}

      {/* ===== TAB 4 — ACTIONS ===== */}
      {tab === 'actions' && (
        <ActionsTab
          projectId={projectId}
          sessionId={sessionId}
          actions={actions}
          canManage={canManage}
          showForm={showActionForm}
          onToggleForm={() => setShowActionForm((v) => !v)}
          responsableOptions={responsableOptions}
          documents={documents}
        />
      )}

      {/* ===== TAB 5 — CLÔTURE ===== */}
      {tab === 'cloture' && (
        <ClosureTab
          basePath={basePath}
          canManage={canManage}
          nextSession={nextSession}
          progress={progress}
          draft={draft}
          setField={setField}
          summaryLoading={summaryLoading}
          onGenerateSummary={generateSummary}
        />
      )}

      {/* ===== BARRE D'ACTIONS FIXE ===== */}
      <StickyActionBar
        dirty={dirty}
        saving={saving}
        savedFlash={savedFlash}
        canManage={!!canManage}
        status={session.status}
        onSave={save}
        onStart={startSession}
        onComplete={completeSession}
      />

      <SessionBackNote href={backToCoachingHref} />
    </div>
  )
}