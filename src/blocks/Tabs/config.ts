import type { Block } from 'payload'

import {
  anchorIdField,
  backgroundField,
  contentBlocksField,
  cssClassField,
  displayFields,
  elementClassesField,
  iconField,
  sectionHeaderFields,
  inlineRichTextField,
} from '@/fields/blockFields'
import { TAB_CONTENT_BLOCKS } from '../tabContent'

export const TabsBlock: Block = {
  slug: 'tabs',
  interfaceName: 'TabsBlockType',
  labels: { singular: 'Tabbed Section', plural: 'Tabbed Sections' },
  fields: [
    ...sectionHeaderFields,
    backgroundField,
    {
      name: 'tabs',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Tab', plural: 'Tabs' },
      fields: [
        {
          type: 'row',
          fields: [
            inlineRichTextField('label', { required: true, admin: { width: '70%' } }),
            iconField({ admin: { width: '30%', description: 'Optional tab icon.' } }),
          ],
        },
        contentBlocksField(TAB_CONTENT_BLOCKS, {
          admin: { description: 'Blocks shown when this tab is active (grids, steps, text, etc.).' },
        }),
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'tabStyle',
          type: 'select',
          defaultValue: 'pills',
          admin: { width: '50%' },
          options: [
            { label: 'Pills', value: 'pills' },
            { label: 'Underline', value: 'underline' },
          ],
        },
        {
          name: 'defaultTab',
          type: 'number',
          defaultValue: 0,
          admin: { width: '50%', description: 'Index of the tab open by default (0 = first).' },
        },
      ],
    },
    anchorIdField,
    cssClassField,
    elementClassesField,
    ...displayFields,
  ],
}
