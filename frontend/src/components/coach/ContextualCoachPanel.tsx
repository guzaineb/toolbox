'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Bot,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Search,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  ArrowRight,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { askCoach } from '@/services/coach.service'
import { cn } from '@/lib/utils'
import type { ChatbotAskResult, ModuleContext } from '@/types/coach'

interface ContextualCoachPanelProps {
  projectId: string
  module: string
  section?: string
  step?: string
  formData?: Record<string, unknown>
  className?: string
}

interface ActionDef {
  id: string
  label: string
  question: string
  icon: React.ReactNode
  color: string
}

const MODULE_ACTIONS: ActionDef[] = [
  {
    id: 'explain',
    label: 'Expliquer cette section',
    question: 'Peux-tu m\'expliquer cette section et ce qu\'on attend de moi ?',
    icon: <HelpCircle className="w-3 h-3" />,
    color: 'text-blue bg-blue-light/50 border-blue/15 hover:bg-blue-light',
  },
  {
    id: 'missing',
    label: 'Informations manquantes',
    question: 'Quelles informations manquent dans cette section ? Qu\'est-ce que je devrais ajouter ?',
    icon: <Search className="w-3 h-3" />,
    color: 'text-amber-dark bg-amber-light/50 border-amber/15 hover:bg-amber-light',
  },
  {
    id: 'inconsistencies',
    label: 'Vérifier les incohérences',
    question: 'Y a-t-il des incohérences ou des contradictions dans les données que j\'ai saisies ?',
    icon: <AlertTriangle className="w-3 h-3" />,
    color: 'text-red bg-red-light/50 border-red/15 hover:bg-red-light',
  },
  {
    id: 'improve',
    label: 'Suggérer des améliorations',
    question: 'Quelles améliorations pourrais-je apporter à cette section pour renforcer mon dossier ?',
    icon: <Sparkles className="w-3 h-3" />,
    color: 'text-moss bg-moss-light/50 border-moss/15 hover:bg-moss-light',
  },
  {
    id: 'analyze',
    label: 'Analyser ma réponse',
    question: 'Peux-tu analyser ce que j\'ai écrit et me donner ton avis de coach ?',
    icon: <Lightbulb className="w-3 h-3" />,
    color: 'text-amber-dark bg-amber-light/50 border-amber/15 hover:bg-amber-light',
  },
  {
    id: 'next',
    label: 'Prochaine étape',
    question: 'Que dois-je faire ensuite dans ce module ? Quelle est la prochaine étape recommandée ?',
    icon: <ArrowRight className="w-3 h-3" />,
    color: 'text-moss bg-moss-light/50 border-moss/15 hover:bg-moss-light',
  },
]

export default function ContextualCoachPanel({
  projectId,
  module,
  section,
  step,
  formData,
  className,
}: ContextualCoachPanelProps) {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ChatbotAskResult | null>(null)
  const [activeAction, setActiveAction] = useState<string | null>(null)
  const [customQuestion, setCustomQuestion] = useState('')
  const [error, setError] = useState<string | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [result])

  const buildContext = useCallback((): ModuleContext | undefined => {
    if (!formData || Object.keys(formData).length === 0) {
      return { module, section, step }
    }
    const contextStr = Object.entries(formData)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`)
      .join('\n')
    return { module, section, step, context: contextStr || undefined }
  }, [module, section, step, formData])

  const handleAction = useCallback(
    async (action: ActionDef) => {
      setError(null)
      setActiveAction(action.id)
      setLoading(true)
      setExpanded(true)

      try {
        const res = await askCoach(projectId, action.question, buildContext())
        setResult(res)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erreur inconnue'
        setError(msg)
      } finally {
        setLoading(false)
      }
    },
    [projectId, buildContext],
  )

  const handleCustomAsk = useCallback(async () => {
    if (!customQuestion.trim()) return
    setError(null)
    setLoading(true)
    setActiveAction('custom')
    setExpanded(true)

    try {
      const res = await askCoach(projectId, customQuestion, buildContext())
      setResult(res)
      setCustomQuestion('')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [projectId, customQuestion, buildContext])

  const handleRetry = useCallback(async () => {
    if (!activeAction || activeAction === 'custom') return
    const action = MODULE_ACTIONS.find((a) => a.id === activeAction)
    if (action) await handleAction(action)
  }, [activeAction, handleAction])

  return (
    <div
      className={cn(
        'border border-ink/[.08] rounded-[12px] bg-white overflow-hidden',
        className,
      )}
    >
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-ink/[.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-moss flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[12px] font-bold text-ink font-syne">
            Coach IA — {module}
          </span>
          {section && (
            <span className="text-[10px] font-dm text-ink3">
              · {section}
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-ink3" />
        ) : (
          <ChevronDown className="w-4 h-4 text-ink3" />
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Quick action buttons */}
          <div className="flex flex-wrap gap-1.5">
            {MODULE_ACTIONS.map((action) => (
              <button
                key={action.id}
                onClick={() => handleAction(action)}
                disabled={loading}
                className={cn(
                  'inline-flex items-center gap-1 text-[10px] font-dm font-medium border rounded-full px-2.5 py-1 transition-colors disabled:opacity-50',
                  action.color,
                )}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>

          {/* Custom question input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCustomAsk()}
              placeholder="Posez votre question au coach…"
              className="flex-1 text-[11px] font-dm px-3 py-1.5 border border-ink/[.12] rounded-lg bg-surface text-ink outline-none focus:border-moss placeholder:text-ink3"
              disabled={loading}
            />
            <button
              onClick={handleCustomAsk}
              disabled={loading || !customQuestion.trim()}
              className="text-[10px] font-dm font-medium text-white bg-moss rounded-lg px-3 py-1.5 hover:bg-moss-mid transition-colors disabled:opacity-50"
            >
              Envoyer
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-2 py-3 text-[11px] text-ink3 font-dm">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-moss" />
              Le coach analyse votre projet…
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 py-2 text-[11px] text-red font-dm">
              <AlertTriangle className="w-3.5 h-3.5" />
              {error}
            </div>
          )}

          {/* Result */}
          {result && !loading && (
            <div ref={resultRef} className="space-y-2">
              <div className="bg-ink/[.03] border border-ink/[.06] rounded-[10px] px-3 py-2.5">
                <div className="text-[11px] leading-relaxed font-dm text-ink2 whitespace-pre-wrap">
                  {result.answer}
                </div>

                {/* Sources */}
                {result.sourcesUsed.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-ink/[.06] flex flex-wrap gap-1">
                    {result.sourcesUsed.map((src, i) => (
                      <span
                        key={`${src.id}-${i}`}
                        className="inline-flex items-center text-[9px] font-dm text-ink3 bg-ink/[.04] border border-ink/[.08] rounded-md px-1.5 py-0.5"
                      >
                        {src.module} · {src.section}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Retry */}
              {activeAction && activeAction !== 'custom' && (
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-1 text-[9px] text-ink3 hover:text-moss transition-colors font-dm"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  Ressayer
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
