import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from 'payload'
import { revalidateSiteOnChange, revalidateSiteOnDelete } from '@/utilities/revalidateSite'

/**
 * The kinds of event VERIFY runs — Breakfast Seminar, Conference, Webinar,
 * Sponsorship, Social Event, and whatever comes next.
 *
 * ── Why this is a collection ──
 * It was a `select` with eleven options fixed in code, and the labels were
 * repeated in a second file (`src/utilities/eventTypeLabels.ts`) whose header
 * comment said, in as many words, "keep in step with the `eventType` options in
 * Events". Adding a type needed a developer, a deploy and a Postgres enum
 * change. That is exactly what CLAUDE.md's rule exists for: new classifications
 * are collections, not hardcoded option lists.
 *
 * ── Why there is no `order`, and no `description` ──
 * Nothing would read either. The events page has no type FILTER — the type is
 * one of four strings in a free-text search box — so an order number would sort
 * nothing, and a description would render nowhere. Both would be controls an
 * editor can set that silently do nothing, which is the failure this codebase
 * is built to avoid. `defaultSort: 'title'` makes the alphabetical order real
 * rather than incidental. Departments omits its `description` for the same
 * reason and says so.
 */
export const EventTypes: CollectionConfig = {
  slug: 'event-types',
  labels: { singular: 'Event Type', plural: 'Event Types' },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  // Alphabetical in the admin list AND in the relationship picker on an event,
  // so the two agree without a consumer-side special case.
  defaultSort: 'title',
  admin: {
    useAsTitle: 'title',
    group: 'Taxonomy',
    description:
      'The kinds of event you run. Add one here and it is immediately selectable on every event; the name you give it is the badge a visitor sees.',
    defaultColumns: ['title', 'slug'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'e.g. "Breakfast Seminar", "Webinar". Shown as the badge on an event card.',
      },
    },
    slugField({
      position: undefined,
    }),
  ],
  hooks: {
    beforeDelete: [
      /**
       * Refuse to delete an event type that events still use.
       *
       * The FK is ON DELETE SET NULL *and* `eventType` is `required: true` on
       * Events, so deleting one would succeed silently and leave published
       * events with no type at all — the badge would vanish from their cards
       * and their own page while the record still said Published, and the only
       * way back is to reopen each event and pick a type by hand. Same guard,
       * and the same reasoning, as Departments.
       */
      async ({ id, req }) => {
        const { totalDocs } = await req.payload.count({
          collection: 'events',
          where: { eventType: { equals: id } },
          req,
        })
        if (totalDocs > 0) {
          // `APIError` with a 400, NOT a plain Error: Payload turns a bare
          // `throw new Error(...)` into a 500 whose body is the generic
          // "Something went wrong." — measured. The editor is then told only
          // that it failed, not that four events depend on this type or what to
          // do about it, which is the unhelpful half of failing loudly.
          throw new APIError(
            `This event type is still used by ${totalDocs} event${totalDocs === 1 ? '' : 's'}. ` +
              `Move them to another type first — deleting it now would leave them with no type ` +
              `at all, even though they still say Published.`,
            400,
          )
        }
      },
    ],
    afterChange: [revalidateSiteOnChange],
    afterDelete: [revalidateSiteOnDelete],
  },
}
