import { InlineRichText } from '@/components/RichText/Inline'
import React from 'react'

import type { GatewayCardsBlock as Props } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Icon } from '@/components/Icon'
import { Section, type SectionBackground } from '@/components/Section'
import { SectionHeader } from '@/components/SectionHeader'
import { cn } from '@/utilities/ui'
import { toClassName } from '@/utilities/cssClass'

export const GatewayCardsBlock: React.FC<Props & { bare?: boolean }> = ({
  eyebrow,
  heading,
  subheading,
  textColour,
  background,
  columns,
  cards,
  cssClass,
  elementClasses,
  motion,
  containerWidth,
  hoverEffect,
  shadow,
  bare,
}) => {
  if (!cards || cards.length === 0) return null
  const cols = Number(columns) || 3

  return (
    <Section
      background={background as SectionBackground}
      className={cn('vf-gateway-cards', toClassName(cssClass))}
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

      <div
        className="audience-gateway-grid"
        // `--vf-cols`, not an inline `grid-template-columns`: an inline style
        // beats every stylesheet rule INCLUDING media queries, which silently
        // killed the ≤960px single-column rule in globals.css. See TRAPS.md.
        style={{ '--vf-cols': cols } as React.CSSProperties}
      >
        {cards.map((card, i) => {
          const quickLinks = (card.links || []).filter((l) => l.link?.label)
          const hasBottom = quickLinks.length > 0 || Boolean(card.link?.label)
          const accentClass = card.accent
            ? { blue: 'card-accent-1', steel: 'card-accent-2', charcoal: 'card-accent-3' }[
                card.accent
              ]
            : `card-accent-${(i % 3) + 1}`
          return (
            <div
              key={i}
              className={cn(
                'audience-card vf-card',
                accentClass,
                card.theme === 'dark' && 'vf-gateway-card--dark',
                toClassName(elementClasses?.card),
              )}
            >
              <div className="audience-card-top">
                {card.icon ? (
                  <div className="audience-card-icon vf-card__icon">
                    <Icon name={card.icon} className="size-6" />
                  </div>
                ) : null}
                {card.eyebrow ? (
                  <InlineRichText as="div" className="audience-card-eyebrow section-label" data={card.eyebrow} />
                ) : null}
                <InlineRichText as="div" className="audience-card-label vf-card__title" data={card.title} />
                {card.subtitle ? (
                  <InlineRichText as="div" className="audience-card-subtitle" data={card.subtitle} />
                ) : null}
                <InlineRichText as="div" className="audience-card-hook" data={card.description} />
              </div>
              {hasBottom ? (
                <div className="audience-card-bottom">
                  {quickLinks.length > 0 ? (
                    <div className="audience-card-links">
                      {quickLinks.map(({ link }, j) => (
                        <CMSLink key={j} {...link} appearance="inline" className="audience-card-link">
                          <span className="audience-card-link-arrow" aria-hidden>
                            →
                          </span>
                        </CMSLink>
                      ))}
                    </div>
                  ) : null}
                  {card.link?.label ? (
                    <CMSLink {...card.link} appearance="inline" className="btn-gateway-cta" />
                  ) : null}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </Section>
  )
}
