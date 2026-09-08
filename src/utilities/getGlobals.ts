import type { Config } from 'src/payload-types'

import configPromise from '@payload-config'
import { type DataFromGlobalSlug, getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

type Global = keyof Config['globals']

async function getGlobal<T extends Global>(slug: T, depth = 0): Promise<DataFromGlobalSlug<T>> {
  const payload = await getPayload({ config: configPromise })

  const global = await payload.findGlobal({
    slug,
    depth,
  })

  return global
}

/**
 * Returns an unstable_cache function mapped with the cache tag for the slug.
 *
 * `depth` MUST stay in the key parts. Next derives a cache entry's identity from
 * `callback.toString()` plus the key parts — and the callback here stringifies
 * identically for every call, so with `[slug]` alone a depth-0 and a depth-1 read
 * of the same global shared one entry. Whichever rendered first after a purge
 * won: when the depth-0 read landed first, `settings.logo` was a bare id rather
 * than a populated doc and the header logo, footer logo, favicon and OG image
 * all silently fell back to the bundled defaults — nondeterministically, so it
 * looked like the upload had simply not worked.
 */
export const getCachedGlobal = <T extends Global>(slug: T, depth = 0) =>
  unstable_cache(async () => getGlobal<T>(slug, depth), [slug, String(depth)], {
    tags: [`global_${slug}`],
  })
