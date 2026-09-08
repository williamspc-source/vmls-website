import { InlineRichText } from '@/components/RichText/Inline'
import { type RichTextValue } from '@/utilities/lexicalText'
import Link from 'next/link'
import React from 'react'

import { cn } from '@/utilities/ui'
import { focalImgStyle } from '@/utilities/focalPoint'

export type PersonCardData = {
  name: string
  position?: RichTextValue
  location?: string | null
  badge?: string | null
  photoUrl?: string | null
  /** CSS object-position from the Media focal point (e.g. "50% 30%"). */
  photoFocus?: string | null
  /** Zoom (percent) from the Media doc; >100 scales into the focal point. */
  photoZoom?: number | null
  href?: string | null
  /** Qualification pills shown on the expert (marquee) card. */
  tags?: string[] | null
  /**
   * Card treatment. `'default'` is the centred spec-card (circular monogram
   * avatar) used by the specialist panel. `'rect'` is the team-card treatment:
   * a full-bleed rectangular headshot filling the top of the card with the
   * name/role beneath (design reference `about/meet-the-team.html`).
   */
  variant?: 'default' | 'rect' | null
  className?: string
}

export const initialsOf = (name: string) =>
  name
    .replace(/^(Dr|Adj\.?|Adjunct|Professor|Prof\.?|A\/Prof|Mr|Mrs|Ms|Associate)\.?\s+/gi, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('')

// Faithful port of the design `.team-card` used on the "Meet the Team" page:
// a full-bleed rectangular headshot fills the top of the card (gradient +
// monogram fallback behind, so it shows when there is no photo), then the
// name, role and profile link beneath. Namespaced `.vf-team-card*`.
export const TeamCard: React.FC<PersonCardData> = ({
  name,
  position,
  photoUrl,
  photoFocus,
  photoZoom,
  href,
  className,
}) => {
  const inner = (
    <>
      <div className="vf-team-card__photo">
        <div className="avatar-mono vf-team-card__mono" aria-hidden>
          {initialsOf(name)}
        </div>
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="vf-team-card__image"
            src={photoUrl}
            alt={name}
            loading="lazy"
            style={focalImgStyle(photoFocus, photoZoom)}
          />
        ) : null}
      </div>
      <div className="vf-team-card__body">
        <div className="vf-team-card__name vf-card__title">{name}</div>
        <InlineRichText as="div" className="vf-team-card__role" data={position} />
        {href ? <span className="vf-team-card__link">View profile →</span> : null}
      </div>
    </>
  )

  if (href) {
    return (
      <Link href={href} className={cn('vf-team-card vf-card', className)}>
        {inner}
      </Link>
    )
  }
  return <div className={cn('vf-team-card vf-card', className)}>{inner}</div>
}

// Uses the ported design `.spec-card` treatment (accent bar, monogram avatar,
// hover lift + arrow). When `variant === 'rect'` it delegates to the
// rectangular `TeamCard` treatment (used for team members).
export const PersonCard: React.FC<PersonCardData> = ({
  name,
  position,
  location,
  photoUrl,
  photoFocus,
  photoZoom,
  href,
  variant,
  className,
}) => {
  if (variant === 'rect') {
    return (
      <TeamCard
        name={name}
        position={position}
        photoUrl={photoUrl}
        photoFocus={photoFocus}
        photoZoom={photoZoom}
        href={href}
        className={className}
      />
    )
  }

  const inner = (
    <>
      <div
        className="vf-person-card__avatar"
        style={{
            width: 'var(--vf-avatar-size, 104px)',
            height: 'var(--vf-avatar-size, 104px)',
            borderRadius: 'var(--vf-radius-circle)',
            overflow: 'hidden',
            marginBottom: 18,
          }}
      >
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={name}
            style={focalImgStyle(photoFocus, photoZoom, { width: '100%', height: '100%' })}
          />
        ) : (
          <div className="avatar-mono">{initialsOf(name)}</div>
        )}
      </div>
      <div className="spec-name vf-card__title">{name}</div>
      <InlineRichText as="div" className="spec-title" data={position} />
      {location ? <div className="spec-loc">{location}</div> : null}
      {href ? <span className="spec-more">View profile →</span> : null}
    </>
  )

  if (href) {
    return (
      <Link href={href} className={cn('spec-card vf-card', className)}>
        {inner}
      </Link>
    )
  }
  return <div className={cn('spec-card vf-card', className)}>{inner}</div>
}

// Faithful port of the design `.expert-card` used in the specialists marquee:
// gradient avatar header (full photo when available, monogram fallback),
// specialty badge, role, and qualification tag pills.
export const ExpertCard: React.FC<
  PersonCardData & { ariaHidden?: boolean; tabIndex?: number }
> = ({
  name,
  position,
  badge,
  photoUrl,
  photoFocus,
  photoZoom,
  href,
  tags,
  className,
  ariaHidden,
  tabIndex,
}) => {
  const inner = (
    <>
      <div className="expert-avatar vf-person-card__avatar">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={name}
            style={focalImgStyle(photoFocus, photoZoom, { width: '100%', height: '100%' })}
          />
        ) : (
          <span aria-hidden>{initialsOf(name)}</span>
        )}
        {badge ? <div className="expert-specialty-badge">{badge}</div> : null}
      </div>
      <div className="expert-info">
        <div className="expert-name vf-card__title">{name}</div>
        <InlineRichText as="div" className="expert-role" data={position} />
        {tags && tags.length > 0 ? (
          <div className="expert-tags">
            {tags.map((t, i) => (
              <span key={i} className="expert-tag">
                {t}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </>
  )

  const shared = { 'aria-hidden': ariaHidden || undefined, tabIndex }
  if (href) {
    return (
      <Link href={href} className={cn('expert-card vf-card', className)} {...shared}>
        {inner}
      </Link>
    )
  }
  return (
    <div className={cn('expert-card vf-card', className)} {...shared}>
      {inner}
    </div>
  )
}
