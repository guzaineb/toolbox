'use client'

import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { RefreshCw, MessageSquare, FileText, BarChart3, Lightbulb } from 'lucide-react'
import { getProjectState } from '@/services/coach.service'
import type { ProjectState } from '@/types/coach'
import {
  ProjectHealthCard,
  ProjectStatePanel,
  NextBestActionCard,
  InconsistencyPanel,
  MissingInfoPanel,
  RecommendationCard,
  CoachChat,
} from '@/components/coach'
import { LoadingState, Button } from '@/components/shared/ui'

type DashboardTab = 'overview' | 'chat' | 'documents' | 'analysis'

export default function CoachPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string
  const [state, setState] = useState<ProjectState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview')
  const chatRef = useRef<{ sendMessage: (msg: string) => void } | null>(null)

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

  const handleStartAction = useCallback((action: string) => {
    setActiveTab('chat')
    setTimeout(() => chatRef.current?.sendMessage(action), 100)
  }, [])

  const handleWhy = useCallback(() => {
    setActiveTab('chat')
    setTimeout(
      () =>
        chatRef.current?.sendMessage(
          'Pourquoi cette action est-elle recommandée ? Expliquez-moi le raisonnement.',
        ),
      100,
    )
  }, [])

  const handleDefer = useCallback(() => {
    // TODO: persist deferred action
  }, [])

  const handleGoToModule = useCallback(
    (module: string) => {
      router.push(`/dashboard/project-owner/projects/${projectId}/gbm?step=gbm_1`)
    },
    [router, projectId],
  )

  const handleGoToStep = useCallback(
    (stepKey: string) => {
      router.push(`/dashboard/project-owner/projects/${projectId}/gbm?step=${stepKey}`)
    },
    [router, projectId],
  )

  const handleViewDiagnostic = useCallback(() => {
    setActiveTab('analysis')
  }, [])

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

  const tabs: { key: DashboardTab; label: string; icon: typeof MessageSquare }[] = [
    { key: 'overview', label: "Vue d'ensemble", icon: BarChart3 },
    { key: 'chat', label: 'Coach IA', icon: MessageSquare },
    { key: 'documents', label: 'Documents', icon: FileText },
    { key: 'analysis', label: 'Diagnostic', icon: Lightbulb },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-[16px] font-bold text-ink font-syne">AI Project Coach</h1>
          {state && (
            <p className="text-[11px] text-ink3 font-dm mt-0.5">
              {state.projectName} · Maturité{' '}
              <span className="font-medium text-ink2">{state.maturityLevel}</span>
            </p>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={fetchState}>
          <RefreshCw className="w-3 h-3" />
        </Button>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 p-1 bg-ink/[.03] rounded-[10px] mb-4 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-dm font-medium
                transition-all duration-150 whitespace-nowrap
                ${
                  activeTab === tab.key
                    ? 'bg-white text-moss shadow-sm border border-ink/[.08]'
                    : 'text-ink3 hover:text-ink2 hover:bg-white/50'
                }
              `}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      {activeTab === 'overview' && state && (
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 min-h-[calc(100vh-180px)]">
          {/* Left sidebar: cards */}
          <div className="w-full md:w-[340px] shrink-0 space-y-3 overflow-y-auto md:max-h-[calc(100vh-180px)]">
            <ProjectHealthCard
              health={state.healthScore}
              onViewDiagnostic={handleViewDiagnostic}
            />

            <NextBestActionCard
              action={state.recommendedNextAction}
              priority={state.currentPriority}
              onStart={() => handleStartAction(state.recommendedNextAction)}
              onWhy={handleWhy}
              onDefer={handleDefer}
              onGoToModule={handleGoToModule}
            />

            <InconsistencyPanel
              inconsistencies={state.inconsistencies}
              onGoToModule={handleGoToModule}
            />

            <MissingInfoPanel
              incompleteSteps={state.incompleteSteps}
              missingInformation={state.missingInformation}
              onGoToStep={handleGoToStep}
            />
          </div>

          {/* Right: main content */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Quick summary row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-[10px] border border-ink/[.08] bg-white p-3 text-center">
                <span className="text-[20px] font-bold font-syne text-moss">
                  {state.completedSteps.length}
                </span>
                <p className="text-[9px] text-ink3 font-dm mt-0.5">Étapes complétées</p>
              </div>
              <div className="rounded-[10px] border border-ink/[.08] bg-white p-3 text-center">
                <span className="text-[20px] font-bold font-syne text-amber-dark">
                  {state.incompleteSteps.length}
                </span>
                <p className="text-[9px] text-ink3 font-dm mt-0.5">Étapes restantes</p>
              </div>
              <div className="rounded-[10px] border border-ink/[.08] bg-white p-3 text-center">
                <span className="text-[20px] font-bold font-syne text-red">
                  {state.inconsistencies.length}
                </span>
                <p className="text-[9px] text-ink3 font-dm mt-0.5">Incohérences</p>
              </div>
              <div className="rounded-[10px] border border-ink/[.08] bg-white p-3 text-center">
                <span className="text-[20px] font-bold font-syne text-ink">
                  {state.overallProgress}%
                </span>
                <p className="text-[9px] text-ink3 font-dm mt-0.5">Progression</p>
              </div>
            </div>

            <ProjectStatePanel
              completedSteps={state.completedSteps}
              incompleteSteps={state.incompleteSteps}
              onStepClick={handleGoToStep}
            />

            <RecommendationCard priorities={state.priorities} />

            {/* Strengths */}
            {state.strengths.length > 0 && (
              <div className="rounded-[12px] border border-moss/15 bg-moss-light/20 p-4">
                <h3 className="text-[11px] font-bold tracking-[0.06em] uppercase text-ink3 font-syne mb-2">
                  Points forts
                </h3>
                <ul className="space-y-1">
                  {state.strengths.slice(0, 5).map((s, i) => (
                    <li key={i} className="text-[11px] text-ink2 font-dm flex items-start gap-1.5">
                      <span className="text-moss mt-0.5">✓</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="rounded-[12px] border border-ink/[.08] bg-white overflow-hidden min-h-[calc(100vh-180px)]">
          <CoachChat projectId={projectId} ref={chatRef} />
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="rounded-[12px] border border-ink/[.08] bg-white p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-moss" />
            <h2 className="text-[13px] font-bold text-ink font-syne">Documents du projet</h2>
          </div>
          <p className="text-[11px] text-ink3 font-dm mb-4">
            Gérez les documents indexés pour améliorer les réponses du coach.
          </p>
          <CoachChat projectId={projectId} />
        </div>
      )}

      {activeTab === 'analysis' && state && (
        <div className="space-y-4">
          <div className="rounded-[12px] border border-ink/[.08] bg-white p-6">
            <h2 className="text-[14px] font-bold text-ink font-syne mb-4">
              Diagnostic du projet
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <ProjectHealthCard health={state.healthScore} />
              <div className="rounded-[12px] border border-ink/[.08] bg-white p-4">
                <h3 className="text-[11px] font-bold tracking-[0.06em] uppercase text-ink3 font-syne mb-2">
                  Maturité
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-[0.04em] px-[9px] py-[3px] rounded-full bg-moss-light text-moss border border-moss/20">
                  {state.maturityLevel}
                </span>
                <div className="mt-3">
                  <span className="text-[9px] font-bold text-ink3 font-dm uppercase tracking-wider">
                    Points forts
                  </span>
                  <ul className="mt-1 space-y-0.5">
                    {state.strengths.slice(0, 4).map((s, i) => (
                      <li key={i} className="text-[10px] text-ink2 font-dm flex items-start gap-1">
                        <span className="text-moss mt-0.5">✓</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                {state.weakAreas.length > 0 && (
                  <div className="mt-2">
                    <span className="text-[9px] font-bold text-ink3 font-dm uppercase tracking-wider">
                      Points de vigilance
                    </span>
                    <ul className="mt-1 space-y-0.5">
                      {state.weakAreas.slice(0, 4).map((w, i) => (
                        <li key={i} className="text-[10px] text-ink2 font-dm flex items-start gap-1">
                          <span className="text-amber mt-0.5">!</span>
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <InconsistencyPanel
              inconsistencies={state.inconsistencies}
              onGoToModule={handleGoToModule}
            />

            <div className="mt-4">
              <MissingInfoPanel
                incompleteSteps={state.incompleteSteps}
                missingInformation={state.missingInformation}
                onGoToStep={handleGoToStep}
              />
            </div>

            <div className="mt-4">
              <RecommendationCard priorities={state.priorities} />
            </div>
          </div>

          {/* AI Model Explanation */}
          <div className="rounded-[12px] border border-ink/[.08] bg-white p-6">
            <h2 className="text-[14px] font-bold text-ink font-syne mb-3">
              Comment l&apos;IA vous accompagne
            </h2>
            <div className="space-y-3 text-[11px] text-ink2 font-dm leading-relaxed">
              <p>
                Le coach IA analyse votre projet en croisant les données de vos étapes GBM,
                vos documents uploadés et les conversations précédentes.
              </p>
              <p>
                <strong className="text-ink">Analyse déterministe :</strong> Calcul du score de santé,
                détection des incohérences et recommandations basés sur des règles métier.
              </p>
              <p>
                <strong className="text-ink">Assistance conversationnelle :</strong> Pour les questions
                contextualisées, le coach utilise un LLM avec accès à votre base de connaissances
                (RAG) pour des réponses précises et sourcées.
              </p>
              <p>
                <strong className="text-ink">Sources transparentes :</strong> Chaque réponse indique
                les sources utilisées (étapes GBM, documents, conversations) pour une traçabilité
                complète.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
