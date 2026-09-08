import { seedUpdate } from './seedWrite'
import type { Payload, PayloadRequest } from 'payload'

import { matchTracker, storedText, type MatchTracker } from './repairMatch'

type Ctx = { payload: Payload; req: PayloadRequest }

/**
 * Rewrites stale link URLs stored inside page `layout` JSON.
 *
 * Why this exists rather than a seed edit: `seedHomepage` (and its siblings)
 * early-return on an already-authored page, so correcting a URL in the seed only
 * ever reaches a virgin database. The seed had in fact *already* been corrected to
 * canonical paths — and every existing install, including the box, still served
 * the old ones. Measured before this: 30 links across 9 pages still pointed at
 * flat legacy paths that only resolved through a 308.
 *
 * Same shape as `repairServiceLinks`: a table, an unconditional pass, and a write
 * only when the value actually differs.
 *
 * A 308 is not merely untidy here. `CLAUDE.md` reserves permanent redirects for
 * destinations that can never change, and these are editor-editable page slugs;
 * worse, an App Router client-side navigation through a redirect can drop the
 * `#fragment`, which is exactly what makes an anchored link land in the wrong
 * place intermittently.
 */

/** Exact stored URL → what it should be. Exact match only: a prefix rewrite would
 *  turn `/imelda` into `/services/medico-legal/imelda`. Fragments are handled by
 *  matching `<path>` and `<path>#<frag>` separately, below. */
export const LEGACY_PATHS: Record<string, string> = {
  '/for-clients': '/information-centre/for-clients',
  '/for-claimants': '/information-centre/for-claimants',
  '/join-expert-panel': '/specialists/join-expert-panel',
  '/specialist-panel': '/specialists/specialist-panel',
  '/ime': '/services/medico-legal/ime',
  '/jme': '/services/medico-legal/jme',
  '/meet-the-team': '/about/meet-the-team',
  '/upcoming-events': '/events/upcoming-events',
}

/** Destination corrections that are not just a stale prefix — a link pointing at
 *  the wrong thing entirely. Keyed by the exact stored URL. */
export const LINK_TARGET_FIXES: Record<string, string> = {
  // Went to the YouTube "Watch Our Preparation Guide" section, not to the guide.
  '/information-centre/for-claimants#video-guide':
    '/information-centre/for-claimants#videolink-appointment',
  // Landed on the intro heading above the guide rather than the guide itself.
  '/information-centre/for-claimants#appointment-guide':
    '/information-centre/for-claimants#in-person-appointment',
  // Terms & Conditions 404'd: there is no /legal prefix on this site.
  '/legal/terms-conditions': '/terms-conditions',
}

/** Applied only to a link whose label matches, because the same URL is correct
 *  elsewhere. `label` is compared case-insensitively after trimming. `block`
 *  narrows further to links inside one block type — needed because a label alone
 *  is not unique: "Join Expert Panel" appears twice on the homepage and only the
 *  gateway card's copy takes the fragment. */
export const LABEL_SCOPED_FIXES: {
  label: string
  from: string
  to: string
  block?: string
}[] = [
  // The gateway CTA jumps to the form; the Featured Specialists button below it
  // keeps the plain page link, as the reference has it (index.html:135 vs :446).
  {
    // The homepage wording, verbatim. It was reworded from "Join Expert Panel"
    // to this at some point and the key here was not updated, so even once
    // `norm` was fixed to read rich text this entry still matched nothing — two
    // independent faults stacked on the same line. Confirmed against a fresh
    // seed: the stored label is "Join VERIFY's Expert Panel" and the gateway
    // link had never received its fragment. The `#join-form` target does exist
    // (a Section with that anchorId on the page), so this is a live link, not a
    // fragment pointing at nothing.
    //
    // Nothing notices when a key like this goes stale, because `matchTracker` is
    // wired to SUPERSEDED_BLOCKS and APPOINTMENT_TYPE_ANCHORS but not to this
    // table — see README.md > Known issues.
    label: "Join VERIFY's Expert Panel",
    block: 'gatewayCards',
    from: '/specialists/join-expert-panel',
    to: '/specialists/join-expert-panel#join-form',
  },
  // The other side of the same rule, and the reason both are stated rather than
  // just one: an earlier run of this repair matched on label alone and put the
  // fragment on BOTH copies. Declaring the Featured Specialists button's correct
  // value makes the pass self-correcting from either direction instead of only
  // ratcheting one way.
  {
    label: 'Join Expert Panel',
    block: 'peopleGrid',
    from: '/specialists/join-expert-panel#join-form',
    to: '/specialists/join-expert-panel',
  },
  // Card 3's quick link is about the whole page, so it stays fragment-free.
  {
    label: 'Upcoming Webinars & Training',
    from: '/events',
    to: '/events/upcoming-events',
  },
  // In the Loop's "View All Events" goes to the hub, not to Upcoming.
  { label: 'View All Events', from: '/events/upcoming-events', to: '/events' },
  // Label-scoped on purpose: /specialists is a real landing page and a perfectly
  // good destination for a link that says "Specialists". It is only wrong when
  // the label promises the panel.
  {
    label: 'View Specialist Panel',
    from: '/specialists',
    to: '/specialists/specialist-panel',
  },
  { label: 'View Full Panel', from: '/specialists', to: '/specialists/specialist-panel' },
]

// `storedText`, not a `typeof === 'string'` test: a link's `label` is
// `inlineRichTextField` (src/fields/link.ts), so it is a Lexical object in every
// table. The old form returned '' for every link on the site, making each
// LABEL_SCOPED_FIXES comparison `'' === '<literal>'` — so all three entries had
// been dead since the rich-text conversion, silently. Confirmed in real data: the
// homepage gateway card's link was stored without the #join-form fragment this
// table exists to add.
const norm = (s: unknown): string => storedText(s).trim().toLowerCase()

/**
 * Anchor IDs for the Appointment Guide's type toggle, keyed by the type's label.
 *
 * A link is only half of a deep link — the target has to exist. Setting these in
 * the seed alone reached nothing, because `seedInfoBooking` early-returns on an
 * already-authored For Claimants page, so the column stayed NULL on every
 * existing install and the buttons rendered with no id. Verified the hard way:
 * the hrefs were right and the guide still opened on In-Person.
 */
export const APPOINTMENT_TYPE_ANCHORS: Record<string, string> = {
  'In-Person Appointment': 'in-person-appointment',
  'Videolink Appointment': 'videolink-appointment',
}

/**
 * Anchor IDs for whole blocks, keyed by `blockType` + the block's stored heading.
 * Same reason as the appointment types: a seed-side `anchorId` never reaches an
 * already-authored page. Heading is the key because block ids are generated and
 * differ between installs.
 */
export const BLOCK_ANCHORS: { blockType: string; heading: string; anchorId: string }[] = [
  // The homepage card "Surrogate Assessment & Interpreter Booking Service" names
  // two of this accordion's four items, so it links to the grid as a whole.
  {
    blockType: 'servicesGrid',
    // Written WITHOUT the `[[accent]]` brackets: the comparison runs through
    // `storedText`, which strips them, so that the same literal keeps matching
    // whether the heading is stored as a string or as rich text.
    heading: 'Four Services. One Less Thing to Manage.',
    anchorId: 'as-services-section',
  },
]

/**
 * Set a missing/incorrect `anchorId` on each appointmentGuide type.
 *
 * `found` records that a table entry matched a block in the database, which is a
 * different question from whether anything was *written*: this repair is
 * idempotent, so on a healthy second run it changes nothing and must still
 * report that it found its targets. Counting writes instead would make every
 * clean re-run look like total drift.
 */
const applyGuideAnchors = (
  node: unknown,
  count: { n: number },
  found: { blocks: MatchTracker; types: MatchTracker },
): unknown => {
  if (Array.isArray(node)) return node.map((n) => applyGuideAnchors(n, count, found))
  if (!node || typeof node !== 'object') return node
  const obj = node as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) out[k] = applyGuideAnchors(v, count, found)
  const heading = storedText(out.heading)
  const blockAnchor = BLOCK_ANCHORS.find(
    (a) => a.blockType === out.blockType && a.heading === heading,
  )
  if (blockAnchor) {
    found.blocks.hit(blockAnchor.heading)
    if (out.anchorId !== blockAnchor.anchorId) {
      out.anchorId = blockAnchor.anchorId
      count.n++
    }
  }
  if (out.blockType === 'appointmentGuide' && Array.isArray(out.types)) {
    out.types = (out.types as Record<string, unknown>[]).map((t) => {
      const label = storedText(t?.label)
      const want = APPOINTMENT_TYPE_ANCHORS[label]
      if (!want) return t
      found.types.hit(label)
      if (t?.anchorId === want) return t
      count.n++
      return { ...t, anchorId: want }
    })
  }
  return out
}

/**
 * Resolve one stored URL to its corrected value, or null if it is already right.
 *
 * Order matters, and getting it wrong is not hypothetical — the first version
 * checked the target tables before normalising the prefix, so a value stored as
 * `/for-claimants#video-guide` matched neither table (both are keyed on the
 * canonical `/information-centre/...` form) and came out with its prefix fixed
 * and its wrong destination intact. Three of the reported faults survived the
 * first repair run because of it.
 *
 * So: legacy prefix first, then destination, then label-scoped. Every step is a
 * no-op on already-correct input, which keeps the whole thing idempotent.
 */
export const correctUrl = (url: string, label?: unknown, block?: string): string | null => {
  let out = url

  // 1. Legacy flat path → canonical nested path, preserving any fragment.
  const [path, ...rest] = out.split('#')
  const mapped = LEGACY_PATHS[path]
  if (mapped) out = rest.length ? `${mapped}#${rest.join('#')}` : mapped

  // 2. Wrong destination → right one, now that the path is in canonical form.
  if (LINK_TARGET_FIXES[out]) out = LINK_TARGET_FIXES[out]

  // 3. Corrections that depend on which link this is, not just where it points.
  for (const f of LABEL_SCOPED_FIXES) {
    if (f.block && f.block !== block) continue
    if (norm(label) === norm(f.label) && out === f.from) out = f.to
  }

  return out === url ? null : out
}

/**
 * Walk any nested structure and rewrite every `{ type: 'custom', url, label }`.
 * `block` carries the nearest enclosing `blockType` down the tree so a fix can be
 * scoped to one block — see LABEL_SCOPED_FIXES.
 */
const rewrite = (node: unknown, count: { n: number }, block?: string): unknown => {
  if (Array.isArray(node)) return node.map((n) => rewrite(n, count, block))
  if (!node || typeof node !== 'object') return node
  const obj = node as Record<string, unknown>
  const scope = typeof obj.blockType === 'string' ? obj.blockType : block
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) out[k] = rewrite(v, count, scope)
  if (typeof out.url === 'string') {
    const fixed = correctUrl(out.url, out.label, scope)
    if (fixed) {
      out.url = fixed
      count.n++
    }
  }
  return out
}

export const repairLinkTargets = async ({ payload, req }: Ctx): Promise<void> => {
  const pages = await payload.find({ collection: 'pages', limit: 500, depth: 0, req })
  let pagesTouched = 0
  let linksFixed = 0

  // Only these two tables are tracked. Their keys are headings and labels that
  // must still be on the page; the URL tables above key on wording that is meant
  // to disappear once repaired, so zero matches there is success. See
  // `repairMatch.ts`.
  const found = {
    blocks: matchTracker(
      'BLOCK_ANCHORS',
      BLOCK_ANCHORS.map((a) => a.heading),
    ),
    types: matchTracker('APPOINTMENT_TYPE_ANCHORS', Object.keys(APPOINTMENT_TYPE_ANCHORS)),
  }

  for (const page of pages.docs) {
    const layout = (page as { layout?: unknown }).layout
    if (!layout) continue
    const count = { n: 0 }
    const next = applyGuideAnchors(rewrite(layout, count), count, found)
    if (count.n === 0) continue
    await seedUpdate(payload, {
      collection: 'pages',
      id: page.id,
      data: { layout: next } as never,
      req,
      context: { disableRevalidate: true },
    })
    pagesTouched++
    linksFixed += count.n
  }

  payload.logger.info(
    `— Repaired link targets and anchors (${linksFixed} changes across ${pagesTouched} pages)`,
  )

  found.blocks.report(payload)
  found.types.report(payload)
}
