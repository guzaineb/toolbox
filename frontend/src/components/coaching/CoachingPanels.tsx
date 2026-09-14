'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  CalendarClock, CheckCircle2, MessageSquare, Plus, X, Lightbulb, ListTodo,
  ExternalLink,
} from 'lucide-react'
import { Badge, Button, Card, CardHeader, ErrorAlert, Field, Input, Select, Textarea } from '@/components/shared/ui'
import {
  CoachingSession, CoachingAction, CoachingRecommendation,
  COACHING_SESSION_STATUS_LABELS, COACHING_SESSION_STATUS_COLORS,
  PRIORITY_LABELS, RECOMMENDATION_STATUS_LABELS,
} from '@/types/coaching'
import { apiError, formatDate, formatDateTime } from '@/lib/utils'
import {
  useCreateSession, useCompleteSession, useCreateAction, useCreateRecommendation,
  useSessionComments, useAddSessionComment, useUpdateRecommendation,
} from '@/hooks/useCoaching'
import { aiAnalysisService } from '@/services/ai-analysis.service'
import { ImprovementPlan } from '@/types/ai-analysis'
import { ActionRow } from '@/components/coaching/ActionRow'

const SESSION_TYPE_OPTIONS = [
  { value: 'SUIVI', label: 'Suivi' },
  { value: 'DIAGNOSTIC', label: 'Diagnostic' },
  { value: 'TRAVAIL', label: 'Travail' },
  { value: 'VALIDATION', label: 'Validation' },
  { value: 'FINANCEMENT', label: 'Financement' },
  { value: 'STRATEGIE', label: 'Stratégie' },
  { value: 'AUTRE', label: 'Autre' },
]

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MODALE : NOUVELLE SESSION
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export function AddSessionModal({
  projectId, onClose,
}: {
  projectId: string; onClose: () => void
}) {
  const [scheduledAt, setScheduledAt] = useState('')
  const [duration, setDuration] = useState('60')
  const [title, setTitle] = useState('')
  const [sessionType, setSessionType] = useState('')
  const [objective, setObjective] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const createSession = useCreateSession(projectId)

  const handleSubmit = async () => {
    if (!scheduledAt) { setError('La date de la session est requise'); return }
    setError(null)
    setLoading(true)
    try {
      await createSession.mutateAsync({
        title: title || undefined,
        sessionType: sessionType || undefined,
        objective: objective || undefined,
        scheduledAt: new Date(scheduledAt).toISOString(),
        durationMinutes: parseInt(duration, 10) || undefined,
      })
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
            <Button variant="primary" className="flex-1" loading={loading} onClick={handleSubmit}>Créer</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

/* 
   MODALE : TERMINER UNE SESSION
 */
export function CompleteSessionModal({
  session, projectId, onClose,
}: {
  session: CoachingSession; projectId: string; onClose: () => void
}) {
  const [report, setReport] = useState(session.report || '')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const completeSession = useCompleteSession()

  const handleSubmit = async () => {
    setError(null)
    setLoading(true)
    try {
      await completeSession.mutateAsync({
        projectId,
        sessionId: session.id,
        report: report || undefined,
      })
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
            <Textarea value={report} onChange={(e) => setReport(e.target.value)} rows={5} placeholder="Points abordés, décisions, prochaines étapes..." />
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

/* 
   MODALE : NOUVELLE ACTION
 */
export function AddActionModal({
  projectId, onClose,
}: {
  projectId: string; onClose: () => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')
  const [deadline, setDeadline] = useState('')
  const [objectiveId, setObjectiveId] = useState('')
  const [plans, setPlans] = useState<ImprovementPlan[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const createAction = useCreateAction(projectId)

  useEffect(() => {
    aiAnalysisService
      .getProjectPlans(projectId)
      .then((list) => setPlans(list.filter((p) => p.status === 'ACTIVE')))
      .catch(() => setPlans([]))
  }, [projectId])

  const handleSubmit = async () => {
    if (!title.trim()) { setError("Le titre de l'action est requis"); return }
    setError(null)
    setLoading(true)
    try {
      await createAction.mutateAsync({
        title: title.trim(),
        description: description || undefined,
        priority,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        objectiveId: objectiveId || undefined,
      })
      onClose()
    } catch (err) {
      setError(apiError(err, "Erreur lors de la création de l'action"))
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
          <Field label="Objectif du plan d'amÃ©lioration (optionnel)">
            <Select value={objectiveId} onChange={(e) => setObjectiveId(e.target.value)}>
              <option value="">Aucun</option>
              {plans.flatMap((p) =>
                (p.objectives ?? []).map((o) => (
                  <option key={o.id} value={o.id}>{o.title}</option>
                )),
              )}
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

/* 
   MODALE : NOUVELLE RECOMMANDATION
 */
export function AddRecommendationModal({
  projectId, onClose,
}: {
  projectId: string; onClose: () => void
}) {
  const [content, setContent] = useState('')
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const createRecommendation = useCreateRecommendation(projectId)

  const handleSubmit = async () => {
    if (!content.trim()) { setError('Le contenu de la recommandation est requis'); return }
    setError(null)
    setLoading(true)
    try {
      await createRecommendation.mutateAsync({ content: content.trim(), priority })
      onClose()
    } catch (err) {
      setError(apiError(err, 'Erreur lors de la création de la recommandation'))
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
            <Button variant="primary" className="flex-1" loading={loading} onClick={handleSubmit}>Créer</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

/* 
   PANNEAU : SESSIONS
 */
export function SessionsPanel({
  projectId, sessions, canManage, sessionHref,
}: {
  projectId: string; sessions: CoachingSession[]; canManage: boolean
  /** Si fourni, chaque session devient ouvrable dans son workspace (ex. coach). */
  sessionHref?: (sessionId: string) => string
}) {
  const [showCreate, setShowCreate] = useState(false)
  const [completing, setCompleting] = useState<CoachingSession | null>(null)
  const [openComments, setOpenComments] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const commentsQuery = useSessionComments(openComments ?? '', !!openComments)
  const addCommentMutation = useAddSessionComment(openComments ?? '')

  const toggleComments = (sessionId: string) => {
    setOpenComments((current) => (current === sessionId ? null : sessionId))
  }

  const addComment = async () => {
    if (!commentText.trim()) return
    setError(null)
    try {
      await addCommentMutation.mutateAsync({ content: commentText.trim() })
      setCommentText('')
    } catch (err) {
      setError(apiError(err, 'Erreur lors de lâ€™ajout du commentaire'))
    }
  }

  return (
    <div className="space-y-[8px]">
      {showCreate && <AddSessionModal projectId={projectId} onClose={() => setShowCreate(false)} />}
      {completing && <CompleteSessionModal session={completing} projectId={projectId} onClose={() => setCompleting(null)} />}
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
                  {formatDateTime(s.scheduled_at, { dateStyle: 'short', timeStyle: 'short' })}
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
                {(commentsQuery.data ?? []).map((c) => (
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
                    onKeyDown={(e) => { if (e.key === 'Enter') addComment() }}
                  />
                  <Button size="sm" onClick={addComment}>Envoyer</Button>
                </div>
              </div>
            )}
          </Card>
        ))
      )}
    </div>
  )
}

/* 
   PANNEAU : ACTIONS
 */
export function ActionsPanel({
  projectId, actions, canManage, isOwner,
}: {
  projectId: string; actions: CoachingAction[]; canManage: boolean
  /** Porteur du projet : peut suivre ses actions et soumettre des preuves. */
  isOwner?: boolean
}) {
  const [showCreate, setShowCreate] = useState(false)

  return (
    <div className="space-y-[8px]">
      {showCreate && <AddActionModal projectId={projectId} onClose={() => setShowCreate(false)} />}

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
          <p className="text-[12px] text-ink3">Aucune action définie</p>
        </Card>
      ) : (
        actions.map((a) => (
          <ActionRow
            key={a.id}
            action={a}
            mode={isOwner ? 'owner' : 'coach'}
            canManage={canManage}
          />
        ))
      )}
    </div>
  )
}

/* 
   PANNEAU : RECOMMANDATIONS
 */
export function RecommendationsPanel({
  projectId, recommendations, canManage,
}: {
  projectId: string; recommendations: CoachingRecommendation[]; canManage: boolean
}) {
  const [showCreate, setShowCreate] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const updateRecommendation = useUpdateRecommendation(projectId)

  const updateStatus = async (id: string, status: string) => {
    setError(null)
    try {
      await updateRecommendation.mutateAsync({ recommendationId: id, dto: { status } })
    } catch (err) {
      setError(apiError(err, 'Erreur lors de la mise Ã  jour'))
    }
  }

  return (
    <div className="space-y-[8px]">
      {showCreate && <AddRecommendationModal projectId={projectId} onClose={() => setShowCreate(false)} />}
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
                  Marquer Réalisée
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
