import { useEffect } from 'react'
import type { RefObject } from 'react'
import { gsap } from 'gsap'

interface UseGsapRevealOptions {
  /**
   * Scope the animation to this ref and clean it up via gsap.context on
   * unmount/re-run (mount-once reveal). Omit to query the DOM directly with
   * `document.querySelectorAll` instead — for reveals that re-trigger off
   * `deps` (e.g. a list that repopulates after loading) rather than mounting once.
   */
  root?: RefObject<HTMLElement | null>
  /** Effect dependency list controlling when the animation re-runs. Defaults to running once on mount. */
  deps?: unknown[]
  y?: number
  duration?: number
  ease?: string
  stagger?: number
  delay?: number
}

/**
 * Shared "fade + slide in, respecting prefers-reduced-motion" reveal effect.
 * Extracted from the near-identical gsap.fromTo mount effects duplicated across
 * auth/game-session/reports pages (see Part 0 of the refactor roadmap).
 */
export function useGsapReveal(selector: string, options: UseGsapRevealOptions = {}) {
  const { root, deps = [], y = 22, duration = 0.6, ease = 'power2.out', stagger = 0, delay = 0 } = options

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    if (root) {
      if (!root.current) return
      const ctx = gsap.context(() => {
        gsap.fromTo(selector, { y, opacity: 0 }, { y: 0, opacity: 1, duration, ease, stagger, delay })
      }, root)
      return () => ctx.revert()
    }

    const targets = document.querySelectorAll(selector)
    if (targets.length === 0) return
    gsap.fromTo(targets, { y, opacity: 0 }, { y: 0, opacity: 1, duration, ease, stagger, delay })
    // deps is caller-controlled by design (mirrors each call site's original effect deps)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
