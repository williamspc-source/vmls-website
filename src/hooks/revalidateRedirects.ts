import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { safeRevalidateTag as revalidateTag } from '@/utilities/safeRevalidate'

// Refresh the cached `redirects` tag that PayloadRedirects reads. Registered on
// both afterChange and afterDelete so removing a redirect stops serving it, not
// just editing one. Typed to satisfy either hook signature; honours
// context.disableRevalidate like every other hook (e.g. during seeding).
export const revalidateRedirects: CollectionAfterChangeHook & CollectionAfterDeleteHook = ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating redirects`)
    revalidateTag('redirects')
  }

  return doc
}
