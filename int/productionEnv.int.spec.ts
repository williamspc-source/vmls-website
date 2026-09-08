import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
  REQUIRED_PRODUCTION_ENV,
  missingProductionEnv,
  smtpDeliberatelyMissing,
} from '@/utilities/assertProductionEnv'

/**
 * The boot gate that decides whether the server is allowed to start.
 *
 * It had no test at all until `ALLOW_MISSING_SMTP` gave it a branch — and this is
 * the one piece of code whose failure mode is a server that runs while quietly
 * discarding every enquiry notification and password reset. `instrumentation.ts`
 * calls `process.exit(1)` on its answer, so a wrong answer here is either a
 * deploy that will not start or, far worse, one that starts when it should not.
 *
 * ── What the flag must NOT become ──
 * The dangerous version of this feature is a blanket waiver. Two of the three
 * variables have nothing to do with mail: without `NEXT_PUBLIC_SERVER_URL` every
 * absolute link and og:url points at localhost, and without `PREVIEW_SECRET`
 * draft preview cannot be validated. So the assertions below check both
 * directions — that the flag removes `SMTP_HOST`, and that it removes *nothing
 * else* — because a test of only the first cannot tell a targeted opt-out from a
 * waiver of everything.
 *
 * Proven red by: making the waiver `REQUIRED_PRODUCTION_ENV` instead of
 * `['SMTP_HOST']` (the blanket-waiver mistake), and by deleting the waiver
 * entirely.
 */

const KEYS = [...REQUIRED_PRODUCTION_ENV, 'ALLOW_MISSING_SMTP', 'NODE_ENV', 'NEXT_PHASE'] as const

/**
 * Writes an environment variable through a widened type.
 *
 * `NODE_ENV` is declared read-only by Next's ambient types, so a direct
 * `setEnv('NODE_ENV', 'production')` fails `tsc` while working perfectly at
 * runtime — the suite passed and the build did not. The cast is confined here
 * rather than sprinkled through the cases, so the widening is visible in one
 * place and the tests read as plain assignments.
 */
const setEnv = (key: string, value: string | undefined): void => {
  const env = process.env as Record<string, string | undefined>
  if (value === undefined) delete env[key]
  else env[key] = value
}

describe('the production environment gate', () => {
  let saved: Record<string, string | undefined>

  beforeEach(() => {
    // Snapshot and clear, so each case starts from a known state. Vitest shares a
    // process across the files in a worker, so leaking these would change the
    // answer in an unrelated spec rather than failing here.
    saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]))
    for (const k of KEYS) setEnv(k, undefined)
  })

  afterEach(() => {
    for (const [k, v] of Object.entries(saved)) setEnv(k, v)
  })

  it('reports nothing outside production', () => {
    setEnv('NODE_ENV', 'development')
    expect(missingProductionEnv()).toEqual([])
  })

  it('reports every unset variable when serving in production', () => {
    setEnv('NODE_ENV', 'production')
    expect(missingProductionEnv()).toEqual([...REQUIRED_PRODUCTION_ENV])
  })

  it('waives nothing during `next build`, which also sets NODE_ENV=production', () => {
    setEnv('NODE_ENV', 'production')
    setEnv('NEXT_PHASE', 'phase-production-build')
    // Building an artifact needs no deploy secrets; requiring them here broke
    // `pnpm build` once already.
    expect(missingProductionEnv()).toEqual([])
  })

  it('ALLOW_MISSING_SMTP removes SMTP_HOST', () => {
    setEnv('NODE_ENV', 'production')
    setEnv('ALLOW_MISSING_SMTP', '1')
    expect(missingProductionEnv()).not.toContain('SMTP_HOST')
  })

  it('ALLOW_MISSING_SMTP removes NOTHING ELSE — it is not a blanket waiver', () => {
    setEnv('NODE_ENV', 'production')
    setEnv('ALLOW_MISSING_SMTP', '1')
    // The load-bearing assertion. Both of these are unrelated to mail and must
    // still stop a misconfigured deploy from booting.
    expect(missingProductionEnv()).toEqual(['NEXT_PUBLIC_SERVER_URL', 'PREVIEW_SECRET'])
  })

  it('lets a box boot when the other two are set and only mail is waived', () => {
    setEnv('NODE_ENV', 'production')
    setEnv('ALLOW_MISSING_SMTP', '1')
    setEnv('NEXT_PUBLIC_SERVER_URL', 'https://example.test')
    setEnv('PREVIEW_SECRET', 'secret')
    // This is the state the staging box runs in.
    expect(missingProductionEnv()).toEqual([])
  })

  it('still refuses to boot without the flag, even with mail the only thing missing', () => {
    setEnv('NODE_ENV', 'production')
    setEnv('NEXT_PUBLIC_SERVER_URL', 'https://example.test')
    setEnv('PREVIEW_SECRET', 'secret')
    expect(missingProductionEnv()).toEqual(['SMTP_HOST'])
  })

  describe('smtpDeliberatelyMissing — what the boot banner announces', () => {
    it('is true only when the flag is set AND mail really is absent', () => {
      setEnv('ALLOW_MISSING_SMTP', '1')
      expect(smtpDeliberatelyMissing()).toBe(true)
    })

    it('is false when the flag is set but SMTP is configured after all', () => {
      setEnv('ALLOW_MISSING_SMTP', '1')
      setEnv('SMTP_HOST', 'smtp.example.test')
      // Redundant rather than dangerous: mail works, so there is nothing to warn
      // about, and a banner here would train people to ignore it.
      expect(smtpDeliberatelyMissing()).toBe(false)
    })

    it('is false when mail is absent but nobody waived it', () => {
      expect(smtpDeliberatelyMissing()).toBe(false)
    })
  })
})
