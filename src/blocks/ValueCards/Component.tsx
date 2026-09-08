import { InlineRichText } from '@/components/RichText/Inline'
import React from 'react'

import type { ValueCardsBlock as Props } from '@/payload-types'

import { Section, type SectionBackground } from '@/components/Section'
import { SectionHeader } from '@/components/SectionHeader'
import { cn } from '@/utilities/ui'
import { toClassName } from '@/utilities/cssClass'

// "Our Values" (CCARRE) — dark band, centred header, icon-less value cards in a
// 3-column grid. The alternating light-blue tint on the 2nd/4th/6th card is
// handled entirely by the ported `.value-card:nth-child(...)` CSS, so the
// component just emits cards in order.
export const ValueCardsBlock: React.FC<Props & { bare?: boolean }> = ({
  eyebrow,
  heading,
  subheading,
  textColour,
  background,
  cards,
  cssClass,
  anchorId,
  motion,
  containerWidth,
  bare,
}) => {
  if (!cards || cards.length === 0) return null

  const bg = (background as SectionBackground) || 'dark'

  return (
    <Section
      background={bg}
      className={cn('our-values', toClassName(cssClass))}
      motion={motion}
      containerWidth={containerWidth}
      id={anchorId || undefined}
      bare={bare}
    >
      <SectionHeader
        className="values-header"
        eyebrow={eyebrow}
        title={heading}
        subtitle={subheading}
        colour={textColour}
        align="center"
      />

      <div className="values-grid">
        {cards.map((card, i) => (
          <div key={i} className="value-card">
            <InlineRichText as="h3" data={card.title} />
            <InlineRichText as="p" data={card.description} />
          </div>
        ))}
      </div>
    </Section>
  )
}
