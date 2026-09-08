import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import {
  safeRevalidatePath as revalidatePath,
  safeRevalidateTag as revalidateTag,
} from '@/utilities/safeRevalidate'

import type { Team } from '../../../payload-types'
import { teamPath, TEAM_INDEX_PATH } from '@/utilities/routes'

export const revalidateTeam: CollectionAfterChangeHook<Team> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = teamPath(doc.slug)
      if (path) {
        payload.logger.info(`Revalidating team member at path: ${path}`)
        revalidatePath(path)
      }
      revalidatePath(TEAM_INDEX_PATH)
      revalidateTag('team-sitemap')
    }

    const oldPath = teamPath(previousDoc?.slug)
    if (oldPath && oldPath !== teamPath(doc.slug)) {
      revalidatePath(oldPath)
      revalidatePath(TEAM_INDEX_PATH)
      revalidateTag('team-sitemap')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Team> = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    const path = teamPath(doc?.slug)
    if (path) revalidatePath(path)
    revalidatePath(TEAM_INDEX_PATH)
    revalidateTag('team-sitemap')
  }

  return doc
}
