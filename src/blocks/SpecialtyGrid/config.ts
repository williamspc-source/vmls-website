import type { Block } from 'payload'

import { link } from '@/fields/link'
import {
  backgroundField,
  cssClassField,
  elementClassesField,
  gridDisplayFields,
  iconField,
  sectionHeaderFields,
  inlineRichTextField,
  richTextDefault,
} from '@/fields/blockFields'

const sourceIs =
  (value: string) =>
  (_: unknown, siblingData: { source?: string } = {}) =>
    (siblingData?.source ?? 'auto') === value

export const SpecialtyGrid: Block = {
  slug: 'specialtyGrid',
  interfaceName: 'SpecialtyGridBlock',
  labels: { singular: 'Specialty Grid', plural: 'Specialty Grids' },
  fields: [
    ...sectionHeaderFields,
    backgroundField,
    {
      name: 'source',
      type: 'select',
      defaultValue: 'auto',
      options: [
        { label: 'Auto — list a taxonomy', value: 'auto' },
        { label: 'Hand-picked', value: 'manual' },
      ],
    },
    {
      type: 'row',
      admin: { condition: sourceIs('auto') },
      fields: [
        {
          name: 'taxonomy',
          type: 'select',
          defaultValue: 'specialties',
          admin: { width: '50%', description: 'Which taxonomy to list.' },
          options: [
            { label: 'Specialties', value: 'specialties' },
            { label: 'Claim types', value: 'claim-types' },
            { label: 'Areas of expertise', value: 'areas-of-expertise' },
            { label: 'Assessment types', value: 'assessment-types' },
          ],
        },
        {
          name: 'variant',
          type: 'select',
          defaultValue: 'cards',
          admin: { width: '50%', description: 'Icon cards, or an arrow checklist (e.g. "Claims We Support").' },
          options: [
            { label: 'Icon cards', value: 'cards' },
            { label: 'Arrow checklist', value: 'checklist' },
          ],
        },
      ],
    },
    {
      name: 'columns',
      type: 'select',
      defaultValue: '4',
      admin: {
        description: 'Cards per row. Not used by the arrow checklist, which is a single list.',
        // The checklist variant renders a <ul>, not a grid, so `columns` has no
        // effect there — hide it rather than offer a control that silently does
        // nothing (see the isChecklist branch in ./Component.tsx).
        condition: (_, d) => (d as { variant?: string })?.variant !== 'checklist',
      },
      options: [
        { label: '2', value: '2' },
        { label: '3', value: '3' },
        { label: '4', value: '4' },
      ],
    },
    // Auto mode
    iconField({
      name: 'defaultIcon',
      label: 'Default icon',
      defaultValue: 'stethoscope',
      admin: { condition: sourceIs('auto'), description: 'Icon used for every specialty.' },
    }),
    {
      name: 'linkToDirectory',
      type: 'checkbox',
      label: 'Link each specialty to the directory',
      admin: { condition: sourceIs('auto') },
    },
    {
      name: 'directoryPath',
      type: 'text',
      defaultValue: '/specialists/specialist-panel',
      admin: {
        condition: (_, d) => sourceIs('auto')(_, d) && Boolean((d as { linkToDirectory?: boolean })?.linkToDirectory),
        description: 'Links become <path>?specialty=<slug>. Default: the Specialist Panel directory.',
      },
    },
    // Manual mode
    {
      name: 'items',
      type: 'array',
      labels: { singular: 'Specialty', plural: 'Specialties' },
      admin: { condition: sourceIs('manual') },
      fields: [iconField(), inlineRichTextField('label', { required: true }), link({ appearances: false })],
    },
    inlineRichTextField('ctaLabel', { defaultValue: richTextDefault('View experts →'),
      admin: { description: 'Call-to-action shown on each linked card (only appears when the tile links somewhere).' } }),
    cssClassField,
    elementClassesField,
    ...gridDisplayFields,
  ],
}
