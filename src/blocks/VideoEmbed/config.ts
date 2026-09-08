import type { Block } from 'payload'

import {
  anchorIdField,
  backgroundField,
  cssClassField,
  displayFields,
  sectionHeaderFields,
  inlineRichTextField,
} from '@/fields/blockFields'

// Responsive video embed (ported from the "Video Guide" section of the
// for-claimants design reference). Every part is editable: the section header,
// which provider to embed, the video reference, an optional caption and the
// aspect ratio. Handles YouTube, Vimeo or an arbitrary embed URL.
export const VideoEmbed: Block = {
  slug: 'videoEmbed',
  interfaceName: 'VideoEmbedBlock',
  labels: { singular: 'Video Embed', plural: 'Video Embeds' },
  fields: [
    ...sectionHeaderFields,
    {
      type: 'row',
      fields: [
        {
          name: 'provider',
          type: 'select',
          defaultValue: 'youtube',
          required: true,
          admin: { width: '50%', description: 'Where the video is hosted.' },
          options: [
            { label: 'YouTube', value: 'youtube' },
            { label: 'Vimeo', value: 'vimeo' },
            { label: 'Custom embed URL', value: 'url' },
          ],
        },
        {
          name: 'aspect',
          type: 'select',
          defaultValue: '16:9',
          admin: { width: '50%', description: 'Frame proportions.' },
          options: [
            { label: '16:9 (widescreen)', value: '16:9' },
            { label: '4:3 (standard)', value: '4:3' },
          ],
        },
      ],
    },
    {
      name: 'videoId',
      type: 'text',
      label: 'Video ID',
      admin: {
        description:
          'The video ID only, e.g. "YCd7aoYTD3Q" for youtube.com/watch?v=YCd7aoYTD3Q, or "76979871" for a Vimeo URL.',
        condition: (_, siblingData) => siblingData?.provider !== 'url',
      },
    },
    {
      name: 'url',
      type: 'text',
      label: 'Embed URL',
      admin: {
        description: 'Full iframe src URL for the embed.',
        condition: (_, siblingData) => siblingData?.provider === 'url',
      },
    },
    {
      name: 'videoTitle',
      type: 'text',
      label: 'Video title (accessibility)',
      admin: {
        description: 'Describes the video for screen readers (iframe title). Falls back to the heading.',
      },
    },
    inlineRichTextField('caption', { admin: { description: 'Optional caption shown beneath the video.' } }),
    backgroundField,
    anchorIdField,
    cssClassField,
    ...displayFields,
  ],
}
