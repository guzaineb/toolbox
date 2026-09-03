'use client'

import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/shared/ui'

export default function NextAction({
  action,
  onStart,
  className,
}: {
  action: string
  onStart?: () => void
  className?: string
}) {
  if (!action) return null

  return (
    <div
      className={cn(
        'rounded-[12px] border border-moss/20 bg-gradient-to-br from-moss-light/40 to-white p-4',
        className,
      )}
    >
      <h3 className="text-[11px] font-bold tracking-[0.06em] uppercase text-ink3 font-syne mb-2">
        Prochaine action
      </h3>

      <p className="text-[13px] text-ink font-dm leading-relaxed mb-3 font-medium">
        &ldquo;{action}&rdquo;
      </p>

      {onStart && (
        <Button variant="primary" size="sm" onClick={onStart}>
          <ArrowRight className="w-3.5 h-3.5" />
          Commencer
        </Button>
      )}
    </div>
  )
}
