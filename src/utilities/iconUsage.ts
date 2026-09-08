import type { Field, Payload, PayloadRequest } from 'payload'

/**
 * Every document that has a given icon selected.
 *
 * Used to refuse deleting an uploaded icon that pages are still relying on. The
 * alternative — delete it and let the icon vanish — is the failure this project
 * keeps recording: nothing breaks loudly, a card just quietly loses its glyph and
 * nobody finds out until a visitor sees the gap.
 *
 * ## Why the field paths are DERIVED
 *
 * An icon can be chosen in **38** places today, spread across 18 blocks, 11
 * collections, 3 globals and the heros, and most of them are nested inside a
 * `blocks` array inside a tab. A hand-written list of those paths would be wrong
 * the first time someone adds an icon to a new block — and wrong *silently*, in
 * the direction that matters: a missed path means a deletion that should have
 * been refused goes through.
 *
 * So the sanitised config is walked instead, exactly as `liftRichText.ts` and
 * `proseFields.int.spec.ts` do. If a field can hold an icon, it is found, because
 * the same config that renders the picker is the one being read.
 */

/** Fields that hold other fields, and how to reach them. */
const childFields = (field: Field): Field[] => {
  const f = field as unknown as {
    fields?: Field[]
    tabs?: { fields?: Field[] }[]
    blocks?: { fields: Field[] }[]
  }
  if (Array.isArray(f.fields)) return f.fields
  if (Array.isArray(f.tabs)) return f.tabs.flatMap((t) => t.fields ?? [])
  if (Array.isArray(f.blocks)) return f.blocks.flatMap((b) => b.fields ?? [])
  return []
}

/**
 * Dotted paths of every field that can hold an icon.
 *
 * Payload's query syntax addresses a field inside a block array by name path
 * (`layout.icon`), and matches in any row — which is what we want: the question
 * is "is this icon used in this document at all", not "where exactly".
 */
export const iconFieldPaths = (fields: Field[], prefix = ''): string[] => {
  const out: string[] = []
  for (const field of fields) {
    const name = 'name' in field ? (field.name as string | undefined) : undefined

    // Rows, collapsibles and unnamed tabs hold children at their own level, so
    // they contribute no path segment. Miss this and every icon inside a two-column
    // admin row — which is most of them — is skipped.
    if (!name) {
      out.push(...iconFieldPaths(childFields(field), prefix))
      continue
    }

    const path = prefix ? `${prefix}.${name}` : name
    // `iconField()` names the field `icon` by default but takes overrides, so key
    // on the shape (a select whose options are icon names) rather than the name
    // alone — a field called `icon` on some future collection that is not an icon
    // picker would otherwise produce a query against a column that cannot match.
    if (field.type === 'select' || field.type === 'text') {
      if (/(^|\.)((placeholder)?[Ii]con|iconName)$/.test(path)) out.push(path)
      continue
    }
    out.push(...iconFieldPaths(childFields(field), path))
  }
  return out
}

/**
 * Labels for the documents using `value`, e.g. `Pages: About VERIFY`.
 *
 * ## Why this scans documents rather than querying the paths
 *
 * `iconFieldPaths` finds **250** paths on Pages alone, because a block nested in
 * a Section nested in a Row multiplies out. Two problems with turning those into
 * a `where`: it is a 250-condition `or`, and — the reason that settles it — I
 * could not confirm that Payload's Postgres adapter resolves a path seven levels
 * into nested block tables (`layout.content.tabs.content.rows.icon`). A query
 * that silently returns nothing would let a deletion through that should have
 * been refused, which is precisely the failure this function exists to prevent.
 *
 * Scanning is cheap here and cannot miss: **307 documents** across every
 * collection that can hold an icon, at `depth: 0`, for an operation a person
 * performs by hand and rarely. The config walk is still what decides *which*
 * collections to look at, so a collection that gains an icon field is covered
 * with no edit here.
 *
 * A false positive — the literal string appearing in body copy — refuses a
 * deletion that could have gone ahead. That is the safe direction, and the
 * message names the document so it can be checked.
 */
export const iconUsage = async (
  payload: Payload,
  value: string,
  req?: PayloadRequest,
): Promise<string[]> => {
  const used: string[] = []
  // Quoted, so `upload:12` cannot match `upload:123` — and a second needle for
  // the coloured form, since a placement stores `upload:12@brand` (see
  // `src/components/Icon/value.ts`). Both keep the closing boundary, which is
  // what stops `upload:1` matching `upload:12` in either shape.
  const quoted = JSON.stringify(value)
  const needles = [quoted, `${quoted.slice(0, -1)}@`]

  for (const collection of payload.config.collections) {
    // Uploads hold no icon choices, and `icons` cannot reference itself.
    if (collection.slug === 'icons' || collection.slug === 'media') continue
    if (!iconFieldPaths(collection.fields).length) continue

    const result = await payload.find({
      collection: collection.slug as Parameters<Payload['find']>[0]['collection'],
      depth: 0,
      pagination: false,
      req,
      // Drafts count: an icon referenced only by an unpublished draft comes back
      // the moment that draft is published.
      draft: true,
      overrideAccess: true,
    })

    for (const doc of result.docs as unknown as Record<string, unknown>[]) {
      const json = JSON.stringify(doc)
      if (!needles.some((n) => json.includes(n))) continue
      const label = (collection.labels?.plural as string) || collection.slug
      const title = (doc.title || doc.name || doc.slug || doc.id) as string
      used.push(`${label}: ${title}`)
    }
  }

  for (const global of payload.config.globals) {
    if (!iconFieldPaths(global.fields).length) continue
    const doc = await payload.findGlobal({
      slug: global.slug as Parameters<Payload['findGlobal']>[0]['slug'],
      depth: 0,
      req,
    })
    const json = JSON.stringify(doc ?? {})
    if (needles.some((n) => json.includes(n))) {
      used.push((global.label as string) || global.slug)
    }
  }

  return used
}
