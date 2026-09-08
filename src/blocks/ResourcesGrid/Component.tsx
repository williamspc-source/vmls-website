import { type RichTextValue } from '@/utilities/lexicalText'
import { InlineRichText } from '@/components/RichText/Inline'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import type { ResourcesGridBlock as Props, Resource } from '@/payload-types'

import { Icon } from '@/components/Icon'
import { Section, type SectionBackground } from '@/components/Section'
import { SectionHeader } from '@/components/SectionHeader'
import { cn } from '@/utilities/ui'
import { toClassName } from '@/utilities/cssClass'
import { resourcesSelected, resourcesWhere } from './query'

type CardData = {
  id: string
  icon?: string | null
  title: string
  description?: RichTextValue
  href?: string | null
  ctaLabel: RichTextValue
  download: boolean
  resourceType?: string | null
  audience?: string | null
}

const TYPE_LABELS: Record<string, string> = {
  checklist: 'Checklist',
  guide: 'Guide',
  template: 'Template',
  'fact-sheet': 'Fact sheet',
}
const AUDIENCE_LABELS: Record<string, string> = {
  clients: 'Clients',
  claimants: 'Claimants',
  all: 'Everyone',
}
// "Checklist — Clients" kicker for the .ni-resource-card header panel.
const kicker = (c: CardData): string =>
  [c.resourceType ? TYPE_LABELS[c.resourceType] || c.resourceType : null, c.audience ? AUDIENCE_LABELS[c.audience] || c.audience : null]
    .filter(Boolean)
    .join(' — ')

// Resolve a resource's target: uploaded file (download) takes priority over an
// external URL. Relationships are objects at depth > 0; guard for numbers/nulls.
const cardFromResource = (r: Resource): CardData => {
  const file = r.file
  let href: string | null = null
  let download = false
  if (file && typeof file === 'object' && file.url) {
    href = file.url
    download = true
  } else if (r.externalUrl) {
    href = r.externalUrl
  }
  return {
    id: String(r.id),
    icon: r.icon,
    title: r.title,
    description: r.description,
    href,
    ctaLabel: r.ctaLabel || 'Download',
    download,
    resourceType: r.resourceType,
    audience: r.audience,
  }
}

// Link attributes for a resource CTA: real file → download; external (http)
// URL → new tab; internal (/…) article/page link → same tab.
const linkAttrs = (href: string, download?: boolean): React.AnchorHTMLAttributes<HTMLAnchorElement> =>
  download
    ? { download: '' }
    : /^https?:/i.test(href)
      ? { target: '_blank', rel: 'noopener noreferrer' }
      : {}

// Design-reference In-the-Loop resource card: coloured header panel (icon +
// type/audience kicker + title) over a white body (description + link).
const NiResourceCard: React.FC<CardData> = (c) => (
  <div className="ni-resource-card">
    <div className="ni-resource-card-top">
      {c.icon ? (
        <div className="ni-resource-icon">
          <Icon name={c.icon} />
        </div>
      ) : null}
      {kicker(c) ? <div className="ni-resource-type">{kicker(c)}</div> : null}
      <div className="ni-resource-title">{c.title}</div>
    </div>
    <div className="ni-resource-body">
      <InlineRichText as="p" className="ni-resource-desc" data={c.description} />
      {c.href ? (
        <a className="ni-resource-link" href={c.href} {...linkAttrs(c.href, c.download)}>
          <InlineRichText data={c.ctaLabel} /> →
        </a>
      ) : null}
    </div>
  </div>
)

const Card: React.FC<CardData> = ({ icon, title, description, href, ctaLabel, download }) => (
  <div className="service-card vf-card vf-resource-card">
    {icon ? (
      <div className="service-icon vf-card__icon">
        <Icon name={icon} />
      </div>
    ) : null}
    <h3 className="service-title vf-card__title">{title}</h3>
    <InlineRichText as="p" className="service-desc" data={description} />
    {href ? (
      <div className="vf-resource-card__cta">
        <a className="btn btn-outline vf-resource-card__btn" href={href} {...linkAttrs(href, download)}>
          <Icon name={download ? 'download-simple' : 'arrow-right'} />
          <InlineRichText data={ctaLabel} />
        </a>
      </div>
    ) : null}
  </div>
)

export const ResourcesGridBlock: React.FC<Props & { bare?: boolean }> = async (props) => {
  const {
    eyebrow,
    heading,
    subheading,
    textColour,
    background,
    source = 'auto',
    audience,
    resourceType,
    columns,
    limit,
    cssClass,
    motion,
    containerWidth,
    hoverEffect,
    shadow,
    bare,
  } = props
  const anchorId = (props as { anchorId?: string | null }).anchorId || undefined
  const variant = (props as { variant?: string | null }).variant || 'card'
  const hideWhenEmpty = (props as { hideWhenEmpty?: boolean | null }).hideWhenEmpty

  const cols = Number(columns) || 3

  let cards: CardData[] = []
  if (source === 'manual') {
    cards = resourcesSelected(props).map(cardFromResource)
  } else {
    const payload = await getPayload({ config: configPromise })
    // Same filter the Section Nav counts against (./query.ts).
    const where = resourcesWhere({ audience, resourceType })
    const res = await payload.find({
      collection: 'resources',
      depth: 1,
      limit: limit || 12,
      sort: 'order',
      ...(Object.keys(where).length ? { where } : {}),
    })
    cards = res.docs.map(cardFromResource)
  }

  // Nothing to list, and the editor has asked for the section to stand down.
  // Replaces a bare `<div id>` fallback that kept /in-the-loop's `#resources`
  // nav item from pointing at a missing id — the nav now drops that tab itself,
  // deciding it through the same query.
  if (cards.length === 0 && hideWhenEmpty) return null

  return (
    <Section
      id={anchorId}
      background={background as SectionBackground}
      className={cn('vf-resources-grid', toClassName(cssClass))}
      motion={motion}
      containerWidth={containerWidth}
      hoverEffect={hoverEffect}
      shadow={shadow}
      bare={bare}
    >
      <SectionHeader eyebrow={eyebrow} title={heading} subtitle={subheading} align="center" colour={textColour} />
      {variant === 'ni-resource' ? (
        <div className={`ni-grid-${cols}`}>
          {cards.map((c) => (
            <NiResourceCard key={c.id} {...c} />
          ))}
        </div>
      ) : (
        <div className="services-grid" style={{ '--vf-cols': cols } as React.CSSProperties}>
          {cards.map((c) => (
            <Card key={c.id} {...c} />
          ))}
        </div>
      )}
    </Section>
  )
}
