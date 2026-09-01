'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Sparkles, ClipboardList, FileText, CheckCircle2, PlayCircle,
  ListTodo, Lightbulb, MessageSquareQuote, Plus, X, Paperclip, ShieldCheck,
  Flag, Target, AlertTriangle, History, Save, Eye, ChevronRight, CircleDot,
} from 'lucide-react'
import {
  Badge, Button, Card, CardHeader, ErrorAlert, Field, Input,
  Select, TabNav, Textarea,
} from '@/components/shared/ui'
import { coachingService } from '@/services/coaching.service'
import { documentsService } from '@/services/documents.service'
import { gbmService } from '@/services/gbm.service'
import { MaturityCard } from '@/components/coaching/MaturityCard'
import { DeliverablesPanel } from '@/components/coaching/DeliverablesPanel'
import { useAuth } from '@/hooks/useAuth'
import {
  CoachingSession, CoachingAction, CoachingRecommendation, ActionEvidence,
  COACHING_SESSION_STATUS_LABELS, COACHING_SESSION_STATUS_COLORS,
  ACTION_STATUS_LABELS, ACTION_STATUS_COLORS, PRIORITY_LABELS,
  OBJECTIVE_RESULT_LABELS, OBJECTIVE_RESULT_COLORS,
  SessionObjectiveResult, SessionBlocker,
} from '@/types/coaching'
import type { ProjectAssignment } from '@/types/coaching'
import type { GeneratedDocument } from '@/services/documents.service'
import type { GbmProgress } from '@/types/gbm'
import { CoachingBriefPayload, SessionSummaryPayload } from '@/types/ai-analysis'
import { getErrorMessage } from '@/lib/utils'

function apiError(err: unknown, fallback: string): string {
  return getErrorMessage(err) || fallback
}

function formatDateTime(value?: string): string {
  if (!value) return '—'
  return new Date(value).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })
}

function formatDate(value?: string): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('fr-FR', { dateStyle: 'medium' })
}

function newBlockerId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `blk-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const CLOSED_STATUSES = ['COMPLETED', 'CANCELLED', 'MISSED']
const ACTIVE_NEXT_STATUSES = ['SCHEDULED', 'RESCHEDULED', 'IN_PROGRESS']

type ObjectiveResultDraft = '' | SessionObjectiveResult

interface SessionDraft {
  objective: string
  notes: string
  findings: string
  topicsDiscussed: string
  decisions: string
  summary: string
  nextObjectives: string
  objectiveResult: ObjectiveResultDraft
  objectiveResultReason: string
  blockers: SessionBlocker[]
}

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
}: {
  projectId: string
  sessionId: string
}) {
  const { user } = useAuth()
  const [session, setSession] = useState<CoachingSession | null>(null)
  const [actions, setActions] = useState<CoachingAction[]>([])
  const [recommendations, setRecommendations] = useState<CoachingRecommendation[]>([])
  const [assignments, setAssignments] = useState<ProjectAssignment[]>([])
  const [documents, setDocuments] = useState<GeneratedDocument[]>([])
  const [allSessions, setAllSessions] = useState<CoachingSession[]>([])
  const [progress, setProgress] = useState<GbmProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const loadActions = useCallback(() => {
    coachingService
      .getProjectActions(projectId)
      .then((all) => setActions(all.filter((a) => a.session?.id === sessionId)))
      .catch(() => undefined)
  }, [projectId, sessionId])

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

  useEffect(() => {
    if (!sessionId) return
    let cancelled = false
    setLoading(true)
    ;(async () => {
      try {
        const s = await coachingService.getSession(sessionId)
        if (cancelled) return
        setSession(s)
        baselineRef.current = JSON.stringify(sessionToDraft(s))
        setDraft(sessionToDraft(s))
        const [all, recs, sess] = await Promise.all([
          coachingService.getProjectActions(projectId),
          coachingService.getProjectRecommendations(projectId).catch(() => []),
          coachingService.getProjectSessions(projectId).catch(() => []),
        ])
        if (cancelled) return
        setActions(all.filter((a) => a.session?.id === sessionId))
        setRecommendations(recs.filter((r) => r.session_id === sessionId))
        setAllSessions(sess)
        const [docs, prog, asg] = await Promise.all([
          documentsService.getDocumentsList(projectId).catch(() => []),
          gbmService.getProgress(projectId).catch(() => null),
          coachingService.getProjectAssignments(projectId).catch(() => []),
        ])
        if (cancelled) return
        setDocuments(docs)
        setProgress(prog)
        setAssignments(asg)
      } catch (err) {
        if (!cancelled) setError(apiError(err, 'Erreur de chargement de la session'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [projectId, sessionId, sessionToDraft])

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
      const updated = await coachingService.updateSession(sessionId, payload)
      setSession(updated)
      baselineRef.current = JSON.stringify(sessionToDraft(updated))
      setDraft(sessionToDraft(updated))
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
      const res = await coachingService.aiSessionBrief(sessionId)
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
      const res = await coachingService.aiSessionSummary(sessionId)
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
      const updated = await coachingService.startSession(sessionId)
      setSession(updated)
      baselineRef.current = JSON.stringify(sessionToDraft(updated))
    } catch (err) {
      setError(apiError(err, 'Le démarrage de la session a échoué'))
    }
  }

  const completeSession = async () => {
    setError(null)
    const ok = await save()
    if (!ok) return
    try {
      const updated = await coachingService.completeSession(sessionId, draft.summary || undefined)
      setSession(updated)
      baselineRef.current = JSON.stringify(sessionToDraft(updated))
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
    return <ErrorAlert message={error ?? 'Session introuvable'} />
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
            {formatDateTime(session.scheduled_at)}
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

      {error && <ErrorAlert message={error} />}

      {/* ===== NAVIGATION PARCOURS ===== */}
      <TabNav tabs={tabs} active={tab} onChange={setTab} />

      {/* =======================================================
          TAB 1 — PRÉPARATION
      ======================================================= */}
      {tab === 'preparation' && (
        <div className="space-y-5">
          {/* Indicateur global */}
          <div>
            <p className="text-[11px] text-ink3 mb-1.5 flex items-center gap-1">
              <CircleDot size={11} /> Indicateur global du projet (toutes sources) — ne mesure pas cette session
            </p>
            <MaturityCard projectId={projectId} />
          </div>

          {/* Brief IA */}
          <Card>
            <CardHeader icon={<Sparkles size={13} />} title="Brief IA — préparation de session">
              {canManage && (
                <Button variant="outline" size="sm" onClick={generateBrief} disabled={briefLoading}>
                  <Sparkles size={12} className={briefLoading ? 'animate-pulse' : ''} />
                  {briefLoading ? 'Génération…' : brief ? 'Régénérer' : 'Générer le brief'}
                </Button>
              )}
            </CardHeader>
            <div className="p-[18px] space-y-4">
              {!brief && !briefLoading && (
                <p className="text-[12px] text-ink3">
                  Le brief IA synthétise le contexte projet (évaluations, plan d&apos;amélioration, actions,
                  sessions précédentes) pour préparer votre séance. Simple proposition : vous choisissez
                  ce que vous retenez — l&apos;IA ne décide rien à votre place.
                </p>
              )}
              {brief && (
                <>
                  <div className="border border-border rounded-[10px] p-3 space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-ink3">Objectif proposé</div>
                    <p className="text-[13px] text-ink">{brief.objective}</p>
                    {canManage && !isClosed && (
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" variant="primary" onClick={acceptObjective}>
                          <CheckCircle2 size={12} /> Accepter comme objectif
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setTab('deroulement')}>
                          Modifier moi-même
                        </Button>
                      </div>
                    )}
                  </div>
                  {brief.previousProgress.length > 0 && (
                    <BriefList title="Progrès constatés" items={brief.previousProgress} tone="green" />
                  )}
                  {brief.priorities.length > 0 && (
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-ink3 mb-2">Priorités suggérées</div>
                      <div className="space-y-2">
                        {brief.priorities.map((p) => (
                          <div key={p.title} className="flex items-start gap-2 border border-border rounded-[10px] p-3">
                            <Badge variant={p.priority === 'HIGH' ? 'red' : p.priority === 'MEDIUM' ? 'blue' : 'gray'}>
                              {PRIORITY_LABELS[p.priority as keyof typeof PRIORITY_LABELS] ?? p.priority}
                            </Badge>
                            <div className="flex-1">
                              <div className="text-[12px] font-semibold text-ink">{p.title}</div>
                              {p.detail && <div className="text-[11px] text-ink3 mt-0.5">{p.detail}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {brief.suggestedQuestions.length > 0 && (
                    <BriefList title="Questions à poser" items={brief.suggestedQuestions} tone="blue" />
                  )}
                  {brief.pointsToDiscuss.length > 0 && (
                    <BriefList title="Points à aborder" items={brief.pointsToDiscuss} tone="amber" />
                  )}
                </>
              )}
            </div>
          </Card>

          {/* Depuis la dernière session */}
          <Card>
            <CardHeader icon={<History size={13} />} title="Depuis la dernière session" />
            <div className="p-[18px] space-y-4">
              {!previousSession && (
                <p className="text-[12px] text-ink3">C&apos;est la première session de coaching de ce projet.</p>
              )}
              {previousSession && (
                <>
                  <div className="flex items-center gap-2 flex-wrap text-[12px] text-ink2">
                    <span>Session précédente :</span>
                    <Link
                      href={`/dashboard/expert/coaching/${projectId}/sessions/${previousSession.id}`}
                      className="font-semibold text-moss hover:underline"
                    >
                      {previousSession.title || formatDate(previousSession.scheduled_at)}
                    </Link>
                    <span className="text-ink3">({formatDate(previousSession.scheduled_at)})</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatMini num={`${progress?.percentage ?? 0}%`} label="Parcours GBM" />
                    <StatMini num={previousStats.completed} label={`Actions terminées (${previousStats.total})`} tone="green" />
                    <StatMini num={previousStats.inFlight + previousStats.submitted} label="En cours / à valider" tone="amber" />
                    <StatMini num={previousStats.overdue} label="En retard" tone={previousStats.overdue > 0 ? 'red' : undefined} />
                  </div>
                  {carriedBlockers.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-ink3 flex items-center gap-1.5">
                        <AlertTriangle size={12} className="text-amber" /> Blocages non résolus reportés
                      </div>
                      {carriedBlockers.map((b) => (
                        <div key={b.id} className="flex items-start gap-2 text-[12px] text-ink2">
                          <AlertTriangle size={12} className="text-amber mt-[2px] shrink-0" />
                          <span>{b.title}{b.detail ? ` — ${b.detail}` : ''}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>

          {/* Livrables à examiner */}
          <Card>
            <CardHeader icon={<FileText size={13} />} title="Livrables à examiner" />
            <DeliverablesPanel projectId={projectId} />
          </Card>

          {/* Historique du coaching */}
          <Card>
            <CardHeader icon={<History size={13} />} title={`Historique du coaching (${allSessions.length})`} />
            <div className="p-[18px]">
              {allSessions.length === 0 && (
                <p className="text-[12px] text-ink3">Aucune autre session pour ce projet.</p>
              )}
              <ol className="space-y-0">
                {[...allSessions]
                  .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())
                  .map((s, idx, arr) => (
                    <li key={s.id} className="relative flex gap-3 pb-4 last:pb-0">
                      {idx < arr.length - 1 && (
                        <span className="absolute left-[7px] top-[20px] bottom-0 w-px bg-border" aria-hidden />
                      )}
                      <span
                        className={`mt-[5px] w-[15px] h-[15px] rounded-full border-2 shrink-0 ${
                          s.id === sessionId
                            ? 'bg-moss border-moss'
                            : s.status === 'COMPLETED'
                              ? 'bg-moss-light border-moss'
                              : 'bg-surface border-border'
                        }`}
                        aria-hidden
                      />
                      <Link
                        href={`/dashboard/expert/coaching/${projectId}/sessions/${s.id}`}
                        className="flex items-center gap-2 flex-wrap group"
                      >
                        <span className={`text-[12px] group-hover:text-moss transition-colors ${s.id === sessionId ? 'font-bold text-ink' : 'text-ink2'}`}>
                          {s.title || 'Session'} — {formatDate(s.scheduled_at)}
                        </span>
                        <Badge variant={COACHING_SESSION_STATUS_COLORS[s.status]}>
                          {s.id === sessionId ? 'Cette session' : COACHING_SESSION_STATUS_LABELS[s.status]}
                        </Badge>
                      </Link>
                    </li>
                  ))}
              </ol>
            </div>
          </Card>
        </div>
      )}

      {/* =======================================================
          TAB 2 — DÉROULEMENT
      ======================================================= */}
      {tab === 'deroulement' && (
        <div className="grid lg:grid-cols-2 gap-5 items-start">
          <div className="space-y-5">
            <Card>
              <CardHeader icon={<Target size={13} />} title="Ce qui se passe pendant la séance" />
              <div className="p-[18px] space-y-3">
                <Field label="Objectif de la session">
                  <Input
                    value={draft.objective}
                    onChange={(e) => setField('objective', e.target.value)}
                    disabled={!canManage || isClosed}
                    placeholder="Ex. Valider le Business Model"
                  />
                  {isClosed && <p className="text-[10px] text-ink3 mt-1">Session clôturée : l&apos;objectif est figé.</p>}
                </Field>
                <Field label="Points abordés (un par ligne)">
                  <Textarea
                    value={draft.topicsDiscussed}
                    onChange={(e) => setField('topicsDiscussed', e.target.value)}
                    rows={4}
                    disabled={!canManage}
                    placeholder={'Ex.\nSegmentation client\nProposition de valeur\nCanaux de distribution'}
                  />
                  <p className="text-[10px] text-ink3 mt-1">Sujets réellement traités — à distinguer de l&apos;agenda prévu.</p>
                </Field>
              </div>
            </Card>

            <Card>
              <CardHeader icon={<ClipboardList size={13} />} title="Notes prises pendant la séance" />
              <div className="p-[18px]">
                <Textarea
                  value={draft.notes}
                  onChange={(e) => setField('notes', e.target.value)}
                  rows={7}
                  disabled={!canManage}
                  placeholder="Ce qui a été dit, remontées du porteur… Les notes restent internes et n'engagent rien."
                />
              </div>
            </Card>
          </div>

          <div className="space-y-5">
            <Card>
              <CardHeader icon={<Eye size={13} />} title="Constats du coach">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-amber bg-amber/10 px-2 py-0.5 rounded">
                  ≠ Notes
                </span>
              </CardHeader>
              <div className="p-[18px] space-y-2">
                <p className="text-[11px] text-ink3">
                  Votre lecture professionnelle : ce que vous observez, ce qui est validé ou non par les faits.
                  Exemple — note : « vente via Instagram » ; constat : « canal non encore validé par des données terrain ».
                </p>
                <Textarea
                  value={draft.findings}
                  onChange={(e) => setField('findings', e.target.value)}
                  rows={6}
                  disabled={!canManage}
                  placeholder="Un constat par ligne"
                />
              </div>
            </Card>

            <BlockersCard
              blockers={draft.blockers}
              onChange={(blockers) => setField('blockers', blockers)}
              disabled={!canManage}
            />
          </div>
        </div>
      )}

      {/* =======================================================
          TAB 3 — DÉCISIONS
      ======================================================= */}
      {tab === 'decisions' && (
        <div className="grid lg:grid-cols-2 gap-5 items-start">
          <div className="space-y-5">
            <RecommendationsCard
              projectId={projectId}
              sessionId={sessionId}
              recommendations={recommendations}
              onCreated={(rec) => setRecommendations((r) => [rec, ...r])}
              canManage={canManage}
            />

            <Card>
              <CardHeader icon={<MessageSquareQuote size={13} />} title="Décisions arrêtées" />
              <div className="p-[18px] space-y-2">
                <p className="text-[11px] text-ink3">
                  Ce qui a été réellement décidé pendant la séance (une décision par ligne).
                  Une décision engage — à distinguer d&apos;une recommandation ou d&apos;un constat.
                </p>
                <Textarea
                  value={draft.decisions}
                  onChange={(e) => setField('decisions', e.target.value)}
                  rows={5}
                  disabled={!canManage}
                  placeholder="Ex. Le porteur réalisera 10 interviews avant la prochaine session."
                />
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader icon={<Flag size={13} />} title="Résultat de l'objectif" />
            <div className="p-[18px] space-y-3">
              <p className="text-[11px] text-ink3">
                Constaté à la fin de la séance : l&apos;objectif fixé en début de session a-t-il été atteint ?
              </p>
              {session.objective && (
                <div className="border border-border rounded-[10px] p-3 bg-surface-2/50">
                  <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-ink3 mb-1">Objectif</div>
                  <p className="text-[12px] text-ink italic">{session.objective}</p>
                </div>
              )}
              <Field label="Résultat">
                <Select
                  value={draft.objectiveResult}
                  onChange={(e) => setField('objectiveResult', e.target.value as ObjectiveResultDraft)}
                  disabled={!canManage}
                >
                  <option value="">— Non renseigné —</option>
                  {Object.entries(OBJECTIVE_RESULT_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </Field>
              {draft.objectiveResult && (
                <Badge variant={OBJECTIVE_RESULT_COLORS[draft.objectiveResult]}>
                  {OBJECTIVE_RESULT_LABELS[draft.objectiveResult]}
                </Badge>
              )}
              <Field label="Justification">
                <Textarea
                  value={draft.objectiveResultReason}
                  onChange={(e) => setField('objectiveResultReason', e.target.value)}
                  rows={3}
                  disabled={!canManage}
                  placeholder="Ex. Le modèle financier nécessite encore des données sur les coûts variables."
                />
              </Field>
            </div>
          </Card>
        </div>
      )}

      {/* =======================================================
          TAB 4 — ACTIONS
      ======================================================= */}
      {tab === 'actions' && (
        <SessionActionsCard
          projectId={projectId}
          sessionId={sessionId}
          actions={actions}
          canManage={canManage}
          showForm={showActionForm}
          onToggleForm={() => setShowActionForm((v) => !v)}
          onChanged={loadActions}
          responsableOptions={responsableOptions}
          documents={documents}
        />
      )}

      {/* =======================================================
          TAB 5 — CLÔTURE
      ======================================================= */}
      {tab === 'cloture' && (
        <div className="grid lg:grid-cols-2 gap-5 items-start">
          <div className="space-y-5">
            <Card>
              <CardHeader icon={<FileText size={13} />} title="Résumé de fin de session">
                <div className="flex gap-2">
                  {canManage && (
                    <Button variant="outline" size="sm" onClick={generateSummary} disabled={summaryLoading}>
                      <Sparkles size={12} className={summaryLoading ? 'animate-pulse' : ''} />
                      {summaryLoading ? 'Génération…' : 'Proposer un résumé (IA)'}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <div className="p-[18px] space-y-3">
                <div className="border border-amber/40 bg-amber/[.06] rounded-[10px] p-3 text-[11px] text-ink2 flex items-start gap-2">
                  <Sparkles size={13} className="text-amber shrink-0 mt-[1px]" />
                  Ce résumé est une proposition générée par l&apos;IA. Le coach doit le vérifier, le modifier si
                  besoin, puis sauvegarder : seul le texte validé par le coach fait foi.
                </div>
                <Field label="Résumé">
                  <Textarea
                    value={draft.summary}
                    onChange={(e) => setField('summary', e.target.value)}
                    rows={6}
                    disabled={!canManage}
                  />
                </Field>
              </div>
            </Card>

            <Card>
              <CardHeader icon={<ListTodo size={13} />} title="Objectifs pour la prochaine session" />
              <div className="p-[18px] space-y-2">
                <Textarea
                  value={draft.nextObjectives}
                  onChange={(e) => setField('nextObjectives', e.target.value)}
                  rows={4}
                  disabled={!canManage}
                  placeholder={'Un objectif par ligne\nEx. Vérifier les résultats des interviews\nValider les nouveaux segments clients'}
                />
              </div>
            </Card>
          </div>

          <NextStepCard projectId={projectId} nextSession={nextSession} progress={progress} />
        </div>
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

      <SessionBackNote />
    </div>
  )
}

/* =========================================================
   BARRE D'ACTIONS FIXE (état de sauvegarde + workflow)
========================================================= */

function StickyActionBar({
  dirty, saving, savedFlash, canManage, status, onSave, onStart, onComplete,
}: {
  dirty: boolean
  saving: boolean
  savedFlash: boolean
  canManage: boolean
  status: CoachingSession['status']
  onSave: () => Promise<boolean> | void
  onStart: () => void
  onComplete: () => void
}) {
  const canStart = canManage && (status === 'SCHEDULED' || status === 'RESCHEDULED')
  const canComplete = canManage && status === 'IN_PROGRESS'

  return (
    <div className="sticky bottom-0 -mx-1 px-1 pt-2 pb-1 bg-gradient-to-t from-surface via-surface/95 to-transparent z-10">
      <div className="border border-border rounded-[12px] bg-surface shadow-[0_4px_16px_rgba(15,31,22,0.08)] px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-[11px] min-w-0">
          {saving ? (
            <span className="flex items-center gap-1.5 text-blue-600 font-semibold">
              <Save size={12} className="animate-pulse" /> Enregistrement…
            </span>
          ) : savedFlash && !dirty ? (
            <span className="flex items-center gap-1.5 text-moss font-semibold">
              <CheckCircle2 size={12} /> Enregistré
            </span>
          ) : dirty ? (
            <span className="flex items-center gap-1.5 text-amber font-semibold">
              <span className="w-[7px] h-[7px] rounded-full bg-amber animate-pulse" /> Modifications non enregistrées
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-ink3">
              <CheckCircle2 size={12} /> À jour
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {canManage && (
            <Button variant="outline" size="sm" onClick={onSave} loading={saving} disabled={!dirty}>
              <Save size={12} /> Enregistrer comme brouillon
            </Button>
          )}
          {canStart && (
            <Button variant="primary" size="sm" onClick={onStart}>
              <PlayCircle size={13} /> Commencer la session
            </Button>
          )}
          {canComplete && (
            <Button variant="primary" size="sm" onClick={onComplete} loading={saving}>
              <CheckCircle2 size={13} /> Terminer la session
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

/* =========================================================
   BLOCAGES IDENTIFIÉS
========================================================= */

function BlockersCard({
  blockers, onChange, disabled,
}: {
  blockers: SessionBlocker[]
  onChange: (blockers: SessionBlocker[]) => void
  disabled: boolean
}) {
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [showForm, setShowForm] = useState(false)

  const add = () => {
    if (!title.trim()) return
    onChange([...blockers, { id: newBlockerId(), title: title.trim(), detail: detail.trim() || undefined, resolved: false }])
    setTitle('')
    setDetail('')
    setShowForm(false)
  }

  const toggleResolved = (id: string) =>
    onChange(blockers.map((b) => b.id === id ? { ...b, resolved: !b.resolved, resolvedAt: !b.resolved ? new Date().toISOString() : undefined } : b))

  const remove = (id: string) => onChange(blockers.filter((b) => b.id !== id))

  const unresolved = blockers.filter((b) => !b.resolved).length

  return (
    <Card>
      <CardHeader icon={<AlertTriangle size={13} />} title={`Blocages identifiés (${unresolved} ouvert${unresolved > 1 ? 's' : ''})`}>
        {!disabled && (
          <Button variant="outline" size="sm" onClick={() => setShowForm((v) => !v)}>
            {showForm ? <X size={12} /> : <Plus size={12} />} Blocage
          </Button>
        )}
      </CardHeader>
      <div className="p-[18px] space-y-2">
        <p className="text-[11px] text-ink3">
          Obstacles identifiés pendant la séance. Ils seront repris automatiquement dans
          « Depuis la dernière session » jusqu&apos;à résolution.
        </p>
        {showForm && (
          <div className="border border-border rounded-[10px] p-3 space-y-2 bg-surface-2/50">
            <Field label="Blocage" required>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. Manque de données marché" />
            </Field>
            <Field label="Détail (optionnel)">
              <Textarea value={detail} onChange={(e) => setDetail(e.target.value)} rows={2} />
            </Field>
            <div className="flex justify-end">
              <Button size="sm" variant="primary" onClick={add} disabled={!title.trim()}>
                Ajouter
              </Button>
            </div>
          </div>
        )}
        {blockers.length === 0 && !showForm && (
          <p className="text-[12px] text-ink3">Aucun blocage identifié pour cette session.</p>
        )}
        {blockers.map((b) => (
          <div key={b.id} className={`border rounded-[10px] p-2.5 flex items-start gap-2 ${b.resolved ? 'border-moss/30 bg-moss/[.04]' : 'border-border'}`}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => toggleResolved(b.id)}
              className={`mt-[2px] w-[14px] h-[14px] rounded border shrink-0 cursor-pointer transition-colors ${
                b.resolved ? 'bg-moss border-moss' : 'bg-surface border-border hover:border-moss'
              }`}
              title={b.resolved ? 'Marquer comme non résolu' : 'Marquer comme résolu'}
              aria-label={b.resolved ? 'Marquer comme non résolu' : 'Marquer comme résolu'}
            >
              {b.resolved && <CheckCircle2 size={12} className="text-white -ml-[1px] -mt-[1px]" />}
            </button>
            <div className="flex-1 min-w-0">
              <div className={`text-[12px] font-semibold ${b.resolved ? 'text-ink3 line-through' : 'text-ink'}`}>
                {b.title}
              </div>
              {b.detail && <div className="text-[11px] text-ink3">{b.detail}</div>}
            </div>
            <Badge variant={b.resolved ? 'green' : 'red'}>
              {b.resolved ? 'Résolu' : 'Ouvert'}
            </Badge>
            {!disabled && (
              <button onClick={() => remove(b.id)} className="text-ink3 hover:text-red-600 transition-colors cursor-pointer" aria-label="Supprimer le blocage">
                <X size={13} />
              </button>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

/* =========================================================
   RECOMMANDATIONS DE LA SESSION
========================================================= */

function RecommendationsCard({
  projectId, sessionId, recommendations, onCreated, canManage,
}: {
  projectId: string
  sessionId: string
  recommendations: CoachingRecommendation[]
  onCreated: (rec: CoachingRecommendation) => void
  canManage: boolean
}) {
  const [content, setContent] = useState('')
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = async () => {
    if (!content.trim()) { setError('Le contenu de la recommandation est requis'); return }
    setError(null)
    setCreating(true)
    try {
      const rec = await coachingService.createRecommendation(projectId, {
        content: content.trim(),
        priority,
        sessionId,
      })
      onCreated(rec)
      setContent('')
    } catch (err) {
      setError(apiError(err, 'Erreur lors de la création de la recommandation'))
    } finally {
      setCreating(false)
    }
  }

  return (
    <Card>
      <CardHeader icon={<Lightbulb size={13} />} title={`Recommandations du coach (${recommendations.length})`} />
      <div className="p-[18px] space-y-3">
        <p className="text-[11px] text-ink3">
          Une recommandation est une suggestion du coach — elle devient une décision lorsque le porteur
          l&apos;accepte, puis une action lorsqu&apos;elle est planifiée.
        </p>
        {canManage && (
          <div className="border border-border rounded-[10px] p-3 space-y-2 bg-surface-2/50">
            {error && <ErrorAlert message={error} />}
            <Field label="Recommandation" required>
              <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={2} placeholder="Ex. Tester la vente directe auprès de 20 clients potentiels." />
            </Field>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <Select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
                className="w-[140px]"
              >
                <option value="LOW">Priorité basse</option>
                <option value="MEDIUM">Priorité moyenne</option>
                <option value="HIGH">Priorité haute</option>
              </Select>
              <Button variant="primary" size="sm" onClick={create} loading={creating}>
                <Plus size={12} /> Ajouter
              </Button>
            </div>
          </div>
        )}
        {recommendations.length === 0 && (
          <p className="text-[12px] text-ink3">Aucune recommandation rattachée à cette session.</p>
        )}
        {recommendations.map((r) => (
          <div key={r.id} className="border border-border rounded-[10px] p-3 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={r.priority === 'HIGH' ? 'red' : r.priority === 'MEDIUM' ? 'blue' : 'gray'}>
                {PRIORITY_LABELS[r.priority]}
              </Badge>
              <Badge variant={r.status === 'DONE' ? 'green' : r.status === 'ARCHIVED' ? 'gray' : 'blue'}>
                {r.status === 'DONE' ? 'Réalisée' : r.status === 'IN_PROGRESS' ? 'En cours' : r.status === 'ARCHIVED' ? 'Archivée' : 'Ouverte'}
              </Badge>
              {r.source === 'AI' && <Badge variant="secondary">Issue de l&apos;IA</Badge>}
            </div>
            <p className="text-[12px] text-ink2">{r.content}</p>
            {r.actions && r.actions.length > 0 && (
              <p className="text-[11px] text-ink3 flex items-center gap-1">
                <ChevronRight size={11} /> {r.actions.length} action{r.actions.length > 1 ? 's' : ''} liée{r.actions.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

/* =========================================================
   ACTIONS LIÉES À LA SESSION (+ preuves côté coach)
========================================================= */

function SessionActionsCard({
  projectId, sessionId, actions, canManage, showForm, onToggleForm, onChanged,
  responsableOptions, documents,
}: {
  projectId: string
  sessionId: string
  actions: CoachingAction[]
  canManage: boolean
  showForm: boolean
  onToggleForm: () => void
  onChanged: () => void
  responsableOptions: Array<{ id: string; label: string }>
  documents: GeneratedDocument[]
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')
  const [deadline, setDeadline] = useState('')
  const [responsibleUserId, setResponsibleUserId] = useState('')
  const [relatedDocumentKey, setRelatedDocumentKey] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createAction = async () => {
    if (!title.trim()) { setError("Le titre de l'action est requis"); return }
    setError(null)
    setCreating(true)
    try {
      await coachingService.createAction(projectId, {
        title: title.trim(),
        description: description || undefined,
        priority,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        sessionId,
        responsibleUserId: responsibleUserId || undefined,
        relatedDocumentKey: relatedDocumentKey || undefined,
      })
      setTitle(''); setDescription(''); setDeadline(''); setResponsibleUserId(''); setRelatedDocumentKey('')
      onToggleForm()
      onChanged()
    } catch (err) {
      setError(apiError(err, "Erreur lors de la création de l'action"))
    } finally {
      setCreating(false)
    }
  }

  const openCount = actions.filter((a) => !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(a.status)).length

  return (
    <Card>
      <CardHeader
        icon={<ListTodo size={13} />}
        title={`Actions issues de la session (${actions.length})`}
      >
        <div className="flex items-center gap-2">
          {openCount > 0 && (
            <span className="text-[11px] text-ink3">{openCount} en cours</span>
          )}
          {canManage && (
            <Button variant="primary" size="sm" onClick={onToggleForm}>
              {showForm ? <X size={12} /> : <Plus size={12} />} Nouvelle action
            </Button>
          )}
        </div>
      </CardHeader>
      <div className="p-[18px] space-y-3">
        <p className="text-[11px] text-ink3">
          Chaque action répond à : QUI ? QUOI ? POUR QUAND ? POUR QUEL LIVRABLE ? AVEC QUEL STATUT ?
        </p>
        {showForm && (
          <div className="border border-border rounded-[10px] p-4 space-y-3 bg-surface-2/50">
            {error && <ErrorAlert message={error} />}
            <Field label="Titre" required>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. Réaliser 10 interviews clients" />
            </Field>
            <Field label="Description">
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            </Field>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Field label="Responsable">
                <Select value={responsibleUserId} onChange={(e) => setResponsibleUserId(e.target.value)}>
                  <option value="">— À définir —</option>
                  {responsableOptions.map((o) => (
                    <option key={o.id} value={o.id}>{o.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Livrable concerné">
                <Select value={relatedDocumentKey} onChange={(e) => setRelatedDocumentKey(e.target.value)}>
                  <option value="">— Aucun —</option>
                  {[...documents].sort((a, b) => a.title.localeCompare(b.title)).map((d) => (
                    <option key={d.key} value={d.key}>{d.title}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Priorité">
                <Select value={priority} onChange={(e) => setPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}>
                  <option value="LOW">Basse</option>
                  <option value="MEDIUM">Moyenne</option>
                  <option value="HIGH">Haute</option>
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Échéance">
                <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
              </Field>
            </div>
            <div className="flex justify-end">
              <Button variant="primary" size="sm" onClick={createAction} loading={creating}>
                Créer l&apos;action
              </Button>
            </div>
          </div>
        )}

        {actions.length === 0 && !showForm && (
          <p className="text-[12px] text-ink3">
            Aucune action rattachée à cette session. Créez les actions convenues avec le porteur.
          </p>
        )}

        {actions.map((a) => (
          <CoachActionRow key={a.id} action={a} canManage={canManage} onChanged={onChanged} documentTitle={
            a.related_document_key ? documents.find((d) => d.key === a.related_document_key)?.title : undefined
          } />
        ))}
      </div>
    </Card>
  )
}

/** Ligne d'action côté coach : statut modifiable + revue des preuves soumises. */
export function CoachActionRow({
  action, canManage, onChanged, documentTitle,
}: {
  action: CoachingAction
  canManage: boolean
  onChanged: () => void
  documentTitle?: string
}) {
  const [open, setOpen] = useState(false)
  const [evidences, setEvidences] = useState<ActionEvidence[] | null>(null)
  const [comment, setComment] = useState('')
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const responsibleName = action.responsibleUser?.profile
    ? `${action.responsibleUser.profile.first_name} ${action.responsibleUser.profile.last_name}`
    : action.responsibleUser?.email

  const overdue =
    !!action.deadline &&
    new Date(action.deadline).getTime() < Date.now() &&
    !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(action.status)

  const loadEvidences = async () => {
    try {
      const list = await coachingService.getEvidences(action.id)
      setEvidences(list)
    } catch {
      setEvidences([])
    }
  }

  const toggle = async () => {
    const next = !open
    setOpen(next)
    if (next && evidences === null) await loadEvidences()
  }

  const review = async (evidenceId: string, status: 'APPROVED' | 'REJECTED') => {
    setReviewingId(evidenceId)
    setError(null)
    try {
      await coachingService.reviewEvidence(evidenceId, { status, comment: comment || undefined })
      setComment('')
      await loadEvidences()
      onChanged()
    } catch (err) {
      setError(apiError(err, 'La revue de la preuve a échoué'))
    } finally {
      setReviewingId(null)
    }
  }

  const setStatus = async (status: string) => {
    setError(null)
    try {
      await coachingService.updateAction(action.id, { status })
      onChanged()
    } catch (err) {
      setError(apiError(err, 'La mise à jour du statut a échoué'))
    }
  }

  return (
    <div className={`border rounded-[10px] p-3 space-y-2 ${overdue ? 'border-red-300 bg-red-50/[.4]' : 'border-border'}`}>
      <div className="flex items-start gap-2 flex-wrap">
        <span className="text-[12px] font-semibold text-ink flex-1 min-w-0">{action.title}</span>
        <Badge variant={action.priority === 'HIGH' ? 'red' : action.priority === 'MEDIUM' ? 'blue' : 'gray'}>
          {PRIORITY_LABELS[action.priority]}
        </Badge>
        <Badge variant={ACTION_STATUS_COLORS[action.status]}>{ACTION_STATUS_LABELS[action.status]}</Badge>
        {overdue && <Badge variant="red">En retard</Badge>}
        {canManage && (
          <Select
            className="w-[140px] !py-[4px] !text-[11px]"
            value={action.status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {['PENDING', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED', 'REJECTED'].map((s) => (
              <option key={s} value={s}>{ACTION_STATUS_LABELS[s as keyof typeof ACTION_STATUS_LABELS]}</option>
            ))}
          </Select>
        )}
      </div>
      <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-[11px] text-ink3">
        <span><span className="font-semibold text-ink2">Responsable :</span> {responsibleName ?? 'Non défini'}</span>
        {action.deadline && <span><span className="font-semibold text-ink2">Échéance :</span> {formatDate(action.deadline)}</span>}
        {(documentTitle || action.related_document_key) && (
          <span><span className="font-semibold text-ink2">Livrable :</span> {documentTitle ?? action.related_document_key}</span>
        )}
        {action.assignment?.expertUser && !responsibleName && (
          <span><span className="font-semibold text-ink2">Expert :</span> {action.assignment.expertUser.email}</span>
        )}
      </div>
      {action.description && <p className="text-[11px] text-ink2">{action.description}</p>}
      <button onClick={toggle} className="flex items-center gap-1 text-[11px] text-ink3 hover:text-moss transition-colors cursor-pointer">
        <Paperclip size={11} /> Preuves ({evidences?.length ?? '…'})
      </button>
      {open && (
        <div className="space-y-2 pt-1">
          {error && <ErrorAlert message={error} />}
          {(evidences ?? []).map((ev) => (
            <div key={ev.id} className="bg-surface border border-border rounded-lg p-2.5 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="gray">{ev.type}</Badge>
                {ev.title && <span className="text-[11px] font-semibold text-ink">{ev.title}</span>}
                <Badge variant={ev.review_status === 'APPROVED' ? 'green' : ev.review_status === 'REJECTED' ? 'red' : 'amber'}>
                  {ev.review_status === 'APPROVED' ? 'Validée' : ev.review_status === 'REJECTED' ? 'Refusée' : 'En attente'}
                </Badge>
              </div>
              {ev.url && (
                <a href={ev.url} target="_blank" rel="noreferrer" className="text-[11px] text-blue-600 underline break-all">
                  {ev.url}
                </a>
              )}
              {ev.content && <p className="text-[11px] text-ink2 whitespace-pre-wrap">{ev.content}</p>}
              {ev.coach_comment && <p className="text-[11px] text-ink3 italic">Commentaire : {ev.coach_comment}</p>}
              {ev.review_status === 'PENDING' && canManage && (
                <div className="flex gap-2 items-center pt-1">
                  <Input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Commentaire (optionnel)"
                    className="!py-[4px] !text-[11px] flex-1"
                  />
                  <Button size="sm" variant="primary" disabled={reviewingId !== null} onClick={() => review(ev.id, 'APPROVED')}>
                    <ShieldCheck size={11} /> Accepter
                  </Button>
                  <Button size="sm" variant="outline" disabled={reviewingId !== null} onClick={() => review(ev.id, 'REJECTED')}>
                    Refuser
                  </Button>
                </div>
              )}
            </div>
          ))}
          {evidences !== null && evidences.length === 0 && (
            <p className="text-[11px] text-ink3">Aucune preuve soumise pour cette action.</p>
          )}
        </div>
      )}
    </div>
  )
}

/* =========================================================
   PROCHAINE ÉTAPE (clôture)
========================================================= */

function NextStepCard({
  projectId, nextSession, progress,
}: {
  projectId: string
  nextSession: CoachingSession | null
  progress: GbmProgress | null
}) {
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader icon={<PlayCircle size={13} />} title="Prochaine étape" />
        <div className="p-[18px] space-y-3">
          {nextSession ? (
            <>
              <div className="border border-border rounded-[10px] p-3 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[12px] font-bold text-ink">
                    Prochaine session : {formatDateTime(nextSession.scheduled_at)}
                  </span>
                  <Badge variant={COACHING_SESSION_STATUS_COLORS[nextSession.status]}>
                    {COACHING_SESSION_STATUS_LABELS[nextSession.status]}
                  </Badge>
                </div>
                {nextSession.title && <p className="text-[12px] text-ink2">{nextSession.title}</p>}
                {nextSession.objective && (
                  <p className="text-[12px] text-ink3 flex items-start gap-1.5">
                    <Target size={12} className="text-moss mt-[2px] shrink-0" />
                    {nextSession.objective}
                  </p>
                )}
                <Link
                  href={`/dashboard/expert/coaching/${projectId}/sessions/${nextSession.id}`}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-moss hover:underline"
                >
                  Ouvrir la session <ChevronRight size={11} />
                </Link>
              </div>
            </>
          ) : (
            <p className="text-[12px] text-ink3">
              Aucune session suivante planifiée. Planifiez la prochaine séance depuis le suivi du projet
              pour entretenir la boucle de coaching.
            </p>
          )}
          {!nextSession && (
            <Link href={`/dashboard/expert/coaching/${projectId}`} className="inline-flex">
              <Button variant="outline" size="sm">
                Planifier une session <ChevronRight size={12} />
              </Button>
            </Link>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader icon={<Flag size={13} />} title="Progression globale du projet" />
        <div className="p-[18px] space-y-2">
          <p className="text-[11px] text-ink3">
            Indicateur global (parcours GBM) — partagé avec toutes les sessions du projet.
          </p>
          <div className="flex items-baseline gap-2">
            <span className="font-syne text-[24px] font-extrabold text-ink">{progress?.percentage ?? 0}%</span>
            <span className="text-[11px] text-ink3">du parcours GBM complété</span>
          </div>
          {progress?.phases?.map((ph) => (
            <div key={ph.phase} className="flex items-center gap-2 text-[11px] text-ink2">
              <span className="w-[70px] shrink-0">Phase {ph.phase}</span>
              <div className="flex-1 h-[6px] bg-border rounded-full overflow-hidden">
                <div className="h-full bg-moss rounded-full" style={{ width: `${Math.round((ph.completed / Math.max(ph.total, 1)) * 100)}%` }} />
              </div>
              <span className="w-[36px] text-right text-ink3">{ph.completed}/{ph.total}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function StatMini({ num, label, tone }: { num: string | number; label: string; tone?: 'green' | 'amber' | 'red' }) {
  const color = tone === 'green' ? 'text-moss' : tone === 'amber' ? 'text-amber' : tone === 'red' ? 'text-red-600' : 'text-ink'
  return (
    <div className="border border-border rounded-[10px] p-2.5">
      <div className={`font-syne text-[16px] font-extrabold ${color}`}>{num}</div>
      <div className="text-[10px] text-ink3 leading-tight">{label}</div>
    </div>
  )
}

function SessionBackNote() {
  return (
    <Link href="/dashboard/expert/coachings" className="inline-flex items-center gap-1 text-[11px] text-ink3 hover:text-moss transition-colors">
      <ArrowLeft size={12} /> Retour aux coachings
    </Link>
  )
}

// Lien retour utilisé par la page hôte
export function SessionBackLink({ href }: { href: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-[11px] text-ink3 hover:text-moss transition-colors">
      <ArrowLeft size={12} /> Retour au suivi coaching
    </Link>
  )
}

/* =========================================================
   LISTE DU BRIEF
========================================================= */

function BriefList({ title, items, tone }: { title: string; items: string[]; tone: 'green' | 'amber' | 'blue' }) {
  const dot = tone === 'green' ? 'text-moss' : tone === 'amber' ? 'text-amber' : 'text-blue-600'
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-ink3 mb-1.5 flex items-center gap-1.5">
        {tone === 'green' ? <CheckCircle2 size={12} /> : tone === 'amber' ? <MessageSquareQuote size={12} /> : <Lightbulb size={12} />}
        {title}
      </div>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.slice(0, 40)} className="text-[12px] text-ink2 flex gap-2">
            <span className={dot}>•</span>{item}
          </li>
        ))}
      </ul>
    </div>
  )
}
