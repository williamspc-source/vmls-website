import type { Block, Field } from 'payload'

import {
  anchorIdField,
  backgroundField,
  containerWidthField,
  cssClassField,
  motionField,
  richTextDefault,
  sectionHeaderFields,
  inlineRichTextField,
} from '@/fields/blockFields'

// Reuse the shared eyebrow/heading/subheading helper, but seed the fixed
// design-reference copy as defaults and relabel `subheading` as the mission
// statement so the admin reads naturally.
const missionHeaderFields: Field[] = sectionHeaderFields.map((field) => {
  if (!('name' in field)) return field
  if (field.name === 'eyebrow') {
    return { ...field, defaultValue: richTextDefault('Our Mission') }
  }
  if (field.name === 'heading') {
    return { ...field, defaultValue: richTextDefault('Excellence in [[Medico-Legal Reporting]]') }
  }
  if (field.name === 'subheading') {
    return {
      ...field,
      label: 'Mission statement',
      admin: {
        description: 'Intro paragraph shown under the heading (optional).',
      },
      defaultValue: richTextDefault(
        'VERIFY provides high levels of support to both our clients and medical specialists throughout every step of the medico-legal process. At VERIFY, we dedicate ourselves to achieving excellence in medico-legal reporting through:',
      ),
    }
  }
  return field
}) as Field[]

export const MissionPillars: Block = {
  slug: 'missionPillars',
  interfaceName: 'MissionPillarsBlock',
  labels: { singular: 'Mission Pillars', plural: 'Mission Pillars' },
  fields: [
    // Dark blue gradient panel by default — the .mv-mission-panel class supplies
    // its own gradient; this drives the section banding / text treatment.
    { ...backgroundField, defaultValue: 'hero' } as Field,
    ...missionHeaderFields,
    {
      name: 'pillars',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Pillar', plural: 'Pillars' },
      admin: {
        description: 'Each pillar is auto-numbered 01, 02, 03… in display order.',
        initCollapsed: false,
      },
      fields: [inlineRichTextField('text', { required: true })],
      defaultValue: [
        {
          text: 'Delivering expert, evidence-based medico-legal reports with accuracy, clarity, and integrity — reflecting the highest professional standards.',
        },
        {
          text: 'Providing exceptional service that fosters long-term, trust-based partnerships with our clients.',
        },
        {
          text: 'Ensuring reliable, timely turnaround supported by efficient systems and clear communication.',
        },
        {
          text: 'Upholding accountability and respect in every interaction, both within our team and with external stakeholders.',
        },
        {
          text: 'Fostering continuous learning through internal development and industry-wide education to support excellence and raise standards across the sector.',
        },
        {
          text: 'Driving innovation and improvement in our processes and technology to deliver dependable, client-focused solutions.',
        },
      ],
    },
    containerWidthField,
    motionField,
    cssClassField,
    anchorIdField,
  ],
}
