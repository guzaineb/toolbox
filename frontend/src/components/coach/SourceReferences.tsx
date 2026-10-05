'use client'

import { cn } from '@/lib/utils'
import { FileText } from 'lucide-react'
import type { ChatSource } from '@/types/coach'

export default function SourceReferences({
  sources,
  className,
}: {
  sources: ChatSource[]
  className?: string
}) {
  if (!sources || sources.length === 0) return null

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {sources.map((src, i) => (
        <span
          key={`${src.id}-${i}`}
          className="inline-flex items-center gap-1 text-[9px] font-dm text-ink3 bg-ink/[.04] border border-ink/[.08] rounded-md px-1.5 py-0.5"
        >
          <FileText className="w-2.5 h-2.5 text-moss" />
          <span className="font-medium">{src.module}</span>
          {src.section && <span className="text-ink3">· {src.section}</span>}
        </span>
      ))}
    </div>
  )
}
