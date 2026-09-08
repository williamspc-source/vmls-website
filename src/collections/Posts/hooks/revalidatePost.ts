import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, Payload } from 'payload'

import {
  safeRevalidatePath as revalidatePath,
  safeRevalidateTag as revalidateTag,
} from '@/utilities/safeRevalidate'

import type { Post } from '../../../payload-types'
import { postPath, streamPath, IN_THE_LOOP_PATH } from '@/utilities/routes'

const streamOf = (post?: Post | null): string | null => {
  const stream = post?.stream
  return stream && typeof stream === 'object' ? (stream.slug ?? null) : null
}

// Revalidate everywhere a post surfaces: its canonical article page, the stream
// listing it belongs to, the In-the-Loop hub, and the legacy /posts/<slug> stub
// (which 308s to the article). A bare-id stream yields no listing path, but the
// hub revalidation still covers it.
const revalidatePostRoutes = (post: Post | null | undefined, payload: Payload) => {
  if (!post?.slug) return

  const article = postPath(post)
  if (article) {
    payload.logger.info(`Revalidating post at path: ${article}`)
    revalidatePath(article)
  }

  const listing = streamPath(streamOf(post))
  if (listing) revalidatePath(listing)

  revalidatePath(IN_THE_LOOP_PATH)
  revalidatePath(`/posts/${post.slug}`)
  revalidateTag('posts-sitemap')

  // The Header/Footer link field can point at a Post (src/fields/link.ts), and an
  // article's URL is derived from its stream — so reassigning a stream changes a
  // nav href. Those globals are read through unstable_cache, which revalidatePath
  // does not touch, so purge their tags the same way revalidatePage does.
  revalidateTag('global_header')
  revalidateTag('global_footer')
}

export const revalidatePost: CollectionAfterChangeHook<Post> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      revalidatePostRoutes(doc, payload)
    }

    // Previously published: revalidate the old routes too (covers unpublish and
    // slug/stream changes, whose canonical path differs from the current one).
    if (previousDoc?._status === 'published' && postPath(previousDoc) !== postPath(doc)) {
      revalidatePostRoutes(previousDoc, payload)
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Post> = ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    revalidatePostRoutes(doc, payload)
  }

  return doc
}
