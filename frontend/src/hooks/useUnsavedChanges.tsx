'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ConfirmLeavingModal } from '@/components/shared/ConfirmLeavingModal'

interface UseUnsavedChangesOptions {
  title?: string
  message?: string
}

export function useUnsavedChanges(dirty: boolean, options: UseUnsavedChangesOptions = {}) {
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  const pendingRef = useRef<(() => void) | null>(null)
  const dirtyRef = useRef(dirty)

  useEffect(() => {
    dirtyRef.current = dirty
  }, [dirty])

  useEffect(() => {
    if (!dirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  const guardLeave = useCallback((action: () => void) => {
    if (dirtyRef.current) {
      pendingRef.current = action
      setPendingAction(() => action)
    } else {
      action()
    }
  }, [])

  const confirmLeave = useCallback(() => {
    const action = pendingRef.current
    pendingRef.current = null
    setPendingAction(null)
    action?.()
  }, [])

  const cancelLeave = useCallback(() => {
    pendingRef.current = null
    setPendingAction(null)
  }, [])

  const modal = pendingAction ? (
    <ConfirmLeavingModal
      title={options.title}
      message={options.message}
      onConfirm={confirmLeave}
      onCancel={cancelLeave}
    />
  ) : null

  return { guardLeave, modal }
}
