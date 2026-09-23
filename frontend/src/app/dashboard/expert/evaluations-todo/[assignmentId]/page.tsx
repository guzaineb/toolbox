'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ClipboardCheck, Save, Send, CheckCircle2, FolderCheck } from 'lucide-react'
import { Badge, Button, Card, CardHeader, ErrorAlert, SuccessAlert, Field, Textarea } from '@/components/shared/ui'
import { evaluationService } from '@/services/evaluation.service'
import { DeliverablesPanel } from '@/components/coaching/DeliverablesPanel'
import { EvaluationAssignment, EvaluationModule, EvaluationCriterion } from '@/types/coaching'
import { getErrorMessage } from '@/lib/utils'

export default function EvaluationTaskPage() {
  const params = useParams()
  const router = useRouter()
  const assignmentId = params.assignmentId as string

  const [assignment, setAssignment] = useState<(EvaluationAssignment & { evaluations: EvaluationModule[] }) | null>(null)
  const [evaluation, setEvaluation] = useState<EvaluationModule | null>(null)
  const [scores, setScores] = useState<Record<string, string>>({})
  const [comments, setComments] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const load = useCallback(async () => {
    if (!assignmentId) return
    setLoading(true)
    try {
      const data = await evaluationService.getEvaluationAssignment(assignmentId)
      setAssignment(data)
      const latest = data.evaluations.find((e) => e.status === 'DRAFT') ?? data.evaluations[0] ?? null
      setEvaluation(latest)
      if (latest) {
        const nextScores: Record<string, string> = {}
        const nextComments: Record<string, string> = {}
        for (const c of latest.template?.criteria ?? []) {
          const s = latest.scores?.find((x) => x.criterion_id === c.id)
          nextScores[c.id] = s ? String(s.score) : ''
          nextComments[c.id] = s?.comment ?? ''
        }
        setScores(nextScores)
        setComments(nextComments)
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [assignmentId])

  useEffect(() => { load() }, [load])

  const handleCreateDraft = async () => {
    setError(null)
    try {
      const draft = await evaluationService.createDraft(assignmentId)
      setEvaluation(draft)
      const nextScores: Record<string, string> = {}
      const nextComments: Record<string, string> = {}
      for (const c of draft.template?.criteria ?? []) {
        nextScores[c.id] = ''
        nextComments[c.id] = ''
      }
      setScores(nextScores)
      setComments(nextComments)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const handleSave = async () => {
    if (!evaluation) return
    setError(null)
    setSaving(true)
    try {
      const items = (evaluation.template?.criteria ?? []).map((c) => ({
        criterionId: c.id,
        score: scores[c.id] !== '' ? parseInt(scores[c.id], 10) : 0,
        comment: comments[c.id] || undefined,
      }))
      await evaluationService.saveScores(evaluation.id, { scores: items })
      setSuccess('Brouillon enregistré')
      setTimeout(() => setSuccess(null), 3000)
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async () => {
    if (!evaluation) return
    setError(null)
    const missing = (evaluation.template?.criteria ?? []).filter((c) => scores[c.id] === '')
    if (missing.length > 0) {
      setError(`Veuillez renseigner tous les critères (${missing.length} manquant(s))`)
      return
    }
    // Scénario 18 : la soumission est définitive — confirmation explicite.
    setConfirming(true)
  }

  const handleConfirmedSubmit = async () => {
    if (!evaluation) return
    setConfirming(false)
    setSaving(true)
    try {
      const items = (evaluation.template?.criteria ?? []).map((c) => ({
        criterionId: c.id,
        score: parseInt(scores[c.id], 10),
        comment: comments[c.id] || undefined,
      }))
      await evaluationService.saveScores(evaluation.id, { scores: items })
      await evaluationService.submitEvaluation(evaluation.id)
      setSuccess('Évaluation soumise avec succès')
      setTimeout(() => setSuccess(null), 3000)
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-40 bg-border rounded" />
          <div className="h-7 w-64 bg-border rounded-lg" />
          <div className="h-48 bg-border rounded-[14px]" />
        </div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <button
          onClick={() => router.push('/dashboard/expert/evaluations')}
          className="flex items-center gap-1 text-[11px] text-ink3 hover:text-moss transition-colors mb-4"
        >
          <ArrowLeft size={12} /> Retour aux évaluations
        </button>
        <Card className="text-center py-12">
          <ClipboardCheck size={28} className="mx-auto text-ink3 mb-3" />
          <p className="text-[13px] text-ink2 mb-4">Affectation introuvable.</p>
          <Button variant="outline" onClick={() => router.push('/dashboard/expert/evaluations')}>
            <ArrowLeft size={14} /> Retour
          </Button>
        </Card>
      </div>
    )
  }

  const criteria = evaluation?.template?.criteria ?? []
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0)
  const filledCount = criteria.filter((c) => scores[c.id] !== '').length
  const progress = criteria.length > 0 ? Math.round((filledCount / criteria.length) * 100) : 0

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <nav className="flex items-center gap-1 text-[11px] text-ink3 flex-wrap">
        <button onClick={() => router.push('/dashboard/expert/evaluations')} className="hover:text-moss transition-colors">
          Évaluations
        </button>
        <span>/</span>
        <span className="text-ink font-medium">{assignment.project?.name || 'Projet'}</span>
      </nav>

      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div>
          <h1 className="font-syne text-[22px] font-extrabold text-ink mb-1">{assignment.project?.name}</h1>
          <div className="flex items-center gap-2 text-[12px] text-ink3 flex-wrap">
            {assignment.cohort?.name && <span>{assignment.cohort.name}</span>}
            <Badge variant={
              evaluation?.status === 'SUBMITTED' ? 'green' :
              evaluation ? 'amber' : 'gray'
            }>
              {evaluation?.status === 'SUBMITTED' ? 'Soumise' : evaluation ? 'Brouillon' : 'À commencer'}
            </Badge>
            {assignment.deadline && (
              <span className="flex items-center gap-1">
                Échéance : {new Date(assignment.deadline).toLocaleDateString('fr-FR')}
              </span>
            )}
          </div>
          {assignment.project?.description && (
            <p className="text-[12px] text-ink2 mt-2 max-w-2xl line-clamp-3">{assignment.project.description}</p>
          )}
        </div>
      </div>

      {error && <ErrorAlert message={error} />}
      {success && <SuccessAlert message={success} />}

      {!evaluation ? (
        <Card className="text-center py-12">
          <ClipboardCheck size={28} className="mx-auto text-ink3 mb-3" />
          <p className="text-[13px] text-ink2 mb-4">
            Commencez votre évaluation en créant un brouillon avec la grille la plus récente.
          </p>
          <Button variant="primary" onClick={handleCreateDraft}>
            <ClipboardCheck size={13} /> Créer le brouillon
          </Button>
        </Card>
      ) : (
        <>
          {criteria.length > 0 && evaluation.status !== 'SUBMITTED' && (
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-ink3 font-medium">
                  Progression : {filledCount}/{criteria.length} critères renseignés
                </span>
                <span className="text-[11px] text-ink3 font-medium">{progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-moss rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </Card>
          )}

          <Card className="overflow-hidden">
            <CardHeader icon={<ClipboardCheck size={13} />} title={evaluation.template?.name ?? 'Grille d\'évaluation'}>
              <div className="flex items-center gap-2">
                <Badge variant={evaluation.template?.stage === 'FINAL' ? 'red' : 'blue'}>
                  {evaluation.template?.stage === 'FINAL' ? 'Finale' : 'Intermédiaire'}
                </Badge>
                {totalWeight > 0 && (
                  <Badge variant="gray">Poids total : {totalWeight}%</Badge>
                )}
              </div>
            </CardHeader>
            <div className="divide-y divide-border">
              {criteria.map((c) => (
                <CriterionRow
                  key={c.id}
                  criterion={c}
                  score={scores[c.id] ?? ''}
                  comment={comments[c.id] ?? ''}
                  disabled={evaluation.status === 'SUBMITTED'}
                  onScore={(v) => setScores((prev) => ({ ...prev, [c.id]: v }))}
                  onComment={(v) => setComments((prev) => ({ ...prev, [c.id]: v }))}
                />
              ))}
            </div>
          </Card>

          {evaluation.status !== 'SUBMITTED' && (
            <div className="flex gap-3 justify-end">
              <Button variant="outline" loading={saving} onClick={handleSave}>
                <Save size={13} /> Enregistrer le brouillon
              </Button>
              <Button variant="primary" loading={saving} onClick={handleSubmit}>
                <Send size={13} /> Soumettre l&apos;évaluation
              </Button>
            </div>
          )}

          {evaluation.status === 'SUBMITTED' && (
            <Card className="p-4 bg-moss-light border border-moss/20">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-moss" />
                <span className="text-[13px] font-semibold text-ink">
                  Évaluation soumise le {evaluation.submitted_at ? new Date(evaluation.submitted_at).toLocaleDateString('fr-FR') : '—'}
                </span>
              </div>
              {evaluation.total20 != null && (
                <p className="text-[12px] text-ink3 mt-1">
                  Note finale : {evaluation.total20.toFixed(1)}/20
                </p>
              )}
            </Card>
          )}
        </>
      )}

      {/* Scénario 16 : livrables nécessaires à l'évaluation (lecture seule) */}
      <Card className="overflow-hidden">
        <CardHeader icon={<FolderCheck size={13} />} title="Livrables du projet">
          <Badge variant="gray">Consultation seule</Badge>
        </CardHeader>
        <div className="p-[18px]">
          <DeliverablesPanel projectId={assignment.project_id} />
        </div>
      </Card>

      {/* Scénario 18 : confirmation avant soumission définitive */}
      {confirming && evaluation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-6"
          onClick={(e) => e.target === e.currentTarget && setConfirming(false)}
        >
          <Card className="w-full max-w-[440px] p-6">
            <h3 className="font-syne text-[15px] font-bold text-ink mb-2">Confirmer la soumission</h3>
            <p className="text-[12.5px] text-ink2 mb-1">
              Cette action est définitive.
            </p>
            <p className="text-[12.5px] text-ink3 mb-5">
              Après soumission, vous ne pourrez plus modifier cette évaluation.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setConfirming(false)}>
                Annuler
              </Button>
              <Button variant="primary" className="flex-1" loading={saving} onClick={handleConfirmedSubmit}>
                <Send size={13} /> Confirmer
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

function CriterionRow({
  criterion, score, comment, disabled, onScore, onComment,
}: {
  criterion: EvaluationCriterion
  score: string
  comment: string
  disabled: boolean
  onScore: (v: string) => void
  onComment: (v: string) => void
}) {
  return (
    <div className="p-[16px_18px]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-semibold text-ink">{criterion.name}</span>
            <Badge variant="gray">Poids {criterion.weight}%</Badge>
          </div>
          {criterion.description && <div className="text-[11px] text-ink3 mt-1">{criterion.description}</div>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[11px] text-ink3">Note (0–{criterion.max_score})</span>
          <input
            type="number"
            min={0}
            max={criterion.max_score}
            disabled={disabled}
            value={score}
            onChange={(e) => onScore(e.target.value)}
            className="w-[70px] font-dm text-[13px] px-[10px] py-[7px] border border-border rounded-lg bg-surface text-ink outline-none focus:border-moss transition-colors"
          />
        </div>
      </div>
      <Field label="Commentaire (optionnel)" className="mt-2 !mb-0">
        <Textarea
          rows={2}
          disabled={disabled}
          value={comment}
          onChange={(e) => onComment(e.target.value)}
          placeholder={`Commentaire pour « ${criterion.name} »...`}
          className="transition-colors"
        />
      </Field>
    </div>
  )
}
