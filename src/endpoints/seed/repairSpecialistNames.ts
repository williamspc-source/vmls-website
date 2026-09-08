import type { Payload, PayloadRequest } from 'payload'

import { splitPersonName } from '@/utilities/personName'
import { seedUpdate } from './seedWrite'

type Ctx = { payload: Payload; req: PayloadRequest }

/**
 * Backfills `firstName` / `lastName` on specialists that have neither.
 *
 * ── Why a repair, and not just the hook ──
 * `deriveNames` fills these on save, which covers every specialist created from
 * now on and nothing that already exists — a hook does not fire on rows nobody
 * re-saves. Measured before this ran: **0 of 26** specialists had a `firstName`,
 * which is why the directory's "Given name" sort ordered an all-NULL column and
 * appeared to do nothing at all.
 *
 * It cannot be a seed-data edit either: `createIfNew` early-returns on a
 * specialist that already exists, so a fixture change would only ever reach a
 * virgin database and every existing install — the box included — would keep the
 * broken sort. That is the failure recorded against link repairs in CLAUDE.md.
 *
 * ── Writes only into an absence ──
 * A field that already holds anything is left alone, so an editor's correction
 * survives a reseed and a second run is a no-op. The 26 seeded rows already carry
 * a hand-listed `lastName`; this fills their `firstName` and leaves those be —
 * verified by the parser reproducing all 26 stored surnames exactly, "Mar Fan"
 * included, before this was written.
 */
export const repairSpecialistNames = async ({ payload, req }: Ctx): Promise<void> => {
  const res = await payload.find({
    collection: 'specialists',
    depth: 0,
    limit: 1000,
    pagination: false,
    overrideAccess: true,
    req,
  })

  let changed = 0
  for (const doc of res.docs as { id: number | string; title?: string | null; firstName?: string | null; lastName?: string | null }[]) {
    const derived = splitPersonName(doc.title)
    const blank = (v: unknown) => typeof v !== 'string' || v.trim() === ''

    const data: Record<string, string> = {}
    if (blank(doc.firstName) && derived.firstName) data.firstName = derived.firstName
    if (blank(doc.lastName) && derived.lastName) data.lastName = derived.lastName
    if (!Object.keys(data).length) continue

    await seedUpdate(payload, { collection: 'specialists', id: doc.id, data, req, depth: 0 })
    changed++
  }

  payload.logger.info(`— Repaired specialist sort names (${changed} of ${res.docs.length} updated)`)
}
