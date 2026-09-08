/**
 * Every breadcrumb trail on the site is built here — one function per content
 * type, all returning the same `Crumb[]`, so `<Breadcrumbs>` never has to know
 * what it is rendering.
 *
 * Trail policy, matching the design reference:
 *  - always starts at Home, whose label comes from Site Settings (never a literal)
 *  - always 2–3 items; a deeper ancestor chain collapses to
 *    `Home › <top section> › <current>`, which is how the reference renders
 *    /services/medico-legal/ime as "Home › Services › IME"
 *  - the last item is the current page and is never a link
 *
 * URL construction stays in `routes.ts`; this file only decides labels and
 * shape. Keeping them apart matters — `routes.ts` is imported by hooks,
 * sitemaps and redirects, and shouldn't drag label state into that graph.
 */
import {
  EVENTS_INDEX_PATH,
  IN_THE_LOOP_PATH,
  SPECIALIST_INDEX_PATH,
  TEAM_INDEX_PATH,
  streamPath,
} from '@/utilities/routes'
import { getCachedGlobal } from '@/utilities/getGlobals'

export type Crumb = { label?: string | null; url?: string | null }

/**
 * Site-wide trail settings (Site Settings → Breadcrumbs): the Home label, the
 * separator glyph and the landmark's screen-reader name. Every route that
 * renders a trail needs these, so fetch them from one place. Server-only.
 */
export const getCrumbSettings = async () => {
  const settings = await getCachedGlobal('site-settings', 0)()
  return settings?.breadcrumbs ?? {}
}

/** Labels shared by every trail, from Site Settings. */
export type CrumbBase = { home?: string | null }

/** A per-template section crumb (the middle item), from that template's global. */
export type CrumbSection = CrumbBase & { section?: string | null; sectionHref?: string | null }

/**
 * nested-docs stores the home page's breadcrumb url as `/home`, but it serves at
 * `/`. `docPath` special-cases this; a naive map over `breadcrumbs` would not,
 * and would emit a link that only works via a redirect.
 */
const normaliseUrl = (url?: string | null): string | null => {
  if (!url) return null
  return url === '/home' ? '/' : url
}

/** Home › <top section> › <current>. URLs stay fully nested; only display shortens. */
const collapse = (crumbs: Crumb[]): Crumb[] =>
  crumbs.length > 3 ? [crumbs[0]!, crumbs[1]!, crumbs[crumbs.length - 1]!] : crumbs

/**
 * Drop blank labels, collapse consecutive same-url entries, apply the depth
 * rule, and unlink the final crumb. Returning fewer than 2 items is normal —
 * the component renders nothing below that, so a lone "Home" never appears.
 */
const finalise = (crumbs: Crumb[]): Crumb[] => {
  const cleaned = crumbs.filter((c) => c.label?.trim())
  const deduped = cleaned.filter((c, i) => i === 0 || c.url !== cleaned[i - 1]?.url)
  const trail = collapse(deduped)
  return trail.map((c, i) => (i === trail.length - 1 ? { label: c.label } : c))
}

const homeCrumb = (label?: string | null): Crumb => ({ label: label || 'Home', url: '/' })

/** A trail of Home › section › current, used by every non-Page collection. */
const sectionTrail = (
  labels: CrumbSection,
  fallbackSection: string,
  fallbackHref: string,
  current?: string | null,
): Crumb[] =>
  finalise([
    homeCrumb(labels.home),
    { label: labels.section || fallbackSection, url: labels.sectionHref || fallbackHref },
    { label: current },
  ])

// ── Pages (nested-docs) ─────────────────────────────────────────────────────
type PageLike = {
  title?: string | null
  slug?: string | null
  breadcrumbs?: ({ label?: string | null; url?: string | null } | null)[] | null
}

/** The home page never gets a trail — a crumb reading just "Home" is noise. */
export const pageCrumbs = (page?: PageLike | null, homeLabel?: string | null): Crumb[] => {
  if (!page?.slug || page.slug === 'home') return []

  const chain = (page.breadcrumbs ?? [])
    .filter(Boolean)
    .map((b) => ({ label: b?.label ?? '', url: normaliseUrl(b?.url) }))

  // Docs saved at depth 0, or created before nested-docs was enabled, have no
  // breadcrumbs — fall back to the page's own title so the trail still renders.
  const tail: Crumb[] = chain.length ? chain : [{ label: page.title, url: null }]

  return finalise([homeCrumb(homeLabel), ...tail])
}

// ── In the Loop ─────────────────────────────────────────────────────────────
type StreamLike = { title?: string | null; slug?: string | null }

export const streamCrumbs = (stream?: StreamLike | null, labels: CrumbSection = {}): Crumb[] =>
  sectionTrail(labels, 'In the Loop', IN_THE_LOOP_PATH, stream?.title)

/**
 * Articles end on the stream, which stays a link — the reference does this on 23
 * of its 24 article pages, and it keeps the trail from repeating the <h1> that
 * sits directly beneath it.
 */
export const postCrumbs = (stream?: StreamLike | null, labels: CrumbSection = {}): Crumb[] =>
  finalise([
    homeCrumb(labels.home),
    { label: labels.section || 'In the Loop', url: IN_THE_LOOP_PATH },
    ...(stream?.title ? [{ label: stream.title, url: streamPath(stream.slug) }] : []),
  ])

// ── Team ────────────────────────────────────────────────────────────────────
export const teamCrumbs = (
  member?: { title?: string | null } | null,
  labels: CrumbSection = {},
): Crumb[] => sectionTrail(labels, 'Meet the Team', TEAM_INDEX_PATH, member?.title)

// ── Specialists ─────────────────────────────────────────────────────────────
export const specialistCrumbs = (
  specialist?: { title?: string | null } | null,
  labels: CrumbSection = {},
): Crumb[] => sectionTrail(labels, 'Specialist Panel', SPECIALIST_INDEX_PATH, specialist?.title)

// ── Events ──────────────────────────────────────────────────────────────────
export const eventCrumbs = (
  event?: { title?: string | null } | null,
  labels: CrumbSection = {},
): Crumb[] => sectionTrail(labels, 'Events & Seminars', EVENTS_INDEX_PATH, event?.title)
