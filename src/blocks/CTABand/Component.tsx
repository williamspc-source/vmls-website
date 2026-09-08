import { InlineRichText } from '@/components/RichText/Inline'
import React from 'react'

import type { CTABandBlock as Props } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Section } from '@/components/Section'
import { cn } from '@/utilities/ui'
import { toClassName } from '@/utilities/cssClass'

// Always a dark gradient band (mirrors the design reference's `.about-cta`).
export const CTABandBlock: React.FC<Props & { bare?: boolean }> = ({
  eyebrow,
  heading,
  text,
  links,
  cssClass,
  elementClasses,
  motion,
  containerWidth,
  bare,
}) => {
  if (!heading) return null

  return (
    <Section
      background="primary"
      className={cn('vf-cta-band', toClassName(cssClass))}
      motion={motion}
      containerWidth={containerWidth}
      bare={bare}
    >
      <div className="vf-cta-band__content">
        <InlineRichText as="p" className="vf-cta-band__eyebrow section-label" data={eyebrow} />
        <InlineRichText
          as="h2"
          className={cn('vf-cta-band__heading', toClassName(elementClasses?.heading))}
          data={heading}
        />
        <InlineRichText as="p" className="vf-cta-band__text" data={text} />

        {Array.isArray(links) && links.length > 0 ? (
          <div className="vf-cta-band__actions">
            {/* Style follows the editor's Appearance choice; list position is the
                fallback for links saved before it was honoured. */}
            {links.map(({ link }, i) => {
              const outline = link?.appearance ? link.appearance === 'outline' : i > 0
              return (
                <CMSLink
                  key={i}
                  {...link}
                  appearance="inline"
                  className={cn(
                    'btn',
                    outline ? 'btn-outline' : 'btn-white',
                    toClassName(elementClasses?.button),
                  )}
                />
              )
            })}
          </div>
        ) : null}
      </div>
    </Section>
  )
}
