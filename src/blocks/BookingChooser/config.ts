import type { Block } from 'payload'

import { linkGroup } from '@/fields/linkGroup'
import { anchorIdField, cssClassField, iconField,
  inlineRichTextField,
} from '@/fields/blockFields'

// Full-bleed 50/50 chooser from the "Make a Booking" page (.booking-split /
// .booking-half). Two equal panels — a light-blue side and a dark-navy side —
// each with a big icon, an oversized faint watermark of the same icon, an
// eyebrow, a heading, a blurb and one or two CTA buttons. Every panel, its
// colour treatment, icon, copy and buttons are admin-editable.
export const BookingChooser: Block = {
  slug: 'bookingChooser',
  interfaceName: 'BookingChooserBlock',
  // Short table prefix — the deep halves[].links[].link.appearance enum would
  // otherwise exceed Postgres' 63-char identifier limit.
  dbName: 'bkchooser',
  labels: { singular: 'Booking Chooser (split)', plural: 'Booking Choosers' },
  fields: [
    anchorIdField,
    {
      name: 'halves',
      type: 'array',
      label: 'Halves',
      labels: { singular: 'Half', plural: 'Halves' },
      minRows: 1,
      maxRows: 2,
      admin: {
        description:
          'Full-bleed chooser. Two halves split the band 50/50 (typically one light-blue and one dark-navy side); a single half fills the whole band and does not slide under the pointer.',
      },
      // Seeds the exact design-reference chooser so a freshly inserted block
      // renders faithfully; every value stays editable.
      defaultValue: [
        {
          icon: 'calendar-check',
          accent: 'blue',
          eyebrow: "See What's Available",
          title: 'Specialist Availability',
          description:
            'Browse our specialists with current appointment sessions and select the times that suit you.',
          links: [
            {
              link: {
                type: 'custom',
                url: '#availability',
                label: 'View availability below',
                icon: 'arrow-down',
                appearance: 'default',
              },
            },
          ],
        },
        {
          icon: 'user-circle',
          accent: 'dark',
          eyebrow: 'Already Registered?',
          title: 'Client Portal',
          description:
            'Access your account to book appointments, manage referrals, and track your matters.',
          links: [
            {
              link: {
                type: 'custom',
                url: 'https://vmls.kawaconn.com/',
                label: 'Log In to Portal',
                icon: 'arrow-right',
                appearance: 'default',
                newTab: true,
              },
            },
            {
              link: {
                // Opens the visitor's mail app with the registration request
                // already written; the wording lives in Site Settings. Used to
                // be a plain link to /contact.
                type: 'portalEnquiry',
                label: 'Register an Account',
                appearance: 'outline',
              },
            },
          ],
        },
      ],
      fields: [
        {
          type: 'row',
          fields: [
            iconField({
              admin: {
                width: '50%',
                description: 'Large icon — also drawn as the oversized faint watermark for depth.',
              },
            }),
            {
              name: 'accent',
              type: 'select',
              defaultValue: 'blue',
              admin: { width: '50%', description: 'Panel colour treatment.' },
              options: [
                { label: 'Light blue', value: 'blue' },
                { label: 'Dark navy', value: 'dark' },
              ],
            },
          ],
        },
        inlineRichTextField('eyebrow', {
          admin: {
            description: 'Small uppercase label above the title, e.g. "Already Registered?".',
          },
        }),
        inlineRichTextField('title', { admin: {
            description: 'Panel heading. Wrap a word/phrase in [[brackets]] to accent it.',
          } }),
        inlineRichTextField('description'),
        linkGroup({
          appearances: false,
          // Resolved to a mailto by BookingChooserBlock before it reaches CMSLink.
          portalEnquiry: true,
          overrides: {
            name: 'links',
            label: 'Call-to-action buttons',
            maxRows: 2,
            admin: {
              initCollapsed: true,
              description:
                'One or two CTA buttons. Choose "Outline" appearance for a secondary button; the button icon renders as a trailing arrow.',
            },
          },
        }),
      ],
    },
    {
      name: 'density',
      type: 'select',
      label: 'Panel height',
      defaultValue: 'default',
      options: [
        { label: 'Default — full-height band', value: 'default' },
        { label: 'Compact — matches a page hero', value: 'compact' },
      ],
      admin: {
        description:
          'Compact trims the panel padding and the watermark so the band sits at about the height of a page hero. Use it where the chooser is a signpost under a hero rather than the main event.',
      },
    },
    cssClassField,
  ],
}
