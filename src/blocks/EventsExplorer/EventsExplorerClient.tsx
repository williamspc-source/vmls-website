'use client'
import { InlineRichText } from '@/components/RichText/Inline'
import { hasRichText, type RichTextValue } from '@/utilities/lexicalText'
import React, { useMemo, useRef, useState, useSyncExternalStore } from 'react'

import { Icon } from '@/components/Icon'
import { EventCalendar } from '@/components/EventCalendar'
import { eventPath } from '@/utilities/routes'
import { isEventPast, startOfDay } from '@/utilities/eventTiming'
import { cn } from '@/utilities/ui'
import { pastBandClass, type EventsExplorerSeparator } from './separator'

export type { EventsExplorerSeparator }

// Plain, serialisable event shape passed from the server component.
export type EventItem = {
  id: string
  title: string
  slug: string
  date: string // ISO
  timeLabel: string
  location: string
  eventType: string
  typeLabel: string
  cpdEligible: boolean
  cost: string
  excerpt: string
  registrationUrl: string
  image: string | null
}

// Admin-editable UI strings. All optional and read defensively (payload-types
// have not been regenerated for this block yet); each has a literal fallback
// applied where it is used.
export type EventsExplorerLabels = {
  moreInfoLabel?: string | null
  viewRecapLabel?: string | null
  upcomingHeading?: string | null
  pastHeading?: string | null
  emptyUpcoming?: string | null
  emptyUpcomingSearch?: string | null
  emptyPast?: string | null
  emptyPastSearch?: string | null
  loadingLabel?: string | null
  searchPlaceholder?: string | null
  datesLabel?: string | null
  searchButtonLabel?: string | null
}

export type EventsExplorerGroups = {
  upcomingEyebrow?: string | null
  upcomingHeading?: string | null
  upcomingIntro?: string | null
  upcomingLinkLabel?: string | null
  upcomingLinkUrl?: string | null
  pastEyebrow?: string | null
  pastHeading?: string | null
  pastIntro?: string | null
  pastLinkLabel?: string | null
  pastLinkUrl?: string | null
}

type Props = {
  events: EventItem[]
  mode: 'all' | 'upcoming-only' | 'past-only'
  pageSize: number
  showSearch: boolean
  labels?: EventsExplorerLabels | null
  cardStyle?: 'list' | 'card' | null
  groups?: EventsExplorerGroups | null
  separator?: EventsExplorerSeparator | null
}

const eventUrl = (e: EventItem): string => eventPath(e.slug) ?? '/events'

/**
 * "Today", as the visitor's browser sees it — never the server.
 *
 * This page is statically rendered, so reading the clock during render would bake
 * a build-time "today" into the HTML and mis-sort every event until the next
 * regeneration (and mismatch on hydration). It used to be a `useState(null)` plus
 * an effect that set the real value after mount; `useSyncExternalStore` expresses
 * the same thing directly, with `null` as the explicit server snapshot that drives
 * the "Loading events…" first paint.
 *
 * The client snapshot must be referentially stable — React calls it on every
 * render and re-renders if the value changed — and `startOfDay(Date.now())`
 * already is: it returns the identical number for every call within the same
 * local day. A module-level memo was tried first and was actively wrong, because
 * it froze "today" for the lifetime of the JS bundle, which outlives a page (
 * client-side navigation does not re-evaluate modules). A tab left open overnight
 * would never have re-bucketed. Computing it fresh is both stable and
 * self-correcting at midnight.
 */
const getToday = (): number => startOfDay(Date.now())
const getTodayServer = (): null => null
// Nothing to subscribe to: the value only changes at midnight, and it is re-read
// on every render anyway. The unsubscribe is a no-op.
const subscribeToNothing = (): (() => void) => () => {}

const dateLabel = (iso: string): string => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
}

// Pagination window — ported verbatim from events.js `pageItems`.
const pageItems = (current: number, total: number): Array<number | 'ellipsis'> => {
  const items: Array<number | 'ellipsis'> = []
  let i: number
  if (total <= 7) {
    for (i = 1; i <= total; i += 1) items.push(i)
    return items
  }
  if (current <= 3) {
    items.push(1, 2, 3, 4, 'ellipsis')
    for (i = total - 2; i <= total; i += 1) items.push(i)
    return items
  }
  if (current >= total - 2) {
    items.push(1, 2, 'ellipsis')
    for (i = total - 3; i <= total; i += 1) items.push(i)
    return items
  }
  return [1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', total]
}

const Pagination: React.FC<{
  total: number
  pageSize: number
  current: number
  onChange: (page: number) => void
}> = ({ total, pageSize, current, onChange }) => {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  if (pages <= 1) return null
  const prevDisabled = current === 1
  const nextDisabled = current === pages

  return (
    <nav className="events-pagination" aria-label="Events pagination">
      <button
        className="events-page-arrow"
        type="button"
        aria-label="Previous page"
        disabled={prevDisabled}
        aria-disabled={prevDisabled || undefined}
        onClick={() => onChange(Math.max(1, current - 1))}
      >
        <Icon name="caret-left" />
      </button>
      <div className="events-page-track">
        {pageItems(current, pages).map((item, idx) =>
          item === 'ellipsis' ? (
            <span className="events-page-ellipsis" aria-hidden="true" key={`e-${idx}`}>
              ...
            </span>
          ) : (
            <button
              key={item}
              className={`events-page-number${item === current ? ' is-active' : ''}`}
              type="button"
              aria-label={`Page ${item}`}
              aria-current={item === current ? 'page' : undefined}
              onClick={() => onChange(item)}
            >
              {item}
            </button>
          ),
        )}
      </div>
      <button
        className="events-page-arrow"
        type="button"
        aria-label="Next page"
        disabled={nextDisabled}
        aria-disabled={nextDisabled || undefined}
        onClick={() => onChange(Math.min(pages, current + 1))}
      >
        <Icon name="caret-right" />
      </button>
    </nav>
  )
}

const EventRow: React.FC<{ event: EventItem; ctaLabel: string }> = ({ event, ctaLabel }) => {
  const href = eventUrl(event)
  return (
    <article className="event-list-row">
      {event.image ? (
        <div className="event-list-photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.image}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--vf-radius-card)' }}
          />
        </div>
      ) : (
        <EventCalendar date={event.date} />
      )}
      <div className="event-list-content">
        <h2>{event.title}</h2>
        <div className="event-list-meta">
          <span>
            <Icon name="calendar" /> {dateLabel(event.date)}
          </span>
          {event.timeLabel ? (
            <span>
              <Icon name="clock" /> {event.timeLabel}
            </span>
          ) : null}
          {event.location ? (
            <a href={href}>
              <Icon name="map-pin" /> {event.location}
            </a>
          ) : null}
        </div>
        {event.excerpt ? <p className="event-list-excerpt">{event.excerpt}</p> : null}
        <a className="event-list-button" href={href}>
          {ctaLabel}
        </a>
      </div>
    </article>
  )
}

// The hub card, matching `.event-card` in the reference's events.css. Same
// markup as ArchiveBlock emits, so the two presentations of an event stay one
// design rather than drifting into two.
//
// The reference prints a fixed "Event image" label in the empty media panel. We
// print the event's DATE instead — the one deliberate improvement here, so a
// slot awaiting a photograph still tells the visitor something. An uploaded
// image replaces it.
const EventCard: React.FC<{ event: EventItem; ctaLabel: string }> = ({ event, ctaLabel }) => {
  const href = eventUrl(event)
  return (
    <article className="event-card">
      <a
        className={`event-card-media${event.image ? '' : ' event-card-media--calendar'}`}
        href={href}
        aria-hidden
        tabIndex={-1}
      >
        {event.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.image} alt="" />
        ) : (
          <EventCalendar date={event.date} variant="card" />
        )}
      </a>
      <div className="event-card-body">
        <div className="event-card-top">
          <span className="event-card-date">{dateLabel(event.date)}</span>
          {event.typeLabel ? <span className="event-type-tag">{event.typeLabel}</span> : null}
        </div>
        <h3>
          <a href={href}>{event.title}</a>
        </h3>
        {event.excerpt ? <p className="event-card-desc">{event.excerpt}</p> : null}
        <div className="event-card-meta">
          {event.timeLabel ? <span>{event.timeLabel}</span> : null}
          {event.location ? <span>{event.location}</span> : null}
        </div>
        <a className="event-card-link" href={href}>
          {/* Explicit space: JSX collapses the newline between the expression and
              the entity, which rendered "More Info→" with no gap. */}
          {ctaLabel}
          {' →'}
        </a>
      </div>
    </article>
  )
}

// The reference's `.events-section-header`: eyebrow, heading whose [[bracketed]]
// half takes the brand accent, a line of copy, and a "View more" button pushed
// to the right. Absent from the build entirely until now, which is why the
// upcoming/past sections had a bare label and no intro or button.
const SectionHeader: React.FC<{
  eyebrow?: RichTextValue
  heading?: RichTextValue
  intro?: RichTextValue
  linkLabel?: RichTextValue
  linkUrl?: string
}> = ({ eyebrow, heading, intro, linkLabel, linkUrl }) => {
  // `hasRichText`, not truthiness: an empty rich-text value is a truthy object.
  if (
    !hasRichText(eyebrow) &&
    !hasRichText(heading) &&
    !hasRichText(intro) &&
    !hasRichText(linkLabel)
  )
    return null
  return (
    <div className="events-section-header">
      <div>
        <InlineRichText as="div" className="section-label" data={eyebrow} />
        <InlineRichText as="h2" data={heading} />
        <InlineRichText as="p" data={intro} />
      </div>
      {hasRichText(linkLabel) && linkUrl ? (
        <a className="events-view-link" href={linkUrl}>
          <InlineRichText data={linkLabel} />
        </a>
      ) : null}
    </div>
  )
}

// A single upcoming/past group: optional label, paginated list of rows, and its
// own pagination.
//
// If the list shrinks under the current page (the visitor searches while on page
// 4 of 5), `safePage` below clamps it during render — it does not reset to 1.
// An earlier version of this comment claimed it reset to 1; it never did.
const EventGroup: React.FC<{
  label?: string
  list: EventItem[]
  ctaLabel: string
  pageSize: number
  emptyText: string
  cardStyle?: 'list' | 'card'
  header?: React.ReactNode
  className?: string
}> = ({ label, list, ctaLabel, pageSize, emptyText, cardStyle = 'list', header, className }) => {
  const [page, setPage] = useState(1)
  const boxRef = useRef<HTMLDivElement | null>(null)

  // `safePage` is the clamp. There used to be an effect here doing
  // `if (page > totalPages) setPage(totalPages)`, which was dead code: every
  // consumer below already reads `safePage`, never `page`, so the effect only
  // wrote a derived value back into state and triggered a second render.
  const totalPages = Math.max(1, Math.ceil(list.length / pageSize))
  const safePage = Math.min(Math.max(page, 1), totalPages)
  const start = (safePage - 1) * pageSize
  const pageList = list.slice(start, start + pageSize)

  const goToPage = (next: number) => {
    setPage(next)
    boxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className={cn('events-explorer-group', className)}>
      {/* Card mode carries a full section header; list mode keeps the bare
          label, which is what the reference's dedicated listing pages use. */}
      {header ?? (label ? <div className="section-label">{label}</div> : null)}
      <div className={cardStyle === 'card' ? 'events-card-grid' : 'event-list'} ref={boxRef}>
        {pageList.length ? (
          pageList.map((e) =>
            cardStyle === 'card' ? (
              <EventCard key={e.id} event={e} ctaLabel={ctaLabel} />
            ) : (
              <EventRow key={e.id} event={e} ctaLabel={ctaLabel} />
            ),
          )
        ) : (
          <p className="events-empty">{emptyText}</p>
        )}
      </div>
      {list.length ? (
        <Pagination
          total={list.length}
          pageSize={pageSize}
          current={safePage}
          onChange={goToPage}
        />
      ) : null}
    </div>
  )
}

// Faithful port of the reference events listing behaviour. Upcoming vs past is
// decided HERE, at view time, from each event's `date` versus the browser's
// current date — computed after mount so a statically-rendered page never goes
// stale (and to avoid a hydration mismatch).
export const EventsExplorerClient: React.FC<Props> = ({
  events,
  mode,
  pageSize,
  showSearch,
  labels,
  cardStyle,
  groups,
  separator,
}) => {
  const style: 'list' | 'card' = cardStyle === 'card' ? 'card' : 'list'
  const now = useSyncExternalStore(subscribeToNothing, getToday, getTodayServer)
  const [query, setQuery] = useState('')

  // Resolve editable strings once, falling back to the original literals when a
  // field is empty/absent (empty string counts as "use default" via `||`).
  const L = {
    moreInfo: labels?.moreInfoLabel || 'More Info',
    viewRecap: labels?.viewRecapLabel || 'View Recap',
    upcomingHeading: labels?.upcomingHeading || 'Upcoming Events',
    pastHeading: labels?.pastHeading || 'Past Events',
    emptyUpcoming:
      labels?.emptyUpcoming || 'No upcoming events are listed right now — please check back soon.',
    emptyUpcomingSearch: labels?.emptyUpcomingSearch || 'No upcoming events match your search.',
    emptyPast: labels?.emptyPast || 'No past events to show yet.',
    emptyPastSearch: labels?.emptyPastSearch || 'No past events match your search.',
    loading: labels?.loadingLabel || 'Loading events…',
    searchPlaceholder: labels?.searchPlaceholder || 'Search',
    dates: labels?.datesLabel || 'Dates',
    searchButton: labels?.searchButtonLabel || 'Search',
  }

  const q = query.trim().toLowerCase()

  const filtered = useMemo(() => {
    if (!q) return events
    return events.filter((e) =>
      [e.title, e.excerpt, e.typeLabel, e.location].some((v) =>
        (v || '').toLowerCase().includes(q),
      ),
    )
  }, [events, q])

  const { upcoming, past } = useMemo(() => {
    if (now === null) return { upcoming: [] as EventItem[], past: [] as EventItem[] }
    const up: EventItem[] = []
    const pa: EventItem[] = []
    // Same resolver the detail page uses, passed this browser's clock. Before
    // this the two disagreed: the listing compared start-of-day (so an event was
    // "upcoming" all day) while the detail page compared the exact start time, so
    // the same event read Upcoming here and "Past Event" on its own page.
    filtered.forEach((e) => {
      if (isEventPast(e, now)) pa.push(e)
      else up.push(e)
    })
    up.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // soonest first
    pa.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // most recent first
    return { upcoming: up, past: pa }
  }, [filtered, now])

  const showUpcoming = mode !== 'past-only'
  const showPast = mode !== 'upcoming-only'
  const showBothLabels = mode === 'all'

  // A separator only means anything with a group on each side of it, so both
  // are gated on that rather than on `mode` — the admin condition already hides
  // the fields outside "Upcoming & Past", and this makes the render agree with
  // it instead of trusting that it does.
  const bothGroups = showUpcoming && showPast
  const dividerStyle = separator?.divider && separator.divider !== 'none' ? separator.divider : null
  const pastBand = pastBandClass(mode, separator)

  return (
    <div className="events-explorer-body" aria-busy={now === null || undefined}>
      {showSearch ? (
        <form
          className="events-filter-bar"
          role="search"
          onSubmit={(e) => e.preventDefault()}
        >
          <label className="events-filter-field">
            <Icon name="magnifying-glass" />
            <input
              type="search"
              placeholder={L.searchPlaceholder}
              aria-label="Search events"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <div className="events-filter-date" aria-hidden="true">
            <Icon name="calendar" />
            <span>{L.dates}</span>
          </div>
          <div className="events-filter-icons" aria-hidden="true">
            <Icon name="sliders" />
            <Icon name="list" />
            <Icon name="sort-ascending" />
          </div>
          <button className="events-filter-button" type="submit">
            {L.searchButton}
          </button>
        </form>
      ) : null}

      {now === null ? (
        <div className="event-list">
          <p className="events-empty">{L.loading}</p>
        </div>
      ) : (
        <>
          {showUpcoming ? (
            <EventGroup
              label={showBothLabels ? L.upcomingHeading : undefined}
              cardStyle={style}
              header={
                style === 'card' ? (
                  <SectionHeader
                    eyebrow={groups?.upcomingEyebrow || undefined}
                    heading={groups?.upcomingHeading || undefined}
                    intro={groups?.upcomingIntro || undefined}
                    linkLabel={groups?.upcomingLinkLabel || undefined}
                    linkUrl={groups?.upcomingLinkUrl || undefined}
                  />
                ) : undefined
              }
              list={upcoming}
              ctaLabel={L.moreInfo}
              pageSize={pageSize}
              emptyText={q ? L.emptyUpcomingSearch : L.emptyUpcoming}
            />
          ) : null}
          {bothGroups && dividerStyle ? (
            <hr
              className={cn(
                'events-explorer-divider',
                'vf-divider',
                `vf-divider--${dividerStyle}`,
                `vf-divider--${separator?.dividerWidth || 'full'}`,
              )}
            />
          ) : null}
          {showPast ? (
            <EventGroup
              className={pastBand}
              label={showBothLabels ? L.pastHeading : undefined}
              cardStyle={style}
              header={
                style === 'card' ? (
                  <SectionHeader
                    eyebrow={groups?.pastEyebrow || undefined}
                    heading={groups?.pastHeading || undefined}
                    intro={groups?.pastIntro || undefined}
                    linkLabel={groups?.pastLinkLabel || undefined}
                    linkUrl={groups?.pastLinkUrl || undefined}
                  />
                ) : undefined
              }
              list={past}
              ctaLabel={L.viewRecap}
              pageSize={pageSize}
              emptyText={q ? L.emptyPastSearch : L.emptyPast}
            />
          ) : null}
        </>
      )}
    </div>
  )
}
