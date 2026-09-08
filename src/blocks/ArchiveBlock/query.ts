import type { Payload, Where } from 'payload'

/**
 * The filter an `archive` block applies, extracted so that the block and the
 * sticky Section Nav that may hide it cannot drift apart.
 *
 * The nav has to answer "would this section render nothing?" without rendering
 * it. If it asked that question with its own copy of the query, the two would be
 * free to disagree — the section shows cards while its tab is gone, or the tab
 * survives pointing at a section that vanished. That is precisely how the five
 * copies of the collection→prefix map in `routes.ts` came apart, and how three
 * byte-identical event-type label maps nearly shipped a blank badge.
 *
 * So the *filter* lives here once. Limit, sort direction and populate depth stay
 * with each caller, because they differ legitimately: the block fetches n
 * documents at depth 2 to build cards, the nav only counts.
 */

/** Just the fields that decide WHICH documents an archive lists. */
export type ArchiveSource = {
  populateBy?: ('collection' | 'selection') | null
  relationTo?: ('posts' | 'events') | null
  view?: ('upcoming' | 'past') | null
  categories?: (number | string | { id: number | string })[] | null
  stream?: number | string | { id: number | string } | null
  featured?: boolean | null
  selectedDocs?: ({ relationTo?: string; value?: unknown } | null)[] | null
}

export type ArchiveQuery = {
  collection: 'posts' | 'events'
  where?: Where
  /** `-date` for past events (most recent first), `date` for upcoming. */
  sort: string
}

const relId = (v: unknown): number | string | null => {
  if (v == null) return null
  if (typeof v === 'object') {
    const id = (v as { id?: number | string }).id
    return id ?? null
  }
  return v as number | string
}

/**
 * The collection query for an archive in `collection` mode, or `null` when the
 * block is in `selection` mode and lists hand-picked documents instead.
 *
 * `now` is a parameter rather than read here so the two callers cannot end up
 * comparing against times computed a request apart.
 */
export const archiveQuery = (props: ArchiveSource, now: Date): ArchiveQuery | null => {
  if ((props.populateBy ?? 'collection') !== 'collection') return null

  if (props.relationTo === 'events') {
    const nowISO = now.toISOString()
    const where: Where | undefined =
      props.view === 'upcoming'
        ? { date: { greater_than_equal: nowISO } }
        : props.view === 'past'
          ? { date: { less_than: nowISO } }
          : undefined

    // upcoming → soonest first; past → most recent first
    return { collection: 'events', where, sort: props.view === 'past' ? '-date' : 'date' }
  }

  const and: Where[] = []
  const categories = (props.categories ?? []).map(relId).filter((v): v is number | string => v !== null)
  if (categories.length > 0) and.push({ categories: { in: categories } })

  const stream = relId(props.stream)
  if (stream !== null) and.push({ stream: { equals: stream } })

  if (props.featured) and.push({ featured: { equals: true } })

  return { collection: 'posts', where: and.length > 0 ? { and } : undefined, sort: '-publishedAt' }
}

/**
 * The hand-picked documents an archive in `selection` mode would actually draw.
 *
 * Entries whose `value` is still an id are dropped, exactly as the component
 * drops them — a relationship that did not populate has no title to render.
 */
export const archiveSelectedDocs = (props: ArchiveSource): { relationTo?: string; value: object }[] =>
  (props.selectedDocs ?? []).filter(
    (d): d is { relationTo?: string; value: object } =>
      Boolean(d) && typeof d?.value === 'object' && d?.value !== null,
  )

/** Does this archive have anything at all to show? */
export const archiveHasContent = async (
  payload: Payload,
  props: ArchiveSource,
  now: Date,
): Promise<boolean> => {
  const query = archiveQuery(props, now)
  if (!query) return archiveSelectedDocs(props).length > 0

  const { totalDocs } = await payload.count({
    collection: query.collection,
    // Matches the block's own fetch. Without it the Local API's
    // `overrideAccess: true` default counts unpublished drafts, and a section
    // holding nothing but drafts would keep a tab that leads to an empty band.
    overrideAccess: false,
    ...(query.where ? { where: query.where } : {}),
  })
  return totalDocs > 0
}
