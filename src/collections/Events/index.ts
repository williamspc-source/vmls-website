import type { CollectionConfig } from 'payload'
import { inlineRichTextField } from '@/fields/blockFields'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { revalidateDelete, revalidateEvent } from './hooks/revalidateEvent'
import { revalidateSiteOnChange, revalidateSiteOnDelete } from '@/utilities/revalidateSite'
import { slugField } from 'payload'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

// Events & seminars. Upcoming vs past is derived from `date` at query time
// (not stored), so events roll over automatically.
export const Events: CollectionConfig<'events'> = {
  slug: 'events',
  labels: { singular: 'Event', plural: 'Events' },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    // `defaultPopulate` selects FIELDS, not depth — Payload's type here is
    // `true` only. Whether this arrives populated or as a bare id depends on the
    // caller's `depth`, so `eventTypeLabel` degrades to '' rather than printing
    // an id or "[object Object]". The two `find()` calls that render a badge
    // both pass depth: 1.
    eventType: true,
    date: true,
    timeLabel: true,
    location: true,
    host: true,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'eventType', 'date', 'host'],
    group: 'Publishing',
    description:
      'Seminars and webinars, listed at /events. After an event you can add a recap, photo gallery and downloads to the same record.',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Details',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'date',
                  type: 'date',
                  required: true,
                  admin: {
                    width: '50%',
                    date: { pickerAppearance: 'dayAndTime' },
                    description:
                      'Start date & time. Decides whether the event shows as Upcoming or Past — it counts as upcoming for the whole of its day.',
                  },
                },
                inlineRichTextField('timeLabel', { admin: { width: '50%', description: 'e.g. "12:30 pm – 1:30 pm".' } }),
              ],
            },
            {
              type: 'row',
              fields: [
                inlineRichTextField('location', { admin: { width: '50%' } }),
                {
                  name: 'host',
                  type: 'select',
                  defaultValue: 'aamle',
                  admin: { width: '50%' },
                  options: [
                    { label: 'AAMLE', value: 'aamle' },
                    { label: 'VERIFY', value: 'verify' },
                  ],
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'registrationUrl',
                  type: 'text',
                  label: 'Registration URL',
                  admin: { width: '50%', description: 'External booking link (e.g. AAMLE).' },
                },
                inlineRichTextField('registrationLabel', { label: 'Registration button label',
                  admin: {
                    width: '50%',
                    description: 'e.g. "Register on AAMLE", "Register Your Interest". Optional.',
                  } }),
              ],
            },
            {
              // Deliberately separate from `registrationUrl`, which in practice
              // points at a generic booking page (most events share the one AAMLE
              // seminar menu). This one is the event's *own* page on the host's
              // site, and drives the "View this event on …" action button.
              name: 'hostEventUrl',
              type: 'text',
              label: 'Host event page URL',
              admin: {
                description:
                  'This event’s own page on the host’s website (e.g. an aamle.com.au event page). Adds a “View this event on AAMLE” button. Leave empty and the button is not shown.',
              },
            },
            {
              name: 'registrationClosesAt',
              type: 'date',
              label: 'Registrations close',
              admin: {
                date: { pickerAppearance: 'dayAndTime' },
                description:
                  'When registrations / expressions of interest stop being accepted. After this the button changes from "Register Your Interest" to "Contact Us". Leave empty to close at the event\'s start time. Set it later to keep registrations open once the event has begun, or earlier to close them in advance. This is separate from the Upcoming/Past badge, which follows the start date.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'cpdEligible',
                  type: 'checkbox',
                  label: 'CPD eligible',
                  admin: { width: '33%' },
                },
                {
                  name: 'cpdPoints',
                  type: 'number',
                  label: 'CPD points',
                  admin: { width: '33%' },
                },
                inlineRichTextField('cost', { admin: { width: '34%', description: 'e.g. "Free", "$120". Defaults to Free if empty.' } }),
              ],
            },
            {
              name: 'locationRef',
              type: 'relationship',
              relationTo: 'locations',
              label: 'Location (structured)',
              admin: {
                description:
                  'Optional — link to a Location for structured filtering. The free-text "location" above is still shown if set.',
              },
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              label: 'Event photo',
              admin: {
                description:
                  'Optional. Shown on the events listings and on the Events hub cards. Without one, the event falls back to a date calendar showing the day and month — so a missing photo never leaves an empty panel. Cropped to fill, so a landscape image works best.',
              },
            },
            {
              name: 'excerpt',
              type: 'textarea',
              admin: { description: 'Short summary used in listings.' },
            },
            {
              name: 'description',
              type: 'richText',
            },
            {
              name: 'recap',
              type: 'richText',
              label: 'Recap (past events)',
              admin: { description: 'Optional write-up shown after the event has passed.' },
            },
            {
              name: 'showToc',
              type: 'checkbox',
              label: 'Show “In this recap” contents list',
              defaultValue: true,
              admin: {
                description:
                  'Lists the recap’s headings above it, each one a link. Only appears when the recap has two or more headings.',
              },
            },
            {
              // Rendered whenever populated, not gated on the event having passed:
              // a control that silently does nothing in one state is the failure the
              // admin-controls guard exists to prevent.
              name: 'gallery',
              type: 'array',
              label: 'Photo gallery',
              labels: { singular: 'Photo', plural: 'Photos' },
              admin: {
                description:
                  'Photos from the day. Shown beneath the recap as soon as you add one.',
              },
              fields: [
                { name: 'image', type: 'upload', relationTo: 'media', required: true },
                inlineRichTextField('caption'),
              ],
            },
            {
              // Same shape as Posts.attachments, so the article page's
              // `.art-attachments` markup and CSS are reused rather than copied.
              name: 'attachments',
              type: 'array',
              label: 'Downloads / attachments',
              admin: {
                description: 'Slides, handouts, recordings — anything to offer as a download.',
              },
              fields: [
                { name: 'file', type: 'upload', relationTo: 'media', required: true },
                inlineRichTextField('label', { admin: { description: 'Shown instead of the filename.' } }),
              ],
            },
          ],
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({ hasGenerateFn: true }),
            MetaImageField({ relationTo: 'media' }),
            MetaDescriptionField({}),
            PreviewField({
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'eventType',
      type: 'relationship',
      relationTo: 'event-types',
      required: true,
      admin: {
        position: 'sidebar',
        description:
          'Manage the list under Taxonomy → Event Types. Adding one there makes it selectable here immediately.',
      },
    },
    {
      name: 'presenters',
      type: 'relationship',
      relationTo: ['specialists', 'team'],
      hasMany: true,
      admin: {
        position: 'sidebar',
        description:
          'Presenters who are on the panel or the team. They render as linked cards on the event page. For an outside speaker, use “Guest presenters” below instead.',
      },
    },
    {
      // Additive companion to `presenters`, which can only hold Specialists and
      // Team members. Without this there was no way to credit an external
      // speaker — and `presenters` itself rendered nowhere at all.
      name: 'guestPresenters',
      type: 'array',
      label: 'Guest presenters',
      labels: { singular: 'Guest presenter', plural: 'Guest presenters' },
      admin: {
        position: 'sidebar',
        description: 'Speakers who are not on the VERIFY panel or team.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
            inlineRichTextField('role', { admin: { width: '50%', placeholder: 'e.g. Barrister' } }),
          ],
        },
        inlineRichTextField('organisation', { admin: { placeholder: 'e.g. Queensland Law Society' } }),
      ],
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidateEvent, revalidateSiteOnChange],
    afterDelete: [revalidateDelete, revalidateSiteOnDelete],
  },
  versions: {
    drafts: {
      autosave: { interval: 100 },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
