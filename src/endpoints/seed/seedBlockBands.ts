import { seedUpdate } from './seedWrite'
import type { Payload, PayloadRequest } from 'payload'

type Ctx = { payload: Payload; req: PayloadRequest }

/**
 * Band corrections for blocks on authored pages.
 *
 * Why this exists rather than a seed edit: the page seeds early-return on a page
 * that already has content (`authorPage` in seedAbout.ts logs "already authored,
 * skipping"), so changing a value in the seed only ever reaches a virgin
 * database. That is the trap that left 30 links on legacy paths across every
 * existing install — including the box — long after the seed had been corrected.
 *
 * Same shape as `repairServiceLinks` and `repairLinkTargets`: a table, an
 * unconditional pass, and a write only when the stored value actually differs.
 */

type BandFix = {
  /** Page slug (the leaf, as stored on the page). */
  page: string
  /** Which block on that page to patch. */
  blockType: string
  /** Field → intended value. */
  set: Record<string, string>
  /** Why, so the next person does not "tidy" it back. */
  reason: string
}

export const BLOCK_BAND_FIXES: BandFix[] = [
  {
    page: 'meet-the-team',
    blockType: 'peopleGrid',
    set: { headerBackground: 'accent' },
    reason:
      'The reference splits this into `.team-intro` (light blue) over `.team-grid-section` (grey). ' +
      'The block keeps background: muted for the photo grid and puts its heading on its own accent band.',
  },
  {
    page: 'about',
    blockType: 'missionPillars',
    set: { background: 'hero' },
    reason:
      'The panel used to get its hero gradient from a page-scoped `.mv-mission-panel` rule, which ' +
      'silently beat whatever band an editor picked — the control looked live and was not. That ' +
      'declaration is gone and the gradient is now the `hero` band option, so the block paints ' +
      'itself. Existing documents store `dark` from the old default and would render flat charcoal ' +
      'without this; a changed defaultValue never moves a document that already exists.',
  },
]

export const repairBlockBands = async ({ payload, req }: Ctx): Promise<void> => {
  let changed = 0
  let pagesTouched = 0

  for (const fix of BLOCK_BAND_FIXES) {
    const res = await payload.find({
      collection: 'pages',
      where: { slug: { equals: fix.page } },
      limit: 1,
      depth: 0,
      req,
    })
    const page = res.docs[0] as { id: number | string; layout?: unknown[] } | undefined
    if (!page || !Array.isArray(page.layout)) continue

    let touched = false
    const layout = page.layout.map((block) => {
      const b = block as Record<string, unknown>
      if (b?.blockType !== fix.blockType) return block
      const next = { ...b }
      for (const [key, value] of Object.entries(fix.set)) {
        if (next[key] === value) continue
        next[key] = value
        touched = true
        changed++
      }
      return next
    })

    if (!touched) continue

    await seedUpdate(payload, {
      collection: 'pages',
      id: page.id,
      data: { layout } as never,
      req,
      context: { disableRevalidate: true },
    })
    pagesTouched++
  }

  payload.logger.info(`— Repaired block bands (${changed} changes across ${pagesTouched} pages)`)
}
