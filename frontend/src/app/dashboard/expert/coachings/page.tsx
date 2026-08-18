'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { HeartHandshake, Edit3, ArrowUpRight } from 'lucide-react'
import { cohortService } from '@/services/cohort.service'
import { Badge, Button, Card, Field, Textarea, ErrorAlert, SuccessAlert } from '@/components/shared/ui'
import { Coaching } from '@/types/cohort'

export default function ExpertCoachingsPage() {
  const [coachings, setCoachings] = useState<Coaching[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editFeedback, setEditFeedback] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const fetchCoachings = () => {
    setLoading(true)
    cohortService
      .getMyCoachings()
      .then(setCoachings)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchCoachings() }, [])

  const startEdit = (c: Coaching) => {
    setEditingId(c.id)
    setEditFeedback(c.feedback || '')
  }

  const handleUpdate = async () => {
    if (!editingId) return
    setError(null)
    try {
      await cohortService.updateCoaching(editingId, {
        feedback: editFeedback || undefined,
      })
      setSuccess('Coaching mis à jour')
      setEditingId(null)
      fetchCoachings()
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
      <h1 className="font-syne text-[22px] font-extrabold text-ink mb-[2px]">Mes coachings</h1>
      <p className="text-[12px] text-ink3 mb-6">Suivi et feedback des projets que vous coachez</p>

      {error && <div className="mb-5"><ErrorAlert message={error} /></div>}
      {success && <div className="mb-5"><SuccessAlert message={success} /></div>}

      {coachings.length === 0 ? (
        <Card className="text-center py-14">
          <div className="w-14 h-14 rounded-full bg-moss-light text-moss flex items-center justify-center mx-auto mb-4">
            <HeartHandshake size={24} />
          </div>
          <p className="text-[15px] font-semibold text-ink mb-1">Aucun coaching</p>
          <p className="text-[12px] text-ink3">Vous n'avez pas encore de projets à coacher.</p>
        </Card>
      ) : (
        <div className="space-y-[10px]">
          {coachings.map((c) => (
            <Card key={c.id} className="p-[16px_18px]">
              {editingId === c.id ? (
                <div className="space-y-3">
                  <div className="text-[13px] font-medium text-ink">{c.project?.name}</div>
                  <Field label="Feedback">
                    <Textarea value={editFeedback} onChange={(e) => setEditFeedback(e.target.value)} rows={4} placeholder="Votre feedback de coaching..." />
                  </Field>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setEditingId(null)}>Annuler</Button>
                    <Button size="sm" variant="primary" onClick={handleUpdate}>Enregistrer</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-[14px]">
                  <div className="w-[40px] h-[40px] rounded-[10px] bg-moss-light border border-border flex items-center justify-center flex-shrink-0 mt-1">
                    <HeartHandshake size={18} className="text-moss" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-ink truncate">{c.project?.name || 'Projet inconnu'}</div>
                    <div className="text-[11px] text-ink3 mb-2">
                      {new Date(c.created_at).toLocaleDateString('fr-FR')}
                    </div>
                    {c.feedback && (
                      <div className="text-[12px] text-ink2 bg-surface border border-border rounded-lg p-3 leading-relaxed">
                        {c.feedback}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Link href={`/dashboard/expert/coaching/${c.project?.id}`}>
                      <Button size="sm" variant="outline">
                        <ArrowUpRight size={13} /> Suivi
                      </Button>
                    </Link>
                    <Button size="sm" variant="ghost" onClick={() => startEdit(c)}>
                      <Edit3 size={13} />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
