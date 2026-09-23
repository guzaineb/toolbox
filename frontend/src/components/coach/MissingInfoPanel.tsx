'use client'

import { cn } from '@/lib/utils'
import { AlertCircle, ChevronRight } from 'lucide-react'
import type { StepInfo } from '@/types/coach'

export default function MissingInfoPanel({
  incompleteSteps,
  missingInformation,
  onGoToStep,
  className,
}: {
  incompleteSteps: StepInfo[]
  missingInformation: string[]
  onGoToStep?: (stepKey: string) => void
  className?: string
}) {
  if (incompleteSteps.length === 0 && missingInformation.length === 0) return null

  return (
    <div className={cn('rounded-[12px] border border-ink/[.08] bg-white p-4', className)}>
      <div className="flex items-center gap-1.5 mb-3">
        <AlertCircle className="w-3.5 h-3.5 text-amber" />
        <h3 className="text-[11px] font-bold tracking-[0.06em] uppercase text-ink3 font-syne">
          Informations manquantes
        </h3>
      </div>

      {missingInformation.length > 0 && (
        <div className="mb-3">
          <span className="text-[9px] font-bold text-ink3 font-dm uppercase tracking-wider">
            Données requises
          </span>
          <ul className="mt-1.5 space-y-1">
            {missingInformation.map((info, i) => (
              <li
                key={i}
                className="flex items-start gap-1.5 text-[10px] text-ink2 font-dm"
              >
                <span className="w-1 h-1 rounded-full bg-amber mt-1.5 shrink-0" />
                {info}
              </li>
            ))}
          </ul>
        </div>
      )}

      {incompleteSteps.length > 0 && (
        <div>
          <span className="text-[9px] font-bold text-ink3 font-dm uppercase tracking-wider">
            Étapes incomplètes ({incompleteSteps.length})
          </span>
          <div className="mt-1.5 space-y-1">
            {incompleteSteps.map((step) => (
              <button
                key={step.stepKey}
                onClick={() => onGoToStep?.(step.stepKey)}
                className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-ink/[.03] transition-colors group text-left"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-ink3/40 shrink-0" />
                <span className="text-[11px] text-ink2 font-dm truncate flex-1">
                  {step.title}
                </span>
                <ChevronRight className="w-3 h-3 text-ink3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
