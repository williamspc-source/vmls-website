import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

export type IconDefault = { id: string | number; colour?: string | null }

/**
 * Every uploaded icon's default colour, for the stylesheet the layout emits.
 *
 * ## Why the colour is published as CSS rather than read at render
 *
 * `Icon` is rendered by client components as well as server ones, so it cannot
 * look a record up. Baking the record's colour into the stored value at pick time
 * would work, but then changing an icon's colour later would leave every existing
 * placement behind — which is exactly the failure `richTextColors.ts` avoids by
 * storing keys instead of hex.
 *
 * So the mapping is published once per page as `[data-vf-icon="12"]{color:…}`,
 * beside the brand tokens that are already emitted there. A placement that names
 * its own colour emits `.vf-tc-*`, which carries `!important` and therefore wins.
 *
 * Cached and tagged so it costs one query per purge rather than one per page; the
 * Icons collection purges the tag on change and delete.
 */
export const ICONS_TAG = 'icons_defaults'

export const getCachedIconDefaults = unstable_cache(
  async (): Promise<IconDefault[]> => {
    const payload = await getPayload({ config: configPromise })
    const res = await payload.find({
      collection: 'icons',
      depth: 0,
      limit: 1000,
      pagination: false,
      // `icons` is `access.read: anyone` and has no drafts, so this reads exactly
      // what a visitor would get. Passed explicitly rather than relying on the
      // Local API's default (invariant 15).
      overrideAccess: false,
      select: { colour: true },
    })
    return res.docs as IconDefault[]
  },
  ['icon-defaults'],
  { tags: [ICONS_TAG] },
)
