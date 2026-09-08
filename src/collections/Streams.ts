import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from 'payload'
import { iconField,
  inlineRichTextField,
} from '@/fields/blockFields'
import { revalidateSiteOnChange, revalidateSiteOnDelete } from '@/utilities/revalidateSite'

// "In the Loop" content streams (Featured, News & Updates, Industry Insights,
// Specialist Spotlights, QA Insights, Staff Narratives, Resources). A Post's
// `stream` places it in a hub section and drives its /in-the-loop/{stream}/{slug}
// URL folder + breadcrumb. Distinct from `categories`, which are topic chips.
export const Streams: CollectionConfig = {
  slug: 'streams',
  labels: { singular: 'Stream', plural: 'Streams' },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  // Makes the `order` field below actually do something: it had no reader at
  // all, so the number an editor typed changed nothing anywhere.
  defaultSort: 'order',
  admin: {
    useAsTitle: 'title',
    group: 'Taxonomy',
    description:
      'The sections of In the Loop. A stream is the folder in an article’s web address (/in-the-loop/<stream>/...), so DELETING a stream leaves its articles with no address — move them first.',
    defaultColumns: ['title', 'order', 'slug'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: { description: 'e.g. "QA Insights", "News & Updates", "Specialist Spotlights".' },
    },
    iconField({ admin: { description: 'Icon shown on the stream tab / category chip.' } }),
    inlineRichTextField('description'),
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        description:
          'Sort order in the admin list. Note: the In-the-Loop hub’s section nav is authored by hand in the Section Nav block on that page, so changing this does NOT reorder the public nav — edit the block instead.',
      },
    },
    slugField({
      position: undefined,
    }),
  ],
  hooks: {
    beforeDelete: [
      /**
       * Refuse to delete a stream that still has posts.
       *
       * The FK is ON DELETE SET NULL, so deleting a stream used to succeed
       * silently and null `stream` on every post in it. Those posts kept saying
       * "Published" in the admin while losing their URL entirely — `postPath()`
       * returns null without a stream, so they 404'd, dropped out of the sitemap
       * and out of generateStaticParams, and every card linked to the hub
       * instead. Recovery was manual, post by post, with nothing indicating what
       * had happened.
       */
      async ({ id, req }) => {
        const { totalDocs } = await req.payload.count({
          collection: 'posts',
          where: { stream: { equals: id } },
          req,
        })
        if (totalDocs > 0) {
          throw new Error(
            `This stream still has ${totalDocs} article${totalDocs === 1 ? '' : 's'}. ` +
              `Move them to another stream first — deleting it now would remove their web ` +
              `address and they would stop being reachable, even though they say Published.`,
          )
        }
      },
    ],
    afterChange: [revalidateSiteOnChange],
    afterDelete: [revalidateSiteOnDelete],
  },
}
