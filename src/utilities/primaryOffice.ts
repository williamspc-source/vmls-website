import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

import type { Office } from '@/payload-types'

/**
 * The office the site falls back to for contact details.
 *
 * Offices is the source of truth: it holds the richest record (address, hours,
 * transport, parking) and is what an editor naturally updates. The Footer
 * global keeps its own phone/email/address/hours fields, but only as an
 * override — previously they were the ONLY rendered values, so the Offices
 * phone and email were editable and invisible, and the same number lived in two
 * places waiting to drift.
 *
 * Prefers the office flagged `isPrimary`, else the lowest `order`.
 */
export const getPrimaryOffice = unstable_cache(
  async (): Promise<Office | null> => {
    const payload = await getPayload({ config: configPromise })
    const byFlag = await payload.find({
      collection: 'offices',
      where: { isPrimary: { equals: true } },
      limit: 1,
      depth: 0,
      pagination: false,
    })
    if (byFlag.docs[0]) return byFlag.docs[0]

    const fallback = await payload.find({
      collection: 'offices',
      sort: 'order',
      limit: 1,
      depth: 0,
      pagination: false,
    })
    return fallback.docs[0] ?? null
  },
  ['primary-office'],
  { tags: ['primary-office'] },
)
