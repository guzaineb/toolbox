'use client'

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { AlertTriangle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import type { Inconsistency, InconsistencySeverity } from '@/types/coach'
import { SEVERITY_LABELS } from '@/types/coach'

const severityStyles: Record<InconsistencySeverity, string> = {
  LOW: 'border-gray-200 bg-gray-50',
  MEDIUM: 'border-amber/30 bg-amber-light/20',
  HIGH: 'border-red/20 bg-red-light/20',
  CRITICAL: 'border-red/30 bg-red-light/40',
}

const severityDot: Record<InconsistencySeverity, string> = {
  LOW: 'bg-gray-400',
  MEDIUM: 'bg-amber',
  HIGH: 'bg-red',
  CRITICAL: 'bg-red',
}

function InconsistencyItem({
  inc,
  onGoToModule,
}: {
  inc: Inconsistency
  onGoToModule?: (module: string) => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className={cn(
        'rounded-lg border p-3 transition-colors',
        severityStyles[inc.severity],
      )}
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-start gap-2 w-full text-left"
      >
        <div
          className={cn(
            'w-2 h-2 rounded-full mt-1.5 shrink-0',
            severityDot[inc.severity],
          )}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] font-bold text-ink2 font-dm">{inc.area}</span>
            <span className="text-[9px] text-ink3 font-dm">
              — {SEVERITY_LABELS[inc.severity]}
            </span>
          </div>
          <p className="text-[11px] text-ink2 leading-relaxed font-dm">{inc.description}</p>
        </div>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-ink3 shrink-0 mt-0.5" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-ink3 shrink-0 mt-0.5" />
        )}
      </button>

      {expanded && (
        <div className="mt-2 pt-2 border-t border-ink/[.06] ml-4 space-y-1.5">
          {inc.evidence && (
            <div>
              <span className="text-[9px] font-bold text-ink3 font-dm uppercase tracking-wider">
                Preuve
              </span>
              <p className="text-[10px] text-ink2 font-dm mt-0.5">{inc.evidence}</p>
            </div>
          )}
          {inc.recommendation && (
            <div>
              <span className="text-[9px] font-bold text-ink3 font-dm uppercase tracking-wider">
                Recommandation
              </span>
              <p className="text-[10px] text-ink2 font-dm mt-0.5">{inc.recommendation}</p>
            </div>
          )}
          {inc.action && (
            <div>
              <span className="text-[9px] font-bold text-ink3 font-dm uppercase tracking-wider">
                Action suggérée
              </span>
              <p className="text-[10px] text-ink2 font-dm mt-0.5">{inc.action}</p>
            </div>
          )}
          {onGoToModule && inc.module && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (inc.module) onGoToModule(inc.module)
              }}
              className="flex items-center gap-1 text-[10px] font-dm font-medium text-moss hover:text-moss-mid transition-colors mt-1"
            >
              <ExternalLink className="w-3 h-3" />
              Aller au module {inc.module}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function InconsistencyPanel({
  inconsistencies,
  onGoToModule,
  className,
}: {
  inconsistencies: Inconsistency[]
  onGoToModule?: (module: string) => void
  className?: string
}) {
  if (inconsistencies.length === 0) return null

  const criticalCount = inconsistencies.filter((i) => i.severity === 'CRITICAL').length
  const highCount = inconsistencies.filter((i) => i.severity === 'HIGH').length

  return (
    <div className={cn('rounded-[12px] border border-ink/[.08] bg-white p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber" />
          <h3 className="text-[11px] font-bold tracking-[0.06em] uppercase text-ink3 font-syne">
            Incohérences détectées
          </h3>
        </div>
        <div className="flex items-center gap-1">
          {criticalCount > 0 && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-light text-red border border-red/20">
              {criticalCount} critique{criticalCount > 1 ? 's' : ''}
            </span>
          )}
          {highCount > 0 && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-light text-amber-dark border border-amber/20">
              {highCount} élevé{highCount > 1 ? 's' : ''}
            </span>
          )}
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-ink/[.06] text-ink2 border border-ink/[.12]">
            {inconsistencies.length}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {inconsistencies
          .sort((a, b) => {
            const order: Record<InconsistencySeverity, number> = {
              CRITICAL: 0,
              HIGH: 1,
              MEDIUM: 2,
              LOW: 3,
            }
            return order[a.severity] - order[b.severity]
          })
          .map((inc, i) => (
            <InconsistencyItem
              key={`${inc.area}-${i}`}
              inc={inc}
              onGoToModule={onGoToModule}
            />
          ))}
      </div>
    </div>
  )
}
