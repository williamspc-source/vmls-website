'use client'

import { type RichTextValue } from '@/utilities/lexicalText'
import { InlineRichText } from '@/components/RichText/Inline'
import React, { useCallback, useEffect, useState } from 'react'

import { Icon } from '@/components/Icon'
import { cn } from '@/utilities/ui'

export type FeaturedSlide = {
  imageUrl: string | null
  badge: string
  category: string | null
  title: string
  excerpt: string | null
  byline: string | null
  href: string
}

// Faithful port of the design-reference `.ni-carousel` (In the Loop → Featured):
// one full-width article slide at a time, a sliding translateX track, prev/next
// round arrow buttons, dot indicators, 5s autoplay, pause on hover and
// wrap-around at both ends.
export const FeaturedArticlesClient: React.FC<{
  slides: FeaturedSlide[]
  ctaLabel?: RichTextValue
  autoplay?: boolean | null
  interval?: number | null
  showArrows?: boolean | null
  showDots?: boolean | null
}> = ({
  slides,
  ctaLabel = 'Read Full Article →',
  autoplay = true,
  interval,
  showArrows = true,
  showDots = true,
}) => {
  const count = slides.length
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const goTo = useCallback(
    (index: number) => {
      if (count === 0) return
      setCurrent(((index % count) + count) % count)
    },
    [count],
  )

  // `?? 5000` only — NOT `(interval ?? 5000) || 5000`, which is what SlideCarousel
  // does and which silently turns a stored 0 back into the default, making the
  // field unable to express a value it accepts.
  const tick = interval ?? 5000
  useEffect(() => {
    if (autoplay === false || paused || count <= 1 || tick <= 0) return
    const timer = window.setInterval(() => {
      setCurrent((c) => (c + 1) % count)
    }, tick)
    return () => window.clearInterval(timer)
  }, [autoplay, paused, count, tick])

  if (count === 0) return null

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="ni-carousel">
        <div
          className="ni-carousel-track"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
        {slides.map((slide, i) => (
          <div className="ni-carousel-slide" key={i}>
            <div className="ni-featured-img">
              {slide.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={slide.imageUrl}
                  alt=""
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <>
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.25"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <rect height="18" rx="2" width="18" x="3" y="3" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span className="ni-featured-img-label">Image Placeholder</span>
                </>
              )}
            </div>
            <div className="ni-featured-content">
              <div className="ni-featured-tags">
                <span className="ni-featured-badge">{slide.badge}</span>
                {slide.category ? (
                  <span className="ni-featured-category">{slide.category}</span>
                ) : null}
              </div>
              <h2>{slide.title}</h2>
              {slide.excerpt ? <p>{slide.excerpt}</p> : null}
              {slide.byline ? <div className="ni-featured-byline">{slide.byline}</div> : null}
              <a className="ni-read-more" href={slide.href}>
                <InlineRichText data={ctaLabel} />
              </a>
              </div>
            </div>
          ))}
        </div>

        {showArrows !== false && count > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous"
              className="ni-carousel-btn ni-carousel-btn-prev"
              onClick={() => goTo(current - 1)}
            >
              <Icon name="caret-left" />
            </button>
            <button
              type="button"
              aria-label="Next"
              className="ni-carousel-btn ni-carousel-btn-next"
              onClick={() => goTo(current + 1)}
            >
              <Icon name="caret-right" />
            </button>
          </>
        ) : null}
      </div>

      {showDots !== false && count > 1 ? (
        <div className="ni-carousel-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              className={cn('ni-carousel-dot', i === current && 'is-active')}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
