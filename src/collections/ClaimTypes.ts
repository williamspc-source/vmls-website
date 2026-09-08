import type { CollectionConfig } from 'payload'
import { inlineRichTextField } from '@/fields/blockFields'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from 'payload'
import { revalidateSiteOnChange, revalidateSiteOnDelete } from '@/utilities/revalidateSite'

// Legal scheme / claim types a specialist assesses under (Workers' Comp, CTP, …).
// The primary referrer filter. Admin-editable taxonomy.
export const ClaimTypes: CollectionConfig = {
  slug: 'claim-types',
  labels: { singular: 'Claim Type', plural: 'Claim Types' },
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
      'Kinds of claim a specialist handles. Listed on their profile under "Claim Types".',
    defaultColumns: ['title', 'slug'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    inlineRichTextField('description'),
    {
      name: 'order',
      type: 'number',
      admin: { description: 'Display order in the "Claims We Support" list (ascending).' },
    },
    slugField({
      position: undefined,
    }),
  ],
  hooks: {
    afterChange: [revalidateSiteOnChange],
    afterDelete: [revalidateSiteOnDelete],
  },
}
