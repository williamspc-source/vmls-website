import type { Block } from 'payload'

import {
  anchorIdField,
  backgroundField,
  cssClassField,
  gridDisplayFields,
  hideWhenEmptyField,
  sectionHeaderFields,
} from '@/fields/blockFields'

const sourceIs =
  (value: string) =>
  (_: unknown, siblingData: { source?: string } = {}) =>
    (siblingData?.source ?? 'auto') === value

// Lists the Resources collection (downloadable checklists / guides / templates)
// as a card grid. Mirrors the ServicesGrid auto/manual pattern.
export const ResourcesGrid: Block = {
  slug: 'resourcesGrid',
  interfaceName: 'ResourcesGridBlock',
  labels: { singular: 'Resources Grid', plural: 'Resources Grids' },
  fields: [
    ...sectionHeaderFields,
    backgroundField,
    {
      name: 'source',
      type: 'select',
      defaultValue: 'auto',
      options: [
        { label: 'Auto — list the Resources collection', value: 'auto' },
        { label: 'Hand-picked', value: 'manual' },
      ],
    },
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'card',
      admin: {
        description:
          '"Standard card" or "Resource card" (design-reference In-the-Loop .ni-resource-card — coloured header panel + body).',
      },
      options: [
        { label: 'Standard card', value: 'card' },
        { label: 'Resource card (In-the-Loop)', value: 'ni-resource' },
      ],
    },
    {
      type: 'row',
      admin: { condition: sourceIs('auto') },
      fields: [
        {
          name: 'audience',
          type: 'select',
          admin: { width: '50%', description: 'Optional — limit to one audience.' },
          options: [
            { label: 'Clients', value: 'clients' },
            { label: 'Claimants', value: 'claimants' },
            { label: 'Everyone', value: 'all' },
          ],
        },
        {
          name: 'resourceType',
          type: 'select',
          admin: { width: '50%', description: 'Optional — limit to one type.' },
          options: [
            { label: 'Checklist', value: 'checklist' },
            { label: 'Guide', value: 'guide' },
            { label: 'Template', value: 'template' },
            { label: 'Fact sheet', value: 'fact-sheet' },
          ],
        },
      ],
    },
    {
      name: 'resources',
      type: 'relationship',
      relationTo: 'resources',
      hasMany: true,
      admin: { condition: sourceIs('manual') },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'columns',
          type: 'select',
          defaultValue: '3',
          admin: { width: '50%' },
          options: [
            { label: '2', value: '2' },
            { label: '3', value: '3' },
            { label: '4', value: '4' },
          ],
        },
        {
          name: 'limit',
          type: 'number',
          defaultValue: 12,
          admin: { width: '50%', description: 'Max resources (auto source).' },
        },
      ],
    },
    anchorIdField,
    cssClassField,
    hideWhenEmptyField,
    ...gridDisplayFields,
  ],
}
