import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeChangeHook,
  CollectionConfig,
} from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from 'payload'
import { revalidateSiteOnChange, revalidateSiteOnDelete } from '@/utilities/revalidateSite'
import { safeRevalidateTag as revalidateTag } from '@/utilities/safeRevalidate'
import { inlineRichTextField } from '@/fields/blockFields'

/**
 * Purge the `primary-office` cache tag.
 *
 * Two things every revalidation hook in this repo has to do, and these two were
 * the only ones not doing them:
 *
 *  - Honour `context.disableRevalidate`. The seed sets it to avoid a revalidation
 *    storm while it writes dozens of documents.
 *  - Survive being called outside a request scope. `revalidateTag` throws when
 *    there is no Next request context — a `payload migrate`, a scheduled job, a
 *    script. Payload runs `afterChange` *inside the transaction*, so an unguarded
 *    throw does not just log: it rolls the write back. The office would appear to
 *    save and then silently not exist.
 */
const purgePrimaryOfficeTag = (disabled: unknown, log: (msg: string) => void) => {
  if (disabled) return
  try {
    revalidateTag('primary-office')
  } catch (err) {
    log(
      `Offices: could not revalidate the primary-office cache tag (${
        err instanceof Error ? err.message : String(err)
      }). The write itself succeeded; the footer's contact details may serve stale until the next purge.`,
    )
  }
}

const revalidatePrimaryOffice: CollectionAfterChangeHook = ({
  doc,
  req: { payload, context },
}) => {
  purgePrimaryOfficeTag(context.disableRevalidate, (m) => payload.logger.warn(m))
  return doc
}

const revalidatePrimaryOfficeOnDelete: CollectionAfterDeleteHook = ({
  doc,
  req: { payload, context },
}) => {
  purgePrimaryOfficeTag(context.disableRevalidate, (m) => payload.logger.warn(m))
  return doc
}

/**
 * Keep `isPrimary` unique. When an office is saved with the box ticked, clear it
 * on every other office first.
 *
 * Runs on the incoming `data` rather than after the write so there is never a
 * moment where two rows claim to be primary. `req` is threaded through so the
 * clears join the same transaction as the save.
 */
const clearOtherPrimaryOffices: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
  if (!data?.isPrimary) return data

  const others = await req.payload.find({
    collection: 'offices',
    where: {
      isPrimary: { equals: true },
      ...(originalDoc?.id ? { id: { not_equals: originalDoc.id } } : {}),
    },
    limit: 100,
    depth: 0,
    req,
  })

  for (const other of others.docs) {
    await req.payload.update({
      collection: 'offices',
      id: other.id,
      data: { isPrimary: false },
      depth: 0,
      req,
      context: { disableRevalidate: true },
    })
    req.payload.logger.info(
      `— Cleared "Primary office" on ${other.title} (superseded by ${data.title ?? 'this office'})`,
    )
  }

  return data
}

// Full office records that drive the "Where to Find Us" module on the Contact and
// For-Claimants pages (address, hours, transport, parking, embedded map). Distinct
// from the lean `Locations` taxonomy (which only filters the specialist directory).
export const Offices: CollectionConfig = {
  slug: 'offices',
  labels: { singular: 'Office', plural: 'Offices' },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    group: 'Reference',
    description:
      'Your office locations. The primary office fills the footer contact details and the "Where to Find Us" map on Contact and For Claimants.',
    defaultColumns: ['title', 'order', 'slug'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: { description: 'e.g. "Brisbane (Head Office)".' },
    },
    {
      name: 'isPrimary',
      type: 'checkbox',
      label: 'Primary office',
      defaultValue: false,
      admin: {
        description:
          'The office whose phone, email, address and hours the site falls back to — the footer and any "Use global contact details" block. Tick exactly one. Leave the matching Footer fields empty to follow this office; fill one in to override it there.',
      },
    },
    {
      name: 'address',
      type: 'textarea',
      admin: { description: 'Full postal address (line breaks preserved).' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'phone',
          type: 'text',
          admin: { width: '50%', description: 'Display phone, e.g. "07 3356 0469".' },
        },
        {
          name: 'email',
          type: 'text',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'mapEmbedUrl',
      type: 'text',
      label: 'Google Map embed URL',
      admin: {
        description: 'The src URL from a Google Maps "Embed a map" iframe. Leave empty to derive from the address.',
      },
    },
    {
      name: 'hours',
      type: 'array',
      label: 'Opening hours',
      labels: { singular: 'Hours row', plural: 'Hours rows' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'days', type: 'text', admin: { width: '50%', placeholder: 'Monday – Friday' } },
            { name: 'time', type: 'text', admin: { width: '50%', placeholder: '08:30 – 17:00' } },
          ],
        },
      ],
    },
    inlineRichTextField('hoursNote', { admin: { description: 'Optional caveat, e.g. the 7:30am staffing note.' } }),
    {
      name: 'transport',
      type: 'array',
      label: 'Public transport',
      labels: { singular: 'Transport item', plural: 'Transport items' },
      fields: [
        inlineRichTextField('label', { required: true }),
        inlineRichTextField('note'),
        { name: 'href', type: 'text', label: 'Optional link' },
      ],
    },
    {
      name: 'parking',
      type: 'array',
      label: 'Parking',
      labels: { singular: 'Car park', plural: 'Car parks' },
      fields: [
        inlineRichTextField('name', { required: true }),
        { name: 'address', type: 'text' },
        {
          type: 'row',
          fields: [
            inlineRichTextField('walkTime', { admin: { width: '50%', placeholder: '3 min walk' } }),
            inlineRichTextField('heightLimit', { admin: { width: '50%', placeholder: '2.0 m' } }),
          ],
        },
        { name: 'href', type: 'text', label: 'Optional link' },
        inlineRichTextField('note'),
      ],
    },
    inlineRichTextField('note', { admin: {
        description:
          'Any additional guidance shown in the location module. It reads as the last line of Nearby Car Parks — or, if this office lists no car parks, at the foot of the card.',
      } }),
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
    },
    slugField({
      position: undefined,
    }),
  ],
  hooks: {
    // Exactly one office is the fallback for the footer and every "use global
    // contact details" block. Without this, ticking a second one left two rows
    // claiming to be primary and `primaryOffice()` picked whichever the query
    // returned first — so the footer's phone number changed depending on sort
    // order, with nothing in the admin to explain it.
    beforeChange: [clearOtherPrimaryOffices],
    // `primary-office` is its own cache tag: the footer and every "use global
    // contact details" block now read the primary office, and those are cached
    // independently of the page-level purge revalidateSiteOnChange performs.
    afterChange: [revalidatePrimaryOffice, revalidateSiteOnChange],
    afterDelete: [revalidatePrimaryOfficeOnDelete, revalidateSiteOnDelete],
  },
}
