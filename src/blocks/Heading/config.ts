import type { Block } from 'payload'

import {
  cssClassField,
  headingLevelField,
  headingSizeField,
  textAlignField,
  inlineRichTextField,
} from '@/fields/blockFields'

// Atom block (nestable-only): a single heading. Level controls the HTML tag for
// SEO/accessibility; size controls the visual scale independently.
export const Heading: Block = {
  slug: 'heading',
  interfaceName: 'HeadingBlock',
  labels: { singular: 'Heading', plural: 'Headings' },
  fields: [
    inlineRichTextField('text', { required: true }),
    { type: 'row', fields: [headingLevelField, headingSizeField] },
    textAlignField,
    cssClassField,
  ],
}
