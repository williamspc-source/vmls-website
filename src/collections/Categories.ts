import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from 'payload'
import { iconField,
  inlineRichTextField,
} from '@/fields/blockFields'
import { revalidateSiteOnChange, revalidateSiteOnDelete } from '@/utilities/revalidateSite'

export const Categories: CollectionConfig = {
  slug: 'categories',
  // Shown on an article as "Topics" (ArticleSettings → labels.topics), so the
  // admin follows the site rather than the other way round.
  labels: { singular: 'Topic', plural: 'Topics' },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    group: 'Taxonomy',
    description:
      'Subject tags for articles. Shown as coloured chips on article cards and under the "Topics" heading on an article.',
    defaultColumns: ['title', 'slug'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    iconField({ admin: { description: 'Icon shown on the category/topic chip.' } }),
    {
      name: 'color',
      type: 'text',
      admin: { description: 'Optional hex for the category chip, e.g. #1c75bc.' },
    },
    inlineRichTextField('description'),
    slugField({
      position: undefined,
    }),
  ],
  hooks: {
    afterChange: [revalidateSiteOnChange],
    afterDelete: [revalidateSiteOnDelete],
  },
}
