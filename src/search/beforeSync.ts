import { BeforeSync, DocToSync } from '@payloadcms/plugin-search/types'

import { specialistPath, eventPath, postPath } from '@/utilities/routes'

/**
 * Builds the Search document for one Post / Specialist / Event.
 *
 * `uri` is what the result card links to. It is populated here, on save — which
 * means documents that existed before this field did have no `uri` at all, and
 * their cards render unlinked. Measured on the local database: 7 of 66 search
 * documents had one.
 *
 * **After a content import, a seed, or adding this field, reindex.** Admin →
 * System → Search → *Reindex*, or:
 *
 *   curl -X POST /api/search/reindex -H 'Authorization: JWT <token>' \
 *        -H 'Content-Type: application/json' \
 *        -d '{"collections":["posts","specialists","events"]}'
 */
export const beforeSyncWithSearch: BeforeSync = async ({ req, originalDoc, searchDoc }) => {
  const {
    doc: { relationTo: collection },
  } = searchDoc

  const { slug, id, categories, title, meta } = originalDoc

  // Canonical URL for this result, resolved per collection. Posts need their
  // stream slug; originalDoc.stream may be a populated object or a bare id, so
  // fetch the slug when it isn't already present.
  let uri: string | null = null
  if (collection === 'specialists') {
    uri = specialistPath(slug)
  } else if (collection === 'events') {
    uri = eventPath(slug)
  } else if (collection === 'posts') {
    const stream = (originalDoc as { stream?: unknown }).stream
    let streamSlug: string | null =
      stream && typeof stream === 'object' ? ((stream as { slug?: string }).slug ?? null) : null
    if (!streamSlug && stream) {
      const streamDoc = await req.payload.findByID({
        collection: 'streams',
        id: stream as string | number,
        depth: 0,
        disableErrors: true,
        select: { slug: true },
        req,
      })
      streamSlug = (streamDoc as { slug?: string } | null)?.slug ?? null
    }
    uri = postPath({ slug, stream: streamSlug ? { slug: streamSlug } : null })
  }

  const modifiedDoc: DocToSync = {
    ...searchDoc,
    slug,
    // Always write `uri`, including when it resolves to null.
    //
    // This used to be `...(uri ? { uri } : {})`, which omitted the key entirely
    // on a null — so a result that lost its canonical URL (a post whose stream
    // was cleared) kept the old one forever and the card linked somewhere that
    // no longer exists. A null is a real answer: the search page renders such a
    // result unlinked rather than inventing a path.
    uri,
    meta: {
      ...meta,
      title: meta?.title || title,
      image: meta?.image?.id || meta?.image,
      description: meta?.description,
    },
    categories: [],
  }

  if (categories && Array.isArray(categories) && categories.length > 0) {
    const populatedCategories: { id: string | number; title: string }[] = []
    for (const category of categories) {
      if (!category) {
        continue
      }

      if (typeof category === 'object') {
        populatedCategories.push(category)
        continue
      }

      const doc = await req.payload.findByID({
        collection: 'categories',
        id: category,
        disableErrors: true,
        depth: 0,
        select: { title: true },
        req,
      })

      if (doc !== null) {
        populatedCategories.push(doc)
      } else {
        console.error(
          `Failed. Category not found when syncing collection '${collection}' with id: '${id}' to search.`,
        )
      }
    }

    modifiedDoc.categories = populatedCategories.map((each) => ({
      relationTo: 'categories',
      categoryID: String(each.id),
      title: each.title,
    }))
  }

  return modifiedDoc
}
