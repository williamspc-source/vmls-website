import type { Payload } from 'payload'

import { richTextToPlain } from '@/utilities/lexicalText'

/**
 * Two things every string-keyed repair needs, and neither of which it had.
 *
 * The repairs under `src/endpoints/seed/` correct stored content by matching a
 * literal against a value in the database — a block's heading, a hero subtitle,
 * an appointment type's label. That is the only way to reach an already-authored
 * page, because `authorPage` early-returns on one. It is also the largest silent
 * failure surface in the repo: when a literal stops matching, nothing throws.
 * The repair reports success, having changed nothing.
 *
 * ## `storedText` — read the copy, whatever shape it is in
 *
 * Copy fields are becoming rich text, so a value that was `'Four Services.'` is
 * now a Lexical tree. `heading === 'Four Services.'` is then false forever, and
 * the anchor id it was supposed to set never arrives — the "an in-page anchor is
 * two halves" fault, arriving by a new route. Every comparison against stored
 * copy goes through here so there is one place that understands both shapes.
 *
 * ## `matchTracker` — notice when a key stops matching
 *
 * Applied only to tables whose key is a value that **must still be there**. Those
 * are the ones where zero matches means drift.
 *
 * It is deliberately *not* applied to supersession tables (`LEGACY_PATHS`,
 * `SUPERSEDED_*`, `HERO_SUBTITLE_FIXES`), whose keys are the *old* wording. Those
 * are meant to stop matching: once the content is repaired the stale value is
 * gone, and zero matches is the healthy steady state. Wiring a zero-match alarm
 * to them would cry wolf on every clean run, which is how an alarm gets ignored.
 */

/**
 * The words of a stored copy value, for comparison against a literal.
 *
 * A thin, named wrapper over `richTextToPlain` on purpose: the name is what makes
 * a call site legible as "this is a comparison against stored copy", and it gives
 * one grep to find every such comparison. Accent brackets are stripped, so the
 * table's literals should be written **without** them.
 */
export const storedText = (value: unknown): string => richTextToPlain(value)

export type MatchTracker = {
  /** Record that `key` matched something in the database. */
  hit: (key: string) => void
  /** Report keys that matched nothing. Throws outside production. */
  report: (payload: Payload) => void
}

/**
 * Track which of a table's keys actually matched.
 *
 * `report` logs at **error**, not warn: this repo's rule is that nothing fails
 * silently, and a repair that matched nothing is indistinguishable from a repair
 * that had nothing to do. Outside production it also throws, so a seed run in
 * development or CI goes red rather than printing into a log nobody reads. In
 * production it logs and continues — a stale anchor is not worth refusing to
 * finish a deploy over.
 */
export const matchTracker = (table: string, keys: string[]): MatchTracker => {
  const seen = new Set<string>()
  return {
    hit: (key) => {
      seen.add(key)
    },
    report: (payload) => {
      const missed = keys.filter((k) => !seen.has(k))
      if (missed.length === 0) return
      const message =
        `${table}: ${missed.length} of ${keys.length} entries matched nothing — ` +
        `the content they key on has been reworded, moved or converted, so this repair ` +
        `silently did nothing for: ${missed.map((m) => `"${m}"`).join(', ')}`
      payload.logger.error(`— ${message}`)
      if (process.env.NODE_ENV !== 'production') throw new Error(message)
    },
  }
}
