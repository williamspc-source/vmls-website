import type { GlobalConfig } from 'payload'
import { inlineRichTextField } from '@/fields/blockFields'

import { link } from '@/fields/link'
import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Footer',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Site',
    description:
      'The footer on every page: link columns, contact details and opening hours. Contact fields left blank fall back to your primary Office.',
  },
  fields: [
    inlineRichTextField('tagline', { admin: { description: 'Optional line under the footer logo. Blank by default (reference footer has none).' } }),
    {
      name: 'columns',
      label: 'Link columns',
      type: 'array',
      maxRows: 4,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Footer/RowLabel#RowLabel',
        },
      },
      fields: [
        inlineRichTextField('title', { required: true }),
        {
          name: 'links',
          type: 'array',
          fields: [link({ appearances: false })],
          admin: {
            initCollapsed: true,
          },
        },
      ],
    },
    {
      name: 'contact',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'phone', type: 'text', admin: { width: '50%' } },
            {
              name: 'phoneHref',
              type: 'text',
              label: 'Phone link (tel:)',
              admin: { width: '50%', description: 'e.g. tel:0733560469' },
            },
          ],
        },
        { name: 'email', type: 'text' },
        { name: 'address', type: 'textarea' },
      ],
    },
    {
      name: 'hours',
      label: 'Office hours',
      type: 'array',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'days',
              type: 'text',
              admin: { width: '50%', placeholder: 'Monday to Friday' },
            },
            {
              name: 'time',
              type: 'text',
              admin: { width: '50%', placeholder: '08:30 – 17:00' },
            },
          ],
        },
      ],
    },
    {
      name: 'social',
      label: 'Social links',
      type: 'array',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'platform',
              type: 'select',
              required: true,
              admin: { width: '50%' },
              options: [
                { label: 'LinkedIn', value: 'linkedin' },
                { label: 'Facebook', value: 'facebook' },
                { label: 'Instagram', value: 'instagram' },
                { label: 'X (Twitter)', value: 'x' },
              ],
            },
            { name: 'url', type: 'text', required: true, admin: { width: '50%' } },
          ],
        },
      ],
    },
    {
      name: 'legalLinks',
      type: 'array',
      maxRows: 6,
      admin: { initCollapsed: true },
      fields: [link({ appearances: false })],
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
