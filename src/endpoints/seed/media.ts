import { seedCreate, seedUpdate } from './seedWrite'
import type { Payload, PayloadRequest } from 'payload'
import { readdirSync, statSync } from 'fs'
import path from 'path'

type Ctx = { payload: Payload; req: PayloadRequest }

/**
 * Matching people to the photo files committed under `public/assets/images/`,
 * and keeping the stored Media doc in step with them.
 *
 * ── Why this exists ──
 * `public/media/` is gitignored, so a photo uploaded through the admin lives
 * only on the machine it was uploaded from. `public/assets/images/` is tracked,
 * which makes it the only way a photo reaches the box. The seed uploads from
 * there — but until this module, dropping a replacement file in changed nothing,
 * for three separate reasons:
 *
 *   1. the team lookup hardcoded `${slug}.png`, so a .jpg never matched;
 *   2. the backfill skipped anyone who already had a photo, which was all of
 *      them (26 of 26 specialists, 14 of 19 team);
 *   3. `getOrCreateMedia` dedupes by `alt`, so even past (2) it handed back the
 *      OLD doc and the new file was never uploaded.
 *
 * None of the three logged anything. The seed reported success and the photos
 * did not move.
 *
 * ── Why `filesize` is the disk↔database link ──
 * The stored filename cannot be it: Payload suffixes on collision, so
 * `wes-lerch.png` is stored as `wes-lerch-15.png` (and `-17` on the next
 * install). `filesize` is exact and needs no hashing — measured, all 13
 * repo-sourced team PNGs matched their doc's `filesize` byte-for-byte.
 */

const IMAGE_EXT = /\.(png|jpe?g|webp)$/i

/** Title-prefix tokens stripped when matching a person to their photo filename. */
const NAME_TOKENS = new Set([
  'dr', 'drs', 'adj', 'adjunct', 'prof', 'professor', 'assoc', 'associate', 'a', 'aprof', 'ms',
  'mr', 'mrs', 'mx',
])

/**
 * "Dr Adam Parr.png" and "Adam Parr" both reduce to "adam parr". Strips the
 * extension first, so it is already extension-agnostic — which is why the
 * specialist half never had the `.png` bug the team half did.
 */
export const nameKey = (s: string): string =>
  s
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter((t) => t && !NAME_TOKENS.has(t))
    .join(' ')

/** Filename minus its extension — the key a team photo matches its slug on. */
export const fileKey = (f: string): string => f.replace(IMAGE_EXT, '').toLowerCase()

export type ImageIndex = {
  /** Absolute path for `key`, marking the file as claimed. `null` if absent or ambiguous. */
  take: (key: string) => string | null
  /** Files nobody claimed — a typo'd filename, or a photo for a person who does not exist. */
  unclaimed: () => string[]
  /** Keys resolving to more than one file, e.g. a stale .png left beside a new .jpg. */
  ambiguous: [string, string[]][]
  count: number
}

/**
 * Indexes a folder of images by a caller-supplied key.
 *
 * An ambiguous key returns `null` rather than a guess. Two files for one person
 * means a stale one was left behind, and silently picking either is how the
 * wrong photo ships without anyone noticing; the fix is one deletion, and the
 * caller names both files in the log.
 */
export const indexImages = (dir: string, keyOf: (file: string) => string): ImageIndex => {
  let files: string[] = []
  try {
    files = readdirSync(dir).filter((f) => IMAGE_EXT.test(f))
  } catch {
    files = []
  }

  const byKey = new Map<string, string[]>()
  for (const f of files) {
    const k = keyOf(f)
    byKey.set(k, [...(byKey.get(k) ?? []), f])
  }

  const claimed = new Set<string>()

  return {
    count: files.length,
    ambiguous: [...byKey.entries()].filter(([, v]) => v.length > 1),
    take: (key) => {
      const hit = byKey.get(key)
      if (!hit || hit.length !== 1) return null
      claimed.add(hit[0]!)
      return path.join(dir, hit[0]!)
    },
    unclaimed: () => files.filter((f) => !claimed.has(f)),
  }
}

/**
 * Uploads a Media doc from disk once; reuses an existing doc by matching alt.
 *
 * The `alt` dedupe is what stops a re-run creating a second copy of every
 * headshot — and it is also why replacing a photo needs `syncMediaFile` below
 * rather than another call to this.
 */
export async function getOrCreateMedia(
  { payload, req }: Ctx,
  absPath: string,
  alt: string,
): Promise<number | string | null> {
  const existing = await payload.find({
    collection: 'media',
    where: { alt: { equals: alt } },
    limit: 1,
    depth: 0,
    req,
  })
  if (existing.docs[0]) return existing.docs[0].id
  try {
    const created = await seedCreate(payload, {
      collection: 'media',
      // Headshots: seed the focal point at (near) top-centre to match the design
      // reference's `object-position: top center` on the carousel/avatar images.
      // NB: Payload coerces a falsy `focalY: 0` back to the 50 default, so we use
      // 1 (`50% 1%` ≈ top, visually identical). Editors fine-tune per image via
      // the focal-point picker + zoom in the Media library.
      data: { alt, focalX: 50, focalY: 1 } as never,
      filePath: absPath,
      req,
      context: { disableRevalidate: true },
    })
    return created.id
  } catch (e) {
    payload.logger.warn(`  · media upload failed for ${alt}: ${(e as Error).message}`)
    return null
  }
}

/**
 * Points an existing Media doc at a different file on disk, in place.
 *
 * In place is the whole point: the media id, `alt`, focal point and `zoom` all
 * survive, so every reference to that image updates at once and no orphan doc
 * is left behind. Measured on a throwaway doc before this was written — same id,
 * new filesize/width/height, focal 33/7 and zoom 145 intact, the previous file
 * removed from `public/media`, all derivatives regenerated, and colour type 6
 * (alpha) preserved on the original *and* on every derivative, which is what
 * lets the specialist cut-outs stay transparent.
 *
 * Self-limiting: once the write lands, the doc's `filesize` matches the folder
 * file, so a second seed run returns 'unchanged' and writes nothing.
 */
export async function syncMediaFile(
  { payload, req }: Ctx,
  mediaId: number | string,
  absPath: string,
): Promise<'replaced' | 'unchanged' | 'failed'> {
  let bytes: number
  try {
    bytes = statSync(absPath).size
  } catch {
    return 'failed'
  }

  const doc = (await payload
    .findByID({ collection: 'media', id: mediaId, depth: 0, req })
    .catch(() => null)) as { filesize?: number | null } | null

  if (!doc) return 'failed'
  if (doc.filesize === bytes) return 'unchanged'

  try {
    await seedUpdate(payload, {
      collection: 'media',
      id: mediaId,
      data: {} as never,
      filePath: absPath,
      req,
      context: { disableRevalidate: true },
    })
    return 'replaced'
  } catch (e) {
    payload.logger.warn(
      `  · photo replace failed for ${path.basename(absPath)}: ${(e as Error).message}`,
    )
    return 'failed'
  }
}

type Person = { slug: string; title: string }

/**
 * Brings one collection's photos into line with the files committed under
 * `public/assets/images/`.
 *
 * The folder is the source of truth: a person with a file there is managed from
 * there, and the way to hand a photo back to the admin is to delete the file.
 * Four states, and only two of them write:
 *
 *   no photo, file present    → upload and attach
 *   photo, file differs       → replace the stored file in place
 *   photo, same bytes         → nothing
 *   no file                   → nothing; the photo is left alone
 *
 * The report is deliberately louder than the old `— Team photos backfilled (n)`.
 * A file that matches nobody used to be discarded in silence — `evie-le.png` has
 * been sitting in `team/` unmatched all along — which is exactly what a typo
 * looks like when twenty files are dropped in at once.
 */
export async function syncPeoplePhotos(
  ctx: Ctx,
  opts: {
    label: string
    dir: string
    collection: 'specialists' | 'team'
    people: readonly Person[]
    keyOfFile: (file: string) => string
    keyOfPerson: (person: Person) => string
  },
): Promise<void> {
  const { payload, req } = ctx
  const { label, dir, collection, people, keyOfFile, keyOfPerson } = opts

  try {
    const index = indexImages(dir, keyOfFile)
    if (!index.count) {
      payload.logger.warn(`— ${label} photos skipped: no image files under ${dir}`)
      return
    }

    let added = 0
    let replaced = 0
    let unchanged = 0
    const replacedSlugs: string[] = []

    for (const person of people) {
      const absPath = index.take(keyOfPerson(person))
      if (!absPath) continue

      const found = await payload.find({
        collection,
        where: { slug: { equals: person.slug } },
        limit: 1,
        depth: 0,
        req,
      })
      const rec = found.docs[0] as { id: number | string; photo?: unknown } | undefined
      if (!rec) continue

      if (rec.photo) {
        // Depth 0 gives the id, but tolerate a populated doc so this cannot
        // depend on the caller's depth.
        const photoId =
          typeof rec.photo === 'object'
            ? (rec.photo as { id?: number | string }).id
            : (rec.photo as number | string)
        if (photoId === undefined || photoId === null) continue

        const outcome = await syncMediaFile(ctx, photoId, absPath)
        if (outcome === 'replaced') {
          replaced++
          replacedSlugs.push(person.slug)
        } else if (outcome === 'unchanged') {
          unchanged++
        }
        continue
      }

      const mediaId = await getOrCreateMedia(ctx, absPath, person.title)
      if (!mediaId) continue
      await seedUpdate(payload, {
        collection,
        id: rec.id,
        data: { photo: mediaId } as never,
        req,
        context: { disableRevalidate: true },
      })
      added++
    }

    payload.logger.info(
      `— ${label} photos: ${added} added, ${replaced} replaced, ${unchanged} unchanged`,
    )
    if (replacedSlugs.length) payload.logger.info(`  · replaced: ${replacedSlugs.join(', ')}`)

    for (const [key, files] of index.ambiguous) {
      payload.logger.warn(
        `  · "${key}" matches ${files.length} files (${files.join(', ')}) — delete the stale one; skipped`,
      )
    }
    const ambiguousFiles = new Set(index.ambiguous.flatMap(([, files]) => files))
    const orphans = index.unclaimed().filter((f) => !ambiguousFiles.has(f))
    if (orphans.length) {
      payload.logger.warn(`  · matched nobody, ignored: ${orphans.join(', ')}`)
    }
  } catch (e) {
    payload.logger.warn(`— ${label} photo sync skipped: ${(e as Error).message}`)
  }
}
