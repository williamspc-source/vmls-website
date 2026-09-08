import type { Block } from 'payload'

import {
  anchorIdField,
  backgroundField,
  cssClassField,
  displayFields,
  inlineRichTextField,
  richTextDefault,
  sectionHeaderFields,
} from '@/fields/blockFields'

/**
 * Embeds a TryBooking event's booking form.
 *
 * Staff arrive from WordPress, where the supported way to do this is to paste
 * TryBooking's own two-line snippet into a Custom HTML block. That is not
 * available here and deliberately so: there are no user roles, so every
 * logged-in account is a full admin, and a paste-any-HTML block would hand all
 * of them arbitrary JavaScript on visitors. This block takes the one value that
 * actually varies — the event id — and builds the rest.
 *
 * ── Why there is only one widget type ──
 * `data-type` is not validated by TryBooking's script; it is passed straight
 * through as a URL path segment
 * (`/au/apiv2/Events/<eid>/widget/<data-type>`), so the valid set lives on their
 * server and cannot be read out of the bundle. Probed against a real event,
 * `landingPageEmbed` resolves and every other name guessed — `embeddedBooking`,
 * `bookingPage`, `purchaseButton`, `eventListing` — returns 404. So this offers
 * the one value proven to work, which is also the one in the snippet staff
 * already use. To add another, generate that widget in the TryBooking dashboard
 * and read the real `data-type` out of the code it produces; the dashboard is
 * the only source of truth for that list.
 */
export const TryBooking: Block = {
  slug: 'tryBooking',
  interfaceName: 'TryBookingBlock',
  labels: { singular: 'TryBooking Form', plural: 'TryBooking Forms' },
  fields: [
    ...sectionHeaderFields,
    {
      name: 'eventId',
      type: 'text',
      required: true,
      label: 'TryBooking event ID',
      admin: {
        description:
          'The digits from the event’s TryBooking address — e.g. 1525708 for trybooking.com/1525708. Numbers only.',
      },
      validate: (value: unknown) =>
        typeof value === 'string' && /^\d+$/.test(value.trim())
          ? true
          : 'Enter the event ID as digits only, e.g. 1525708.',
    },
    {
      name: 'widgetType',
      type: 'select',
      defaultValue: 'landingPageEmbed',
      options: [{ label: 'Booking form (event landing page)', value: 'landingPageEmbed' }],
      admin: {
        description:
          'TryBooking currently publishes one embeddable form type. Kept as a list so another can be added without a data migration.',
      },
    },
    inlineRichTextField('fallbackLabel', {
      label: 'Fallback button label',
      defaultValue: richTextDefault('Book on TryBooking'),
      admin: {
        description:
          'Shown as a button linking straight to TryBooking whenever the embedded form cannot load — so a visitor is never left looking at an empty space. Leave it as is unless you have a reason.',
      },
    }),
    backgroundField,
    anchorIdField,
    cssClassField,
    ...displayFields,
  ],
}
