import { InlineRichText } from '@/components/RichText/Inline'
import { hasRichText } from '@/utilities/lexicalText'
import React from 'react'

import type { WhyVerifyBlock as Props } from '@/payload-types'

import { Media } from '@/components/Media'
import { Section } from '@/components/Section'
import { SectionHeader } from '@/components/SectionHeader'
import { cn } from '@/utilities/ui'
import { toClassName } from '@/utilities/cssClass'

import { WhyVerifyClient } from './WhyVerifyClient'

export const WhyVerifyBlock: React.FC<Props & { bare?: boolean }> = ({
  eyebrow,
  heading,
  subheading,
  textColour,
  items,
  image,
  placeholderLabel,
  anchorId,
  containerWidth,
  motion,
  cssClass,
  bare,
}) => {
  const hasItems = Array.isArray(items) && items.length > 0
  const hasHeader = hasRichText(eyebrow) || hasRichText(heading) || hasRichText(subheading)
  if (!hasItems && !hasHeader) return null

  const hasImage = image && typeof image === 'object'

  return (
    <Section
      id={anchorId || undefined}
      // `why-verify--light` scopes the light band styling so it never collides
      // with the dark `.why-verify` band already present in globals.css.
      className={cn('why-verify why-verify--light', toClassName(cssClass))}
      containerWidth={containerWidth}
      motion={motion}
      bare={bare}
    >
      <SectionHeader
        className="why-header"
        eyebrow={eyebrow}
        title={heading}
        subtitle={subheading}
        colour={textColour}
        align="center"
      />

      <div className="why-panel">
        <div className="why-content">
          {hasItems ? <WhyVerifyClient items={items!} /> : null}
        </div>

        <div className="why-visual">
          <div className="who-image-block why-image-block">
            {hasImage ? (
              <Media
                resource={image}
                className="who-image-main why-image-main"
                fill
                pictureClassName="absolute inset-0"
                imgClassName="object-cover"
              />
            ) : (
              <div className="who-image-main why-image-main">
                {hasRichText(placeholderLabel) ? (
                  <InlineRichText data={placeholderLabel} />
                ) : (
                  '[ Company Image Placeholder ]'
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Section>
  )
}
