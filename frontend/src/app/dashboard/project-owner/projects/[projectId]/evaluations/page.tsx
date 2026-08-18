'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ClipboardCheck, Scale, Gavel } from 'lucide-react'
import { Badge, Card, CardHeader, ErrorAlert, LoadingState } from '@/components/shared/ui'
import { evaluationService } from '@/services/evaluation.service'
import {
  EvaluationSummary, JurySession, FinalDecisionView,
  JURY_STATUS_LABELS, JURY_STATUS_COLORS,
  DECISION_LABELS, DECISION_COLORS,
  CONDITION_STATUS_LABELS, CONDITION_STATUS_COLORS,
} from '@/types/coaching'
import { getErrorMessage } from '@/lib/utils'

export default function ProjectEvaluationsPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string

  const [summary, setSummary] = useState<EvaluationSummary | null>(null)
  const [jurySessions, setJurySessions] = useState<JurySession[]>([])
  const [decision, setDecision] = useState<FinalDecisionView | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!projectId) return
    setLoading(true)
    setError(null)
    try {
      const [s, j, d] = await Promise.all([
        evaluationService.getProjectSummary(projectId).catch(() => null),
        evaluationService.getProjectJurySessions(projectId).catch(() => [] as JurySession[]),
        evaluationService.getProjectDecision(projectId).catch(() => null),
      ])
      setSummary(s)
      setJurySessions(j)
      setDecision(d)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => { load() }, [load])

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-7 w-64 bg-border rounded-lg" />
          <div className="h-40 bg-border rounded-[14px]" />
          <div className="h-40 bg-border rounded-[14px]" />
        </div>
      </div>
    )
  }

  const latest = decision?.latest ?? null

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <button onClick={() => router.push(`/dashboard/project-owner/projects/${projectId}`)} className="flex items-center gap-1 text-[11px] text-ink3 hover:text-moss transition-colors">
        <ArrowLeft size={12} /> Retour au projet
      </button>

      <div className="flex items-start gap-4">
        <div className="w-[40px] h-[40px] rounded-[10px] bg-moss-light border border-border flex items-center justify-center flex-shrink-0">
          <ClipboardCheck size={18} className="text-moss" />
        </div>
        <div>
          <h1 className="font-syne text-[22px] font-extrabold text-ink mb-1">Évaluation & décision</h1>
          <p className="text-[12px] text-ink3">Résultats des évaluations, sessions du jury et décision finale</p>
        </div>
      </div>

      {error && <ErrorAlert message={error} />}

      {/* Résumé */}
      <Card className="overflow-hidden">
        <CardHeader icon={<Scale size={13} />} title="Résumé des évaluations" />
        <div className="p-[18px]">
          {!summary || summary.submitted === 0 ? (
            <p className="text-[12px] text-ink3">Aucune évaluation soumise pour le moment.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <Card className="p-4">
                <div className="font-syne text-[24px] font-extrabold text-ink leading-none">{summary.average20 ?? '—'}/20</div>
                <div className="text-[10px] text-ink3 uppercase tracking-[0.06em] font-semibold mt-1">Moyenne</div>
              </Card>
              <Card className="p-4">
                <div className="font-syne text-[24px] font-extrabold text-moss leading-none">{summary.min20 ?? '—'}/20</div>
                <div className="text-[10px] text-ink3 uppercase tracking-[0.06em] font-semibold mt-1">Min</div>
              </Card>
              <Card className="p-4">
                <div className="font-syne text-[24px] font-extrabold text-amber leading-none">{summary.max20 ?? '—'}/20</div>
                <div className="text-[10px] text-ink3 uppercase tracking-[0.06em] font-semibold mt-1">Max</div>
              </Card>
              <Card className="p-4">
                <div className="font-syne text-[24px] font-extrabold text-ink leading-none">{summary.submitted}</div>
                <div className="text-[10px] text-ink3 uppercase tracking-[0.06em] font-semibold mt-1">Évaluations reçues</div>
              </Card>
            </div>
          )}

          {summary && summary.byEvaluator.length > 0 && (
            <div className="mt-4">
              <div className="text-[11px] font-bold text-ink3 uppercase tracking-[0.1em] mb-2">Par évaluateur</div>
              <div className="space-y-[6px]">
                {summary.byEvaluator.map((e, i) => (
                  <div key={i} className="flex items-center gap-3 text-[12px]">
                    <span className="flex-1 text-ink2">
                      {e.evaluator.profile
                        ? `${e.evaluator.profile.first_name} ${e.evaluator.profile.last_name}`
                        : e.evaluator.email}
                    </span>
                    <span className="font-bold text-ink">{e.total20}/20</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {summary && summary.byCriterion.length > 0 && (
            <div className="mt-4">
              <div className="text-[11px] font-bold text-ink3 uppercase tracking-[0.1em] mb-2">Par critère</div>
              <div className="space-y-[6px]">
                {summary.byCriterion.map((c) => (
                  <div key={c.criterion_id} className="flex items-center gap-3 text-[12px]">
                    <span className="flex-1 text-ink2">{c.name} <span className="text-ink3">(poids {c.weight}%)</span></span>
                    <span className="font-bold text-ink">{c.average}/{c.max_score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Décision finale */}
      <Card className="overflow-hidden">
        <CardHeader icon={<Scale size={13} />} title="Décision finale">
          {latest && (
            <Badge variant={DECISION_COLORS[latest.decision]}>{DECISION_LABELS[latest.decision]}</Badge>
          )}
        </CardHeader>
        <div className="p-[18px]">
          {!latest ? (
            <p className="text-[12px] text-ink3">Aucune décision finale rendue pour le moment.</p>
          ) : (
            <div className="space-y-3">
              <div className="text-[12px] text-ink2">
                Décision rendue le {new Date(latest.decided_at).toLocaleDateString('fr-FR')}
                {latest.final_score !== undefined && latest.final_score !== null && (
                  <> · Note finale : <span className="font-bold text-ink">{latest.final_score}</span></>
                )}
                {latest.new_end_date && (
                  <> · Nouvelle date de fin : {new Date(latest.new_end_date).toLocaleDateString('fr-FR')}</>
                )}
              </div>
              {latest.justification && (
                <div className="text-[12px] text-ink2 bg-surface border border-border rounded-lg p-3 leading-relaxed">
                  {latest.justification}
                </div>
              )}
              {latest.conditions && latest.conditions.length > 0 && (
                <div className="mt-3">
                  <div className="text-[11px] font-bold text-ink3 uppercase tracking-[0.1em] mb-2">Conditions</div>
                  <div className="space-y-[6px]">
                    {latest.conditions.map((c) => (
                      <div key={c.id} className="flex items-center gap-3 text-[12px]">
                        <div className="flex-1 min-w-0">
                          <span className="text-ink2">{c.description}</span>
                          {c.deadline && (
                            <span className="text-ink3"> · Échéance : {new Date(c.deadline).toLocaleDateString('fr-FR')}</span>
                          )}
                        </div>
                        <Badge variant={CONDITION_STATUS_COLORS[c.status]}>{CONDITION_STATUS_LABELS[c.status]}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Sessions du jury */}
      <Card className="overflow-hidden">
        <CardHeader icon={<Gavel size={13} />} title="Sessions du jury" />
        <div className="p-[18px]">
          {jurySessions.length === 0 ? (
            <p className="text-[12px] text-ink3">Aucune session de jury pour le moment.</p>
          ) : (
            <div className="space-y-[8px]">
              {jurySessions.map((s) => (
                <div key={s.id} className="flex items-center gap-3 text-[12px]">
                  <div className="flex-1 min-w-0">
                    <span className="text-ink2 font-medium">{s.title || 'Session du jury'}</span>
                    <span className="text-ink3"> · {s.members?.length ?? 0} membre(s)</span>
                    {s.reevaluation_requested && (
                      <Badge variant="amber" className="ml-2">Réévaluation requise</Badge>
                    )}
                  </div>
                  <Badge variant={JURY_STATUS_COLORS[s.status]}>{JURY_STATUS_LABELS[s.status]}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
