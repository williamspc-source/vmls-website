import { type RichTextValue } from '@/utilities/lexicalText'
import { InlineRichText } from '@/components/RichText/Inline'
import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload, type Where } from 'payload'
import React from 'react'

import type { ServicesGridBlock as Props, Service } from '@/payload-types'

import { Icon } from '@/components/Icon'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { Section, type SectionBackground } from '@/components/Section'
import { SectionHeader } from '@/components/SectionHeader'
import { cn } from '@/utilities/ui'
import { toClassName } from '@/utilities/cssClass'
import { ServicesAccordionItem } from './ServicesAccordionClient'

type CardData = {
  id: string
  icon?: string | null
  title: string
  description?: RichTextValue
  href?: string | null
}

const Card: React.FC<CardData & { className?: string; enquire?: boolean }> = ({
  icon,
  title,
  description,
  href,
  className,
  enquire,
}) => {
  const inner = (
    <>
      {icon ? (
        <div className="service-icon vf-card__icon">
          <Icon name={icon} />
        </div>
      ) : null}
      <h3 className="service-title vf-card__title">{title}</h3>
      <InlineRichText as="p" className="service-desc" data={description} />
      {enquire ? (
        <button type="button" className="service-enquire" data-enquiry-panel>
          Enquire →
        </button>
      ) : null}
    </>
  )
  // A card with an enquiry action can't itself be a link (button-in-anchor is
  // invalid), so the Enquire link takes precedence over card linking.
  return href && !enquire ? (
    <Link href={href} className={cn('service-card vf-card', className)}>
      {inner}
    </Link>
  ) : (
    <div className={cn('service-card vf-card', className)}>{inner}</div>
  )
}

export const ServicesGridBlock: React.FC<Props & { bare?: boolean }> = async (props) => {
  const {
    eyebrow,
    heading,
    subheading,
    textColour,
    anchorId,
    background,
    source = 'auto',
    category,
    serviceGroup,
    layout,
    services,
    columns,
    limit,
    linkToService,
    showEnquire,
    hideDescription,
    cardAlign,
    footerLinks,
    servicePathPrefix,
    cssClass,
    elementClasses,
    motion,
    containerWidth,
    hoverEffect,
    shadow,
    bare,
  } = props

  const cols = Number(columns) || 3
  const prefix = (servicePathPrefix || '/services').replace(/\/$/, '')
  // Prefer an explicit per-service link override; otherwise fall back to the
  // auto-generated service page path (only when linking is enabled).
  const hrefFor = (s: Service): string | null => {
    if (s.linkOverride) return s.linkOverride
    return linkToService && s.slug ? `${prefix}/${s.slug}` : null
  }

  const isAccordion = layout === 'accordion'

  // Collect the full service docs so the accordion can reach photo + body.
  let items: Service[] = []
  if (source === 'manual') {
    items = (services || []).filter((s): s is Service => typeof s === 'object')
  } else {
    const payload = await getPayload({ config: configPromise })
    const where: Where = {}
    if (category) where.category = { equals: category }
    if (serviceGroup) where.serviceGroup = { equals: serviceGroup }
    const res = await payload.find({
      collection: 'services',
      // Accordion rows render each service's photo, which needs depth 1.
      depth: isAccordion ? 1 : 0,
      limit: limit || 12,
      sort: 'order',
      ...(Object.keys(where).length ? { where } : {}),
    })
    items = res.docs
  }

  if (items.length === 0) return null

  const header = (
    <SectionHeader
      eyebrow={eyebrow}
      title={heading}
      subtitle={subheading}
      colour={textColour}
      align="center"
      titleClassName={toClassName(elementClasses?.heading)}
    />
  )

  if (isAccordion) {
    const rows = items.map((s) => {
      const photo = s.photo && typeof s.photo === 'object' ? s.photo : null
      // Always-visible 16:9 tile above the trigger (mirrors the reference
      // `.as-accordion-img`): a real photo when one is uploaded, otherwise the
      // blue-gradient placeholder with the service icon + "Image Placeholder".
      const media = photo ? (
        <div className="as-accordion-img as-accordion-img--photo">
          <Media resource={photo} htmlElement={null} fill imgClassName="as-accordion-img__img" />
        </div>
      ) : (
        <div className="as-accordion-img">
          {s.icon ? <Icon name={s.icon} /> : null}
          <span className="as-accordion-img-label">Image Placeholder</span>
        </div>
      )
      const body = s.body ? (
        <RichText
          data={s.body}
          enableGutter={false}
          enableProse={false}
          className="as-accordion-richtext"
        />
      ) : null
      return (
        <ServicesAccordionItem
          key={s.id}
          title={s.title}
          media={media}
          body={body}
          anchorId={s.slug ?? undefined}
        />
      )
    })

    // Two balanced columns, matching the reference's `.as-accordion-grid`.
    const mid = Math.ceil(rows.length / 2)
    const left = rows.slice(0, mid)
    const right = rows.slice(mid)

    return (
      <Section
        id={anchorId || undefined}
        background={background as SectionBackground}
        className={cn('vf-services-grid vf-services-accordion', toClassName(cssClass))}
        motion={motion}
        containerWidth={containerWidth}
        hoverEffect={hoverEffect}
        shadow={shadow}
        bare={bare}
      >
        {header}
        <div className="as-accordion-grid">
          <div className="as-accordion-col">{left}</div>
          {right.length > 0 ? <div className="as-accordion-col">{right}</div> : null}
        </div>
      </Section>
    )
  }

  return (
    <Section
      id={anchorId || undefined}
      background={background as SectionBackground}
      className={cn('vf-services-grid', toClassName(cssClass))}
      motion={motion}
      containerWidth={containerWidth}
      hoverEffect={hoverEffect}
      shadow={shadow}
      bare={bare}
    >
      {header}
      <div
        className={cn('services-grid', cardAlign === 'center' && 'vf-cards--center')}
        style={{ '--vf-cols': cols } as React.CSSProperties}
      >
        {items.map((s) => (
          <Card
            key={s.id}
            id={String(s.id)}
            icon={s.icon}
            title={s.title}
            description={hideDescription ? null : (s.shortDescription as RichTextValue)}
            href={hrefFor(s)}
            enquire={Boolean(showEnquire)}
            className={toClassName(elementClasses?.card)}
          />
        ))}
      </div>
      {Array.isArray(footerLinks) && footerLinks.length > 0 ? (
        <div className="services-grid-actions">
          {footerLinks.map((f, i) =>
            f?.link ? (
              <CMSLink
                key={i}
                {...f.link}
                appearance="inline"
                className={i === 0 ? 'btn btn-primary' : 'btn btn-outline'}
              />
            ) : null,
          )}
        </div>
      ) : null}
    </Section>
  )
}
