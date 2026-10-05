'use client'

import { cn } from '@/lib/utils'
import { Heart, ChevronRight } from 'lucide-react'
import type { HealthScore as HealthScoreType } from '@/types/coach'

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-moss'
  if (score >= 60) return 'text-amber-dark'
  if (score >= 40) return 'text-amber'
  return 'text-red'
}

function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-moss'
  if (score >= 60) return 'bg-amber-dark'
  if (score >= 40) return 'bg-amber'
  return 'bg-red'
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Bon'
  if (score >= 40) return 'Moyen'
  return 'Faible'
}

export default function ProjectHealthCard({
  health,
  onViewDiagnostic,
  className,
}: {
  health: HealthScoreType
  onViewDiagnostic?: () => void
  className?: string
}) {
  const { overall, categories } = health
  const color = getScoreColor(overall)
  const bg = getScoreBg(overall)
  const label = getScoreLabel(overall)

  return (
    <div className={cn('rounded-[12px] border border-ink/[.08] bg-white p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-red" />
          <h3 className="text-[11px] font-bold tracking-[0.06em] uppercase text-ink3 font-syne">
            Score de santé
          </h3>
        </div>
        <span
          className={cn(
            'text-[10px] font-bold px-2 py-0.5 rounded-full text-white',
            bg,
          )}
        >
          {label}
        </span>
      </div>

      <div className="flex items-baseline gap-1 mb-3">
        <span className={cn('text-[36px] font-bold font-syne leading-none', color)}>
          {overall}
        </span>
        <span className="text-[13px] text-ink3 font-dm">/100</span>
      </div>

      <div
        className="h-2 rounded-full bg-ink/[.06] overflow-hidden mb-4"
        role="progressbar"
        aria-valuenow={overall}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Score de santé: ${overall}/100`}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-700', bg)}
          style={{ width: `${overall}%` }}
        />
      </div>

      {categories.length > 0 && (
        <div className="space-y-2 mb-4">
          {categories.map((cat) => (
            <div key={cat.label} className="flex items-center gap-2">
              <span className="text-[10px] text-ink3 font-dm w-20 shrink-0">{cat.label}</span>
              <div className="flex-1 h-1.5 rounded-full bg-ink/[.06] overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', getScoreBg(cat.score))}
                  style={{ width: `${cat.score}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-ink2 font-dm w-7 text-right">
                {cat.score}
              </span>
            </div>
          ))}
        </div>
      )}

      {onViewDiagnostic && (
        <button
          onClick={onViewDiagnostic}
          className="flex items-center gap-1 text-[11px] font-dm font-medium text-moss hover:text-moss-mid transition-colors w-full justify-center py-1.5 rounded-lg hover:bg-moss-light/30"
        >
          Voir mon diagnostic
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
