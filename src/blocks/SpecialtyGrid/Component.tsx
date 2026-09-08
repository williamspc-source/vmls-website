import { hasRichText, type RichTextValue } from '@/utilities/lexicalText'
import { InlineRichText } from '@/components/RichText/Inline'
import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import type { CollectionSlug } from 'payload'
import type { SpecialtyGridBlock as Props } from '@/payload-types'

import { Icon } from '@/components/Icon'
import { Section, type SectionBackground } from '@/components/Section'
import { SectionHeader } from '@/components/SectionHeader'
import { cn } from '@/utilities/ui'
import { toClassName } from '@/utilities/cssClass'

type TileData = {
  id: string
  icon?: string | null
  label: RichTextValue
  href?: string | null
  className?: string
}

const Tile: React.FC<TileData & { ctaLabel?: RichTextValue }> = ({
  icon,
  label,
  href,
  className,
  ctaLabel,
}) => {
  const inner = (
    <>
      <div className="specialty-card-icon vf-card__icon">
        <Icon name={icon} className="size-6" />
      </div>
      <InlineRichText as="span" className="specialty-card-name vf-card__title" data={label} />
      {href ? (
        <span className="specialty-card-link">
          {hasRichText(ctaLabel) ? <InlineRichText data={ctaLabel} /> : 'View experts →'}
        </span>
      ) : null}
    </>
  )
  return href ? (
    <Link href={href} className={cn('specialty-card vf-card', className)}>
      {inner}
    </Link>
  ) : (
    <div className={cn('specialty-card vf-card', className)}>{inner}</div>
  )
}

export const SpecialtyGridBlock: React.FC<Props & { bare?: boolean }> = async (props) => {
  const {
    eyebrow,
    heading,
    subheading,
    textColour,
    background,
    source = 'auto',
    taxonomy,
    variant,
    defaultIcon,
    linkToDirectory,
    directoryPath,
    items,
    columns,
    cssClass,
    elementClasses,
    motion,
    containerWidth,
    hoverEffect,
    shadow,
    bare,
  } = props

  // Newer config field — read defensively so a not-yet-regenerated
  // `payload-types` doesn't fail typecheck.
  const { ctaLabel } = props as Props & { ctaLabel?: RichTextValue }

  let tiles: TileData[] = []
  if (source === 'manual') {
    tiles = (items || []).map((item, i) => ({
      id: `m-${i}`,
      icon: item.icon,
      label: item.label,
      href: item.link?.url ?? null,
    }))
  } else {
    const collection = (taxonomy || 'specialties') as CollectionSlug
    const payload = await getPayload({ config: configPromise })
    // claim-types & specialties carry an explicit display `order`; other
    // taxonomies fall back to alphabetical.
    const sort = collection === 'claim-types' || collection === 'specialties' ? 'order' : 'title'
    // `collection` is a variable, so no static check can tell whether it targets
    // a draft-enabled collection. These taxonomies have no drafts today, but the
    // select above could gain one — state the public-read intent explicitly.
    const res = await payload.find({ collection, limit: 100, sort, overrideAccess: false })
    tiles = res.docs.map((s: { id: string | number; title?: string | null; slug?: string | null; icon?: string | null }) => ({
      id: String(s.id),
      icon: s.icon || defaultIcon || 'stethoscope',
      label: s.title ?? '',
      href:
        linkToDirectory && s.slug && collection === 'specialties'
          ? `${directoryPath || '/specialists/specialist-panel'}?specialty=${s.slug}`
          : null,
    }))
  }

  if (tiles.length === 0) return null

  const isChecklist = variant === 'checklist'

  return (
    <Section
      background={background as SectionBackground}
      className={cn('vf-specialty-grid', toClassName(cssClass))}
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
      {isChecklist ? (
        <ul className="claims-list vf-checklist">
          {tiles.map((t) => (
            <li key={t.id}>
              <span className="claim-arrow" aria-hidden>
                {/* The reference draws this as a stroked SVG rather than a "→"
                    glyph (index.html:343): the glyph's weight and baseline vary
                    by font, and it sat uncoloured and top-aligned here. */}
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
              <InlineRichText as="span" className="claim-name" data={t.label} />
            </li>
          ))}
        </ul>
      ) : (
        // `columns` was declared and never read; the grid used a fixed track.
        <div
          className="specialty-grid"
          style={{ '--vf-cols': Number(columns) || 4 } as React.CSSProperties}
        >
          {tiles.map((t) => (
            <Tile key={t.id} {...t} ctaLabel={ctaLabel} className={toClassName(elementClasses?.card)} />
          ))}
        </div>
      )}
    </Section>
  )
}
