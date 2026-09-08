import type { Block } from 'payload'

import {
  alignField,
  anchorIdField,
  backgroundField,
  containerWidthField,
  contentBlocksField,
  cssClassField,
  motionField,
  spacingFields,
} from '@/fields/blockFields'
import { Row } from '../Row/config'
import { NESTABLE_BLOCKS } from '../nestable'

// Layout primitive: the canonical container. Owns background banding, container
// width, vertical padding and motion, and holds freeform nested content (Rows,
// atoms and rich blocks). Cannot be nested inside another Section.
export const Section: Block = {
  slug: 'section',
  interfaceName: 'SectionBlock',
  labels: { singular: 'Section', plural: 'Sections' },
  fields: [
    { type: 'row', fields: [backgroundField, containerWidthField] },
    ...spacingFields,
    { type: 'row', fields: [motionField, alignField] },
    contentBlocksField([Row, ...NESTABLE_BLOCKS]),
    cssClassField,
    anchorIdField,
  ],
}
