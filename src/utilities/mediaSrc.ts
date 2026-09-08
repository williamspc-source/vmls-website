import { getMediaUrl } from './getMediaUrl'

/**
 * Picks the smallest generated image size that still covers the box it will be
 * rendered into, falling back to the original.
 *
 * ── Why this exists ──
 * Payload generates seven derivatives on every upload and, apart from `og` in
 * generateMeta, NOTHING consumed them. Every render site asked for the original
 * file. Measured: a 5246×6016 / 3094 KB headshot shipped into a 265×265 card,
 * which the browser then had to shrink ~10× in one step — that aliases on fine
 * detail, which is what made a *higher*-resolution photo look worse than its
 * 300×300 neighbours. Sitewide it was 19.5 MB of images across six routes.
 *
 * ── Width-only sizes, never `square` or `og` ──
 * Both of those CROP: measured, `square` turns a 5246×6016 original into
 * 500×500, changing the aspect ratio from 0.872 to 1.0. Every consumer here
 * already does its own cropping with `object-fit: cover` plus a focal-point
 * `object-position` (see focalPoint.ts), so handing it a pre-cropped file would
 * crop twice and shift the framing of every face on the site. The width-only
 * ladder preserves aspect exactly — the same original's `small` is 600×688,
 * still 0.872 — so the existing CSS keeps doing the work and nothing moves.
 *
 * ── Falling back is the normal case, not an edge case ──
 * Payload only generates a derivative when the source is larger than it, so a
 * modest upload has none at all. Three of the four photos on /about/meet-the-team
 * are 300×300 originals with zero derivatives; they must keep serving the
 * original, unchanged.
 */

// Ascending. `square` (500×500) and `og` (1200×630) are deliberately absent —
// see above. `thumbnail` is width-only (300) despite the name.
const LADDER = ['thumbnail', 'small', 'medium', 'large', 'xlarge'] as const

type SizeEntry = { url?: string | null; width?: number | null }
type MediaLike = {
  url?: string | null
  width?: number | null
  updatedAt?: string | null
  sizes?: Partial<Record<string, SizeEntry | null>> | null
}

/**
 * @param media    a populated media object (a bare id returns null)
 * @param minWidth the width the image must cover, in DEVICE pixels — pass the
 *                 CSS box width × 2 so it stays sharp on a retina screen.
 */
export const mediaSrc = (media: unknown, minWidth: number): string | null => {
  if (!media || typeof media !== 'object') return null
  const m = media as MediaLike
  if (typeof m.url !== 'string' || !m.url) return null

  const tag = typeof m.updatedAt === 'string' ? m.updatedAt : null
  const original = getMediaUrl(m.url, tag)

  if (!m.sizes || !Number.isFinite(minWidth) || minWidth <= 0) return original

  for (const name of LADDER) {
    const size = m.sizes[name]
    if (!size || typeof size.url !== 'string' || !size.url) continue
    if (typeof size.width !== 'number') continue
    if (size.width >= minWidth) return getMediaUrl(size.url, tag)
  }

  // Nothing large enough — the original is the best available. This is also the
  // path taken by an upload too small to have generated any derivative.
  return original
}
