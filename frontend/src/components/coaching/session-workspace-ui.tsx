'use client'

import Link from 'next/link'
import { ArrowLeft, CheckCircle2, PlayCircle, Save } from 'lucide-react'
import { Button } from '@/components/shared/ui'
import type { CoachingSession } from '@/types/coaching'

export function StickyActionBar({
  dirty, saving, savedFlash, canManage, status, onSave, onStart, onComplete,
}: {
  dirty: boolean
  saving: boolean
  savedFlash: boolean
  canManage: boolean
  status: CoachingSession['status']
  onSave: () => Promise<boolean> | void
  onStart: () => void
  onComplete: () => void
}) {
  const canStart = canManage && (status === 'SCHEDULED' || status === 'RESCHEDULED')
  const canComplete = canManage && status === 'IN_PROGRESS'

  return (
    <div className="sticky bottom-0 -mx-1 px-1 pt-2 pb-1 bg-gradient-to-t from-surface via-surface/95 to-transparent z-10">
      <div className="border border-border rounded-[12px] bg-surface shadow-[0_4px_16px_rgba(15,31,22,0.08)] px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-[11px] min-w-0">
          {saving ? (
            <span className="flex items-center gap-1.5 text-blue-600 font-semibold">
              <Save size={12} className="animate-pulse" /> Enregistrement…
            </span>
          ) : savedFlash && !dirty ? (
            <span className="flex items-center gap-1.5 text-moss font-semibold">
              <CheckCircle2 size={12} /> Enregistré
            </span>
          ) : dirty ? (
            <span className="flex items-center gap-1.5 text-amber font-semibold">
              <span className="w-[7px] h-[7px] rounded-full bg-amber animate-pulse" /> Modifications non enregistrées
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-ink3">
              <CheckCircle2 size={12} /> À jour
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {canManage && (
            <Button variant="outline" size="sm" onClick={onSave} loading={saving} disabled={!dirty}>
              <Save size={12} /> Enregistrer comme brouillon
            </Button>
          )}
          {canStart && (
            <Button variant="primary" size="sm" onClick={onStart}>
              <PlayCircle size={13} /> Commencer la session
            </Button>
          )}
          {canComplete && (
            <Button variant="primary" size="sm" onClick={onComplete} loading={saving}>
              <CheckCircle2 size={13} /> Terminer la session
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export function SessionBackNote({ href }: { href: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-[11px] text-ink3 hover:text-moss transition-colors">
      <ArrowLeft size={12} /> Retour au suivi coaching
    </Link>
  )
}

// Lien retour utilisé par la page hôte
export function SessionBackLink({ href }: { href: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-[11px] text-ink3 hover:text-moss transition-colors">
      <ArrowLeft size={12} /> Retour au suivi coaching
    </Link>
  )
}