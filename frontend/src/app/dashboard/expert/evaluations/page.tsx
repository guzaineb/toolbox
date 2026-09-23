'use client'

import { useEffect, useState } from 'react'
import { ClipboardCheck, Star, Edit3 } from 'lucide-react'
import { cohortService } from '@/services/cohort.service'
import { Badge, Button, Card, Field, Input, Textarea, ErrorAlert, SuccessAlert } from '@/components/shared/ui'
import { Evaluation } from '@/types/cohort'

export default function ExpertEvaluationsPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editScore, setEditScore] = useState('')
  const [editComment, setEditComment] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const fetchEvaluations = () => {
    setLoading(true)
    cohortService
      .getMyEvaluations()
      .then(setEvaluations)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchEvaluations() }, [])

  const startEdit = (ev: Evaluation) => {
    setEditingId(ev.id)
    setEditScore(String(ev.score))
    setEditComment(ev.comment || '')
  }

  const handleUpdate = async () => {
    if (!editingId) return
    setError(null)
    try {
      await cohortService.updateEvaluation(editingId, {
        score: parseFloat(editScore),
        comment: editComment || undefined,
      })
      setSuccess('Évaluation mise à jour')
      setEditingId(null)
      fetchEvaluations()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erreur lors de la mise à jour')
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-7 w-64 bg-border rounded-lg" />
          {[1, 2].map((i) => <div key={i} className="h-20 bg-border rounded-[14px]" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <h1 className="font-syne text-[22px] font-extrabold text-ink mb-[2px]">Mes évaluations</h1>
      <p className="text-[12px] text-ink3 mb-6">Projets que vous avez évalués en tant que jury</p>

      {error && <div className="mb-5"><ErrorAlert message={error} /></div>}
      {success && <div className="mb-5"><SuccessAlert message={success} /></div>}

      {evaluations.length === 0 ? (
        <Card className="text-center py-14">
          <div className="w-14 h-14 rounded-full bg-moss-light text-moss flex items-center justify-center mx-auto mb-4">
            <ClipboardCheck size={24} />
          </div>
          <p className="text-[15px] font-semibold text-ink mb-1">Aucune évaluation</p>
          <p className="text-[12px] text-ink3">Vous n'avez pas encore évalué de projets.</p>
        </Card>
      ) : (
        <div className="space-y-[10px]">
          {evaluations.map((ev) => (
            <Card key={ev.id} className="p-[16px_18px]">
              {editingId === ev.id ? (
                <div className="space-y-3">
                  <div className="text-[13px] font-medium text-ink">{ev.project?.name}</div>
                  <Field label="Note (sur 20)">
                    <Input type="number" min={0} max={20} step={0.5} value={editScore} onChange={(e) => setEditScore(e.target.value)} />
                  </Field>
                  <Field label="Commentaire">
                    <Textarea value={editComment} onChange={(e) => setEditComment(e.target.value)} rows={3} />
                  </Field>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setEditingId(null)}>Annuler</Button>
                    <Button size="sm" variant="primary" onClick={handleUpdate}>Enregistrer</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-[14px]">
                  <div className="w-[40px] h-[40px] rounded-[10px] bg-moss-light border border-border flex items-center justify-center flex-shrink-0">
                    <Star size={18} className="text-moss" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-ink truncate">{ev.project?.name || 'Projet inconnu'}</div>
                    <div className="text-[11px] text-ink3">
                      {new Date(ev.created_at).toLocaleDateString('fr-FR')}
                      {ev.comment && ` · ${ev.comment.substring(0, 60)}${ev.comment.length > 60 ? '...' : ''}`}
                    </div>
                  </div>
                  <div className="font-syne text-[18px] font-extrabold text-moss">{ev.score}/20</div>
                  <Button size="sm" variant="ghost" onClick={() => startEdit(ev)}>
                    <Edit3 size={13} />
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
