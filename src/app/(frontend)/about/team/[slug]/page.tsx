import { hasRichText, type RichTextValue } from '@/utilities/lexicalText'
import { portraitShapeClass } from '@/fields/portraitShape'
import { InlineRichText } from '@/components/RichText/Inline'
import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'

import RichText from '@/components/RichText'
import { Media } from '@/components/Media'
import { Icon } from '@/components/Icon'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { generateMeta } from '@/utilities/generateMeta'
import { teamPath } from '@/utilities/routes'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { getCrumbSettings, teamCrumbs } from '@/utilities/breadcrumbs'

import type { Team } from '@/payload-types'

// `team-settings` isn't in the generated payload-types yet, so describe the shape
// we read locally and cast defensively.
type TeamSettingsShape = {
  labels?: {
    breadcrumbSectionLabel?: string | null
    qualificationLabel?: string | null
    aboutPrefix?: string | null
  } | null
} | null

type Args = { params: Promise<{ slug?: string }> }

// Time-based safety net: a stale member page self-heals within the hour even if
// an on-demand revalidation hook is missed.
export const revalidate = 3600

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const res = await payload.find({
    collection: 'team',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
  })
  return res.docs.map(({ slug }) => ({ slug: slug ?? '' }))
}

export default async function TeamProfilePage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const member = await queryMemberBySlug({ slug: decodedSlug })

  if (!member) return <PayloadRedirects url={`/about/team/${decodedSlug}`} />

  const settings = (await getCachedGlobal('team-settings' as never, 0)()) as TeamSettingsShape
  const labels = settings?.labels
  const crumbSettings = await getCrumbSettings()

  const m = member as Team & Record<string, unknown>
  // Which photo this page shows, in one place:
  //   hidden          → none, whatever is uploaded
  //   profilePhoto    → that one (Meet the Team and bylines keep the team photo)
  //   otherwise       → the team photo
  const hidePhoto = Boolean((m as { hidePhotoOnProfile?: boolean }).hidePhotoOnProfile)
  const teamPhoto = typeof m.photo === 'object' ? m.photo : null
  const overridePhoto =
    typeof (m as { profilePhoto?: unknown }).profilePhoto === 'object'
      ? ((m as { profilePhoto?: unknown }).profilePhoto as typeof teamPhoto)
      : null
  const photo = hidePhoto ? null : (overridePhoto ?? teamPhoto)
  const sections = Array.isArray(m.sections)
    ? (m.sections as { heading?: RichTextValue; body?: unknown }[])
    : []
  const qualifications = Array.isArray(m.qualifications)
    ? (m.qualifications as { qualification?: RichTextValue }[])
    : []
  // Accent word for the bio heading — the member's first name ("About Wes").
  const firstName = (m.title ?? '').split(/\s+/)[0]

  // The sidebar holds the photo AND any qualification pills, so it survives a
  // hidden photo whenever there is a qualification to show — dropping it on
  // `hidePhoto` alone would silently take a member's qualifications with it.
  // Only when it would render nothing does the grid collapse to one column, so
  // the bio spans the full width instead of leaving a void beside it.
  const hasQualification = qualifications.some((q) => q.qualification)
  const showSidebar = Boolean(photo) || hasQualification

  return (
    <article>
      {draft && <LivePreviewListener />}
      <PayloadRedirects disableNotFound url={`/about/team/${decodedSlug}`} />

      {/* Hero */}
      <section className="staff-hero vf-on-dark">
        <div className="container">
          <Breadcrumbs
            items={teamCrumbs(m, { home: crumbSettings.homeLabel, section: labels?.breadcrumbSectionLabel })}
            separator={crumbSettings.separator}
            label={crumbSettings.navLabel}
          />
          <div className="staff-hero-content">
            <h1 className="staff-hero-name">{m.title}</h1>
            <InlineRichText as="p" className="staff-hero-role" data={m.role} />
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="staff-body">
        <div className="container">
          <div className={`staff-body-grid${showSidebar ? '' : ' staff-body-grid--no-media'}`}>
            {/* Bio column */}
            <div>
              {m.bio ? (
                <div className="staff-section">
                  <div className="staff-section-heading">
                    {hasRichText(labels?.aboutPrefix) ? <InlineRichText data={labels?.aboutPrefix} /> : 'About'} <span>{firstName}</span>
                  </div>
                  <div className="staff-bio">
                    <RichText data={m.bio as never} enableGutter={false} enableProse={false} />
                  </div>
                </div>
              ) : null}
              {sections.map((sec, i) => (
                <div className="staff-section" key={i}>
                  <div className="staff-section-heading">
                    <InlineRichText data={sec.heading} />
                  </div>
                  {sec.body ? (
                    <div className="staff-bio">
                      <RichText data={sec.body as never} enableGutter={false} enableProse={false} />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            {/* Sidebar — omitted entirely when there is neither a photo nor a
                qualification, so the grid above collapses to one column rather
                than reserving 320px for nothing.

                The ROLE pin that used to head this list is gone. It is in every
                reference profile, so this is a deliberate departure: it repeated
                the role already printed under the name in the hero. See
                README.md > Deliberate departures. The Role label in
                Team Settings went with it — a label for something nothing renders
                is a control that silently does nothing.

                NB: that sentence deliberately avoids writing the removed field in
                `object.property` form. `readsField` in adminControls treats a
                member access as a read even inside a comment, so naming it that
                way here re-arms the very blind spot the guard warns about — it
                silently made the orphan check pass on a deliberate break. */}
            {showSidebar ? (
              <div>
                {photo ? (
                  <div className={['staff-photo', portraitShapeClass(m.profilePhotoShape)]
                    .filter(Boolean)
                    .join(' ')}
                  >
                    <Media
                      resource={photo}
                      fill
                      pictureClassName="absolute inset-0"
                      imgClassName="staff-photo-img"
                      size="320px"
                    />
                  </div>
                ) : null}

                {hasQualification ? (
                  <div className="staff-sidebar-info">
                    {qualifications.map((q, i) =>
                      q.qualification ? (
                        <div className="staff-sidebar-item" key={i}>
                          <div className="staff-sidebar-item-icon">
                            <Icon name="graduation-cap" />
                          </div>
                          <div>
                            <div className="staff-sidebar-item-label">
                              {hasRichText(labels?.qualificationLabel) ? (
                                <InlineRichText data={labels?.qualificationLabel} />
                              ) : (
                                'Qualification'
                              )}
                            </div>
                            <InlineRichText
                              as="div"
                              className="staff-sidebar-item-text"
                              data={q.qualification}
                            />
                          </div>
                        </div>
                      ) : null,
                    )}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const member = await queryMemberBySlug({ slug: decodeURIComponent(slug) })
  return generateMeta({ doc: member as never, url: teamPath(member?.slug) })
}

const queryMemberBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'team',
    draft,
    depth: 2,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: { slug: { equals: slug } },
  })
  return result.docs?.[0] || null
})
