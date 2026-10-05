'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'error'

interface ToastItem {
  id: number
  message: string
  type: ToastType
}

interface ToastApi {
  toast: (message: string, type?: ToastType) => void
}

/**
 * Abstraction minimale de notification (succès / erreur) cohérente avec le
 * design system. Context non requis : hors provider, `toast` est un no-op,
 * ce qui permet l'usage isolé dans les tests de composants.
 */
const ToastContext = createContext<ToastApi>({ toast: () => undefined })

export function useToast(): ToastApi {
  return useContext(ToastContext)
}

export const TOAST_DURATION_MS = 3500

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(1)

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = nextId.current++
    setToasts((current) => [...current, { id, message, type }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id))
    }, TOAST_DURATION_MS)
  }, [])

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="false"
        className="fixed top-4 right-4 z-[70] flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-[360px] pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-start gap-2 px-4 py-3 rounded-[10px] border shadow-[0_4px_16px_rgba(15,31,22,0.12)] text-[12px] bg-surface',
              t.type === 'success' ? 'border-moss/20 text-moss' : 'border-red/18 bg-red-light text-red',
            )}
          >
            {t.type === 'success' ? (
              <CheckCircle2 size={15} className="shrink-0 mt-[1px]" aria-hidden />
            ) : (
              <AlertCircle size={15} className="shrink-0 mt-[1px]" aria-hidden />
            )}
            <span className="flex-1 font-medium text-ink2 leading-snug">{t.message}</span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Fermer la notification"
              className="shrink-0 text-ink3 hover:text-ink transition-colors cursor-pointer"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}