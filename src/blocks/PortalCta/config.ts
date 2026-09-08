import type { Block } from 'payload'

import { linkGroup } from '@/fields/linkGroup'
import { anchorIdField, cssClassField, iconField,
  inlineRichTextField,
  richTextDefault,
} from '@/fields/blockFields'

// The recurring dark-blue "Online Booking Portal" CTA band (design reference
// `.portal-opt4`). Appears on the specialist panel, specialty lists, specialist
// profiles and the contact sidebar. Every label, icon, tile and button is
// authorable; the first link renders solid-white, the rest outline-white.
export const PortalCta: Block = {
  slug: 'portalCta',
  interfaceName: 'PortalCtaBlock',
  labels: { singular: 'Portal CTA Band', plural: 'Portal CTA Bands' },
  fields: [
    inlineRichTextField('eyebrow', {
      defaultValue: richTextDefault('Everything You Need, In One Place'),
      admin: { description: 'Small uppercase label above the heading.' },
    }),
    inlineRichTextField('heading', {
      defaultValue: richTextDefault('Online Booking Portal'),
      admin: {
        description: 'Wrap a word/phrase in [[brackets]] to highlight it in the accent colour.',
      },
    }),
    inlineRichTextField('subheading', {
      defaultValue:
        richTextDefault("VERIFY's Online Booking Portal gives registered clients immediate access to specialist scheduling, real-time availability, and key specialist documents, bringing everything together in one place. To get started, simply submit an enquiry or contact our team directly, and we will promptly set up your account."),
    }),
    {
      name: 'tiles',
      type: 'array',
      labels: { singular: 'Tile', plural: 'Tiles' },
      admin: { description: 'Feature tiles shown in the band (icon + label).' },
      defaultValue: [
        { icon: 'calendar-check', label: 'Specialist Availability' },
        { icon: 'file-text', label: 'Download Specialist CV' },
        { icon: 'magnifying-glass', label: 'Sample Redacted Report' },
      ],
      fields: [
        iconField(),
        inlineRichTextField('label', { required: true }),
      ],
    },
    linkGroup({
      appearances: false,
      overrides: {
        maxRows: 4,
        admin: {
          description:
            'Action buttons. The first renders solid white; the rest render outline-white.',
          initCollapsed: true,
        },
        defaultValue: [
          {
            link: {
              type: 'custom',
              url: 'mailto:admin@vmls.com.au?subject=VERIFY%20Booking%20Portal%20Access%20Request',
              label: 'Send Enquiry',
            },
          },
          {
            link: {
              type: 'custom',
              url: 'tel:0733560469',
              label: '07 3356 0469',
            },
          },
        ],
      },
    }),
    anchorIdField,
    cssClassField,
  ],
}
