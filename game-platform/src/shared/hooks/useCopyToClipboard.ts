import { useState, useRef, useEffect, useCallback } from 'react'

export function useCopyToClipboard(reset_delay: number = 2000) {
  const [copied, setCopied] = useState(false)
  const timer_ref = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timer_ref.current) clearTimeout(timer_ref.current)
    }
  }, [])

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      if (timer_ref.current) clearTimeout(timer_ref.current)
      timer_ref.current = setTimeout(() => setCopied(false), reset_delay)
    } catch {
      // clipboard write failed silently
    }
  }, [reset_delay])

  return { copied, copy }
}
