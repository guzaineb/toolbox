'use client'

import { useState } from 'react'
import { ChevronRight, Flag, Lightbulb, MessageSquareQuote, Plus } from 'lucide-react'
import { Badge, Button, Card, CardHeader, ErrorAlert, Field, Select, Textarea } from '@/components/shared/ui'
import { OBJECTIVE_RESULT_COLORS, OBJECTIVE_RESULT_LABELS, PRIORITY_LABELS } from '@/types/coaching'
import type { CoachingRecommendation, CoachingSession } from '@/types/coaching'
import { apiError } from '@/lib/utils'
import { useCreateRecommendation } from '@/hooks/useCoaching'
import type { ObjectiveResultDraft, SessionDraft, SetSessionField } from './session-types'

/**
 * Onglet DÉCISIONS : recommandations du coach, décisions arrêtées et résultat
 * de l'objectif constaté en fin de séance.
 */
export function DecisionsTab({
  session, projectId, sessionId, recommendations, canManage, draft, setField,
}: {
  session: CoachingSession
  projectId: string
  sessionId: string
  recommendations: CoachingRecommendation[]
  canManage: boolean
  draft: SessionDraft
  setField: SetSessionField
}) {
  return (
    <div className="grid lg:grid-cols-2 gap-5 items-start">
      <div className="space-y-5">
        <RecommendationsCard
          projectId={projectId}
          sessionId={sessionId}
          recommendations={recommendations}
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
  )
}

function RecommendationsCard({
  projectId, sessionId, recommendations, canManage,
}: {
  projectId: string
  sessionId: string
  recommendations: CoachingRecommendation[]
  canManage: boolean
}) {
  const [content, setContent] = useState('')
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const createRecommendation = useCreateRecommendation(projectId)

  const create = async () => {
    if (!content.trim()) { setError('Le contenu de la recommandation est requis'); return }
    setError(null)
    setCreating(true)
    try {
      await createRecommendation.mutateAsync({
        content: content.trim(),
        priority,
        sessionId,
      })
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