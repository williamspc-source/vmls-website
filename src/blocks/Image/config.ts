import type { Block } from 'payload'

import {
  cssClassField,
  imageShadowField,
  imageWidthField,
  roundedField,
  textAlignField,
  inlineRichTextField,
} from '@/fields/blockFields'

// Atom block (nestable-only): a single image with width/rounding/alignment and an
// optional caption.
export const Image: Block = {
  slug: 'image',
  interfaceName: 'ImageBlock',
  labels: { singular: 'Image', plural: 'Images' },
  fields: [
    { name: 'media', type: 'upload', relationTo: 'media', required: true, label: 'Image' },
    { type: 'row', fields: [imageWidthField, roundedField] },
    { type: 'row', fields: [imageShadowField, textAlignField] },
    inlineRichTextField('caption', { admin: { description: 'Optional caption shown below the image.' } }),
    cssClassField,
  ],
}
