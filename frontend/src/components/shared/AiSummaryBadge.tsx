'use client'

import { Sparkles, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AiSummaryBadge({ generated, loading }: { generated?: boolean; loading?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full',
        generated
          ? 'bg-purple-100 text-purple-700'
          : 'bg-ink/5 text-ink3',
      )}
    >
      {loading ? (
        <Loader2 size={10} className="animate-spin" />
      ) : (
        <Sparkles size={10} />
      )}
      {loading ? 'Génération...' : generated ? 'Généré par IA' : 'IA'}
    </span>
  )
}
