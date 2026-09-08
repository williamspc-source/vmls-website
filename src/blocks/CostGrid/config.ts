import type { Block, Field } from 'payload'


import {
  anchorIdField,
  cssClassField,
  iconField,
  richBodyField,
  sectionHeaderFieldsWithDefaults,
  inlineRichTextField,
} from '@/fields/blockFields'

// Sensible defaults for the section header, mirroring the design reference
// (information-centre/for-clients.html → .cost-header). Reuses the shared
// sectionHeaderFields helper but injects the design's fixed copy as defaults so
// the block ships looking right and stays fully editable.
const headerDefaults: Record<string, string> = {
  eyebrow: 'Cost Control',
  heading: "Minimising Your Client's [[Report Costs]]",
  subheading:
    'Most avoidable reporting costs arise from brief size, late material, or appointment changes. Early, focused instructions help us keep the process efficient.',
}
const costHeaderFields: Field[] = sectionHeaderFieldsWithDefaults(headerDefaults)

// Cost / inclusions grid on a dark band: translucent white cards, each with an
// icon, title and description, plus a trailing emphasis note. Mirrors the
// design reference's .cost-section. Every field is admin-editable.
export const CostGrid: Block = {
  slug: 'costGrid',
  interfaceName: 'CostGridBlock',
  labels: { singular: 'Cost Grid (dark)', plural: 'Cost Grids' },
  fields: [
    ...costHeaderFields,
    {
      name: 'cards',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Cost card', plural: 'Cost cards' },
      admin: {
        description: 'Translucent cards on the dark band (e.g. cost-control tips or inclusions).',
        initCollapsed: true,
      },
      defaultValue: [
        {
          icon: 'file-text',
          title: 'Keep the brief and LOI focused',
          description:
            'Ensure the referral question and speciality are clearly outlined in the letter of instruction. Limit the brief to material relevant to the examination, with records relevant only and duplicates removed where possible. If a brief is unnecessarily large, we can discuss whether it can be reduced before it is sent to the specialist and before additional reading fees are incurred.',
        },
        {
          icon: 'calendar',
          title: 'Send material at least 5 business days before',
          description:
            'Significant preparation is completed by the examiner and VERIFY before an examination. Please ensure all material, including the letter of instruction and brief, is sent in one complete batch wherever possible. If material is not provided in time, the examination may need to be rescheduled or cancelled, and a fee may apply.',
        },
        {
          icon: 'warning',
          title: 'Flag attendance risks early',
          description:
            'Ensure any interpreter, videolink, travel, or claimant communication requirements are raised with VERIFY well in advance. If a claimant may not attend or may need to reschedule, please notify us as soon as possible. Non-attendance or late cancellation fees may apply when less than five business days notice is given.',
        },
      ],
      fields: [
        iconField(),
        inlineRichTextField('title', { required: true }),
        inlineRichTextField('description'),
      ],
    },
    richBodyField('note', {
      label: 'Emphasis note',
      admin: {
        description:
          'Trailing emphasis paragraph below the cards (supports links, e.g. terms & conditions).',
      },
    }),
    anchorIdField,
    cssClassField,
  ],
}
