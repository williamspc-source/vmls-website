import { getPayload } from 'payload'
import config from '../../src/payload.config.js'

/**
 * The user `uploadedIcons.e2e.spec.ts` authenticates as, created ONCE before any
 * worker starts.
 *
 * ## Why not `seedTestUser`, and why not a `beforeAll`
 *
 * Two problems, both measured rather than assumed:
 *
 *  · `tests/helpers/seedUser.ts` **deletes and recreates** `dev@payloadcms.com`.
 *    Playwright runs spec files in parallel locally (`workers: undefined`), so a
 *    second spec calling it deletes the account `admin.e2e.spec.ts` is logged in
 *    as. Both specs passed alone and both failed together.
 *  · Booting Payload inside a spec's `beforeAll` starts a SECOND schema pull
 *    against the database the dev server is already using. With two spec files
 *    doing it at once the run filled with "Pulling schema from database…" and one
 *    or the other timed out — a different file each run, which is exactly the
 *    shape of the flake README §10.1 already records for `admin.e2e.spec.ts`.
 *
 * `globalSetup` runs once, in the main process, before any worker exists. So
 * there is one boot instead of one per file, and nothing to race.
 *
 * `admin.e2e.spec.ts` is deliberately left alone: it still seeds its own user in
 * `beforeAll`, so this change cannot alter how that spec behaves.
 */
export const iconTestUser = { email: 'icons-e2e@payloadcms.com', password: 'test' }

export default async function globalSetup(): Promise<void> {
  const payload = await getPayload({ config })

  // Idempotent rather than delete-then-create: a run that was interrupted must
  // not leave the next one unable to log in.
  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: iconTestUser.email } },
    limit: 1,
  })

  if (existing.docs.length === 0) {
    await payload.create({ collection: 'users', data: iconTestUser })
  } else {
    await payload.update({
      collection: 'users',
      id: existing.docs[0].id,
      data: { password: iconTestUser.password },
    })
  }
}
