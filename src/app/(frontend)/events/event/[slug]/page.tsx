import { hasRichText, richTextToPlain } from '@/utilities/lexicalText'
import { InlineRichText } from '@/components/RichText/Inline'
import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'

import RichText from '@/components/RichText'
import { Icon } from '@/components/Icon'
import { Media } from '@/components/Media'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { generateMeta } from '@/utilities/generateMeta'
import { PersonCard, type PersonCardData } from '@/components/PersonCard'
import { mediaFocal } from '@/utilities/focalPoint'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { cn } from '@/utilities/ui'
import { EVENTS_INDEX_PATH, eventPath, specialistPath, teamPath } from '@/utilities/routes'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { eventCrumbs, getCrumbSettings } from '@/utilities/breadcrumbs'
import { eventTiming } from '@/utilities/eventTiming'
import { headingIdAt, headingLabel, type TextishNode } from '@/utilities/headingId'

import type { Event, EventsSetting } from '@/payload-types'
import { eventTypeLabel } from '@/utilities/eventTypeLabels'

type Args = { params: Promise<{ slug?: string }> }

// Generic event-page UI labels, from the Events Settings global's `labels` group.
type EventLabels = NonNullable<EventsSetting['labels']>


const formatDate = (value?: string | null): string => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
}

const isRichTextEmpty = (data: unknown): boolean => {
  const children = (data as { root?: { children?: unknown[] } } | null)?.root?.children
  return !Array.isArray(children) || children.length === 0
}

// Contents list for the recap body, built from its top-level h2s.
//
// The ids come from `headingIdAt` over the same sibling array the rich-text
// heading converter walks, so a contents link and the heading it points at cannot
// disagree — one function called twice, not two copies of one. Mapping over the
// full children array rather than filtering first is what preserves the index it
// needs to disambiguate two headings with identical words.
const tocFromRichText = (data: unknown): { id: string; text: string }[] => {
  const children = ((data as { root?: { children?: TextishNode[] } } | null)?.root?.children ??
    []) as TextishNode[]
  return children
    .map((n, i) =>
      n.type === 'heading' && n.tag === 'h2'
        ? { id: headingIdAt(children, i), text: headingLabel(n) }
        : null,
    )
    .filter((i): i is { id: string; text: string } => Boolean(i?.id && i.text))
}

// Time-based safety net: a stale event page self-heals even if an on-demand
// revalidation hook is missed. 15 minutes rather than an hour because the page
// now decides, server-side, whether registrations are still open — so this is the
// window in which a closed event can still show "Register Your Interest".
// Regeneration is lazy, so pages nobody visits cost nothing.
export const revalidate = 900

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const res = await payload.find({
    collection: 'events',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
  })
  return res.docs.map(({ slug }) => ({ slug: slug ?? '' }))
}

export default async function EventDetailPage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const event = await queryEventBySlug({ slug: decodedSlug })

  if (!event) return <PayloadRedirects url={`/events/event/${decodedSlug}`} />

  const settings = (await getCachedGlobal('events-settings', 0)()) as EventsSetting | null
  const hostKey = event.host === 'verify' ? 'verify' : 'aamle'
  const host = (settings?.[hostKey] ?? {}) as NonNullable<EventsSetting['aamle']>
  const labels: EventLabels = settings?.labels ?? {}

  // `isPast` (badge, recap heading) and `registrationOpen` (the CTA) are separate
  // questions and are allowed to disagree — an event can be under way, or have
  // finished this morning, and still be taking expressions of interest. See
  // src/utilities/eventTiming.ts. Both are resolved server-side; `revalidate`
  // above bounds how stale they can get.
  const { isPast, registrationOpen } = eventTiming(event)

  const typeLabel = eventTypeLabel(event.eventType) || 'Event'
  const crumbSettings = await getCrumbSettings()
  const crumbs = eventCrumbs(event, {
    home: crumbSettings.homeLabel,
    section: labels.breadcrumbSectionLabel,
  })
  // `richTextToPlain` on the two converted fields before joining. `timeLabel`
  // and `location` are inlineRichTextFields, and the old `.filter((p): p is
  // string => Boolean(p))` was a LYING type predicate: an empty rich text is a
  // truthy object, so it passed the filter, satisfied TypeScript, and printed
  // "12 September 2024 · [object Object]" in the hero of every event. Invariant 46.
  const metaParts = [
    formatDate(event.date),
    richTextToPlain(event.timeLabel),
    richTextToPlain(event.location),
  ].filter((p): p is string => Boolean(p))

  const hasDescription = !isRichTextEmpty(event.description)
  const hasRecap = !isRichTextEmpty(event.recap)
  const hasBlurb = !isRichTextEmpty(host.blurb)
  const hasCallout = !isRichTextEmpty(host.callout)

  // The event's own image turns the flat hero into the same full-bleed treatment
  // an article gets. Reused rather than reimplemented: `.art-hero*` already does
  // exactly this, scrim and all, and duplicating it would give us two copies to
  // keep in step. Falls back to the plain hero when no image has been uploaded.
  const heroImage =
    event.image && typeof event.image === 'object' ? (event.image as NonNullable<Event['image']>) : null

  // ── Actions ───────────────────────────────────────────────
  // Once registrations close the primary button becomes "Contact Us", and it must
  // stop pointing at the external booking page — that link sent people to a form
  // they could no longer use. The per-event registration label is likewise only
  // meaningful while registration is open ("Register on AAMLE" is wrong once it
  // isn't).
  // One label, two buttons, three sources — and each source is rich text now, so
  // the `||` chain has to ask `hasRichText` rather than lean on truthiness: an
  // untouched rich-text field is a truthy object and would win over both
  // fallbacks, rendering a button with no words in it.
  const registerLabel = hasRichText(event.registrationLabel) ? (
    <InlineRichText data={event.registrationLabel} />
  ) : hasRichText(host.registerLabel) ? (
    <InlineRichText data={host.registerLabel} />
  ) : (
    'Register Your Interest'
  )

  const registerHref = event.registrationUrl?.trim() || ''
  const contactHref = labels.contactUrl?.trim() || '/contact'
  const primaryCta = registrationOpen ? (
    registerHref ? (
      <a className="btn btn-primary" href={registerHref} target="_blank" rel="noopener noreferrer">
        {registerLabel}
      </a>
    ) : (
      <button type="button" data-enquiry-panel className="btn btn-primary">
        {registerLabel}
      </button>
    )
  ) : (
    <a className="btn btn-primary" href={contactHref}>
      {host.contactLabel || 'Contact Us'}
    </a>
  )

  const hostEventUrl = event.hostEventUrl?.trim() || ''

  const attendHeading = isPast
    ? host.recapHeading || 'Event Recap'
    : host.attendHeading || 'How to Attend'

  const toc = event.showToc === false ? [] : tocFromRichText(event.recap)

  const gallery = (event.gallery ?? []).filter((g) => g?.image && typeof g.image === 'object')
  const attachments = (event.attachments ?? []).filter(
    (a) => a?.file && typeof a.file === 'object',
  )
  const hasMaterials = gallery.length > 0 || attachments.length > 0

  // Presenters: linked cards for panel/team members, plain cards for outside
  // speakers. Both were previously unrenderable — `presenters` had no consumer
  // at all, and there was no field for a guest.
  const presentersHeading = labels.presentersHeading || 'Presenters'
  const presenterCards: PersonCardData[] = [
    ...(Array.isArray(event.presenters) ? event.presenters : []).flatMap((rel) => {
      if (!rel || typeof rel !== 'object' || typeof rel.value !== 'object') return []
      const person = rel.value as { title?: string | null; slug?: string | null; position?: string | null; role?: string | null; photo?: unknown }
      const photo = mediaFocal(person.photo, 104) // circle avatar, --vf-avatar-size 104px
      return [
        {
          name: person.title ?? '',
          position: person.position ?? person.role ?? null,
          photoUrl: photo.url,
          photoFocus: photo.focus,
          photoZoom: photo.zoom,
          href:
            rel.relationTo === 'specialists'
              ? specialistPath(person.slug)
              : teamPath(person.slug),
        },
      ]
    }),
    ...(Array.isArray(event.guestPresenters) ? event.guestPresenters : []).map((g) => ({
      name: g?.name ?? '',
      position: [g?.role, g?.organisation].filter(Boolean).join(', ') || null,
      href: null,
    })),
  ].filter((c) => c.name)

  const heroInner = (
    <>
      {/* The trail replaces the type kicker — same slot, same texture, and
          the reference never stacks the two. */}
      {crumbs.length >= 2 ? (
        <Breadcrumbs
          items={crumbs}
          separator={crumbSettings.separator}
          label={crumbSettings.navLabel}
        />
      ) : (
        <div className="section-label">{typeLabel}</div>
      )}
      <h1 className={heroImage ? 'art-hero-title' : undefined}>{event.title}</h1>
      {metaParts.length ? <p className="event-hero-meta">{metaParts.join(' · ')}</p> : null}
      <p className="event-hero-status">
        {isPast
          ? labels.statusPastLabel || 'Past Event'
          : labels.statusUpcomingLabel || 'Upcoming Event'}
      </p>
    </>
  )

  return (
    <article>
      {draft && <LivePreviewListener />}
      <PayloadRedirects disableNotFound url={`/events/event/${decodedSlug}`} />

      {/* Hero */}
      {heroImage ? (
        <div className="art-hero vf-on-dark event-hero--image">
          <Media resource={heroImage} className="art-hero__media" imgClassName="art-hero__img" />
          <div className="art-hero-overlay" />
          <div className="art-hero-content">
            <div className="container">{heroInner}</div>
          </div>
        </div>
      ) : (
        <section className="page-hero page-hero--light page-hero--center">
          <div className="container">{heroInner}</div>
        </section>
      )}

      {/* Introduction & host boilerplate */}
      <section className="content-section">
        <div className="container">
          {hasDescription || event.excerpt || hasBlurb ? (
            <div className="event-body">
              {hasDescription ? (
                <RichText data={event.description as never} enableGutter={false} enableProse={false} headingIds />
              ) : event.excerpt ? (
                <p>{event.excerpt}</p>
              ) : null}
              {hasBlurb ? (
                <RichText data={host.blurb as never} enableGutter={false} enableProse={false} />
              ) : null}
            </div>
          ) : null}

          {hasCallout ? (
            <div className={cn('event-callout', hostKey === 'verify' && 'event-callout--verify')}>
              <RichText data={host.callout as never} enableGutter={false} enableProse={false} />
            </div>
          ) : null}

          {presenterCards.length ? (
            <div className="event-presenters">
              <InlineRichText as="h2" className="event-presenters__heading" data={presentersHeading} />
              <div className="spec-grid" style={{ '--vf-cols': 3 } as React.CSSProperties}>
                {presenterCards.map((c, i) => (
                  <PersonCard key={i} {...c} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Recap (past) or how to attend (upcoming) — the main body of a recap page */}
      <section className="content-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="event-attend">
            <InlineRichText as="h2" className="event-attend__heading" data={attendHeading} />

            {isPast ? (
              hasRecap ? (
                <>
                  {toc.length >= 2 ? (
                    <nav className="event-toc" aria-label={richTextToPlain(labels.recapTocLabel) || 'In this recap'}>
                      <p className="event-toc__label">
                        {hasRichText(labels.recapTocLabel) ? (
                          <InlineRichText data={labels.recapTocLabel} />
                        ) : (
                          'In this recap'
                        )}
                      </p>
                      <ul className="event-toc__list">
                        {toc.map((t) => (
                          <li key={t.id}>
                            <a href={`#${t.id}`}>{t.text}</a>
                          </li>
                        ))}
                      </ul>
                    </nav>
                  ) : null}
                  <div className="event-body">
                    <RichText data={event.recap as never} enableGutter={false} enableProse={false} headingIds />
                  </div>
                </>
              ) : (
                // Two different sentences, because one of them would be a lie.
                // The default fallback asks the visitor to contact us for
                // recordings — which reads absurdly directly above a Downloads
                // list holding the recording. Measured before this existed: the
                // page said "Contact our team for recordings or resources from
                // this session." and then rendered "Downloads · Session recording".
                <p>
                  {hasMaterials
                    ? richTextToPlain(labels.concludedWithMaterials) ||
                      'This event has now concluded. Photos and resources from the session are below.'
                    : richTextToPlain(labels.concludedFallback) ||
                      'This event has now concluded. Contact our team for recordings or resources from this session.'}
                </p>
              )
            ) : (
              <p>
                {richTextToPlain(host.attendBody) ||
                  'Contact our team to register your interest or reserve a place — places are confirmed by email.'}
              </p>
            )}
          </div>

          {gallery.length ? (
            <div className="event-gallery">
              <h2 className="event-gallery__heading">
                {hasRichText(labels.galleryHeading) ? (
                  <InlineRichText data={labels.galleryHeading} />
                ) : (
                  'From the day'
                )}
              </h2>
              <div className="event-gallery__grid">
                {gallery.map((g, i) => (
                  <figure key={i} className="event-gallery__item">
                    <Media resource={g.image as never} imgClassName="event-gallery__img" />
                    <InlineRichText as="figcaption" data={g.caption} />
                  </figure>
                ))}
              </div>
            </div>
          ) : null}

          {attachments.length ? (
            <div className="art-attachments event-attachments">
              <h2 className="art-attachments__heading">
                {hasRichText(labels.attachmentsHeading) ? (
                  <InlineRichText data={labels.attachmentsHeading} />
                ) : (
                  'Downloads'
                )}
              </h2>
              <ul className="art-attachments__list">
                {attachments.map((a, i) => {
                  const file = a.file as { url?: string | null; filename?: string | null }
                  if (!file?.url) return null
                  return (
                    <li key={i}>
                      <a href={file.url} className="art-attachment" download>
                        <Icon name="file-text" className="size-5" />
                        <span>
                          {hasRichText(a.label) ? (
                            <InlineRichText data={a.label} />
                          ) : (
                            file.filename || 'Download'
                          )}
                        </span>
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : null}

          {/* One row of actions, replacing the CTA paragraph, the 260px location
              tile and the back link that used to be stacked down the page. */}
          <div className="event-actions">
            {primaryCta}
            {hostEventUrl ? (
              <a
                className="btn btn-outline"
                href={hostEventUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {host.hostEventLinkLabel || 'View this event on the host’s site'}
              </a>
            ) : null}
            <a className="event-actions__back" href={EVENTS_INDEX_PATH}>
              <Icon name="caret-left" className="size-4" />
              {labels.backToEventsLabel || 'Back to all events'}
            </a>
          </div>
        </div>
      </section>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const event = await queryEventBySlug({ slug: decodeURIComponent(slug) })
  return generateMeta({ doc: event as never, url: eventPath(event?.slug) })
}

// depth 2, not 1: a presenter's `photo` is one relationship deeper than the
// presenter relationship itself, so at depth 1 `mediaFocal` was handed a bare id.
// Measured by attaching a specialist with a photo and reverting this to 1: the
// card rendered with no <img> AND no placeholder <svg> — a nameplate with a hole
// where the portrait goes, not an obviously-missing image.
const queryEventBySlug = cache(async ({ slug }: { slug: string }): Promise<Event | null> => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'events',
    draft,
    depth: 2,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: { slug: { equals: slug } },
  })
  return result.docs?.[0] || null
})
