import type { Block } from 'payload'

import {
  backgroundField,
  cssClassField,
  elementClassesField,
  gridDisplayFields,
  sectionHeaderFields,
} from '@/fields/blockFields'

const sourceIs =
  (value: string) =>
  (_: unknown, siblingData: { source?: string } = {}) =>
    (siblingData?.source ?? 'auto') === value

export const TestimonialsGrid: Block = {
  slug: 'testimonialsGrid',
  interfaceName: 'TestimonialsGridBlock',
  labels: { singular: 'Testimonials Grid', plural: 'Testimonials Grids' },
  fields: [
    ...sectionHeaderFields,
    backgroundField,
    {
      name: 'source',
      type: 'select',
      defaultValue: 'auto',
      options: [
        { label: 'Auto — list the Testimonials collection', value: 'auto' },
        { label: 'Hand-picked', value: 'manual' },
      ],
    },
    {
      name: 'featuredOnly',
      type: 'checkbox',
      label: 'Only featured testimonials',
      admin: { condition: sourceIs('auto') },
    },
    {
      name: 'testimonials',
      type: 'relationship',
      relationTo: 'testimonials',
      hasMany: true,
      admin: { condition: sourceIs('manual') },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'layout',
          type: 'select',
          defaultValue: 'grid',
          admin: { width: '34%' },
          options: [
            { label: 'Grid', value: 'grid' },
            { label: 'Carousel', value: 'carousel' },
          ],
        },
        {
          name: 'columns',
          type: 'select',
          defaultValue: '3',
          admin: { width: '33%' },
          options: [
            { label: '2', value: '2' },
            { label: '3', value: '3' },
            { label: '4', value: '4' },
          ],
        },
        {
          name: 'limit',
          type: 'number',
          defaultValue: 6,
          admin: { width: '33%', description: 'Max testimonials to show (auto source).' },
        },
      ],
    },
    {
      name: 'carouselOptions',
      type: 'group',
      label: 'Carousel options',
      admin: {
        condition: (_, siblingData) => (siblingData as { layout?: string })?.layout === 'carousel',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'visible',
              type: 'number',
              defaultValue: 1,
              label: 'Cards visible',
              admin: { width: '50%' },
            },
            { name: 'showArrows', type: 'checkbox', defaultValue: true, label: 'Show arrows' },
          ],
        },
      ],
    },
    cssClassField,
    elementClassesField,
    ...gridDisplayFields,
  ],
}
