import { seedUpdate } from './seedWrite'
import { storedText } from './repairMatch'
import type { Payload, PayloadRequest } from 'payload'

type Ctx = { payload: Payload; req: PayloadRequest }

/**
 * Converts event time ranges from an en dash to the plain hyphen the design
 * reference uses: "12:00 pm – 1:00 pm" → "12:00 pm - 1:00 pm".
 *
 * ── Why a repair, and not just the fixture ──
 * `timeLabel` is content. Editing `seed/data/events.ts` alone reaches a virgin
 * database and nothing else; every existing install keeps the en dash.
 *
 * ── The predicate ──
 * Keyed on the superseded value itself — a `timeLabel` still containing an en
 * dash. That is a genuine absence of the new value rather than a defaulted
 * field, so it fires once and then stops matching. It also cannot damage an
 * editor's own wording: only the dash character is replaced, the rest of the
 * string is left exactly as written, and a label that never had an en dash is
 * never touched.
 */

const EN_DASH = '–'

export const repairEventTimeDash = async ({ payload, req }: Ctx): Promise<void> => {
  const found = await payload.find({
    collection: 'events',
    // No `where`. `timeLabel` is rich text, so a `contains` filter is emitted as
    // ILIKE against a jsonb column and Postgres rejects it at PLAN time —
    // `operator does not exist: jsonb ~~* unknown` — whether or not any row
    // matches. That killed a fresh seed on the box while every test stayed green,
    // because nothing in `tests/` runs the seed. Events is a 13-row collection,
    // so filtering in JS is both correct and cheaper than the jsonb path
    // expression it would take to match inside a Lexical tree.
    limit: 500,
    depth: 0,
    req,
  })

  let converted = 0

  for (const doc of found.docs as unknown as Array<{ id: number | string; timeLabel?: unknown }>) {
    // `storedText` reads a string OR a Lexical tree. The previous
    // `typeof doc.timeLabel !== 'string'` guard skipped EVERY document once the
    // field was converted, so this repair was already a no-op — and it logged
    // `docs.length` as its success count, reporting work it had not done. Fixing
    // only the query above would have left that intact.
    //
    // Note `storedText` flattens: it strips [[accent]] brackets and collapses
    // whitespace, so writing its output back is lossy in principle. For a value
    // like "8:00 am – 9:00 am" neither can do harm, which is why it is safe here.
    // Do not copy this into a repair for a PROSE field — there it would silently
    // discard formatting, and the tree has to be walked instead.
    const current = storedText(doc.timeLabel)
    if (!current.includes(EN_DASH)) continue

    await seedUpdate(payload, {
      collection: 'events',
      id: doc.id,
      // A plain string on purpose: `seedUpdate` lifts it into Lexical through the
      // sanitised config, which is also what knows this field sits inside a row.
      data: { timeLabel: current.split(EN_DASH).join('-') } as never,
      req,
      context: { disableRevalidate: true },
    })
    converted += 1
  }

  // What was changed, not what was fetched.
  if (converted > 0) {
    payload.logger.info(`— Event time ranges converted to a plain hyphen: ${converted}`)
  }
}
