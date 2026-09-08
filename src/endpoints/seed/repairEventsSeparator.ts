import { seedUpdate } from './seedWrite'
import type { Payload, PayloadRequest } from 'payload'

type Ctx = { payload: Payload; req: PayloadRequest }

/**
 * Separates the Upcoming and Past groups on /events with a band behind Past.
 *
 * ── Why a repair, and not a field default ──
 * Both separator fields default to their "off" value deliberately, so adding the
 * three new Events Explorer fields moves nothing on any page that already exists — proven
 * with `computedSnapshot.mjs` before this ran: 0 changed nodes across all 18
 * routes, `/events` and both child listings included. The one block that is meant
 * to draw a rule is switched on here instead, as data.
 *
 * And it has to be a repair rather than a fixture edit: `authorPage` early-returns
 * on an authored page, so `seedEventsHub`'s fixture reaches a virgin database and
 * nothing else. Every existing install — the box included — would keep the two
 * groups running together. That failure has happened twice on
 * /specialists/join-expert-panel alone; see CLAUDE.md.
 *
 * ── The predicate ──
 * Pinned to one page (slug `events`) and to an `eventsExplorer` in `all` mode —
 * the only mode where both groups render and a separator means anything. It fires
 * only while `pastBackground` is unset or `default`, so it writes into an absence
 * and then stops matching.
 *
 * `pastBackground` carries a `defaultValue`, which CLAUDE.md warns cannot by itself tell
 * "never set" from "an editor chose it": measured after the columns were added and
 * before this ran, all three blocks already read `none`/`default`, because the
 * adapter emits `ADD COLUMN … DEFAULT` and Postgres backfills every existing row.
 * What makes it safe is the same contract every other repair here has — the value
 * written is the one that was asked for, and an editor who sets it back to None
 * gets it redrawn only if the seed is run again.
 *
 * ── What is deliberately NOT set, and why this changed ──
 * `separator.divider` is left at `none`. The first version of this repair drew a
 * rule, which is what was originally asked for; the band was then chosen in the
 * admin instead, and this now reproduces THAT. It matters because the box is a
 * fresh install: whatever this repair writes is what ships, so a repair still
 * drawing the rule would hand the box a look that had been turned off — and the
 * chosen one would exist only in the local database. Turning on both would be
 * choosing a third look nobody picked. See README.md > Deliberate departures.
 */

const PAGE_SLUG = 'events'

const BAND = 'accent'

type Block = {
  blockType?: string
  mode?: string | null
  separator?: { divider?: string | null; pastBackground?: string | null } | null
  content?: Block[]
  columns?: unknown
}

const isTarget = (b: Block): boolean =>
  b?.blockType === 'eventsExplorer' && (b?.mode ?? 'all') === 'all'

const needsBand = (b: Block): boolean =>
  isTarget(b) && (!b.separator?.pastBackground || b.separator.pastBackground === 'default')

/** True when any block anywhere in the tree satisfies `pred`. */
const someBlock = (blocks: Block[], pred: (b: Block) => boolean): boolean =>
  blocks.some(
    (b) =>
      pred(b) ||
      (Array.isArray(b.content) && someBlock(b.content, pred)) ||
      // Guarded because `columns` is the Row block's column array on some blocks
      // and a "how many per row" select holding a string on others.
      (Array.isArray(b.columns) &&
        (b.columns as { content?: Block[] }[]).some(
          (c) => Array.isArray(c?.content) && someBlock(c.content, pred),
        )),
  )

/** Rebuilds a block list, applying `fn` at every depth. */
const mapBlocks = (blocks: Block[], fn: (b: Block) => Block): Block[] =>
  blocks.map((block) => {
    let next = block
    if (Array.isArray(next.content)) next = { ...next, content: mapBlocks(next.content, fn) }
    if (Array.isArray(next.columns)) {
      next = {
        ...next,
        columns: (next.columns as { content?: Block[] }[]).map((c) =>
          Array.isArray(c?.content) ? { ...c, content: mapBlocks(c.content, fn) } : c,
        ),
      }
    }
    return fn(next)
  })

export const repairEventsSeparator = async ({ payload, req }: Ctx): Promise<void> => {
  const found = await payload.find({
    collection: 'pages',
    where: { slug: { equals: PAGE_SLUG } },
    limit: 1,
    depth: 0,
    req,
  })
  const page = found.docs[0] as unknown as { id: number | string; layout?: Block[] } | undefined
  if (!page || !Array.isArray(page.layout)) return

  if (!someBlock(page.layout, needsBand)) return

  const next = mapBlocks(page.layout, (b) =>
    needsBand(b)
      ? ({ ...b, separator: { ...(b.separator ?? {}), pastBackground: BAND } } as Block)
      : b,
  )

  await seedUpdate(payload, {
    collection: 'pages',
    id: page.id,
    data: { layout: next } as never,
    req,
    context: { disableRevalidate: true },
  })
  payload.logger.info('— /events: Past events given their own band, separating them from Upcoming')
}
