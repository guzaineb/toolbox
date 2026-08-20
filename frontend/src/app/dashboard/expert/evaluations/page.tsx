'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ClipboardCheck, ChevronRight, Calendar, Clock } from 'lucide-react'
import { Badge, Button, Card, ErrorAlert } from '@/components/shared/ui'
import { evaluationService } from '@/services/evaluation.service'
import { EvaluationAssignment } from '@/types/coaching'

export default function ExpertEvaluationsPage() {
  const router = useRouter()
  const [assignments, setAssignments] = useState<EvaluationAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvaluations = () => {
    setLoading(true)
    setError(null)
    evaluationService
      .getMyTodo()
      .then(setAssignments)
      .catch(() => setError('Impossible de charger vos évaluations.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchEvaluations() }, [])

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-7 w-64 bg-border rounded-lg" />
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-border rounded-[14px]" />)}
        </div>
      </div>
    )
  }

  const pendingCount = assignments.filter((a) => !a.evaluation_status || a.evaluation_status === null).length
  const draftCount = assignments.filter((a) => a.evaluation_status === 'DRAFT').length
  const submittedCount = assignments.filter((a) => a.evaluation_status === 'SUBMITTED').length

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <h1 className="font-syne text-[22px] font-extrabold text-ink mb-[2px]">Mes évaluations</h1>
      <p className="text-[12px] text-ink3 mb-6">
        Les projets que vous devez évaluer en tant que membre du jury.
      </p>

      {error && <div className="mb-5"><ErrorAlert message={error} /></div>}

      {assignments.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="p-4 text-center">
            <div className="font-syne text-[20px] font-extrabold text-ink leading-none">{pendingCount}</div>
            <div className="text-[10px] text-ink3 uppercase tracking-[0.06em] font-semibold mt-1">À commencer</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="font-syne text-[20px] font-extrabold text-amber leading-none">{draftCount}</div>
            <div className="text-[10px] text-ink3 uppercase tracking-[0.06em] font-semibold mt-1">Brouillons</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="font-syne text-[20px] font-extrabold text-moss leading-none">{submittedCount}</div>
            <div className="text-[10px] text-ink3 uppercase tracking-[0.06em] font-semibold mt-1">Soumises</div>
          </Card>
        </div>
      )}

      {assignments.length === 0 ? (
        <Card className="text-center py-14">
          <div className="w-14 h-14 rounded-full bg-moss-light text-moss flex items-center justify-center mx-auto mb-4">
            <ClipboardCheck size={24} />
          </div>
          <p className="text-[15px] font-semibold text-ink mb-1">Aucune évaluation</p>
          <p className="text-[12px] text-ink3">Vous n&apos;avez aucune évaluation à réaliser actuellement.</p>
        </Card>
      ) : (
        <div className="space-y-[10px]">
          {assignments.map((a) => (
            <Card
              key={a.id}
              className="p-[16px_18px] cursor-pointer hover:shadow-md transition-shadow group"
              onClick={() => router.push(`/dashboard/expert/evaluations-todo/${a.id}`)}
            >
              <div className="flex items-start gap-[14px]">
                <div className="w-[42px] h-[42px] rounded-[10px] bg-purple-50 border border-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <ClipboardCheck size={18} className="text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] font-semibold text-ink group-hover:text-purple-600 transition-colors truncate">
                      {a.project?.name || 'Projet inconnu'}
                    </span>
                    <Badge variant="secondary">Jury</Badge>
                    <Badge variant={
                      a.evaluation_status === 'SUBMITTED' ? 'green' :
                      a.evaluation_status === 'DRAFT' ? 'amber' : 'gray'
                    }>
                      {a.evaluation_status === 'SUBMITTED' ? 'Soumise' :
                       a.evaluation_status === 'DRAFT' ? 'Brouillon en cours' : 'À commencer'}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-ink3 mt-0.5">
                    {a.cohort?.name && <span>{a.cohort.name}</span>}
                    {a.deadline && (
                      <span className="flex items-center gap-1 mt-0.5">
                        <Calendar size={10} />
                        Échéance : {new Date(a.deadline).toLocaleDateString('fr-FR')}
                        {new Date(a.deadline) < new Date() && a.evaluation_status !== 'SUBMITTED' && (
                          <Badge variant="red" className="ml-1">En retard</Badge>
                        )}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight size={14} className="text-ink3 group-hover:text-purple-600 transition-colors mt-2 flex-shrink-0" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
