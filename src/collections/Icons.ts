import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'

import path from 'path'
import { fileURLToPath } from 'url'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { revalidateSiteOnChange, revalidateSiteOnDelete } from '@/utilities/revalidateSite'
import { SvgIconError, normaliseSvgIcon } from '@/utilities/svgIcon'
import { iconUsage } from '@/utilities/iconUsage'
import { ICONS_TAG } from '@/utilities/getIconDefaults'
import { safeRevalidateTag } from '@/utilities/safeRevalidate'
import { BRAND_TEXT_COLORS, INHERIT_COLOR } from '@/fields/richTextColors'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/**
 * Icons an editor uploads, alongside the built-in Phosphor set.
 *
 * ## Why this is not part of Media
 *
 * Media generates seven resized copies of everything it is given
 * (`thumbnail`…`og`). For a 2KB vector those are meaningless — and actively
 * wrong, since they are raster. This collection declares no `imageSizes` at all,
 * so an upload stays the single file it was.
 *
 * It also lets the upload be restricted to `image/svg+xml`, and keeps thirty-odd
 * small vectors out of a library holding hundreds of photographs.
 *
 * ## What is stored
 *
 * Not the uploaded file's markup — **markup this codebase reconstructed** from
 * the geometry it recognised. See `src/utilities/svgIcon.ts` for why. The file
 * itself is still written to disk by Payload's upload handling; nothing renders
 * from it, and `viewBox`/`markup` below are the only things `Icon` reads.
 *
 * ## Why there is no `alt`
 *
 * Icons here are decorative and render `aria-hidden`, exactly as the built-in
 * ones do (`src/components/Icon`). The meaning is always in the label beside
 * them, so alt text would be read out twice. `name` exists for the picker, not
 * for assistive technology.
 */
export const Icons: CollectionConfig = {
  slug: 'icons',
  admin: {
    group: 'Media',
    // Hidden from the sidebar ON PURPOSE. Uploading, ticking and searching all
    // happen on ONE screen — Design → Icon Library — and two destinations for one
    // job is what this replaced. The collection still exists: Payload needs one
    // to store a file, the delete guard hangs off it, and each uploaded tile
    // links straight here for renaming, colour and deletion. Hiding affects the
    // nav only; every route still works.
    hidden: true,
    useAsTitle: 'name',
    description:
      'Your own icons, offered in every icon picker alongside the built-in ones. Upload a single-colour SVG — its own colours are ignored, because the site paints it to match whatever it sits on.',
    defaultColumns: ['name', 'colour', 'filename', 'updatedAt'],
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: {
            width: '55%',
            description: 'What this icon is called in the picker, e.g. "Verify shield".',
          },
        },
        {
          // The colour this icon is MEANT to be, applied wherever it is placed —
          // so a brand mark looks right the moment someone picks it, without
          // setting the colour again at every use.
          //
          // A palette KEY, never a hex, for the reason written up in
          // `richTextColors.ts`: Site Settings then repaints it on a rebrand, and
          // the on-dark scale re-points it on a navy band instead of leaving it
          // low-contrast. Baking the colour into the uploaded artwork would do
          // neither, and would stop the same icon being reused on a dark band.
          name: 'colour',
          type: 'select',
          label: 'Default colour',
          defaultValue: INHERIT_COLOR,
          options: [
            { label: 'Follows the band (as designed)', value: INHERIT_COLOR },
            ...BRAND_TEXT_COLORS.map((c) => ({ label: c.label, value: c.key })),
          ],
          admin: {
            width: '45%',
            description:
              'Leave as "Follows the band" and the icon takes the colour of the text beside it, turning white on dark bands. Any placement can override this.',
          },
        },
      ],
    },
    {
      name: 'viewBox',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Read from the uploaded file.',
        // Derived on upload — shown so a curious editor can see it, never typed.
        // A `readOnly` field is exempt from the "every control must be wired"
        // rule precisely because it is not a control.
      },
    },
    {
      name: 'markup',
      type: 'textarea',
      admin: {
        readOnly: true,
        description:
          'The shape data kept from the uploaded file. Rebuilt on every upload — colours, scripts and anything else are dropped.',
      },
    },
  ],
  upload: {
    staticDir: path.resolve(dirname, '../../public/icons'),
    // SVG only. A PNG cannot take the site's colour and blurs when scaled, so
    // accepting one would be offering a control that quietly does the wrong
    // thing rather than refusing at the point of upload.
    mimeTypes: ['image/svg+xml'],
    // Deliberately no `imageSizes` — see the docblock.
  },
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        // Payload puts the uploaded bytes on `req.file` for a create, and only
        // when a NEW file is supplied on an update — so an editor renaming an
        // icon must not lose its markup. Hence the guard rather than an else.
        const file = req.file
        if (!file?.data) return data
        try {
          const { viewBox, markup } = normaliseSvgIcon(file.data.toString('utf8'))
          return { ...data, viewBox, markup }
        } catch (error) {
          if (error instanceof SvgIconError) {
            // Surfaced in the admin next to the upload rather than logged. An
            // icon that failed to parse and saved anyway would render as nothing
            // wherever it was chosen, with no clue why.
            throw new APIError(`That SVG could not be used. ${error.message}`, 400)
          }
          throw error
        }
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        const doc = (await req.payload.findByID({
          collection: 'icons',
          id,
          depth: 0,
          req,
          overrideAccess: false,
        })) as { id: string | number; name?: string }
        const usage = await iconUsage(req.payload, `upload:${doc?.id}`, req)
        if (usage.length) {
          // Refusing is the whole point: deleting silently would leave a gap
          // wherever the icon was chosen, and nobody would find out.
          throw new APIError(
            `“${doc?.name ?? 'This icon'}” is still in use on ${usage.length} document(s): ${usage
              .slice(0, 8)
              .join(', ')}${usage.length > 8 ? ', …' : ''}. Change those to a different icon first.`,
            400,
          )
        }
      },
    ],
    // `revalidateSite*` covers the pages an icon appears on; the tag purge covers
    // the layout's `[data-vf-icon]` stylesheet, which is an `unstable_cache`
    // entry and would otherwise keep serving the old default colour.
    afterChange: [
      revalidateSiteOnChange,
      ({ req, doc }) => {
        if (!req?.context?.disableRevalidate) safeRevalidateTag(ICONS_TAG)
        return doc
      },
    ],
    afterDelete: [
      revalidateSiteOnDelete,
      ({ req, doc }) => {
        if (!req?.context?.disableRevalidate) safeRevalidateTag(ICONS_TAG)
        return doc
      },
    ],
  },
}
