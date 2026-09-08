import { richTextToPlain } from '@/utilities/lexicalText'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import type { SpecialistDirectoryBlock as Props, Specialist } from '@/payload-types'

import { Section, type SectionBackground } from '@/components/Section'
import { cn } from '@/utilities/ui'
import { toClassName } from '@/utilities/cssClass'
import { mediaFocal } from '@/utilities/focalPoint'

import { DirectoryClient, type DirectorySpecialist } from './DirectoryClient'

// depth 1 populates relationships to objects; guard for the un-populated
// number/string form just in case.
const relTitles = (rels: unknown): string[] =>
  Array.isArray(rels)
    ? rels
        .map((r) =>
          r && typeof r === 'object' && 'title' in r ? (r as { title?: string | null }).title : null,
        )
        .filter((t): t is string => Boolean(t))
    : []

const specialtyTitle = (s: Specialist['specialty']): string | null =>
  s && typeof s === 'object' ? (s.title ?? null) : null

const specialtySlug = (s: Specialist['specialty']): string | null =>
  s && typeof s === 'object' ? (s.slug ?? null) : null

export const SpecialistDirectoryBlock: React.FC<Props & { bare?: boolean }> = async (props) => {
  const {
    eyebrow,
    heading,
    textColour,
    background,
    enableSearch,
    enableSpecialty,
    enableLocation,
    enableAccreditation,
    sortBy,
    searchPlaceholder,
    countTemplate,
    specialtyLabel,
    locationLabel,
    accreditationLabel,
    emptyHeading,
    emptyBody,
    cardCtaLabel,
    cssClass,
    bare,
  } = props

  // Newer config fields — read defensively so a not-yet-regenerated
  // `payload-types` (the orchestrator regenerates on reseed) doesn't fail typecheck.
  const {
    secondaryCtaLabel,
    secondaryCtaHref,
    resetLabel,
    locationsLabel,
    searchGroupLabel,
    specialtyGroupLabel,
    accreditationGroupLabel,
    locationGroupLabel,
  } = props as Props & {
    secondaryCtaLabel?: string | null
    secondaryCtaHref?: string | null
    resetLabel?: string | null
    locationsLabel?: string | null
    searchGroupLabel?: string | null
    specialtyGroupLabel?: string | null
    accreditationGroupLabel?: string | null
    locationGroupLabel?: string | null
  }

  const payload = await getPayload({ config: configPromise })
  // 'order' → the admin drag-to-reorder order (collection `orderable: true` → `_order`).
  // The two alphabetical options carry a tie-break, or two people sharing a given
  // name come back in whatever order the table hands them over: measured, "Andrew
  // Ryan" sorted ahead of "Andrew Renaut". `firstName`/`lastName` are filled from
  // the full name by the `deriveNames` hook, so neither column is ever empty —
  // before that, sorting by `firstName` ordered 26 NULLs and looked broken.
  const sortKey: string | string[] =
    sortBy === 'firstName'
      ? ['firstName', 'lastName']
      : sortBy === 'lastName'
        ? ['lastName', 'firstName']
        : '_order'
  const { docs } = await payload.find({
    collection: 'specialists',
    depth: 1,
    limit: 500,
    sort: sortKey,
    where: { _status: { equals: 'published' } },
  })

  const specialists: DirectorySpecialist[] = docs.map((s) => {
    const photo = mediaFocal(s.photo, 150) // .spec-photo-img, measured 150px
    return {
      id: String(s.id),
      name: s.title,
      // Flattened: the directory's client-side search builds one haystack
      // string from name/position/specialty/accreditations/locations.
      position: richTextToPlain(s.position) || null,
      slug: s.slug ?? null,
      photoUrl: photo.url,
      photoFocus: photo.focus,
      photoZoom: photo.zoom,
      specialty: specialtyTitle(s.specialty),
      specialtySlug: specialtySlug(s.specialty),
      locations: relTitles(s.locations),
      accreditations: relTitles(s.accreditations),
    }
  })

  return (
    <Section
      background={background as SectionBackground}
      className={cn('vf-specialist-directory', toClassName(cssClass))}
      bare={bare}
    >
      {/* The reference has no centered section header — the kicker + heading live
          inside the filter panel (rendered by DirectoryClient), and there is no
          subheading. */}
      <DirectoryClient
        kicker={eyebrow ?? 'Find a specialist'}
        heading={heading ?? 'Search the directory'}
        textColour={textColour}
        specialists={specialists}
        enableSearch={enableSearch ?? true}
        enableSpecialty={enableSpecialty ?? true}
        enableLocation={enableLocation ?? true}
        enableAccreditation={enableAccreditation ?? true}
        searchPlaceholder={searchPlaceholder ?? 'Search by name…'}
        countTemplate={countTemplate ?? '{count} specialists'}
        specialtyLabel={specialtyLabel ?? 'All specialties'}
        locationLabel={locationLabel ?? 'All locations'}
        accreditationLabel={accreditationLabel ?? 'All accreditations'}
        emptyHeading={emptyHeading ?? 'No specialists found'}
        emptyBody={emptyBody ?? 'Try adjusting your filters.'}
        cardCtaLabel={cardCtaLabel ?? 'View Profile'}
        secondaryCtaLabel={secondaryCtaLabel ?? 'Request Availability'}
        secondaryCtaHref={secondaryCtaHref ?? '/contact'}
        resetLabel={resetLabel ?? 'Clear Filters'}
        locationsLabel={locationsLabel ?? 'Consulting Locations'}
        searchGroupLabel={searchGroupLabel ?? 'Search'}
        specialtyGroupLabel={specialtyGroupLabel ?? 'Filter by specialty'}
        accreditationGroupLabel={accreditationGroupLabel ?? 'Filter by accreditation'}
        locationGroupLabel={locationGroupLabel ?? 'Filter by location'}
      />
    </Section>
  )
}
