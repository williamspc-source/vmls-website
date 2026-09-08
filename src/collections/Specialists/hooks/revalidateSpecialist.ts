import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import {
  safeRevalidatePath as revalidatePath,
  safeRevalidateTag as revalidateTag,
} from '@/utilities/safeRevalidate'

import type { Specialist } from '../../../payload-types'
import { specialistPath } from '@/utilities/routes'

export const revalidateSpecialist: CollectionAfterChangeHook<Specialist> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = specialistPath(doc.slug)
      if (path) {
        payload.logger.info(`Revalidating specialist at path: ${path}`)
        revalidatePath(path)
      }
      revalidateTag('specialists-sitemap')
    }

    // Slug change or unpublish: purge the previous path too.
    const oldPath = specialistPath(previousDoc?.slug)
    if (oldPath && oldPath !== specialistPath(doc.slug)) {
      payload.logger.info(`Revalidating old specialist at path: ${oldPath}`)
      revalidatePath(oldPath)
      revalidateTag('specialists-sitemap')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Specialist> = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    const path = specialistPath(doc?.slug)
    if (path) revalidatePath(path)
    revalidateTag('specialists-sitemap')
  }

  return doc
}
