import React from 'react'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/**
 * The date glyph an event falls back to when it has no photo.
 *
 * ── Why this is one component ──
 * The same fallback is drawn in three places — the listing rows on
 * /events/upcoming-events and /events/past-events, the hub cards on /events, and
 * ArchiveBlock's event cards — and all three had written their own. They had
 * drifted: the listing rows drew this calendar while both card sites printed the
 * date as text on a blue gradient, so the same event looked like two different
 * designs depending on which page you were on. Each site also carried its own
 * copy of the month-abbreviation table.
 *
 * Presentational only, with no hooks or state, so it is valid in both the client
 * tree (EventsExplorerClient) and the server tree (ArchiveBlock).
 *
 * Note the reference's own `.event-list-calendar*` rules (events.css:749-806) are
 * DEAD there — its JS renders a blue "Event Photo" placeholder on every row and
 * never this glyph. We render it deliberately: it tells a visitor the date, which
 * a placeholder box does not. Recorded in README.md > Deliberate departures so it is not read as a
 * defect by the next person diffing against the reference.
 *
 * `variant="card"` is for the 260px `.event-card-media` panel, whose blue
 * gradient is dropped to white so the grey glyph reads against it.
 */
export const EventCalendar: React.FC<{ date?: string | null; variant?: 'row' | 'card' }> = ({
  date,
  variant = 'row',
}) => {
  const d = date ? new Date(date) : null
  // An unparseable date would otherwise render "NaN" in 2.45rem type.
  if (!d || Number.isNaN(d.getTime())) return null

  return (
    <div className={variant === 'card' ? 'event-list-calendar-wrap is-card' : 'event-list-calendar-wrap'}>
      <div className="event-list-calendar">
        <span className="cal-rule" />
        <span className="cal-day">{d.getDate()}</span>
        <span className="cal-month">{MONTHS[d.getMonth()] || ''}</span>
      </div>
    </div>
  )
}
