import type { Block } from 'payload'


import {
  anchorIdField,
  cssClassField,
  iconField,
  sectionHeaderFields,
  richBodyField,
  inlineRichTextField,
} from '@/fields/blockFields'

const richBody = richBodyField('body')

// The For-Claimants "Appointment Guide": a top-level type toggle (In-Person /
// Videolink), each holding a set of tabs, each tab holding icon-led item lists,
// optional highlight cards and an optional callout. Two levels of nesting that no
// existing block expresses.
export const AppointmentGuide: Block = {
  slug: 'appointmentGuide',
  // Short DB name — the deep nesting (block → types → tabs → cards → icon) would
  // otherwise blow past Postgres's 63-char identifier limit for generated enums.
  dbName: 'appt_guide',
  interfaceName: 'AppointmentGuideBlock',
  labels: { singular: 'Appointment Guide', plural: 'Appointment Guides' },
  fields: [
    ...sectionHeaderFields,
    inlineRichTextField('selectLabel', { label: 'Type selector label',
      admin: {
        description:
          'Small uppercase label shown above the appointment-type toggle. Defaults to "Select your appointment type".',
      } }),
    {
      name: 'types',
      type: 'array',
      minRows: 1,
      label: 'Appointment types',
      labels: { singular: 'Type', plural: 'Types' },
      admin: { description: 'The top-level toggle (e.g. In-Person, Videolink).' },
      fields: [
        {
          type: 'row',
          fields: [
            iconField({ admin: { width: '20%' } }),
            inlineRichTextField('label', { required: true, admin: { width: '40%' } }),
            inlineRichTextField('sublabel', { admin: { width: '40%' } }),
          ],
        },
        // Rendered as the id on this type's toggle button, so a link ending
        // `#<anchorId>` scrolls here AND selects this type. The design reference
        // does the same (in-person-appointment / videolink-appointment on its
        // tab buttons). Read by GuideClient; without it the guide cannot be
        // deep-linked at all, which is why the homepage's Videolink link used to
        // point at the separate video section instead.
        anchorIdField,
        {
          name: 'tabs',
          type: 'array',
          minRows: 1,
          labels: { singular: 'Tab', plural: 'Tabs' },
          fields: [
            {
              type: 'row',
              fields: [
                iconField({ admin: { width: '30%' } }),
                inlineRichTextField('label', { required: true, admin: { width: '70%' } }),
              ],
            },
            {
              name: 'items',
              type: 'array',
              label: 'Items',
              fields: [iconField(), inlineRichTextField('heading', { required: true }), richBody],
            },
            {
              name: 'highlightCards',
              type: 'array',
              label: 'Highlight cards',
              dbName: 'hcards',
              fields: [
                iconField(),
                inlineRichTextField('title', { required: true }),
                {
                  name: 'bullets',
                  type: 'array',
                  fields: [inlineRichTextField('text', { required: true })],
                },
              ],
            },
            {
              name: 'callout',
              type: 'group',
              label: 'Callout (optional)',
              fields: [
                {
                  name: 'style',
                  type: 'select',
                  defaultValue: 'info',
                  options: [
                    { label: 'Info', value: 'info' },
                    { label: 'Note', value: 'note' },
                    { label: 'Warning', value: 'warning' },
                  ],
                },
                inlineRichTextField('text'),
              ],
            },
          ],
        },
      ],
    },
    cssClassField,
  ],
}
