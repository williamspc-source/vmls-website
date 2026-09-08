'use client'
import { useEffect } from 'react'

/**
 * Single global observer that reveals any element marked `data-vf-motion` as it
 * scrolls into view (adds `is-visible`). Mounted once in the frontend layout.
 * Picks up nodes added by client-side navigation via a MutationObserver, and
 * honours prefers-reduced-motion.
 */
export const MotionObserver: React.FC = () => {
  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    if (reduced) {
      document.querySelectorAll('[data-vf-motion]').forEach((el) => el.classList.add('is-visible'))
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            io.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -10% 0px' },
    )

    const observeAll = () =>
      document
        .querySelectorAll('[data-vf-motion]:not(.is-visible)')
        .forEach((el) => io.observe(el))

    observeAll()
    const mo = new MutationObserver(observeAll)
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [])

  return null
}
