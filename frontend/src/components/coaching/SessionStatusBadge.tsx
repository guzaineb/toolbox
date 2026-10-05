'use client'

import { Badge } from '@/components/shared/ui'
import {
  COACHING_SESSION_STATUS_COLORS,
  COACHING_SESSION_STATUS_LABELS,
} from '@/types/coaching'
import type { CoachingSessionStatus } from '@/types/coaching'

/** Badge de statut d'une session de coaching, partagé entre agenda et détails. */
export function SessionStatusBadge({ status }: { status: CoachingSessionStatus }) {
  return (
    <Badge variant={COACHING_SESSION_STATUS_COLORS[status]}>
      {COACHING_SESSION_STATUS_LABELS[status]}
    </Badge>
  )
}