import { BRAND_TEXT_COLORS } from '@/fields/richTextColors'

/**
 * What an icon field stores, and the only place that shape is interpreted.
 *
 * ## Four forms, one column
 *
 * | Stored | Means |
 * |---|---|
 * | `brain` | a curated icon, taking the colour of whatever it sits on |
 * | `brain@deep` | the same icon, forced to Deep navy |
 * | `upload:12` | an uploaded icon, using that icon's own default colour |
 * | `upload:12@white` | the same upload, forced to White |
 *
 * ## Why the colour rides in the value
 *
 * The obvious shape is a second `iconColour` column beside every icon. Measured
 * before choosing: `iconField` has **38 call sites**, most of them already inside
 * an admin `row` with explicit widths, and **45 `<Icon>` render sites** would each
 * have to forward the new prop. That is the exact shape `textColour` took when it
 * shipped on 26 blocks read by nothing (invariant 33) — 110 new columns, and one
 * forgotten render site is a control that silently does nothing.
 *
 * Encoding it here costs one column, one parser and one test, and `Icon` applies
 * it centrally so no render site can forget. The precedent is `[[bracket]]`
 * accents: meaning carried in a string, parsed in one place.
 *
 * ## The one rule that keeps old values safe
 *
 * A suffix is only read as a colour when it is **a key the palette actually
 * has**. Anything else is left as part of the icon key, so no value that exists
 * today can be mangled by this parser — and a colour retired from the palette
 * degrades to "follows the band" rather than to a broken name.
 */

const UPLOAD_PREFIX = 'upload:'

export type ParsedIcon = {
  /** The icon itself — a curated name, or `upload:<id>`. */
  key: string
  /** A palette key, or `null` for "follows whatever it sits on". */
  colour: string | null
  /** The uploaded icon's id, when this is an upload. */
  uploadId: string | null
}

/** `upload:12@white` → `{ key: 'upload:12', colour: 'white', uploadId: '12' }`. */
export const parseIconValue = (value?: string | null): ParsedIcon | null => {
  if (!value || typeof value !== 'string') return null

  let key = value
  let colour: string | null = null

  // Split on the LAST `@`, so the suffix reads as a modifier on the key rather
  // than the key being cut at its first `@` — and only when the suffix names a
  // real colour, so an unrecognised one cannot silently shorten the icon key.
  const at = value.lastIndexOf('@')
  if (at > 0) {
    const candidate = value.slice(at + 1)
    if (BRAND_TEXT_COLORS.some((c) => c.key === candidate)) {
      key = value.slice(0, at)
      colour = candidate
    }
  }

  return {
    key,
    colour,
    uploadId: key.startsWith(UPLOAD_PREFIX) ? key.slice(UPLOAD_PREFIX.length) || null : null,
  }
}

/**
 * The inverse, for the picker.
 *
 * A missing or unknown colour returns the bare key, so "follows the band" stores
 * exactly what every icon stores today and choosing it cannot introduce a suffix
 * that means nothing.
 */
export const formatIconValue = (key: string, colour?: string | null): string => {
  if (!key) return ''
  if (!colour || !BRAND_TEXT_COLORS.some((c) => c.key === colour)) return key
  return `${key}@${colour}`
}

/** Whether a stored value points at the Icons collection rather than the curated set. */
export const isUploadedIcon = (value?: string | null): boolean =>
  Boolean(parseIconValue(value)?.uploadId)
