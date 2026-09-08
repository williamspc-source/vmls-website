import type { CollectionBeforeChangeHook } from 'payload'

import { splitPersonName } from '@/utilities/personName'

/**
 * Fill `firstName` / `lastName` from the full name when either is blank.
 *
 * The directory sorts on these two columns, and until this existed nothing wrote
 * `firstName` at all — 0 of 26 rows had one, so the "Given name" sort option
 * ordered an all-NULL column and looked broken while its code was correct.
 * `lastName` was written only by the seed hand-listing it, so a specialist added
 * through the admin had no surname either and sorted into the NULL clump.
 *
 * **Only into a blank.** Both fields stay editable overrides — that is what their
 * descriptions promise, and it is the escape hatch for the parser's known limit
 * (a middle name lands in the surname). An editor's value is never replaced.
 */
export const deriveNames: CollectionBeforeChangeHook = ({ data }) => {
  const title = typeof data?.title === 'string' ? data.title : ''
  if (!title.trim()) return data

  const derived = splitPersonName(title)
  const blank = (v: unknown) => typeof v !== 'string' || v.trim() === ''

  // Empty strings are not written: a single-word name yields no surname, and
  // storing '' there would be indistinguishable from an editor clearing it.
  if (blank(data.firstName) && derived.firstName) data.firstName = derived.firstName
  if (blank(data.lastName) && derived.lastName) data.lastName = derived.lastName

  return data
}
