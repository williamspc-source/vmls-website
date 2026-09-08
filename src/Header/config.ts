import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  // Explicit, so renaming the slug cannot silently rename the nav entry.
  label: 'Header',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Site',
    description:
      'The main navigation and its dropdowns, plus the button at the top right. Shown on every page.',
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      maxRows: 8,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
      fields: [
        link({ appearances: false }),
        {
          name: 'subItems',
          label: 'Dropdown items',
          type: 'array',
          maxRows: 12,
          admin: {
            initCollapsed: true,
            description: 'Optional dropdown shown when hovering this nav item.',
            components: {
              RowLabel: '@/Header/RowLabel#RowLabel',
            },
          },
          fields: [
            link({ appearances: false }),
            {
              name: 'subSubItems',
              label: 'Sub-dropdown items',
              type: 'array',
              maxRows: 12,
              admin: {
                initCollapsed: true,
                description: 'Optional third-level menu shown when hovering this item.',
                components: {
                  RowLabel: '@/Header/RowLabel#RowLabel',
                },
              },
              fields: [link({ appearances: false })],
            },
          ],
        },
      ],
    },
    {
      name: 'cta',
      label: 'Call-to-action button',
      type: 'group',
      admin: {
        description: 'Primary button shown at the right of the header (e.g. "Book an Appointment").',
      },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
          label: 'Show button',
        },
        link({ appearances: false }),
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
