import { seedUpdate } from './seedWrite'
import type { Payload, PayloadRequest } from 'payload'

type Ctx = { payload: Payload; req: PayloadRequest }

/**
 * Moves the four FAQ accordions onto the design reference's divided variant.
 *
 * The reference draws ONE accordion across three pages — a flat list of
 * hairline-separated rows — and varies only the toggle, the rule colour, the
 * leading icon and the density. Ours drew all four as rounded outlined cards,
 * which was one design decision applied everywhere and wrong everywhere.
 *
 * `authorPage` early-returns on an authored page, so the fixture edits in
 * `seedInfoBooking`/`seedServices` reach no existing install. This runs
 * unconditionally.
 *
 * ── Why the predicate is `itemStyle` being absent ──
 * Every one of the new appearance fields is declared WITHOUT a `defaultValue`,
 * precisely so that this predicate can exist. A field that declares a default
 * cannot be a migration signal: the adapter emits `ADD COLUMN … DEFAULT` and
 * Postgres backfills every existing row, so "never set" becomes indistinguishable
 * from an editor's choice — the trap that left an earlier repair here incapable
 * of ever firing. With no default the column arrives genuinely null.
 *
 * It fires once per page; afterwards `itemStyle` reads `divided`, so an editor
 * who later switches a FAQ back to Card keeps that choice.
 */

// Page slug → the settings that page's FAQ takes. Each of these four pages has
// exactly one FAQ block, and they are now the ONLY FAQ blocks on the site.
//
// This used to add "the Style Guide's is deliberately left on Card so the default
// treatment stays visible somewhere". That page was removed on 2026-08-20, so
// `itemStyle: 'card'` — the field's default — renders on no page at all. That is
// not a fault; a default needs no live instance. It is recorded because the next
// person to change the Card treatment has nowhere on the site to see the effect,
// and must add an FAQ block to a scratch page to check it.
const FAQ_VARIANTS: Record<string, Record<string, unknown>> = {
  'for-clients': {
    itemStyle: 'divided',
    toggleStyle: 'chevron',
    exclusive: false,
  },
  'for-claimants': {
    itemStyle: 'divided',
    toggleStyle: 'chevron',
    exclusive: false,
  },
  ime: {
    itemStyle: 'divided',
    toggleStyle: 'pill',
    iconStyle: 'tile',
    density: 'compact',
    ruleStyle: 'brand',
    containerWidth: 'normal',
  },
  jme: {
    itemStyle: 'divided',
    toggleStyle: 'pill',
    density: 'compact',
    ruleStyle: 'grey',
    // `columns: 'split'` IS the layout the page-scoped `jme-faq-aside` class
    // used to hand-roll, so the class goes and the field does the work.
    columns: 'split',
    cssClass: [],
  },
}

// Section-level corrections, applied to the section that WRAPS the FAQ. The
// reference bands the Claimants FAQ pale blue and the Clients FAQ white, and
// both at 88px — which is exactly what the `normal` padding preset caps at.
const SECTION_FIXES: Record<string, Record<string, unknown>> = {
  'for-clients': { paddingTop: 'normal', paddingBottom: 'normal' },
  'for-claimants': { background: 'light', paddingTop: 'normal', paddingBottom: 'normal' },
}

type Block = {
  blockType?: string
  itemStyle?: string | null
  content?: Block[]
}

export const repairFaqVariants = async ({ payload, req }: Ctx): Promise<void> => {
  for (const [slug, variant] of Object.entries(FAQ_VARIANTS)) {
    const found = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      req,
    })
    const page = found.docs[0] as unknown as
      | { id: number | string; layout?: Block[] }
      | undefined
    const layout = page?.layout
    if (!page || !Array.isArray(layout)) continue

    // A FAQ that has never been given an appearance is the only thing this
    // writes into. `itemStyle` declares no default, so null here means "unset",
    // not "set to the default".
    const hasUnstyledFaq = layout.some(
      (b) =>
        (b?.blockType === 'faq' && !b.itemStyle) ||
        (Array.isArray(b?.content) && b.content.some((i) => i?.blockType === 'faq' && !i.itemStyle)),
    )
    if (!hasUnstyledFaq) continue

    const sectionFix = SECTION_FIXES[slug]
    const next = layout.map((block) => {
      if (block?.blockType === 'faq' && !block.itemStyle) return { ...block, ...variant }
      if (!Array.isArray(block?.content)) return block
      const touchesFaq = block.content.some((i) => i?.blockType === 'faq' && !i.itemStyle)
      if (!touchesFaq) return block
      return {
        ...block,
        ...(sectionFix ?? {}),
        content: block.content.map((inner) =>
          inner?.blockType === 'faq' && !inner.itemStyle ? { ...inner, ...variant } : inner,
        ),
      }
    })

    await seedUpdate(payload, {
      collection: 'pages',
      id: page.id,
      data: { layout: next } as never,
      req,
      context: { disableRevalidate: true },
    })
    payload.logger.info(`— Repaired FAQ appearance on /${slug}`)
  }
}
