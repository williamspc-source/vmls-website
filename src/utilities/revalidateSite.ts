import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { safeRevalidatePath as revalidatePath } from '@/utilities/safeRevalidate'

// Shared revalidation for "content" collections whose docs are rendered across
// arbitrary pages — as blocks, directory rows, taxonomy filters or archive
// listings. Unlike Posts/Specialists/Team/Events (which have their own detail
// page), there's no single path to target, so on any change we revalidate every
// route under the root layout. This only marks the static cache stale; Next
// regenerates each page lazily on the next request, so it's cheap even when an
// admin saves frequently. `context.disableRevalidate` is set during seeding to
// avoid a revalidation storm.
export const revalidateSiteOnChange: CollectionAfterChangeHook = ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    payload.logger.info('Revalidating site after content change')
    revalidatePath('/', 'layout')
  }
  return doc
}

export const revalidateSiteOnDelete: CollectionAfterDeleteHook = ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    payload.logger.info('Revalidating site after content delete')
    revalidatePath('/', 'layout')
  }
  return doc
}
