'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  BookOpen,
  CalendarClock,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  FileText,
  Flag,
  Gauge,
  Lightbulb,
  ListTodo,
  MessageSquare,
  MessageSquareQuote,
  Send,
  Target,
} from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardHeader,
  ErrorAlert,
  Input,
  LoadingState,
} from '@/components/shared/ui'
import {
  COACHING_SESSION_STATUS_COLORS,
  COACHING_SESSION_STATUS_LABELS,
  OBJECTIVE_RESULT_COLORS,
  OBJECTIVE_RESULT_LABELS,
  PRIORITY_LABELS,
  RECOMMENDATION_STATUS_LABELS,
} from '@/types/coaching'
import type {
  CoachingAction,
  CoachingComment,
} from '@/types/coaching'
import type { GbmProgress } from '@/types/gbm'
import { apiError, formatDateTime } from '@/lib/utils'
import { gbmActionContext } from '@/lib/gbm-document-links'
import { getStepMeta } from '@/data/gbm/steps'
import { gbmService } from '@/services/gbm.service'
import {
  useAddSessionComment,
  useCoachingSession,
  useSessionComments,
} from '@/hooks/useCoaching'
import { ActionRow } from './ActionRow'
import { SessionBackNote } from './session-workspace-ui'

function httpStatus(err: unknown): number | null {
  if (err && typeof err === 'object') {
    const e = err as { response?: { status?: number }; status?: number }
    if (typeof e.response?.status === 'number') return e.response.status
    if (typeof e.status === 'number') return e.status
  }
  return null
}

function authorName(author?: CoachingComment['author']): string {
  if (!author) return '—'
  return author.profile
    ? `${author.profile.first_name} ${author.profile.last_name}`
    : author.email
}

function gbmStepTitle(stepKey: string): string {
  return getStepMeta(stepKey)?.subtitle ?? `Étape ${stepKey.replace('gbm_', '')}`
}

/**
 * Détail d'une session de coaching pour le porteur de projet.
 *
 * Vue « lecture seule » du contenu de la session : objectif, sujets discutés,
 * notes, constats, blocages, décisions, recommandations, actions, progression
 * et commentaires. Le porteur conserve uniquement les opérations explicitement
 * autorisées par le backend — ici, suivre ses actions (soumission de preuves et
 * évolution de statut via ActionRow en mode "owner").
 *
 * Les actions qui référencent un livrable GBM proposent une redirection vers le
 * module GBM existant (navigation seule, aucune écriture depuis cette page).
 */
export function OwnerSessionDetail({
  projectId,
  sessionId,
  backToCoachingHref,
}: {
  projectId: string
  sessionId: string
  backToCoachingHref: string
}) {
  const { data: session, isLoading, isError, error: sessionError } = useCoachingSession(sessionId)
  const { data: sessionComments } = useSessionComments(sessionId)
  const addComment = useAddSessionComment(sessionId)

  const [progress, setProgress] = useState<GbmProgress | null>(null)
  const [commentText, setCommentText] = useState('')
  const [adding, setAdding] = useState(false)
  const [commentError, setCommentError] = useState<string | null>(null)

  useEffect(() => {
    if (!projectId) return
    let cancelled = false
    gbmService
      .getProgress(projectId)
      .then((p) => { if (!cancelled) setProgress(p) })
      .catch(() => undefined)
    return () => { cancelled = true }
  }, [projectId])

  if (isLoading) {
    return <LoadingState label="Chargement de la session…" />
  }

  if (isError) {
    const status = httpStatus(sessionError)
    const message =
      status === 403
        ? 'Accès non autorisé : vous ne pouvez pas consulter cette session.'
        : status === 404
          ? 'Session introuvable.'
          : apiError(sessionError, 'Erreur de chargement de la session')
    return <ErrorAlert message={message} />
  }

  if (!session) {
    return <ErrorAlert message="Session introuvable" />
  }

  const actions = session.actions ?? []
  const recommendations = session.recommendations ?? []
  const comments = sessionComments ?? []
  const blockerCount = (session.blockers ?? []).filter((b) => !b.resolved).length
  const coach =
    session.assignment?.expertUser?.profile
      ? `${session.assignment.expertUser.profile.first_name} ${session.assignment.expertUser.profile.last_name}`
      : session.assignment?.expertUser?.email

  const submitComment = async () => {
    const content = commentText.trim()
    if (!content) return
    setCommentError(null)
    setAdding(true)
    try {
      await addComment.mutateAsync({ content })
      setCommentText('')
    } catch (err) {
      setCommentError(apiError(err, "Erreur lors de l'ajout du commentaire"))
    } finally {
      setAdding(false)
    }
  }

  const topics = (session.topics_discussed ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  return (
    <div className="space-y-5">
      {/* ===== MODÈLE & OBJET ===== */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-syne text-[18px] font-extrabold text-ink">
              {session.title || 'Session de coaching'}
            </h2>
            <Badge variant={COACHING_SESSION_STATUS_COLORS[session.status]}>
              {COACHING_SESSION_STATUS_LABELS[session.status]}
            </Badge>
          </div>
          <div className="flex items-center gap-x-2 gap-y-1 flex-wrap text-[11px] text-ink3 mt-1.5">
            <CalendarClock size={13} className="text-moss" />
            <span>{formatDateTime(session.scheduled_at, { dateStyle: 'long', timeStyle: 'short' })}</span>
            {session.duration_minutes ? <span>· {session.duration_minutes} min</span> : null}
            {session.session_type ? <span>· {session.session_type}</span> : null}
            {coach ? <span>· Coach : {coach}</span> : null}
          </div>
          {session.objective && (
            <p className="text-[12px] text-ink2 mt-2 flex items-start gap-1.5">
              <Target size={13} className="text-moss mt-[1px] shrink-0" />
              <span className="italic">{session.objective}</span>
            </p>
          )}
        </div>
      </div>

      {/* ===== RÉSUMÉ DE SESSION ===== */}
      <Card>
        <CardHeader icon={<FileText size={13} />} title="Résumé de la session" />
        <div className="p-[18px]">
          {session.summary ? (
            <p className="text-[12px] text-ink2 leading-relaxed whitespace-pre-wrap">{session.summary}</p>
          ) : (
            <p className="text-[12px] text-ink3">Aucun résumé disponible pour cette session.</p>
          )}
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-5 items-start">
        <div className="space-y-5">
          {/* ===== DÉROULEMENT ===== */}
          <Card>
            <CardHeader icon={<ClipboardList size={13} />} title="Déroulement de la séance" />
            <div className="p-[18px] space-y-4">
              {topics.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-ink3 mb-1.5">
                    Sujets discutés
                  </div>
                  <ul className="space-y-0.5">
                    {topics.map((t, i) => (
                      <li key={i} className="text-[12px] text-ink2 flex items-start gap-1.5">
                        <ChevronRight size={11} className="text-moss mt-[3px] shrink-0" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-ink3 mb-1.5">
                  Notes du coach
                </div>
                <p className="text-[12px] text-ink2 whitespace-pre-wrap">{session.notes || '—'}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-ink3">Constats du coach</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-amber bg-amber/10 px-2 py-0.5 rounded">
                    ≠ Notes
                  </span>
                </div>
                <p className="text-[12px] text-ink2 whitespace-pre-wrap">{session.findings || '—'}</p>
              </div>
            </div>
          </Card>

          {/* ===== BLOCAGES ===== */}
          <Card>
            <CardHeader
              icon={<AlertTriangle size={13} />}
              title={`Blocages identifiés (${blockerCount} ouvert${blockerCount > 1 ? 's' : ''})`}
            />
            <div className="p-[18px] space-y-2">
              {(session.blockers ?? []).length === 0 && (
                <p className="text-[12px] text-ink3">Aucun blocage identifié pour cette session.</p>
              )}
              {(session.blockers ?? []).map((b) => (
                <div
                  key={b.id}
                  className={`border rounded-[10px] p-2.5 flex items-start gap-2 ${b.resolved ? 'border-moss/30 bg-moss/[.04]' : 'border-border'}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className={`text-[12px] font-semibold ${b.resolved ? 'text-ink3 line-through' : 'text-ink'}`}>
                      {b.title}
                    </div>
                    {b.detail && <div className="text-[11px] text-ink3 mt-0.5">{b.detail}</div>}
                  </div>
                  <Badge variant={b.resolved ? 'green' : 'red'}>{b.resolved ? 'Résolu' : 'Ouvert'}</Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* ===== DÉCISIONS ===== */}
          <Card>
            <CardHeader icon={<MessageSquareQuote size={13} />} title="Décisions arrêtées" />
            <div className="p-[18px] space-y-3">
              <p className="text-[12px] text-ink2 whitespace-pre-wrap">{session.decisions || 'Aucune décision enregistrée pour cette session.'}</p>
              <div className="border-t border-border pt-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <Flag size={13} className="text-moss" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-ink3">Résultat de l&apos;objectif</span>
                </div>
                {session.objective_result ? (
                  <Badge variant={OBJECTIVE_RESULT_COLORS[session.objective_result]}>
                    {OBJECTIVE_RESULT_LABELS[session.objective_result]}
                  </Badge>
                ) : (
                  <span className="text-[11px] text-ink3">Non renseigné à la clôture.</span>
                )}
                {session.objective_result_reason && (
                  <p className="text-[11px] text-ink2 mt-1.5">{session.objective_result_reason}</p>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          {/* ===== RECOMMANDATIONS ===== */}
          <Card>
            <CardHeader icon={<Lightbulb size={13} />} title={`Recommandations de la session (${recommendations.length})`} />
            <div className="p-[18px] space-y-3">
              {recommendations.length === 0 && (
                <p className="text-[12px] text-ink3">Aucune recommandation rattachée à cette session.</p>
              )}
              {recommendations.map((r) => (
                <div key={r.id} className="border border-border rounded-[10px] p-3 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={r.priority === 'HIGH' ? 'red' : r.priority === 'MEDIUM' ? 'blue' : 'gray'}>
                      {PRIORITY_LABELS[r.priority]}
                    </Badge>
                    <Badge variant={r.status === 'DONE' ? 'green' : r.status === 'IN_PROGRESS' ? 'blue' : 'gray'}>
                      {RECOMMENDATION_STATUS_LABELS[r.status]}
                    </Badge>
                    {r.source === 'AI' && <Badge variant="secondary">Issue de l&apos;IA</Badge>}
                  </div>
                  <p className="text-[12px] text-ink2">{r.content}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* ===== ACTIONS ===== */}
          <Card>
            <CardHeader icon={<ListTodo size={13} />} title={`Actions liées à cette session (${actions.length})`} />
            <div className="p-[18px] space-y-3">
              {actions.length === 0 && (
                <p className="text-[12px] text-ink3">Aucune action liée à cette session.</p>
              )}
              {actions.map((a) => (
                <OwnerActionItem key={a.id} projectId={projectId} action={a} />
              ))}
            </div>
          </Card>

          {/* ===== PROGRESSION ===== */}
          <Card>
            <CardHeader icon={<Gauge size={13} />} title="Progression globale du projet" />
            <div className="p-[18px] space-y-2">
              <p className="text-[11px] text-ink3">
                Indicateur global (parcours GBM) — partagé avec toutes les sessions du projet.
              </p>
              {progress ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="font-syne text-[24px] font-extrabold text-ink">{progress.percentage}%</span>
                    <span className="text-[11px] text-ink3">du parcours GBM complété</span>
                  </div>
                  {progress.phases?.map((ph) => (
                    <div key={ph.phase} className="flex items-center gap-2 text-[11px] text-ink2">
                      <span className="w-[70px] shrink-0">Phase {ph.phase}</span>
                      <div className="flex-1 h-[6px] bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-moss rounded-full" style={{ width: `${Math.round((ph.completed / Math.max(ph.total, 1)) * 100)}%` }} />
                      </div>
                      <span className="w-[36px] text-right text-ink3">{ph.completed}/{ph.total}</span>
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-[12px] text-ink3">Progression indisponible pour le moment.</p>
              )}
            </div>
          </Card>

          {/* ===== COMMENTAIRES ===== */}
          <Card>
            <CardHeader icon={<MessageSquare size={13} />} title={`Commentaires (${comments.length})`} />
            <div className="p-[18px] space-y-3">
              {comments.length === 0 && (
                <p className="text-[12px] text-ink3">Aucun commentaire pour cette session.</p>
              )}
              {comments.map((c) => (
                <div key={c.id} className="text-[12px] text-ink2 bg-surface border border-border rounded-lg p-2.5">
                  <div className="text-[11px] text-ink3">
                    <span className="font-semibold text-ink2">{authorName(c.author)}</span>
                    {' · '}
                    {formatDateTime(c.created_at, { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                  <div className="mt-1 whitespace-pre-wrap">{c.content}</div>
                </div>
              ))}
              {commentError && <ErrorAlert message={commentError} />}
              <div className="flex gap-2">
                <Input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Ajouter un commentaire…"
                  onKeyDown={(e) => { if (e.key === 'Enter' && !adding) submitComment() }}
                />
                <Button size="sm" onClick={submitComment} loading={adding} disabled={!commentText.trim()}>
                  <Send size={12} /> Envoyer
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <SessionBackNote href={backToCoachingHref} />
    </div>
  )
}

function OwnerActionItem({ projectId, action }: { projectId: string; action: CoachingAction }) {
  const ctx = gbmActionContext(projectId, action.related_document_key)
  return (
    <div className="space-y-1">
      <ActionRow action={action} mode="owner" canManage={false} />
      {ctx && (
        <div className="flex items-center gap-1.5 pl-2 text-[11px] text-ink3 flex-wrap">
          <BookOpen size={12} className="text-moss shrink-0" />
          <span>Contexte GBM :</span>
          <Link
            href={ctx.path}
            className="inline-flex items-center gap-0.5 font-semibold text-moss hover:underline"
          >
            {gbmStepTitle(ctx.stepKey)} <ExternalLink size={11} />
          </Link>
          <span className="text-[10px] text-ink3">(lecture seule)</span>
        </div>
      )}
    </div>
  )
}