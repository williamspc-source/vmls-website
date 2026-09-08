import { hasRichText } from '@/utilities/lexicalText'
import { InlineRichText } from '@/components/RichText/Inline'
import React from 'react'

import type { LeadershipSpotlightBlock as Props } from '@/payload-types'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'
import { Icon } from '@/components/Icon'
import { Media } from '@/components/Media'
import { Section, type SectionBackground } from '@/components/Section'
import { cn } from '@/utilities/ui'
import { toClassName } from '@/utilities/cssClass'

export const LeadershipSpotlightBlock: React.FC<Props & { bare?: boolean }> = ({
  eyebrow,
  heading,
  subheading,
  textColour,
  background,
  photo,
  placeholderIcon,
  name,
  role,
  badge,
  tagline,
  body,
  credentials,
  link,
  cssClass,
  elementClasses,
  motion,
  containerWidth,
  anchorId,
  bare,
}) => {
  const creds = Array.isArray(credentials) ? credentials.filter((c) => c?.cred) : []
  const hasPhoto = Boolean(photo && typeof photo === 'object')
  const hasBadge = Boolean(name || role || badge)
  const hasLink = Boolean(link && link.label)
  const hasContent =
    hasRichText(eyebrow) ||
    hasRichText(heading) ||
    hasRichText(subheading) ||
    tagline ||
    body ||
    creds.length > 0 ||
    hasLink ||
    hasBadge

  if (!hasContent && !hasPhoto) return null

  return (
    <Section
      id={anchorId || undefined}
      background={(background as SectionBackground) || 'muted'}
      className={cn('leadership', toClassName(cssClass))}
      motion={motion}
      containerWidth={containerWidth}
      bare={bare}
    >
      <div className="leadership-grid">
        <div className="leadership-image-wrap">
          {hasPhoto ? (
            <div className="leader-img-main leader-img-photo">
              <Media resource={photo} htmlElement={null} fill imgClassName="leadership-photo-img" />
            </div>
          ) : (
            <div className="img-placeholder leader-img-main">
              <Icon name={placeholderIcon || 'user-circle'} className="img-placeholder-icon" />
              {name ? `${name} Photo` : 'Founder Photo Placeholder'}
            </div>
          )}

          {hasBadge ? (
            <div className="leader-badge">
              <InlineRichText as="em" className="leader-badge-tag" data={badge} />
              <InlineRichText data={name} />
              <InlineRichText as="span" data={role} />
            </div>
          ) : null}
        </div>

        <div className="leadership-content">
          <InlineRichText as="div" className="section-label" data={eyebrow} colour={textColour} />
          <InlineRichText
            as="h2"
            className={cn('section-title', toClassName(elementClasses?.heading))}
            data={heading} colour={textColour} />
          <InlineRichText as="p" className="leadership-subheading" data={subheading} colour={textColour} />
          <InlineRichText as="div" className="leadership-tagline" data={tagline} />
          {body ? <RichText data={body} enableGutter={false} enableProse={false} /> : null}
          {creds.length > 0 ? (
            <div className="leader-credentials">
              {creds.map((c, i) => (
                <span key={i} className="leader-cred">
                  <InlineRichText data={c.cred} />
                </span>
              ))}
            </div>
          ) : null}
          {hasLink ? (
            <CMSLink
              {...link}
              appearance="inline"
              className={cn('btn btn-primary', toClassName(elementClasses?.button))}
            />
          ) : null}
        </div>
      </div>
    </Section>
  )
}
