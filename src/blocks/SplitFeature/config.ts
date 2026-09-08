import type { Block } from 'payload'


import { link } from '@/fields/link'
import {
  anchorIdField,
  backgroundField,
  cssClassField,
  displayFields,
  elementClassesField,
  iconField,
  headingWeightField,
  sectionHeaderFields,
  richBodyField,
  inlineRichTextField,
} from '@/fields/blockFields'

export const SplitFeature: Block = {
  slug: 'splitFeature',
  interfaceName: 'SplitFeatureBlock',
  labels: { singular: 'Split Feature', plural: 'Split Features' },
  fields: [
    ...sectionHeaderFields,
    backgroundField,
    // ── Presentation variants ────────────────────────────────────────────────
    // Each design the reference asks for is a *setting* here rather than a rule
    // scoped to one page's class, so any Split Feature section can take it. All
    // three default to what already renders, so adding them moves nothing.
    {
      name: 'rowStyle',
      type: 'select',
      defaultValue: 'spaced',
      options: [
        { label: 'Spaced (gap between rows)', value: 'spaced' },
        { label: 'Divided by a rule', value: 'divided' },
      ],
      admin: {
        description:
          '“Divided” separates each row with a hairline rule instead of a gap — the Reporting Services treatment.',
      },
    },
    {
      name: 'density',
      type: 'select',
      defaultValue: 'default',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Compact', value: 'compact' },
      ],
      admin: {
        description:
          '“Compact” steps the whole section’s type down a size — heading, intro, row titles, body and bullets.',
      },
    },
    {
      name: 'bulletStyle',
      type: 'select',
      defaultValue: 'check',
      options: [
        { label: 'Tick icon', value: 'check' },
        { label: 'Plain dot', value: 'dot' },
      ],
      admin: {
        description:
          'Marker for bullets that have no icon of their own. A bullet with its own icon always keeps it.',
      },
    },
    {
      name: 'rows',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Row', plural: 'Rows' },
      admin: { description: 'Each row alternates image side automatically unless overridden.' },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media' },
        {
          name: 'imagePlaceholder',
          type: 'checkbox',
          label: 'Show an image placeholder when no image is set',
          admin: {
            description:
              'Keeps the two-column layout with a pale-blue placeholder tile until a real image is uploaded. Uploading an image above replaces the placeholder entirely — label and icon included — so you can leave this ticked.',
          },
        },
        inlineRichTextField('placeholderLabel', {
          admin: {
            condition: (_, sib) => Boolean((sib as { imagePlaceholder?: boolean })?.imagePlaceholder),
            description: 'Optional caption inside the placeholder (e.g. "COMPANY PHOTO PLACEHOLDER").',
          },
        }),
        iconField({
          name: 'placeholderIcon',
          admin: {
            condition: (_, sib) => Boolean((sib as { imagePlaceholder?: boolean })?.imagePlaceholder),
            description: 'Optional glyph drawn above the placeholder caption.',
          },
        }),
        {
          name: 'imageSide',
          type: 'select',
          defaultValue: 'auto',
          options: [
            { label: 'Auto (alternate)', value: 'auto' },
            { label: 'Left', value: 'left' },
            { label: 'Right', value: 'right' },
          ],
        },
        {
          type: 'row',
          fields: [
            inlineRichTextField('eyebrow', { admin: { width: '50%' } }),
            iconField({ admin: { width: '50%', description: 'Optional icon above the title.' } }),
          ],
        },
        inlineRichTextField('title', { required: true }),
        richBodyField('body'),
        inlineRichTextField('bulletsLabel', {
          admin: { description: 'Optional mini-heading above the bullets (e.g. "When to Request").' },
        }),
        {
          name: 'bullets',
          type: 'array',
          labels: { singular: 'Bullet', plural: 'Bullets' },
          fields: [
            inlineRichTextField('text', { required: true }),
            iconField({ admin: { description: 'Optional per-bullet icon.' } }),
          ],
        },
        link({ appearances: false, optional: true }),
        anchorIdField,
      ],
    },
    headingWeightField,
    cssClassField,
    elementClassesField,
    ...displayFields,
  ],
}
