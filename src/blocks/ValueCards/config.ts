import type { Block, Field } from 'payload'

import {
  anchorIdField,
  backgroundField,
  cssClassField,
  displayFields,
  sectionHeaderFields,
  inlineRichTextField,
} from '@/fields/blockFields'

// The "Our Values" band from the About page — a dark section with a centred
// header and a 3-column grid of icon-less value cards (CCARRE). Alternating
// cards get a light-blue tint via CSS nth-child, so the grid needs no per-card
// styling field: authors just add cards in order. Every label, heading and card
// is editable; the six CCARRE values ship as defaults so the block matches the
// design out of the box.
export const ValueCards: Block = {
  slug: 'valueCards',
  interfaceName: 'ValueCardsBlock',
  labels: { singular: 'Value Cards', plural: 'Value Cards' },
  fields: [
    ...sectionHeaderFields,
    { ...backgroundField, defaultValue: 'dark' } as Field,
    {
      name: 'cards',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Value', plural: 'Values' },
      admin: {
        description:
          'Value cards, rendered in a 3-column grid. Every second card (2nd, 4th, 6th) is tinted light blue automatically.',
      },
      defaultValue: [
        {
          title: 'Client Focus',
          description:
            'We build trusted partnerships through integrity, care, and clear communication.',
        },
        {
          title: 'Continuous Learning',
          description:
            'We grow through professional development and industry knowledge-sharing.',
        },
        {
          title: 'Accountability',
          description: 'We take ownership of our actions, decisions, and commitments.',
        },
        {
          title: 'Reliability',
          description: 'We deliver timely, accurate, and dependable services.',
        },
        {
          title: 'Respect',
          description: 'We treat everyone with fairness, inclusivity, and dignity.',
        },
        {
          title: 'Excellence',
          description: 'We set the standard for quality, detail, and professionalism.',
        },
      ],
      fields: [
        inlineRichTextField('title', { required: true }),
        inlineRichTextField('description'),
      ],
    },
    cssClassField,
    anchorIdField,
    ...displayFields,
  ],
}
