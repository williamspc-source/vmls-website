import { InlineRichText } from '@/components/RichText/Inline'
import { portraitShapeClass } from '@/fields/portraitShape'
import { hasRichText, richTextToPlain, type RichTextValue } from '@/utilities/lexicalText'
import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'

import RichText from '@/components/RichText'
import { Media } from '@/components/Media'
import { Icon } from '@/components/Icon'
import { ACCREDITATION_ICON, qualificationIcon } from '@/utilities/qualificationIcon'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { generateMeta } from '@/utilities/generateMeta'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { specialistPath } from '@/utilities/routes'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { getCrumbSettings, specialistCrumbs } from '@/utilities/breadcrumbs'

import type { Specialist } from '@/payload-types'

type Args = { params: Promise<{ slug?: string }> }

// Pull the display title from a populated (depth>0) relationship value.
const relTitles = (arr: unknown): string[] =>
  Array.isArray(arr)
    ? arr
        .filter((x): x is { title?: string } => typeof x === 'object' && x !== null)
        .map((x) => x.title ?? '')
        .filter(Boolean)
    : []

const initials = (name: string): string =>
  name
    .replace(/^(Dr|Adj\.?\s*Prof\.?|Assoc\.?\s*Prof\.?|Prof\.?|Ms|Mr|Mrs)\.?\s+/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

// Time-based safety net: a stale profile self-heals within the hour even if an
// on-demand revalidation hook is missed.
export const revalidate = 3600

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const res = await payload.find({
    collection: 'specialists',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
  })
  return res.docs.map(({ slug }) => ({ slug: slug ?? '' }))
}

export default async function SpecialistProfilePage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const specialist = await querySpecialistBySlug({ slug: decodedSlug })

  if (!specialist) return <PayloadRedirects url={specialistPath(decodedSlug) ?? `/specialists/profiles/${decodedSlug}`} />

  const settings = await getCachedGlobal('specialist-profile', 1)()
  const portal = (settings as { portalCta?: Record<string, RichTextValue> })?.portalCta ?? {}
  const labels = (settings as { labels?: Record<string, RichTextValue> })?.labels ?? {}
  const breadcrumb = (settings as { breadcrumb?: Record<string, string> })?.breadcrumb ?? {}
  const crumbSettings = await getCrumbSettings()
  const portalEnquirySubject =
    (settings as { portalEnquirySubject?: string })?.portalEnquirySubject ||
    'VERIFY Booking Portal Access Request'
  const portalEnquiryType =
    (settings as { portalEnquiryType?: string })?.portalEnquiryType ||
    'Register for Online Booking Portal'

  const portalTiles = Array.isArray(portal.tiles)
    ? (portal.tiles as { icon?: string | null; label?: string | null }[]).filter((t) => t?.label)
    : []
  const profileLabels = (portal ?? {}) as {
    bookingLabel?: string | null
    cvLabel?: string | null
    sampleReportLabel?: string | null
  }
  const asFileUrl = (v: unknown): string | null =>
    v && typeof v === 'object' && 'url' in v ? ((v as { url?: string | null }).url ?? null) : null
  const cvUrl = asFileUrl(specialist.cv)
  const sampleReportUrl = asFileUrl(specialist.sampleReport)
  const enquiryLabel = (portal.enquiryLabel as string) || 'Send Enquiry'
  const enquiryEmail = (portal.enquiryEmail as string) || ''
  const enquiryHref = enquiryEmail
    ? `mailto:${enquiryEmail}?subject=${encodeURIComponent(portalEnquirySubject)}`
    : undefined

  const s = specialist as Specialist & Record<string, unknown>
  const photo = typeof s.photo === 'object' ? s.photo : null
  // The reference prints the job title here ("Consultant Spinal Surgeon"), not
  // the specialty. This used to prefer `specialty.title` — and since `specialty`
  // is `required: true`, the `position` half could never be reached, so a field
  // seeded for all 26 specialists rendered on none of them. `position` is
  // optional, hence the fallback: a specialist added without one still gets a
  // line rather than an empty gap.
  const subtitle =
    // Flattened: this subtitle also feeds the profile's meta description and
    // the card alt text, both of which are attributes.
    richTextToPlain(s.position) ||
    (typeof s.specialty === 'object' && s.specialty
      ? ((s.specialty as { title?: string }).title ?? '')
      : '') ||
    ''
  const locations = relTitles(s.locations)
  const languages = Array.isArray(s.languages)
    ? // Flattened: these are joined with ", " into one line, and joining trees
      // would print "[object Object], [object Object]".
      (s.languages as { language?: RichTextValue }[])
        .map((l) => richTextToPlain(l.language))
        .filter(Boolean)
    : []
  const areas = relTitles(s.areasOfExpertise)
  // Two distinct taxonomies, rendered separately. They used to be concatenated
  // under the single "Assessment Types" heading, which meant a Claim Type never
  // appeared under its own name anywhere on the site — 23 of 26 specialists
  // carry them.
  const claimTypes = relTitles(s.claimTypes)
  const assessmentTypes = relTitles(s.assessmentTypes)
  const qualifications = Array.isArray(s.qualifications)
    ? (s.qualifications as { qualification?: RichTextValue; icon?: string }[])
    : []
  // `relTitles` keeps only the title, which is why the accreditation icon could
  // not reach the JSX and was hardcoded there instead — leaving `Accreditations.icon`
  // an editor control that did nothing.
  const accreditations = Array.isArray(s.accreditations)
    ? (s.accreditations as unknown[])
        .filter((x): x is { title?: string; icon?: string } => typeof x === 'object' && x !== null)
        .map((x) => ({ title: x.title ?? '', icon: x.icon }))
        .filter((x) => x.title)
    : []

  return (
    <article>
      {draft && <LivePreviewListener />}
      <PayloadRedirects disableNotFound url={specialistPath(decodedSlug) ?? `/specialists/profiles/${decodedSlug}`} />

      {/* Hero */}
      <section className="profile-hero">
        <div className="container">
          <div className="profile-hero-inner">
            <div className={['profile-avatar', portraitShapeClass(s.profilePhotoShape)]
              .filter(Boolean)
              .join(' ')}
            >
              {photo ? (
                /* `fill` is load-bearing: without it the image renders at its
                   intrinsic size inside the shaped box, so `object-fit: cover`
                   on `.profile-avatar img` never applies and a non-square photo
                   leaves a band of empty gradient (measured: a 230×230 image in
                   the 230×345 tall box left 115px). `.profile-avatar` is already
                   `position: relative`-equivalent via `overflow: hidden` + the
                   absolute fill; see docs/TRAPS.md on object-fit without fill. */
                <Media resource={photo} alt={s.title} size="230px" fill />
              ) : (
                <span>{initials(s.title)}</span>
              )}
            </div>
            <div className="profile-info">
              <Breadcrumbs
                items={specialistCrumbs(s, {
                  home: crumbSettings.homeLabel,
                  section: breadcrumb.breadcrumbParentLabel,
                  sectionHref: breadcrumb.breadcrumbParentHref,
                })}
                separator={crumbSettings.separator}
                label={crumbSettings.navLabel}
              />
              <h1 className="profile-name">{s.title}</h1>
              {subtitle ? <p className="profile-specialty">{subtitle}</p> : null}
              <div className="profile-hero-meta">
                {locations.length ? (
                  <div className="profile-location">
                    <Icon name="map-pin" className="profile-location-icon" />
                    {locations.join(' | ')}
                  </div>
                ) : null}
                {languages.length ? (
                  <div className="profile-languages">
                    <Icon name="translate" className="profile-lang-icon" />
                    {languages.join(', ')}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="profile-content">
        <div className="container">
          <div className="profile-grid">
            {/* Main column */}
            <div>
              {s.bio ? (
                <div className="profile-section">
                  <div className="profile-section-label">{hasRichText(labels.biography) ? <InlineRichText data={labels.biography} /> : 'Biography'}</div>
                  <div className="profile-bio">
                    <RichText data={s.bio as never} enableGutter={false} />
                  </div>
                </div>
              ) : null}

              {areas.length ? (
                <div className="profile-section">
                  <div className="profile-section-label">
                    {hasRichText(labels.assessmentAreas) ? <InlineRichText data={labels.assessmentAreas} /> : 'Assessment Areas'}
                  </div>
                  <div className="profile-areas-list">
                    {areas.map((a) => (
                      <div key={a} className="profile-area-item">
                        {a}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {assessmentTypes.length ? (
                <div className="profile-section">
                  <div className="profile-section-label">
                    {hasRichText(labels.assessmentTypes) ? <InlineRichText data={labels.assessmentTypes} /> : 'Assessment Types'}
                  </div>
                  <div className="profile-types">
                    {assessmentTypes.map((a) => (
                      <div key={a} className="profile-type-item">
                        {a}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {claimTypes.length ? (
                <div className="profile-section">
                  <div className="profile-section-label">
                    {hasRichText(labels.claimTypes) ? (
                      <InlineRichText data={labels.claimTypes} />
                    ) : (
                      'Claim Types'
                    )}
                  </div>
                  <div className="profile-types">
                    {claimTypes.map((c) => (
                      <div key={c} className="profile-type-item">
                        {c}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Sidebar */}
            <div>
              {qualifications.length ? (
                <div className="profile-sidebar-card">
                  <div className="profile-sidebar-title">
                    {hasRichText(labels.qualifications) ? <InlineRichText data={labels.qualifications} /> : 'Qualifications'}
                  </div>
                  <ul className="profile-qual-list">
                    {qualifications.map((q, i) => (
                      <li key={i}>
                        {/* `qualificationIcon` infers the glyph from the wording,
                            so it needs the words rather than the tree. */}
                        <Icon
                          name={q.icon || qualificationIcon(richTextToPlain(q.qualification))}
                          className="profile-qual-icon"
                        />
                        <InlineRichText data={q.qualification} />
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {accreditations.length ? (
                <div className="profile-sidebar-card">
                  <div className="profile-sidebar-title">
                    {hasRichText(labels.accreditations) ? <InlineRichText data={labels.accreditations} /> : 'Accreditations'}
                  </div>
                  <ul className="profile-qual-list">
                    {accreditations.map((a) => (
                      <li key={a.title}>
                        <Icon name={a.icon || ACCREDITATION_ICON} className="profile-qual-icon" />
                        {a.title}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Shared booking-portal CTA (from the Specialist Profile global) */}
      {hasRichText(portal.heading) ? (
        <section className="portal-opt4">
          <div className="container">
            <div className="portal-opt4-inner">
              <div className="portal-opt4-header">
                {hasRichText(portal.eyebrow) ? (
                  <InlineRichText as="div" className="portal-opt4-eyebrow" data={portal.eyebrow} />
                ) : null}
                <InlineRichText as="h2" className="opt-heading" data={portal.heading} />
              </div>
              {hasRichText(portal.subheading) ? (
                <InlineRichText as="p" className="opt-sub" data={portal.subheading} />
              ) : null}
              {portalTiles.length ? (
                <div className="portal-opt4-tiles">
                  {portalTiles.map((tile, i) => (
                    <div key={i} className="portal-opt4-tile">
                      {tile.icon ? (
                        <Icon name={tile.icon} className="portal-opt4-tile-icon" />
                      ) : null}
                      <InlineRichText
                        as="div"
                        className="portal-opt4-tile-label"
                        data={tile.label}
                      />
                    </div>
                  ))}
                </div>
              ) : null}
              <div className="opt-actions">
                <a
                  className="opt-btn-white"
                  data-enquiry-panel
                  data-enquiry-type={portalEnquiryType}
                  {...(enquiryHref ? { href: enquiryHref } : { role: 'button', tabIndex: 0 })}
                >
                  {enquiryLabel}
                </a>
                {/* Booking link and the two document uploads were all editable
                    and rendered nowhere — a specialist could have a CV attached
                    that no visitor could reach. */}
                {specialist.bookingUrl ? (
                  <a
                    className="opt-btn-white"
                    href={specialist.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {profileLabels.bookingLabel || 'Book an appointment'}
                  </a>
                ) : null}
                {cvUrl ? (
                  <a className="opt-btn-white" href={cvUrl} download>
                    {profileLabels.cvLabel || 'Download CV'}
                  </a>
                ) : null}
                {sampleReportUrl ? (
                  <a className="opt-btn-white" href={sampleReportUrl} download>
                    {profileLabels.sampleReportLabel || 'Sample report'}
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const specialist = await querySpecialistBySlug({ slug: decodeURIComponent(slug) })
  return generateMeta({ doc: specialist as never, url: specialistPath(specialist?.slug) })
}

const querySpecialistBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'specialists',
    draft,
    depth: 2,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: { slug: { equals: slug } },
  })
  return result.docs?.[0] || null
})
