import type { Block } from 'payload'

import { linkGroup } from '@/fields/linkGroup'
import { cssClassField, displayFields, elementClassesField,
  inlineRichTextField,
} from '@/fields/blockFields'

export const CTABand: Block = {
  slug: 'ctaBand',
  interfaceName: 'CTABandBlock',
  labels: { singular: 'CTA Band', plural: 'CTA Bands' },
  // Always a dark gradient band — no background option.
  fields: [
    inlineRichTextField('eyebrow', {
      admin: { description: 'Small uppercase label above the heading (e.g. "Get Started").' },
    }),
    inlineRichTextField('heading', {
      required: true,
      admin: {
        description: 'Wrap a word/phrase in [[brackets]] to highlight it in the accent colour.',
      },
    }),
    inlineRichTextField('text'),
    linkGroup({ overrides: { maxRows: 2 } }),
    cssClassField,
    elementClassesField,
    ...displayFields,
  ],
}
