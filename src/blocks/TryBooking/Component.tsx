import React from 'react'

import type { TryBookingBlock as Props } from '@/payload-types'

import { InlineRichText } from '@/components/RichText/Inline'
import { Section, type SectionBackground } from '@/components/Section'
import { SectionHeader } from '@/components/SectionHeader'
import { cn } from '@/utilities/ui'
import { toClassName } from '@/utilities/cssClass'
import { TryBookingClient } from './TryBookingClient'

/**
 * `https://www.trybooking.com/<eventId>` is TryBooking's documented numeric
 * Booking URL, and is where the fallback button points. Verified against a live
 * event rather than assumed: 1525708 resolves to the real listing, and an
 * invented id returns 404 — so the format genuinely resolves rather than merely
 * failing to error. Deriving it from the id keeps this to one field with no
 * second URL for an editor to keep in step.
 */
const bookingUrl = (eventId: string): string =>
  `https://www.trybooking.com/${encodeURIComponent(eventId.trim())}`

export const TryBookingBlock: React.FC<Props & { bare?: boolean }> = ({
  eyebrow,
  heading,
  subheading,
  textColour,
  eventId,
  widgetType,
  fallbackLabel,
  background,
  anchorId,
  cssClass,
  containerWidth,
  motion,
  bare,
}) => {
  // `required` in the config covers the admin; a block saved before the field
  // existed, or written by a seed, could still arrive empty — and an empty id
  // would render a widget for nothing and a fallback link to the site root.
  const id = eventId?.trim()
  if (!id) return null

  return (
    <Section
      id={anchorId || undefined}
      background={background as SectionBackground}
      className={cn('vf-trybooking-section', toClassName(cssClass))}
      containerWidth={containerWidth}
      motion={motion}
      bare={bare}
    >
      <SectionHeader
        eyebrow={eyebrow}
        title={heading}
        subtitle={subheading}
        align="center"
        colour={textColour}
      />

      <TryBookingClient
        eventId={id}
        widgetType={widgetType || 'landingPageEmbed'}
        fallbackHref={bookingUrl(id)}
      >
        <InlineRichText data={fallbackLabel} />
      </TryBookingClient>
    </Section>
  )
}
