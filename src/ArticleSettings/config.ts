import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { iconField,
  inlineRichTextField,
  richTextDefault,
} from '@/fields/blockFields'
import { revalidateGlobal } from '@/utilities/revalidateGlobal'

// Shared chrome for every "In the Loop" article/resource page: the fixed sidebar
// CTA cards and the static labels — identical across all articles, so edited once
// here rather than per post.
export const ArticleSettings: GlobalConfig = {
  slug: 'article-settings',
  label: 'Article Settings',
  access: { read: () => true },
  admin: {
    group: 'Page settings',
    description: 'Sidebar CTA cards + fixed labels shown on every In-the-Loop article.',
  },
  fields: [
    {
      name: 'sidebarCards',
      type: 'array',
      label: 'Sidebar CTA cards',
      maxRows: 3,
      admin: { description: 'The fixed cards in the article right rail (e.g. "Have a Question?", "Make a Referral").' },
      fields: [
        iconField(),
        inlineRichTextField('heading', { required: true }),
        inlineRichTextField('body'),
        link({ appearances: false }),
      ],
    },
    {
      name: 'labels',
      type: 'group',
      label: 'Fixed labels',
      fields: [
        inlineRichTextField('attachmentsHeading', { defaultValue: richTextDefault('Downloads'),
          admin: { description: 'Heading above an article’s attached files.' } }),
        {
          type: 'row',
          fields: [
            inlineRichTextField('related', { defaultValue: richTextDefault('You Might Also Like'),
              admin: { width: '33%' } }),
            inlineRichTextField('toc', { defaultValue: richTextDefault('In This Article'),
              admin: { width: '33%' } }),
            inlineRichTextField('topics', { defaultValue: richTextDefault('Topics'), admin: { width: '34%' } }),
          ],
        },
        {
          name: 'breadcrumbSectionLabel',
          type: 'text',
          defaultValue: 'In the Loop',
          admin: {
            description:
              'Second breadcrumb link (the In the Loop hub). The first crumb — “Home” — is shared site-wide and lives in Site Settings → Breadcrumbs.',
          },
        },
        inlineRichTextField('streamFallbackSubtitle', { defaultValue: richTextDefault('Browse every article in this stream.'),
          admin: {
            description:
              'Shown under a stream heading when that stream has no description of its own.',
          } }),
        {
          type: 'row',
          fields: [
            {
              name: 'bylinePrefix',
              type: 'text',
              defaultValue: 'By ',
              admin: { width: '50%' },
            },
            {
              name: 'minReadSuffix',
              type: 'text',
              defaultValue: 'min read',
              admin: { width: '50%' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'shareLinkedinLabel',
              type: 'text',
              defaultValue: 'Share on LinkedIn',
              admin: { width: '50%' },
            },
            {
              name: 'shareCopyLabel',
              type: 'text',
              defaultValue: 'Copy link',
              admin: { width: '50%' },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateGlobal('article-settings')],
  },
}
