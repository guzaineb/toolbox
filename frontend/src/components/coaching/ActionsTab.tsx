'use client'

import { useState } from 'react'
import { ListTodo, Paperclip, Plus, ShieldCheck, X } from 'lucide-react'
import { Badge, Button, Card, CardHeader, ErrorAlert, Field, Input, Select, Textarea } from '@/components/shared/ui'
import { ACTION_STATUS_COLORS, ACTION_STATUS_LABELS, PRIORITY_LABELS } from '@/types/coaching'
import type { CoachingAction } from '@/types/coaching'
import { apiError, formatDate } from '@/lib/utils'
import {
  useActionEvidences, useCreateAction, useReviewEvidence, useUpdateAction,
} from '@/hooks/useCoaching'
import type { GeneratedDocument } from '@/services/documents.service'

/**
 * Onglet ACTIONS : actions issues de la session, création et revue des preuves
 * soumises par le porteur.
 */
export function ActionsTab({
  projectId, sessionId, actions, canManage, showForm, onToggleForm,
  responsableOptions, documents,
}: {
  projectId: string
  sessionId: string
  actions: CoachingAction[]
  canManage: boolean
  showForm: boolean
  onToggleForm: () => void
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
  const createAction = useCreateAction(projectId)

  const createActionSubmit = async () => {
    if (!title.trim()) { setError("Le titre de l'action est requis"); return }
    setError(null)
    setCreating(true)
    try {
      await createAction.mutateAsync({
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
              <Button variant="primary" size="sm" onClick={createActionSubmit} loading={creating}>
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
          <CoachActionRow key={a.id} action={a} canManage={canManage} documentTitle={
            a.related_document_key ? documents.find((d) => d.key === a.related_document_key)?.title : undefined
          } />
        ))}
      </div>
    </Card>
  )
}

/** Ligne d'action côté coach : statut modifiable + revue des preuves soumises. */
export function CoachActionRow({
  action, canManage, documentTitle,
}: {
  action: CoachingAction
  canManage: boolean
  documentTitle?: string
}) {
  const [open, setOpen] = useState(false)
  const { data: evidences } = useActionEvidences(action.id, open)
  const [comment, setComment] = useState('')
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const reviewMutation = useReviewEvidence(action.project_id)
  const updateActionMutation = useUpdateAction(action.project_id)

  const responsibleName = action.responsibleUser?.profile
    ? `${action.responsibleUser.profile.first_name} ${action.responsibleUser.profile.last_name}`
    : action.responsibleUser?.email

  const overdue =
    !!action.deadline &&
    new Date(action.deadline).getTime() < Date.now() &&
    !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(action.status)

  const toggle = () => {
    setOpen((next) => !next)
  }

  const review = async (evidenceId: string, status: 'APPROVED' | 'REJECTED') => {
    setReviewingId(evidenceId)
    setError(null)
    try {
      await reviewMutation.mutateAsync({
        actionId: action.id,
        evidenceId,
        dto: { status, comment: comment || undefined },
      })
      setComment('')
    } catch (err) {
      setError(apiError(err, 'La revue de la preuve a échoué'))
    } finally {
      setReviewingId(null)
    }
  }

  const setStatus = async (status: string) => {
    setError(null)
    try {
      await updateActionMutation.mutateAsync({ actionId: action.id, dto: { status } })
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
        {action.deadline && <span><span className="font-semibold text-ink2">Échéance :</span> {formatDate(action.deadline, { dateStyle: 'medium' })}</span>}
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
          {evidences && evidences.length === 0 && (
            <p className="text-[11px] text-ink3">Aucune preuve soumise pour cette action.</p>
          )}
        </div>
      )}
    </div>
  )
}