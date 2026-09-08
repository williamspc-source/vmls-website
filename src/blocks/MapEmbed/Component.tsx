import { hasRichText } from '@/utilities/lexicalText'
import { InlineRichText } from '@/components/RichText/Inline'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import type { MapEmbedBlock as Props, Office } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Icon } from '@/components/Icon'
import { Section } from '@/components/Section'
import { SectionHeader } from '@/components/SectionHeader'
import { cn } from '@/utilities/ui'
import { toClassName } from '@/utilities/cssClass'

// Aspect-ratio presets → CSS. `map` is a tall fixed-height frame.
const RATIOS: Record<string, string> = { '16-9': '16 / 9', '4-3': '4 / 3', '1-1': '1 / 1' }

// Split lines that carry line breaks (e.g. a postal address) into rows.
const lines = (v?: string | null) =>
  (v || '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

// External links in the info panel open in a new tab, like the reference.
const ExtLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <a href={href} rel="noopener noreferrer" target="_blank">
    {children}
  </a>
)

export const MapEmbedBlock: React.FC<Props & { bare?: boolean }> = async (props) => {
  const {
    eyebrow,
    heading,
    subheading,
    textColour,
    kind = 'map',
    office: officeRef,
    embedUrl,
    aspect = '16-9',
    title,
    showOfficeInfo,
    actions,
    cssClass,
    containerWidth,
    motion,
    bare,
  } = props

  const officeHoursHeading =
    (props as { officeHoursHeading?: string | null }).officeHoursHeading || 'Office Hours'
  const transportHeading =
    (props as { transportHeading?: string | null }).transportHeading ||
    'Recommended Public Transport'
  const parkingHeading =
    (props as { parkingHeading?: string | null }).parkingHeading || 'Nearby Car Parks'

  // Resolve the office relationship (populated object at depth>0, else id).
  let office: Office | null = null
  if (kind === 'map' && officeRef) {
    if (typeof officeRef === 'object') {
      office = officeRef
    } else {
      try {
        const payload = await getPayload({ config: configPromise })
        office = await payload.findByID({ collection: 'offices', id: officeRef, depth: 0 })
      } catch {
        office = null
      }
    }
  }

  // Derive the iframe src: explicit embedUrl → office's own embed URL → build a
  // Google Maps embed from the office address.
  let src: string | null = embedUrl?.trim() || null
  if (!src && kind === 'map' && office) {
    src = office.mapEmbedUrl?.trim() || null
    if (!src && office.address) {
      const q = encodeURIComponent(office.address.replace(/\s*\n\s*/g, ', ').trim())
      src = `https://www.google.com/maps?q=${q}&output=embed`
    }
  }

  const hasFrame = Boolean(src)
  const hasPanel = Boolean(kind === 'map' && office && showOfficeInfo !== false)
  const showSplit = hasFrame && hasPanel
  const hasActions = Array.isArray(actions) && actions.length > 0

  if (!hasFrame && !hasPanel && !hasActions && !heading && !eyebrow) return null

  const frameStyle: React.CSSProperties =
    aspect === 'map'
      ? { height: 'clamp(360px, 60vh, 620px)' }
      : { aspectRatio: RATIOS[aspect || '16-9'] || '16 / 9' }

  // The bare iframe. In the split layout it lives inside the reference
  // ".ct-map-wrap" (fixed aspect-ratio); otherwise it keeps the generic frame.
  const iframe = hasFrame ? (
    <iframe
      src={src as string}
      title={title || office?.title || 'Embedded map'}
      loading="lazy"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
    />
  ) : null

  const genericFrame = hasFrame ? (
    <div
      className="vf-map-embed__frame"
      style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--vf-radius-md)', ...frameStyle }}
    >
      <iframe
        src={src as string}
        title={title || office?.title || 'Embedded map'}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
      />
    </div>
  ) : null

  // Quick-action buttons rendered below the map (Get Directions / phone / Email),
  // three across — the reference ".ct-map-actions" row.
  const mapActions = hasActions ? (
    <div className="ct-map-actions">
      {actions!.map(({ link }, i) => {
        if (!link) return null
        return (
          <CMSLink
            key={i}
            {...link}
            appearance="inline"
            className="ct-map-action"
          />
        )
      })}
    </div>
  ) : null

  // The array, not a boolean: hoisting `Array.isArray(...) && length > 0` into a
  // const loses TypeScript's narrowing at the JSX use site below, so `office.parking`
  // read as possibly-null there. Narrowing once, here, answers both questions.
  const parking = Array.isArray(office?.parking) ? office.parking : []
  // The office-wide note. The reference hangs this caveat off the Nearby Car
  // Parks item (contact.html:735) rather than off the panel, because that is what
  // it is about — ours sat at panel level, where the card's 28px flex gap made it
  // read as a detached footer. Kept as ONE element with two possible homes: an
  // office can have a note and no car parks, and the note must not vanish then.
  // This is its only renderer in the repo, so nothing else would catch that.
  const officeNote = <InlineRichText as="p" className="ct-info-item-note" data={office?.note} />

  // Standalone white info card — built entirely from Office fields.
  const infoPanel = hasPanel ? (
    <div className="ct-info-panel">
      {/* Our Office */}
      {office?.title || office?.address ? (
        <div className="ct-info-item">
          <div className="ct-info-item-icon">
            <Icon name="map-pin" />
          </div>
          <div className="ct-info-item-content">
            {office?.title ? <div className="ct-info-item-title">{office.title}</div> : null}
            {lines(office?.address).map((l, i) => (
              <div key={i} className="ct-info-item-line">
                {l}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Office Hours */}
      {Array.isArray(office?.hours) && office.hours.length > 0 ? (
        <div className="ct-info-item">
          <div className="ct-info-item-icon">
            <Icon name="clock" />
          </div>
          <div className="ct-info-item-content">
            <InlineRichText as="div" className="ct-info-item-title" data={officeHoursHeading} />
            {office.hours.map((h, i) => (
              <React.Fragment key={h.id || i}>
                {h.days ? <div className="ct-info-item-line">{h.days}</div> : null}
                {h.time ? <div className="ct-info-item-line">{h.time}</div> : null}
              </React.Fragment>
            ))}
            <InlineRichText as="p" className="ct-info-item-note" data={office.hoursNote} />
          </div>
        </div>
      ) : null}

      {/* Recommended Public Transport */}
      {Array.isArray(office?.transport) && office.transport.length > 0 ? (
        <div className="ct-info-item">
          <div className="ct-info-item-icon">
            <Icon name="bus" />
          </div>
          <div className="ct-info-item-content">
            <InlineRichText as="div" className="ct-info-item-title" data={transportHeading} />
            {office.transport.map((t, i) => (
              <div key={t.id || i} className="ct-info-item-line">
                {t.href ? (
                <ExtLink href={t.href}>
                  <InlineRichText data={t.label} />
                </ExtLink>
              ) : (
                <InlineRichText data={t.label} />
              )}
                {/* A template literal over rich text prints "[object Object]" —
                    no error, just the wrong words. The separator is its own text
                    node instead. */}
                {hasRichText(t.note) ? (
                  <>
                    {' | '}
                    <InlineRichText data={t.note} />
                  </>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Nearby Car Parks */}
      {parking.length > 0 ? (
        <div className="ct-info-item">
          <div className="ct-info-item-icon">
            <Icon name="car" />
          </div>
          <div className="ct-info-item-content">
            <InlineRichText as="div" className="ct-info-item-title" data={parkingHeading} />
            {parking.map((p, i) => (
              <React.Fragment key={p.id || i}>
                <div className="ct-info-item-line" style={i > 0 ? { marginTop: 6 } : undefined}>
                  {p.href ? (
                    <ExtLink href={p.href}>
                      <InlineRichText data={p.name} />
                    </ExtLink>
                  ) : (
                    <InlineRichText data={p.name} />
                  )}
                  {p.address ? ` (${p.address})` : null}
                  {hasRichText(p.walkTime) ? (
                    <>
                      {' | '}
                      <InlineRichText data={p.walkTime} />
                    </>
                  ) : null}
                </div>
                {p.heightLimit ? (
                  <div
                    className="ct-info-item-line"
                    style={{ color: 'var(--text-mid)', fontSize: '0.78rem' }}
                  >
                    <InlineRichText data={p.heightLimit} />
                  </div>
                ) : null}
                <InlineRichText as="p" className="ct-info-item-note" data={p.note} />
              </React.Fragment>
            ))}
            {officeNote}
          </div>
        </div>
      ) : null}

      {parking.length > 0 ? null : officeNote}
    </div>
  ) : null

  return (
    <Section
      className={cn('vf-map-embed', toClassName(cssClass))}
      motion={motion}
      containerWidth={containerWidth}
      bare={bare}
    >
      <SectionHeader eyebrow={eyebrow} title={heading} subtitle={subheading} colour={textColour} />

      {showSplit ? (
        <div className="ct-location-module">
          <div className="ct-map-col">
            <div className="ct-map-wrap">{iframe}</div>
            {mapActions}
          </div>
          {infoPanel}
        </div>
      ) : (
        <>
          {genericFrame}
          {infoPanel}
          {hasActions ? (
            <div
              className="vf-map-embed__actions"
              style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem', marginTop: '2rem' }}
            >
              {actions!.map(({ link }, i) => {
                if (!link) return null
                const outline = link.appearance === 'outline'
                return (
                  <CMSLink
                    key={i}
                    {...link}
                    label={undefined}
                    appearance="inline"
                    className={cn('btn', outline ? 'btn-outline' : 'btn-primary')}
                  >
                    <InlineRichText as="span" data={link.label} />
                  </CMSLink>
                )
              })}
            </div>
          ) : null}
        </>
      )}
    </Section>
  )
}
