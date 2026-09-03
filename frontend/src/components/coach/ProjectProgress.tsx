'use client'

import { cn } from '@/lib/utils'

export default function ProjectProgress({
  overallProgress,
  className,
}: {
  overallProgress: number
  className?: string
}) {
  const color =
    overallProgress >= 80
      ? 'bg-moss'
      : overallProgress >= 50
        ? 'bg-amber'
        : 'bg-red'

  return (
    <div className={cn('rounded-[12px] border border-ink/[.08] bg-white p-4', className)}>
      <h3 className="text-[11px] font-bold tracking-[0.06em] uppercase text-ink3 font-syne mb-3">
        Progression
      </h3>

      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-[28px] font-bold font-syne leading-none text-ink">
          {overallProgress}
        </span>
        <span className="text-[13px] text-ink3 font-dm">%</span>
      </div>

      <div className="h-2 rounded-full bg-ink/[.06] overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', color)}
          style={{ width: `${overallProgress}%` }}
        />
      </div>
    </div>
  )
}
