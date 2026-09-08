import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import {
  safeRevalidatePath as revalidatePath,
  safeRevalidateTag as revalidateTag,
} from '@/utilities/safeRevalidate'

import type { Event } from '../../../payload-types'
import { eventPath } from '@/utilities/routes'

// Listing pages that render event archives (the hub + the dedicated upcoming/past
// pages, both nested under /events), revalidated alongside the detail page so a
// new/edited/removed event surfaces immediately.
const EVENT_LISTING_PATHS = ['/events', '/events/upcoming-events', '/events/past-events']

const revalidateListings = () => EVENT_LISTING_PATHS.forEach((p) => revalidatePath(p))

export const revalidateEvent: CollectionAfterChangeHook<Event> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = eventPath(doc.slug)
      if (path) {
        payload.logger.info(`Revalidating event at path: ${path}`)
        revalidatePath(path)
      }
      revalidateListings()
      revalidateTag('events-sitemap')
    }

    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      const oldPath = eventPath(previousDoc.slug)
      if (oldPath) revalidatePath(oldPath)
      revalidateListings()
      revalidateTag('events-sitemap')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Event> = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    const path = eventPath(doc?.slug)
    if (path) revalidatePath(path)
    revalidateListings()
    revalidateTag('events-sitemap')
  }

  return doc
}
