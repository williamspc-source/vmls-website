import type { Block, Field } from 'payload'

import {
  backgroundField,
  cssClassField,
  displayFields,
  elementClassesField,
  sectionHeaderFields,
  inlineRichTextField,
} from '@/fields/blockFields'

export const StatsBand: Block = {
  slug: 'statsBand',
  interfaceName: 'StatsBandBlock',
  labels: { singular: 'Stats Band', plural: 'Stats Bands' },
  fields: [
    ...sectionHeaderFields,
    { ...backgroundField, defaultValue: 'primary' } as Field,
    {
      name: 'stats',
      type: 'array',
      minRows: 1,
      maxRows: 6,
      labels: { singular: 'Stat', plural: 'Stats' },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'value',
              type: 'number',
              required: true,
              admin: { width: '33%', description: 'The number to count up to.' },
            },
            inlineRichTextField('prefix', { admin: { width: '33%', description: 'e.g. "$" (optional).' } }),
            inlineRichTextField('suffix', { admin: { width: '33%', description: 'e.g. "+" or "%" (optional).' } }),
          ],
        },
        inlineRichTextField('label', { required: true }),
      ],
    },
    cssClassField,
    elementClassesField,
    ...displayFields,
  ],
}
