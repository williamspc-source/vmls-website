import { describe, expect, it } from 'vitest'

import { SvgIconError, normaliseSvgIcon, svgIconDocument } from '@/utilities/svgIcon'

/**
 * The uploaded-icon normaliser, checked against markup that is trying to get
 * through.
 *
 * This is the one piece of this feature where being wrong is a security bug
 * rather than a rendering one: an uploaded SVG is served from our own origin, so
 * anything executable that survives is stored XSS against staff and visitors
 * alike.
 *
 * The module does not filter hostile markup — it keeps recognised geometry and
 * rebuilds the file. These tests are written the same way round: they assert the
 * *output* contains only what it should, rather than that particular attacks were
 * removed. An allowlist that only ever gets tested against attacks somebody
 * thought of is a denylist wearing a disguise.
 *
 * ── The breaks, run, including the two that taught me something ─────────────
 *
 *  · Add `'use'` to `ALLOWED_ELEMENTS` and `'href'` to `ALLOWED_ATTRIBUTES` —
 *    a realistic regression, since supporting `<use>` looks harmless → "keeps no
 *    element outside the allowlist" fails, naming `<use`.
 *  · Add `'onclick'` to `ALLOWED_ATTRIBUTES` → **2 fail**: "keeps no event
 *    handler" and "keeps no script-bearing or external value".
 *  · Delete the `/url\(|javascript:|data:/` check in `keptAttributes` → "refuses
 *    a javascript: value even on an allowed attribute" fails.
 *  · Remove the width/height fallback and return a fixed `0 0 24 24` → "refuses
 *    an SVG it cannot size" fails.
 *
 * **Two first attempts stayed green, and both were my error rather than the
 * guard's.** Adding `'onload'` proved nothing, because the only `onload` in the
 * fixture sits on the `<svg>` element, which is not in the allowlist and is never
 * processed — the handler on a *path* is `onclick`. And adding `'script'` proved
 * nothing because the fixture's `<script>` carries no allowed attribute, so it is
 * dropped by the "nothing worth keeping" branch before the element allowlist
 * matters. The fixture now gives it `opacity="1"` so that path is exercised.
 *
 * Measured while chasing that: with `'script'` allowlisted AND an allowed
 * attribute present, the output is `<script opacity="1"/>` — **empty**. The
 * reconstruction emits `<tag attrs/>` and never copies element content, so a
 * script tag cannot carry code through this module even if someone allowlists it.
 * That is a property worth knowing rather than relying on: the element allowlist
 * is still the thing being tested.
 */

const HOSTILE = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" onload="alert(1)">
  <script opacity="1">alert('xss')</script>
  <foreignObject><body xmlns="http://www.w3.org/1999/xhtml"><img src=x onerror="alert(2)"></body></foreignObject>
  <a href="javascript:alert(3)"><path d="M10 10 H 90 V 90 H 10 Z" fill="#ff0000"/></a>
  <image href="https://evil.example/pixel.png" x="0" y="0" width="10" height="10"/>
  <use href="#somewhere-else"/>
  <path d="M20 20 L40 40" opacity="0.2" onclick="alert(4)" style="fill:url(#x)"/>
  <text x="0" y="0">not an icon</text>
</svg>`

describe('normaliseSvgIcon', () => {
  const result = normaliseSvgIcon(HOSTILE)
  const doc = svgIconDocument(result)

  it('keeps the geometry', () => {
    // A positive control. Every assertion below is about what is ABSENT, and an
    // empty string satisfies all of them.
    expect(result.markup).toContain('M10 10 H 90 V 90 H 10 Z')
    expect(result.markup).toContain('M20 20 L40 40')
    expect(result.viewBox).toBe('0 0 256 256')
  })

  it('keeps no element outside the allowlist', () => {
    for (const tag of ['script', 'foreignObject', 'image', 'use', 'a', 'text', 'body', 'img']) {
      expect(doc.toLowerCase(), `<${tag}> survived normalisation`).not.toContain(`<${tag.toLowerCase()}`)
    }
  })

  it('keeps no event handler', () => {
    expect(doc).not.toMatch(/\son[a-z]+\s*=/i)
    for (const handler of ['onload', 'onerror', 'onclick']) {
      expect(doc.toLowerCase()).not.toContain(handler)
    }
  })

  it('keeps no script-bearing or external value', () => {
    expect(doc.toLowerCase()).not.toContain('javascript:')
    expect(doc.toLowerCase()).not.toContain('evil.example')
    expect(doc.toLowerCase()).not.toContain('alert')
    expect(doc.toLowerCase()).not.toContain('<style')
    expect(doc.toLowerCase()).not.toContain('style=')
  })

  it('refuses a javascript: value even on an allowed attribute', () => {
    const out = normaliseSvgIcon(
      '<svg viewBox="0 0 10 10"><path d="M0 0 L5 5" transform="javascript:alert(1)"/></svg>',
    )
    expect(out.markup).toContain('M0 0 L5 5')
    expect(out.markup.toLowerCase()).not.toContain('javascript:')
  })

  it('drops colour, because the site supplies it', () => {
    // Not a security property — the point of the feature. `Icon` renders these
    // through `mask-image`, which reads alpha only, so a red icon and a black one
    // both come out as the band's colour.
    expect(doc).not.toContain('#ff0000')
    expect(doc.toLowerCase()).not.toMatch(/\sfill="(?!currentColor)/i)
  })

  it('keeps the opacity that carries duotone', () => {
    // Phosphor duotone is a solid path plus one at opacity 0.2, and mask alpha is
    // what reproduces it. Strip opacity and an uploaded duotone icon flattens.
    expect(result.markup).toContain('opacity="0.2"')
  })

  it('refuses an SVG it cannot size', () => {
    expect(() => normaliseSvgIcon('<svg><path d="M0 0 L5 5"/></svg>')).toThrow(SvgIconError)
  })

  it('falls back to width/height when there is no viewBox', () => {
    const out = normaliseSvgIcon('<svg width="48" height="48"><path d="M0 0 L5 5"/></svg>')
    expect(out.viewBox).toBe('0 0 48 48')
  })

  it('refuses a file with no geometry, rather than storing an invisible icon', () => {
    expect(() =>
      normaliseSvgIcon('<svg viewBox="0 0 10 10"><text x="0" y="0">hello</text></svg>'),
    ).toThrow(SvgIconError)
    expect(() => normaliseSvgIcon('not an svg at all')).toThrow(SvgIconError)
  })

  it('handles the shape a real design tool exports', () => {
    const figma = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0)">
        <path d="M12 2L2 7v10l10 5 10-5V7l-10-5z" fill="#1C75BC" stroke="#000" stroke-width="2"/>
        <circle cx="12" cy="12" r="3" fill="white"/>
      </g>
      <defs><clipPath id="clip0"><rect width="24" height="24" fill="white"/></clipPath></defs>
    </svg>`
    const out = normaliseSvgIcon(figma)
    expect(out.viewBox).toBe('0 0 24 24')
    expect(out.markup).toContain('<path d="M12 2L2 7v10l10 5 10-5V7l-10-5z"/>')
    // The circle is `fill="white"` against a `#1C75BC` shield, so it is the
    // LIGHTER of two colours and becomes the faint tone. Worth being explicit
    // about, because a white shape inside a coloured one is usually drawn as a
    // knockout — a hole — and a mask cannot express one: mask alpha is coverage,
    // so a fully-opaque white fill would otherwise be solid, i.e. invisible
    // inside an equally solid shield. Twenty percent is the closest honest
    // reading of the artist's intent, and it is what a built-in duotone icon
    // does. See the `duotone from a two-colour file` block below.
    expect(out.markup).toContain('<circle cx="12" cy="12" r="3" opacity="0.2"/>')
    expect(out.markup).not.toContain('#1C75BC')
    expect(out.markup).not.toContain('clip-path')
    // The `<rect>` lives inside `<defs><clipPath>` — it defines a clip region and
    // is not part of the drawing. Keeping it renders a solid 24×24 square over
    // the icon, which is what happened the first time this was uploaded for real.
    expect(out.markup, 'a clipPath template was kept as drawable geometry').not.toContain('<rect')
  })
})

describe('duotone from a two-colour file', () => {
  /**
   * The site paints an icon through `mask-image`, which reads alpha and discards
   * colour — so a navy shield with a pink tick would arrive as one flat shape,
   * beside built-in Phosphor icons that are all duotone. Phosphor builds duotone
   * as a solid path plus one at `opacity="0.2"`, which a mask reproduces exactly,
   * so a two-colour file is converted into a two-TONE one.
   *
   * Proven red by:
   *  · returning `null` from `declaredFill` → "ranks two colours by lightness"
   *  · dropping the `alreadyToned` check → "leaves artwork that already says so"
   *  · treating `none`/`currentColor` as colours → "ignores none and currentColor"
   */
  const wrap = (inner: string) => `<svg viewBox="0 0 32 32">${inner}</svg>`
  const faintCount = (markup: string) => markup.match(/opacity="0\.2"/g)?.length ?? 0

  it('ranks two colours by lightness, and the darkest stays solid', () => {
    const { markup } = normaliseSvgIcon(
      wrap('<path d="M0 0h9v9H0z" fill="#1a3a5c"/><path d="M2 2h4v4H2z" fill="#ff2d95"/>'),
    )
    // The navy shape is the icon; the lighter pink one becomes the faint tone.
    expect(markup).toBe('<path d="M0 0h9v9H0z"/><path d="M2 2h4v4H2z" opacity="0.2"/>')
  })

  it('is not fooled by source order — the DARKEST wins, not the first', () => {
    // The same file with the shapes swapped must produce the same tones, or the
    // rule is "whichever came first" dressed up as a rule about colour.
    const { markup } = normaliseSvgIcon(
      wrap('<path d="M2 2h4v4H2z" fill="#ff2d95"/><path d="M0 0h9v9H0z" fill="#1a3a5c"/>'),
    )
    expect(markup).toBe('<path d="M2 2h4v4H2z" opacity="0.2"/><path d="M0 0h9v9H0z"/>')
  })

  it('leaves a one-colour file flat', () => {
    const { markup } = normaliseSvgIcon(
      wrap('<path d="M0 0h9v9H0z" fill="#1a3a5c"/><path d="M2 2h4v4H2z" fill="#1a3a5c"/>'),
    )
    expect(faintCount(markup)).toBe(0)
  })

  it('leaves artwork that already says so completely alone', () => {
    // An artist who exported at 20% has said what they meant, in the units that
    // survive. Guessing over the top of that would be worse than not guessing.
    const { markup } = normaliseSvgIcon(
      wrap('<path d="M0 0h9v9H0z" fill="#1a3a5c" opacity="0.2"/><path d="M2 2h4v4H2z" fill="#ff2d95"/>'),
    )
    expect(markup).toBe('<path d="M0 0h9v9H0z" opacity="0.2"/><path d="M2 2h4v4H2z"/>')
  })

  it('ignores none and currentColor, which are not colours for this purpose', () => {
    const { markup } = normaliseSvgIcon(
      wrap('<path d="M0 0h9v9H0z" fill="none"/><path d="M2 2h4v4H2z" fill="currentColor"/>'),
    )
    expect(faintCount(markup)).toBe(0)
  })

  it('reads rgb() as well as hex', () => {
    const { markup } = normaliseSvgIcon(
      wrap('<path d="M0 0h9v9H0z" fill="rgb(26, 58, 92)"/><path d="M2 2h4v4H2z" fill="rgb(255, 45, 149)"/>'),
    )
    expect(markup).toBe('<path d="M0 0h9v9H0z"/><path d="M2 2h4v4H2z" opacity="0.2"/>')
  })

  it('collapses three colours to two tones, because that is what duotone is', () => {
    const { markup } = normaliseSvgIcon(
      wrap(
        '<path d="M0 0h9v9H0z" fill="#000000"/><path d="M1 1h4v4H1z" fill="#888888"/><path d="M2 2h4v4H2z" fill="#ffffff"/>',
      ),
    )
    expect(faintCount(markup)).toBe(2)
  })
})
