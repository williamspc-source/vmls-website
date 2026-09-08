'use client'

import React, { useEffect, useRef } from 'react'

type Props = {
  /** 'full' | 'subtle' | 'off' — from the hero's Definition panel → Panel interaction. */
  interaction?: string | null
  className?: string
  children: React.ReactNode
}

/** Fallbacks matching the :root values, used if a custom property is unreadable. */
const FALLBACK = { amplitude: 9, period: 5500, tiltMax: 12, perspective: '900px' }

const readNumber = (styles: CSSStyleDeclaration, prop: string, fallback: number): number => {
  const parsed = Number.parseFloat(styles.getPropertyValue(prop))
  return Number.isFinite(parsed) ? parsed : fallback
}

/**
 * The home hero's VERIFY definition card, with the design reference's pointer
 * effects: a slow idle float, a 3D tilt that follows the cursor, a cursor-tracked
 * sheen, and a shadow lift on hover (reference `assets/js/script.js:218-266`).
 *
 * This is a client component rather than an entry in the global MotionObserver
 * because there is exactly one target and `HomeHero` already owns it — so a ref
 * replaces a brittle `document.querySelector`, unmount handles teardown on
 * client-side navigation without a MutationObserver, and the JS only loads on
 * routes that actually render this hero.
 *
 * Everything visual (both shadows, the sheen colour) is a CSS custom property, so
 * the only inline writes here are geometry: `transform`, `--mx`, `--my`.
 */
export const DefinitionPanel: React.FC<Props> = ({ interaction, className, children }) => {
  const ref = useRef<HTMLDivElement>(null)
  const mode = interaction ?? 'full'

  useEffect(() => {
    const el = ref.current
    if (!el || mode === 'off') return

    const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    // A coarse pointer never fires mousemove, so the reference's rAF loop would
    // run forever on phones animating a float nobody can trigger.
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (!finePointer) return

    const styles = getComputedStyle(el)
    const amplitude = readNumber(styles, '--vf-def-float-amplitude', FALLBACK.amplitude)
    const period = readNumber(styles, '--vf-def-float-period', FALLBACK.period)
    const tiltMax = readNumber(styles, '--vf-def-tilt-max', FALLBACK.tiltMax)
    const perspective =
      styles.getPropertyValue('--vf-def-tilt-perspective').trim() || FALLBACK.perspective

    let rafId = 0
    let settleTimer = 0
    let floatStart: number | null = null
    let isTilting = false
    let onScreen = true

    // 'subtle' keeps the sheen and the shadow lift but no transforms at all.
    const motionAllowed = () => mode === 'full' && !reduceQuery.matches

    const stopLoop = () => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = 0
      floatStart = null
    }

    const tick = (timestamp: number) => {
      if (!isTilting) {
        if (floatStart === null) floatStart = timestamp
        const t = ((timestamp - floatStart) % period) / period
        el.style.transform = `translateY(${(-amplitude * Math.sin(t * Math.PI * 2)).toFixed(2)}px)`
      }
      rafId = requestAnimationFrame(tick)
    }

    const startLoop = () => {
      if (!rafId && onScreen && motionAllowed()) rafId = requestAnimationFrame(tick)
    }

    const handleEnter = () => {
      el.classList.add('is-hovered')
      if (!motionAllowed()) return
      isTilting = true
      el.classList.add('is-tilting')
    }

    const handleMove = (event: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const px = (event.clientX - rect.left) / rect.width
      const py = (event.clientY - rect.top) / rect.height
      el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`)
      el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`)
      if (!motionAllowed()) return
      const x = (px - 0.5) * 2
      const y = (py - 0.5) * 2
      el.style.transition = 'transform 0.1s ease-out'
      el.style.transform =
        `perspective(${perspective}) rotateY(${(x * tiltMax).toFixed(2)}deg) ` +
        `rotateX(${(-y * tiltMax * 0.7).toFixed(2)}deg) translateZ(14px)`
    }

    const handleLeave = () => {
      el.classList.remove('is-hovered')
      if (!isTilting) return
      el.style.transition = 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)'
      el.style.transform = 'translateY(0)'
      settleTimer = window.setTimeout(() => {
        el.style.transition = ''
        el.classList.remove('is-tilting')
        isTilting = false
        floatStart = null
      }, 500)
    }

    // Pause the loop once the hero scrolls away — the reference keeps animating
    // for the whole session.
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = Boolean(entry?.isIntersecting)
        if (onScreen) startLoop()
        else stopLoop()
      },
      { threshold: 0 },
    )
    io.observe(el)

    // Honour a mid-session OS-level motion preference change.
    const handleReduceChange = () => {
      if (motionAllowed()) {
        startLoop()
      } else {
        stopLoop()
        el.style.transform = ''
      }
    }
    reduceQuery.addEventListener('change', handleReduceChange)

    el.addEventListener('mouseenter', handleEnter)
    el.addEventListener('mousemove', handleMove)
    el.addEventListener('mouseleave', handleLeave)
    startLoop()

    return () => {
      stopLoop()
      window.clearTimeout(settleTimer)
      io.disconnect()
      reduceQuery.removeEventListener('change', handleReduceChange)
      el.removeEventListener('mouseenter', handleEnter)
      el.removeEventListener('mousemove', handleMove)
      el.removeEventListener('mouseleave', handleLeave)
    }
  }, [mode])

  return (
    <div ref={ref} className={className} data-vf-tilt={mode === 'off' ? undefined : mode}>
      {children}
    </div>
  )
}
