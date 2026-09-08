import type { Block } from 'payload'

import {
  backgroundField,
  cssClassField,
  sectionHeaderFields,
  inlineRichTextField,
  richTextDefault,
} from '@/fields/blockFields'

// The Specialty List page: specialties grouped by Specialty Category into a
// filterable accordion, each expanding to that specialty's roster of specialists.
// Data is pulled automatically from the Specialties + Specialists collections.
export const SpecialtyDirectory: Block = {
  slug: 'specialtyDirectory',
  interfaceName: 'SpecialtyDirectoryBlock',
  labels: { singular: 'Specialty Directory', plural: 'Specialty Directories' },
  fields: [
    ...sectionHeaderFields,
    backgroundField,
    {
      type: 'row',
      fields: [
        {
          name: 'showFilterBar',
          type: 'checkbox',
          defaultValue: true,
          label: 'Show category filter bar',
          admin: { width: '50%' },
        },
        {
          name: 'showRosters',
          type: 'checkbox',
          defaultValue: true,
          label: 'Expandable specialist rosters',
          admin: { width: '50%', description: 'List each specialty’s specialists inside the accordion.' },
        },
      ],
    },
    {
      name: 'showKeyAreas',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show "Key Areas" tags',
    },
    {
      type: 'row',
      fields: [
        inlineRichTextField('allTabLabel', { defaultValue: richTextDefault('All Specialties'),
          admin: { width: '50%', description: 'Label for the “all categories” filter tab.' } }),
        inlineRichTextField('emptyLabel', { defaultValue: richTextDefault('No specialties in this category yet.'),
          admin: { width: '50%', description: 'Message shown when a category has no specialties.' } }),
      ],
    },
    cssClassField,
  ],
}
