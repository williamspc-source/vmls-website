import { seedUpdate } from './seedWrite'
import type { Payload, PayloadRequest } from 'payload'

type Ctx = { payload: Payload; req: PayloadRequest }

/**
 * Switches the "Why Join VERIFY" cards on /specialists/join-expert-panel to the
 * Feature Grid's `benefit` card style.
 *
 * ── What was wrong ──
 * The reference's benefit cards are centred, carry a large plain primary icon
 * with no tile, and justify their body copy. That was ported as a page-scoped
 * `cssClass: 'vf-join-benefits'` — and the class never reached the database,
 * because `authorPage` early-returns on an authored page and no repair existed.
 * Measured before this fix: `pages_texts` held 65 cssClass rows sitewide and
 * ZERO for this page, the served markup was a bare `class="service-card vf-card"`,
 * and ~50 lines of correct CSS rendered nothing while the page shipped with an
 * icon tile, left-aligned text and the neo-brutalist diagonal hover.
 *
 * This is the SECOND time on this exact page: the "Express Your Interest" band
 * failed the same way through four `.vf-join-eoi*` classes. Both are now block
 * fields, which travel with the block and are visible in the admin.
 *
 * ── Why a repair, and not just the fixture ──
 * Editing `seedSpecialists.ts` alone reaches a virgin database and nothing else.
 * Every existing install — the box included — would keep the old cards.
 *
 * ── The predicate, honestly stated ──
 * `cardStyle` has a `defaultValue` of 'card', so 'card' CANNOT by itself
 * distinguish "never set" from "an editor chose it" — the same trap recorded in
 * CLAUDE.md about using a defaulted field as a migration signal. What makes this
 * safe is not the value but the pinning: one page (slug `join-expert-panel`), one
 * block (the Feature Grid whose eyebrow is "Why Join VERIFY"). The residual risk
 * is that an editor deliberately chose 'card' for that one block — and 'card' on
 * that block is precisely the fault being reported, so there is nothing to
 * preserve. Once it is 'benefit' this stops matching and cannot fire again.
 */

const EYEBROW = 'Why Join VERIFY'

type Block = {
  blockType?: string
  eyebrow?: string | null
  cardStyle?: string | null
  headingWeight?: string | null
  content?: Block[]
  columns?: { content?: Block[] }[]
}

/** The one Feature Grid this repair is allowed to touch. */
const isBenefitGrid = (b: Block): boolean =>
  b?.blockType === 'featureGrid' && b?.eyebrow === EYEBROW

/**
 * The intro Split Feature above it. The reference gives BOTH headings on this
 * page an 800 weight — it is the only one of the reference's 108 pages to do so —
 * which is why that is a block field rather than a change to `.section-title`.
 */
const isIntroSplit = (b: Block): boolean => b?.blockType === 'splitFeature'

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

export const repairJoinBenefits = async ({ payload, req }: Ctx): Promise<void> => {
  const found = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'join-expert-panel' } },
    limit: 1,
    depth: 0,
    req,
  })
  const page = found.docs[0] as unknown as { id: number | string; layout?: Block[] } | undefined

  if (!page || !Array.isArray(page.layout)) return

  // The grid is nested inside a Section block (which carries the #panel-benefits
  // anchor), so this has to walk the tree rather than scan the top level.
  const needsRepair = someBlock(
    page.layout,
    (b) =>
      (isBenefitGrid(b) && (b.cardStyle !== 'benefit' || b.headingWeight !== 'heavy')) ||
      (isIntroSplit(b) && b.headingWeight !== 'heavy'),
  )
  if (!needsRepair) return

  const next = mapBlocks(page.layout, (b) => {
    if (isBenefitGrid(b)) {
      // `cssClass` is cleared alongside: the class it named no longer exists in
      // globals.css, and leaving a dangling value would look like a live hook to
      // the next person who reads the block.
      return { ...b, cardStyle: 'benefit', headingWeight: 'heavy', cssClass: [] } as Block
    }
    if (isIntroSplit(b)) return { ...b, headingWeight: 'heavy' } as Block
    return b
  })

  await seedUpdate(payload, {
    collection: 'pages',
    id: page.id,
    data: { layout: next } as never,
    req,
    context: { disableRevalidate: true },
  })
  payload.logger.info(
    '— Set "Why Join VERIFY" cards to the benefit card style, and both headings to heavy',
  )
}
