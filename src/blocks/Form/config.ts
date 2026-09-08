import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { cssClassField } from '@/fields/blockFields'

export const FormBlock: Block = {
  slug: 'formBlock',
  interfaceName: 'FormBlock',
  fields: [
    {
      name: 'form',
      type: 'relationship',
      relationTo: 'forms',
      required: true,
    },
    {
      name: 'enableIntro',
      type: 'checkbox',
      label: 'Enable Intro Content',
    },
    {
      name: 'introContent',
      type: 'richText',
      admin: {
        condition: (_, { enableIntro }) => Boolean(enableIntro),
      },
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: 'Intro Content',
    },
    {
      // Three pages hand-rolled this identical treatment as page-scoped classes
      // (.ct-page .ct-enquiry-form, .vf-join-eoi__form, .vf-home-enquiry-formcard):
      // promote the whole block to a white card so the intro heading sits INSIDE
      // it, and neutralise the inner .contact-form chrome. One field replaces all
      // three. No defaultValue — unset keeps the bare block that every other form
      // renders today.
      name: 'cardStyle',
      type: 'select',
      admin: {
        description:
          'Card wraps the whole block — intro heading included — in a white panel with a soft shadow.',
      },
      options: [
        { label: 'None', value: 'none' },
        { label: 'Card', value: 'card' },
      ],
    },
    cssClassField,
  ],
  graphQL: {
    singularName: 'FormBlock',
  },
  labels: {
    plural: 'Form Blocks',
    singular: 'Form Block',
  },
}
