import { useCallback, useState } from 'react'

export type PlayTheme = 'warm' | 'lab'

const STORAGE_KEY = 'play_theme'

function nextTheme(current: PlayTheme): PlayTheme {
  return current === 'warm' ? 'lab' : 'warm'
}

function readStoredTheme(): PlayTheme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'lab' ? 'lab' : 'warm'
  } catch {
    return 'warm'
  }
}

/**
 * Light/dark toggle for the student Play landing page, persisted per-browser.
 * Scoped to this module only — does not affect the rest of the app's theme.
 */
export function usePlayTheme() {
  const [theme, setTheme] = useState<PlayTheme>(readStoredTheme)

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = nextTheme(current)
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {
        // localStorage may be unavailable (e.g. private browsing) — non-fatal
      }
      return next
    })
  }, [])

  return { theme, toggleTheme }
}
