'use client'

import { cn } from '@/lib/utils'
import { AlertTriangle } from 'lucide-react'
import type { Inconsistency, InconsistencySeverity } from '@/types/coach'
import { SEVERITY_LABELS } from '@/types/coach'

const severityStyles: Record<InconsistencySeverity, string> = {
  LOW: 'border-gray-200 bg-gray-50',
  MEDIUM: 'border-amber/30 bg-amber-light/30',
  HIGH: 'border-red/20 bg-red-light/30',
  CRITICAL: 'border-red/30 bg-red-light/50',
}

const severityIconColor: Record<InconsistencySeverity, string> = {
  LOW: 'text-gray-400',
  MEDIUM: 'text-amber',
  HIGH: 'text-red',
  CRITICAL: 'text-red',
}

export default function InconsistencyCard({
  inconsistencies,
  className,
}: {
  inconsistencies: Inconsistency[]
  className?: string
}) {
  if (inconsistencies.length === 0) return null

  return (
    <div className={cn('rounded-[12px] border border-ink/[.08] bg-white p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[11px] font-bold tracking-[0.06em] uppercase text-ink3 font-syne">
          Incohérences
        </h3>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-light text-red border border-red/20">
          {inconsistencies.length}
        </span>
      </div>

      <div className="space-y-2">
        {inconsistencies.map((inc, i) => (
          <div
            key={`${inc.area}-${i}`}
            className={cn(
              'flex items-start gap-2 p-2 rounded-lg border',
              severityStyles[inc.severity],
            )}
          >
            <AlertTriangle
              className={cn('w-3.5 h-3.5 mt-0.5 shrink-0', severityIconColor[inc.severity])}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-bold text-ink2 font-dm">{inc.area}</span>
                <span className="text-[9px] text-ink3 font-dm">
                  — {SEVERITY_LABELS[inc.severity]}
                </span>
              </div>
              <p className="text-[11px] text-ink2 leading-relaxed font-dm">{inc.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
