import type { Block } from 'payload'

import { spacerSizeField } from '@/fields/blockFields'

// Atom block (nestable-only): vertical whitespace. Height comes from the editable
// spacing scale (Design System global).
export const Spacer: Block = {
  slug: 'spacer',
  interfaceName: 'SpacerBlock',
  labels: { singular: 'Spacer', plural: 'Spacers' },
  fields: [spacerSizeField],
}
