'use client'
import React, { useState } from 'react'

import { ExpertCard, type PersonCardData } from '@/components/PersonCard'
import { cn } from '@/utilities/ui'
import { usePrefersReducedMotion } from '@/utilities/usePrefersReducedMotion'

type Direction = 'left' | 'right'

/**
 * Faithful port of the design reference's `.experts-carousel` — an infinite
 * auto-scrolling marquee of expert cards. The track renders the cards twice
 * (the second pass aria-hidden/non-focusable) so the 60s `translateX(-50%)`
 * keyframe loops seamlessly. Pause-on-hover is pure CSS; the arrows toggle
 * scroll direction. Respects `prefers-reduced-motion` (no animation).
 */
export const ExpertsCarousel: React.FC<{
  cards: PersonCardData[]
  speed?: number | null
  startDirection?: Direction | null
  showArrows?: boolean | null
  className?: string
  cardClassName?: string
}> = ({ cards, speed, startDirection = 'left', showArrows = true, className, cardClassName }) => {
  // `null` means "the visitor has not clicked an arrow", so the editor's
  // Start direction still wins. Seeding state from the prop instead latched it:
  // live preview reconciles the tree in place and deliberately preserves client
  // state, so an editor changing Start direction saw speed and the arrows update
  // while the scroll direction stayed wrong until a hard reload. Same
  // choice-overrides-prop shape as the specialty filter in
  // `SpecialistDirectory/DirectoryClient.tsx`.
  const [directionChoice, setDirectionChoice] = useState<Direction | null>(null)
  const direction = directionChoice ?? startDirection ?? 'left'

  // `is-ready` is what starts the CSS marquee. Derived from the live media query
  // rather than latched once on mount, so toggling "Reduce motion" in system
  // settings now stops and restarts the animation without a reload.
  const ready = !usePrefersReducedMotion()

  if (!cards || cards.length === 0) return null
  // 60s matches the reference (styles.css:1666). The fallback is load-bearing:
  // the Availability block passes no speed at all, so this is what that strip
  // runs at on /make-a-booking and /specialist-availability.
  const duration = `${speed || 60}s`

  return (
    <div
      className={cn('experts-carousel vf-carousel', ready && 'is-ready', className)}
      data-direction={direction}
    >
      {showArrows ? (
        <button
          type="button"
          className="experts-carousel-control experts-carousel-control--prev vf-carousel__arrow vf-carousel__arrow--prev"
          aria-label="Scroll specialists right"
          aria-pressed={direction === 'right'}
          onClick={() => setDirectionChoice('right')}
        >
          <span aria-hidden>‹</span>
        </button>
      ) : null}

      <div className="experts-carousel-viewport vf-carousel__viewport">
        <div className="experts-grid vf-carousel__track" style={{ animationDuration: duration }}>
          {cards.map((c, i) => (
            <ExpertCard key={`a-${i}`} {...c} className={cardClassName} />
          ))}
          {cards.map((c, i) => (
            <ExpertCard key={`b-${i}`} {...c} className={cardClassName} ariaHidden tabIndex={-1} />
          ))}
        </div>
      </div>

      {showArrows ? (
        <button
          type="button"
          className="experts-carousel-control experts-carousel-control--next vf-carousel__arrow vf-carousel__arrow--next"
          aria-label="Scroll specialists left"
          aria-pressed={direction === 'left'}
          onClick={() => setDirectionChoice('left')}
        >
          <span aria-hidden>›</span>
        </button>
      ) : null}
    </div>
  )
}
