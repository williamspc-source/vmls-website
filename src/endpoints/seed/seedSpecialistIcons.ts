import { seedUpdate } from './seedWrite'
import type { Payload, PayloadRequest } from 'payload'

import { ACCREDITATION_ICON, qualificationIcon } from '@/utilities/qualificationIcon'
import { SPECIALISTS } from './data/specialists'

type Ctx = { payload: Payload; req: PayloadRequest }

/**
 * Gives every specialist's qualification rows, and every accreditation doc, the
 * icon they should have had.
 *
 * Both fields already existed and neither was ever written: the seed dropped the
 * icon when mapping qualification strings (`seedDataLayer`), and the profile page
 * hardcoded `seal-check` for accreditations — so `Accreditations.icon` was an
 * editor control that did nothing. Every one of the 96 qualification rows
 * rendered the same `medal`.
 *
 * `createIfNew` means the fixture change alone reaches no existing install, so
 * this runs unconditionally.
 *
 * ── The predicate ──
 * Fill only where the icon is **unset**. Neither field declares a `defaultValue`,
 * so null here is a genuine absence rather than a backfilled default — the trap
 * that broke an earlier repair's predicate does not apply, which is exactly why
 * this one is safe. An editor who picks a different icon keeps it forever.
 */
export const repairSpecialistIcons = async ({ payload, req }: Ctx): Promise<void> => {
  let qualRows = 0
  let specialists = 0

  const found = await payload.find({
    collection: 'specialists',
    limit: 500,
    depth: 0,
    pagination: false,
    req,
  })

  for (const doc of found.docs as {
    id: number | string
    qualifications?: { qualification?: string | null; icon?: string | null }[] | null
  }[]) {
    const rows = doc.qualifications
    if (!Array.isArray(rows) || rows.length === 0) continue
    if (rows.every((r) => r?.icon)) continue

    const next = rows.map((r) =>
      r?.icon ? r : { ...r, icon: qualificationIcon(r?.qualification) },
    )
    qualRows += next.length - rows.filter((r) => r?.icon).length
    specialists += 1

    await seedUpdate(payload, {
      collection: 'specialists',
      id: doc.id,
      data: { qualifications: next } as never,
      req,
      context: { disableRevalidate: true },
    })
  }

  if (specialists) {
    payload.logger.info(
      `— Repaired specialist qualifications: ${qualRows} icon(s) across ${specialists} specialist(s)`,
    )
  }

  const accs = await payload.find({
    collection: 'accreditations',
    limit: 200,
    depth: 0,
    pagination: false,
    req,
  })
  let accCount = 0
  for (const doc of accs.docs as { id: number | string; icon?: string | null }[]) {
    if (doc.icon) continue
    accCount += 1
    await seedUpdate(payload, {
      collection: 'accreditations',
      id: doc.id,
      data: { icon: ACCREDITATION_ICON } as never,
      req,
      context: { disableRevalidate: true },
    })
  }
  if (accCount) {
    payload.logger.info(`— Repaired accreditations: set the icon on ${accCount} doc(s)`)
  }

  // Found by comparing all 26 profiles against the reference panel by panel: one
  // specialist's accreditations were missing from the fixture entirely. Four
  // others legitimately have none — the reference omits the panel for them too —
  // so this fills only where the fixture HAS accreditations and the document has
  // none. `createIfNew` means the fixture correction alone reaches no existing
  // install; an editor who cleared a list deliberately is the one case this
  // cannot distinguish, and it is a list the reference says should not be empty.
  const byTitle = new Map<string, number | string>()
  for (const doc of accs.docs as { id: number | string; title?: string | null }[]) {
    if (doc.title) byTitle.set(doc.title, doc.id)
  }
  let filled = 0
  for (const seed of SPECIALISTS) {
    if (!seed.accreditations.length) continue
    const doc = found.docs.find(
      (d) => (d as { slug?: string }).slug === seed.slug,
    ) as { id: number | string; accreditations?: unknown[] | null } | undefined
    if (!doc || (Array.isArray(doc.accreditations) && doc.accreditations.length > 0)) continue

    const ids = seed.accreditations.map((t) => byTitle.get(t)).filter((id) => id != null)
    if (!ids.length) continue
    filled += 1
    await seedUpdate(payload, {
      collection: 'specialists',
      id: doc.id,
      data: { accreditations: ids } as never,
      req,
      context: { disableRevalidate: true },
    })
    payload.logger.info(`— Repaired ${seed.slug}: restored ${ids.length} accreditation(s)`)
  }
  if (filled === 0) payload.logger.info('— Specialist accreditations: nothing to restore')
}
