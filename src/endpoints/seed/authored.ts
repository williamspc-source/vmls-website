/**
 * One answer to "has this page been written yet?", for every seed module.
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 *
 * Each of the seven `authorPage` copies used to decide with `layout.length > 2`.
 * That is a proxy for "looks substantial", not for "someone wrote this", and it
 * is wrong in the direction that costs an editor their work: **any page with two
 * or fewer blocks is rewritten from the fixture on every seed run.**
 *
 * Measured on the local database before this was fixed: **13 of 27 pages** sat at
 * one or two blocks — Contact, Meet the Team, Specialists, Specialist Panel,
 * Information Centre, Events & Seminars, Upcoming/Past Events, Educational
 * Services, Other Reporting Services, Specialist Availability, Privacy Policy and
 * Terms & Conditions. Proven rather than reasoned about: the events hero was
 * reworded through the API to "EDITOR WORDING TEST", the seed was re-run, and the
 * fixture wording came back.
 *
 * The correct signal already existed in `seedVerify` as `isPlaceholderLayout`,
 * and was only ever used for the two pages built outside `authorPage`. The page
 * tree creates every page holding one `content` block reading "…is scaffolded and
 * ready for content", so that block — and nothing else — means untouched.
 *
 * Seven copies of a rule is also how the collection→prefix map in `routes.ts`
 * came to disagree with itself, which `CLAUDE.md` records. Hence one function.
 */

/** True when a page still holds the generic scaffold placeholder layout. */
export const isPlaceholderLayout = (layout: unknown): boolean => {
  const arr = layout as { blockType?: string }[] | undefined
  return (
    Array.isArray(arr) &&
    arr.length === 1 &&
    arr[0]?.blockType === 'content' &&
    JSON.stringify(arr[0]).includes('scaffolded and ready for content')
  )
}

/**
 * True when the seed may write a page's layout: it is empty, or still the
 * scaffold placeholder. Anything else is content — whether the seed authored it
 * on an earlier run or a human did — and is left alone.
 *
 * A fixture change therefore does NOT reach an existing install. That is the
 * deliberate trade, and it is the same one `repairLinkTargets` was written for:
 * pair the fixture edit with a narrow, additive repair that writes only into an
 * absence. See `seedEventsHub.ts`.
 */
export const isUnauthored = (layout: unknown): boolean =>
  !Array.isArray(layout) || layout.length === 0 || isPlaceholderLayout(layout)
