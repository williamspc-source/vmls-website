import {
  assertProductionEnv,
  missingProductionEnv,
  productionEnvError,
  warnSmtpWaived,
} from '@/utilities/assertProductionEnv'

/**
 * Next runs `register()` once, before the first request is served.
 *
 * This is the only place a missing production variable can be caught *at boot*.
 * The same check also lives in `payload.config.ts`, but that module is imported
 * lazily — measured: `next start` with SMTP_HOST unset serves the prerendered
 * homepage with a 200 and only 500s on admin/API routes. A half-alive server is
 * worse than a dead one, because a deploy smoke-test that hits `/` passes.
 *
 * `register()` runs in both the `nodejs` and `edge` runtimes; the env check only
 * makes sense once, in Node.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  // Announced whether or not anything is missing: with the flag set, nothing IS
  // missing by definition, so a banner printed only on the failure path would
  // never appear on exactly the boxes it is meant for.
  warnSmtpWaived()

  const missing = missingProductionEnv()
  if (!missing.length) return

  if (process.env.LOCAL_PROD_REPRO) {
    // Prints the banner and returns.
    assertProductionEnv()
    return
  }

  // Throwing here does not reliably stop the process — Next logs instrumentation
  // errors and carries on serving. Exit explicitly so a misconfigured deploy is
  // unambiguously down rather than partially up.
  console.error(`\n${'='.repeat(78)}\n  REFUSING TO START\n\n  ${productionEnvError(missing)}\n${'='.repeat(78)}\n`)
  process.exit(1)
}
