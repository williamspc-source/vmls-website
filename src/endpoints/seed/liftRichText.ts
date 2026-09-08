import { buildEditorState } from '@payloadcms/richtext-lexical'
import type { Field, Payload } from 'payload'

/**
 * Lift plain strings into Lexical values wherever the config says a field is
 * rich text.
 *
 * ## Why this is needed at all
 *
 * Payload does **not** reject a string written into a rich-text field. Measured:
 * `payload.update()` with `heading: 'PROBE STRING VALUE'` was accepted, and the
 * value came back out of the database as the string `"PROBE STRING VALUE"` —
 * sitting in a `jsonb` column, in a shape no editor can open. No error, no
 * warning, and the front end even renders it, because `InlineRichText` still
 * accepts a string. It is exactly the kind of half-working state that survives
 * every check until someone opens the document in the admin.
 *
 * The seed writes copy from ~40 fixture files, all of it plain strings. Rather
 * than rewriting every fixture — and betting that nobody adds a string one
 * again — the lift happens once, at the write boundary.
 *
 * ## Why it walks the config rather than a list of field names
 *
 * A name-keyed list would be wrong in both directions. `label` is rich text on a
 * button and a plain string on a link; `title` is rich text on a card and the
 * document's own name on a collection. The sanitised config already knows which
 * is which, so it is the only source that cannot drift from the fields
 * themselves.
 *
 * It is deliberately **not** a `beforeValidate` hook. A hook would silently
 * accept strings from any caller — the REST API, the admin, an import script —
 * which turns a bug into a supported input and hides the next mistake. This is
 * the seed's own boundary, and the seed is the only thing that should be
 * handing over prose in bulk.
 */

type AnyRecord = Record<string, unknown>

const isPlainObject = (v: unknown): v is AnyRecord =>
  !!v && typeof v === 'object' && !Array.isArray(v)

/** Fields that hold other fields, and how to reach them. */
const childFields = (field: Field): Field[] => {
  const f = field as unknown as { fields?: Field[]; tabs?: { fields?: Field[] }[] }
  if (Array.isArray(f.fields)) return f.fields
  if (Array.isArray(f.tabs)) return f.tabs.flatMap((t) => t.fields ?? [])
  return []
}

/**
 * Apply `fields` to `data`, lifting any string sitting in a rich-text field.
 *
 * Returns a new object; the input is never mutated, because seed fixtures are
 * module-level constants shared between runs and quietly rewriting one would
 * make the second run behave differently from the first.
 */
const liftFields = (fields: Field[], data: unknown): unknown => {
  if (Array.isArray(data)) return data.map((row) => liftFields(fields, row))
  if (!isPlainObject(data)) return data

  const out: AnyRecord = { ...data }

  for (const field of fields) {
    const name = 'name' in field ? (field.name as string | undefined) : undefined

    // Rows, collapsibles and unnamed tabs hold their children at the SAME level
    // as themselves, so their fields are applied to this object rather than to a
    // property of it. Miss this and every field inside a `row` — which is most
    // of the two-column admin layouts in this repo — is skipped silently.
    if (!name) {
      const nested = childFields(field)
      if (nested.length) Object.assign(out, liftFields(nested, out) as AnyRecord)
      continue
    }

    if (!(name in out)) continue
    const value = out[name]

    if (field.type === 'richText') {
      if (typeof value === 'string') {
        // An empty string means "not set" — lifting it would store an empty
        // paragraph, which is truthy and would make `hasRichText` the only thing
        // standing between a blank field and an empty rendered band.
        out[name] = value.trim() === '' ? null : buildEditorState({ text: value })
      }
      continue
    }

    if (field.type === 'blocks') {
      const blocks = (field as unknown as { blocks?: { slug: string; fields: Field[] }[] }).blocks
      if (!Array.isArray(value) || !Array.isArray(blocks)) continue
      out[name] = value.map((row) => {
        if (!isPlainObject(row)) return row
        const block = blocks.find((b) => b.slug === row.blockType)
        return block ? (liftFields(block.fields, row) as AnyRecord) : row
      })
      continue
    }

    const nested = childFields(field)
    if (nested.length) out[name] = liftFields(nested, value)
  }

  return out
}

/** Lift the data for one collection document. */
export const liftForCollection = (payload: Payload, slug: string, data: unknown): unknown => {
  const collection = payload.config.collections.find((c) => c.slug === slug)
  return collection ? liftFields(collection.fields, data) : data
}

/** Lift the data for one global. */
export const liftForGlobal = (payload: Payload, slug: string, data: unknown): unknown => {
  const global = payload.config.globals.find((g) => g.slug === slug)
  return global ? liftFields(global.fields, data) : data
}
