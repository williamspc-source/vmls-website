/**
 * Turn an uploaded SVG into markup this site is willing to serve.
 *
 * ## Why normalise rather than sanitise
 *
 * An uploaded icon is a file a staff member chose, served from our own origin. An
 * SVG is not an image in the way a PNG is — it is a document that can carry
 * `<script>`, `on*` handlers, `<foreignObject>` with arbitrary HTML, and external
 * references. Rendered through `mask-image` none of that executes, but the file
 * is reachable directly, and a visitor who opens it is on our origin. That is
 * stored XSS.
 *
 * Filtering hostile markup means enumerating what an attacker might do, and being
 * wrong once is enough. So nothing uploaded is ever served: this reads the file,
 * keeps only geometry it recognises, and **reconstructs** the SVG from what it
 * kept. The output is markup we wrote. Anything unrecognised — including anything
 * invented after this was written — is absent by construction rather than by
 * having been matched and removed.
 *
 * The same reasoning as the seed's rich-text lift: take the narrowest input that
 * answers the question, rather than accepting a wide shape and hoping.
 *
 * ## What survives, and why that is enough
 *
 * Shape elements and their geometry. **Not fills, strokes or colours** — and
 * losing them costs nothing here, because `Icon` renders these through
 * `mask-image`, which reads the alpha channel only. Black artwork, white artwork
 * and magenta artwork all come out as the site's own colour. Dropping colour is
 * the feature, not a limitation of the parser.
 *
 * `opacity` and `fill-opacity` ARE kept: mask alpha is what reproduces Phosphor's
 * duotone (a solid path plus one at `opacity="0.2"`), so an uploaded icon can use
 * the same trick.
 */

/** Elements that describe a shape. Everything else is dropped. */
const ALLOWED_ELEMENTS = new Set([
  'circle',
  'ellipse',
  'g',
  'line',
  'path',
  'polygon',
  'polyline',
  'rect',
])

/**
 * Attributes worth keeping: geometry, and the two opacity attributes that carry
 * duotone through a mask. No `fill`, `stroke`, `style`, `class`, `id`, `href` or
 * anything beginning `on`.
 */
const ALLOWED_ATTRIBUTES = new Set([
  'cx',
  'cy',
  'd',
  'fill-opacity',
  'fill-rule',
  'height',
  'opacity',
  'points',
  'r',
  'rx',
  'ry',
  'transform',
  'width',
  'x',
  'x1',
  'x2',
  'y',
  'y1',
  'y2',
  'clip-rule',
])

export type NormalisedIcon = {
  /** The `viewBox` the reconstructed SVG should use. */
  viewBox: string
  /** Shape markup only, built by this module. Safe to serve and to inline. */
  markup: string
}

export class SvgIconError extends Error {}

/**
 * The `fill` an element declares, lowercased — read BEFORE it is dropped.
 *
 * `fill` is deliberately not in `ALLOWED_ATTRIBUTES` and must never be: the site
 * paints an icon, the artwork does not. But which shapes were *different colours*
 * from each other is the only signal a two-colour file gives about which part is
 * the faint one, so it is read here and thrown away immediately after.
 */
const declaredFill = (raw: string): string | null => {
  const m = raw.match(/\bfill\s*=\s*"([^"]*)"/i)
  if (!m) return null
  const v = m[1]!.trim().toLowerCase()
  // Not colours for this purpose: `none` paints nothing, and `currentColor` is
  // already what every kept shape resolves to.
  if (!v || v === 'none' || v === 'transparent' || v === 'currentcolor') return null
  return v
}

/** Relative luminance, 0 (black) to 1 (white). Named CSS colours are not resolved. */
const luminance = (colour: string): number => {
  let r: number, g: number, b: number
  const hex = colour.replace(/^#/, '')
  if (/^[0-9a-f]{3}$/.test(hex)) {
    ;[r, g, b] = [...hex].map((c) => parseInt(c + c, 16)) as [number, number, number]
  } else if (/^[0-9a-f]{6}$/.test(hex)) {
    ;[r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number]
  } else {
    const rgb = colour.match(/rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i)
    if (!rgb) return 0.5 // unknown notation: neither darkest nor lightest
    ;[r, g, b] = [1, 2, 3].map((i) => Number(rgb[i])) as [number, number, number]
  }
  // Rec. 709, which is close enough to rank two flat fills.
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
}

/** `<path d="…" opacity="0.2"/>` → the attributes we keep, in a fixed order. */
const keptAttributes = (raw: string): string => {
  const out: string[] = []
  // Attribute values are quoted in any SVG a design tool produces. Unquoted
  // values are not parsed rather than being guessed at — a dropped attribute
  // loses a rounded corner; a mis-parsed one is how markup escapes.
  for (const match of raw.matchAll(/([a-zA-Z-]+)\s*=\s*"([^"]*)"/g)) {
    const name = match[1]!.toLowerCase()
    const value = match[2]!
    if (!ALLOWED_ATTRIBUTES.has(name)) continue
    // Geometry never needs these, and they are how a value stops being a value.
    if (/[<>]/.test(value)) continue
    if (/url\s*\(|javascript:|data:/i.test(value)) continue
    out.push(`${name}="${value}"`)
  }
  return out.join(' ')
}

/** Phosphor's own faint tone: a duotone icon is one solid path plus one at this. */
const DUOTONE_OPACITY = '0.2'

type KeptShape = { tag: string; attributes: string; fill: string | null; hasOpacity: boolean }

/**
 * Turn shapes that differed by COLOUR into shapes that differ by TONE.
 *
 * ## Why
 *
 * The site paints an icon through `mask-image`, which reads alpha and discards
 * colour — so a navy shield with a pink tick arrives as one flat shape, while
 * every built-in Phosphor icon beside it is duotone. Phosphor builds duotone as
 * a solid path plus one at `opacity="0.2"`, and a mask reproduces that exactly,
 * so the artwork only has to say which shape is the faint one.
 *
 * A two-colour file already says it, just in the wrong units. This converts:
 * rank the distinct fills by luminance, keep the darkest solid, and give every
 * other one 20%.
 *
 * ## When it does nothing, which is most of the time
 *
 * - **Any shape already carries `opacity` or `fill-opacity`** — the artist has
 *   said what they meant, in the units that survive, and guessing over the top of
 *   that would be worse than useless.
 * - **Fewer than two distinct fills** — nothing to rank.
 *
 * ## What it cannot see
 *
 * A `fill` inherited from a `<g>`: the `<g>` is dropped and its children are
 * matched independently, so a file that colours a whole group at once looks
 * fill-less here and is left flat. And three or more colours collapse to two
 * tones, because that is what duotone is.
 *
 * The result is visible on the icon's own admin screen before it reaches a page,
 * which is what makes a heuristic acceptable here at all.
 */
const toneOf = (shapes: KeptShape[]) => {
  const fills = [...new Set(shapes.map((s) => s.fill).filter((f): f is string => Boolean(f)))]
  const alreadyToned = shapes.some((s) => s.hasOpacity)
  const solid = alreadyToned || fills.length < 2 ? null : fills.reduce((a, b) => (luminance(a) <= luminance(b) ? a : b))

  return (shape: KeptShape): string => {
    const faint = solid !== null && shape.fill !== null && shape.fill !== solid
    return `<${shape.tag} ${shape.attributes}${faint ? ` opacity="${DUOTONE_OPACITY}"` : ''}/>`
  }
}

/**
 * Read an uploaded SVG and return the shape markup to store.
 *
 * Throws `SvgIconError` when there is nothing renderable left — an editor who
 * uploads a photograph renamed `.svg`, or an icon built entirely from
 * `<image>`/`<text>`, gets told so at the point of upload rather than finding an
 * invisible icon on a page later.
 */
export const normaliseSvgIcon = (source: string): NormalisedIcon => {
  if (!source || !/<svg[\s>]/i.test(source)) {
    throw new SvgIconError('That file does not look like an SVG.')
  }

  const svgTag = source.match(/<svg\b[^>]*>/i)?.[0] ?? ''
  const viewBox =
    svgTag.match(/viewBox\s*=\s*"([\d\s.,-]+)"/i)?.[1]?.trim() ||
    // No viewBox: fall back to width/height so the icon still scales. An SVG with
    // neither cannot be sized, and guessing 24×24 would silently crop real
    // artwork — so it is refused instead.
    (() => {
      const w = svgTag.match(/\bwidth\s*=\s*"([\d.]+)/i)?.[1]
      const h = svgTag.match(/\bheight\s*=\s*"([\d.]+)/i)?.[1]
      if (!w || !h) {
        throw new SvgIconError(
          'That SVG has no viewBox and no width/height, so there is no way to know what size it should be. Re-export it with a viewBox.',
        )
      }
      return `0 0 ${w} ${h}`
    })()

  // Drop the sections that DEFINE things rather than draw them, before looking
  // for shapes. Geometry inside `<defs>`, `<clipPath>`, `<mask>` and friends is a
  // template — a clip region, a gradient stop — not something the icon paints.
  //
  // Found by uploading a real Figma export: it wraps its artwork in
  // `<g clip-path="url(#c0)">` and puts `<clipPath id="c0"><rect width="24"
  // height="24"/></clipPath>` in `<defs>`. That rect was being kept, so the icon
  // came out as a solid 24×24 square covering the artwork — a plausible-looking
  // result that is completely wrong, and exactly what a unit test written from
  // imagination would have missed.
  const drawable = source.replace(
    /<(defs|clipPath|mask|pattern|symbol|marker|filter|linearGradient|radialGradient)\b[\s\S]*?<\/\1\s*>/gi,
    '',
  )

  const kept: { tag: string; attributes: string; fill: string | null; hasOpacity: boolean }[] = []
  // Self-closing and paired forms both, since design tools emit both.
  for (const match of drawable.matchAll(/<([a-zA-Z][a-zA-Z0-9-]*)\b([^>]*?)\/?>/g)) {
    const tag = match[1]!.toLowerCase()
    if (!ALLOWED_ELEMENTS.has(tag)) continue
    const raw = match[2] ?? ''
    const attributes = keptAttributes(raw)
    // A `<g>` carrying nothing we keep contributes nothing; its children are
    // matched independently by this same loop, so dropping it never loses them.
    if (tag === 'g') continue
    if (!attributes) continue
    kept.push({
      tag,
      attributes,
      fill: declaredFill(raw),
      hasOpacity: /\b(fill-)?opacity\s*=/i.test(raw),
    })
  }

  if (!kept.length) {
    throw new SvgIconError(
      'Nothing renderable was found in that SVG. Icons need to be drawn as shapes — an SVG that only wraps a photograph, or that is built from text, cannot be used.',
    )
  }

  return { viewBox, markup: kept.map(toneOf(kept)).join('') }
}

/** The full document to serve for a stored icon. */
export const svgIconDocument = ({ viewBox, markup }: NormalisedIcon): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="currentColor">${markup}</svg>`
