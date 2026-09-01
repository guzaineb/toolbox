'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  CalendarClock, CheckCircle2, MessageSquare, Plus, X, Lightbulb, ListTodo,
  ExternalLink, Paperclip,
} from 'lucide-react'
import { Badge, Button, Card, CardHeader, ErrorAlert, Field, Input, Select, Textarea } from '@/components/shared/ui'
import { coachingService } from '@/services/coaching.service'
import {
  CoachingSession, CoachingAction, CoachingRecommendation, ActionEvidence,
  COACHING_SESSION_STATUS_LABELS, COACHING_SESSION_STATUS_COLORS,
  ACTION_STATUS_LABELS, ACTION_STATUS_COLORS,
  PRIORITY_LABELS, RECOMMENDATION_STATUS_LABELS,
  CoachingActionStatus,
} from '@/types/coaching'
import { getErrorMessage } from '@/lib/utils'

const STATUS_OPTIONS: CoachingActionStatus[] = ['PENDING', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED', 'REJECTED', 'CANCELLED']

const SESSION_TYPE_OPTIONS = [
  { value: 'SUIVI', label: 'Suivi' },
  { value: 'DIAGNOSTIC', label: 'Diagnostic' },
  { value: 'TRAVAIL', label: 'Travail' },
  { value: 'VALIDATION', label: 'Validation' },
  { value: 'FINANCEMENT', label: 'Financement' },
  { value: 'STRATEGIE', label: 'Stratégie' },
  { value: 'AUTRE', label: 'Autre' },
]

function apiError(err: unknown, fallback: string): string {
  return getErrorMessage(err) || fallback
}

function formatDate(value?: string): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('fr-FR')
}

function formatDateTime(value?: string): string {
  if (!value) return '—'
  return new Date(value).toLocaleString('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MODALE : NOUVELLE SESSION
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export function AddSessionModal({
  projectId, onClose, onSuccess,
}: {
  projectId: string; onClose: () => void; onSuccess: () => void
}) {
  const [scheduledAt, setScheduledAt] = useState('')
  const [duration, setDuration] = useState('60')
  const [title, setTitle] = useState('')
  const [sessionType, setSessionType] = useState('')
  const [objective, setObjective] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!scheduledAt) { setError('La date de la session est requise'); return }
    setError(null)
    setLoading(true)
    try {
      await coachingService.createSession(projectId, {
        title: title || undefined,
        sessionType: sessionType || undefined,
        objective: objective || undefined,
        scheduledAt: new Date(scheduledAt).toISOString(),
        durationMinutes: parseInt(duration, 10) || undefined,
      })
      onSuccess()
      onClose()
    } catch (err) {
      setError(apiError(err, 'Erreur lors de la crÃ©ation de la session'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-6 z-50" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <Card className="w-full max-w-[480px] p-0 overflow-hidden shadow-lg">
        <CardHeader icon={<CalendarClock size={15} />} title="Planifier une session">
          <Button size="sm" variant="ghost" onClick={onClose}><X size={16} /></Button>
        </CardHeader>
        <div className="p-6">
          {error && <div className="mb-5"><ErrorAlert message={error} /></div>}
          <Field label="Titre">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. Validation du Business Model" />
          </Field>
          <Field label="Type de session">
            <Select value={sessionType} onChange={(e) => setSessionType(e.target.value)}>
              <option value="">— Choisir un type —</option>
              {SESSION_TYPE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Date et heure" required>
            <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
          </Field>
          <Field label="Durée (minutes)">
            <Input type="number" min={5} max={480} value={duration} onChange={(e) => setDuration(e.target.value)} />
          </Field>
          <Field label="Objectif">
            <Textarea value={objective} onChange={(e) => setObjective(e.target.value)} rows={2} placeholder="Ex. Vérifier la cohérence du Business Model" />
          </Field>
          <div className="flex gap-3 mt-6">
            <Button className="flex-1" onClick={onClose}>Annuler</Button>
            <Button variant="primary" className="flex-1" loading={loading} onClick={handleSubmit}>CrÃ©er</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MODALE : TERMINER UNE SESSION
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export function CompleteSessionModal({
  session, onClose, onSuccess,
}: {
  session: CoachingSession; onClose: () => void; onSuccess: () => void
}) {
  const [report, setReport] = useState(session.report || '')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError(null)
    setLoading(true)
    try {
      await coachingService.completeSession(session.id, report || undefined)
      onSuccess()
      onClose()
    } catch (err) {
      setError(apiError(err, 'Erreur lors de la clÃ´ture de la session'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-6 z-50" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <Card className="w-full max-w-[480px] p-0 overflow-hidden shadow-lg">
        <CardHeader icon={<CheckCircle2 size={15} />} title="Terminer la session">
          <Button size="sm" variant="ghost" onClick={onClose}><X size={16} /></Button>
        </CardHeader>
        <div className="p-6">
          {error && <div className="mb-5"><ErrorAlert message={error} /></div>}
          <Field label="Compte-rendu">
            <Textarea value={report} onChange={(e) => setReport(e.target.value)} rows={5} placeholder="Points abordÃ©s, dÃ©cisions, prochaines Ã©tapes..." />
          </Field>
          <div className="flex gap-3 mt-6">
            <Button className="flex-1" onClick={onClose}>Annuler</Button>
            <Button variant="primary" className="flex-1" loading={loading} onClick={handleSubmit}>Valider</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MODALE : NOUVELLE ACTION
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export function AddActionModal({
  projectId, onClose, onSuccess,
}: {
  projectId: string; onClose: () => void; onSuccess: () => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')
  const [deadline, setDeadline] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim()) { setError("Le titre de l'action est requis"); return }
    setError(null)
    setLoading(true)
    try {
      await coachingService.createAction(projectId, {
        title: title.trim(),
        description: description || undefined,
        priority,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
      })
      onSuccess()
      onClose()
    } catch (err) {
      setError(apiError(err, "Erreur lors de la crÃ©ation de l'action"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-6 z-50" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <Card className="w-full max-w-[480px] p-0 overflow-hidden shadow-lg">
        <CardHeader icon={<ListTodo size={15} />} title="Nouvelle action">
          <Button size="sm" variant="ghost" onClick={onClose}><X size={16} /></Button>
        </CardHeader>
        <div className="p-6">
          {error && <div className="mb-5"><ErrorAlert message={error} /></div>}
          <Field label="Titre" required>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. PrÃ©parer le pitch de 5 minutes" />
          </Field>
          <Field label="Description">
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </Field>
          <Field label="PrioritÃ©">
            <Select value={priority} onChange={(e) => setPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}>
              <option value="LOW">Basse</option>
              <option value="MEDIUM">Moyenne</option>
              <option value="HIGH">Haute</option>
            </Select>
          </Field>
          <Field label="Ã‰chÃ©ance">
            <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </Field>
          <div className="flex gap-3 mt-6">
            <Button className="flex-1" onClick={onClose}>Annuler</Button>
            <Button variant="primary" className="flex-1" loading={loading} onClick={handleSubmit}>CrÃ©er</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MODALE : NOUVELLE RECOMMANDATION
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export function AddRecommendationModal({
  projectId, onClose, onSuccess,
}: {
  projectId: string; onClose: () => void; onSuccess: () => void
}) {
  const [content, setContent] = useState('')
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim()) { setError('Le contenu de la recommandation est requis'); return }
    setError(null)
    setLoading(true)
    try {
      await coachingService.createRecommendation(projectId, { content: content.trim(), priority })
      onSuccess()
      onClose()
    } catch (err) {
      setError(apiError(err, 'Erreur lors de la crÃ©ation de la recommandation'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-6 z-50" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <Card className="w-full max-w-[480px] p-0 overflow-hidden shadow-lg">
        <CardHeader icon={<Lightbulb size={15} />} title="Nouvelle recommandation">
          <Button size="sm" variant="ghost" onClick={onClose}><X size={16} /></Button>
        </CardHeader>
        <div className="p-6">
          {error && <div className="mb-5"><ErrorAlert message={error} /></div>}
          <Field label="Contenu" required>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} placeholder="Recommandation concrÃ¨te pour le projet..." />
          </Field>
          <Field label="PrioritÃ©">
            <Select value={priority} onChange={(e) => setPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}>
              <option value="LOW">Basse</option>
              <option value="MEDIUM">Moyenne</option>
              <option value="HIGH">Haute</option>
            </Select>
          </Field>
          <div className="flex gap-3 mt-6">
            <Button className="flex-1" onClick={onClose}>Annuler</Button>
            <Button variant="primary" className="flex-1" loading={loading} onClick={handleSubmit}>CrÃ©er</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   PANNEAU : SESSIONS
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export function SessionsPanel({
  projectId, sessions, canManage, onRefresh, sessionHref,
}: {
  projectId: string; sessions: CoachingSession[]; canManage: boolean; onRefresh: () => void
  /** Si fourni, chaque session devient ouvrable dans son workspace (ex. coach). */
  sessionHref?: (sessionId: string) => string
}) {
  const [showCreate, setShowCreate] = useState(false)
  const [completing, setCompleting] = useState<CoachingSession | null>(null)
  const [openComments, setOpenComments] = useState<string | null>(null)
  const [comments, setComments] = useState<Record<string, Array<{ id: string; content: string; created_at: string; author?: { profile?: { first_name?: string; last_name?: string } } }>>>({})
  const [commentText, setCommentText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const loadComments = async (sessionId: string) => {
    try {
      const data = await coachingService.getSessionComments(sessionId)
      setComments((prev) => ({ ...prev, [sessionId]: data }))
    } catch { /* ignore */ }
  }

  const toggleComments = async (sessionId: string) => {
    if (openComments === sessionId) { setOpenComments(null); return }
    setOpenComments(sessionId)
    await loadComments(sessionId)
  }

  const addComment = async (sessionId: string) => {
    if (!commentText.trim()) return
    setError(null)
    try {
      await coachingService.addSessionComment(sessionId, { content: commentText.trim() })
      setCommentText('')
      await loadComments(sessionId)
    } catch (err) {
      setError(apiError(err, 'Erreur lors de lâ€™ajout du commentaire'))
    }
  }

  return (
    <div className="space-y-[8px]">
      {showCreate && <AddSessionModal projectId={projectId} onClose={() => setShowCreate(false)} onSuccess={onRefresh} />}
      {completing && <CompleteSessionModal session={completing} onClose={() => setCompleting(null)} onSuccess={onRefresh} />}
      {error && <div className="mb-2"><ErrorAlert message={error} /></div>}

      <div className="flex items-center justify-between">
        <div className="text-[11px] text-ink3">{sessions.length} session(s)</div>
        {canManage && (
          <Button size="sm" variant="primary" onClick={() => setShowCreate(true)}>
            <Plus size={12} /> Planifier
          </Button>
        )}
      </div>

      {sessions.length === 0 ? (
        <Card className="text-center py-8">
          <CalendarClock size={24} className="mx-auto text-ink3 mb-2" />
          <p className="text-[12px] text-ink3">Aucune session planifiÃ©e</p>
        </Card>
      ) : (
        sessions.map((s) => (
          <Card key={s.id} className="p-[14px_16px]">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13px] font-semibold text-ink">{s.title || 'Session de coaching'}</span>
                  <Badge variant={COACHING_SESSION_STATUS_COLORS[s.status]}>{COACHING_SESSION_STATUS_LABELS[s.status]}</Badge>
                </div>
                <div className="text-[11px] text-ink3 mt-1">
                  {formatDateTime(s.scheduled_at)}
                  {s.duration_minutes ? ` Â· ${s.duration_minutes} min` : ''}
                  {s.assignment?.expertUser?.profile
                    ? ` Â· ${s.assignment.expertUser.profile.first_name} ${s.assignment.expertUser.profile.last_name}`
                    : ''}
                </div>
                {s.report && (
                  <div className="text-[12px] text-ink2 bg-surface border border-border rounded-lg p-3 mt-2 leading-relaxed whitespace-pre-wrap">
                    {s.report}
                  </div>
                )}
              </div>
              {canManage && s.status === 'SCHEDULED' && (
                <Button size="sm" variant="outline" onClick={() => setCompleting(s)}>
                  <CheckCircle2 size={13} /> Terminer
                </Button>
              )}
              {sessionHref && (
                <Link href={sessionHref(s.id)}>
                  <Button size="sm" variant="outline">
                    <ExternalLink size={12} /> Ouvrir
                  </Button>
                </Link>
              )}
            </div>
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => toggleComments(s.id)}
                className="flex items-center gap-1 text-[11px] text-ink3 hover:text-moss transition-colors cursor-pointer"
              >
                <MessageSquare size={11} /> Commentaires
              </button>
            </div>
            {openComments === s.id && (
              <div className="mt-2 border-t border-border pt-2 space-y-2">
                {(comments[s.id] || []).map((c) => (
                  <div key={c.id} className="text-[12px] text-ink2 bg-surface rounded-lg p-2">
                    <span className="font-semibold text-ink3">
                      {c.author?.profile ? `${c.author.profile.first_name} ${c.author.profile.last_name}` : '—'} · {formatDate(c.created_at)}
                    </span>
                    <div className="mt-1">{c.content}</div>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Ajouter un commentaire..."
                    onKeyDown={(e) => { if (e.key === 'Enter') addComment(s.id) }}
                  />
                  <Button size="sm" onClick={() => addComment(s.id)}>Envoyer</Button>
                </div>
              </div>
            )}
          </Card>
        ))
      )}
    </div>
  )
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   PANNEAU : ACTIONS
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export function ActionsPanel({
  projectId, actions, canManage, onRefresh, isOwner,
}: {
  projectId: string; actions: CoachingAction[]; canManage: boolean; onRefresh: () => void
  /** Porteur du projet : peut suivre ses actions et soumettre des preuves. */
  isOwner?: boolean
}) {
  const [showCreate, setShowCreate] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateStatus = async (id: string, status: string) => {
    setUpdating(true)
    setError(null)
    try {
      await coachingService.updateAction(id, { status })
      onRefresh()
    } catch (err) {
      setError(apiError(err, 'Erreur lors de la mise Ã  jour'))
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="space-y-[8px]">
      {showCreate && <AddActionModal projectId={projectId} onClose={() => setShowCreate(false)} onSuccess={onRefresh} />}
      {error && <div className="mb-2"><ErrorAlert message={error} /></div>}

      <div className="flex items-center justify-between">
        <div className="text-[11px] text-ink3">{actions.length} action(s)</div>
        {canManage && (
          <Button size="sm" variant="primary" onClick={() => setShowCreate(true)}>
            <Plus size={12} /> Nouvelle action
          </Button>
        )}
      </div>

      {actions.length === 0 ? (
        <Card className="text-center py-8">
          <ListTodo size={24} className="mx-auto text-ink3 mb-2" />
          <p className="text-[12px] text-ink3">Aucune action dÃ©finie</p>
        </Card>
      ) : (
        actions.map((a) => (
          <OwnerActionRow
            key={a.id}
            action={a}
            canManage={canManage}
            isOwner={!!isOwner}
            updating={updating}
            onStatusChange={(status) => updateStatus(a.id, status)}
            onChanged={onRefresh}
            onError={setError}
          />
        ))
      )}
    </div>
  )
}

/**
 * Ligne d'action unifiée : le coach gère le statut complet, le porteur peut
 * passer l'action en cours / soumise et joindre des preuves (proof of work)
 * que le coach valide ou rejette ensuite.
 */
function OwnerActionRow({
  action, canManage, isOwner, updating, onStatusChange, onChanged, onError,
}: {
  action: CoachingAction
  canManage: boolean
  isOwner: boolean
  updating: boolean
  onStatusChange: (status: string) => void
  onChanged: () => void
  onError: (message: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  const [evidences, setEvidences] = useState<ActionEvidence[] | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [type, setType] = useState<'LINK' | 'TEXT' | 'DOCUMENT' | 'RESULT'>('LINK')
  const [evTitle, setEvTitle] = useState('')
  const [content, setContent] = useState('')
  const [url, setUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Le porteur ne peut que démarrer ou soumettre ; la validation finale reste au coach.
  const OWNER_STATUSES: CoachingActionStatus[] = ['PENDING', 'IN_PROGRESS', 'SUBMITTED']
  const evidenceAllowed = action.status !== 'COMPLETED' && action.status !== 'CANCELLED'

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

  const submitEvidence = async () => {
    onError(null)
    setSubmitting(true)
    try {
      await coachingService.addEvidence(action.id, {
        type,
        title: evTitle || undefined,
        content: content || undefined,
        url: url || undefined,
      })
      setEvTitle(''); setContent(''); setUrl(''); setShowForm(false)
      await loadEvidences()
      onChanged()
    } catch (err) {
      onError(apiError(err, "La soumission de la preuve a échoué"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="p-[14px_16px]">
      <div className="flex items-start gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-semibold text-ink">{action.title}</span>
            <Badge variant={PRIORITY_COLOR(action.priority)}>{PRIORITY_LABELS[action.priority]}</Badge>
            <Badge variant={ACTION_STATUS_COLORS[action.status]}>{ACTION_STATUS_LABELS[action.status]}</Badge>
          </div>
          <div className="text-[11px] text-ink3 mt-1">
            Ã‰chÃ©ance : {formatDate(action.deadline)}
          </div>
          {action.description && (
            <div className="text-[12px] text-ink2 mt-1">{action.description}</div>
          )}
        </div>
        {canManage ? (
          <Select
            className="w-[150px] !py-[6px] !text-[11px]"
            value={action.status}
            disabled={updating}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{ACTION_STATUS_LABELS[s]}</option>
            ))}
          </Select>
        ) : isOwner && OWNER_STATUSES.includes(action.status) ? (
          <Select
            className="w-[150px] !py-[6px] !text-[11px]"
            value={action.status}
            disabled={updating}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            {OWNER_STATUSES.map((s) => (
              <option key={s} value={s}>{ACTION_STATUS_LABELS[s]}</option>
            ))}
          </Select>
        ) : null}
      </div>
      {(isOwner || canManage) && (
        <>
          <button onClick={toggle} className="mt-2 flex items-center gap-1 text-[11px] text-ink3 hover:text-moss transition-colors cursor-pointer">
            <Paperclip size={11} /> Preuves ({evidences?.length ?? 'â€¦'})
          </button>
          {open && (
            <div className="mt-2 border-t border-border pt-2 space-y-2">
              {isOwner && evidenceAllowed && (
                showForm ? (
                  <div className="border border-border rounded-[10px] p-3 space-y-2 bg-surface-2/50">
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="Type de preuve">
                        <Select value={type} onChange={(e) => setType(e.target.value as typeof type)}>
                          <option value="LINK">Lien</option>
                          <option value="TEXT">Texte</option>
                          <option value="DOCUMENT">Document</option>
                          <option value="RESULT">RÃ©sultat</option>
                        </Select>
                      </Field>
                      <Field label="Titre">
                        <Input value={evTitle} onChange={(e) => setEvTitle(e.target.value)} placeholder="Ex. RÃ©sultats d'enquÃªte" />
                      </Field>
                    </div>
                    {type === 'LINK' ? (
                      <Field label="URL" required>
                        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://â€¦" />
                      </Field>
                    ) : (
                      <Field label="Contenu" required>
                        <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3} />
                      </Field>
                    )}
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
                      <Button size="sm" variant="primary" loading={submitting} onClick={submitEvidence}>
                        Soumettre au coach
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
                    <Plus size={11} /> Soumettre une preuve
                  </Button>
                )
              )}
              {(evidences ?? []).map((ev) => (
                <div key={ev.id} className="bg-surface border border-border rounded-lg p-2.5 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="gray">{ev.type}</Badge>
                    {ev.title && <span className="text-[11px] font-semibold text-ink">{ev.title}</span>}
                    <Badge variant={ev.review_status === 'APPROVED' ? 'green' : ev.review_status === 'REJECTED' ? 'red' : 'amber'}>
                      {ev.review_status === 'APPROVED' ? 'ValidÃ©e par le coach' : ev.review_status === 'REJECTED' ? 'Ã€ corriger' : 'En attente de revue'}
                    </Badge>
                  </div>
                  {ev.url && (
                    <a href={ev.url} target="_blank" rel="noreferrer" className="text-[11px] text-blue-600 underline break-all">
                      {ev.url}
                    </a>
                  )}
                  {ev.content && <p className="text-[11px] text-ink2 whitespace-pre-wrap">{ev.content}</p>}
                  {ev.coach_comment && <p className="text-[11px] text-ink3 italic">{ev.coach_comment}</p>}
                </div>
              ))}
              {evidences !== null && evidences.length === 0 && (
                <p className="text-[11px] text-ink3">Aucune preuve pour le moment.</p>
              )}
            </div>
          )}
        </>
      )}
    </Card>
  )
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   PANNEAU : RECOMMANDATIONS
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export function RecommendationsPanel({
  projectId, recommendations, canManage, onRefresh,
}: {
  projectId: string; recommendations: CoachingRecommendation[]; canManage: boolean; onRefresh: () => void
}) {
  const [showCreate, setShowCreate] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateStatus = async (id: string, status: string) => {
    setError(null)
    try {
      await coachingService.updateRecommendation(id, { status })
      onRefresh()
    } catch (err) {
      setError(apiError(err, 'Erreur lors de la mise Ã  jour'))
    }
  }

  return (
    <div className="space-y-[8px]">
      {showCreate && <AddRecommendationModal projectId={projectId} onClose={() => setShowCreate(false)} onSuccess={onRefresh} />}
      {error && <div className="mb-2"><ErrorAlert message={error} /></div>}

      <div className="flex items-center justify-between">
        <div className="text-[11px] text-ink3">{recommendations.length} recommandation(s)</div>
        {canManage && (
          <Button size="sm" variant="primary" onClick={() => setShowCreate(true)}>
            <Plus size={12} /> Nouvelle recommandation
          </Button>
        )}
      </div>

      {recommendations.length === 0 ? (
        <Card className="text-center py-8">
          <Lightbulb size={24} className="mx-auto text-ink3 mb-2" />
          <p className="text-[12px] text-ink3">Aucune recommandation</p>
        </Card>
      ) : (
        recommendations.map((r) => (
          <Card key={r.id} className="p-[14px_16px]">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={PRIORITY_COLOR(r.priority)}>{PRIORITY_LABELS[r.priority]}</Badge>
                  <Badge variant={r.status === 'DONE' ? 'green' : r.status === 'IN_PROGRESS' ? 'blue' : 'gray'}>
                    {RECOMMENDATION_STATUS_LABELS[r.status]}
                  </Badge>
                </div>
                <div className="text-[12px] text-ink mt-1 leading-relaxed">{r.content}</div>
                <div className="text-[11px] text-ink3 mt-1">
                  Par {r.author?.profile ? `${r.author.profile.first_name} ${r.author.profile.last_name}` : '—'} · {formatDate(r.created_at)}
                  {r.actions && r.actions.length > 0 && ` · ${r.actions.length} action(s) liée(s)`}
                </div>
              </div>
              {canManage && r.status !== 'DONE' && (
                <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, 'DONE')}>
                  Marquer rÃ©alisÃ©e
                </Button>
              )}
            </div>
          </Card>
        ))
      )}
    </div>
  )
}

function PRIORITY_COLOR(p: string): 'green' | 'amber' | 'red' | 'blue' | 'gray' | 'secondary' {
  if (p === 'HIGH') return 'red'
  if (p === 'MEDIUM') return 'blue'
  return 'gray'
}
