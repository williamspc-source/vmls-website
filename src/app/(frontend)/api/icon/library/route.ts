import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { getCachedIconLibrary } from '@/utilities/getIconLibrary'

/**
 * The icons a picker should offer, as `[{ value, label }]` — uploads and Phosphor
 * icons in one list, because they are one library.
 *
 * ## Why the picker fetches this instead of importing it
 *
 * The list is **editable** — it comes from the Icon Library global, not from
 * source — and `IconSelect` is a **client** component rendered on every icon
 * field in the admin, so importing `iconMap` to build the fallback would drag 101
 * Phosphor components into the admin bundle to display nothing but their names.
 *
 * Not cached at the HTTP layer: an admin who ticks an icon should see it in the
 * next picker they open, and `getCachedIconLibrary` already means this costs one
 * query per change rather than one per request.
 */

const UPLOAD = 'upload:'

/** `arrow-right` → `Arrow Right`, for a picker that shows words beside pictures. */
const titleCase = (name: string): string =>
  name
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

export const GET = async (): Promise<Response> => {
  const names = await getCachedIconLibrary()

  // Uploaded icons are stored as `upload:<id>` and named on their own record, so
  // their labels have to be looked up. One query for all of them rather than one
  // each — a library with thirty uploads would otherwise make thirty round trips
  // every time a picker opened.
  const uploadIds = names
    .filter((n) => n.startsWith(UPLOAD))
    .map((n) => n.slice(UPLOAD.length))
    .filter(Boolean)

  const uploadNames = new Map<string, string>()
  if (uploadIds.length) {
    const payload = await getPayload({ config: configPromise })
    const res = await payload.find({
      collection: 'icons',
      where: { id: { in: uploadIds } },
      depth: 0,
      limit: 500,
      pagination: false,
      overrideAccess: false,
    })
    for (const doc of res.docs as { id: string | number; name?: string }[]) {
      uploadNames.set(String(doc.id), doc.name || `Icon ${doc.id}`)
    }
  }

  const icons = names
    .map((value) => {
      if (!value.startsWith(UPLOAD)) return { value, label: titleCase(value) }
      const id = value.slice(UPLOAD.length)
      // An upload that has since been deleted is dropped rather than offered as a
      // tile that would render nothing.
      const label = uploadNames.get(id)
      return label ? { value, label } : null
    })
    .filter((i): i is { value: string; label: string } => i !== null)

  return new Response(JSON.stringify({ icons }), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}
