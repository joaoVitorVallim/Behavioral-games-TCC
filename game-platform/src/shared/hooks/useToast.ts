import { useCallback, useEffect, useRef, useState } from 'react'

export type ToastTone = 'success' | 'error'

export interface ToastState {
  type: ToastTone
  message: string
}

const TOAST_DURATION_MS = 2800

/**
 * The toast-with-timeout state machine duplicated between CreateSessionPage's
 * delete_toast and SessionsPage's action_toast (same shape, same 2800ms timeout,
 * same cleanup-on-unmount). Pair with <Toast /> from shared/components/Toast.
 */
export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null)
  const timeout_ref = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeout_ref.current) clearTimeout(timeout_ref.current)
    }
  }, [])

  const showToast = useCallback((type: ToastTone, message: string) => {
    setToast({ type, message })

    if (timeout_ref.current) clearTimeout(timeout_ref.current)

    timeout_ref.current = setTimeout(() => {
      setToast(null)
      timeout_ref.current = null
    }, TOAST_DURATION_MS)
  }, [])

  return { toast, showToast }
}
