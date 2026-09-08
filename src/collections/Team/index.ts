import type { CollectionConfig, Field } from 'payload'
import { inlineRichTextField } from '@/fields/blockFields'
import { portraitShapeField } from '@/fields/portraitShape'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { revalidateDelete, revalidateTeam } from './hooks/revalidateTeam'
import { revalidateSiteOnChange, revalidateSiteOnDelete } from '@/utilities/revalidateSite'
import { slugField } from 'payload'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

// Internal VERIFY staff. SEPARATE from Specialists (external doctors).
export const Team: CollectionConfig<'team'> = {
  slug: 'team',
  labels: { singular: 'Team Member', plural: 'Team Members' },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    role: true,
    department: true,
    photo: true,
    order: true,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'role', 'department', 'order'],
    group: 'People',
    description:
      'VERIFY’s own staff. Each gets a profile at /about/team/... and appears on Meet the Team. Save as a draft to hide one.',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Full name',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Profile',
          fields: [
            inlineRichTextField('role', { admin: { description: 'e.g. "IT Manager | Lawyer".' } }),
            {
              name: 'photo',
              type: 'upload',
              relationTo: 'media',
              label: 'Team photo',
              admin: {
                description:
                  'Used on Meet the Team, and as the byline photo wherever this person is credited on an article. Also used on their own profile page unless a Profile photo is set below. Fix a bad crop by moving the focal point on the image in Media.',
              },
            },
            // ── Profile-page photo ───────────────────────────────────────
            // Staff asked for the grid card and the profile page to be able to
            // differ. Both default to empty/false, which is exactly how this
            // rendered before they existed — so no member moves and no seed
            // repair is needed. Deliberately NOT in `defaultPopulate`: that
            // governs how Team is populated as a *relationship* (cards,
            // bylines), and none of those render the profile photo. The profile
            // page's own `find` returns it regardless.
            {
              name: 'profilePhoto',
              type: 'upload',
              relationTo: 'media',
              label: 'Profile photo',
              admin: {
                // Offering an upload that cannot render is the "control that
                // silently does nothing" case tests/int/adminControls guards.
                condition: (_, sibling: { hidePhotoOnProfile?: boolean } = {}) =>
                  !sibling?.hidePhotoOnProfile,
                description:
                  'Optional. Shown instead of the Team photo on this person’s own profile page only — Meet the Team and article bylines keep using the Team photo. Leave empty to use the Team photo in both places.',
              },
            },
            {
              name: 'hidePhotoOnProfile',
              type: 'checkbox',
              defaultValue: false,
              label: 'Show no photo on the profile page',
              admin: {
                description:
                  'Hides the photo on this person’s profile page; they still appear with their Team photo on Meet the Team. This wins over both uploads, so you can hide the photo without deleting it.',
              },
            },
            {
              ...portraitShapeField,
              admin: {
                ...(portraitShapeField.admin ?? {}),
                // Hidden for the same reason the upload above is: a shape
                // control on a profile that shows no photo does nothing.
                condition: (_: unknown, sibling: { hidePhotoOnProfile?: boolean } = {}) =>
                  !sibling?.hidePhotoOnProfile,
              },
            } as Field,
            {
              name: 'bio',
              type: 'richText',
            },
            {
              name: 'qualifications',
              type: 'array',
              fields: [inlineRichTextField('qualification', { required: true })],
            },
            {
              name: 'sections',
              type: 'array',
              label: 'Extra profile sections',
              labels: { singular: 'Section', plural: 'Sections' },
              admin: {
                description:
                  'Optional titled sections beyond the bio (e.g. Expertise, Affiliations).',
              },
              fields: [
                inlineRichTextField('heading', { required: true }),
                { name: 'body', type: 'richText' },
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
      // Was a select with four options fixed in code, which meant a new team
      // needed a developer, a deploy and a Postgres enum change. The list lives
      // in Taxonomy → Departments now; see src/collections/Departments.ts.
      name: 'department',
      type: 'relationship',
      relationTo: 'departments',
      hasMany: false,
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Which team this person is in. Add a new one under Taxonomy → Departments.',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Sort order within the department (lower shows first).',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        position: 'sidebar',
      },
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidateTeam, revalidateSiteOnChange],
    beforeChange: [populatePublishedAt],
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
