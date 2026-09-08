import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  Payload,
} from 'payload'

import { safeRevalidatePath as revalidatePath } from '@/utilities/safeRevalidate'

import type { AvailabilitySession } from '../../../payload-types'
import { docPath } from '@/utilities/routes'

// Deep-scan a page doc for an `availability` block. The block can sit at the top
// level of a page's layout or nested inside a Section/Row/Tabs container, so rather
// than track every nesting key we look for any node whose `blockType` is
// 'availability' anywhere in the structure. Scanning the whole doc (not just
// `layout`) future-proofs against the block appearing under any other field.
const containsAvailabilityBlock = (value: unknown): boolean => {
  if (Array.isArray(value)) return value.some(containsAvailabilityBlock)
  if (value && typeof value === 'object') {
    if ((value as { blockType?: string }).blockType === 'availability') return true
    return Object.values(value).some(containsAvailabilityBlock)
  }
  return false
}

// The Specialist Availability block reads its sessions live at render time, but the
// pages hosting it are statically cached — so a new / edited / deleted session
// won't surface until each hosting page is revalidated. Find every published page
// that renders the block (e.g. Make a Booking, Specialist Availability) and
// revalidate its path so the change appears immediately.
const revalidateAvailabilityPages = async (payload: Payload): Promise<void> => {
  const { docs } = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 1000,
    pagination: false,
    overrideAccess: true,
    where: { _status: { equals: 'published' } },
  })

  for (const page of docs) {
    if (!containsAvailabilityBlock(page)) continue
    const path = docPath(page)
    payload.logger.info(`Revalidating availability page at path: ${path}`)
    revalidatePath(path)
  }
}

export const revalidateAvailabilitySession: CollectionAfterChangeHook<
  AvailabilitySession
> = async ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    await revalidateAvailabilityPages(payload)
  }
  return doc
}

export const revalidateAvailabilitySessionDelete: CollectionAfterDeleteHook<
  AvailabilitySession
> = async ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    await revalidateAvailabilityPages(payload)
  }
  return doc
}
