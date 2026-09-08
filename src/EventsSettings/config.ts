import type { Field, GlobalConfig } from 'payload'
import { inlineRichTextField, richTextDefault } from '@/fields/blockFields'

import { revalidateGlobal } from '@/utilities/revalidateGlobal'

// Host-derived boilerplate for event detail pages. The per-event record holds the
// specifics (date/title/etc.); this global holds the copy that only varies by host
// (AAMLE vs VERIFY) so it isn't retyped on every event.
const hostGroup = (name: string, label: string): Field => ({
  name,
  type: 'group',
  label,
  fields: [
    // Rich text, not plain: the design reference bolds the academy's name inside
    // both of these ("presented by the **Australian Academy of Medico-Legal
    // Education (AAMLE)**", "Run by **AAMLE**"), which a text field cannot express.
    { name: 'blurb', type: 'richText', label: 'Program blurb', admin: { description: 'Intro paragraph shown on every event by this host.' } },
    { name: 'callout', type: 'richText', label: 'Callout', admin: { description: 'The tinted one-line panel under the intro, e.g. "Run by AAMLE — VERIFY’s education & training arm."' } },
    {
      type: 'row',
      fields: [
        inlineRichTextField('attendHeading', { defaultValue: richTextDefault('How to Attend'), admin: { width: '50%' } }),
        inlineRichTextField('recapHeading', { defaultValue: richTextDefault('Event Recap'), admin: { width: '50%' } }),
      ],
    },
    inlineRichTextField('attendBody', { label: 'How-to-attend copy' }),
    {
      type: 'row',
      fields: [
        { name: 'registerLabel', type: 'text', label: 'Register button label', admin: { width: '50%' } },
        { name: 'contactLabel', type: 'text', label: 'Contact button label', admin: { width: '50%' } },
      ],
    },
    {
      name: 'hostEventLinkLabel',
      type: 'text',
      label: 'Host event link label',
      admin: {
        description:
          'Label for the button linking to the event on the host’s own site, e.g. "View this event on AAMLE". Only shown on events that have a Host event page URL.',
      },
    },
  ],
})

// Generic UI labels shown on every event detail page, regardless of host.
const labelsGroup: Field = {
  name: 'labels',
  type: 'group',
  label: 'Event page labels',
  admin: {
    description: 'Generic UI labels shown on every event detail page, regardless of host.',
  },
  fields: [
    inlineRichTextField('presentersHeading', { defaultValue: richTextDefault('Presenters'),
      admin: { description: 'Heading above the presenter cards on an event page.' } }),
    {
      name: 'breadcrumbSectionLabel',
      type: 'text',
      defaultValue: 'Events & Seminars',
      admin: {
        description:
          'Second breadcrumb link (the events hub). The first crumb — “Home” — is shared site-wide and lives in Site Settings → Breadcrumbs.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'statusUpcomingLabel',
          type: 'text',
          defaultValue: 'Upcoming Event',
          admin: { width: '50%', description: 'Status pill for events still to come.' },
        },
        {
          name: 'statusPastLabel',
          type: 'text',
          defaultValue: 'Past Event',
          admin: { width: '50%', description: 'Status pill for events whose date has passed.' },
        },
      ],
    },
    {
      name: 'freeLabel',
      type: 'text',
      defaultValue: 'Free',
      admin: { description: 'Cost shown when an event has no cost set.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'cpdPointsTemplate',
          type: 'text',
          defaultValue: 'CPD · {points} point(s)',
          admin: {
            width: '50%',
            description: 'CPD line when points are set. Use {points} for the number.',
          },
        },
        {
          name: 'cpdEligibleLabel',
          type: 'text',
          defaultValue: 'CPD eligible',
          admin: { width: '50%', description: 'CPD line when eligible but no point count is set.' },
        },
      ],
    },
    inlineRichTextField('concludedFallback', { label: 'Concluded-event fallback',
      defaultValue: richTextDefault('This event has now concluded. Contact our team for recordings or resources from this session.'),
      admin: {
        description:
          'Shown under a past event that has no recap AND no photos or downloads. If there are photos or downloads, the line below is used instead — this one would be telling people to ask for something already on the page.',
      } }),
    inlineRichTextField('concludedWithMaterials', { label: 'Concluded-event fallback (materials available)',
      defaultValue: richTextDefault('This event has now concluded. Photos and resources from the session are below.'),
      admin: {
        description:
          'Shown under a past event that has no recap written yet but does have photos or downloads attached.',
      } }),
    {
      name: 'backToEventsLabel',
      type: 'text',
      defaultValue: 'Back to all events',
      admin: { description: 'Link back to the events listing at the bottom of the page.' },
    },
    {
      name: 'contactUrl',
      type: 'text',
      label: 'Contact page URL',
      defaultValue: '/contact',
      admin: {
        description:
          'Where the “Contact Us” button goes once registrations have closed. It used to reuse the event’s external registration link, which sent people to the booking page they could no longer use.',
      },
    },
    {
      type: 'row',
      fields: [
        inlineRichTextField('recapTocLabel', { defaultValue: richTextDefault('In this recap'),
          admin: { width: '50%', description: 'Heading above the recap’s contents list.' } }),
        inlineRichTextField('galleryHeading', { defaultValue: richTextDefault('From the day'),
          admin: { width: '50%', description: 'Heading above an event’s photo gallery.' } }),
      ],
    },
    inlineRichTextField('attachmentsHeading', { defaultValue: richTextDefault('Downloads'),
      admin: { description: 'Heading above an event’s downloads / attachments list.' } }),
  ],
}

export const EventsSettings: GlobalConfig = {
  slug: 'events-settings',
  label: 'Events Settings',
  access: { read: () => true },
  admin: {
    group: 'Page settings',
    description: 'Host-specific boilerplate copy shown on event detail pages (AAMLE / VERIFY).',
  },
  fields: [hostGroup('aamle', 'AAMLE events'), hostGroup('verify', 'VERIFY events'), labelsGroup],
  hooks: {
    afterChange: [revalidateGlobal('events-settings')],
  },
}
