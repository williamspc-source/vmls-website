import type { Block } from 'payload'

import {
  anchorIdField,
  backgroundField,
  cssClassField,
  hideWhenEmptyField,
  inlineRichTextField,
  richTextDefault,
} from '@/fields/blockFields'

// Featured-article carousel (design ref: .ni-featured / .ni-carousel on the
// "In the Loop" page). One full-width article slide at a time with autoplay,
// prev/next arrows and dot indicators. Fully data-driven from the Posts
// collection — either auto (featured posts / the Featured stream) or a manual
// hand-picked selection.
export const FeaturedArticles: Block = {
  slug: 'featuredArticles',
  interfaceName: 'FeaturedArticlesBlock',
  labels: { singular: 'Featured Articles Carousel', plural: 'Featured Articles Carousels' },
  fields: [
    inlineRichTextField('eyebrow', { defaultValue: richTextDefault('Featured'),
      admin: { description: 'Small uppercase label above the carousel (optional).' } }),
    // Motion + controls, mirroring SlideCarousel. Defaults are exactly what was
    // hardcoded before, so adding them changes nothing until an editor touches
    // one. Deliberately NOT copying SlideCarousel's `(interval ?? d) || d`
    // idiom, which turns a stored 0 back into the default.
    {
      type: 'row',
      fields: [
        {
          name: 'autoplay',
          type: 'checkbox',
          defaultValue: true,
          label: 'Auto-advance slides',
          admin: { width: '50%' },
        },
        {
          name: 'interval',
          type: 'number',
          defaultValue: 5000,
          label: 'Autoplay interval (ms)',
          admin: {
            width: '50%',
            description: 'Milliseconds each slide is shown. The design reference uses 5000.',
            condition: (_data, siblingData) => siblingData?.autoplay !== false,
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'showArrows',
          type: 'checkbox',
          defaultValue: true,
          label: 'Show prev / next arrows',
          admin: { width: '50%' },
        },
        {
          name: 'showDots',
          type: 'checkbox',
          defaultValue: true,
          label: 'Show dot indicators',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'auto',
      admin: {
        description:
          'Auto: newest featured posts (checkbox "Featured" or the Featured stream). Manual: hand-pick posts below.',
      },
      options: [
        { label: 'Automatic (featured posts)', value: 'auto' },
        { label: 'Manual selection', value: 'manual' },
      ],
    },
    {
      name: 'posts',
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
      admin: {
        condition: (_data, siblingData) => siblingData?.source === 'manual',
        description: 'The posts to show in the carousel, in order.',
      },
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 6,
      min: 1,
      max: 12,
      admin: {
        condition: (_data, siblingData) => siblingData?.source !== 'manual',
        description: 'Max number of posts to show (automatic mode).',
      },
    },
    inlineRichTextField('badgeLabel', { defaultValue: richTextDefault('Featured'),
      admin: {
        description: 'Text of the small badge shown on each slide (defaults to "Featured").',
      } }),
    inlineRichTextField('bylinePrefix', { defaultValue: richTextDefault('By:'),
      admin: {
        description:
          'Prefix shown before the author/date byline on each slide (defaults to "By:").',
      } }),
    inlineRichTextField('ctaLabel', { defaultValue: richTextDefault('Read Full Article →'),
      admin: {
        description:
          'Text of the "read more" call-to-action link on each slide (defaults to "Read Full Article →").',
      } }),
    anchorIdField,
    backgroundField,
    cssClassField,
    hideWhenEmptyField,
  ],
}
