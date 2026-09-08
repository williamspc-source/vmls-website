import type { Block } from 'payload'

import {
  cssClassField,
  iconColorField,
  iconField,
  iconSizeField,
  textAlignField,
} from '@/fields/blockFields'

// Atom block (nestable-only): a standalone icon. Slug `iconBlock` (not `icon`) to
// avoid colliding with the icon-name field and keep block slugs globally unique.
export const IconBlock: Block = {
  slug: 'iconBlock',
  interfaceName: 'IconBlock',
  labels: { singular: 'Icon', plural: 'Icons' },
  fields: [
    iconField({ required: true }),
    { type: 'row', fields: [iconSizeField, iconColorField] },
    textAlignField,
    cssClassField,
  ],
}
