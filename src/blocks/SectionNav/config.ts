import type { Block, Field } from 'payload'

import { cssClassField } from '@/fields/blockFields'

// Anchor target the nav item scroll-spies to and links to (the #id of another
// block/section on the page). Slug-validated so it produces a valid #hash.
const anchorTargetField: Field = {
  name: 'anchorId',
  type: 'text',
  required: true,
  label: 'Links to section #id',
  admin: {
    description:
      'The anchor ID of the section this jumps to (without the #). Must match that section\'s Anchor ID. Lowercase letters, numbers and hyphens only.',
  },
  validate: (val: string | null | undefined) =>
    (!!val && /^[a-z][a-z0-9-]*$/.test(val)) ||
    'Use lowercase letters, numbers and hyphens; must start with a letter.',
}

// Sticky in-page section nav with scroll-spy. Mirrors the design reference's
// `.ni-section-nav` (In The Loop page): a pill bar that pins under the header and
// highlights the section currently in view (IntersectionObserver adds `.is-active`).
export const SectionNav: Block = {
  slug: 'sectionNav',
  interfaceName: 'SectionNavBlock',
  labels: { singular: 'Section Nav (sticky)', plural: 'Section Navs' },
  fields: [
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Nav item', plural: 'Nav items' },
      admin: {
        description:
          'Each item links to and highlights a section on this page. Order = display order.',
      },
      defaultValue: [
        { label: 'Latest', anchorId: 'featured' },
        { label: 'News & Updates', anchorId: 'news' },
        { label: 'AAMLE Events', anchorId: 'events' },
        { label: 'Industry Insights', anchorId: 'insights' },
        { label: 'Specialist Spotlights', anchorId: 'spotlights' },
        { label: 'Resources', anchorId: 'resources' },
        { label: 'QA Insights', anchorId: 'qa-insights' },
        { label: 'Staff Narratives', anchorId: 'staff-narratives' },
      ],
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          admin: { description: 'The nav pill text, e.g. "News & Updates".' },
        },
        anchorTargetField,
      ],
    },
    {
      name: 'sticky',
      type: 'checkbox',
      defaultValue: true,
      label: 'Sticky (pin the nav under the header on scroll)',
    },
    cssClassField,
  ],
}
