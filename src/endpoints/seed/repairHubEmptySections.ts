import { seedUpdate } from './seedWrite'
import type { Payload, PayloadRequest } from 'payload'

type Ctx = { payload: Payload; req: PayloadRequest }

/**
 * Turns on "Hide this section when it has nothing to show" for the eight
 * data-driven sections on /in-the-loop.
 *
 * ── Why a repair, and not a field default ──
 * `hideWhenEmpty` defaults to `false` deliberately, so adding it to ArchiveBlock,
 * FeaturedArticles and ResourcesGrid moves nothing on any page that already
 * exists — /events, /upcoming-events, /past-events and every services page carry
 * one of those blocks and must keep rendering exactly as they do. The sections
 * that are meant to stand down are switched on here instead, as data.
 *
 * And it has to be a repair rather than a fixture edit: `authorPage` early-returns
 * on an authored page, so `seedHubs`'s fixture reaches a virgin database and
 * nothing else. Every existing install — the box included — would keep eight tabs
 * over four empty bands.
 *
 * ── The predicate ──
 * Pinned to one page (slug `in-the-loop`) and to blocks carrying one of the eight
 * anchor ids its sticky Section Nav links to. It fires only while `hideWhenEmpty`
 * is falsy, so it writes into an absence and then stops matching.
 *
 * `hideWhenEmpty` carries a `defaultValue`, which CLAUDE.md warns cannot by itself
 * tell "never set" from "an editor chose it" — a new column with a default is
 * backfilled into every existing row. What makes that acceptable here is the same
 * contract every other repair in this directory has: the value written is the one
 * the design asks for, and an editor who unticks a box gets it re-ticked only by
 * running the seed again.
 *
 * Note this repair is about the CONTROL, not about today's content. A section
 * that is empty this morning and has three articles this afternoon comes back on
 * its own; nothing here is pinned to which streams happen to be empty.
 */

// The anchors of the eight sections the sticky nav on /in-the-loop links to.
// Kept as anchors rather than block types because two different block types
// (archive, featuredArticles, resourcesGrid) sit behind them, and because these
// are exactly the ids whose tabs the nav is deciding.
const PAGE_SLUG = 'in-the-loop'
const ANCHORS = new Set([
  'featured',
  'news',
  'events',
  'insights',
  'spotlights',
  'resources',
  'qa-insights',
  'staff-narratives',
])

const HIDEABLE = new Set(['archive', 'featuredArticles', 'resourcesGrid'])

type Block = {
  blockType?: string
  anchorId?: string | null
  hideWhenEmpty?: boolean | null
  content?: Block[]
  columns?: { content?: Block[] }[]
}

const isTarget = (b: Block): boolean =>
  Boolean(b?.blockType && HIDEABLE.has(b.blockType) && b.anchorId && ANCHORS.has(b.anchorId))

/** True when any block anywhere in the tree satisfies `pred`. */
const someBlock = (blocks: Block[], pred: (b: Block) => boolean): boolean =>
  blocks.some(
    (b) =>
      pred(b) ||
      (Array.isArray(b.content) && someBlock(b.content, pred)) ||
      (Array.isArray(b.columns) &&
        b.columns.some((c) => Array.isArray(c?.content) && someBlock(c.content, pred))),
  )

/** Rebuilds a block list, applying `fn` at every depth. */
const mapBlocks = (blocks: Block[], fn: (b: Block) => Block): Block[] =>
  blocks.map((block) => {
    let next = block
    if (Array.isArray(next.content)) next = { ...next, content: mapBlocks(next.content, fn) }
    if (Array.isArray(next.columns)) {
      next = {
        ...next,
        columns: next.columns.map((c) =>
          Array.isArray(c?.content) ? { ...c, content: mapBlocks(c.content, fn) } : c,
        ),
      }
    }
    return fn(next)
  })

export const repairHubEmptySections = async ({ payload, req }: Ctx): Promise<void> => {
  const found = await payload.find({
    collection: 'pages',
    where: { slug: { equals: PAGE_SLUG } },
    limit: 1,
    depth: 0,
    req,
  })
  const page = found.docs[0] as unknown as { id: number | string; layout?: Block[] } | undefined
  if (!page || !Array.isArray(page.layout)) return

  // Walks the tree rather than the top level only — an editor can move one of
  // these sections inside a Section container without the anchor changing.
  const needsRepair = someBlock(page.layout, (b) => isTarget(b) && !b.hideWhenEmpty)
  if (!needsRepair) return

  let switchedOn = 0
  const next = mapBlocks(page.layout, (b) => {
    if (!isTarget(b) || b.hideWhenEmpty) return b
    switchedOn += 1
    return { ...b, hideWhenEmpty: true }
  })

  await seedUpdate(payload, {
    collection: 'pages',
    id: page.id,
    data: { layout: next } as never,
    req,
    context: { disableRevalidate: true },
  })
  payload.logger.info(
    `— In the Loop: ${switchedOn} section(s) set to hide themselves (and their tab) when empty`,
  )
}
