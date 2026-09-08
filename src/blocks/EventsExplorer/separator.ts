import { cn } from '@/utilities/ui'
import { bgClasses, type SectionBackground } from '@/components/Section'

/**
 * How the Upcoming and Past groups are told apart. Both fields default to their
 * "off" value, so a block that has never been touched renders as it always did.
 */
export type EventsExplorerSeparator = {
  divider?: ('none' | 'line' | 'dots' | 'gradient') | null
  dividerWidth?: ('full' | 'narrow') | null
  pastBackground?: string | null
}

/**
 * The class the Past group takes when the editor gives it a band, or undefined.
 *
 * ── Why this is its own module ──
 * Both the client (which renders the group) and the server component (which has
 * to zero the Section's bottom padding so the band reaches the footer) need the
 * SAME answer. Two copies of the condition would be free to disagree, and the
 * visible failure is a stripe of white between the band and the footer — the bug
 * this was extracted to fix.
 *
 * It cannot live in `EventsExplorerClient.tsx`: every export of a `'use client'`
 * module becomes a client reference, so the server component calling it throws
 * *"Attempted to call pastBandClass() from the server but pastBandClass is on the
 * client"* and 500s the page. A plain module with no directive is importable by
 * both — the same shape as the `query.ts` files beside the other blocks.
 */
export const pastBandClass = (
  mode: 'all' | 'upcoming-only' | 'past-only',
  separator?: EventsExplorerSeparator | null,
): string | undefined =>
  // Only in `all` mode: with one group there is no "past group" to band, and the
  // admin hides the field there.
  mode === 'all' && separator?.pastBackground && separator.pastBackground !== 'default'
    ? cn('events-explorer-group--band', bgClasses[separator.pastBackground as SectionBackground])
    : undefined
