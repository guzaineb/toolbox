'use client'

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { ArrowRight, HelpCircle, Clock, ChevronRight } from 'lucide-react'
import { Button } from '@/components/shared/ui'
import type { Priority } from '@/types/coach'

export default function NextBestActionCard({
  action,
  priority,
  onStart,
  onWhy,
  onDefer,
  onGoToModule,
  className,
}: {
  action: string
  priority?: Priority | null
  onStart?: () => void
  onWhy?: () => void
  onDefer?: () => void
  onGoToModule?: (module: string) => void
  className?: string
}) {
  const [expanded, setExpanded] = useState(false)

  const handleWhy = useCallback(() => {
    if (onWhy) {
      onWhy()
    } else {
      setExpanded((v) => !v)
    }
  }, [onWhy])

  if (!action) return null

  return (
    <div
      className={cn(
        'rounded-[12px] border border-moss/20 bg-gradient-to-br from-moss-light/40 to-white p-4',
        className,
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[11px] font-bold tracking-[0.06em] uppercase text-ink3 font-syne">
          Prochaine action
        </h3>
        {priority && (
          <span
            className={cn(
              'text-[9px] font-bold px-1.5 py-0.5 rounded-full',
              priority.level === 'CRITICAL'
                ? 'bg-red-light text-red border border-red/20'
                : priority.level === 'HIGH'
                  ? 'bg-amber-light text-amber-dark border border-amber/20'
                  : 'bg-ink/[.06] text-ink2 border border-ink/[.12]',
            )}
          >
            Priorité {priority.level === 'CRITICAL' ? 'critique' : priority.level === 'HIGH' ? 'haute' : 'moyenne'}
          </span>
        )}
      </div>

      <p className="text-[13px] text-ink font-dm leading-relaxed mb-3 font-medium">
        &ldquo;{action}&rdquo;
      </p>

      {priority?.area && (
        <p className="text-[10px] text-ink3 font-dm mb-3">
          Module concerné : <span className="font-medium text-ink2">{priority.area}</span>
        </p>
      )}

      <div className="flex flex-wrap gap-1.5">
        {onStart && (
          <Button variant="primary" size="sm" onClick={onStart}>
            <ArrowRight className="w-3.5 h-3.5" />
            Commencer
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={handleWhy}>
          <HelpCircle className="w-3.5 h-3.5" />
          Pourquoi ?
        </Button>
        {onDefer && (
          <Button variant="ghost" size="sm" onClick={onDefer}>
            <Clock className="w-3.5 h-3.5" />
            Plus tard
          </Button>
        )}
        {onGoToModule && priority?.area && (
          <Button variant="outline" size="sm" onClick={() => onGoToModule(priority.area)}>
            <ChevronRight className="w-3.5 h-3.5" />
            Aller au module
          </Button>
        )}
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-ink/[.06]">
          <p className="text-[11px] text-ink2 font-dm leading-relaxed">
            Cette action est recommandée car elle permet de progresser dans{' '}
            <span className="font-medium text-ink">{priority?.area || 'votre projet'}</span>.
            En complétant cette étape, vous améliorez votre score de santé et vous rapprochez
            de la phase suivante.
          </p>
        </div>
      )}
    </div>
  )
}
