'use client'

import { cn } from '@/lib/utils'
import { CheckCircle2, Circle, ChevronRight, Sparkles } from 'lucide-react'
import type { StepInfo } from '@/types/coach'

function getPhaseColor(phase: number): string {
  switch (phase) {
    case 1: return 'bg-[#2d7a52]'
    case 2: return 'bg-[#c9a84c]'
    case 3: return 'bg-[#4a7db5]'
    case 4: return 'bg-[#8b5cf6]'
    case 5: return 'bg-[#e11d48]'
    default: return 'bg-ink3'
  }
}

function getPhaseLabel(phase: number): string {
  switch (phase) {
    case 1: return 'Ébaucher & Définir'
    case 2: return 'Construire'
    case 3: return 'Tester'
    case 4: return 'Mesurer & Améliorer'
    case 5: return 'Synthèse'
    default: return `Phase ${phase}`
  }
}

export default function ProjectStatePanel({
  completedSteps,
  incompleteSteps,
  onStepClick,
  className,
}: {
  completedSteps: StepInfo[]
  incompleteSteps: StepInfo[]
  onStepClick?: (stepKey: string) => void
  className?: string
}) {
  const totalSteps = completedSteps.length + incompleteSteps.length
  const progressPct = totalSteps > 0 ? Math.round((completedSteps.length / totalSteps) * 100) : 0

  return (
    <div className={cn('rounded-[12px] border border-ink/[.08] bg-white p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[11px] font-bold tracking-[0.06em] uppercase text-ink3 font-syne">
          Étapes du projet
        </h3>
        <span className="text-[10px] font-bold text-ink2 font-dm">
          {completedSteps.length}/{totalSteps}
        </span>
      </div>

      <div className="h-2 rounded-full bg-ink/[.06] overflow-hidden mb-4">
        <div
          className="h-full rounded-full bg-moss transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="space-y-1">
        {completedSteps.map((step) => (
          <button
            key={step.stepKey}
            onClick={() => onStepClick?.(step.stepKey)}
            className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-moss-light/20 transition-colors group text-left"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-moss shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full shrink-0',
                    getPhaseColor(step.phase),
                  )}
                />
                <span className="text-[11px] text-ink font-dm font-medium truncate">
                  {step.title}
                </span>
              </div>
              <span className="text-[9px] text-ink3 font-dm ml-3.5">
                {getPhaseLabel(step.phase)}
              </span>
            </div>
            <ChevronRight className="w-3 h-3 text-ink3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}

        {incompleteSteps.length > 0 && (
          <div className="pt-1 mt-1 border-t border-ink/[.06]">
            {incompleteSteps.map((step) => (
              <button
                key={step.stepKey}
                onClick={() => onStepClick?.(step.stepKey)}
                className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-ink/[.03] transition-colors group text-left"
              >
                <Circle className="w-3.5 h-3.5 text-ink3 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        'w-1.5 h-1.5 rounded-full shrink-0 opacity-40',
                        getPhaseColor(step.phase),
                      )}
                    />
                    <span className="text-[11px] text-ink2 font-dm truncate">
                      {step.title}
                    </span>
                    {step.aiGenerated && (
                      <Sparkles className="w-3 h-3 text-amber shrink-0" />
                    )}
                  </div>
                  <span className="text-[9px] text-ink3 font-dm ml-3.5">
                    {getPhaseLabel(step.phase)}
                  </span>
                </div>
                <ChevronRight className="w-3 h-3 text-ink3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
