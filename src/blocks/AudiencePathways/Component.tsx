import { hasRichText } from '@/utilities/lexicalText'
import { InlineRichText } from '@/components/RichText/Inline'
import React from 'react'

import type { AudiencePathwaysBlock as Props } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Section, type SectionBackground } from '@/components/Section'
import { cn } from '@/utilities/ui'
import { toClassName } from '@/utilities/cssClass'

export const AudiencePathwaysBlock: React.FC<Props & { bare?: boolean }> = ({
  eyebrow,
  heading,
  subheading,
  textColour,
  background,
  pathways,
  anchorId,
  cssClass,
  containerWidth,
  motion,
  bare,
}) => {
  const cards = Array.isArray(pathways) ? pathways : []
  const hasHeader = hasRichText(eyebrow) || hasRichText(heading) || hasRichText(subheading)
  if (cards.length === 0 && !hasHeader) return null

  return (
    <Section
      id={anchorId || undefined}
      background={(background as SectionBackground) || 'muted'}
      className={cn('ime-pathways', toClassName(cssClass))}
      containerWidth={containerWidth}
      motion={motion}
      bare={bare}
    >
      {hasHeader ? (
        <div className="ime-pathways-header">
          <InlineRichText as="div" className="section-label" data={eyebrow} colour={textColour} />
          <InlineRichText as="h2" data={heading} colour={textColour} />
          <InlineRichText as="p" data={subheading} colour={textColour} />
        </div>
      ) : null}

      {cards.length > 0 ? (
        <div className="ime-pathways-grid">
          {cards.map((card, i) => {
            const steps = Array.isArray(card.steps) ? card.steps : []
            const variantClass =
              card.variant === 'claimant'
                ? 'ime-pathway-card--claimant'
                : 'ime-pathway-card--client'

            return (
              <div key={i} className={cn('ime-pathway-card', variantClass)}>
                <div className="ime-pathway-card-top">
                  {card.eyebrow ? (
                    <InlineRichText as="div" className="ime-pathway-audience" data={card.eyebrow} />
                  ) : null}
                  <InlineRichText as="h3" data={card.title} />
                  <InlineRichText as="p" data={card.description} />
                </div>

                <div className="ime-pathway-card-body">
                  {steps.length > 0 ? (
                    <div className="ime-pathway-steps">
                      {steps.map((step, j) => (
                        <div key={j} className="ime-pathway-step">
                          <div className="ime-pathway-step-num">{j + 1}</div>
                          <div className="ime-pathway-step-text">
                            <InlineRichText as="strong" data={step.title} />
                            <InlineRichText as="span" data={step.description} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {card.link ? (
                    <CMSLink {...card.link} className="ime-pathway-cta" />
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      ) : null}
    </Section>
  )
}
