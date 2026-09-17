'use client'

import { useEffect, useId, useRef } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button, Card } from '@/components/shared/ui'
import { cn } from '@/lib/utils'

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), input, textarea, select, [href], [tabindex]:not([tabindex="-1"])'

function isFocusable(el: Element): boolean {
  const node = el as HTMLElement
  if (node.hasAttribute?.('disabled')) return false
  if (node.getAttribute?.('aria-hidden') === 'true') return false
  if (node.getAttribute?.('tabindex') === '-1') return false
  return true
}

/**
 * Coquille de modale accessible : piège le focus (Tab + focus initial),
 * ferme sur Échap, restaure le focus à l'élément déclencheur au démontage,
 * verrouille le défilement de la page et déclare le rôle dialog.
 */
export function ModalShell({
  onClose,
  labelledBy,
  describedBy,
  children,
}: {
  onClose: () => void
  labelledBy?: string
  describedBy?: string
  children: React.ReactNode
}) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const restoreRef = useRef<HTMLElement | null>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    restoreRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null

    const dialog = dialogRef.current
    if (!dialog) return

    const focusables = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
      isFocusable,
    )
    const preferred =
      dialog.querySelector<HTMLElement>('[data-autofocus]') ??
      (focusables.find((el) => ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) ?? null) ??
      focusables[0] ??
      null
    ;(preferred ?? dialog).focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab' || focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    const previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      document.body.style.overflow = previousBodyOverflow
      restoreRef.current?.focus()
    }
  }, [])

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      tabIndex={-1}
      className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-start sm:items-center justify-center p-4 sm:p-6 z-50 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onCloseRef.current() }}
    >
      {children}
    </div>
  )
}

/**
 * Boîte de confirmation pour les opérations destructives ou engageantes :
 * rôle dialog, aria-labelledby / aria-describedby, focus initial sur l'annulation.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  const titleId = useId()
  const descriptionId = useId()

  if (!open) return null

  return (
    <ModalShell onClose={onCancel} labelledBy={titleId} describedBy={descriptionId}>
      <Card className="w-full max-w-[400px] p-0 overflow-hidden shadow-lg">
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <span
              className={cn(
                'w-[30px] h-[30px] rounded-[8px] flex items-center justify-center shrink-0',
                destructive ? 'bg-red-light text-red' : 'bg-moss-light text-moss',
              )}
            >
              <AlertTriangle size={15} aria-hidden />
            </span>
            <h2 id={titleId} className="font-syne text-[14px] font-bold text-ink">
              {title}
            </h2>
          </div>
          <p id={descriptionId} className="text-[12px] text-ink2 leading-relaxed">
            {description}
          </p>
          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
            <Button variant="outline" fullWidth onClick={onCancel} disabled={loading}>
              {cancelLabel}
            </Button>
            <Button
              variant={destructive ? 'danger' : 'primary'}
              fullWidth
              loading={loading}
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </Card>
    </ModalShell>
  )
}