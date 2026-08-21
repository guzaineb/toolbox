'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Sparkles, ClipboardList, FileText, CheckCircle2, PlayCircle,
  ListTodo, Lightbulb, MessageSquareQuote, Plus, X, Paperclip, ShieldCheck,
} from 'lucide-react'
import {
  Badge, Button, Card, CardHeader, ErrorAlert, Field, Input,
  Select, Textarea,
} from '@/components/shared/ui'
import { coachingService } from '@/services/coaching.service'
import { MaturityCard } from '@/components/coaching/MaturityCard'
import { useAuth } from '@/hooks/useAuth'
import {
  CoachingSession, CoachingAction, ActionEvidence,
  COACHING_SESSION_STATUS_LABELS, COACHING_SESSION_STATUS_COLORS,
  ACTION_STATUS_LABELS, ACTION_STATUS_COLORS, PRIORITY_LABELS,
} from '@/types/coaching'
import { CoachingBriefPayload, SessionSummaryPayload } from '@/types/ai-analysis'
import { getErrorMessage } from '@/lib/utils'

function apiError(err: unknown, fallback: string): string {
  return getErrorMessage(err) || fallback
}

function formatDateTime(value?: string): string {
  if (!value) return '—'
  return new Date(value).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })
}

type EvidenceDraft = { type: 'LINK' | 'TEXT' | 'DOCUMENT' | 'RESULT'; title: string; content: string; url: string }

/**
 * Workspace de session de coaching — l'IA prépare le brief et propose un
 * résumé, le coach garde la main sur chaque contenu (notes, décisions,
 * recommandations, actions). Rien n'est enregistré automatiquement.
 *
 * Le mode gestion (notes, brief, actions…) est réservé au coach assigné ;
 * les autres lecteurs autorisés voient la session en lecture seule.
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const canManage =
    !!session && !!user && session.assignment?.expert_user_id === user.id

  // Brief IA (proposition, jamais persistée comme décision)
  const [brief, setBrief] = useState<CoachingBriefPayload | null>(null)
  const [briefLoading, setBriefLoading] = useState(false)

  // Notes / décisions / agenda
  const [notes, setNotes] = useState('')
  const [decisions, setDecisions] = useState('')
  const [objective, setObjective] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  // Résumé IA → édition coach → sauvegarde explicite
  const [summaryDraft, setSummaryDraft] = useState('')
  const [nextObjectivesDraft, setNextObjectivesDraft] = useState('')
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [savingSummary, setSavingSummary] = useState(false)

  // Nouvelle action liée à la session
  const [showActionForm, setShowActionForm] = useState(false)

  const loadActions = useCallback(() => {
    coachingService
      .getProjectActions(projectId)
      .then((all) => setActions(all.filter((a) => a.session?.id === sessionId)))
      .catch(() => undefined)
  }, [projectId, sessionId])

  useEffect(() => {
    if (!sessionId) return
    setLoading(true)
    Promise.all([coachingService.getSession(sessionId), coachingService.getProjectActions(projectId)])
      .then(([s, all]) => {
        setSession(s)
        setNotes(s.notes ?? '')
        setDecisions(s.decisions ?? '')
        setObjective(s.objective ?? '')
        setSummaryDraft(s.summary ?? '')
        setNextObjectivesDraft(s.next_objectives ?? '')
        setActions(all.filter((a) => a.session?.id === sessionId))
      })
      .catch((err) => setError(apiError(err, 'Erreur de chargement de la session')))
      .finally(() => setLoading(false))
  }, [projectId, sessionId])

  const refreshSession = async () => {
    try {
      const s = await coachingService.getSession(sessionId)
      setSession(s)
    } catch { /* ignore */ }
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

  const saveNotes = async () => {
    setSavingNotes(true)
    setError(null)
    try {
      await coachingService.updateSession(sessionId, { notes, decisions, objective })
      await refreshSession()
    } catch (err) {
      setError(apiError(err, 'La sauvegarde des notes a échoué'))
    } finally {
      setSavingNotes(false)
    }
  }

  const generateSummary = async () => {
    setError(null)
    setSummaryLoading(true)
    try {
      const res = await coachingService.aiSessionSummary(sessionId)
      const data = res.data as SessionSummaryPayload | null
      if (res.success && data) {
        // Proposition affichée dans les champs éditables : rien n'est sauvegardé sans validation du coach
        setSummaryDraft(data.summary)
        setNextObjectivesDraft(data.nextObjectives.join('\n'))
      } else {
        setError("Le résumé IA est indisponible — vérifiez que les notes de session sont renseignées.")
      }
    } catch (err) {
      setError(apiError(err, 'La génération du résumé a échoué'))
    } finally {
      setSummaryLoading(false)
    }
  }

  const saveSummary = async () => {
    setSavingSummary(true)
    setError(null)
    try {
      await coachingService.updateSession(sessionId, { summary: summaryDraft, nextObjectives: nextObjectivesDraft })
      await refreshSession()
    } catch (err) {
      setError(apiError(err, 'La sauvegarde du résumé a échoué'))
    } finally {
      setSavingSummary(false)
    }
  }

  const startSession = async () => {
    setError(null)
    try {
      await coachingService.startSession(sessionId)
      await refreshSession()
    } catch (err) {
      setError(apiError(err, 'Le démarrage de la session a échoué'))
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-72 bg-border rounded" />
        <div className="h-40 bg-border rounded-[14px]" />
        <div className="h-64 bg-border rounded-[14px]" />
      </div>
    )
  }

  if (!session) {
    return <ErrorAlert message={error ?? 'Session introuvable'} />
  }

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
            {session.assignment?.expertUser?.profile &&
              ` · Coach : ${session.assignment.expertUser.profile.first_name} ${session.assignment.expertUser.profile.last_name}`}
          </div>
        </div>
        {canManage && session.status === 'SCHEDULED' && (
          <Button variant="primary" size="sm" onClick={startSession}>
            <PlayCircle size={13} /> Démarrer la session
          </Button>
        )}
      </div>

      {error && <ErrorAlert message={error} />}

      {/* ===== BRIEF IA ===== */}
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
              Le brief IA synthétise le contexte projet (évaluations, plan d'amélioration, actions,
              sessions précédentes) pour préparer votre séance. Simple proposition : vous choisissez
              ce que vous retenez.
            </p>
          )}
          {brief && (
            <>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-ink3 mb-1">Objectif proposé</div>
                <p className="text-[13px] text-ink">{brief.objective}</p>
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

      <div className="grid lg:grid-cols-2 gap-5">
        {/* ===== CONTEXTE PROJET ===== */}
        <MaturityCard projectId={projectId} />

        {/* ===== NOTES DE SESSION ===== */}
        <Card>
          <CardHeader icon={<ClipboardList size={13} />} title="Notes & décisions">
            {canManage && (
              <Button variant="primary" size="sm" onClick={saveNotes} loading={savingNotes}>
                Enregistrer
              </Button>
            )}
          </CardHeader>
          <div className="p-[18px] space-y-3">
            <Field label="Objectif de la session">
              <Input
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                disabled={!canManage}
                placeholder="Ex. Valider la stratégie de prix"
              />
            </Field>
            <Field label="Notes prises pendant la séance">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
                disabled={!canManage}
                placeholder="Ce qui a été dit, remontées du porteur, observations…"
              />
            </Field>
            <Field label="Décisions arrêtées">
              <Textarea
                value={decisions}
                onChange={(e) => setDecisions(e.target.value)}
                rows={3}
                disabled={!canManage}
                placeholder="Une décision par ligne"
              />
            </Field>
          </div>
        </Card>
      </div>

      {/* ===== ACTIONS DE LA SESSION ===== */}
      <SessionActionsCard
        projectId={projectId}
        sessionId={sessionId}
        actions={actions}
        canManage={canManage}
        showForm={showActionForm}
        onToggleForm={() => setShowActionForm((v) => !v)}
        onChanged={loadActions}
      />

      {/* ===== RÉSUMÉ (IA propose, coach édite et sauvegarde) ===== */}
      <Card>
        <CardHeader icon={<FileText size={13} />} title="Résumé de fin de session">
          <div className="flex gap-2">
            {canManage && (
              <>
                <Button variant="outline" size="sm" onClick={generateSummary} disabled={summaryLoading}>
                  <Sparkles size={12} className={summaryLoading ? 'animate-pulse' : ''} />
                  {summaryLoading ? 'Génération…' : 'Proposer un résumé (IA)'}
                </Button>
                <Button variant="primary" size="sm" onClick={saveSummary} loading={savingSummary}>
                  Sauvegarder
                </Button>
              </>
            )}
          </div>
        </CardHeader>
        <div className="p-[18px] space-y-3">
          <p className="text-[11px] text-ink3">
            La proposition IA s'appuie sur vos notes, décisions et actions créées. Éditez-la avant de
            sauvegarder : le texte enregistré engage le coach, pas l'IA.
          </p>
          <Field label="Résumé">
            <Textarea
              value={summaryDraft}
              onChange={(e) => setSummaryDraft(e.target.value)}
              rows={5}
              disabled={!canManage}
            />
          </Field>
          <Field label="Objectifs pour la prochaine session (un par ligne)">
            <Textarea
              value={nextObjectivesDraft}
              onChange={(e) => setNextObjectivesDraft(e.target.value)}
              rows={3}
              disabled={!canManage}
            />
          </Field>
        </div>
      </Card>
    </div>
  )
}

/* =========================================================
   ACTIONS LIÉES À LA SESSION (+ preuves côté coach)
========================================================= */

function SessionActionsCard({
  projectId, sessionId, actions, canManage, showForm, onToggleForm, onChanged,
}: {
  projectId: string
  sessionId: string
  actions: CoachingAction[]
  canManage: boolean
  showForm: boolean
  onToggleForm: () => void
  onChanged: () => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')
  const [deadline, setDeadline] = useState('')
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
      })
      setTitle(''); setDescription(''); setDeadline('')
      onToggleForm()
      onChanged()
    } catch (err) {
      setError(apiError(err, "Erreur lors de la création de l'action"))
    } finally {
      setCreating(false)
    }
  }

  return (
    <Card>
      <CardHeader icon={<ListTodo size={13} />} title={`Actions issues de la session (${actions.length})`}>
        {canManage && (
          <Button variant="primary" size="sm" onClick={onToggleForm}>
            {showForm ? <X size={12} /> : <Plus size={12} />} Nouvelle action
          </Button>
        )}
      </CardHeader>
      <div className="p-[18px] space-y-3">
        {showForm && (
          <div className="border border-border rounded-[10px] p-4 space-y-3 bg-surface-2/50">
            <Field label="Titre" required>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. Tester 3 options de prix" />
            </Field>
            <Field label="Description">
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Priorité">
                <Select value={priority} onChange={(e) => setPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}>
                  <option value="LOW">Basse</option>
                  <option value="MEDIUM">Moyenne</option>
                  <option value="HIGH">Haute</option>
                </Select>
              </Field>
              <Field label="Échéance">
                <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
              </Field>
            </div>
            <div className="flex justify-end">
              <Button variant="primary" size="sm" onClick={createAction} loading={creating}>
                Créer l'action
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
          <CoachActionRow key={a.id} action={a} canManage={canManage} onChanged={onChanged} />
        ))}
      </div>
    </Card>
  )
}

/** Ligne d'action côté coach : statut modifiable + revue des preuves soumises. */
export function CoachActionRow({
  action, canManage, onChanged,
}: {
  action: CoachingAction
  canManage: boolean
  onChanged: () => void
}) {
  const [open, setOpen] = useState(false)
  const [evidences, setEvidences] = useState<ActionEvidence[] | null>(null)
  const [comment, setComment] = useState('')
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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
    <div className="border border-border rounded-[10px] p-3 space-y-2">
      <div className="flex items-start gap-2 flex-wrap">
        <span className="text-[12px] font-semibold text-ink flex-1 min-w-0">{action.title}</span>
        <Badge variant={action.priority === 'HIGH' ? 'red' : action.priority === 'MEDIUM' ? 'blue' : 'gray'}>
          {PRIORITY_LABELS[action.priority]}
        </Badge>
        <Badge variant={ACTION_STATUS_COLORS[action.status]}>{ACTION_STATUS_LABELS[action.status]}</Badge>
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

// Lien retour utilisé par la page hôte
export function SessionBackLink({ href }: { href: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-[11px] text-ink3 hover:text-moss transition-colors">
      <ArrowLeft size={12} /> Retour au suivi coaching
    </Link>
  )
}
