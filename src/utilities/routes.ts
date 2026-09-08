/**
 * Single source of truth for "what is this document's URL".
 *
 * Every collection with a public route gets one builder here, and everything that
 * needs a URL — link components, blocks, revalidation hooks, sitemaps, redirects —
 * calls it instead of interpolating a path inline. Previously nine places built
 * these by hand and disagreed: hooks revalidated `/${slug}` while pages actually
 * routed on their nested-docs breadcrumb path, so edits to a nested page purged a
 * URL nobody visits and left the real one stale.
 *
 * Keep these in step with `src/app/(frontend)/` — if a route folder moves, this
 * file moves with it and every caller follows.
 */

// ── Pages (nested-docs) ────────────────────────────────────────────────────
// A page's real URL is the chain of its ancestors' slugs, which the nested-docs
// plugin stores on the last breadcrumb (`/services/medico-legal/ime`). Callers
// may hold a page at any depth, so accept the loosest useful shape.
type WithBreadcrumbs = {
  slug?: string | null
  breadcrumbs?: ({ url?: string | null } | null)[] | null
}

/**
 * Canonical path for a page. Falls back to the bare slug when breadcrumbs aren't
 * populated (depth 0 queries, or a doc saved before nested-docs was enabled).
 * Home resolves to `/`.
 */
export const docPath = (doc?: WithBreadcrumbs | null): string => {
  if (!doc) return '/'

  // The home page serves at '/', even though nested-docs stores its breadcrumb
  // url as '/home' — check the slug before consulting breadcrumbs so we never
  // canonicalise '/' to '/home'.
  if (!doc.slug || doc.slug === 'home') return '/'

  const breadcrumbs = doc.breadcrumbs
  if (Array.isArray(breadcrumbs) && breadcrumbs.length) {
    const url = breadcrumbs[breadcrumbs.length - 1]?.url
    if (url) return url
  }

  return `/${doc.slug}`
}

// ── Specialists ────────────────────────────────────────────────────────────
// Profiles sit under `/specialists/profiles/` (matching .design-reference) so the
// pages nested under `/specialists` — Specialist Panel, Specialty List, Join Expert
// Panel, Specialist Availability — aren't swallowed by a `/specialists/[slug]`
// dynamic segment, which outranks the `[...slug]` catch-all and would 404 them.
export const SPECIALIST_PREFIX = '/specialists/profiles'

export const specialistPath = (slug?: string | null): string | null =>
  slug ? `${SPECIALIST_PREFIX}/${slug}` : null

/** Specialist panel listing (a Page nested under /specialists). */
export const SPECIALIST_INDEX_PATH = '/specialists/specialist-panel'

// ── Posts (In the Loop) ────────────────────────────────────────────────────
type PostLike = {
  slug?: string | null
  stream?: { slug?: string | null } | string | number | null
}

const streamSlugOf = (post?: PostLike | null): string | null => {
  const stream = post?.stream
  return stream && typeof stream === 'object' ? (stream.slug ?? null) : null
}

/**
 * Canonical article path. Returns `null` when the post has no stream: the old
 * `/in-the-loop/<slug>` fallback matched the `/in-the-loop/[stream]` listing route,
 * which looks the segment up as a *stream*, finds nothing and 404s. Callers should
 * render such a post unlinked rather than emit a dead href.
 */
export const postPath = (post?: PostLike | null): string | null => {
  const slug = post?.slug
  if (!slug) return null

  const stream = streamSlugOf(post)
  return stream ? `/in-the-loop/${stream}/${slug}` : null
}

/** Listing page for one In-the-Loop stream. */
export const streamPath = (slug?: string | null): string | null =>
  slug ? `/in-the-loop/${slug}` : null

/** The In-the-Loop hub (a Page, kept here so callers have one import). */
export const IN_THE_LOOP_PATH = '/in-the-loop'

// ── Events ─────────────────────────────────────────────────────────────────
export const EVENT_PREFIX = '/events/event'

export const eventPath = (slug?: string | null): string | null =>
  slug ? `${EVENT_PREFIX}/${slug}` : null

/** Events & Seminars hub (a Page). */
export const EVENTS_INDEX_PATH = '/events'

// ── Team ───────────────────────────────────────────────────────────────────
export const TEAM_PREFIX = '/about/team'

export const teamPath = (slug?: string | null): string | null =>
  slug ? `${TEAM_PREFIX}/${slug}` : null

/** Team listing page (a Page, nested under About). */
export const TEAM_INDEX_PATH = '/about/meet-the-team'

// ── Polymorphic reference → path ───────────────────────────────────────────

/** Collections an internal link / redirect / SEO URL can point at. */
export const LINKABLE_COLLECTIONS = ['pages', 'posts', 'specialists', 'team', 'events'] as const
export type LinkableCollection = (typeof LINKABLE_COLLECTIONS)[number]

/**
 * The single resolver for "an editor picked a document — where does it live?".
 *
 * Four hand-maintained copies of this switch had drifted apart: CMSLink treated
 * everything-but-pages as a post, RichText treated everything-but-posts as a
 * page, PayloadRedirects had a third copy, and the SEO plugin a fourth that
 * still mapped posts to the retired `/posts/<slug>`. Adding a collection meant
 * editing four files, and missing one produced a link that stored fine and
 * rendered as a dead <a> — or worse, a plausible URL that 404s.
 *
 * Returns `null` when there is no canonical path (an unsaved doc, or a post with
 * no stream). Callers must handle null by rendering the thing unlinked rather
 * than emitting `/undefined/...`.
 */
export const referencePath = (
  relationTo?: string | null,
  doc?: unknown,
): string | null => {
  if (!doc || typeof doc !== 'object') return null
  const slug = (doc as { slug?: string | null }).slug ?? null

  switch (relationTo) {
    case 'pages':
      // Nested-docs: prefers the full breadcrumb chain, falls back to the slug.
      return docPath(doc as WithBreadcrumbs)
    case 'posts':
      return postPath(doc as PostLike)
    case 'specialists':
      return specialistPath(slug)
    case 'team':
      return teamPath(slug)
    case 'events':
      return eventPath(slug)
    default:
      return null
  }
}
