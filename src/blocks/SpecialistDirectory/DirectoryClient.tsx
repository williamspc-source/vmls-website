'use client'

import { InlineRichText } from '@/components/RichText/Inline'
import { type RichTextValue } from '@/utilities/lexicalText'
import Link from 'next/link'
import React, { useMemo, useState, useSyncExternalStore } from 'react'

import { Icon } from '@/components/Icon'
import { initialsOf } from '@/components/PersonCard'
import { focalImgStyle } from '@/utilities/focalPoint'
import { specialistPath } from '@/utilities/routes'

/**
 * The page's query string, as an external store.
 *
 * Read this way rather than through Next's `useSearchParams()` on purpose:
 * that hook requires a `<Suspense>` boundary and opts its subtree out of static
 * rendering, and this block can be placed on any page in the CMS. This reads the
 * same information without changing how any page is rendered.
 *
 * The server snapshot is `null` — the server genuinely does not know the query
 * string for a statically rendered page, and saying so keeps SSR and the first
 * client render in agreement.
 */
const subscribeToLocation = (onChange: () => void): (() => void) => {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener('popstate', onChange)
  return () => window.removeEventListener('popstate', onChange)
}
// Returns the same string instance for the same URL, so it is a stable snapshot.
const getSearch = (): string =>
  typeof window === 'undefined' ? '' : window.location.search
const getSearchServer = (): string | null => null

// Plain, serialisable shape passed down from the server component.
export type DirectorySpecialist = {
  id: string
  name: string
  position: string | null
  slug: string | null
  photoUrl: string | null
  photoFocus: string | null
  photoZoom: number | null
  specialty: string | null
  specialtySlug: string | null
  locations: string[]
  accreditations: string[]
}

type Props = {
  specialists: DirectorySpecialist[]
  kicker: RichTextValue
  /** The block's `textColour`, applied to the kicker and heading. */
  textColour?: string | null
  heading: RichTextValue
  enableSearch: boolean
  enableSpecialty: boolean
  enableLocation: boolean
  enableAccreditation: boolean
  searchPlaceholder: string
  countTemplate: string
  specialtyLabel: string
  locationLabel: string
  accreditationLabel: string
  emptyHeading: RichTextValue
  emptyBody: RichTextValue
  cardCtaLabel: string
  secondaryCtaLabel: string
  secondaryCtaHref: string
  resetLabel: string
  locationsLabel: string
  searchGroupLabel: string
  specialtyGroupLabel: string
  accreditationGroupLabel: string
  locationGroupLabel: string
}

const uniqueSorted = (values: string[]): string[] =>
  Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b))

// Horizontal reference card: a 150×170 rectangular photo (or initials fallback)
// in a left column beside a left-aligned text column, with a two-button action
// row (ghost "View Profile" + solid secondary CTA) as a footer.
const Card: React.FC<{
  data: DirectorySpecialist
  ctaLabel: string
  secondaryCtaLabel: string
  secondaryCtaHref: string
  locationsLabel: string
}> = ({ data, ctaLabel, secondaryCtaLabel, secondaryCtaHref, locationsLabel }) => {
  const profileHref = specialistPath(data.slug)

  return (
    <div className="spec-card">
      <div className="spec-card-top">
        <div className="spec-avatar">
          <div className="spec-avatar-inner">
            {data.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="spec-photo-img"
                src={data.photoUrl}
                alt={data.name}
                loading="lazy"
                style={focalImgStyle(data.photoFocus, data.photoZoom)}
              />
            ) : (
              <div className="avatar-mono">{initialsOf(data.name)}</div>
            )}
          </div>
        </div>
        <div className="spec-content">
          <div className="spec-name">{data.name}</div>
          {data.position ? <div className="spec-title">{data.position}</div> : null}
          {data.accreditations.length > 0 ? (
            <div className="spec-accred">{data.accreditations.join('; ')}</div>
          ) : null}
          {data.locations.length > 0 ? (
            <>
              <hr className="spec-divider" />
              <div className="spec-loc-label">{locationsLabel}</div>
              <div className="spec-loc">{data.locations.join(' | ')}</div>
            </>
          ) : null}
        </div>
      </div>
      <div className="spec-card-actions">
        {profileHref ? (
          <Link href={profileHref} className="spec-btn-ghost">
            {ctaLabel}
          </Link>
        ) : null}
        <Link href={secondaryCtaHref} className="spec-btn-solid">
          {secondaryCtaLabel}
        </Link>
      </div>
    </div>
  )
}

export const DirectoryClient: React.FC<Props> = ({
  specialists,
  kicker,
  textColour,
  heading,
  enableSearch,
  enableSpecialty,
  enableLocation,
  enableAccreditation,
  searchPlaceholder,
  countTemplate,
  specialtyLabel,
  locationLabel,
  accreditationLabel,
  emptyHeading,
  emptyBody,
  cardCtaLabel,
  secondaryCtaLabel,
  secondaryCtaHref,
  resetLabel,
  locationsLabel,
  searchGroupLabel,
  specialtyGroupLabel,
  accreditationGroupLabel,
  locationGroupLabel,
}) => {
  const [search, setSearch] = useState('')
  const [accreditation, setAccreditation] = useState('')
  const [location, setLocation] = useState('')

  // Deep-link support: /…?specialty=<slug> (emitted by the SpecialtyGrid block)
  // pre-selects the matching specialty. The filter matches on title, so resolve
  // the slug to its title via the loaded data.
  //
  // Derived during render from the URL, with the visitor's own choice taking
  // precedence, rather than pushed into state by an effect. The effect version
  // was declared `[specialists]` despite its comment saying "runs once on mount",
  // so any re-render carrying a new `specialists` array re-applied the deep link
  // and silently overwrote the filter the visitor had just changed (and undid
  // "Clear filters").
  //
  // `null` means "visitor has not chosen"; `''` is a deliberate choice of "All".
  const [specialtyChoice, setSpecialtyChoice] = useState<string | null>(null)
  const queryString = useSyncExternalStore(subscribeToLocation, getSearch, getSearchServer)
  const deepLinked = useMemo(() => {
    const wanted = queryString ? new URLSearchParams(queryString).get('specialty') : null
    if (!wanted) return ''
    return specialists.find((s) => s.specialtySlug === wanted)?.specialty ?? ''
  }, [queryString, specialists])
  const specialty = specialtyChoice ?? deepLinked
  const setSpecialty = setSpecialtyChoice

  const specialtyOptions = useMemo(
    () => uniqueSorted(specialists.map((s) => s.specialty ?? '')),
    [specialists],
  )
  const accreditationOptions = useMemo(
    () => uniqueSorted(specialists.flatMap((s) => s.accreditations)),
    [specialists],
  )
  const locationOptions = useMemo(
    () => uniqueSorted(specialists.flatMap((s) => s.locations)),
    [specialists],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return specialists.filter((s) => {
      if (q) {
        // Specialty stays in the search index even though it is no longer
        // printed on the card.
        const hay =
          `${s.name} ${s.position ?? ''} ${s.specialty ?? ''} ${s.accreditations.join(' ')} ${s.locations.join(' ')}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (specialty && s.specialty !== specialty) return false
      if (accreditation && !s.accreditations.includes(accreditation)) return false
      if (location && !s.locations.includes(location)) return false
      return true
    })
  }, [specialists, search, specialty, accreditation, location])

  const isFiltering = Boolean(search || specialty || accreditation || location)

  const total = specialists.length
  const countLabel = (() => {
    const t = countTemplate || ''
    if (t.includes('{count}') || t.includes('{total}')) {
      return t.replace(/\{count\}/g, String(filtered.length)).replace(/\{total\}/g, String(total))
    }
    return `${filtered.length} ${t}`.trim()
  })()

  const resetFilters = () => {
    setSearch('')
    // '' not null: an explicit "show all", which must also override a deep link.
    // Passing null here would fall back to the ?specialty= value and the Clear
    // button would appear to do nothing on a deep-linked page.
    setSpecialty('')
    setAccreditation('')
    setLocation('')
  }

  const showSpecialty = enableSpecialty && specialtyOptions.length > 0
  const showAccreditation = enableAccreditation && accreditationOptions.length > 0
  const showLocation = enableLocation && locationOptions.length > 0

  return (
    <div className="vf-directory specialist-directory">
      <div className="specialist-filter-panel" aria-label="Specialist directory filters">
        <div className="specialist-filter-head">
          <div>
            <InlineRichText
              as="div"
              className="specialist-filter-kicker"
              colour={textColour}
              data={kicker}
            />
            <InlineRichText as="h2" colour={textColour} data={heading} />
          </div>
          {isFiltering ? (
            <div className="specialist-filter-count" aria-live="polite">
              {countLabel}
            </div>
          ) : null}
        </div>

        <form className="specialist-filter-form" onSubmit={(e) => e.preventDefault()}>
          {enableSearch ? (
            <label className="specialist-search-field" htmlFor="specialist-search">
              <span>{searchGroupLabel || 'Search'}</span>
              <span className="specialist-input-shell">
                <span className="specialist-field-icon" aria-hidden>
                  <Icon name="magnifying-glass" />
                </span>
                <input
                  id="specialist-search"
                  type="search"
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoComplete="off"
                />
              </span>
            </label>
          ) : null}

          {showSpecialty ? (
            <label className="specialist-select-field" htmlFor="specialist-specialty">
              <span>{specialtyGroupLabel || 'Filter by specialty'}</span>
              <span className="specialist-select-shell">
                <select
                  id="specialist-specialty"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                >
                  <option value="">{specialtyLabel}</option>
                  {specialtyOptions.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </span>
            </label>
          ) : null}

          {showAccreditation ? (
            <label className="specialist-select-field" htmlFor="specialist-accreditation">
              <span>{accreditationGroupLabel || 'Filter by accreditation'}</span>
              <span className="specialist-select-shell">
                <select
                  id="specialist-accreditation"
                  value={accreditation}
                  onChange={(e) => setAccreditation(e.target.value)}
                >
                  <option value="">{accreditationLabel}</option>
                  {accreditationOptions.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </span>
            </label>
          ) : null}

          {showLocation ? (
            <label className="specialist-select-field" htmlFor="specialist-location">
              <span>{locationGroupLabel || 'Filter by location'}</span>
              <span className="specialist-select-shell">
                <select
                  id="specialist-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                >
                  <option value="">{locationLabel}</option>
                  {locationOptions.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </span>
            </label>
          ) : null}

          <button
            type="button"
            className={`specialist-filter-reset${isFiltering ? ' is-active' : ''}`}
            onClick={resetFilters}
          >
            {resetLabel}
          </button>
        </form>
      </div>

      {filtered.length > 0 ? (
        <div className="spec-grid">
          {filtered.map((s) => (
            <Card
              key={s.id}
              data={s}
              ctaLabel={cardCtaLabel}
              secondaryCtaLabel={secondaryCtaLabel}
              secondaryCtaHref={secondaryCtaHref}
              locationsLabel={locationsLabel}
            />
          ))}
        </div>
      ) : (
        <div className="specialist-filter-empty">
          <InlineRichText as="h3" data={emptyHeading} />
          <InlineRichText as="p" data={emptyBody} />
        </div>
      )}
    </div>
  )
}
