import type { GlobalAfterChangeHook } from 'payload'

import { safeRevalidateTag as revalidateTag } from '@/utilities/safeRevalidate'

// Shared afterChange hook for simple globals: revalidates the cache tag that
// getCachedGlobal(slug) reads from, so edits show up without a rebuild. Mirrors
// the per-global revalidate hooks (Header/Footer/etc.).
export const revalidateGlobal =
  (slug: string): GlobalAfterChangeHook =>
  ({ doc, req: { payload, context } }) => {
    if (!context.disableRevalidate) {
      payload.logger.info(`Revalidating global ${slug}`)
      revalidateTag(`global_${slug}`)
    }
    return doc
  }
