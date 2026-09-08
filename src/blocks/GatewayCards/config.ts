import type { Block } from 'payload'

import { link } from '@/fields/link'
import {
  backgroundField,
  cssClassField,
  elementClassesField,
  gridDisplayFields,
  iconField,
  sectionHeaderFields,
  inlineRichTextField,
} from '@/fields/blockFields'

export const GatewayCards: Block = {
  slug: 'gatewayCards',
  interfaceName: 'GatewayCardsBlock',
  labels: {
    singular: 'Gateway Cards (homepage “For Clients / For Claimants”)',
    plural: 'Gateway Cards',
  },
  fields: [
    ...sectionHeaderFields,
    backgroundField,
    {
      name: 'columns',
      type: 'select',
      defaultValue: '3',
      options: [
        { label: '2 columns', value: '2' },
        { label: '3 columns', value: '3' },
        { label: '4 columns', value: '4' },
      ],
    },
    {
      name: 'cards',
      type: 'array',
      minRows: 1,
      maxRows: 4,
      labels: { singular: 'Card', plural: 'Cards' },
      fields: [
        iconField(),
        {
          type: 'row',
          fields: [
            inlineRichTextField('eyebrow', { admin: { width: '50%', description: 'Small label above the title.' } }),
            inlineRichTextField('subtitle', { admin: { width: '50%', description: 'Secondary line under the title (e.g. audience).' } }),
          ],
        },
        inlineRichTextField('title', { required: true }),
        inlineRichTextField('description'),
        {
          type: 'row',
          fields: [
            {
              name: 'accent',
              type: 'select',
              defaultValue: 'blue',
              admin: { width: '50%', description: 'Card accent colour theme.' },
              options: [
                { label: 'Blue', value: 'blue' },
                { label: 'Steel', value: 'steel' },
                { label: 'Charcoal', value: 'charcoal' },
              ],
            },
            {
              name: 'theme',
              type: 'select',
              defaultValue: 'light',
              admin: { width: '50%', description: 'Light or dark card surface (for the split chooser).' },
              options: [
                { label: 'Light', value: 'light' },
                { label: 'Dark', value: 'dark' },
              ],
            },
          ],
        },
        {
          name: 'links',
          type: 'array',
          label: 'Quick links',
          labels: { singular: 'Link', plural: 'Links' },
          maxRows: 6,
          admin: { description: 'Listed in the lower panel above the call-to-action button.' },
          fields: [link({ appearances: false })],
        },
        link(),
      ],
    },
    cssClassField,
    elementClassesField,
    ...gridDisplayFields,
  ],
}
