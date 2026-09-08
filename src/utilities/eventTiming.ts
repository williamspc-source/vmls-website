/**
 * The two time-based questions an Event has to answer — kept apart, because
 * conflating them was a bug.
 *
 * A single `isPast` boolean used to drive both the "Upcoming Event / Past Event"
 * badge *and* whether the call-to-action read "Register Your Interest" or
 * "Contact Us", and it compared `Date.now()` against the event's **start** time.
 * So an all-day seminar flipped to "Past Event / Contact Us" at 9am, while it was
 * still running — and there was no way for an editor to keep registrations open
 * for the last hour, or to close them a few days early.
 *
 *   isPast            — from `date`, compared start-of-day.
 *                       Drives the status badge, the "Event Recap" heading and the
 *                       upcoming/past split in the events listing.
 *
 *   registrationOpen  — from `registrationClosesAt`, falling back to the event's
 *                       start when that is empty (which is exactly the old
 *                       behaviour, so existing events are unaffected).
 *                       Drives the CTA label and style, and nothing else.
 *
 * The two disagree on purpose: an event can be under way, or finished this
 * morning, and still be taking expressions of interest.
 *
 * ── Why start-of-day for `isPast` ───────────────────────────────────────────
 * Because the events listing already worked that way and the detail page did not,
 * so the same event read "Upcoming" on the listing and "Past Event" on its own
 * page for most of the day it was held. Start-of-day is the more sensible reading
 * and it is now the only one.
 *
 * ── Why `now` is a parameter ────────────────────────────────────────────────
 * Two reasons, both load-bearing:
 *
 *  1. It makes this testable without mocking the clock — see
 *     tests/int/eventTiming.int.spec.ts.
 *  2. The events listing is a statically-rendered page, so it must decide
 *     upcoming-vs-past against the *browser's* clock after mount, not against a
 *     "today" baked in at build time. It passes its own `now`; the server-rendered
 *     detail page takes the default.
 *
 * Keeping `Date.now()` here rather than in a component body is also what makes
 * the detail page pass `react-hooks/purity` honestly, instead of suppressing it.
 */

export type EventTiming = {
  /** The event's day has passed. Badge, recap heading, listing bucket. */
  isPast: boolean
  /** Registrations / expressions of interest are still being accepted. CTA only. */
  registrationOpen: boolean
}

export type EventDateInput = { date?: string | null }
export type EventTimingInput = EventDateInput & { registrationClosesAt?: string | null }

/** Local midnight (ms) for a given instant. */
export const startOfDay = (ms: number): number => {
  const d = new Date(ms)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

const timeOf = (value?: string | null): number | null => {
  if (!value) return null
  const t = new Date(value).getTime()
  return Number.isNaN(t) ? null : t
}

/**
 * Has the event's day passed? Needs only `date`.
 *
 * Exported separately, and used by the events listing, so that a caller holding a
 * partial event cannot accidentally ask a question it has no data for. The
 * listing's `EventItem` does not carry `registrationClosesAt`; when it called the
 * combined `eventTiming()` below, TypeScript accepted it — every field was
 * optional — and a `registrationOpen` derived from a field that was never passed
 * sat there waiting for someone to read it. Narrow inputs, narrow answers.
 */
export const isEventPast = (event: EventDateInput, now: number = Date.now()): boolean => {
  const start = timeOf(event.date)
  if (start === null) return false
  return startOfDay(start) < startOfDay(now)
}

export const eventTiming = (
  event: EventTimingInput,
  now: number = Date.now(),
): EventTiming => {
  const start = timeOf(event.date)

  // An event with no usable date is treated as upcoming and open, matching the
  // listing's existing behaviour (`Number.isNaN(t) || t >= now` → upcoming). An
  // undated event is a half-finished draft, not a finished event, and showing it
  // as "Past" would be a confident wrong answer.
  if (start === null) return { isPast: false, registrationOpen: true }

  const isPast = isEventPast(event, now)

  // Falls back to the event start, which is what the old single-boolean logic
  // did — so leaving the field empty preserves today's behaviour exactly.
  const closesAt = timeOf(event.registrationClosesAt) ?? start

  return { isPast, registrationOpen: now < closesAt }
}
