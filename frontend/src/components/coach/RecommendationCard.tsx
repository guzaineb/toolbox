'use client'

import { cn } from '@/lib/utils'
import { Lightbulb } from 'lucide-react'
import type { Priority } from '@/types/coach'
import { PRIORITY_LABELS } from '@/types/coach'
import { Badge } from '@/components/shared/ui'

const priorityBadge: Record<string, 'green' | 'amber' | 'red' | 'gray'> = {
  LOW: 'gray',
  MEDIUM: 'amber',
  HIGH: 'red',
  CRITICAL: 'red',
}

export default function RecommendationCard({
  priorities,
  className,
}: {
  priorities: Priority[]
  className?: string
}) {
  if (!priorities || priorities.length === 0) return null

  return (
    <div className={cn('rounded-[12px] border border-ink/[.08] bg-white p-4', className)}>
      <h3 className="text-[11px] font-bold tracking-[0.06em] uppercase text-ink3 font-syne mb-3">
        Recommandations
      </h3>

      <div className="space-y-2">
        {priorities.slice(0, 5).map((p, i) => (
          <div
            key={`${p.area}-${i}`}
            className="flex items-start gap-2 p-2 rounded-lg bg-ink/[.02] border border-ink/[.05]"
          >
            <Lightbulb className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Badge variant={priorityBadge[p.level] ?? 'gray'}>
                  {PRIORITY_LABELS[p.level]}
                </Badge>
                <span className="text-[10px] font-bold text-ink2 font-dm">{p.area}</span>
              </div>
              <p className="text-[11px] text-ink2 leading-relaxed font-dm">{p.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
