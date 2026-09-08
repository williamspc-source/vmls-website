import type { Event, EventType } from '@/payload-types'

/**
 * The label a visitor reads for an Event's type.
 *
 * ── What this used to be ──
 * A hardcoded `Record<slug, label>` mirroring the `eventType` select's eleven
 * options, with a header comment telling the reader to keep the two in step by
 * hand. Before that there were three byte-identical copies of the same map. The
 * type is now the `event-types` collection, so the label lives on the row and
 * there is nothing left to keep in step.
 *
 * ── Why a helper at all ──
 * `eventType` is a relationship, so it arrives as a populated object at depth
 * >= 1 and as a bare id when something forgot to populate it. Reading `.title`
 * inline at four call sites would mean four different guesses about that. This
 * returns the title when it has one, and an empty string when it does not —
 * never the id, and never `[object Object]`, both of which have shipped here as
 * visible text before.
 */
export const eventTypeLabel = (value?: Event['eventType'] | null): string => {
  if (!value || typeof value !== 'object') return ''
  return (value as EventType).title ?? ''
}
