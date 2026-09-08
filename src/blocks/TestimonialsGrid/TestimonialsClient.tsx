'use client'

import { InlineRichText } from '@/components/RichText/Inline'
import { type RichTextValue } from '@/utilities/lexicalText'
import React, { useEffect, useMemo, useState } from 'react'

export type TestimonialCard = {
  rating: number
  quote: RichTextValue
  position?: RichTextValue
  orgLoc?: RichTextValue
}

const Chevron: React.FC<{ dir: 'prev' | 'next' }> = ({ dir }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden>
    {dir === 'prev' ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
  </svg>
)

/** Testimonials carousel matching the design-reference `.testimonials-*` markup. */
export const TestimonialsClient: React.FC<{
  cards: TestimonialCard[]
  visible?: number
  showArrows?: boolean
  /** Preset class(es) from the block's "Element styles → Cards" picker. */
  cardClassName?: string
}> = ({ cards, visible = 3, showArrows = true, cardClassName }) => {
  const [perView, setPerView] = useState(visible)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth
      setPerView(w < 720 ? 1 : w < 1040 ? Math.min(2, visible) : visible)
    }
    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [visible])

  const maxIndex = Math.max(0, cards.length - perView)
  const clamped = Math.min(index, maxIndex)
  const gap = 24
  const basis = useMemo(
    () => `calc((100% - ${(perView - 1) * gap}px) / ${perView})`,
    [perView],
  )
  const shift = `calc(-${clamped} * (100% - ${(perView - 1) * gap}px) / ${perView} - ${clamped * gap}px)`

  return (
    <div className="testimonials-carousel-wrapper">
      {showArrows ? (
        <button
          className="testimonials-nav testimonials-nav--prev"
          aria-label="Previous testimonial"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={clamped <= 0}
          type="button"
        >
          <Chevron dir="prev" />
        </button>
      ) : null}

      <div className="testimonials-viewport">
        <div className="testimonials-track" style={{ transform: `translateX(${shift})` }}>
          {cards.map((t, i) => (
            <div
              className={['testimonial-card', 'vf-card', cardClassName]
                .filter(Boolean)
                .join(' ')}
              key={i}
              style={{ flex: `0 0 ${basis}`, minWidth: 0 }}
            >
              {t.rating > 0 ? <div className="stars">{'★'.repeat(t.rating)}</div> : null}
              <div className="testimonial-quote" aria-hidden>
                &ldquo;
              </div>
              <InlineRichText as="div" className="testimonial-text" data={t.quote} />
              <div className="testimonial-author">
                <InlineRichText as="div" className="testimonial-position" data={t.position} />
                <InlineRichText as="div" className="testimonial-org-loc" data={t.orgLoc} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {showArrows ? (
        <button
          className="testimonials-nav testimonials-nav--next"
          aria-label="Next testimonial"
          onClick={() => setIndex((i) => Math.min(maxIndex, i + 1))}
          disabled={clamped >= maxIndex}
          type="button"
        >
          <Chevron dir="next" />
        </button>
      ) : null}
    </div>
  )
}
