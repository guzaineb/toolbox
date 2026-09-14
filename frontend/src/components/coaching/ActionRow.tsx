'use client'

import { useState } from 'react'
import { Lightbulb, Paperclip, Plus, ShieldCheck } from 'lucide-react'
import { Badge, Button, Card, ErrorAlert, Field, Input, Select, Textarea } from '@/components/shared/ui'
import { ACTION_STATUS_COLORS, ACTION_STATUS_LABELS, PRIORITY_LABELS } from '@/types/coaching'
import type { ActionEvidence, CoachingAction, CoachingActionStatus, EvidenceType } from '@/types/coaching'
import { apiError, formatDate } from '@/lib/utils'
import {
  useActionEvidences, useAddEvidence, useReviewEvidence, useUpdateAction,
} from '@/hooks/useCoaching'

export type ActionRowMode = 'owner' | 'coach'

/**
 * Workflow proof-of-work (F2) :
 * - porteur (mode "owner") : démarre / soumet son action (PENDING → IN_PROGRESS →
 *   SUBMITTED) et joint ses preuves ; jamais de revue.
 * - coach (mode "coach") : arbitre le statut complet (validation / refus / annulation)
 *   et valide ou rejette les preuves ; jamais de soumission de preuve.
 * Le mode est explicite : aucune permission ne transite par un test d'identité,
 * chaque typologie de droit découle du mode ET du statut réel de l'action.
 */

/** Statuts que le porteur peut poser lui-même (la validation finale reste au coach). */
export const OWNER_STATUSES: CoachingActionStatus[] = ['PENDING', 'IN_PROGRESS', 'SUBMITTED']
/** Statuts que le coach peut arbitrer. OVERDUE n'est jamais posé par un utilisateur (scheduler). */
export const COACH_STATUSES: CoachingActionStatus[] = ['PENDING', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED', 'REJECTED', 'CANCELLED']

/** Une action terminée ou annulée n'accepte plus de preuve. */
const CLOSED_STATUSES: CoachingActionStatus[] = ['COMPLETED', 'CANCELLED']

export function ActionRow({
  action, mode, canManage, documentTitle,
}: {
  action: CoachingAction
  mode: ActionRowMode
  canManage: boolean
  /** Titre du livrable lié, fourni par le contexte coach. */
  documentTitle?: string
}) {
  const isOwner = mode === 'owner'
  const isCoach = mode === 'coach'

  const [open, setOpen] = useState(false)
  const { data: evidences } = useActionEvidences(action.id, open)
  const updateActionMutation = useUpdateAction(action.project_id)
  const addEvidenceMutation = useAddEvidence(action.project_id)
  const reviewMutation = useReviewEvidence(action.project_id)

  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [type, setType] = useState<EvidenceType>('LINK')
  const [evTitle, setEvTitle] = useState('')
  const [content, setContent] = useState('')
  const [url, setUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [comment, setComment] = useState('')
  const [reviewingId, setReviewingId] = useState<string | null>(null)

  // Permissions : mode explicite, jamais de contournement.
  const canSubmitEvidence = isOwner && !CLOSED_STATUSES.includes(action.status)
  const canSetStatus =
    isCoach ? canManage : isOwner && OWNER_STATUSES.includes(action.status)
  const statuses = isCoach ? COACH_STATUSES : OWNER_STATUSES

  const responsibleName = action.responsibleUser?.profile
    ? `${action.responsibleUser.profile.first_name} ${action.responsibleUser.profile.last_name}`
    : action.responsibleUser?.email
  const overdue =
    !!action.deadline &&
    new Date(action.deadline).getTime() < Date.now() &&
    !CLOSED_STATUSES.includes(action.status) &&
    action.status !== 'REJECTED'

  const evidenceLabel = (reviewStatus: ActionEvidence['review_status']) =>
    isOwner
      ? reviewStatus === 'APPROVED' ? 'Validée par le coach'
        : reviewStatus === 'REJECTED' ? 'À corriger'
          : 'En attente de revue'
      : reviewStatus === 'APPROVED' ? 'Validée'
        : reviewStatus === 'REJECTED' ? 'Refusée'
          : 'En attente'

  const setStatus = async (status: CoachingActionStatus) => {
    setUpdatingStatus(true)
    setError(null)
    try {
      await updateActionMutation.mutateAsync({ actionId: action.id, dto: { status } })
    } catch (err) {
      setError(apiError(err, 'La mise à jour du statut a échoué'))
    } finally {
      setUpdatingStatus(false)
    }
  }

  const submitEvidence = async () => {
    setError(null)
    setSubmitting(true)
    try {
      await addEvidenceMutation.mutateAsync({
        actionId: action.id,
        dto: {
          type,
          title: evTitle || undefined,
          content: content || undefined,
          url: url || undefined,
        },
      })
      setEvTitle('')
      setContent('')
      setUrl('')
      setShowForm(false)
    } catch (err) {
      setError(apiError(err, 'La soumission de la preuve a échoué'))
    } finally {
      setSubmitting(false)
    }
  }

  const review = async (evidenceId: string, reviewStatus: 'APPROVED' | 'REJECTED') => {
    setReviewingId(evidenceId)
    setError(null)
    try {
      await reviewMutation.mutateAsync({
        actionId: action.id,
        evidenceId,
        dto: { status: reviewStatus, comment: comment || undefined },
      })
      setComment('')
    } catch (err) {
      setError(apiError(err, 'La revue de la preuve a échoué'))
    } finally {
      setReviewingId(null)
    }
  }

  return (
    <Card className={`p-3 space-y-2 ${overdue ? 'border-red-300 bg-red-50/60' : ''}`}>
      <div className="flex items-start gap-2 flex-wrap">
        <span className="text-[12px] font-semibold text-ink flex-1 min-w-0">{action.title}</span>
        <Badge variant={action.priority === 'HIGH' ? 'red' : action.priority === 'MEDIUM' ? 'blue' : 'gray'}>
          {PRIORITY_LABELS[action.priority]}
        </Badge>
        <Badge variant={ACTION_STATUS_COLORS[action.status]}>{ACTION_STATUS_LABELS[action.status]}</Badge>
        {overdue && <Badge variant="red">En retard</Badge>}
        {canSetStatus && (
          <Select
            className="w-[150px] !py-[4px] !text-[11px]"
            value={action.status}
            disabled={updatingStatus}
            onChange={(e) => setStatus(e.target.value as CoachingActionStatus)}
          >
            {statuses.map((s) => (
              <option key={s} value={s}>{ACTION_STATUS_LABELS[s]}</option>
            ))}
          </Select>
        )}
      </div>
      <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-[11px] text-ink3">
        {isCoach && (
          <span>
            <span className="font-semibold text-ink2">Responsable :</span> {responsibleName ?? 'Non défini'}
          </span>
        )}
        {action.deadline && (
          <span><span className="font-semibold text-ink2">Échéance :</span> {formatDate(action.deadline, { dateStyle: 'medium' })}</span>
        )}
        {isCoach && (documentTitle || action.related_document_key) && (
          <span><span className="font-semibold text-ink2">Livrable :</span> {documentTitle ?? action.related_document_key}</span>
        )}
        {isCoach && action.assignment?.expertUser && !responsibleName && (
          <span><span className="font-semibold text-ink2">Expert :</span> {action.assignment.expertUser.email}</span>
        )}
        {isOwner && action.objective && (
          <span className="flex items-center gap-1">
            <Lightbulb size={11} className="text-moss" />
            <span>Objectif lié : <span className="text-ink font-medium">{action.objective.title}</span></span>
          </span>
        )}
      </div>
      {action.description && <p className="text-[11px] text-ink2">{action.description}</p>}
      {error && <ErrorAlert message={error} />}
      <button
        onClick={() => setOpen((next) => !next)}
        className="flex items-center gap-1 text-[11px] text-ink3 hover:text-moss transition-colors cursor-pointer"
      >
        <Paperclip size={11} /> Preuves ({evidences?.length ?? '…'})
      </button>
      {open && (
        <div className="space-y-2 pt-1">
          {isOwner && canSubmitEvidence && (
            showForm ? (
              <div className="border border-border rounded-[10px] p-3 space-y-2 bg-surface-2/50">
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Type de preuve">
                    <Select value={type} onChange={(e) => setType(e.target.value as EvidenceType)}>
                      <option value="LINK">Lien</option>
                      <option value="TEXT">Texte</option>
                      <option value="DOCUMENT">Document</option>
                      <option value="RESULT">Résultat</option>
                    </Select>
                  </Field>
                  <Field label="Titre">
                    <Input value={evTitle} onChange={(e) => setEvTitle(e.target.value)} placeholder="Ex. Résultats d'enquête" />
                  </Field>
                </div>
                {type === 'LINK' ? (
                  <Field label="URL" required>
                    <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
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
            <div key={ev.id} className="bg-surface border border-border rounded-lg p-2.5 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="gray">{ev.type}</Badge>
                {ev.title && <span className="text-[11px] font-semibold text-ink">{ev.title}</span>}
                <Badge variant={ev.review_status === 'APPROVED' ? 'green' : ev.review_status === 'REJECTED' ? 'red' : 'amber'}>
                  {evidenceLabel(ev.review_status)}
                </Badge>
              </div>
              {ev.url && (
                <a href={ev.url} target="_blank" rel="noreferrer" className="text-[11px] text-blue-600 underline break-all">
                  {ev.url}
                </a>
              )}
              {ev.content && <p className="text-[11px] text-ink2 whitespace-pre-wrap">{ev.content}</p>}
              {ev.coach_comment && <p className="text-[11px] text-ink3 italic">Commentaire : {ev.coach_comment}</p>}
              {isCoach && canManage && ev.review_status === 'PENDING' && (
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
            <p className="text-[11px] text-ink3">
              {isOwner ? 'Aucune preuve pour le moment.' : 'Aucune preuve soumise pour cette action.'}
            </p>
          )}
        </div>
      )}
    </Card>
  )
}