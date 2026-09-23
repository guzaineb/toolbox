'use client'

import { useEffect, useState } from 'react'
import {
  BrainCircuit, ShieldAlert, TrendingUp, CheckCheck, Sparkles, AlertTriangle,
} from 'lucide-react'
import { Badge, Button, Card, CardHeader, ErrorAlert, LoadingState } from '@/components/shared/ui'
import { coachingService } from '@/services/coaching.service'
import { aiAnalysisService } from '@/services/ai-analysis.service'
import { cohortService } from '@/services/cohort.service'
import {
  AiAnalysis,
  AREA_LABELS,
  EvaluationAnalysisPayload,
  RiskAnalysisPayload,
  SEVERITY_COLORS,
  SEVERITY_LABELS,
} from '@/types/ai-analysis'

type Props = {
  projectId: string
  onRecommendationCreated?: () => void
}

/**
 * Analyse IA du projet : évaluation + risques.
 * Toute suggestion reste une PROPOSITION — le coach valide explicitement
 * chaque recommandation avant qu'elle n'apparaisse dans le suivi officiel.
 */
export function AiAnalysisPanel({ projectId, onRecommendationCreated }: Props) {
  const [analyses, setAnalyses] = useState<AiAnalysis[]>([])
  const [evaluations, setEvaluations] = useState<Array<{ id: string; status?: string; score?: number | null }>>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [riskAnalyzing, setRiskAnalyzing] = useState(false)
  const [risk, setRisk] = useState<RiskAnalysisPayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [validatedTitles, setValidatedTitles] = useState<string[]>([])

  const load = () => {
    setLoading(true)
    Promise.all([
      aiAnalysisService.listAnalyses(projectId),
      cohortService.getProjectEvaluations(projectId).catch(() => []),
    ])
      .then(([a, e]) => {
        setAnalyses(a)
        setEvaluations(e.filter((x) => x.status === 'SUBMITTED'))
      })
      .catch((err: { response?: { data?: { message?: string } } }) =>
        setError(err?.response?.data?.message ?? 'Erreur de chargement'),
      )
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (projectId) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  const latestCompleted = analyses.find((a) => a.type === 'EVALUATION_ANALYSIS' && a.status === 'COMPLETED')
  const payload = latestCompleted?.payload as unknown as EvaluationAnalysisPayload | undefined

  const runAnalysis = async () => {
    // Analyse sur la dernière évaluation soumise ; sinon analyse de contexte global
    setError(null)
    setAnalyzing(true)
    try {
      const target = evaluations[0]?.id
      if (!target) throw new Error('Aucune évaluation soumise à analyser pour ce projet')
      await aiAnalysisService.analyzeEvaluation(projectId, target)
      load()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(message ?? "L'analyse IA a échoué")
    } finally {
      setAnalyzing(false)
    }
  }

  const runRiskAnalysis = async () => {
    setError(null)
    setRiskAnalyzing(true)
    try {
      const result = await aiAnalysisService.analyzeRisks(projectId)
      setRisk(result.data)
      if (!result.data) setError("L'analyse de risques a échoué — vérifiez la configuration IA.")
    } catch {
      setError("L'analyse de risques a échoué — vérifiez la configuration IA.")
    } finally {
      setRiskAnalyzing(false)
    }
  }

  const validateAsRecommendation = async (rec: { title: string; priority: string }, area?: string) => {
    if (!latestCompleted) return
    try {
      await coachingService.createRecommendationFromAi(projectId, {
        title: rec.title,
        content: `Suggestion IA (${AREA_LABELS[area ?? 'general'] ?? area}) validée par le coach.`,
        priority: rec.priority as 'LOW' | 'MEDIUM' | 'HIGH',
        aiAnalysisId: latestCompleted.id,
      })
      setValidatedTitles((prev) => [...prev, rec.title])
      onRecommendationCreated?.()
    } catch {
      setError('La validation de la recommandation a échoué')
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader icon={<BrainCircuit size={13} />} title="Analyse IA du projet">
          <Button variant="outline" size="sm" onClick={runAnalysis} disabled={analyzing || loading}>
            <Sparkles size={12} className={analyzing ? 'animate-pulse' : ''} />
            {analyzing ? 'Analyse en cours…' : 'Lancer l’analyse'}
          </Button>
        </CardHeader>
        <div className="p-[18px] space-y-4">
          {error && <ErrorAlert message={error} />}
          {loading && <LoadingState label="Chargement des analyses…" />}

          {!loading && !payload && !analyzing && (
            <p className="text-[12px] text-ink3">
              Aucune analyse terminée. Lancez une analyse pour obtenir forces, faiblesses, risques et
              recommandations actionnables à partir des données réelles du projet.
            </p>
          )}

          {payload && (
            <>
              <Section title="Synthèse" text={payload.summary} />

              {payload.strengths.length > 0 && (
                <PointList title="Points forts" points={payload.strengths} tone="green" />
              )}
              {payload.weaknesses.length > 0 && (
                <PointList title="Faiblesses" points={payload.weaknesses} tone="amber" withSeverity />
              )}

              {payload.recommendations.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-ink3 mb-2 flex items-center gap-1.5">
                    <TrendingUp size={12} /> Recommandations proposées par l’IA
                    <span className="normal-case font-normal">— validez celles que vous retenez</span>
                  </div>
                  <div className="space-y-2">
                    {payload.recommendations.map((rec) => (
                      <div key={rec.title} className="flex items-start justify-between gap-3 border border-border rounded-[10px] p-3 bg-surface-2/50">
                        <div>
                          <div className="text-[12px] font-semibold text-ink">{rec.title}</div>
                          {rec.reason && <div className="text-[11px] text-ink3 mt-0.5">{rec.reason}</div>}
                        </div>
                        {validatedTitles.includes(rec.title) ? (
                          <Badge variant="green"><CheckCheck size={10} className="mr-1 inline" />Validée</Badge>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => validateAsRecommendation(rec)}>
                            Valider en recommandation
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {payload.suggestedQuestions.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-ink3 mb-2">Questions suggérées</div>
                  <ul className="space-y-1">
                    {payload.suggestedQuestions.map((q) => (
                      <li key={q} className="text-[12px] text-ink2 flex gap-2"><span className="text-moss">•</span>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader icon={<ShieldAlert size={13} />} title="Analyse de risques">
          <Button variant="outline" size="sm" onClick={runRiskAnalysis} disabled={riskAnalyzing}>
            {riskAnalyzing ? 'Analyse…' : 'Analyser les risques'}
          </Button>
        </CardHeader>
        {risk && (
          <div className="p-[18px] space-y-3">
            <Badge variant={risk.overallLevel === 'HIGH' ? 'red' : risk.overallLevel === 'MEDIUM' ? 'amber' : 'green'}>
              Niveau global : {SEVERITY_LABELS[risk.overallLevel]}
            </Badge>
            {risk.risks.map((r) => (
              <div key={`${r.category}-${r.description.slice(0, 20)}`} className="border border-border rounded-[10px] p-3 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Badge variant={SEVERITY_COLORS[r.severity]}>{SEVERITY_LABELS[r.severity]}</Badge>
                  <span className="text-[11px] font-semibold text-ink2 uppercase tracking-wide">{r.category}</span>
                </div>
                <p className="text-[12px] text-ink">{r.description}</p>
                {r.evidence && <p className="text-[11px] text-ink3 italic">Donnée projet : {r.evidence}</p>}
                {r.recommendedAction && (
                  <p className="text-[11px] text-moss font-medium">→ {r.recommendedAction}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

function Section({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-ink3 mb-1.5">{title}</div>
      <p className="text-[13px] text-ink leading-relaxed">{text}</p>
    </div>
  )
}

function PointList({
  title,
  points,
  tone,
  withSeverity,
}: {
  title: string
  points: Array<{ area: string; description: string; severity?: string; evidence?: string | null }>
  tone: 'green' | 'amber'
  withSeverity?: boolean
}) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-ink3 mb-2 flex items-center gap-1.5">
        {tone === 'amber' && <AlertTriangle size={12} />}
        {title}
      </div>
      <div className="space-y-2">
        {points.map((p) => (
          <div key={p.description.slice(0, 30)} className="flex items-start gap-2.5 border border-border rounded-[10px] p-3">
            <Badge variant={tone === 'green' ? 'green' : 'blue'} className="shrink-0 mt-0.5">
              {AREA_LABELS[p.area] ?? p.area}
            </Badge>
            <div className="flex-1">
              <p className="text-[12px] text-ink">{p.description}</p>
              {p.evidence && <p className="text-[11px] text-ink3 italic mt-0.5">{p.evidence}</p>}
            </div>
            {withSeverity && p.severity && (
              <Badge variant={SEVERITY_COLORS[p.severity]}>{SEVERITY_LABELS[p.severity]}</Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
