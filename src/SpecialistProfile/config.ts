import type { GlobalConfig } from 'payload'

import { iconField,
  inlineRichTextField,
  richTextDefault,
} from '@/fields/blockFields'
import { revalidateGlobal } from '@/utilities/revalidateGlobal'
import { SPECIALIST_INDEX_PATH } from '@/utilities/routes'

// Shared copy for the "Online Booking Portal" CTA band that is byte-identical
// across all Specialist profiles, the Specialist Panel and the Specialty List —
// edited once here rather than per specialist record.
export const SpecialistProfile: GlobalConfig = {
  slug: 'specialist-profile',
  label: 'Specialist Profile',
  access: { read: () => true },
  admin: {
    group: 'Page settings',
    description: 'Shared copy shown on every specialist profile (the booking-portal CTA + labels).',
  },
  fields: [
    {
      name: 'portalCta',
      type: 'group',
      label: 'Booking Portal CTA',
      fields: [
        {
          type: 'row',
          fields: [
            inlineRichTextField('eyebrow', { admin: { width: '50%' } }),
            inlineRichTextField('heading', { admin: { width: '50%' } }),
          ],
        },
        inlineRichTextField('subheading'),
        {
          name: 'tiles',
          type: 'array',
          label: 'Feature tiles',
          maxRows: 4,
          fields: [
            iconField(),
            inlineRichTextField('label', { required: true }),
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'enquiryLabel',
              type: 'text',
              defaultValue: 'Send Enquiry',
              admin: { width: '50%' },
            },
            {
              name: 'bookingLabel',
              type: 'text',
              defaultValue: 'Book an appointment',
              admin: {
                width: '50%',
                description: 'Shown only when the specialist has a Booking link.',
              },
            },
            {
              name: 'cvLabel',
              type: 'text',
              defaultValue: 'Download CV',
              admin: { width: '50%', description: 'Shown only when a CV is attached.' },
            },
            {
              name: 'sampleReportLabel',
              type: 'text',
              defaultValue: 'Sample report',
              admin: { width: '50%', description: 'Shown only when a sample report is attached.' },
            },
            {
              name: 'enquiryEmail',
              type: 'text',
              admin: {
                width: '50%',
                description: 'Optional — defaults to the Site Settings / Footer contact email.',
              },
            },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'portalEnquirySubject',
          type: 'text',
          defaultValue: 'VERIFY Booking Portal Access Request',
          admin: {
            width: '50%',
            description: 'Subject line of the booking-portal enquiry email (mailto).',
          },
        },
        {
          name: 'portalEnquiryType',
          type: 'text',
          defaultValue: 'Register for Online Booking Portal',
          admin: {
            width: '50%',
            description: 'Enquiry-type tag sent with the booking-portal CTA.',
          },
        },
      ],
    },
    {
      name: 'labels',
      type: 'group',
      label: 'Section labels',
      admin: { description: 'The fixed headings on the profile body (leave default unless rebranding).' },
      fields: [
        {
          type: 'row',
          fields: [
            inlineRichTextField('biography', { defaultValue: richTextDefault('Biography'), admin: { width: '50%' } }),
            inlineRichTextField('assessmentAreas', { defaultValue: richTextDefault('Assessment Areas'),
              admin: { width: '50%' } }),
          ],
        },
        {
          type: 'row',
          fields: [
            inlineRichTextField('qualifications', { defaultValue: richTextDefault('Qualifications'),
              admin: { width: '50%' } }),
            inlineRichTextField('accreditations', { defaultValue: richTextDefault('Accreditations'),
              admin: { width: '50%' } }),
          ],
        },
        {
          type: 'row',
          fields: [
            inlineRichTextField('assessmentTypes', { defaultValue: richTextDefault('Assessment Types'),
              admin: { width: '50%' } }),
            // Claim Types used to be concatenated into the Assessment Types
            // list, so a claim type never appeared under its own name on any
            // profile — two separately-maintained taxonomies rendered as one.
            inlineRichTextField('claimTypes', {
              defaultValue: richTextDefault('Claim Types'),
              admin: { width: '50%' },
            }),
          ],
        },
      ],
    },
    {
      name: 'breadcrumb',
      type: 'group',
      label: 'Breadcrumb',
      admin: {
        description:
          'The middle crumb of the trail shown at the top of every profile. The first crumb — “Home” — is shared site-wide (Site Settings → Breadcrumbs); the last is the specialist’s own name.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'breadcrumbParentLabel',
              type: 'text',
              defaultValue: 'Specialist Panel',
              admin: { width: '50%' },
            },
            {
              name: 'breadcrumbParentHref',
              type: 'text',
              defaultValue: SPECIALIST_INDEX_PATH,
              admin: { width: '50%' },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateGlobal('specialist-profile')],
  },
}
