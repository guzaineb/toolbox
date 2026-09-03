'use client'

import { useParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { getProjectState } from '@/services/coach.service'
import type { ProjectState } from '@/types/coach'
import {
  HealthScore,
  ProjectProgress,
  InconsistencyCard,
  NextAction,
  RecommendationCard,
  CoachChat,
} from '@/components/coach'
import { LoadingState } from '@/components/shared/ui'

export default function CoachPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const [state, setState] = useState<ProjectState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchState = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getProjectState(projectId)
      setState(data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur de chargement'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchState()
  }, [fetchState])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <LoadingState label="Chargement du coach…" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="rounded-[12px] border border-red/20 bg-red-light/30 p-6 text-center">
          <p className="text-[13px] text-red font-dm font-medium mb-2">
            Impossible de charger les données du projet
          </p>
          <p className="text-[11px] text-ink3 font-dm mb-3">{error}</p>
          <button
            onClick={fetchState}
            className="text-[11px] text-moss hover:text-moss-mid font-dm font-medium transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex gap-6 min-h-[calc(100vh-120px)]">
        {/* Left: Dashboard cards */}
        <div className="w-[340px] shrink-0 space-y-3 overflow-y-auto">
          {state && (
            <>
              <HealthScore health={state.healthScore} />
              <ProjectProgress overallProgress={state.overallProgress} />
              <InconsistencyCard inconsistencies={state.inconsistencies} />
              <NextAction action={state.recommendedNextAction} />
              <RecommendationCard priorities={state.priorities} />

              {/* Maturity badge */}
              <div className="rounded-[12px] border border-ink/[.08] bg-white p-4">
                <h3 className="text-[11px] font-bold tracking-[0.06em] uppercase text-ink3 font-syne mb-2">
                  Maturité
                </h3>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-[0.04em] px-[9px] py-[3px] rounded-full bg-moss-light text-moss border border-moss/20">
                    {state.maturityLevel}
                  </span>
                </div>
                {state.strengths.length > 0 && (
                  <div className="mt-2">
                    <span className="text-[9px] font-bold text-ink3 font-dm uppercase tracking-wider">
                      Points forts
                    </span>
                    <ul className="mt-1 space-y-0.5">
                      {state.strengths.slice(0, 3).map((s, i) => (
                        <li key={i} className="text-[10px] text-ink2 font-dm flex items-start gap-1">
                          <span className="text-moss mt-0.5">•</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right: Chat */}
        <div className="flex-1 min-w-0 rounded-[12px] border border-ink/[.08] bg-white overflow-hidden">
          <CoachChat projectId={projectId} />
        </div>
      </div>
    </div>
  )
}
