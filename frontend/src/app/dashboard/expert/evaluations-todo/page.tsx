'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ClipboardCheck, ChevronRight } from 'lucide-react'
import { Badge, Button, Card } from '@/components/shared/ui'
import { evaluationService } from '@/services/evaluation.service'
import { EvaluationAssignment } from '@/types/coaching'

export default function ExpertEvaluationsTodoPage() {
  const router = useRouter()
  const [assignments, setAssignments] = useState<EvaluationAssignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    evaluationService
      .getMyTodo()
      .then(setAssignments)
      .finally(() => setLoading(false))
  }, [])

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

  const todo = assignments.filter((a) => a.todo)
  const done = assignments.filter((a) => !a.todo)

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <h1 className="font-syne text-[22px] font-extrabold text-ink mb-[2px]">Évaluations à faire</h1>
      <p className="text-[12px] text-ink3 mb-6">Projets qui vous ont été affectés en tant qu'évaluateur</p>

      {assignments.length === 0 ? (
        <Card className="text-center py-14">
          <div className="w-14 h-14 rounded-full bg-moss-light text-moss flex items-center justify-center mx-auto mb-4">
            <ClipboardCheck size={24} />
          </div>
          <p className="text-[15px] font-semibold text-ink mb-1">Aucune évaluation à faire</p>
          <p className="text-[12px] text-ink3">Vous n'avez pas encore d'affectation d'évaluation.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {todo.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-ink3 uppercase tracking-[0.1em] mb-2">À évaluer ({todo.length})</div>
              <div className="space-y-[8px]">
                {todo.map((a) => (
                  <Card
                    key={a.id}
                    className="p-[14px_16px] cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => router.push(`/dashboard/expert/evaluations-todo/${a.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-ink truncate">{a.project?.name || 'Projet inconnu'}</div>
                        <div className="text-[11px] text-ink3">
                          {a.cohort?.name}
                          {a.deadline && ` · Échéance : ${new Date(a.deadline).toLocaleDateString('fr-FR')}`}
                        </div>
                      </div>
                      <Badge variant={a.evaluation_status === 'DRAFT' ? 'amber' : 'blue'}>
                        {a.evaluation_status === 'DRAFT' ? 'Brouillon en cours' : 'À commencer'}
                      </Badge>
                      <ChevronRight size={14} className="text-ink3" />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {done.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-ink3 uppercase tracking-[0.1em] mb-2">Déjà soumises ({done.length})</div>
              <div className="space-y-[8px]">
                {done.map((a) => (
                  <Card key={a.id} className="p-[14px_16px] opacity-70">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-ink truncate">{a.project?.name || 'Projet inconnu'}</div>
                        <div className="text-[11px] text-ink3">{a.cohort?.name}</div>
                      </div>
                      <Badge variant="green">Soumise</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6">
        <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/expert/evaluations')}>
          Voir mes évaluations envoyées
        </Button>
      </div>
    </div>
  )
}
