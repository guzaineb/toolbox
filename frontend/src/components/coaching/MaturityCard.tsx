'use client'

import { useEffect, useState } from 'react'
import { Gauge, RefreshCw } from 'lucide-react'
import { Card, CardHeader, ProgressBar, Button, ErrorAlert, LoadingState } from '@/components/shared/ui'
import { aiAnalysisService } from '@/services/ai-analysis.service'
import { MaturityScore, MATURITY_DIMENSION_LABELS } from '@/types/ai-analysis'

/**
 * Score de maturité global — 100% déterministe (calculé par le backend,
 * pondération : évaluation 30%, GBM 20%, BP 15%, marché 15%, impact 10%, coaching 10%).
 */
export function MaturityCard({ projectId }: { projectId: string }) {
  const [maturity, setMaturity] = useState<MaturityScore | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMaturity = () => {
    setLoading(true)
    aiAnalysisService
      .getMaturity(projectId)
      .then(setMaturity)
      .catch((err: { response?: { data?: { message?: string } } }) =>
        setError(err?.response?.data?.message ?? 'Erreur de chargement'),
      )
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (projectId) fetchMaturity()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  return (
    <Card>
      <CardHeader
        icon={<Gauge size={13} />}
        title="Score de maturité"
      >
        <Button variant="ghost" size="sm" onClick={fetchMaturity} disabled={loading}>
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Actualiser
        </Button>
      </CardHeader>
      <div className="p-[18px] space-y-4">
        {error && <ErrorAlert message={error} />}
        {loading && !maturity && <LoadingState label="Calcul du score…" />}
        {maturity && (
          <>
            <div className="flex items-end gap-2">
              <span className="font-syne text-[34px] font-extrabold leading-none text-moss">
                {Math.round(maturity.globalScore)}
              </span>
              <span className="text-[13px] text-ink3 mb-1">/100</span>
              <span className="ml-auto text-[10px] text-ink3">
                Calcul déterministe — aucune IA
              </span>
            </div>
            <div className="space-y-2.5">
              {maturity.dimensions.map((d) => (
                <div key={d.name}>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-ink2 font-medium">
                      {MATURITY_DIMENSION_LABELS[d.name] ?? d.name}
                      <span className="text-ink3 ml-1.5">({d.weight}%)</span>
                    </span>
                    <span className="text-ink3">{Math.round(d.score)}/100</span>
                  </div>
                  <ProgressBar value={d.score} max={100} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Card>
  )
}
