import { seedUpdate } from './seedWrite'
import type { Payload, PayloadRequest } from 'payload'

type Ctx = { payload: Payload; req: PayloadRequest }

/**
 * Turns on the left-column image placeholder in "Your Examination Step by Step"
 * on /information-centre/for-claimants.
 *
 * ── Why a repair, and not a field default ──
 * `imagePlaceholder` defaults to `false` deliberately, so that adding the four
 * new Process Steps fields moves nothing on any page that already exists —
 * proven with `computedSnapshot.mjs` before this ran. The one block that is meant
 * to show the tile is switched on here instead, as data.
 *
 * And it has to be a repair rather than a fixture edit: `authorPage` early-returns
 * on an authored page, so `seedInfoCentre`'s fixture reaches a virgin database and
 * nothing else. Every existing install — the box included — would keep the old
 * section. That failure has happened twice on /specialists/join-expert-panel
 * alone; see CLAUDE.md.
 *
 * ── The predicate ──
 * Pinned to one page (slug `for-claimants`) and one block (a `processSteps` whose
 * `variant` is `claimant` — measured as the only such block on the site), and it
 * fires only while `imagePlaceholder` is falsy. `imagePlaceholder` carries a
 * `defaultValue`, which CLAUDE.md warns cannot by itself distinguish "never set"
 * from "an editor chose it" — a new column with a default is backfilled into every
 * existing row. What makes this safe is that the value it writes is the one the
 * design asks for, and once written the repair stops matching. An editor who later
 * unticks the box gets it re-ticked only if the seed is run again, which is the
 * same contract every other repair here has.
 *
 * A photo uploaded into `image` replaces the placeholder outright in the
 * component, so this never fights a real photograph.
 */

const PAGE_SLUG = 'for-claimants'
const LABEL = 'IMAGE PLACEHOLDER'

type Block = {
  blockType?: string
  variant?: string | null
  imagePlaceholder?: boolean | null
  placeholderLabel?: string | null
  content?: Block[]
  columns?: { content?: Block[] }[]
}

const isClaimantProcess = (b: Block): boolean =>
  b?.blockType === 'processSteps' && b?.variant === 'claimant'

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

export const repairClaimantProcessImage = async ({ payload, req }: Ctx): Promise<void> => {
  const found = await payload.find({
    collection: 'pages',
    where: { slug: { equals: PAGE_SLUG } },
    limit: 1,
    depth: 0,
    req,
  })
  const page = found.docs[0] as unknown as { id: number | string; layout?: Block[] } | undefined
  if (!page || !Array.isArray(page.layout)) return

  // The block can sit inside a Section, so this walks the tree rather than
  // scanning the top level only.
  const needsRepair = someBlock(
    page.layout,
    (b) => isClaimantProcess(b) && !b.imagePlaceholder,
  )
  if (!needsRepair) return

  const next = mapBlocks(page.layout, (b) =>
    isClaimantProcess(b)
      ? ({ ...b, imagePlaceholder: true, placeholderLabel: b.placeholderLabel || LABEL } as Block)
      : b,
  )

  await seedUpdate(payload, {
    collection: 'pages',
    id: page.id,
    data: { layout: next } as never,
    req,
    context: { disableRevalidate: true },
  })
  payload.logger.info(
    '— Claimant process section: image placeholder switched on, awaiting a photograph',
  )
}
