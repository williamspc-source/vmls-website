import type { Block } from 'payload'


import {
  anchorIdField,
  cssClassField,
  iconField,
  sectionHeaderFields,
  richBodyField,
  inlineRichTextField,
} from '@/fields/blockFields'

export const FAQ: Block = {
  slug: 'faq',
  interfaceName: 'FAQBlock',
  fields: [
    ...sectionHeaderFields,
    {
      name: 'columns',
      type: 'select',
      defaultValue: '1',
      admin: {
        description:
          'Lay the questions out in one or two columns, or side by side — heading and intro in a left column with the questions beside them (the services-page treatment).',
      },
      options: [
        { label: '1 column', value: '1' },
        { label: '2 columns', value: '2' },
        { label: 'Side by side (heading left, questions right)', value: 'split' },
      ],
    },
    // ── Appearance ───────────────────────────────────────────────────────────
    // Four variants, and NONE of them declares a defaultValue. That is
    // deliberate on two counts:
    //
    //  1. An unset value must mean "render exactly what this block rendered
    //     before these fields existed", so adding them moves nothing. Absent →
    //     no modifier class → byte-identical markup.
    //  2. A field with a defaultValue cannot be used as a migration signal. The
    //     adapter emits `ADD COLUMN … DEFAULT` and Postgres backfills every
    //     existing row, so "never set" becomes indistinguishable from an
    //     editor's choice — which is exactly how an earlier repair in this repo
    //     was proven incapable of ever firing. `seedFaqVariants` keys on
    //     `itemStyle` being genuinely absent.
    {
      type: 'row',
      fields: [
        {
          name: 'itemStyle',
          type: 'select',
          admin: {
            width: '50%',
            description:
              'Card keeps each question in its own outlined white box. Divided drops the boxes for a flat list separated by hairline rules.',
          },
          options: [
            { label: 'Card (outlined boxes)', value: 'card' },
            { label: 'Divided (flat list, hairline rules)', value: 'divided' },
          ],
        },
        {
          name: 'toggleStyle',
          type: 'select',
          admin: {
            width: '50%',
            description:
              'The open/close marker at the end of each question. Pill puts the + and − inside a filled circle.',
          },
          options: [
            { label: 'Plus / minus', value: 'plus' },
            { label: 'Chevron', value: 'chevron' },
            { label: 'Pill (circled + / −)', value: 'pill' },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'iconStyle',
          type: 'select',
          admin: {
            width: '50%',
            description:
              'How a question’s icon is drawn. Tile sets it in a rounded tinted square and indents the answer to line up beneath the text.',
          },
          options: [
            { label: 'Inline', value: 'inline' },
            { label: 'Tile (rounded tinted square)', value: 'tile' },
          ],
        },
        {
          name: 'density',
          type: 'select',
          admin: {
            width: '50%',
            description: 'Compact tightens the row height and text size a step.',
          },
          options: [
            { label: 'Comfortable', value: 'comfortable' },
            { label: 'Compact', value: 'compact' },
          ],
        },
      ],
    },
    {
      // Deliberately NOT the shared `containerWidthField`, whose defaultValue is
      // 'normal'. This block has always hardcoded the narrow container, so an
      // unset value has to keep meaning narrow or every existing FAQ jumps a
      // width the moment the field is added.
      name: 'containerWidth',
      type: 'select',
      admin: {
        description:
          'Content width, for a FAQ placed directly on the page. Leave unset for the narrow column this block has always used; the reference widens it where an accordion carries icons. Ignored when this block sits INSIDE a Section — the Section sets the width there.',
      },
      options: [
        { label: 'Narrow (default)', value: 'narrow' },
        { label: 'Normal', value: 'normal' },
        { label: 'Wide', value: 'wide' },
        { label: 'Full width', value: 'full' },
      ],
    },
    {
      name: 'ruleStyle',
      type: 'select',
      admin: {
        condition: (_, siblingData) => siblingData?.itemStyle === 'divided',
        description:
          'Colour of the hairline rules between questions. Brand tinted suits an accordion sitting on a coloured band.',
      },
      options: [
        { label: 'Light', value: 'light' },
        { label: 'Grey', value: 'grey' },
        { label: 'Brand tinted', value: 'brand' },
      ],
    },
    {
      name: 'items',
      type: 'array',
      labels: { singular: 'Question', plural: 'Questions' },
      minRows: 1,
      fields: [
        {
          type: 'row',
          fields: [
            inlineRichTextField('question', { required: true, admin: { width: '70%' } }),
            iconField({ admin: { width: '30%', description: 'Optional icon.' } }),
          ],
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          admin: {
        description:
          'Optional image. Shown beneath the heading in the “Side by side” layout (first item that has one wins); ignored in the 1- and 2-column layouts.',
      },
        },
        richBodyField('answer', { required: true }),
        anchorIdField,
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'exclusive',
          type: 'checkbox',
          label: 'Only one open at a time',
          admin: { width: '50%', description: 'Opening one question closes the others.' },
        },
        {
          name: 'openFirst',
          type: 'checkbox',
          label: 'Open the first item by default',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'helpCard',
      type: 'group',
      label: 'Help card (optional)',
      admin: { description: 'A "still have questions?" card shown after the list.' },
      fields: [
        inlineRichTextField('heading'),
        inlineRichTextField('body'),
        {
          type: 'row',
          fields: [
            { name: 'email', type: 'text', admin: { width: '50%' } },
            { name: 'phone', type: 'text', admin: { width: '50%' } },
          ],
        },
      ],
    },
    // Block-level anchor id (distinct from the per-item anchorId inside `items`)
    // so header/deep links like `/ime#claim-types` can target the whole block.
    anchorIdField,
    cssClassField,
  ],
  labels: {
    plural: 'FAQs',
    singular: 'FAQ',
  },
}
