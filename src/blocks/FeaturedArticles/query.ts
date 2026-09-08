import type { Payload, Where } from 'payload'
import type { Post } from '@/payload-types'

/**
 * Which posts the featured carousel lists. Extracted for the same reason as
 * `ArchiveBlock/query.ts`: the sticky Section Nav decides whether to keep this
 * section's tab, and it must decide it with this query and not a second copy.
 */

export type FeaturedSource = {
  source?: ('auto' | 'manual') | null
  posts?: (number | string | Post)[] | null
}

/**
 * A post is "featured" if its own checkbox is set OR it belongs to the Featured
 * stream. The stream lookup is a query of its own, which is exactly why this
 * cannot be a plain object literal.
 */
export const featuredPostsWhere = async (payload: Payload): Promise<Where> => {
  const or: Where[] = [{ featured: { equals: true } }]

  const featuredStream = await payload.find({
    collection: 'streams',
    depth: 0,
    limit: 1,
    where: { slug: { equals: 'featured' } },
  })
  const featuredStreamId = featuredStream.docs[0]?.id
  if (featuredStreamId) or.push({ stream: { equals: featuredStreamId } })

  return { or }
}

/** The hand-picked posts, dropping any relationship that did not populate. */
export const featuredSelectedPosts = (props: FeaturedSource): Post[] =>
  ((props.posts as (Post | number | string)[] | null) || []).filter(
    (p): p is Post => !!p && typeof p === 'object',
  )

/** Does the carousel have at least one slide? */
export const featuredHasContent = async (
  payload: Payload,
  props: FeaturedSource,
): Promise<boolean> => {
  if (props.source === 'manual') return featuredSelectedPosts(props).length > 0

  const { totalDocs } = await payload.count({
    collection: 'posts',
    // Matches the block's fetch — the default would feature drafts.
    overrideAccess: false,
    where: await featuredPostsWhere(payload),
  })
  return totalDocs > 0
}
