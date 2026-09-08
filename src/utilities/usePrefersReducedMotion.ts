'use client'

import { useSyncExternalStore } from 'react'

/**
 * Whether the visitor has asked their device to reduce motion.
 *
 * `useSyncExternalStore` rather than `useState` + `useEffect`, because
 * `matchMedia` is exactly what it is for: an external, mutable source that can
 * change while the page is open. The previous version read `.matches` once on
 * mount with no `change` listener, so turning "Reduce motion" on in system
 * settings did nothing until a full page reload — which is the wrong way round
 * for an accessibility preference, since someone enabling it is usually reacting
 * to the animation that is playing right now.
 *
 * The server snapshot is `true` (assume reduced). Animation is opt-in on the
 * client after hydration, so nothing animates during SSR or first paint and there
 * is no hydration mismatch. Erring toward "reduce" is also the safer default for
 * anyone who needs it.
 */
const QUERY = '(prefers-reduced-motion: reduce)'

const subscribe = (onChange: () => void): (() => void) => {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {}
  const mql = window.matchMedia(QUERY)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

// Booleans are primitives, so this is referentially stable by definition and
// cannot loop the way an object or freshly-computed value would.
const getSnapshot = (): boolean => {
  if (typeof window === 'undefined' || !window.matchMedia) return true
  return window.matchMedia(QUERY).matches
}

const getServerSnapshot = (): boolean => true

export const usePrefersReducedMotion = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
