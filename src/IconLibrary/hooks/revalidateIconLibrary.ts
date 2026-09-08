import type { GlobalAfterChangeHook } from 'payload'

import { ICON_LIBRARY_TAG } from '@/utilities/getIconLibrary'
import { safeRevalidateTag } from '@/utilities/safeRevalidate'

/**
 * The library is read through `unstable_cache`, so a save has to purge its tag or
 * the picker keeps offering yesterday's list. `context.disableRevalidate` is
 * honoured for the same reason every other hook here does: the seed writes
 * globals in bulk and must not trigger a revalidation storm.
 */
export const revalidateIconLibrary: GlobalAfterChangeHook = ({ doc, req }) => {
  if (!req?.context?.disableRevalidate) safeRevalidateTag(ICON_LIBRARY_TAG)
  return doc
}
