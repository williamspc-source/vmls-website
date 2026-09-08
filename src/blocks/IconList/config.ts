import type { Block } from 'payload'

import {
  cssClassField,
  displayFields,
  iconField,
  sectionHeaderFields,
  inlineRichTextField,
} from '@/fields/blockFields'

// A simple single-line "icon + text" list (e.g. the booking-portal "What you can
// do" chips). Distinct from FeatureGrid, whose items are icon + title + description
// cards.
export const IconList: Block = {
  slug: 'iconList',
  interfaceName: 'IconListBlock',
  labels: { singular: 'Icon List', plural: 'Icon Lists' },
  fields: [
    ...sectionHeaderFields,
    {
      // The header alignment used to be the literal `align="center"` in the
      // component, so a left-aligned icon list was unreachable from the admin.
      // No defaultValue: unset keeps meaning centred, so no existing icon list
      // moves when this field appears.
      name: 'headingAlign',
      type: 'select',
      admin: { description: 'Alignment of the eyebrow, heading and intro above the list.' },
      options: [
        { label: 'Centred', value: 'center' },
        { label: 'Left', value: 'left' },
      ],
    },
    {
      name: 'columns',
      type: 'select',
      defaultValue: '1',
      options: [
        { label: '1 column', value: '1' },
        { label: '2 columns', value: '2' },
        { label: '3 columns', value: '3' },
      ],
    },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Item', plural: 'Items' },
      fields: [
        {
          type: 'row',
          fields: [
            iconField({ admin: { width: '30%' } }),
            inlineRichTextField('text', { required: true, admin: { width: '70%' } }),
          ],
        },
        {
          name: 'link',
          type: 'group',
          admin: { description: 'Optional link for this item.' },
          fields: [
            {
              name: 'url',
              type: 'text',
              admin: { description: 'Optional URL (leave empty for no link).' },
            },
          ],
        },
      ],
    },
    cssClassField,
    ...displayFields,
  ],
}
