import type { CollectionConfig } from 'payload'

import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'
import { setSessionTitle } from './hooks/setSessionTitle'
import {
  revalidateAvailabilitySession,
  revalidateAvailabilitySessionDelete,
} from './hooks/revalidateAvailabilitySession'

// 24-hour HH:mm validation, lenient on empty (presence handled by `required`).
const validateTime = (val?: string | null) =>
  !val || /^([01]?\d|2[0-3]):[0-5]\d$/.test(val) || 'Use 24-hour time, e.g. 08:30'

// End of the current month at 23:59:59 — the default "advertise until" date.
const endOfThisMonth = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()
}

// Advertised availability slots for the Specialist Availability page. This is a
// marketing tool, NOT a booking system — enquiry is by email. A slot is shown
// publicly when: status = 'available' AND date >= today AND expiresAt >= now.
// Booked slots are removed manually (there is no Kawaconn API).
export const AvailabilitySessions: CollectionConfig<'availability-sessions'> = {
  slug: 'availability-sessions',
  labels: { singular: 'Availability Session', plural: 'Availability Sessions' },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'specialist', 'date', 'mode', 'status', 'expiresAt'],
    group: 'Availability',
    description:
      'Advertised appointment slots. Each belongs to a specialist and stops showing after its "Advertise until" date.',
    listSearchableFields: ['title'],
  },
  defaultPopulate: {
    title: true,
    specialist: true,
    date: true,
    startTime: true,
    endTime: true,
    mode: true,
    status: true,
    expiresAt: true,
  },
  fields: [
    {
      name: 'specialist',
      type: 'relationship',
      relationTo: 'specialists',
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'date',
          type: 'date',
          required: true,
          admin: {
            width: '34%',
            date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' },
            description: 'The day of availability.',
          },
        },
        {
          name: 'startTime',
          type: 'text',
          required: true,
          label: 'Start',
          validate: validateTime,
          admin: { width: '33%', placeholder: '08:30' },
        },
        {
          name: 'endTime',
          type: 'text',
          required: true,
          label: 'End',
          validate: validateTime,
          admin: { width: '33%', placeholder: '09:30' },
        },
      ],
    },
    {
      name: 'mode',
      type: 'select',
      required: true,
      defaultValue: 'either',
      options: [
        { label: 'In-person', value: 'in-person' },
        { label: 'Telehealth', value: 'telehealth' },
        { label: 'Either (in-person or telehealth)', value: 'either' },
      ],
    },
    // Staff-only. `access.read` is what makes it internal: this collection is
    // `read: anyone`, so without it the note is served to unauthenticated
    // callers on /api/availability-sessions regardless of where it sits in the
    // admin. Nothing renders it — see ALLOWED_UNREAD_CONFIG in
    // tests/int/adminControls.int.spec.ts.
    {
      name: 'notes',
      type: 'textarea',
      label: 'Internal note',
      access: {
        read: ({ req }) => Boolean(req.user),
      },
      admin: {
        position: 'sidebar',
        description: 'Staff only. Never shown on the website and never sent in the enquiry email.',
      },
    },
    // ── Sidebar: lifecycle ──
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'available',
      admin: {
        position: 'sidebar',
        description: 'Set to "Booked" to hide a slot once it is taken (removed manually).',
      },
      options: [
        { label: 'Available', value: 'available' },
        { label: 'Booked', value: 'booked' },
      ],
    },
    {
      name: 'expiresAt',
      type: 'date',
      required: true,
      defaultValue: endOfThisMonth,
      label: 'Advertise until',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' },
        description: 'Stops advertising after this date. Defaults to the end of the month.',
      },
    },
    // Auto-composed display title (hidden in the editor UI).
    {
      name: 'title',
      type: 'text',
      admin: { hidden: true },
    },
  ],
  hooks: {
    beforeChange: [setSessionTitle],
    afterChange: [revalidateAvailabilitySession],
    afterDelete: [revalidateAvailabilitySessionDelete],
  },
}
