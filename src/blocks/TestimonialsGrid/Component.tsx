import { InlineRichText } from '@/components/RichText/Inline'
import configPromise from '@payload-config'
import { getPayload, type Where } from 'payload'
import React from 'react'

import type { TestimonialsGridBlock as Props, Testimonial } from '@/payload-types'

import { Section, type SectionBackground } from '@/components/Section'
import { SectionHeader } from '@/components/SectionHeader'
import { cn } from '@/utilities/ui'
import { toClassName } from '@/utilities/cssClass'
import { TestimonialsClient, type TestimonialCard } from './TestimonialsClient'

// Attribution is two lines: the position, then the organisation and location
// (index.html:468-476). No portrait and no personal name — these are anonymised
// client quotes, and a placeholder avatar on every card was pure noise.
const Card: React.FC<{ t: Testimonial; className?: string }> = ({ t, className }) => {
  const rating = Math.max(0, Math.min(5, t.rating ?? 5))
  return (
    <div className={cn('testimonial-card vf-card', className)}>
      {rating > 0 ? <div className="stars">{'★'.repeat(rating)}</div> : null}
      <div className="testimonial-quote" aria-hidden="true">
        &ldquo;
      </div>
      <InlineRichText as="div" className="testimonial-text" data={t.quote} />
      <div className="testimonial-author">
        <InlineRichText as="div" className="testimonial-position" data={t.authorRole} />
        <InlineRichText as="div" className="testimonial-org-loc" data={t.org} />
      </div>
    </div>
  )
}

export const TestimonialsGridBlock: React.FC<Props & { bare?: boolean }> = async (props) => {
  const {
    eyebrow,
    heading,
    subheading,
    textColour,
    background,
    source = 'auto',
    featuredOnly,
    testimonials,
    columns,
    limit,
    layout,
    carouselOptions,
    cssClass,
    elementClasses,
    motion,
    containerWidth,
    hoverEffect,
    shadow,
    bare,
  } = props

  const cols = Number(columns) || 3
  let docs: Testimonial[] = []

  if (source === 'manual') {
    docs = (testimonials || []).filter((t): t is Testimonial => typeof t === 'object')
  } else {
    const payload = await getPayload({ config: configPromise })
    const where: Where = {}
    if (featuredOnly) where.featured = { equals: true }
    const res = await payload.find({
      collection: 'testimonials',
      depth: 1,
      limit: limit || 6,
      sort: 'order',
      ...(featuredOnly ? { where } : {}),
    })
    docs = res.docs
  }

  if (docs.length === 0) return null

  return (
    <Section
      background={background as SectionBackground}
      className={cn('vf-testimonials-grid', toClassName(cssClass))}
      motion={motion}
      containerWidth={containerWidth}
      hoverEffect={hoverEffect}
      shadow={shadow}
      bare={bare}
    >
      <SectionHeader
        eyebrow={eyebrow}
        title={heading}
        subtitle={subheading}
        colour={textColour}
        align="center"
        titleClassName={toClassName(elementClasses?.heading)}
      />
      {layout === 'carousel' ? (
        <TestimonialsClient
          cards={docs.map(
            (t): TestimonialCard => ({
              rating: Math.max(0, Math.min(5, t.rating ?? 5)),
              quote: t.quote,
              position: t.authorRole,
              orgLoc: t.org || null,
            }),
          )}
          visible={(carouselOptions as { visible?: number } | undefined)?.visible || cols}
          showArrows={(carouselOptions as { showArrows?: boolean } | undefined)?.showArrows ?? true}
          cardClassName={toClassName(elementClasses?.card)}
        />
      ) : (
        <div
          className="testimonials-grid"
          style={{ '--vf-cols': cols } as React.CSSProperties}
        >
          {docs.map((t, i) => (
            <Card key={i} t={t} className={toClassName(elementClasses?.card)} />
          ))}
        </div>
      )}
    </Section>
  )
}
