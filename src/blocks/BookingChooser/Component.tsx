import { InlineRichText } from '@/components/RichText/Inline'
import React from 'react'

import type { BookingChooserBlock as Props } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Icon } from '@/components/Icon'
import { Section } from '@/components/Section'
import { cn } from '@/utilities/ui'
import { hasRichText } from '@/utilities/lexicalText'
import { toClassName } from '@/utilities/cssClass'
import {
  applyRegistrationHref,
  getRegistrationEnquiryHref,
  hasRegistrationLink,
} from '@/utilities/registrationEnquiry'

// accent value → design-reference panel modifier class.
const accentClass: Record<string, string> = {
  blue: 'booking-half--light',
  dark: 'booking-half--dark',
}

export const BookingChooserBlock: React.FC<Props & { bare?: boolean }> = async ({
  anchorId,
  halves,
  cssClass,
  density,
  bare,
}) => {
  if (!Array.isArray(halves) || halves.length === 0) return null

  // Which halves will ACTUALLY render, settled once and BEFORE the markup, because
  // the count decides the layout: one panel fills the band (`booking-split--solo`),
  // two share it. Filtering inside the map — which is where this used to happen —
  // makes that count unknowable at the point it is needed.
  //
  // `hasRichText`, not truthiness: an empty rich text is a truthy OBJECT, so
  // `half.eyebrow || half.title || …` counted a panel with nothing typed in it
  // (invariant 30). Same shape as LeadershipSpotlight's own emptiness check.
  const panels = halves.filter(
    (half) =>
      Boolean(half?.icon) ||
      hasRichText(half?.eyebrow) ||
      hasRichText(half?.title) ||
      hasRichText(half?.description) ||
      (Array.isArray(half?.links) && half.links.length > 0),
  )

  // Every half is blank — render nothing rather than an empty coloured band.
  if (panels.length === 0) return null

  // Read once for the whole block, then applied per panel below: awaiting inside
  // the halves map would hand React an array of promises. Skipped entirely when
  // no panel uses a registration link.
  const registrationHref = panels.some((half) => hasRegistrationLink(half?.links))
    ? await getRegistrationEnquiryHref()
    : null

  return (
    <Section
      container={false}
      id={anchorId || undefined}
      className={cn('booking-section', density === 'compact' && 'booking-section--compact', toClassName(cssClass))}
      bare={bare}
    >
      <div className={cn('booking-split', panels.length === 1 && 'booking-split--solo')}>
        {panels.map((half, i) => {
          const modifier = accentClass[half?.accent || 'blue'] || accentClass.blue
          const links = applyRegistrationHref(
            Array.isArray(half?.links) ? half.links : [],
            registrationHref,
          )

          return (
            <div key={i} className={cn('booking-half', modifier)}>
              {half.icon ? (
                <span className="booking-half-watermark" aria-hidden="true">
                  <Icon name={half.icon} />
                </span>
              ) : null}

              <div className="booking-half-inner">
                {half.icon ? (
                  <span className="booking-half-icon" aria-hidden="true">
                    <Icon name={half.icon} />
                  </span>
                ) : null}

                <InlineRichText as="div" className="booking-half-eyebrow" data={half.eyebrow} />

                <InlineRichText as="h2" data={half.title} />

                <InlineRichText as="p" className="booking-half-sub" data={half.description} />

                {links.length > 0 ? (
                  <div className="booking-half-actions">
                    {links.map(({ link }, j) => {
                      // Render the link's icon AS A TRAILING ARROW (via children),
                      // matching the design's `.booking-half-cta i` — so strip it
                      // from the props passed to CMSLink (which renders icons leading).
                      const { icon, ...rest } = link || {}
                      return (
                        <CMSLink
                          key={j}
                          {...rest}
                          appearance="inline"
                          className={cn(
                            'booking-half-cta',
                            j > 0 && 'booking-half-cta--outline',
                          )}
                        >
                          {icon ? <Icon name={icon} /> : null}
                        </CMSLink>
                      )
                    })}
                  </div>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </Section>
  )
}
