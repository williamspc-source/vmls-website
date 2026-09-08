import { seedUpdate } from './seedWrite'
import type { Payload, PayloadRequest } from 'payload'
import path from 'path'

import { getOrCreateMedia } from './media'
import { storedText } from './repairMatch'

type Ctx = { payload: Payload; req: PayloadRequest }

/**
 * Puts the supplied page photographs into their placeholders.
 *
 * ── Why a repair ──
 * These are page *content*, and page content lives in the database. Editing a
 * seed fixture reaches a virgin install and nothing else, because `authorPage`
 * early-returns on an authored page — the trap recorded in CLAUDE.md and hit
 * twice on /specialists/join-expert-panel alone. A repair reaches every install.
 *
 * It is also the mechanism `README.md` > Known issues describes: before
 * this, filling a placeholder meant uploading in the admin, which a rebuilt
 * database silently loses.
 *
 * ── The predicate ──
 * Each entry writes only into an absence: if the target field already holds an
 * image, it is left alone, so an editor who swaps a photo keeps their choice and
 * a second seed run does nothing. Uploads are deduped by `alt` in
 * `getOrCreateMedia`, so re-running cannot create a second copy of a file.
 *
 * ── Scope, stated plainly ──
 * The site has 20 image placeholders. This fills EIGHT. The other twelve are
 * waiting on photography and stay as pale-blue tiles, which is their designed
 * empty state — `README.md` > Known issues lists them and what closing each costs.
 */

type Target = {
  file: string
  /** Page slug. */
  page: string
  blockType: 'splitFeature' | 'whyVerify' | 'leadershipSpotlight' | 'processSteps'
  /** For Split Features, a substring of the row title that identifies the row. */
  rowMatch?: string
  /** The upload field on the block (or on the row, for a Split Feature). */
  field: 'image' | 'photo'
  alt: string
}

const TARGETS: Target[] = [
  {
    file: 'about-verify.jpg',
    page: 'about',
    blockType: 'splitFeature',
    rowMatch: 'Trust & Precision',
    field: 'image',
    alt: 'The VERIFY Medico-Legal Solutions team at work',
  },
  {
    file: 'our-vision.jpg',
    page: 'about',
    blockType: 'splitFeature',
    rowMatch: 'Medico-Legal Reporting Company',
    field: 'image',
    alt: 'VERIFY’s Brisbane office',
  },
  {
    file: 'why-choose-verify.jpg',
    page: 'about',
    blockType: 'whyVerify',
    field: 'image',
    alt: 'VERIFY staff reviewing a medico-legal report',
  },
  {
    file: 'wes-founder.jpg',
    page: 'about',
    blockType: 'leadershipSpotlight',
    field: 'photo',
    alt: 'Wes Lerch, Founder and Managing Director of VERIFY Medico-Legal Solutions',
  },
  {
    file: 'who-we-are.jpg',
    page: 'home',
    blockType: 'splitFeature',
    // Deliberately the full title: a bare 'Medico-Legal' would match any future
    // row on the homepage, and the first match wins.
    //
    // Written WITHOUT the [[accent]] brackets even though the stored title has
    // them — `storedText` strips them, so a literal that keeps them can never
    // match. That is the documented contract in `repairMatch.ts` ("the table's
    // literals should be written without them") and it was missed when this
    // comparison moved from a raw string to `storedText`: the row stopped
    // throwing and started silently not matching, which is how the homepage kept
    // its grey placeholder while the seed reported only a skipped file.
    rowMatch: 'VERIFY Medico-Legal Solutions',
    field: 'image',
    alt: 'The VERIFY team',
  },
  {
    file: 'your-examination-step-by-step.jpg',
    page: 'for-claimants',
    blockType: 'processSteps',
    field: 'image',
    alt: 'VERIFY’s reception, where examinations are attended',
  },
  {
    file: 'info-for-clients.jpg',
    page: 'for-clients',
    blockType: 'splitFeature',
    rowMatch: 'report delivery',
    field: 'image',
    alt: 'VERIFY staff supporting a client referral',
  },
  {
    file: 'administrative-services.jpg',
    page: 'admin-services',
    blockType: 'splitFeature',
    rowMatch: 'Handled for You',
    field: 'image',
    alt: 'VERIFY’s administrative team at work',
  },
]

type Row = { title?: string | null; image?: unknown }
type Block = {
  blockType?: string
  variant?: string | null
  rows?: Row[]
  image?: unknown
  photo?: unknown
  content?: Block[]
  columns?: { content?: Block[] }[]
}

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

export const repairContentImages = async (ctx: Ctx): Promise<void> => {
  const { payload, req } = ctx
  const dir = path.join(process.cwd(), 'public', 'assets', 'images', 'content')

  let filled = 0
  const skipped: string[] = []
  const missing: string[] = []

  for (const t of TARGETS) {
    const found = await payload.find({
      collection: 'pages',
      where: { slug: { equals: t.page } },
      limit: 1,
      depth: 0,
      req,
    })
    const page = found.docs[0] as unknown as { id: number | string; layout?: Block[] } | undefined
    if (!page || !Array.isArray(page.layout)) {
      missing.push(`${t.file} (no page /${t.page})`)
      continue
    }

    // Does the slot exist, and is it still empty?
    let slotFound = false
    let slotEmpty = false
    const inspect = (b: Block): void => {
      if (b.blockType !== t.blockType) return
      if (t.blockType === 'splitFeature') {
        for (const r of b.rows ?? []) {
          // `storedText`, not `(r.title ?? '')`: a SplitFeature row's title is
          // rich text, so `.includes` on it throws
          // `(r.title ?? "").includes is not a function` and takes the whole seed
          // down. Same conversion, same family as the timeLabel and link-label
          // faults fixed alongside this.
          if (t.rowMatch && storedText(r.title).includes(t.rowMatch)) {
            slotFound = true
            if (!r.image) slotEmpty = true
          }
        }
        return
      }
      slotFound = true
      if (!b[t.field]) slotEmpty = true
    }
    mapBlocks(page.layout, (b) => {
      inspect(b)
      return b
    })

    if (!slotFound) {
      missing.push(`${t.file} (no ${t.blockType} matching on /${t.page})`)
      continue
    }
    if (!slotEmpty) {
      skipped.push(t.file)
      continue
    }

    const mediaId = await getOrCreateMedia(ctx, path.join(dir, t.file), t.alt)
    if (!mediaId) {
      missing.push(`${t.file} (upload failed)`)
      continue
    }

    const next = mapBlocks(page.layout, (b) => {
      if (b.blockType !== t.blockType) return b
      if (t.blockType === 'splitFeature') {
        return {
          ...b,
          rows: (b.rows ?? []).map((r) =>
            t.rowMatch && storedText(r.title).includes(t.rowMatch) && !r.image
              ? { ...r, image: mediaId }
              : r,
          ),
        }
      }
      return b[t.field] ? b : { ...b, [t.field]: mediaId }
    })

    await seedUpdate(payload, {
      collection: 'pages',
      id: page.id,
      data: { layout: next } as never,
      req,
      context: { disableRevalidate: true },
    })
    filled++
  }

  payload.logger.info(
    `— Content photos: ${filled} placed, ${skipped.length} already set, ${missing.length} unresolved`,
  )
  // A target that resolves to nothing is the failure mode worth shouting about:
  // a renamed heading or a moved block would otherwise leave the placeholder up
  // and say nothing at all.
  for (const m of missing) payload.logger.warn(`  · ${m}`)
}
