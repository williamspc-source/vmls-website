import type { Payload, PayloadRequest } from 'payload'

import { seedUpdate } from './seedWrite'

type Ctx = { payload: Payload; req: PayloadRequest }

/** The shape specialists shipped with, and the one they should have had. */
const SUPERSEDED = 'tall'
const WANTED = 'square'

/**
 * Moves specialists from the superseded `tall` photo shape to `square`.
 *
 * ── Why ──
 * `profilePhotoShape` was added for Team, where the photography is genuinely
 * portrait, and applied to Specialists with the same `tall` default. Specialist
 * headshots are square cut-outs on a transparent background — the seeded set is
 * uniformly 230×230 — so a 2:3 box cropped the sides off every one of them, and
 * (because the profile's `<Media>` did not fill its box) left a ~115px band of
 * empty gradient underneath. The collection default is now `square`; that only
 * governs rows created afterwards, so the existing ones need moving.
 *
 * ── Why this cannot clobber an editor, and the one case where it could ──
 * `defaultValue` makes "the editor chose tall" and "nobody has touched this"
 * indistinguishable per row — invariant 24. So the decision is taken over the
 * WHOLE SET instead: this runs only when every specialist still holds the
 * superseded value, which is the untouched, machine-backfilled state. Measured
 * before writing it: 26 of 26 rows were `tall`, with no other value present.
 *
 * The moment anyone sets a single specialist to Portrait or Square, the set is
 * no longer uniform and this stops running for good — including after a reseed.
 * It therefore also self-disables once it has succeeded, since the rows are then
 * all `square`.
 *
 * The one case it would still act on: an editor deliberately setting EVERY
 * specialist back to Tall and then reseeding. Recorded rather than guarded,
 * because the alternative is a marker field whose only purpose is to remember
 * that this ran once.
 */
export const repairSpecialistPortraitShape = async ({ payload, req }: Ctx): Promise<void> => {
  const res = await payload.find({
    collection: 'specialists',
    depth: 0,
    limit: 1000,
    pagination: false,
    overrideAccess: true,
    req,
  })

  if (res.docs.length === 0) return

  const shapes = new Set(
    res.docs.map((d) => (d as { profilePhotoShape?: string | null }).profilePhotoShape ?? SUPERSEDED),
  )

  // Uniformly superseded, or leave the whole set alone.
  if (shapes.size !== 1 || !shapes.has(SUPERSEDED)) {
    const why =
      shapes.size === 1 && shapes.has(WANTED)
        ? 'already done'
        : 'a shape has been chosen in the admin'
    payload.logger.info(
      `— Specialist photo shape: left alone (${[...shapes].join(', ')}) — ${why}`,
    )
    return
  }

  let changed = 0
  for (const doc of res.docs) {
    await seedUpdate(payload, {
      collection: 'specialists',
      id: doc.id,
      depth: 0,
      req,
      context: { disableRevalidate: true },
      data: { profilePhotoShape: WANTED },
    })
    changed++
  }

  payload.logger.info(`— Moved ${changed} specialists from ${SUPERSEDED} to ${WANTED} photo shape`)
}
