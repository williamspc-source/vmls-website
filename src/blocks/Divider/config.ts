import type { Block } from 'payload'

import {
  cssClassField,
  dividerStyleField,
  dividerWidthField,
  textAlignField,
} from '@/fields/blockFields'

// Atom block (nestable-only): a horizontal rule / separator.
export const Divider: Block = {
  slug: 'divider',
  interfaceName: 'DividerBlock',
  labels: { singular: 'Divider', plural: 'Dividers' },
  fields: [
    { type: 'row', fields: [dividerStyleField, dividerWidthField] },
    textAlignField,
    cssClassField,
  ],
}
