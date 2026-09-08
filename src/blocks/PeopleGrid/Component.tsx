import { hasRichText } from '@/utilities/lexicalText'
import configPromise from '@payload-config'
import { getPayload, type Where } from 'payload'
import React from 'react'

import type { PeopleGridBlock as Props, Specialist, Team } from '@/payload-types'

import { ExpertsCarousel } from '@/components/ExpertsCarousel'
import { PersonCard, type PersonCardData } from '@/components/PersonCard'
import { CMSLink } from '@/components/Link'
import { Section, type SectionBackground } from '@/components/Section'
import { SectionHeader } from '@/components/SectionHeader'
import { cn } from '@/utilities/ui'
import { toClassName } from '@/utilities/cssClass'
import { mediaFocal } from '@/utilities/focalPoint'
import { specialistPath, teamPath } from '@/utilities/routes'

/**
 * A team member's department, as a populated relationship.
 *
 * This replaced a `DEPARTMENT_LABELS` slug→name map and a `DEPARTMENT_ORDER`
 * array, both fixed in code — two of the four copies of that list. The label and
 * the order are now the department's own `title` and `order`, so adding a team,
 * renaming one or reordering the groups on Meet the Team is an admin edit.
 */
type DepartmentRef = { id: number | string; title?: string | null; order?: number | null }

const asDepartment = (value: unknown): DepartmentRef | null =>
  value && typeof value === 'object' && 'id' in (value as DepartmentRef)
    ? (value as DepartmentRef)
    : null

const firstLocationTitle = (locations: Specialist['locations']): string | null => {
  const first = Array.isArray(locations) ? locations[0] : null
  return first && typeof first === 'object' ? (first.title ?? null) : null
}

// Reference expert cards are deliberately simple: photo, name, specialty role.
// No specialty badge overlay on the photo and no qualification/degree pills
// (those live on the full specialist profile, not the panel card).
const specialistToCard = (s: Specialist, linkProfiles: boolean): PersonCardData => {
  // Circle avatar; the widest instance measured 255px on the experts carousel.
  const photo = mediaFocal(s.photo, 255)
  return {
    name: s.title,
    position: s.position,
    location: firstLocationTitle(s.locations),
    photoUrl: photo.url,
    photoFocus: photo.focus,
    photoZoom: photo.zoom,
    href: linkProfiles ? specialistPath(s.slug) : null,
  }
}

// Team members render as rectangular photo cards (full-bleed headshot on top,
// name + role beneath) — the design-reference "Meet the Team" treatment.
const teamToCard = (t: Team, linkProfiles: boolean): PersonCardData => {
  // .vf-team-card__image, measured 265px on /about/meet-the-team.
  const photo = mediaFocal(t.photo, 265)
  return {
    name: t.title,
    position: t.role,
    location: null,
    photoUrl: photo.url,
    photoFocus: photo.focus,
    photoZoom: photo.zoom,
    href: linkProfiles ? teamPath(t.slug) : null,
    variant: 'rect',
  }
}

export const PeopleGridBlock: React.FC<Props & { bare?: boolean }> = async (props) => {
  const {
    eyebrow,
    heading,
    subheading,
    textColour,
    background,
    headerBackground,
    source = 'specialists',
    onlyAdvertised,
    featuredOnly,
    specialty,
    location,
    asmtType,
    department,
    groupByDepartment,
    people,
    layout,
    limit,
    linkProfiles,
    footerLinks,
    cssClass,
    elementClasses,
    motion,
    containerWidth,
    hoverEffect,
    shadow,
    carouselOptions,
    columns,
    bare,
  } = props
  const cardClass = toClassName(elementClasses?.card)
  const co = carouselOptions || {}
  // `columns` and `showArrows` were both stored and never read: the grid used a
  // fixed auto-fill track and the carousel was hardcoded to showArrows={false}.
  const cols = Number(columns) || 4
  const showArrows = (co as { showArrows?: boolean | null }).showArrows !== false
  const lim = limit === 0 ? 0 : limit || undefined

  const payload = await getPayload({ config: configPromise })
  const cards: PersonCardData[] = []
  let groups: { label: string; cards: PersonCardData[] }[] | null = null

  if (source === 'manual') {
    for (const rel of people || []) {
      if (typeof rel.value !== 'object') continue
      if (rel.relationTo === 'specialists') {
        cards.push(specialistToCard(rel.value as Specialist, Boolean(linkProfiles)))
      } else if (rel.relationTo === 'team') {
        cards.push(teamToCard(rel.value as Team, Boolean(linkProfiles)))
      }
    }
  } else if (source === 'team') {
    const where: Where = {}
    if (department) {
      where.department = {
        equals: typeof department === 'object' ? (department as { id: number | string }).id : department,
      }
    }
    const res = await payload.find({
      collection: 'team',
      // Local API defaults to overrideAccess: true, which bypasses
      // authenticatedOrPublished and puts unpublished drafts on the live page.
      overrideAccess: false,
      depth: 1,
      limit: groupByDepartment ? 0 : (lim ?? 12),
      sort: 'order',
      where,
    })
    if (groupByDepartment) {
      // Keyed by department id, with the department kept alongside so the label
      // and the sort both come from the record rather than from a second lookup.
      // `department` is required on Team, and Departments refuses deletion while
      // members remain, so an unassigned member is not a state the data can reach
      // — one is skipped rather than invented into a default group, which is what
      // the old `t.department || 'operations'` fallback silently did.
      const byDept = new Map<string, { dept: DepartmentRef; cards: PersonCardData[] }>()
      res.docs.forEach((t) => {
        const dept = asDepartment(t.department)
        if (!dept) return
        const key = String(dept.id)
        const entry = byDept.get(key) ?? { dept, cards: [] }
        entry.cards.push(teamToCard(t, Boolean(linkProfiles)))
        byDept.set(key, entry)
      })
      groups = [...byDept.values()]
        .sort(
          (a, b) =>
            (a.dept.order ?? 0) - (b.dept.order ?? 0) ||
            (a.dept.title ?? '').localeCompare(b.dept.title ?? ''),
        )
        .map(({ dept, cards: groupCards }) => ({
          label: dept.title || '',
          cards: groupCards,
        }))
      groups.forEach((g) => cards.push(...g.cards))
    } else {
      res.docs.forEach((t) => cards.push(teamToCard(t, Boolean(linkProfiles))))
    }
  } else {
    const and: Where[] = []
    if (onlyAdvertised) and.push({ advertise: { equals: true } })
    if (featuredOnly) and.push({ featured: { equals: true } })
    if (specialty) and.push({ specialty: { equals: typeof specialty === 'object' ? specialty.id : specialty } })
    if (location) and.push({ locations: { equals: typeof location === 'object' ? location.id : location } })
    // `equals` against a hasMany relationship matches "contains", which is what is
    // wanted: a specialist tagged with several assessment types belongs in each of
    // their carousels. Verified against the REST API before this was written —
    // the failure mode is an empty result, and an empty result returns null below
    // and deletes the whole band, heading and buttons included.
    if (asmtType)
      and.push({
        assessmentTypes: {
          equals: typeof asmtType === 'object' ? asmtType.id : asmtType,
        },
      })
    const res = await payload.find({
      collection: 'specialists',
      overrideAccess: false,
      depth: 1,
      limit: lim ?? 8,
      sort: '_order',
      ...(and.length ? { where: { and } } : {}),
    })
    res.docs.forEach((s) => cards.push(specialistToCard(s, Boolean(linkProfiles))))
  }

  if (cards.length === 0) return null

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

  // The header can sit on a band of its own — the reference does this on Meet the
  // Team, where `.team-intro` is light blue over a grey `.team-grid-section`.
  //
  // Three conditions, all load-bearing:
  //   - 'default' (the sentinel) means one continuous band, i.e. every block that
  //     predates this field renders unchanged;
  //   - there has to BE a header, or the band is an empty coloured stripe — a
  //     control that appears to have worked and produced nothing legible;
  //   - `bare` blocks are nested inside another Section/Row and have already
  //     dropped their banding, so a second band there is meaningless.
  const hasHeader = hasRichText(eyebrow) || hasRichText(heading) || hasRichText(subheading)
  const splitHeader = Boolean(headerBackground && headerBackground !== 'default' && hasHeader && !bare)

  return (
    <>
      {splitHeader ? (
        <Section
          background={headerBackground as SectionBackground}
          // `vf-header-band` is the generic hook — the spacing rules live on it,
          // so any block that adopts `headerBandField` gets them without a new
          // rule. The block-specific class stays for Custom Styles authors.
          className={cn('vf-header-band', 'vf-people-grid__header-band', toClassName(cssClass))}
          containerWidth={containerWidth}
        >
          {header}
        </Section>
      ) : null}

      <Section
      background={background as SectionBackground}
      className={cn('vf-people-grid', toClassName(cssClass))}
      motion={motion}
      containerWidth={containerWidth}
      hoverEffect={hoverEffect}
      shadow={shadow}
      bare={bare}
    >
      {splitHeader ? null : header}

      {groups ? (
        <div className="vf-people-grid__groups">
          {groups.map((g) => (
            <div key={g.label} className="vf-people-grid__group">
              <div className="vf-people-grid__group-label divider-label">{g.label}</div>
              <div className="spec-grid" style={{ '--vf-cols': cols } as React.CSSProperties}>
                {g.cards.map((c, i) => (
                  <PersonCard key={i} {...c} className={cardClass} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : layout === 'carousel' ? (
        <ExpertsCarousel
          cards={cards}
          speed={co.speed}
          startDirection={co.direction === 'right' ? 'right' : 'left'}
          showArrows={showArrows}
          cardClassName={cardClass}
        />
      ) : (
        <div className="spec-grid" style={{ '--vf-cols': cols } as React.CSSProperties}>
          {cards.map((c, i) => (
            <PersonCard key={i} {...c} className={cardClass} />
          ))}
        </div>
      )}

      {Array.isArray(footerLinks) && footerLinks.length > 0 ? (
        <div className="vf-people-grid__footer experts-cta">
          {footerLinks.map(({ link }, i) => (
            <CMSLink key={i} {...link} className={cn('btn', i === 0 ? 'btn-primary' : 'btn-outline')} />
          ))}
        </div>
      ) : null}
      </Section>
    </>
  )
}
