import type { Payload, Where } from 'payload'
import type { Resource } from '@/payload-types'

/**
 * Which resources the grid lists. Extracted for the same reason as
 * `ArchiveBlock/query.ts` — the Section Nav decides this block's tab, and both
 * must ask the same question.
 */

export type ResourcesSource = {
  source?: ('auto' | 'manual') | null
  audience?: ('clients' | 'claimants' | 'all') | null
  resourceType?: ('checklist' | 'guide' | 'template' | 'fact-sheet') | null
  resources?: (number | string | Resource)[] | null
}

/** Empty object means "no restriction" — the caller omits `where` entirely. */
export const resourcesWhere = (props: ResourcesSource): Where => {
  const where: Where = {}
  // 'all' means "Everyone" → no audience restriction.
  if (props.audience && props.audience !== 'all') where.audience = { equals: props.audience }
  if (props.resourceType) where.resourceType = { equals: props.resourceType }
  return where
}

/** The hand-picked resources, dropping any relationship that did not populate. */
export const resourcesSelected = (props: ResourcesSource): Resource[] =>
  (props.resources || []).filter((r): r is Resource => typeof r === 'object' && r !== null)

/** Does the grid have at least one card? */
export const resourcesHasContent = async (
  payload: Payload,
  props: ResourcesSource,
): Promise<boolean> => {
  if (props.source === 'manual') return resourcesSelected(props).length > 0

  const where = resourcesWhere(props)
  const { totalDocs } = await payload.count({
    collection: 'resources',
    ...(Object.keys(where).length ? { where } : {}),
  })
  return totalDocs > 0
}
