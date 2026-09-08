import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from 'payload'
import { iconField,
  inlineRichTextField,
} from '@/fields/blockFields'
import { revalidateSiteOnChange, revalidateSiteOnDelete } from '@/utilities/revalidateSite'

// The services VERIFY offers. One source of truth for: home service cards, the
// dedicated service pages, and the contact form's "Service Required" dropdown.
// Admin-editable — no hardcoded service lists on the front end.
export const Services: CollectionConfig = {
  slug: 'services',
  labels: { singular: 'Service', plural: 'Services' },
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
      'The service cards shown in Services grids. These are cards, not pages — each links to a page you choose under "Link override".',
    defaultColumns: ['title', 'category', 'featured', 'order'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      defaultValue: 'medico-legal',
      options: [
        { label: 'Medico-Legal', value: 'medico-legal' },
        { label: 'Administrative', value: 'administrative' },
        { label: 'Educational', value: 'educational' },
      ],
      admin: { description: 'Groups the service (mirrors the contact form categories).' },
    },
    {
      name: 'serviceGroup',
      type: 'select',
      admin: {
        description:
          'Finer grouping so grids can isolate examinations vs reporting within Medico-Legal.',
      },
      options: [
        { label: 'Examination (IME / JME)', value: 'examination' },
        { label: 'Reporting', value: 'reporting' },
        { label: 'Administrative', value: 'administrative' },
        { label: 'Education', value: 'education' },
      ],
    },
    iconField({ admin: { description: 'Icon shown on the service card.' } }),
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Optional image for service cards / accordion rows.' },
    },
    {
      name: 'linkOverride',
      type: 'text',
      label: 'Link override',
      admin: {
        description:
          'Optional. Point the service card at a specific URL/anchor (e.g. /services/medico-legal/reporting-services#file-review) instead of the auto-generated service page.',
      },
    },
    inlineRichTextField('shortDescription', { label: 'Short description',
      admin: { description: 'Card blurb shown in grids (1–2 sentences).' } }),
    {
      name: 'body',
      type: 'richText',
      admin: { description: 'Full detail shown on the service page.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'featured',
          type: 'checkbox',
          defaultValue: false,
          admin: { width: '50%', description: 'Highlight in featured listings.' },
        },
        {
          name: 'order',
          type: 'number',
          defaultValue: 0,
          admin: { width: '50%', description: 'Lower numbers appear first.' },
        },
      ],
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
