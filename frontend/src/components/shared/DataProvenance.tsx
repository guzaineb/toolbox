import { Info } from 'lucide-react'
import type { ProvenanceInfo } from '@/hooks/useProjectPrefill'

export function DataProvenance({
  provenance,
  forceShow = false,
}: {
  provenance?: ProvenanceInfo
  forceShow?: boolean
}) {
  if (!provenance) return null
  if (!provenance.applied && !forceShow) return null

  return (
    <div className="flex items-start gap-[6px] mt-[5px] text-[10px] leading-snug text-ink3">
      <Info size={12} className="mt-[1px] shrink-0 text-moss" />
      <span>
        {provenance.applied ? (
          <>
            Informations récupérées depuis{' '}
            <span className="font-semibold text-ink2">{provenance.sourceLabel}</span>
            {provenance.preview && (
              <span className="text-ink3"> — {provenance.preview}</span>
            )}
          </>
        ) : (
          <>
            Données issues de{' '}
            <span className="font-semibold text-ink2">{provenance.sourceLabel}</span>
            {provenance.preview && (
              <span className="text-ink3"> — {provenance.preview}</span>
            )}
          </>
        )}
      </span>
    </div>
  )
}
