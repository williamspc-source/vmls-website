import type { Block } from 'payload'

import { link } from '@/fields/link'
import {
  anchorIdField,
  backgroundField,
  cssClassField,
  displayFields,
  sectionHeaderFields,
  inlineRichTextField,
} from '@/fields/blockFields'

// Dual audience-pathway cards (design ref: services/medico-legal/ime.html →
// `.ime-pathways`). Two side-by-side cards, each a coloured header + a numbered
// step list + a CTA. One card styled dark-blue ("client"), the other light-blue
// ("claimant"); the per-card `variant` picks which treatment applies. Every label,
// step and link is editable.
export const AudiencePathways: Block = {
  slug: 'audiencePathways',
  interfaceName: 'AudiencePathwaysBlock',
  // Renamed to distinguish it from Gateway Cards, which renders a near-identical
  // "For Clients / For Claimants" pair on the homepage. An editor asked to change
  // the homepage cards used to open this block, find different copy, and conclude
  // the CMS was out of sync with the site.
  labels: {
    singular: 'Audience Pathways (numbered steps, service pages)',
    plural: 'Audience Pathways',
  },
  fields: [
    ...sectionHeaderFields,
    backgroundField,
    {
      name: 'pathways',
      type: 'array',
      minRows: 1,
      maxRows: 2,
      labels: { singular: 'Pathway', plural: 'Pathways' },
      admin: {
        description: 'Two audience pathway cards shown side by side.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'variant',
          type: 'select',
          defaultValue: 'client',
          admin: {
            description:
              'Card treatment. "Client" = dark-blue header; "Claimant" = light-blue header.',
          },
          options: [
            { label: 'Client (dark blue)', value: 'client' },
            { label: 'Claimant (light blue)', value: 'claimant' },
          ],
        },
        inlineRichTextField('eyebrow', { admin: { description: 'Small uppercase audience label, e.g. "For Clients".' } }),
        inlineRichTextField('title', { admin: { description: 'Card heading (h3).' } }),
        inlineRichTextField('description', { admin: { description: 'Short intro paragraph under the card heading.' } }),
        {
          name: 'steps',
          type: 'array',
          minRows: 1,
          labels: { singular: 'Step', plural: 'Steps' },
          admin: { description: 'Numbered steps (numbers are added automatically).' },
          fields: [
            inlineRichTextField('title', { required: true,
              admin: { description: 'Bold step lead-in.' } }),
            inlineRichTextField('description', { admin: { description: 'Step detail text.' } }),
          ],
        },
        link({ appearances: false, overrides: { label: 'CTA link' } }),
      ],
    },
    anchorIdField,
    cssClassField,
    ...displayFields,
  ],
}
