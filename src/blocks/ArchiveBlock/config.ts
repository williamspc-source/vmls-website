import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { link } from '@/fields/link'
import {
  anchorIdField,
  backgroundField,
  cssClassField,
  hideWhenEmptyField,
  inlineRichTextField,
} from '@/fields/blockFields'

export const Archive: Block = {
  slug: 'archive',
  interfaceName: 'ArchiveBlock',
  fields: [
    backgroundField,
    {
      name: 'introContent',
      type: 'richText',
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
      name: 'populateBy',
      type: 'select',
      defaultValue: 'collection',
      options: [
        {
          label: 'Collection',
          value: 'collection',
        },
        {
          label: 'Individual Selection',
          value: 'selection',
        },
      ],
    },
    {
      name: 'relationTo',
      type: 'select',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
      },
      defaultValue: 'posts',
      label: 'Collections To Show',
      options: [
        {
          label: 'Posts',
          value: 'posts',
        },
        {
          label: 'Events',
          value: 'events',
        },
      ],
    },
    {
      name: 'view',
      type: 'select',
      defaultValue: 'upcoming',
      admin: {
        condition: (_, s) => s.populateBy === 'collection' && s.relationTo === 'events',
        description: 'Upcoming vs past is derived from each event date.',
      },
      options: [
        { label: 'Upcoming', value: 'upcoming' },
        { label: 'Past', value: 'past' },
      ],
    },
    {
      name: 'categories',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
      },
      hasMany: true,
      label: 'Categories To Show',
      relationTo: 'categories',
    },
    {
      name: 'stream',
      type: 'relationship',
      relationTo: 'streams',
      hasMany: false,
      label: 'Stream',
      admin: {
        condition: (_, s) => s.populateBy === 'collection' && s.relationTo === 'posts',
        description: 'Only show posts in this In-the-Loop stream.',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      label: 'Featured only',
      admin: {
        condition: (_, s) => s.populateBy === 'collection' && s.relationTo === 'posts',
        description: 'Only show posts flagged as featured.',
      },
    },
    {
      name: 'postStyle',
      type: 'select',
      defaultValue: 'card',
      label: 'Post card style',
      admin: {
        condition: (_, s) => s.relationTo === 'posts' || s.populateBy === 'selection',
        description:
          'Article cards, or Staff-Narrative cards that show the author photo, name and role.',
      },
      options: [
        { label: 'Article cards', value: 'card' },
        { label: 'Staff narratives', value: 'narrative' },
      ],
    },
    {
      name: 'eventStyle',
      type: 'select',
      defaultValue: 'card',
      label: 'Event card style',
      admin: {
        condition: (_, s) => s.relationTo === 'events' || s.populateBy === 'selection',
        description:
          'Full event cards (Events list pages) or compact date-badge cards with CPD / cost status (In-the-Loop hub).',
      },
      options: [
        { label: 'Full cards', value: 'card' },
        { label: 'Compact (date badge)', value: 'compact' },
      ],
    },
    {
      name: 'limit',
      type: 'number',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
        step: 1,
      },
      defaultValue: 10,
      label: 'Limit',
    },
    {
      name: 'selectedDocs',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'selection',
      },
      hasMany: true,
      label: 'Selection',
      relationTo: ['posts', 'events'],
    },
    {
      name: 'columns',
      type: 'select',
      defaultValue: '3',
      options: [
        { label: '2', value: '2' },
        { label: '3', value: '3' },
        { label: '4', value: '4' },
      ],
    },
    inlineRichTextField('readMoreLabel', { label: 'Read-more link label',
      admin: {
        description: 'Text for the per-card link (article & staff-narrative cards). Defaults to "Read More →".',
      } }),
    {
      name: 'viewAllLink',
      type: 'group',
      label: 'View-all link (optional)',
      // Genuinely optional — a group with a required nested link otherwise fails
      // validation when omitted (e.g. the dedicated Events listing pages).
      fields: [link({ appearances: false, optional: true })],
    },
    cssClassField,
    anchorIdField,
    hideWhenEmptyField,
  ],
  labels: {
    plural: 'Archives',
    singular: 'Archive',
  },
}
