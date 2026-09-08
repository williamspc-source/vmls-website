/**
 * `eventTiming` decides two things an editor can see and complain about: the
 * Upcoming/Past badge, and whether the button says "Register Your Interest" or
 * "Contact Us". They used to be one boolean compared against the event's start
 * time, so an all-day seminar read "Past Event / Contact Us" from 9am and there
 * was no way to keep registrations open for the last hour of it.
 *
 * `now` is injected rather than mocked, which is the whole reason the helper
 * takes it as a parameter.
 */
import { describe, expect, it } from 'vitest'

import { eventTiming, isEventPast, startOfDay } from '@/utilities/eventTiming'

// A fixed reference point, so nothing here depends on when the suite runs.
const MAR_5_0900 = new Date('2026-03-05T09:00:00').getTime()
const MAR_5_1200 = new Date('2026-03-05T12:00:00').getTime()
const MAR_5_1700 = new Date('2026-03-05T17:00:00').getTime()
const MAR_6_1000 = new Date('2026-03-06T10:00:00').getTime()
const MAR_4_1000 = new Date('2026-03-04T10:00:00').getTime()

const iso = (ms: number) => new Date(ms).toISOString()

describe('eventTiming', () => {
  describe('isPast — drives the badge, the recap heading and the listing split', () => {
    it('is upcoming the day before', () => {
      expect(eventTiming({ date: iso(MAR_5_0900) }, MAR_4_1000).isPast).toBe(false)
    })

    it('is STILL upcoming while the event is running', () => {
      // The bug this helper exists for: comparing against the start time made a
      // 9am–5pm seminar "Past" at 9:01am, on its own page, while it was running.
      expect(eventTiming({ date: iso(MAR_5_0900) }, MAR_5_1200).isPast).toBe(false)
    })

    it('is still upcoming late on the day itself', () => {
      expect(eventTiming({ date: iso(MAR_5_0900) }, MAR_5_1700).isPast).toBe(false)
    })

    it('is past the next day', () => {
      expect(eventTiming({ date: iso(MAR_5_0900) }, MAR_6_1000).isPast).toBe(true)
    })
  })

  describe('registrationOpen — drives the CTA, and only the CTA', () => {
    it('falls back to the event start when registrationClosesAt is empty', () => {
      // Preserves the behaviour that existed before the field was added, so
      // every already-created event is unaffected until an editor sets it.
      const event = { date: iso(MAR_5_0900) }
      expect(eventTiming(event, MAR_4_1000).registrationOpen).toBe(true)
      expect(eventTiming(event, MAR_5_1200).registrationOpen).toBe(false)
    })

    it('can stay open after the event has started', () => {
      // "leave it open for an hour after the start"
      const event = { date: iso(MAR_5_0900), registrationClosesAt: iso(MAR_5_1200) }
      expect(eventTiming(event, MAR_5_0900 + 60_000).registrationOpen).toBe(true)
      expect(eventTiming(event, MAR_5_1700).registrationOpen).toBe(false)
    })

    it('can close days before the event', () => {
      const event = { date: iso(MAR_5_0900), registrationClosesAt: iso(MAR_4_1000) }
      expect(eventTiming(event, MAR_4_1000 - 60_000).registrationOpen).toBe(true)
      // Closed, yet the event is still very much upcoming.
      const during = eventTiming(event, MAR_5_0900)
      expect(during.registrationOpen).toBe(false)
      expect(during.isPast).toBe(false)
    })

    it('is independent of isPast — a finished event can still take enquiries', () => {
      const event = { date: iso(MAR_5_0900), registrationClosesAt: iso(MAR_6_1000 + 3_600_000) }
      const after = eventTiming(event, MAR_6_1000)
      expect(after.isPast).toBe(true)
      expect(after.registrationOpen).toBe(true)
    })
  })

  describe('missing or unusable dates', () => {
    it('treats a missing date as upcoming and open, never as past', () => {
      // A dateless event is a half-finished draft. Calling it "Past Event" would
      // be a confident wrong answer; the listing has always bucketed it upcoming.
      for (const date of [undefined, null, '']) {
        expect(eventTiming({ date }, MAR_5_1200)).toEqual({
          isPast: false,
          registrationOpen: true,
        })
      }
    })

    it('treats an unparseable date the same way', () => {
      expect(eventTiming({ date: 'not a date' }, MAR_5_1200)).toEqual({
        isPast: false,
        registrationOpen: true,
      })
    })

    it('ignores an unparseable registrationClosesAt and falls back to the start', () => {
      const event = { date: iso(MAR_5_0900), registrationClosesAt: 'nonsense' }
      expect(eventTiming(event, MAR_4_1000).registrationOpen).toBe(true)
      expect(eventTiming(event, MAR_5_1200).registrationOpen).toBe(false)
    })
  })

  describe('isEventPast — the narrow helper the events listing uses', () => {
    it('agrees with eventTiming().isPast for the same input', () => {
      // The listing calls isEventPast and the detail page calls eventTiming. If
      // these two ever diverge, the same event reads Upcoming in one place and
      // Past in the other — which is the bug this file exists to prevent.
      const event = { date: iso(MAR_5_0900), registrationClosesAt: iso(MAR_4_1000) }
      for (const now of [MAR_4_1000, MAR_5_0900, MAR_5_1200, MAR_5_1700, MAR_6_1000]) {
        expect(isEventPast(event, now)).toBe(eventTiming(event, now).isPast)
      }
    })

    it('needs only a date, so a partial event cannot get a wrong answer', () => {
      // It takes EventDateInput, not EventTimingInput: a caller holding an
      // EventItem (which has no registrationClosesAt) can ask this and nothing
      // else. Asking eventTiming() there compiled fine and would have handed back
      // a registrationOpen derived from a field that was never passed.
      expect(isEventPast({ date: iso(MAR_5_0900) }, MAR_6_1000)).toBe(true)
      expect(isEventPast({ date: iso(MAR_5_0900) }, MAR_5_1700)).toBe(false)
    })
  })

  describe('startOfDay', () => {
    it('collapses any time on a day to local midnight', () => {
      expect(startOfDay(MAR_5_1700)).toBe(startOfDay(MAR_5_0900))
      expect(startOfDay(MAR_6_1000)).not.toBe(startOfDay(MAR_5_0900))
    })
  })
})
