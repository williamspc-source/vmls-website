import type { Block } from 'payload'

import {
  backgroundField,
  cssClassField,
  elementClassesField,
  gridDisplayFields,
  iconField,
  headingWeightField,
  sectionHeaderFields,
  inlineRichTextField,
} from '@/fields/blockFields'

export const FeatureGrid: Block = {
  slug: 'featureGrid',
  interfaceName: 'FeatureGridBlock',
  labels: { singular: 'Feature Grid', plural: 'Feature Grids' },
  fields: [
    ...sectionHeaderFields,
    backgroundField,
    {
      name: 'columns',
      type: 'select',
      defaultValue: '3',
      options: [
        { label: '1 (vertical list)', value: '1' },
        { label: '2 columns', value: '2' },
        { label: '3 columns', value: '3' },
        { label: '4 columns', value: '4' },
      ],
    },
    {
      name: 'cardStyle',
      type: 'select',
      defaultValue: 'card',
      options: [
        { label: 'Card (bordered)', value: 'card' },
        { label: 'Plain (no border)', value: 'plain' },
        { label: 'Banded (tinted header)', value: 'banded' },
        { label: 'Soft (flat white, gentle hover)', value: 'soft' },
        { label: 'Benefit (plain icon, centred)', value: 'benefit' },
      ],
      admin: {
        description:
          '“Banded” puts the icon and title on a tinted panel across the top of each card, with the description and details below it. “Soft” is the quieter treatment used for the support cards on Information for Clients — flat white, a softer shadow, and a gentle lift on hover instead of the bolder shift. “Benefit” is the centred treatment used for “Why Join VERIFY” on Join the Expert Panel — no icon tile, just a large plain icon above a centred title, with the description justified.',
      },
    },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Feature', plural: 'Features' },
      fields: [
        iconField(),
        inlineRichTextField('title', { required: true }),
        inlineRichTextField('titleSuffix', { admin: { description: 'Optional second-line / type label under the title (e.g. "In-Person").' } }),
        inlineRichTextField('description'),
        {
          name: 'bullets',
          type: 'array',
          labels: { singular: 'Bullet', plural: 'Bullets' },
          admin: { description: 'Optional simple bulleted list.' },
          fields: [inlineRichTextField('text', { required: true })],
        },
        inlineRichTextField('detailsLabel', { admin: { description: 'Optional label above a nested detail list (e.g. "What\'s Included").' } }),
        {
          name: 'details',
          type: 'array',
          label: 'Detail items',
          labels: { singular: 'Detail', plural: 'Details' },
          admin: { description: 'Nested icon + title + description sub-items (e.g. Assessment Format cards).' },
          fields: [
            iconField(),
            inlineRichTextField('title', { required: true }),
            inlineRichTextField('description'),
          ],
        },
      ],
    },
    headingWeightField,
    cssClassField,
    elementClassesField,
    ...gridDisplayFields,
  ],
}
