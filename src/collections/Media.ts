import { richBodyField } from '@/fields/blockFields'
import type { CollectionConfig } from 'payload'

import path from 'path'
import { fileURLToPath } from 'url'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { revalidateSiteOnChange, revalidateSiteOnDelete } from '@/utilities/revalidateSite'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  folders: true,
  admin: {
    group: 'Media',
    description:
      'Every uploaded image and file. Set alt text here, and fix a bad crop by moving the focal point rather than re-uploading.',
    defaultColumns: ['filename', 'alt', 'updatedAt'],
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    richBodyField('caption'),
    {
      name: 'zoom',
      type: 'number',
      min: 100,
      max: 300,
      admin: {
        position: 'sidebar',
        step: 5,
        description:
          'Optional zoom for cropped avatars/headshots (100 = fit, 150 = 1.5× into the focal point). Set the focal point above to choose which part of the image stays centred; increase zoom to fill more of the frame.',
      },
    },
  ],
  upload: {
    // Upload to the public/media directory in Next.js making them publicly accessible even outside of Payload
    staticDir: path.resolve(dirname, '../../public/media'),
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
  hooks: {
    afterChange: [revalidateSiteOnChange],
    afterDelete: [revalidateSiteOnDelete],
  },
}
