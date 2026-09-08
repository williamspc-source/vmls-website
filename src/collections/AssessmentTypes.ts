import type { CollectionConfig } from 'payload'
import { inlineRichTextField } from '@/fields/blockFields'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from 'payload'
import { revalidateSiteOnChange, revalidateSiteOnDelete } from '@/utilities/revalidateSite'

// Service / report kinds (IME, JME, File Review, Teleconference, …).
// Admin-editable taxonomy.
export const AssessmentTypes: CollectionConfig = {
  slug: 'assessment-types',
  labels: { singular: 'Assessment Type', plural: 'Assessment Types' },
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
      'Kinds of assessment a specialist performs. Listed on their profile under "Assessment Types".',
    defaultColumns: ['title', 'slug'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    inlineRichTextField('description'),
    slugField({
      position: undefined,
    }),
  ],
  hooks: {
    afterChange: [revalidateSiteOnChange],
    afterDelete: [revalidateSiteOnDelete],
  },
}
