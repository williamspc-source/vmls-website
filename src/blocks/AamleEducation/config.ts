import type { Block } from 'payload'


import { link } from '@/fields/link'
import {
  anchorIdField,
  backgroundField,
  containerWidthField,
  cssClassField,
  iconField,
  motionField,
  richBodyField,
  inlineRichTextField,
  richTextDefault,
} from '@/fields/blockFields'

// AAMLE educational-services section (Services page "Educational Services").
// Reproduces the design reference's simple two-column layout: a large AAMLE
// wordmark + subheading, a CPD-eligible pill badge, a short intro paragraph, a
// compact icon checklist and a CTA on the left; an image (or grey placeholder)
// on the right. Every label, icon, checklist item, paragraph, badge and link is
// editable. Rendered standalone and nested inside a Tabs panel (bare mode).
export const AamleEducation: Block = {
  slug: 'aamleEducation',
  interfaceName: 'AamleEducationBlock',
  labels: { singular: 'AAMLE Education', plural: 'AAMLE Education Sections' },
  fields: [
    backgroundField,

    // ── Left column: heading block ──
    inlineRichTextField('eyebrow', {
      defaultValue: richTextDefault('Educational Services'),
      admin: { description: 'Small uppercase label above the wordmark.' },
    }),
    inlineRichTextField('wordmark', {
      defaultValue: richTextDefault('AAMLE'),
      admin: { description: 'Large wordmark heading, e.g. "AAMLE".' },
    }),
    inlineRichTextField('subheading', {
      defaultValue: richTextDefault('Australian Academy of Medico-Legal Education'),
      admin: { description: 'Uppercase subheading under the wordmark.' },
    }),

    // ── CPD pill badge ──
    {
      name: 'badge',
      type: 'group',
      label: 'CPD badge',
      fields: [
        {
          type: 'row',
          fields: [
            iconField({
              defaultValue: 'graduation-cap',
              admin: { width: '50%', description: 'Icon inside the pill badge.' },
            }),
            inlineRichTextField('text', {
              defaultValue: richTextDefault('CPD-Eligible Programs'),
              admin: { width: '50%', description: 'Pill badge text near the top.' },
            }),
          ],
        },
      ],
    },

    // ── Intro paragraph ──
    richBodyField('description', {
      admin: { description: 'Short intro paragraph under the badge. Bold is supported.' },
    }),

    // ── Offering checklist (icon + label rows) ──
    {
      name: 'items',
      type: 'array',
      label: 'Checklist items',
      labels: { singular: 'Item', plural: 'Items' },
      minRows: 1,
      admin: { description: 'Compact icon + label rows shown under the intro.' },
      defaultValue: [
        { icon: 'video-camera', label: 'CPD-Eligible Webinars' },
        { icon: 'graduation-cap', label: 'Specialist Training Events' },
        { icon: 'book-open', label: 'Discounted AMA Guides Access' },
        { icon: 'globe', label: 'Open to All — Nationally' },
      ],
      fields: [
        {
          type: 'row',
          fields: [
            iconField({ admin: { width: '40%', description: 'Small icon for this row.' } }),
            inlineRichTextField('label', { required: true, admin: { width: '60%' } }),
          ],
        },
      ],
    },

    // ── Closing CTA ── (appearances off: keeps nested-in-Tabs enum names under
    // Postgres' 63-char limit)
    link({ appearances: false, overrides: { label: 'Call-to-action button' } }),

    // ── Right column: image / placeholder ──
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Right-column image. Leave empty to show a placeholder.' },
    },
    {
      name: 'imagePlaceholder',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show a grey image placeholder when no image is set',
      admin: {
        description: 'Keeps the two-column layout (reference placeholder box) until a real image is uploaded.',
      },
    },
    inlineRichTextField('placeholderLabel', {
      defaultValue: richTextDefault('Image Placeholder'),
      admin: {
        condition: (_, sib) => Boolean((sib as { imagePlaceholder?: boolean })?.imagePlaceholder),
        description: 'Caption shown inside the placeholder box.',
      },
    }),

    anchorIdField,
    cssClassField,
    containerWidthField,
    motionField,
  ],
}
