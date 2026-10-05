import { COACHING_SESSION_STATUS_LABELS } from '@/types/coaching'
import type { CoachingSessionStatus } from '@/types/coaching'

/**
 * Apparence visuelle d'un statut de session pour le calendrier.
 * Centralise les couleurs (pastille, barre d'accent, fond du chip) pour que
 * la légende, les événements compacts et les cartes partagent les mêmes teintes,
 * alignées sur les variantes du Badge partagé (shared/ui).
 */
export interface SessionStatusAppearance {
  label: string
  /** Pastille / point de la légende (couleur pleine). */
  dot: string
  /** Barre d'accent verticale d'un événement. */
  bar: string
  /** Fond + texte + bordure d'un événement compact. */
  chip: string
}

const STATUS_APPEARANCE: Record<CoachingSessionStatus, SessionStatusAppearance> = {
  SCHEDULED: {
    label: COACHING_SESSION_STATUS_LABELS.SCHEDULED,
    dot: 'bg-blue',
    bar: 'bg-blue',
    chip: 'bg-blue-light text-blue border-blue/18',
  },
  IN_PROGRESS: {
    label: COACHING_SESSION_STATUS_LABELS.IN_PROGRESS,
    dot: 'bg-violet-500',
    bar: 'bg-violet-500',
    chip: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  COMPLETED: {
    label: COACHING_SESSION_STATUS_LABELS.COMPLETED,
    dot: 'bg-moss',
    bar: 'bg-moss',
    chip: 'bg-moss-light text-moss border-moss/20',
  },
  CANCELLED: {
    label: COACHING_SESSION_STATUS_LABELS.CANCELLED,
    dot: 'bg-red',
    bar: 'bg-red',
    chip: 'bg-red-light text-red border-red/18',
  },
  RESCHEDULED: {
    label: COACHING_SESSION_STATUS_LABELS.RESCHEDULED,
    dot: 'bg-orange-500',
    bar: 'bg-orange-500',
    chip: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  MISSED: {
    label: COACHING_SESSION_STATUS_LABELS.MISSED,
    dot: 'bg-ink/50',
    bar: 'bg-ink/40',
    chip: 'bg-ink/[.07] text-ink2 border-ink/[.15]',
  },
}

export function getSessionStatusAppearance(status: CoachingSessionStatus): SessionStatusAppearance {
  return STATUS_APPEARANCE[status]
}

/** Légende des statuts : étiquette + pastille de la même teinte que les événements. */
export const SESSION_STATUS_LEGEND: Array<{
  status: CoachingSessionStatus
  label: string
  dot: string
}> = (Object.keys(STATUS_APPEARANCE) as CoachingSessionStatus[]).map((status) => ({
  status,
  label: STATUS_APPEARANCE[status].label,
  dot: STATUS_APPEARANCE[status].dot,
}))