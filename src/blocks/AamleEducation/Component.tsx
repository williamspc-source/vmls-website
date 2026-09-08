import { hasRichText, type RichTextValue } from '@/utilities/lexicalText'
import { InlineRichText } from '@/components/RichText/Inline'
import React from 'react'

import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

import type {
  AamleEducationBlock as GeneratedProps,
  Media as MediaType,
} from '@/payload-types'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'
import { Icon } from '@/components/Icon'
import { Media } from '@/components/Media'
import { Section, type SectionBackground } from '@/components/Section'
import { cn } from '@/utilities/ui'
import { toClassName } from '@/utilities/cssClass'

// Loosely typed against the generated block interface (regenerated on deploy) so
// the component keeps compiling against either the old or new field shape.
type Props = Omit<GeneratedProps, 'description' | 'image'> & {
  eyebrow?: RichTextValue
  wordmark?: RichTextValue
  subheading?: RichTextValue
  badge?: { icon?: string | null; text?: string | null } | null
  description?: DefaultTypedEditorState | null
  items?: { icon?: string | null; label?: string | null }[] | null
  image?: MediaType | string | number | null
  imagePlaceholder?: boolean | null
  placeholderLabel?: RichTextValue
}

export const AamleEducationBlock: React.FC<Props & { bare?: boolean }> = ({
  background,
  eyebrow,
  wordmark,
  subheading,
  badge,
  description,
  items,
  link,
  image,
  imagePlaceholder,
  placeholderLabel,
  anchorId,
  cssClass,
  containerWidth,
  motion,
  bare,
}) => {
  const list = Array.isArray(items) ? items.filter((it) => it?.label) : []
  const hasImage = Boolean(image && typeof image === 'object')
  const showPlaceholder = !hasImage && Boolean(imagePlaceholder)
  const twoColumn = hasImage || showPlaceholder
  const hasCta = Boolean(link?.label)
  const hasContent = Boolean(
    hasRichText(eyebrow) ||
    hasRichText(wordmark) ||
    hasRichText(subheading) ||
    badge?.text ||
    description ||
    list.length ||
    hasCta,
  )

  if (!hasContent && !twoColumn) return null

  return (
    <Section
      background={background as SectionBackground}
      className={cn('aamle-edu', toClassName(cssClass))}
      containerWidth={containerWidth}
      motion={motion}
      bare={bare}
      id={anchorId || undefined}
    >
      <div className={cn('aamle-inner', !twoColumn && 'aamle-inner--solo')}>
        <div className="aamle-left">
          <InlineRichText as="div" className="section-label aamle-label" data={eyebrow} />
          <InlineRichText as="div" className="aamle-wordmark" data={wordmark} />
          <InlineRichText as="div" className="aamle-wordmark-sub" data={subheading} />

          {badge?.text ? (
            <div className="aamle-cpd-badge">
              {badge.icon ? <Icon name={badge.icon} className="aamle-cpd-badge-icon" /> : null}
              <InlineRichText as="span" data={badge.text} />
            </div>
          ) : null}

          {description ? (
            <RichText
              className="aamle-rich aamle-left-rich"
              data={description}
              enableGutter={false}
              enableProse={false}
            />
          ) : null}

          {list.length > 0 ? (
            <div className="aamle-offerings">
              {list.map((it, i) => (
                <div key={i} className="aamle-offering-row">
                  {it.icon ? (
                    <div className="aamle-offering-icon">
                      <Icon name={it.icon} />
                    </div>
                  ) : null}
                  <InlineRichText as="strong" data={it.label} />
                </div>
              ))}
            </div>
          ) : null}

          {hasCta ? (
            <CMSLink {...link} appearance="inline" className="btn btn-primary aamle-cta" />
          ) : null}
        </div>

        {twoColumn ? (
          <div className="aamle-right">
            {hasImage ? (
              <Media resource={image} fill imgClassName="aamle-img" />
            ) : (
              <div className="aamle-img-placeholder" aria-hidden>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                {hasRichText(placeholderLabel) ? (
                  <InlineRichText as="span" className="aamle-img-label" data={placeholderLabel} />
                ) : null}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </Section>
  )
}
