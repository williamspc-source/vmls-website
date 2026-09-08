import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from 'payload'
import { iconField,
  inlineRichTextField,
} from '@/fields/blockFields'
import { revalidateSiteOnChange, revalidateSiteOnDelete } from '@/utilities/revalidateSite'

// Canonical medical disciplines — one per specialist. Admin-editable taxonomy.
export const Specialties: CollectionConfig = {
  slug: 'specialties',
  labels: { singular: 'Specialty', plural: 'Specialties' },
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
      'Medical specialties. They drive the Specialty List page and the specialist directory filters.',
    defaultColumns: ['title', 'slug'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    iconField({ admin: { description: 'Icon shown for this specialty in directories/grids.' } }),
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'specialty-categories',
      admin: {
        description: 'Filter group on the Specialty List page (Surgery / Psychiatry / …).',
      },
    },
    inlineRichTextField('description'),
    {
      name: 'keyAreas',
      type: 'array',
      label: 'Key areas',
      labels: { singular: 'Key area', plural: 'Key areas' },
      admin: { description: 'Short tags shown under the specialty (e.g. Hip & knee, Trauma).' },
      fields: [inlineRichTextField('area', { required: true })],
    },
    {
      name: 'order',
      type: 'number',
      admin: { description: 'Display order in the Specialty List (ascending).' },
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
