import { hasRichText } from '@/utilities/lexicalText'
import { InlineRichText } from '@/components/RichText/Inline'
import React from 'react'

import type { CostGridBlock as Props } from '@/payload-types'

import RichText from '@/components/RichText'
import { Icon } from '@/components/Icon'
import { Section } from '@/components/Section'
import { cn } from '@/utilities/ui'
import { toClassName } from '@/utilities/cssClass'

// Cost / inclusions grid on a fixed dark band: translucent white cards with an
// icon, title and description, plus a trailing emphasis note. Ported 1:1 from the
// design reference (.cost-section / .cost-header / .cost-items / .cost-item /
// .cost-emphasis in information-centre/for-clients.html). All copy is editable.
export const CostGridBlock: React.FC<Props & { bare?: boolean }> = ({
  eyebrow,
  heading,
  subheading,
  textColour,
  cards,
  note,
  anchorId,
  cssClass,
  bare,
}) => {
  const hasCards = Array.isArray(cards) && cards.length > 0
  const hasHeader = hasRichText(eyebrow) || hasRichText(heading) || hasRichText(subheading)
  if (!hasCards && !hasHeader && !note) return null

  return (
    <Section
      background="dark"
      bare={bare}
      id={anchorId || undefined}
      className={cn('cost-section', toClassName(cssClass))}
    >
      {hasHeader ? (
        <div className="cost-header">
          <InlineRichText as="div" className="section-label" data={eyebrow} colour={textColour} />
          <InlineRichText as="h2" className="section-title" data={heading} colour={textColour} />
          <InlineRichText as="p" className="section-subtitle" data={subheading} colour={textColour} />
        </div>
      ) : null}

      {hasCards ? (
        <div className="cost-items">
          {cards!.map((card, i) => (
            <article key={i} className="cost-item">
              {card.icon ? (
                <div className="cost-item-icon">
                  <Icon name={card.icon} />
                </div>
              ) : null}
              <InlineRichText as="h3" data={card.title} />
              <InlineRichText as="p" data={card.description} />
            </article>
          ))}
        </div>
      ) : null}

      {note ? (
        <div className="cost-emphasis">
          <RichText data={note} enableGutter={false} enableProse={false} />
        </div>
      ) : null}
    </Section>
  )
}
