import type { Block } from 'payload'

import { cssClassField } from '@/fields/blockFields'

// Specialist Availability section. Config-light on purpose: the editable copy and
// enquiry-email settings live in the "Specialist Availability" global, and which
// specialists/slots appear is driven by the specialists + availability-sessions
// collections. This block just places + toggles the rendered section.
export const Availability: Block = {
  slug: 'availability',
  interfaceName: 'AvailabilityBlock',
  labels: { singular: 'Specialist Availability', plural: 'Specialist Availability' },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'showCarousel',
          type: 'checkbox',
          defaultValue: true,
          label: 'Show featured carousel',
          admin: {
            width: '50%',
            description: 'Specialists with "Feature in availability carousel" (advertise) enabled.',
          },
        },
        {
          name: 'showLegend',
          type: 'checkbox',
          defaultValue: true,
          label: 'Show colour legend',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'showSpecialtyBadge',
      type: 'checkbox',
      defaultValue: false,
      label: 'Show specialty pill over carousel photos',
      admin: {
        description:
          'Overlays each specialist’s specialty as a pill on their carousel photo. Off by default — the specialty already appears beneath the photo.',
      },
    },
    cssClassField,
  ],
}
