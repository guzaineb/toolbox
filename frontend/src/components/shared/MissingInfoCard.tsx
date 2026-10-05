import { CheckCircle, AlertCircle } from 'lucide-react'
import type { ChecklistItem } from '@/types/project-context'
import { Card } from './ui'

export function MissingInfoCard({ checklist, loading }: { checklist?: ChecklistItem[]; loading?: boolean }) {
  if (loading) return null
  if (!checklist || checklist.length === 0) return null

  const ok = checklist.filter(c => c.status === 'ok')
  const missing = checklist.filter(c => c.status === 'missing')

  if (ok.length === 0 && missing.length === 0) return null

  return (
    <Card className="p-[14px] mb-[16px]">
      <div className="flex flex-col gap-[8px]">
        <div className="flex flex-wrap gap-[10px]">
          <div className="flex items-center gap-[5px] text-[11px] font-semibold text-moss">
            <CheckCircle size={13} />
            {ok.length} info(s) déjà renseignée(s)
          </div>
          <div className="flex items-center gap-[5px] text-[11px] font-semibold text-amber-dark">
            <AlertCircle size={13} />
            {missing.length} info(s) manquante(s) — {missing.map(m => m.label).join(', ')}
          </div>
        </div>
      </div>
    </Card>
  )
}
