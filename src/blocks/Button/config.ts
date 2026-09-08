import type { Block } from 'payload'

import { linkGroup } from '@/fields/linkGroup'
import { buttonSizeField, cssClassField, textAlignField } from '@/fields/blockFields'

// Atom block (nestable-only): one or more buttons/links rendered as a group.
export const Button: Block = {
  slug: 'button',
  interfaceName: 'ButtonBlock',
  labels: { singular: 'Button(s)', plural: 'Button groups' },
  fields: [
    linkGroup({
      appearances: ['default', 'outline'],
      // Offers "Registration enquiry email". Safe here because ButtonBlock
      // resolves that type into a mailto before it reaches CMSLink.
      portalEnquiry: true,
      overrides: { minRows: 1, maxRows: 4, label: 'Buttons' },
    }),
    { type: 'row', fields: [buttonSizeField, textAlignField] },
    cssClassField,
  ],
}
