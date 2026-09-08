import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import { postPath, IN_THE_LOOP_PATH } from '@/utilities/routes'

/**
 * Legacy article URLs.
 *
 * Articles live at /in-the-loop/<stream>/<slug> (see `postPath` in
 * src/utilities/routes.ts). This route used to render a second, parallel copy of
 * the article — the Payload template's version — so the same content was
 * reachable at two URLs, and the listing pages above it were still titled
 * "Payload Website Template Posts" with cards linking to /undefined/<slug>.
 *
 * It now only redirects, so old inbound links and bookmarks keep working without
 * serving duplicate content.
 *
 * ── Two things this route must not do ───────────────────────────────────────
 *
 * 1. **Hide drafts from an authenticated editor.** Payload's Local API defaults
 *    to `overrideAccess: true`; hardcoding `false` here made every request
 *    anonymous, so an unpublished post 404'd — including for the editor who had
 *    just clicked Preview. `draftMode()` decides both flags together, which is
 *    the same pairing the article route itself uses. (Preview no longer routes
 *    through here at all — see `postPreviewPath` in src/collections/Posts — but
 *    an editor following an older preview link still lands here.)
 *
 * 2. **Swallow the Redirects collection.** A bare `notFound()` on a miss meant an
 *    editor-authored redirect rule for a legacy `/posts/...` URL was never
 *    consulted. `PayloadRedirects` checks it and 404s only if nothing matches.
 */
export default async function LegacyPostRedirect({
  params: paramsPromise,
}: {
  params: Promise<{ slug?: string }>
}) {
  const { slug = '' } = await paramsPromise
  const decoded = decodeURIComponent(slug)
  if (!decoded) return <PayloadRedirects url="/posts" />

  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 1,
    pagination: false,
    draft,
    overrideAccess: draft,
    where: { slug: { equals: decoded } },
  })

  const post = docs[0]
  if (!post) return <PayloadRedirects url={`/posts/${decoded}`} />

  // 307, not 308. The destination is derived from the post's stream, so it
  // changes whenever an editor reassigns the article — and a 308 is cached by
  // browsers indefinitely, which would strand every visitor who had followed the
  // old one. A post with no stream has no canonical article URL, so send those to
  // the hub rather than to a path that would 404.
  redirect(postPath(post) ?? IN_THE_LOOP_PATH)
}
