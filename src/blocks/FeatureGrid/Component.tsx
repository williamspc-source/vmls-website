import { hasRichText } from '@/utilities/lexicalText'
import { InlineRichText } from '@/components/RichText/Inline'
import React from 'react'

import type { FeatureGridBlock as Props } from '@/payload-types'

import { Icon } from '@/components/Icon'
import { Section, type SectionBackground } from '@/components/Section'
import { SectionHeader } from '@/components/SectionHeader'
import { cn } from '@/utilities/ui'
import { toClassName } from '@/utilities/cssClass'

export const FeatureGridBlock: React.FC<Props & { bare?: boolean }> = ({
  eyebrow,
  heading,
  subheading,
  textColour,
  background,
  columns,
  cardStyle,
  items,
  headingWeight,
  cssClass,
  elementClasses,
  motion,
  containerWidth,
  hoverEffect,
  shadow,
  bare,
}) => {
  if (!items || items.length === 0) return null
  const cols = Number(columns) || 3

  // The banded style needs somewhere to paint: icon + title on a tinted panel,
  // everything else below it. Every other style keeps the flat sibling markup it
  // has always had, so the six other pages using this block are byte-identical —
  // which also keeps computedSnapshot's structural index paths valid for them.
  const banded = cardStyle === 'banded'
  const Head = banded
    ? ({ children }: { children: React.ReactNode }) => <div className="vf-card__head">{children}</div>
    : React.Fragment
  const Body = banded
    ? ({ children }: { children: React.ReactNode }) => <div className="vf-card__body">{children}</div>
    : React.Fragment

  return (
    <Section
      background={background as SectionBackground}
      className={cn('vf-feature-grid', headingWeight === 'heavy' && 'vf-headings--heavy', toClassName(cssClass))}
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

      {/* `--vf-cols`, not an inline `grid-template-columns`. An inline longhand
          outranks every stylesheet including the responsive `.services-grid`
          overrides, so this grid stayed hard 2-across down to 480px. Every other
          grid block sets the custom property; the comment at globals.css:2189
          exists because of exactly this. */}
      <div className="services-grid" style={{ '--vf-cols': cols } as React.CSSProperties}>
        {items.map((item, i) => (
          <div
            key={i}
            className={cn(
              'service-card vf-card',
              // 'Plain (no border)' was stored and ignored — the bordered card
              // rendered either way.
              cardStyle === 'plain' && 'vf-card--plain',
              banded && 'vf-card--banded',
              cardStyle === 'soft' && 'vf-card--soft',
              cardStyle === 'benefit' && 'vf-card--benefit',
              toClassName(elementClasses?.card),
            )}
          >
            <Head>
              {item.icon ? (
                <div className="service-icon vf-card__icon">
                  <Icon name={item.icon} />
                </div>
              ) : null}
              <h3 className="service-title vf-card__title">
                <InlineRichText data={item.title} />
                {hasRichText(item.titleSuffix) ? (
                  <span className="vf-card__title-suffix">
                    {' '}
                    <InlineRichText data={item.titleSuffix} />
                  </span>
                ) : null}
              </h3>
            </Head>
            <Body>
            <InlineRichText as="p" className="service-desc" data={item.description} />
            {Array.isArray(item.bullets) && item.bullets.length > 0 ? (
              <ul className="vf-feature-bullets">
                {item.bullets.map((b, j) => (
                  <InlineRichText as="li" key={j} data={b.text} />
                ))}
              </ul>
            ) : null}
            {item.detailsLabel || (Array.isArray(item.details) && item.details.length > 0) ? (
              <div className="vf-feature-details">
                {item.detailsLabel ? (
                  <InlineRichText as="div" className="vf-feature-details__label" data={item.detailsLabel} />
                ) : null}
                {Array.isArray(item.details)
                  ? item.details.map((d, j) => (
                      <div key={j} className="vf-feature-detail">
                        {d.icon ? (
                          <span className="vf-feature-detail__icon">
                            <Icon name={d.icon} className="size-5" />
                          </span>
                        ) : null}
                        <div>
                          <InlineRichText as="strong" data={d.title} />
                          <InlineRichText as="p" data={d.description} />
                        </div>
                      </div>
                    ))
                  : null}
              </div>
            ) : null}
            </Body>
          </div>
        ))}
      </div>
    </Section>
  )
}
