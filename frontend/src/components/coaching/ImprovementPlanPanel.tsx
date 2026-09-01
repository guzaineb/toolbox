'use client'

import { useCallback, useEffect, useState } from 'react'
import { ClipboardList, Sparkles, ShieldCheck, CheckCircle2, Circle } from 'lucide-react'
import { Badge, Button, Card, CardHeader, ErrorAlert, LoadingState } from '@/components/shared/ui'
import { aiAnalysisService } from '@/services/ai-analysis.service'
import { coachingService } from '@/services/coaching.service'
import { cohortService } from '@/services/cohort.service'
import { CoachingAction, ACTION_STATUS_LABELS } from '@/types/coaching'
import {
  IMPROVEMENT_PLAN_STATUS_LABELS,
  ImprovementObjectiveStatus,
  ImprovementPlan,
  OBJECTIVE_STATUS_LABELS,
} from '@/types/ai-analysis'

type Props = {
  projectId: string
  canManage?: boolean
}

/**
 * Plan d'amélioration généré par l'IA à partir d'une évaluation.
 * Human-in-the-loop : le brouillon IA n'est actif qu'après validation du coach.
 */
export function ImprovementPlanPanel({ projectId, canManage }: Props) {
  const [plans, setPlans] = useState<ImprovementPlan[]>([])
  const [actions, setActions] = useState<CoachingAction[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      aiAnalysisService.getProjectPlans(projectId),
      coachingService.getProjectActions(projectId).catch(() => [] as CoachingAction[]),
    ])
      .then(([list, acts]) => {
        setPlans(list)
        setActions(acts)
      })
      .catch((err: { response?: { data?: { message?: string } } }) =>
        setError(err?.response?.data?.message ?? 'Erreur de chargement'),
      )
      .finally(() => setLoading(false))
  }, [projectId])

  useEffect(() => {
    if (projectId) load()
  }, [projectId, load])

  const generate = async () => {
    setError(null)
    setGenerating(true)
    try {
      const evaluations = await cohortService.getProjectEvaluations(projectId)
      const latest = evaluations.find((e) => e.status === 'SUBMITTED')
      if (!latest) throw new Error('Aucune évaluation soumise : lancez d’abord une évaluation jury.')
      const result = await aiAnalysisService.generateImprovementPlan(projectId, latest.id)
      if (!result.planId) throw new Error("La génération a échoué — vérifiez la configuration IA.")
      load()
    } catch (err) {
      const message = err instanceof Error ? err.message : (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(message ?? 'La génération a échoué')
    } finally {
      setGenerating(false)
    }
  }

  const activatePlan = async (planId: string) => {
    try {
      await aiAnalysisService.updatePlan(planId, { status: 'ACTIVE' })
      load()
    } catch {
      setError("L'activation du plan a échoué")
    }
  }

  const toggleObjective = async (
    objectiveId: string,
    current: ImprovementObjectiveStatus,
  ) => {
    try {
      const next =
        current === 'COMPLETED'
          ? 'IN_PROGRESS'
          : current === 'IN_PROGRESS'
            ? 'COMPLETED'
            : 'IN_PROGRESS'
      await aiAnalysisService.updateObjective(objectiveId, { status: next })
      load()
    } catch {
      setError('La mise à jour de l’objectif a échoué')
    }
  }

  return (
    <Card>
      <CardHeader icon={<ClipboardList size={13} />} title="Plan d'amélioration">
        {canManage && (
          <Button variant="outline" size="sm" onClick={generate} disabled={generating}>
            <Sparkles size={12} className={generating ? 'animate-pulse' : ''} />
            {generating ? 'Génération…' : 'Générer depuis la dernière évaluation'}
          </Button>
        )}
      </CardHeader>
      <div className="p-[18px] space-y-4">
        {error && <ErrorAlert message={error} />}
        {loading && <LoadingState label="Chargement des plans…" />}

        {!loading && plans.length === 0 && (
          <p className="text-[12px] text-ink3">
            Aucun plan d&apos;amélioration. Générez-en un depuis la dernière évaluation soumise : l&apos;IA
            propose objectifs et priorités, puis le coach valide le plan avant activation.
          </p>
        )}

        {plans.map((plan) => (
          <div key={plan.id} className="border border-border rounded-[12px] overflow-hidden">
            <div className="flex items-center justify-between gap-2 px-[14px] py-2.5 bg-surface-2 border-b border-border flex-wrap">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-syne text-[13px] font-bold text-ink truncate">{plan.title ?? 'Plan'}</span>
                <Badge variant={plan.status === 'ACTIVE' ? 'green' : plan.status === 'DRAFT' ? 'amber' : 'gray'}>
                  {plan.status === 'DRAFT' && <ShieldCheck size={10} className="mr-0.5 inline" />}
                  {IMPROVEMENT_PLAN_STATUS_LABELS[plan.status]}
                </Badge>
              </div>
              {canManage && plan.status === 'DRAFT' && (
                <Button variant="primary" size="sm" onClick={() => activatePlan(plan.id)}>
                  Valider &amp; activer
                </Button>
              )}
            </div>

            {plan.description && (
              <p className="px-[14px] pt-2.5 text-[12px] text-ink2">{plan.description}</p>
            )}

            <div className="p-[14px] space-y-2">
              {(plan.objectives ?? []).length === 0 && (
                <p className="text-[11px] text-ink3">Aucun objectif.</p>
              )}
              {(plan.objectives ?? []).map((o) => (
                <button
                  key={o.id}
                  onClick={() => toggleObjective(o.id, o.status)}
                  disabled={plan.status !== 'ACTIVE'}
                  className={`w-full text-left flex items-start gap-2.5 border border-border rounded-[10px] p-3 transition-colors ${
                    plan.status === 'ACTIVE' ? 'hover:border-moss/40 cursor-pointer bg-surface' : 'bg-surface-2/40 opacity-80 cursor-default'
                  }`}
                >
                  {o.status === 'COMPLETED' ? (
                    <CheckCircle2 size={15} className="text-moss shrink-0 mt-0.5" />
                  ) : (
                    <Circle size={15} className="text-ink3 shrink-0 mt-0.5" />
                  )}
                  <span className="flex-1 min-w-0">
                    <span className={`block text-[12px] font-medium ${o.status === 'COMPLETED' ? 'text-ink3 line-through' : 'text-ink'}`}>
                      {o.title}
                    </span>
                    {o.description && <span className="block text-[11px] text-ink3 mt-0.5">{o.description}</span>}
                    <span className="block mt-1.5">
                      <Badge variant={o.priority === 'HIGH' ? 'red' : o.priority === 'MEDIUM' ? 'blue' : 'gray'}>
                        {o.priority}
                      </Badge>{' '}
                      <span className="text-[10px] text-ink3 ml-1">{OBJECTIVE_STATUS_LABELS[o.status]} · {o.progress}%</span>
                    </span>
                    {actions.filter((a) => a.objective_id === o.id).length > 0 && (
                      <span className="block mt-2 pt-2 border-t border-border space-y-1">
                        {actions.filter((a) => a.objective_id === o.id).map((a) => (
                          <span key={a.id} className="flex items-center justify-between gap-2 text-[11px]">
                            <span className="text-ink3 truncate">{a.title}</span>
                            <Badge variant={a.status === 'COMPLETED' ? 'green' : a.status === 'REJECTED' || a.status === 'OVERDUE' ? 'red' : a.status === 'SUBMITTED' ? 'amber' : 'gray'}>
                              {ACTION_STATUS_LABELS[a.status]}
                            </Badge>
                          </span>
                        ))}
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </div>

            <div className="px-[14px] pb-[14px]">
              <div className="flex justify-between text-[10px] text-ink3 mb-1">
                <span>Progression du plan</span>
                <span>{plan.progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden">
                <div className="h-full bg-moss rounded-full transition-all" style={{ width: `${plan.progress}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
