import { seedUpdate } from './seedWrite'
import type { Payload, PayloadRequest } from 'payload'

type Ctx = { payload: Payload; req: PayloadRequest }

/**
 * Points the homepage and /jme specialist carousels at a real selection.
 *
 * Both were rendering the alphabet under a heading that promises a choice. The
 * People Grid block builds no `where` clause when its filters are unset, so it
 * returned the first N specialists by admin drag order: the homepage's "Meet Our
 * Expert Panel" showed Beer→Garg, and /jme's "Specialists Who Conduct JME
 * Assessments" listed ten people of whom **three** were tagged for JME, while
 * five who were tagged did not appear at all.
 *
 * ── Why this is one function and not three ──
 * The flags MUST be written before `featuredOnly` is set on the homepage block.
 * With the filter on and no specialist flagged, the query matches nothing and the
 * component's `if (cards.length === 0) return null` deletes the entire band —
 * heading, subheading, carousel and both footer buttons — with no error anywhere.
 * Registering the steps as separate repairs in `seedVerify` would leave that
 * ordering to a call-site that nothing checks; here it cannot be got wrong.
 *
 * ── Why it is unconditional ──
 * `authorPage` early-returns on a page someone has authored, so editing the
 * fixtures alone reaches only a virgin database. Every existing install — the box
 * included — would keep the alphabetical carousels. This is the lesson
 * `seedLinkRepairs.ts` exists to record.
 *
 * ── Why the flags are re-asserted rather than filled-where-absent ──
 * `Specialists.featured` declares `defaultValue: false`, so every row already
 * reads false and "never set" is indistinguishable from "deliberately unticked".
 * There is no absence to write into, which rules out the `seedSpecialistIcons`
 * predicate. Asserting instead matches how `advertise` has always behaved in
 * `seedAvailability.ts`, and it only ever sets `true` — staff can feature as many
 * more specialists as they like and the seed will never untick them.
 */

/** Featured on the homepage carousel. Not the same list as `ADVERTISED` in
 *  `seedAvailability.ts`, and deliberately so: Ms Orla Fox is featured on the
 *  homepage but is not advertised for booking, and the two flags drive two
 *  different pages. */
export const FEATURED_SLUGS = [
  'dr-james-reidy',
  'adjunct-professor-anna-lenardon',
  'dr-lucas-murphy',
  'dr-simon-perkins',
  'dr-jason-beer',
  'ms-orla-fox',
  'dr-ashwani-garg',
] as const

/** The assessment type /jme's carousel filters on, resolved by slug. Never by id:
 *  a taxonomy row deleted and reseeded comes back with a new one. */
const JME_ASSESSMENT_SLUG = 'jme'

// Deliberately NOT `{ [key: string]: unknown }`: the generated block union has no
// index signature, so a cast to that shape is rejected and would only compile by
// going through `unknown` — which throws away the very check that catches a
// renamed field. The dynamic key access happens inside `patchPeopleGrid`, where
// it is narrowed once and locally.
type PageBlock = { blockType?: string }
type PageDoc = { id: number | string; layout?: PageBlock[] | null }

/** Loads a page by slug at depth 0, so relationships come back as bare ids —
 *  which is the shape a write expects, and avoids re-nesting populated docs. */
const findPage = async ({ payload, req }: Ctx, slug: string): Promise<PageDoc | null> => {
  const res = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    req,
  })
  return (res.docs[0] as PageDoc | undefined) ?? null
}

/**
 * Sets `patch` on the first `peopleGrid` block of `slug`, writing only when a
 * value actually differs. Returns what it did, so the caller can log honestly
 * rather than announcing a repair that made no change.
 */
const patchPeopleGrid = async (
  ctx: Ctx,
  slug: string,
  patch: Record<string, unknown>,
): Promise<'written' | 'already-set' | 'no-block' | 'no-page'> => {
  const page = await findPage(ctx, slug)
  if (!page) return 'no-page'
  const layout = page.layout
  if (!Array.isArray(layout)) return 'no-block'

  let found = false
  let changed = false
  const next = layout.map((block) => {
    if (block?.blockType !== 'peopleGrid' || found) return block
    found = true
    const current = block as Record<string, unknown>
    const differing = Object.entries(patch).filter(([key, value]) => current[key] !== value)
    if (differing.length === 0) return block
    changed = true
    return { ...block, ...Object.fromEntries(differing) }
  })

  if (!found) return 'no-block'
  if (!changed) return 'already-set'

  await seedUpdate(ctx.payload, {
    collection: 'pages',
    id: page.id,
    data: { layout: next } as never,
    req: ctx.req,
    context: { disableRevalidate: true },
  })
  return 'written'
}

export const repairFeaturedSpecialists = async (ctx: Ctx): Promise<void> => {
  const { payload, req } = ctx

  // ── 1. Flags first. Everything below depends on these existing. ──
  const found = await payload.find({
    collection: 'specialists',
    where: { slug: { in: [...FEATURED_SLUGS] } },
    limit: 100,
    depth: 0,
    pagination: false,
    req,
  })
  const bySlug = new Map<string, { id: number | string; featured?: boolean | null }>()
  for (const doc of found.docs as { id: number | string; slug?: string | null; featured?: boolean | null }[]) {
    if (doc.slug) bySlug.set(doc.slug, doc)
  }

  let flagged = 0
  for (const slug of FEATURED_SLUGS) {
    const doc = bySlug.get(slug)
    if (!doc) {
      payload.logger.info(`— Featured: specialist not found, skipping: ${slug}`)
      continue
    }
    if (doc.featured) continue
    await seedUpdate(payload, {
      collection: 'specialists',
      id: doc.id,
      depth: 0,
      req,
      context: { disableRevalidate: true },
      data: { featured: true } as never,
    })
    flagged += 1
  }
  if (flagged > 0) payload.logger.info(`— Flagged ${flagged} specialist(s) as featured`)

  // A count check, not a formality: if the slugs have drifted the homepage is
  // about to be filtered against fewer specialists than intended, and at zero it
  // would render nothing at all. Leaving the filter off is the safe failure.
  const featuredCount = await payload.count({
    collection: 'specialists',
    where: { featured: { equals: true } },
    req,
  })
  if (featuredCount.totalDocs === 0) {
    payload.logger.error(
      '— Featured: no specialist carries the flag; leaving the homepage carousel unfiltered rather than emptying the band',
    )
    return
  }

  // ── 2. Homepage: featured-only. ──
  const home = await patchPeopleGrid(ctx, 'home', { featuredOnly: true })
  if (home === 'written') {
    payload.logger.info(
      `— Repaired /: specialist carousel limited to the ${featuredCount.totalDocs} featured specialists`,
    )
  } else if (home === 'no-block' || home === 'no-page') {
    payload.logger.info(`— Featured: homepage people grid not found (${home})`)
  }

  // ── 3. /jme: filter by assessment type. ──
  const types = await payload.find({
    collection: 'assessment-types',
    where: { slug: { equals: JME_ASSESSMENT_SLUG } },
    limit: 1,
    depth: 0,
    req,
  })
  const jmeType = types.docs[0]
  if (!jmeType) {
    payload.logger.info(`— Featured: assessment type "${JME_ASSESSMENT_SLUG}" not found, skipping /jme`)
    return
  }

  // Same reasoning as the featured count above — filtering to an assessment type
  // nobody is tagged with empties the carousel and removes the section.
  const jmeCount = await payload.count({
    collection: 'specialists',
    where: { assessmentTypes: { equals: jmeType.id } },
    req,
  })
  if (jmeCount.totalDocs === 0) {
    payload.logger.error(
      '— Featured: no specialist is tagged for JME; leaving the /jme carousel unfiltered rather than emptying the band',
    )
    return
  }

  const jme = await patchPeopleGrid(ctx, 'jme', { asmtType: jmeType.id })
  if (jme === 'written') {
    payload.logger.info(
      `— Repaired /jme: specialist carousel limited to the ${jmeCount.totalDocs} JME-accredited specialists`,
    )
  } else if (jme === 'no-block' || jme === 'no-page') {
    payload.logger.info(`— Featured: /jme people grid not found (${jme})`)
  }
}
