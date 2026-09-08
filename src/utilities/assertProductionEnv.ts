/**
 * Environment that production cannot silently do without.
 *
 * Each of these degrades invisibly rather than loudly when missing: no SMTP_HOST
 * means every form notification and password reset "succeeds" into a console
 * mock; no NEXT_PUBLIC_SERVER_URL means absolute links and OG tags point at
 * localhost; no PREVIEW_SECRET means draft preview links cannot be validated.
 *
 * ── Why this gates on "serving", not on NODE_ENV ────────────────────────────
 * Three different things set NODE_ENV=production and only one is a deploy:
 *
 *   1. `next build` — Next forces it and imports the Payload config while
 *      collecting page data. Building an artifact does not need mail
 *      credentials. Skipped via NEXT_PHASE, which Next sets itself
 *      (`next/dist/esm/build/index.js`) and uses as the same escape hatch
 *      internally.
 *   2. `pnpm start` — genuinely serving. `pnpm dev:prod` is this, which is why
 *      LOCAL_PROD_REPRO exists: a local-only, deliberately loud opt-out so a
 *      production build can be exercised on a dev machine. It is never set on
 *      the server, so a real deploy still refuses to boot.
 *   3. The server — the case this was written for.
 *
 * ── Why it is called from instrumentation.ts, not only from the config ──────
 * Importing this from `payload.config.ts` alone does NOT refuse the boot, which
 * is what an earlier version of this comment claimed. Measured: `next start`
 * with SMTP_HOST unset starts cleanly and serves the prerendered homepage with
 * a 200; only routes that actually import the Payload config (admin, /api/*,
 * dynamic pages) throw, and they throw a 500 per request. A server that answers
 * 200 on `/` while the admin is dead is precisely the "appears to work" failure
 * this codebase refuses to ship. `src/instrumentation.ts` calls this in
 * `register()`, which Next runs once before serving the first request, so the
 * process exits instead.
 */
export const REQUIRED_PRODUCTION_ENV = [
  'SMTP_HOST',
  'NEXT_PUBLIC_SERVER_URL',
  'PREVIEW_SECRET',
] as const

/**
 * A deliberate, temporary waiver for `SMTP_HOST` **only**.
 *
 * Set on a box that is knowingly running without mail — a staging install, or one
 * standing up before mail credentials exist. It is NOT `LOCAL_PROD_REPRO`: that
 * one is for `pnpm dev:prod` on a laptop, its banner says "not a real
 * deployment", and it waives all three variables at once. Waiving
 * `NEXT_PUBLIC_SERVER_URL` or `PREVIEW_SECRET` on a real server is never
 * intended, so this flag cannot do it.
 *
 * Named for what it permits rather than for a state: `EMAIL_DISABLED` would read
 * as "mail is off by design", when the intent is always to turn it on later.
 *
 * What it costs, while set: enquiries are still stored and visible under Forms →
 * Form Submissions, but **nobody is emailed that one arrived**, and **admin
 * password resets silently fail** — an admin locked out cannot recover without a
 * developer. Both are surfaced on the admin dashboard by `BeforeDashboard`, which
 * keys on `SMTP_HOST` rather than on this flag, so the warning is equally true on
 * a machine that simply has no mail configured.
 */
export const missingProductionEnv = (): string[] => {
  if (process.env.NODE_ENV !== 'production') return []
  if (process.env.NEXT_PHASE === 'phase-production-build') return []
  const waived = process.env.ALLOW_MISSING_SMTP ? ['SMTP_HOST'] : []
  return REQUIRED_PRODUCTION_ENV.filter((key) => !process.env[key] && !waived.includes(key))
}

/** True when mail is deliberately waived AND genuinely absent — the state the
 *  boot banner describes. Both halves matter: the flag set on a box that *does*
 *  have SMTP configured is merely redundant, not worth shouting about. */
export const smtpDeliberatelyMissing = (): boolean =>
  Boolean(process.env.ALLOW_MISSING_SMTP) && !process.env.SMTP_HOST

const banner = (missing: string[]): string => {
  const rule = '='.repeat(78)
  return (
    `\n${rule}\n` +
    `  LOCAL_PROD_REPRO is set — booting WITHOUT: ${missing.join(', ')}\n` +
    `\n` +
    `  This is a local production-mode reproduction, not a real deployment.\n` +
    `  Emails will NOT be sent; each attempt is logged as [EMAIL NOT SENT].\n` +
    `  Never set LOCAL_PROD_REPRO on the server.\n` +
    `${rule}\n`
  )
}

export const productionEnvError = (missing: string[]): string =>
  `Missing required production environment variable(s): ${missing.join(', ')}. ` +
  `See .env.example. Without SMTP_HOST in particular, form notification emails and ` +
  `admin password resets report success and send nothing.`

/**
 * Throws when a required variable is missing, unless LOCAL_PROD_REPRO is set —
 * in which case it prints the banner and returns.
 *
 * The "printed once" flag lives on `globalThis`, not in module scope: Next bundles
 * `instrumentation.ts` and `payload.config.ts` into separate chunks, so each gets
 * its own instance of this module and a module-level boolean prints the banner
 * twice.
 */
const BANNER_FLAG = Symbol.for('verify.prodEnvBannerPrinted')
const SMTP_BANNER_FLAG = Symbol.for('verify.smtpWaivedBannerPrinted')

/**
 * Announces, on every boot, that the server is running without mail.
 *
 * Separate flag from the LOCAL_PROD_REPRO banner because both can be true at
 * once and they say different things — and separate symbol on `globalThis` for
 * the reason given above: Next bundles `instrumentation.ts` and
 * `payload.config.ts` into different chunks, so a module-level boolean prints
 * twice.
 */
export const warnSmtpWaived = (): void => {
  if (!smtpDeliberatelyMissing()) return
  const g = globalThis as unknown as Record<symbol, boolean>
  if (g[SMTP_BANNER_FLAG]) return
  g[SMTP_BANNER_FLAG] = true
  const rule = '='.repeat(78)
  console.error(
    `\n${rule}\n` +
      `  RUNNING WITHOUT EMAIL — ALLOW_MISSING_SMTP is set\n` +
      `\n` +
      `  Enquiries ARE still captured: Admin -> Forms -> Form Submissions.\n` +
      `  Nobody is emailed when one arrives, so that list must be checked by hand.\n` +
      `  Admin password resets will NOT work while this is set.\n` +
      `\n` +
      `  To turn mail on: fill the SMTP_* block in .env and REMOVE this variable.\n` +
      `${rule}\n`,
  )
}

export const assertProductionEnv = (): void => {
  const missing = missingProductionEnv()
  if (!missing.length) return

  if (process.env.LOCAL_PROD_REPRO) {
    const g = globalThis as unknown as Record<symbol, boolean>
    if (!g[BANNER_FLAG]) {
      g[BANNER_FLAG] = true
      console.error(banner(missing))
    }
    return
  }

  throw new Error(productionEnvError(missing))
}
