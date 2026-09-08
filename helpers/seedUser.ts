import { getPayload } from 'payload'
import config from '../../src/payload.config.js'

export const testUser = {
  email: 'dev@payloadcms.com',
  password: 'test',
}

/**
 * Seeds a test user for e2e admin tests.
 */
export async function seedTestUser(): Promise<void> {
  const payload = await getPayload({ config })

  // Delete existing test user if any
  await payload.delete({
    collection: 'users',
    where: {
      email: {
        equals: testUser.email,
      },
    },
  })

  // Create fresh test user
  await payload.create({
    collection: 'users',
    data: testUser,
  })
}

/**
 * Cleans up test user after tests
 */
export async function cleanupTestUser(): Promise<void> {
  const payload = await getPayload({ config })

  await payload.delete({
    collection: 'users',
    where: {
      email: {
        equals: testUser.email,
      },
    },
  })
}

/**
 * Deletes a page the admin spec created by opening the Create New form.
 *
 * Pages use autosave drafts (100ms, for live preview), so Payload creates the
 * document the moment `/admin/collections/pages/create` is opened — before
 * anything is typed. The spec's own assertion depends on that: it expects a
 * document id in the URL. Without this cleanup the suite left one empty draft
 * behind on every single run; 72 had accumulated in the local database, which is
 * what made the Pages list unusable to look at.
 *
 * Deletes by explicit id, NOT by "any page with no title" — on a machine where
 * someone has a genuinely half-started page open, the broad predicate would
 * delete their work.
 *
 * Deleting through Payload rather than SQL is also deliberate: `_pages_v`'s
 * foreign key is ON DELETE SET NULL, so a raw delete orphans the version rows
 * instead of removing them.
 */
export async function cleanupPage(id: string | number): Promise<void> {
  if (!id) return
  const payload = await getPayload({ config })

  await payload.delete({ collection: 'pages', id })
}

/**
 * Creates a published page carrying one block, for a spec that needs to see that
 * block rendered on a real route.
 *
 * `_status: 'published'` is not optional. Pages are draft-enabled, and the
 * front end queries them with `overrideAccess: false`, so a page created
 * without it is invisible to the very request the test is about to make — the
 * spec then fails with a 404 that looks like a routing bug.
 *
 * Pair every call with `cleanupPage` in `afterAll`; see its note on why the
 * delete goes through Payload rather than SQL.
 */
export async function createPageWithBlock(
  slug: string,
  block: Record<string, unknown>,
): Promise<number | string> {
  const payload = await getPayload({ config })

  // Clear a leftover from an interrupted run, or the slug lookup finds two.
  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 10,
    depth: 0,
  })
  for (const doc of existing.docs) await payload.delete({ collection: 'pages', id: doc.id })

  const created = await payload.create({
    collection: 'pages',
    data: {
      title: `Test — ${slug}`,
      slug,
      _status: 'published',
      layout: [block],
    } as never,
    context: { disableRevalidate: true },
  })
  return created.id
}
