import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, afterAll, expect } from 'vitest'

/**
 * AvailabilitySessions → `notes` is a staff-only note, and this collection is
 * `access.read: anyone`. Admin placement and the label "Internal note" do
 * nothing to enforce that: what keeps the value off the public API is the
 * field-level `access.read` in the collection config.
 *
 * Measured before the field was locked: an anonymous
 * `curl /api/availability-sessions` returned the `notes` key, and returned real
 * values for this collection's other optional fields — so a note typed by staff
 * was genuinely fetchable by anyone.
 *
 * Proven red by: deleting the `access` block from the `notes` field in
 * src/collections/AvailabilitySessions/index.ts → the first assertion fails
 * ("public read must not include notes").
 *
 * The second assertion is the positive control and is the reason this test can
 * be trusted: without it, the file would pass just as happily against a field
 * that was empty, misspelled or deleted outright.
 */
let payload: Payload
let sessionId: number | string | undefined

const NOTE = 'INTERNAL — not for visitors'

describe('AvailabilitySessions notes stay internal', () => {
  // 30s to match tests/int/api.int.spec.ts: booting Payload is slow enough that
  // the 10s default reports a *skipped* test rather than a failure.
  beforeAll(async () => {
    payload = await getPayload({ config: await config })

    const specialist = await payload.find({ collection: 'specialists', limit: 1, depth: 0 })
    const specialistId = specialist.docs[0]?.id
    expect(specialistId, 'need a specialist to attach a session to').toBeDefined()

    const created = await payload.create({
      collection: 'availability-sessions',
      depth: 0,
      context: { disableRevalidate: true },
      data: {
        specialist: specialistId!,
        date: new Date().toISOString(),
        startTime: '08:30',
        endTime: '09:30',
        mode: 'telehealth',
        notes: NOTE,
        status: 'available',
        expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
      },
    })
    sessionId = created.id
  }, 30_000)

  afterAll(async () => {
    // Through Payload, never SQL — see invariant 10.
    if (sessionId !== undefined) {
      await payload.delete({
        collection: 'availability-sessions',
        id: sessionId,
        context: { disableRevalidate: true },
      })
    }
  })

  it('is absent from an unauthenticated read', async () => {
    const res = await payload.find({
      collection: 'availability-sessions',
      where: { id: { equals: sessionId } },
      overrideAccess: false,
      depth: 0,
    })

    expect(res.docs).toHaveLength(1)
    expect(
      res.docs[0],
      'public read must not include notes — the field-level access.read has gone',
    ).not.toHaveProperty('notes')
  })

  it('is still stored and readable by staff', async () => {
    // Positive control. Without this, the test above passes against a field
    // that simply is not there.
    const res = await payload.find({
      collection: 'availability-sessions',
      where: { id: { equals: sessionId } },
      overrideAccess: true,
      depth: 0,
    })

    expect(res.docs[0]?.notes).toBe(NOTE)
  })
})
