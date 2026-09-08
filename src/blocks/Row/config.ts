import type { Block } from 'payload'

import {
  alignYField,
  anchorIdField,
  columnSpanField,
  contentBlocksField,
  cssClassField,
  gapField,
  textAlignField,
} from '@/fields/blockFields'
import { NESTABLE_BLOCKS } from '../nestable'

// Layout primitive: a responsive column grid. The number of columns is derived
// from how many columns you add; each column holds its own nested content and can
// span extra tracks. Stacks to a single column on mobile.
export const Row: Block = {
  slug: 'row',
  interfaceName: 'RowBlock',
  labels: { singular: 'Row / Columns', plural: 'Rows' },
  fields: [
    { type: 'row', fields: [gapField, alignYField] },
    {
      // The grid is otherwise equal tracks derived from the column count, which
      // cannot express the design reference's asymmetric two-column bands (the
      // join-expert-panel enquiry section is 1fr 1.5fr). Declares NO
      // defaultValue: unset must keep meaning "equal", so adding this field
      // moves no existing row, and so a repair can tell "never set" from a
      // deliberate choice.
      name: 'columnRatio',
      type: 'select',
      admin: {
        description:
          'Relative width of the columns. Applies to two-column rows only; leave unset for equal columns.',
      },
      options: [
        { label: 'Equal', value: 'equal' },
        // 2 : 3 IS the reference's 1fr 1.5fr, expressed without a dot — a dot in
        // a class name is legal in HTML but has to be escaped in the selector,
        // which is a needless trap for one decimal point.
        { label: '1 : 1.5 (narrow left)', value: '2-3' },
        { label: '1.5 : 1 (narrow right)', value: '3-2' },
        { label: '1 : 2 (narrow left)', value: '1-2' },
        { label: '2 : 1 (narrow right)', value: '2-1' },
      ],
    },
    {
      name: 'columns',
      type: 'array',
      label: 'Columns',
      labels: { singular: 'Column', plural: 'Columns' },
      minRows: 1,
      admin: {
        initCollapsed: true,
        description: 'Each column becomes a grid track. Add columns to widen the row.',
        components: { RowLabel: '@/blocks/Row/ColumnRowLabel#ColumnRowLabel' },
      },
      fields: [
        { type: 'row', fields: [columnSpanField, textAlignField] },
        contentBlocksField(NESTABLE_BLOCKS),
      ],
    },
    cssClassField,
    anchorIdField,
  ],
}
