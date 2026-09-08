import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * `revalidatePath` / `revalidateTag` that cannot take the caller down with them.
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 * Next 16 throws when either is called from anywhere other than a Server Action
 * or a route handler — including "used ... during render which is unsupported".
 * Payload runs `afterChange` hooks **inside the database transaction**, so an
 * unguarded throw does not merely log: it aborts the operation and rolls the
 * write back.
 *
 * That was not hypothetical. Measured on this repo, at HEAD as well as on the
 * fixed tree: opening **Admin → Pages → Create New** rendered the sidebar and no
 * form at all — zero inputs, no `<form>` element, HTTP 200, nothing in the
 * browser console. Same for Posts. The server log showed:
 *
 *   ERROR: Route /admin/[[...segments]] used "revalidateTag global_header"
 *          during render which is unsupported.
 *   ERROR: Nested Docs plugin has had an error while adding breadcrumbs
 *          during document creation.
 *
 * Building the create view's initial form state runs the nested-docs breadcrumb
 * logic, that touched our revalidation hooks, and the throw propagated out of
 * form-state construction. The result was a CMS in which **no new page or post
 * could be created**, presenting as an empty screen with no error.
 *
 * Cache invalidation is best-effort by nature: the worst case of a skipped purge
 * is a page serving stale content until the next write or the next deploy. The
 * worst case of a thrown purge is losing the write. So it is always caught, and
 * always reported — never swallowed silently.
 */
type Logger = { warn: (msg: string) => void }

const report = (logger: Logger | undefined, what: string, err: unknown) => {
  const message =
    `Revalidation skipped (${what}): ${err instanceof Error ? err.message : String(err)}. ` +
    `The write itself succeeded; affected pages may serve stale content until the next change.`
  if (logger) logger.warn(message)
  else console.warn(message)
}

export const safeRevalidatePath = (
  path: string,
  type?: 'layout' | 'page',
  logger?: Logger,
): void => {
  try {
    if (type) revalidatePath(path, type)
    else revalidatePath(path)
  } catch (err) {
    report(logger, `path ${path}`, err)
  }
}

/**
 * Purge a cache tag **now**.
 *
 * ── Why there is no `profile` parameter ─────────────────────────────────────
 * There used to be one, defaulting to `'max'`, and every call site passed it.
 * That was close to the opposite of a purge. Traced through `next@16.2.6`:
 *
 *   1. the built-in `max` profile is `{ stale: 300, revalidate: 2592000,
 *      expire: 31536000 }` — `server/config-shared.js`
 *   2. given *any* profile, `FileSystemCache.revalidateTag` sets
 *      `stale = now` and `expired = now + expire * 1000` — so a **year** into
 *      the future. Given **no** profile it sets `expired = now`
 *      — `server/lib/incremental-cache/file-system-cache.js:53-74`
 *   3. `areTagsExpired` requires `expiredAt <= now`, which a year in the future
 *      never satisfies — `.../tags-manifest.external.js`
 *
 * So the entry was only ever marked *stale*, never *expired*: stale-while-
 * revalidate. Measured under `next start` on 2026-08-13, editing a Design
 * System token through the admin and watching `--vf-text-scale` in the served
 * HTML:
 *
 *   edit -> t+2s reload = OLD value   <- what the editor sees
 *           t+7s reload = new value
 *
 * The first reload after every save showed the previous value, and under
 * several quick edits the page ran two versions behind. An editor changes a
 * brand colour, reloads, sees no change, and concludes the save did not work —
 * the "appears to work when it doesn't" failure the invariants exist to stop.
 *
 * `{ expire: 0 }` gives `expired = now + 0` — an immediate, *hard* expiry,
 * matching the legacy one-argument behaviour without its deprecation warning.
 * A named profile can never be passed again, because the parameter is gone.
 *
 * Note this only reaches the tag manifest of the process that calls it. A write
 * made from a CLI script (`payload run`, a migration) runs its hooks in *that*
 * process and cannot purge a separately running server — see CLAUDE.md.
 */
export const safeRevalidateTag = (tag: string, logger?: Logger): void => {
  try {
    revalidateTag(tag, { expire: 0 })
  } catch (err) {
    report(logger, `tag ${tag}`, err)
  }
}
