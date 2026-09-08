/**
 * Splitting a person's display name into a given name and a surname, for sorting.
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 * The specialist directory offers "Given name" as a sort option and it ordered
 * nothing, because `firstName` was declared on the collection and written by
 * absolutely nothing: measured against the database, 0 of 26 rows had a value.
 * `sort: 'firstName'` over an all-NULL column is not an error — Postgres just
 * returns rows in heap order, so the control looked broken while every code
 * branch behind it was correct. `lastName` had the same shape and was saved only
 * by the seed hand-listing it, so any specialist added through the admin sorted
 * into the NULL clump at the end.
 *
 * ── The split, and why it is not "last word = surname" ──────────────────────
 * One of the 26 is **Dr Michael Mar Fan**, whose surname is two words. Taking
 * the last word would file him under F and silently disagree with the surname
 * the seed already stored. So: strip the leading honorific, the FIRST remaining
 * word is the given name, and EVERYTHING after it is the surname. That
 * reproduces all 26 stored surnames exactly, "Mar Fan" included, and handles
 * "Adjunct Professor Anna Lenardon" and "A/Prof Arman Sabet".
 *
 * Its known limit is a middle name — "Dr John Paul Smith" yields "Paul Smith" —
 * which is why both fields stay editable and this only fills a blank.
 */

/**
 * Leading honorific tokens, skipped before the split. Shared with the initials
 * avatar in `SpecialtyClient.tsx`, which had the only copy of this list.
 */
export const TITLE_TOKENS = new Set([
  'dr',
  'mr',
  'mrs',
  'ms',
  'miss',
  'prof',
  'professor',
  'associate',
  'assoc',
  'adjunct',
  'adj',
  'clinical',
  'a/prof',
  'sir',
  'dame',
  'honorary',
  'the',
])

/**
 * `{ firstName, lastName }` from a display name.
 *
 * Both are `''` when the name yields nothing to split — a single word after the
 * honorific gives a given name and no surname, and an empty name gives neither.
 * Callers should leave the stored field alone rather than write an empty string,
 * so an editor's own value is never replaced by a guess.
 */
export const splitPersonName = (name?: string | null): { firstName: string; lastName: string } => {
  const words = (name ?? '')
    .replace(/\./g, '')
    .split(/\s+/)
    .filter(Boolean)
  // Only LEADING honorifics are dropped: a surname that happens to collide with
  // one ("Dr Ruth Dame") must survive, so the scan stops at the first real word.
  let i = 0
  while (i < words.length && TITLE_TOKENS.has(words[i]!.toLowerCase())) i++
  const rest = words.slice(i)
  if (rest.length === 0) return { firstName: '', lastName: '' }
  return { firstName: rest[0]!, lastName: rest.slice(1).join(' ') }
}
