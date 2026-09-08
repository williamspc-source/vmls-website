import { seedUpdate } from './seedWrite'
import type { Payload, PayloadRequest } from 'payload'

type Ctx = { payload: Payload; req: PayloadRequest }

/**
 * Moves the enquiry sections onto the new block settings, and fills in the
 * design reference's input placeholders.
 *
 * ── Why this is needed at all ──
 * `/specialists/join-expert-panel` had a complete, correct port of its enquiry
 * section sitting in globals.css — the 1fr 1.5fr grid, the left-aligned intro,
 * blue contact links, the form promoted to a card so its heading sits inside.
 * None of it rendered, because every rule hung off a `cssClass` value that only
 * ever existed in the seed fixture: `authorPage` early-returns on an authored
 * page, so the class never reached the database and the CSS matched nothing.
 * Measured before this repair: zero `cssClass` rows for that page.
 *
 * That is why the fixture now uses real block fields (`columnRatio`,
 * `headingAlign`, `cardStyle`) instead. A field travels with the block; a
 * page-scoped class is stored data that can silently go missing.
 *
 * ── Predicates ──
 * Both halves write only into a genuine absence, and neither can fire twice:
 *  · Layout — `cardStyle` unset on the form block. The three new selects declare
 *    NO `defaultValue`, so the column really is null rather than backfilled;
 *    confirmed in the schema (`card_style` has an empty Default, unlike
 *    `columns`, which shows `'1'`).
 *  · Placeholders — the field's `placeholder` is empty. An editor's own wording
 *    is never overwritten.
 */

// Page slug → the settings its enquiry blocks take.
const LAYOUTS: Record<
  string,
  { columnRatio?: string; gap?: string; headingAlign?: string; cardStyle: string }
> = {
  'join-expert-panel': { columnRatio: '2-3', gap: 'x-wide', headingAlign: 'left', cardStyle: 'card' },
  contact: { cardStyle: 'card' },
  home: { cardStyle: 'card' },
}

// Form title → field name → placeholder. Taken verbatim from the reference:
// three literal periods, not an ellipsis character.
const PLACEHOLDERS: Record<string, Record<string, string>> = {
  Contact: {
    firstName: 'First name',
    lastName: 'Last name',
    email: 'you@company.com',
    phone: '07 XXXX XXXX',
    company: 'Your firm or company',
    message: 'Please provide details of your enquiry...',
  },
  Enquiry: {
    first_name: 'First name',
    last_name: 'Last name',
    email: 'you@company.com',
    phone: '07 XXXX XXXX',
    company: 'Your firm or company',
    message: 'Please provide details of your enquiry...',
  },
  'Expression of Interest': {
    firstName: 'First name',
    lastName: 'Last name',
    email: 'you@practice.com.au',
    phone: '07 XXXX XXXX',
    specialty: 'e.g. Orthopaedic Surgery, Psychiatry',
    message: 'Tell us about your medico-legal experience and areas of interest...',
  },
}

type Block = {
  blockType?: string
  cardStyle?: string | null
  columnRatio?: string | null
  gap?: string | null
  headingAlign?: string | null
  cssClass?: string[] | string | null
  content?: Block[]
  columns?: { content?: Block[] }[]
}

/** Walks a layout tree, applying `fn` to every block. */
const mapBlocks = (blocks: Block[], fn: (b: Block) => Block): Block[] =>
  blocks.map((block) => {
    let next = fn(block)
    if (Array.isArray(next.content)) next = { ...next, content: mapBlocks(next.content, fn) }
    if (Array.isArray(next.columns)) {
      next = {
        ...next,
        columns: next.columns.map((c) =>
          Array.isArray(c?.content) ? { ...c, content: mapBlocks(c.content, fn) } : c,
        ),
      }
    }
    return next
  })

const someBlock = (blocks: Block[], pred: (b: Block) => boolean): boolean =>
  blocks.some(
    (b) =>
      pred(b) ||
      (Array.isArray(b.content) && someBlock(b.content, pred)) ||
      (Array.isArray(b.columns) &&
        b.columns.some((c) => Array.isArray(c?.content) && someBlock(c.content, pred))),
  )

export const repairEnquiryLayout = async ({ payload, req }: Ctx): Promise<void> => {
  for (const [slug, settings] of Object.entries(LAYOUTS)) {
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
    if (!someBlock(layout, (b) => b?.blockType === 'formBlock' && !b.cardStyle)) continue

    const next = mapBlocks(layout, (b) => {
      if (b?.blockType === 'formBlock' && !b.cardStyle) {
        // The page-scoped card class is superseded by the field. Keep any OTHER
        // class the block carries — those cover page residuals (the Contact
        // card's centring, the homepage's tighter heading gap).
        return { ...b, cardStyle: settings.cardStyle }
      }
      if (b?.blockType === 'row' && settings.columnRatio && !b.columnRatio) {
        // `gap` carries a defaultValue, so its absence is not a signal — it
        // rides the ratio's, which does not.
        return { ...b, columnRatio: settings.columnRatio, ...(settings.gap ? { gap: settings.gap } : {}) }
      }
      if (b?.blockType === 'iconList' && settings.headingAlign && !b.headingAlign) {
        return { ...b, headingAlign: settings.headingAlign }
      }
      return b
    })

    await seedUpdate(payload, {
      collection: 'pages',
      id: page.id,
      data: { layout: next } as never,
      req,
      context: { disableRevalidate: true },
    })
    payload.logger.info(`— Repaired enquiry layout on /${slug}`)
  }

  // ── Placeholders ──
  for (const [title, byName] of Object.entries(PLACEHOLDERS)) {
    const found = await payload.find({
      collection: 'forms',
      where: { title: { equals: title } },
      limit: 1,
      depth: 0,
      req,
    })
    const form = found.docs[0] as unknown as
      | { id: number | string; fields?: { name?: string; placeholder?: string | null }[] }
      | undefined
    const fields = form?.fields
    if (!form || !Array.isArray(fields)) continue
    if (!fields.some((f) => f?.name && byName[f.name] && !f.placeholder)) continue

    const next = fields.map((f) =>
      f?.name && byName[f.name] && !f.placeholder ? { ...f, placeholder: byName[f.name] } : f,
    )
    await seedUpdate(payload, {
      collection: 'forms',
      id: form.id,
      data: { fields: next } as never,
      req,
      context: { disableRevalidate: true },
    })
    payload.logger.info(`— Repaired placeholders on the "${title}" form`)
  }
}
