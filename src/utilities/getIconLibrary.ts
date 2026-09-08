import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

import { iconMap } from '@/components/Icon'

export const ICON_LIBRARY_TAG = 'icon_library'

/**
 * The icons a picker should offer.
 *
 * **An empty library means the built-in set, not an empty picker.** That is the
 * whole point of the fallback: a global nobody has saved, a save that went
 * wrong, or a list someone emptied by accident all leave editors exactly where
 * they were rather than with nothing to choose. A control that can silently
 * remove every option is the failure this project keeps recording.
 */
export const effectiveIconList = (stored?: (string | null)[] | null): string[] => {
  const names = (stored ?? []).filter((n): n is string => Boolean(n && n.trim()))
  return names.length ? names : Object.keys(iconMap)
}

export const getCachedIconLibrary = unstable_cache(
  async (): Promise<string[]> => {
    const payload = await getPayload({ config: configPromise })
    const global = (await payload.findGlobal({ slug: 'icon-library', depth: 0 })) as {
      icons?: (string | null)[] | null
    }
    return effectiveIconList(global?.icons)
  },
  ['icon-library'],
  { tags: [ICON_LIBRARY_TAG] },
)
