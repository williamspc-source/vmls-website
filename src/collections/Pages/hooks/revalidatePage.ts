import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import {
  safeRevalidatePath as revalidatePath,
  safeRevalidateTag as revalidateTag,
} from '@/utilities/safeRevalidate'

import type { Page } from '../../../payload-types'
import { docPath } from '@/utilities/routes'

// Pages are referenced by the Header/Footer nav, which is read through
// getCachedGlobal(..., 2) and tagged global_header / global_footer. revalidatePath
// re-renders the layout but does NOT invalidate those unstable_cache entries, so a
// page whose URL changed (slug/parent) or that was added/removed from the site
// would keep a stale nav link until the global is re-saved. Purge the nav tags on
// structural changes so nav hrefs and dead items refresh immediately.
const revalidateNavGlobals = () => {
  revalidateTag('global_header')
  revalidateTag('global_footer')
}

export const revalidatePage: CollectionAfterChangeHook<Page> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    const path = docPath(doc)
    const prevPath = previousDoc ? docPath(previousDoc) : undefined

    if (doc._status === 'published') {
      payload.logger.info(`Revalidating page at path: ${path}`)
      revalidatePath(path)
      revalidateTag('pages-sitemap')
    }

    // Purge the previous URL when a published page moved (slug/parent change) or
    // was unpublished, so the old path stops serving stale content.
    if (previousDoc?._status === 'published' && prevPath && prevPath !== path) {
      payload.logger.info(`Revalidating old page at path: ${prevPath}`)
      revalidatePath(prevPath)
      revalidateTag('pages-sitemap')
    }

    // Nav depends on the page's URL and its published state — refresh it when
    // either changed.
    if (prevPath !== path || previousDoc?._status !== doc._status) {
      revalidateNavGlobals()
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Page> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    revalidatePath(docPath(doc))
    revalidateTag('pages-sitemap')
    // A deleted page may still be linked from the nav; drop the cached globals so
    // the dead item disappears.
    revalidateNavGlobals()
  }

  return doc
}
