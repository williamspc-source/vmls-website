import type { Block } from 'payload'

import {
  cssClassField,
  displayFields,
  iconField,
  sectionHeaderFields,
  inlineRichTextField,
} from '@/fields/blockFields'

// Renders business contact details (phone / email / address / hours) on a page.
// Can pull the shared values from the Footer/Site Settings globals (single source
// of truth) or override them per-block.
export const ContactDetails: Block = {
  slug: 'contactDetails',
  interfaceName: 'ContactDetailsBlock',
  labels: { singular: 'Contact Details', plural: 'Contact Details' },
  fields: [
    ...sectionHeaderFields,
    {
      name: 'useGlobal',
      type: 'checkbox',
      defaultValue: true,
      label: 'Use the site contact details',
      admin: { description: 'Pull phone / email / address / hours from the Footer + Site Settings globals.' },
    },
    {
      name: 'items',
      type: 'array',
      label: 'Contact items',
      labels: { singular: 'Item', plural: 'Items' },
      admin: {
        condition: (_, s) => !s?.useGlobal,
        description: 'Manual override — each row is an icon + label + value (+ optional link/note).',
      },
      fields: [
        {
          type: 'row',
          fields: [
            iconField({ admin: { width: '30%' } }),
            inlineRichTextField('label', { required: true, admin: { width: '30%' } }),
            inlineRichTextField('value', { required: true, admin: { width: '40%' } }),
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'href', type: 'text', admin: { width: '50%', description: 'Optional (tel:/mailto:/URL).' } },
            inlineRichTextField('note', { admin: { width: '50%' } }),
          ],
        },
      ],
    },
    cssClassField,
    ...displayFields,
  ],
}
