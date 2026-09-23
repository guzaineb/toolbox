'use client'

import { useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { Badge, Button, Card, CardHeader, ErrorAlert, LoadingState } from '@/components/shared/ui'
import { aiAnalysisService } from '@/services/ai-analysis.service'
import { cohortService } from '@/services/cohort.service'
import { ProgressAnalysisPayload } from '@/types/ai-analysis'

/**
 * Progression entre les deux dernières évaluations jury soumises.
 * Les chiffres (scores, deltas) sont calculés par le backend ; l'IA n'écrit que le narratif.
 */
export function ProgressPanel({ projectId }: { projectId: string }) {
  const [analysis, setAnalysis] = useState<ProgressAnalysisPayload | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = async () => {
    setError(null)
    setLoading(true)
    try {
      const evaluations = await cohortService.getProjectEvaluations(projectId)
      const submitted = evaluations
        .filter((e) => e.status === 'SUBMITTED')
        .sort((a, b) => new Date(b.submitted_at ?? b.created_at).getTime() - new Date(a.submitted_at ?? a.created_at).getTime())
      if (submitted.length < 2) {
        throw new Error('Il faut au moins deux évaluations soumiss pour mesurer une progression.')
      }
      const result = await aiAnalysisService.analyzeProgress(
        projectId,
        submitted[submitted.length - 1].id,
        submitted[0].id,
      )
      if (!result.data) throw new Error("L'analyse de progression a échoué — vérifiez la configuration IA.")
      setAnalysis(result.data)
    } catch (err) {
      const message = err instanceof Error ? err.message : undefined
      setError(message ?? "L'analyse de progression a échoué")
    } finally {
      setLoading(false)
    }
  }

  const deltaColor =
    analysis?.overallDelta === null || analysis?.overallDelta === undefined
      ? 'gray'
      : analysis.overallDelta >= 0
        ? 'green'
        : 'red'

  return (
    <Card>
      <CardHeader icon={<TrendingUp size={13} />} title="Progression entre évaluations">
        <Button variant="outline" size="sm" onClick={run} disabled={loading}>
          {loading ? 'Analyse…' : 'Mesurer la progression'}
        </Button>
      </CardHeader>
      <div className="p-[18px] space-y-4">
        {error && <ErrorAlert message={error} />}
        {loading && <LoadingState label="Comparaison en cours…" />}

        {!analysis && !loading && !error && (
          <p className="text-[12px] text-ink3">
            Comparez les deux dernières évaluations du jury : évolution par critère, actions de
            coaching réalisées et analyse narrative des changements.
          </p>
        )}

        {analysis && (
          <>
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <div className="text-[10px] text-ink3 uppercase tracking-[0.06em] font-semibold">Avant</div>
                <div className="font-syne text-[22px] font-extrabold text-ink2">{analysis.overallBefore ?? '—'}/20</div>
              </div>
              <TrendingUp size={16} className="text-ink3" />
              <div>
                <div className="text-[10px] text-ink3 uppercase tracking-[0.06em] font-semibold">Après</div>
                <div className="font-syne text-[22px] font-extrabold text-moss">{analysis.overallAfter ?? '—'}/20</div>
              </div>
              <Badge variant={deltaColor}>
                {analysis.overallDelta !== null && analysis.overallDelta > 0 ? '+' : ''}
                {analysis.overallDelta ?? '—'} pts
              </Badge>
              <span className="text-[11px] text-ink3 ml-auto">
                Coaching : {analysis.actionsCompleted}/{analysis.actionsTotal} actions ·{' '}
                {analysis.sessionsCompleted} sessions réalisées
              </span>
            </div>

            {analysis.dimensions.length > 0 && (
              <div className="space-y-1.5">
                {analysis.dimensions.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-[12px] border-b border-border/60 pb-1.5">
                    <span className="text-ink2">{d.name}</span>
                    <span className="text-ink3 tabular-nums">
                      {d.before ?? '—'} → {d.after ?? '—'}{' '}
                      {d.delta !== null && (
                        <span className={d.delta >= 0 ? 'text-moss font-semibold' : 'text-red font-semibold'}>
                          ({d.delta >= 0 ? '+' : ''}
                          {d.delta})
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {analysis.narrative && <p className="text-[13px] text-ink leading-relaxed">{analysis.narrative}</p>}

            <div className="grid md:grid-cols-2 gap-3">
              <ListBlock title="Améliorations" items={analysis.improvements} tone="green" />
              <ListBlock title="Faiblesses persistantes" items={analysis.persistentWeaknesses} tone="amber" />
              <ListBlock title="Nouveaux risques" items={analysis.newRisks} tone="red" />
              <ListBlock title="Priorités suivantes" items={analysis.nextPriorities} tone="blue" />
            </div>
          </>
        )}
      </div>
    </Card>
  )
}

function ListBlock({
  title,
  items,
  tone,
}: {
  title: string
  items: string[]
  tone: 'green' | 'amber' | 'red' | 'blue'
}) {
  if (items.length === 0) return null
  const dot = tone === 'green' ? 'text-moss' : tone === 'amber' ? 'text-amber' : tone === 'red' ? 'text-red' : 'text-blue-600'
  return (
    <div className="border border-border rounded-[10px] p-3">
      <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-ink3 mb-2">{title}</div>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.slice(0, 40)} className="text-[12px] text-ink2 flex gap-2">
            <span className={dot}>•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
