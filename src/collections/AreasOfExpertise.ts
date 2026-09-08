import type { CollectionConfig } from 'payload'
import { inlineRichTextField } from '@/fields/blockFields'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from 'payload'
import { revalidateSiteOnChange, revalidateSiteOnDelete } from '@/utilities/revalidateSite'

// Clinical conditions / body-regions a specialist covers (Spine, Knee, PTSD, …).
// Admin-editable taxonomy.
export const AreasOfExpertise: CollectionConfig = {
  slug: 'areas-of-expertise',
  // Rendered on a specialist profile under the heading "Assessment Areas"
  // (SpecialistProfile → labels.assessmentAreas). The phrase "Areas of
  // Expertise" appears nowhere on the site, so the admin follows the site.
  labels: { singular: 'Assessment Area', plural: 'Assessment Areas' },
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
      'Sub-specialty areas a specialist assesses. Listed on their profile under "Assessment Areas", and used to filter the specialist directory.',
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
