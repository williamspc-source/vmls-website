'use client'
import { hasRichText, richTextToPlain } from '@/utilities/lexicalText'
import { InlineRichText } from '@/components/RichText/Inline'
import { mediaSrc } from '@/utilities/mediaSrc'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { Icon } from '@/components/Icon'

import type { SlideCarouselBlock as Props } from '@/payload-types'

import { cn } from '@/utilities/ui'
import { toClassName } from '@/utilities/cssClass'


type Slide = NonNullable<Props['slides']>[number]

const Card: React.FC<{ slide: Slide; label: string; hidden?: boolean; className?: string }> = ({
  slide,
  label,
  hidden,
  className,
}) => {
  const img = mediaSrc(slide.image, 367 * 2) // .events-offer-visual, measured 367px
  const pills = (slide.pills || []).filter((p) => hasRichText(p.text))
  return (
    <article
      className={cn('events-offer-card', `offer-${slide.accent || 'seminars'}`, className)}
      aria-hidden={hidden || undefined}
    >
      <div className="events-offer-card-copy">
        <span className="events-offer-slide-label">{label}</span>
        <InlineRichText as="h3" data={slide.title} />
        <InlineRichText as="p" data={slide.body} />
        {pills.length > 0 ? (
          <div className="events-offer-pills">
            {pills.map((p, j) => (
              <InlineRichText as="span" key={j} data={p.text} />
            ))}
          </div>
        ) : null}
      </div>
      <div className="events-offer-visual" aria-hidden>
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt="" />
        ) : null}
        <InlineRichText as="span" data={slide.visualLabel} />
      </div>
    </article>
  )
}

// Port of the design reference's `.events-offer-*` slide carousel: one
// full-width slide at a time, prev/next arrows, dot indicators, autoplay, pause
// on hover/focus, and arrow-key nav.
//
// No Pause/Play button — the reference has none. Its JS does reference a
// `toggleButton`, which is why one was built here, but no such element exists in
// its markup; the control is dead code carried through the design. Hover/focus
// pause covers the same need without occupying the toolbar.
//
// Seamless infinite loop: the track is [cloneOfLast, ...slides, cloneOfFirst];
// real slide k sits at track position k+1. Advancing past the last slide glides
// forward onto the leading clone, then snaps back (no transition) to the real
// first slide — so it always loops forward, never reverses.
export const SlideCarouselBlock: React.FC<Props> = ({
  eyebrow,
  heading,
  autoplay = true,
  interval,
  slides,
  cssClass,
  elementClasses,
}) => {
  // All three Element styles slots were mounted by the shared helper and never
  // read here, so every preset an editor picked for this block was discarded.
  const headingClass = toClassName(elementClasses?.heading)
  const cardClass = toClassName(elementClasses?.card)
  const buttonClass = toClassName(elementClasses?.button)
  const count = slides?.length || 0
  const looped = count > 1
  const base = looped ? 1 : 0 // track position of the first real slide
  // `pos` and `animate` move together — a snap is "this position, without a
  // transition", and splitting them let a re-render apply one before the other.
  const [track, setTrack] = useState({ pos: base, animate: true })
  const { pos, animate } = track
  const [hovering, setHovering] = useState(false) // hover/focus pause
  const tick = (interval ?? 5800) || 5800
  // A step that had to wait for a snap to happen first (see `advance`).
  const pendingStep = useRef<1 | -1 | null>(null)

  /**
   * The track position of the REAL slide at `p`, mapping each clone onto its
   * twin: 0 (clone of last) → count, count + 1 (clone of first) → 1. Defined over
   * every integer, so it also recovers a position that has left the track.
   */
  const realPos = useCallback(
    (p: number): number => (looped ? ((((p - 1) % count) + count) % count) + 1 : p),
    [looped, count],
  )

  const active = looped ? realPos(pos) - 1 : pos // real slide index (for dots)

  /**
   * Move one slide, keeping `pos` inside 0…count+1.
   *
   * ── The bug this exists to prevent ──
   * This used to be `setPos((p) => p + dir)` with no bound at all, and the only
   * thing that ever pulled `pos` back was `onTransitionEnd` matching exactly
   * `count + 1` or `0`. Clicking faster than the 0.55s transform transition keeps
   * restarting it, so `transitionend` does not fire until the last click settles —
   * by which point `pos` is past the end and matches neither branch, and nothing
   * snaps it back. Measured: 8 fast clicks left the track at translateX(-9702px),
   * position 9 of a 6-card track, with no slide in the viewport. The dots kept
   * highlighting (the active dot is computed with modulo), so it read as a blank
   * panel on a working carousel rather than a counter that had run away.
   *
   * Stepping from a clone is the case that used to leak. The clone is pixel
   * identical to its twin, so snapping there WITHOUT a transition is invisible;
   * the queued step then animates from the twin on the next frame and still reads
   * as forward. Clamping instead would animate backwards across the whole track.
   */
  const advance = useCallback(
    (dir: 1 | -1) => {
      setTrack(({ pos: p }) => {
        if (!looped) return { pos: Math.min(Math.max(p + dir, 0), count - 1), animate: true }
        const next = p + dir
        if (next >= 0 && next <= count + 1) return { pos: next, animate: true }
        pendingStep.current = dir
        return { pos: realPos(p), animate: false }
      })
    },
    [looped, count, realPos],
  )

  const goTo = useCallback(
    (realIndex: number) => {
      pendingStep.current = null
      setTrack({ pos: realIndex + (count > 1 ? 1 : 0), animate: true })
    },
    [count],
  )

  // After a no-transition snap, re-enable the transition on the next frame so the
  // following slide animates again — and apply any step that was queued because
  // the snap had to happen first.
  useEffect(() => {
    if (animate) return
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const dir = pendingStep.current
        pendingStep.current = null
        setTrack(({ pos: p }) => ({ pos: dir ? p + dir : p, animate: true }))
      }),
    )
    return () => cancelAnimationFrame(raf)
  }, [animate])

  useEffect(() => {
    if (!autoplay || hovering || count <= 1) return
    // Through `advance`, not its own `p + 1`: the unbounded increment was here a
    // second time, and a timer that fires while a click burst is mid-flight would
    // have walked off the track exactly the same way.
    const id = window.setInterval(() => advance(1), tick)
    return () => window.clearInterval(id)
  }, [autoplay, hovering, count, tick, advance])

  // When we land on a clone, jump (without animation) to the matching real slide.
  // Written as "anything outside 1…count", not as two exact values, so this is a
  // total recovery rather than two special cases.
  const onTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (!looped) return
    // `transitionend` bubbles. No card carries a transition today, but the block's
    // Element-styles presets can put one on `.events-offer-card`, and a bubbled
    // event would fire a spurious snap mid-glide.
    if (e.target !== e.currentTarget) return
    setTrack((prev) =>
      prev.pos >= 1 && prev.pos <= count ? prev : { pos: realPos(prev.pos), animate: false },
    )
  }

  if (!slides || count === 0) return null

  // Build the rendered track (with leading/trailing clones when looping).
  const trackSlides: { slide: Slide; key: string; hidden: boolean; realIndex: number }[] = looped
    ? [
        { slide: slides[count - 1], key: 'clone-last', hidden: true, realIndex: count - 1 },
        ...slides.map((slide, i) => ({ slide, key: `s-${i}`, hidden: i !== active, realIndex: i })),
        { slide: slides[0], key: 'clone-first', hidden: true, realIndex: 0 },
      ]
    : slides.map((slide, i) => ({ slide, key: `s-${i}`, hidden: i !== active, realIndex: i }))

  return (
    <section
      // An ARIA label is an attribute: it needs words, not a tree.
      aria-label={richTextToPlain(heading) || 'Carousel'}
      className={cn('events-offer-stage vf-slide-carousel', toClassName(cssClass))}
      data-offer-carousel
      // Hover/focus pause is bound to the whole STAGE, matching the reference,
      // which binds to `[data-offer-carousel]`. Ours was bound to the inner
      // viewport, so moving the pointer onto the heading, the arrows or the dots
      // — the places you go precisely when you want it to stop — let it keep
      // advancing. The interval itself was never the problem: measured 5801ms
      // against the reference's 5800ms, with an identical 0.55s transition.
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocusCapture={() => setHovering(true)}
      onBlurCapture={() => setHovering(false)}
    >
      <div className="events-offer-shell">
        <div className="events-offer-toolbar vf-slide-carousel__toolbar">
          <div>
            <InlineRichText as="div" className="events-offer-eyebrow" data={eyebrow} />
            <InlineRichText as="h2" className={headingClass || undefined} data={heading} />
          </div>
        </div>

        <div
          className="events-offer-carousel vf-slide-carousel__viewport"
          aria-roledescription="carousel"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') {
              e.preventDefault()
              advance(-1)
            }
            if (e.key === 'ArrowRight') {
              e.preventDefault()
              advance(1)
            }
          }}
        >
          <div
            className="events-offer-track vf-slide-carousel__track"
            style={{
              transform: `translateX(-${pos * 100}%)`,
              transition: animate ? undefined : 'none',
            }}
            onTransitionEnd={onTransitionEnd}
          >
            {trackSlides.map((t) => (
              <Card
                key={t.key}
                slide={t.slide}
                hidden={t.hidden}
                label={`${String(t.realIndex + 1).padStart(2, '0')} / ${String(count).padStart(2, '0')}`}
                className={cardClass}
              />
            ))}
          </div>

          {count > 1 ? (
            <>
              <button
                type="button"
                className={cn('events-offer-arrow events-offer-arrow-prev vf-slide-carousel__arrow', buttonClass)}
                aria-label="Previous slide"
                onClick={() => advance(-1)}
              >
                <Icon name="caret-left" className="size-5" />
              </button>
              <button
                type="button"
                className={cn('events-offer-arrow events-offer-arrow-next vf-slide-carousel__arrow', buttonClass)}
                aria-label="Next slide"
                onClick={() => advance(1)}
              >
                <Icon name="caret-right" className="size-5" />
              </button>
            </>
          ) : null}
        </div>

        {count > 1 ? (
          <div className="events-offer-dots vf-slide-carousel__dots" aria-label="Select slide">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                className={cn(i === active && 'is-active')}
                aria-label={`Show slide ${i + 1}`}
                aria-pressed={i === active}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
