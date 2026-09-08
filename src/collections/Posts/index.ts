import type { CollectionConfig, PayloadRequest } from 'payload'
import { inlineRichTextField } from '@/fields/blockFields'

import type { Post } from '../../payload-types'

import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { Banner } from '../../blocks/Banner/config'
import { Code } from '../../blocks/Code/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { postPath } from '../../utilities/routes'
import { populateAuthors } from './hooks/populateAuthors'
import { revalidateDelete, revalidatePost } from './hooks/revalidatePost'
import { revalidateSiteOnChange, revalidateSiteOnDelete } from '@/utilities/revalidateSite'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { slugField } from 'payload'

/**
 * Preview / Live Preview URL for a post.
 *
 * An article lives at `/in-the-loop/<stream>/<slug>`, so the path cannot be built
 * from `slug` alone. In the admin, `data.stream` is whatever the form currently
 * holds — a populated document once the field has been loaded, but a bare id
 * straight after a save — so resolve the id through `req.payload` when needed.
 * Both `preview` and `livePreview.url` may return a promise, and both run
 * server-side, so this is a legitimate query rather than a client round-trip.
 *
 * Returns null (no preview button) for a post with no stream, rather than a URL
 * that resolves to the legacy `/posts/<slug>` redirect stub — which is what the
 * old collection-prefix map produced, and which 404s for an unpublished draft.
 */
const postPreviewPath = async (
  data: Partial<Post> | Record<string, unknown> | undefined,
  req: PayloadRequest,
): Promise<string | null> => {
  const slug = typeof data?.slug === 'string' ? data.slug : null
  if (!slug) return null

  const stream = (data as { stream?: unknown } | undefined)?.stream
  let streamSlug: string | null = null

  if (stream && typeof stream === 'object') {
    streamSlug = (stream as { slug?: string | null }).slug ?? null
  } else if (stream != null) {
    try {
      const doc = await req.payload.findByID({
        collection: 'streams',
        id: stream as string | number,
        depth: 0,
        req,
      })
      streamSlug = doc?.slug ?? null
    } catch {
      // A stream that cannot be read (deleted, or no access) leaves streamSlug
      // null, which yields no preview button — the honest outcome, rather than a
      // link to a path we know does not exist.
      streamSlug = null
    }
  }

  return generatePreviewPath({ path: postPath({ slug, stream: { slug: streamSlug } }) })
}

export const Posts: CollectionConfig<'posts'> = {
  slug: 'posts',
  labels: { singular: 'Article', plural: 'Articles' },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  // This config controls what's populated by default when a post is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'posts'>
  defaultPopulate: {
    title: true,
    slug: true,
    // `stream` is load-bearing, not decorative: postPath() builds
    // /in-the-loop/<stream>/<slug> and returns null without it. Omitting it here
    // meant every INTERNAL LINK to a post resolved to null, and CMSLink's
    // `if (!href) return null` then dropped the entire link from the page.
    stream: true,
    categories: true,
    meta: {
      image: true,
      description: true,
    },
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) => postPreviewPath(data, req),
    },
    preview: (data, { req }) => postPreviewPath(data, req),
    useAsTitle: 'title',
    group: 'Publishing',
    // The admin says "Articles" and the site says "In the Loop" — the nav item,
    // the URL, the breadcrumb and the H1 all use the latter. The description is
    // where those two vocabularies are bridged, so name the URL explicitly.
    description:
      'Articles published to the In the Loop section (/in-the-loop). Every article needs a Stream — that is what gives it a web address.',
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
          fields: [
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'excerpt',
              type: 'textarea',
              admin: { description: 'Short summary shown on listings / cards.' },
            },
            {
              name: 'readTime',
              type: 'number',
              label: 'Read time (minutes)',
              admin: { description: 'Estimated reading time, e.g. 2.' },
            },
            {
              name: 'author',
              type: 'group',
              label: 'Author / byline',
              admin: {
                description:
                  'Shown in the article meta bar and author card. Type a byline directly, or link a Team member / Specialist to source it. Collective bylines like "VERIFY Editorial Team" are supported via the free-text fields.',
              },
              fields: [
                {
                  name: 'source',
                  type: 'relationship',
                  relationTo: ['team', 'specialists'],
                  label: 'Link to person (optional)',
                  admin: {
                    description: 'Auto-sources name/role/photo/bio from a Team member or Specialist.',
                  },
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'name', type: 'text', admin: { width: '50%' } },
                    inlineRichTextField('role', { admin: { width: '50%', description: 'e.g. "Senior Coordination Manager".' } }),
                  ],
                },
                { name: 'photo', type: 'upload', relationTo: 'media' },
                inlineRichTextField('bio'),
              ],
            },
            {
              name: 'content',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    BlocksFeature({ blocks: [Banner, Code, MediaBlock] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ]
                },
              }),
              label: false,
              required: true,
            },
            {
              name: 'attachments',
              type: 'array',
              label: 'Downloads / attachments',
              labels: { singular: 'Attachment', plural: 'Attachments' },
              admin: { description: 'Optional downloadable files (e.g. a checklist PDF).' },
              fields: [
                { name: 'file', type: 'upload', relationTo: 'media', required: true },
                inlineRichTextField('label'),
              ],
            },
            {
              name: 'showToc',
              type: 'checkbox',
              label: 'Show table of contents',
              defaultValue: true,
              admin: { description: 'Auto-generate the in-article contents from headings.' },
            },
          ],
          label: 'Content',
        },
        {
          fields: [
            {
              name: 'relatedPosts',
              type: 'relationship',
              admin: {
                position: 'sidebar',
              },
              filterOptions: ({ id }) => {
                return {
                  id: {
                    not_in: [id],
                  },
                }
              },
              hasMany: true,
              relationTo: 'posts',
            },
            {
              name: 'categories',
              type: 'relationship',
              admin: {
                position: 'sidebar',
              },
              hasMany: true,
              relationTo: 'categories',
            },
            {
              name: 'stream',
              type: 'relationship',
              relationTo: 'streams',
              // Required: the stream is the first segment of a post's canonical URL
              // (/in-the-loop/<stream>/<slug>). Without one there is no valid article
              // path, so an editor must not be able to publish a stream-less post.
              required: true,
              admin: {
                position: 'sidebar',
                description: 'Which In-the-Loop section this belongs to (drives URL + hub placement).',
              },
            },
            {
              name: 'featured',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                position: 'sidebar',
                description: 'Show in the featured carousel on the In-the-Loop hub.',
              },
            },
            {
              name: 'specialty',
              type: 'relationship',
              relationTo: 'specialties',
              admin: {
                position: 'sidebar',
                description: 'Optional — the specialty for a Specialist Spotlight post.',
              },
            },
            {
              name: 'relatedSpecialist',
              type: 'relationship',
              relationTo: 'specialists',
              admin: {
                position: 'sidebar',
                description: 'Optional — the specialist featured in a spotlight.',
              },
            },
          ],
          // Not "Meta": this tab holds taxonomy and cross-links, while the real
          // metadata (title/description/image) lives in the SEO tab below. The
          // Payload template names its SEO tab "Meta", so anyone with prior
          // Payload exposure opened this one looking for the meta description.
          label: 'Categorisation',
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
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'authors',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      hasMany: true,
      relationTo: 'users',
    },
    // This field is only used to populate the user data via the `populateAuthors` hook
    // This is because the `user` collection has access control locked to protect user privacy
    // GraphQL will also not return mutated user data that differs from the underlying schema
    {
      name: 'populatedAuthors',
      type: 'array',
      access: {
        update: () => false,
      },
      admin: {
        disabled: true,
        readOnly: true,
      },
      fields: [
        {
          name: 'id',
          type: 'text',
        },
        {
          name: 'name',
          type: 'text',
        },
      ],
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidatePost, revalidateSiteOnChange],
    afterRead: [populateAuthors],
    afterDelete: [revalidateDelete, revalidateSiteOnDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
