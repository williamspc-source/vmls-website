import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from 'payload'
import { revalidateSiteOnChange, revalidateSiteOnDelete } from '@/utilities/revalidateSite'

/**
 * The teams VERIFY's staff are grouped into — Operations, Business Development,
 * Client Support, Quality Assurance, and whatever comes next.
 *
 * ── Why this is a collection ──
 * It was a `select` with those four options fixed in code, repeated in FOUR
 * places that had to be kept in step by hand: the member's own field, the People
 * Grid block's filter, a slug→label map and a display-order array. Adding a fifth
 * team needed a developer, a deploy and a Postgres enum change, and the order of
 * the groups on Meet the Team could not be edited at all.
 *
 * That is exactly what CLAUDE.md's rule exists for: new filter axes are added as
 * collections, not as hardcoded option lists.
 */
export const Departments: CollectionConfig = {
  slug: 'departments',
  labels: { singular: 'Department', plural: 'Departments' },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    group: 'Taxonomy',
    description:
      'The teams staff are grouped into. Each becomes a labelled group on Meet the Team, in the order below. Add one here and it is immediately selectable on every team member.',
    defaultColumns: ['title', 'order', 'slug'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: { description: 'e.g. "Operations", "Quality Assurance". Shown as the group heading.' },
    },
    // No `description` field. Streams has one because its stream page renders it
    // as the subtitle; nothing renders a department's, and a note-to-self field is
    // still a control an editor can fill in that does nothing. It would also have
    // passed the orphan guard for the wrong reason — `description` sits in
    // ALLOWED_UNREAD_CONFIG for plugin-seo's `meta.description`.
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        description:
          'Order of the groups on Meet the Team (lower shows first). This genuinely drives the page — it replaced a list fixed in code.',
      },
    },
    slugField({
      position: undefined,
    }),
  ],
  hooks: {
    beforeDelete: [
      /**
       * Refuse to delete a department that still has team members.
       *
       * The FK is ON DELETE SET NULL, so deleting one would succeed silently and
       * null `department` on every member in it. Meet the Team groups by that
       * field, so those people would simply stop appearing there while their
       * profiles kept saying "Published" — the same shape of silent loss the
       * Streams guard was written for, and just as tedious to recover by hand.
       */
      async ({ id, req }) => {
        const { totalDocs } = await req.payload.count({
          collection: 'team',
          where: { department: { equals: id } },
          req,
        })
        if (totalDocs > 0) {
          throw new Error(
            `This department still has ${totalDocs} team member${totalDocs === 1 ? '' : 's'}. ` +
              `Move them to another department first — deleting it now would drop them from ` +
              `Meet the Team entirely, even though their profiles say Published.`,
          )
        }
      },
    ],
    afterChange: [revalidateSiteOnChange],
    afterDelete: [revalidateSiteOnDelete],
  },
}
