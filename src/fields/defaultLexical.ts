import type { TextFieldSingleValidation } from 'payload'
import {
  BoldFeature,
  ItalicFeature,
  LinkFeature,
  ParagraphFeature,
  lexicalEditor,
  UnderlineFeature,
  type LinkFields,
} from '@payloadcms/richtext-lexical'

import { brandTextColorFeature } from './richTextColorFeature'

/**
 * The features every editor on the site inherits.
 *
 * Field-level editors call `lexicalEditor({ features: ({ rootFeatures }) => [...rootFeatures, …] })`,
 * and `rootFeatures` is this list — so a feature added here reaches all ten of
 * them, `inlineRichTextField` and `richBodyField` alike. That is why the colour
 * swatch is registered once, here, rather than in each helper.
 */
export const defaultLexical = lexicalEditor({
  features: [
    ParagraphFeature(),
    // Brand text colour, in the toolbar beside B / I / U. Its rendering half is
    // the `text` converter in `src/components/RichText/shared.tsx`: Payload's own
    // JSX converters ignore node state entirely, so without that branch this
    // control would save a colour and paint nothing.
    brandTextColorFeature(),
    UnderlineFeature(),
    BoldFeature(),
    ItalicFeature(),
    LinkFeature({
      // Keep in step with `relationTo` in src/fields/link.ts.
      enabledCollections: ['pages', 'posts', 'specialists', 'team', 'events'],
      fields: ({ defaultFields }) => {
        const defaultFieldsWithoutUrl = defaultFields.filter((field) => {
          if ('name' in field && field.name === 'url') return false
          return true
        })

        return [
          ...defaultFieldsWithoutUrl,
          {
            name: 'url',
            type: 'text',
            admin: {
              condition: (_data, siblingData) => siblingData?.linkType !== 'internal',
            },
            label: ({ t }) => t('fields:enterURL'),
            required: true,
            validate: ((value, options) => {
              if ((options?.siblingData as LinkFields)?.linkType === 'internal') {
                return true // no validation needed, as no url should exist for internal links
              }
              return value ? true : 'URL is required'
            }) as TextFieldSingleValidation,
          },
        ]
      },
    }),
  ],
})
