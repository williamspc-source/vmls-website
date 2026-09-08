import type { Block } from 'payload'

import { cssClassField } from '@/fields/blockFields'

export const MediaBlock: Block = {
  slug: 'mediaBlock',
  interfaceName: 'MediaBlock',
  fields: [
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    cssClassField,
  ],
}
