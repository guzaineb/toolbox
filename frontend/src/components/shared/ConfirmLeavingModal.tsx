'use client'

import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/shared/ui'

interface ConfirmLeavingModalProps {
  onConfirm: () => void
  onCancel: () => void
  title?: string
  message?: string
}

export function ConfirmLeavingModal({
  onConfirm,
  onCancel,
  title = 'Modifications non sauvegardées',
  message = 'Vous avez des modifications non enregistrées. Quitter sans sauvegarder ?',
}: ConfirmLeavingModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="bg-surface rounded-xl p-6 max-w-md w-full shadow-xl">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-amber-light flex items-center justify-center shrink-0">
            <AlertTriangle size={18} className="text-amber-dark" />
          </div>
          <div>
            <h3 className="font-syne text-[15px] font-extrabold text-ink leading-tight">{title}</h3>
            <p className="text-[12px] text-ink2 mt-1 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="mt-4 flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel}>
            Rester
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            Quitter sans sauvegarder
          </Button>
        </div>
      </div>
    </div>
  )
}
