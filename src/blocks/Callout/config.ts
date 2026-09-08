import type { Block } from 'payload'


import { linkGroup } from '@/fields/linkGroup'
import { cssClassField, iconField,
  richBodyField,
  inlineRichTextField,
} from '@/fields/blockFields'

// A standalone info/note callout usable directly in a page or Row column (unlike
// the Lexical-only `banner`). Covers the recurring "Good to know" notes, blue info
// boxes and FAQ help-cards across the design.
export const Callout: Block = {
  slug: 'callout',
  interfaceName: 'CalloutBlock',
  labels: { singular: 'Callout / Note', plural: 'Callouts' },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'style',
          type: 'select',
          defaultValue: 'info',
          admin: { width: '50%' },
          options: [
            { label: 'Info (blue)', value: 'info' },
            { label: 'Note (neutral)', value: 'note' },
            { label: 'Good to know (process note)', value: 'good-to-know' },
            { label: 'Reassurance box (icon)', value: 'reassurance' },
            { label: 'Success (green)', value: 'success' },
            { label: 'Warning (amber)', value: 'warning' },
          ],
        },
        iconField({ admin: { width: '50%' } }),
      ],
    },
    inlineRichTextField('tag', { admin: { description: 'Optional pill label, e.g. "Good to know".' } }),
    inlineRichTextField('heading'),
    richBodyField('body'),
    // Appearance is left in place deliberately. A callout link renders as
    // `.process-note-link`, a single treatment, so the choice has no effect —
    // but removing the field drops a populated column, and this schema has been
    // kept strictly additive. Say so in the description instead.
    linkGroup({
      overrides: {
        maxRows: 2,
        admin: {
          description:
            'Callout links all render in the same style, so a link’s Appearance (Default/Outline) makes no difference here.',
        },
      },
    }),
    cssClassField,
  ],
}
