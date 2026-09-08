import { seedCreate, seedUpdate } from './seedWrite'
import type { Payload, PayloadRequest } from 'payload'

/* =====================================================================
   Demo data for the Specialist Availability feature (non-destructive).

   - Flags a handful of specialists to advertise (some highlighted in the
     carousel, one "call to book" with no sessions).
   - Creates a few sample availability sessions across the next couple of
     weeks so the admin area isn't empty.

   Idempotent: session creation is skipped if any sessions already exist.
   ===================================================================== */

type Mode = 'in-person' | 'telehealth' | 'either'

// End of the current month at 23:59:59 — mirrors the collection default.
const endOfThisMonth = (): string => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()
}

// A date `days` from now, at local midday (avoids timezone day-rollover).
const inDays = (days: number): string => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(12, 0, 0, 0)
  return d.toISOString()
}

// Specialists to advertise. `highlight` features them in the carousel.
const ADVERTISED: { slug: string; highlight: boolean }[] = [
  { slug: 'dr-james-reidy', highlight: true },
  { slug: 'dr-ashwani-garg', highlight: true },
  { slug: 'dr-lucas-murphy', highlight: true },
  { slug: 'dr-simon-perkins', highlight: true },
  { slug: 'adjunct-professor-anna-lenardon', highlight: false },
  // Advertised but no sessions → renders the "Call to book" note.
  { slug: 'dr-jason-beer', highlight: false },
]

// Sample sessions, keyed by specialist slug. dr-jason-beer is intentionally absent.
const SESSIONS: Record<string, { offset: number; start: string; end: string; mode: Mode }[]> = {
  'dr-james-reidy': [
    { offset: 3, start: '08:30', end: '09:30', mode: 'in-person' },
    { offset: 3, start: '11:30', end: '12:30', mode: 'either' },
    { offset: 5, start: '10:00', end: '11:00', mode: 'in-person' },
    { offset: 7, start: '09:15', end: '10:15', mode: 'telehealth' },
  ],
  'dr-ashwani-garg': [
    { offset: 4, start: '08:30', end: '10:00', mode: 'either' },
    { offset: 4, start: '11:30', end: '13:00', mode: 'either' },
    { offset: 6, start: '14:30', end: '16:00', mode: 'in-person' },
  ],
  'dr-lucas-murphy': [
    { offset: 8, start: '09:00', end: '10:30', mode: 'telehealth' },
    { offset: 10, start: '13:00', end: '14:30', mode: 'either' },
  ],
  'dr-simon-perkins': [
    { offset: 5, start: '08:00', end: '09:00', mode: 'in-person' },
    { offset: 12, start: '10:30', end: '11:30', mode: 'either' },
  ],
  'adjunct-professor-anna-lenardon': [
    { offset: 9, start: '09:30', end: '11:00', mode: 'telehealth' },
  ],
}

export const seedAvailability = async ({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  // Resolve specialist ids by slug.
  const slugs = ADVERTISED.map((a) => a.slug)
  const found = await payload.find({
    collection: 'specialists',
    where: { slug: { in: slugs } },
    limit: 100,
    depth: 0,
    req,
  })
  const idBySlug = new Map<string, number | string>()
  for (const doc of found.docs) {
    if (doc.slug) idBySlug.set(doc.slug, doc.id)
  }

  // Flag advertised specialists.
  for (const { slug, highlight } of ADVERTISED) {
    const id = idBySlug.get(slug)
    if (!id) {
      payload.logger.info(`— Availability: specialist not found, skipping: ${slug}`)
      continue
    }
    await seedUpdate(payload, {
      collection: 'specialists',
      id,
      depth: 0,
      req,
      context: { disableRevalidate: true },
      data: {
        advertise: true,
        availabilityHighlight: highlight,
        availabilityNote: 'Call to book',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    })
  }
  payload.logger.info(`— Flagged ${idBySlug.size} specialists to advertise`)

  // Create sessions only if none exist yet (idempotent).
  const existing = await payload.find({
    collection: 'availability-sessions',
    limit: 1,
    depth: 0,
    req,
  })
  if (existing.totalDocs > 0) {
    payload.logger.info('— Availability sessions already exist, skipping session seed')
    return
  }

  const expiresAt = endOfThisMonth()
  let created = 0
  for (const [slug, slots] of Object.entries(SESSIONS)) {
    const specialist = idBySlug.get(slug)
    if (!specialist) continue
    for (const slot of slots) {
      await seedCreate(payload, {
        collection: 'availability-sessions',
        depth: 0,
        req,
        context: { disableRevalidate: true },
        data: {
          specialist,
          date: inDays(slot.offset),
          startTime: slot.start,
          endTime: slot.end,
          mode: slot.mode,
          status: 'available',
          expiresAt,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      })
      created++
    }
  }
  payload.logger.info(`— Created ${created} demo availability sessions`)
}
