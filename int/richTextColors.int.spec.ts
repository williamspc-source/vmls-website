import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  BRAND_TEXT_COLORS,
  INHERIT_COLOR,
  colorClass,
  textColorField,
} from '@/fields/richTextColors'
import { brandTextColorFeature } from '@/fields/richTextColorFeature'
import { ON_DARK_SELECTORS } from '@/fields/richTextColors'

/**
 * The editor's colour palette has two halves that can drift apart.
 *
 * `src/fields/richTextColors.ts` decides what the dropdown offers and what class
 * each choice emits. `globals.css` decides what those classes paint. Nothing but
 * this file makes the two agree — and the failure is silent in the worst
 * direction: an editor picks "Bright blue", the field saves, the class lands in
 * the HTML, and the text does not change colour because no rule matches. A
 * control that can be set and does nothing is the first thing this repo's
 * invariants forbid.
 *
 * The breaks that prove these, all run:
 *
 *  · Delete the `.vf-tc-bright` rule from globals.css → **2 fail**, not 1: the
 *    missing-rule assertion and the `!important` one, since a rule that is not
 *    there declares nothing either. Both name `bright`.
 *  · Remove the `!important` from `.vf-tc-brand` → **1 fails**, naming `brand`.
 *    That flag is load-bearing rather than lazy: page-scoped ports like
 *    `.vf-client-overview .vf-split__title` (0,2,0) outrank a bare `.vf-tc-*`
 *    (0,1,0), so without it the editor's choice loses to a rule they cannot see.
 *  · The token assertion needed no deliberate break — **it failed on its first
 *    run**, because `--text-dark` and `--text-mid` are declared as
 *    `var(--text-dark-base)` rather than as hexes. That alias is the mechanism
 *    the dark-band flip depends on, so the guard learned to follow one hop
 *    rather than the CSS being flattened to satisfy it. Recorded because the
 *    tempting "fix" was the damaging one.
 */

const CSS = readFileSync(join(process.cwd(), 'src/app/(frontend)/globals.css'), 'utf8')

/**
 * `globals.css` with every comment blanked out, the same length byte for byte so
 * nothing else shifts.
 *
 * Every structural search in this file reads THIS, not `CSS`. Three separate
 * measurements here have already been fooled by CSS-shaped text inside a
 * comment, each of them silently:
 *
 *  · the file's first `:root` is in a comment in `@theme`, 29 lines above the
 *    real one;
 *  · the first `}` after `--radius` is the one in `body { font-size }`, also in
 *    a comment, and 57 lines short of where `:root` actually closes. Between
 *    them those two made `--form-error`, `--callout-success` and
 *    `--callout-warning` read as "not declared in :root" while sitting plainly
 *    in it — unnoticed because no palette entry resolved through them until the
 *    status colours were added;
 *  · the comment introducing the on-dark re-points quotes
 *    `.vf-section--primary .vf-accent`, which was enough to make that rule look
 *    like a second `.vf-tc-* .vf-accent` list and blank out the real one.
 *
 * Blanking once, up front, is cheaper than making each regex comment-aware.
 */
const CSS_CODE = CSS.replace(/\/\*[\s\S]*?\*\//g, (m) => ' '.repeat(m.length))

/**
 * The `:root` block that opens the file, where the brand tokens are declared.
 * Anchored at a line start, and closed on the first `}` at column 0 — this
 * file's convention for the end of a top-level rule.
 */
const ROOT_BLOCK = (() => {
  const start = CSS_CODE.search(/^:root\s*\{/m)
  return CSS_CODE.slice(start, CSS_CODE.indexOf('\n}', start))
})()

const ruleFor = (key: string): string | null => {
  // The bare class only — `.vf-tc-x {`, never `.vf-on-dark .vf-tc-x {` or
  // `.vf-tc-x .vf-accent {`, both of which would satisfy a substring search
  // while the colour itself went undeclared.
  const match = CSS_CODE.match(new RegExp(`(^|\\n)\\.vf-tc-${key}\\s*\\{([^}]*)\\}`))
  return match ? match[2]! : null
}

describe('the brand text-colour palette', () => {
  it('offers something to pick', () => {
    // A positive control: every assertion below iterates the palette, and an
    // empty palette would satisfy all of them vacuously.
    expect(BRAND_TEXT_COLORS.length).toBeGreaterThan(0)
  })

  it('the :root slice really is the whole :root block', () => {
    // Standing instruction 1: assume the instrument is lying. Every token
    // assertion below reads ROOT_BLOCK, so a mis-sliced block produces confident
    // wrong answers in both directions — a token that IS declared reading as
    // missing, or a value read from the wrong block entirely.
    expect(ROOT_BLOCK.startsWith(':root')).toBe(true)
    expect(ROOT_BLOCK, 'the slice misses the top of :root').toContain('--primary:')
    expect(ROOT_BLOCK, 'the slice stops short of the bottom of :root').toContain('--vf-text-scale:')
    expect(ROOT_BLOCK, 'the slice ran past :root into @theme').not.toContain('--breakpoint-sm')
  })

  it('the band-following flag and the ordering agree', () => {
    // Two ways of saying the same thing — the flag the renderer and the browser
    // guard read, and the position this file has always asserted. Kept in step
    // here so neither can be changed alone.
    const flagged = BRAND_TEXT_COLORS.filter((c) => c.followsBand).map((c) => c.key)
    expect(flagged).toEqual(BRAND_TEXT_COLORS.slice(-2).map((c) => c.key))
    expect(flagged).toEqual(['heading', 'body'])
  })

  it('keeps the two band-following colours at the end of the list', () => {
    // `heading` and `body` resolve to the colours the text already is on a light
    // band — measured, Default and "Follows the band — heading" both compute
    // rgb(65, 64, 66) on the homepage heading. They are useful (they flip on a
    // dark band) and they are indistinguishable from doing nothing where an
    // editor is usually looking, so they must not sit at the top of the dropdown
    // directly under "Default". That is exactly what happened: the first thing
    // tried was the first thing offered, nothing changed, and a working control
    // was reported broken.
    //
    // The e2e in `richTextRender.e2e.spec.ts` excuses these two by name when it
    // asserts every colour visibly differs; this keeps the two lists talking
    // about the same entries.
    expect(BRAND_TEXT_COLORS.slice(-2).map((c) => c.key)).toEqual(['heading', 'body'])
    expect(
      BRAND_TEXT_COLORS.slice(0, -2).map((c) => c.key),
      'a band-following colour has moved up the list',
    ).not.toContain('heading')
  })

  it.each(BRAND_TEXT_COLORS.map((c) => [c.key, c] as const))(
    'every palette colour has a rule: %s',
    (key, colour) => {
      const rule = ruleFor(key)
      expect(rule, `globals.css has no \`.vf-tc-${key}\` rule`).not.toBeNull()
      expect(rule, `\`.vf-tc-${key}\` should resolve through ${colour.token}`).toContain(
        `var(${colour.token})`,
      )
    },
  )

  it.each(BRAND_TEXT_COLORS.map((c) => [c.key, c] as const))(
    'every rule states its colour as an explicit choice: %s',
    (key) => {
      expect(
        ruleFor(key),
        `\`.vf-tc-${key}\` must win over page-scoped rules an editor cannot see`,
      ).toContain('!important')
    },
  )

  /**
   * Resolve one level of aliasing. `--text-dark` is declared as
   * `var(--text-dark-base)` rather than as a hex, and that indirection is
   * load-bearing rather than incidental: `.vf-on-dark` re-points `--text-dark`
   * to the on-dark scale, and `.vf-on-light` restores it from the `-base` pair.
   * A guard that demanded a literal would have been "fixed" by flattening the
   * alias, which would break the light-card-inside-a-dark-band case.
   */
  const resolveToken = (token: string): string | undefined => {
    const declared = ROOT_BLOCK.match(new RegExp(`${token}:\\s*([^;]+);`))?.[1]?.trim()
    const alias = declared?.match(/^var\((--[a-z0-9-]+)\)$/)?.[1]
    return alias ? resolveToken(alias) : declared
  }

  it.each(BRAND_TEXT_COLORS.map((c) => [c.token, c] as const))(
    'every token is defined in :root with the fallback the palette records: %s',
    (token, colour) => {
      expect(ROOT_BLOCK, `${token} is not declared in :root`).toContain(`${token}:`)
      const declared = resolveToken(token)
      expect(
        declared,
        `${token} resolves to \`${declared}\` in :root but the palette records \`${colour.fallback}\``,
      ).toContain(colour.fallback)
    },
  )

  it.each(
    BRAND_TEXT_COLORS.filter((c) => c.onDarkToken).map((c) => [c.key, c.onDarkToken!] as const),
  )('a colour that would vanish on a dark band re-points: %s', (key, onDarkToken) => {
    const match = CSS_CODE.match(new RegExp(`\\.vf-on-dark \\.vf-tc-${key}[^{]*\\{([^}]*)\\}`))
    expect(match?.[1], `no \`.vf-on-dark .vf-tc-${key}\` rule`).toBeTruthy()
    expect(match![1]).toContain(`var(${onDarkToken})`)
  })

  /**
   * The two `.vf-tc-* .vf-accent` selector lists, found by what they DECLARE
   * plus the presence of `.vf-tc-` — never by looking for one key, which is the
   * search that would have been satisfied by `.vf-tc--inline .vf-accent` further
   * down the file while the real list stayed short.
   *
   * Why this is guarded at all: a `[[bracketed]]` phrase inside a coloured
   * element keeps the brand accent, and the on-dark list is what stops that
   * accent staying brand blue on a dark band. Measured for a key left out of it:
   * `var(--primary)` #1c75bc on --band-dark #414042 is **2.12:1**. It looks
   * correct in the admin and is unreadable on the page, which is why no amount
   * of checking the light list would have found it.
   */
  const accentListFor = (colourVar: string): string => {
    const rules = CSS_CODE.match(/[^{}]*\.vf-accent[^{}]*\{[^}]*\}/g) ?? []
    const hits = rules.filter(
      (r) => r.includes('.vf-tc-') && r.includes(`color: var(${colourVar})`),
    )
    return hits.length === 1 ? hits[0]! : ''
  }
  const ACCENT_LIGHT = accentListFor('--primary')
  const ACCENT_DARK = accentListFor('--accent-on-dark')

  it('there is exactly one .vf-tc-* accent list per band', () => {
    // Positive control for the two it.each blocks below: if either lookup found
    // nothing (or found two rules and gave up), every membership assertion would
    // fail with a confusing message instead of this clear one.
    expect(ACCENT_LIGHT, 'no single .vf-tc-* .vf-accent rule declaring var(--primary)').not.toBe('')
    expect(
      ACCENT_DARK,
      'no single .vf-on-dark .vf-tc-* .vf-accent rule declaring var(--accent-on-dark)',
    ).not.toBe('')
  })

  it.each(BRAND_TEXT_COLORS.map((c) => c.key))(
    'a [[bracketed]] phrase inside it keeps the accent on a light band: %s',
    (key) => {
      expect(ACCENT_LIGHT, `\`.vf-tc-${key} .vf-accent\` is missing from the light accent list`)
        .toContain(`.vf-tc-${key} .vf-accent`)
    },
  )

  it.each(BRAND_TEXT_COLORS.map((c) => c.key))(
    'a [[bracketed]] phrase inside it keeps the accent on a dark band: %s',
    (key) => {
      expect(
        ACCENT_DARK,
        `\`.vf-on-dark .vf-tc-${key} .vf-accent\` is missing — a bracket inside this colour renders brand blue on a dark band, at 2.12:1`,
      ).toContain(`.vf-on-dark .vf-tc-${key} .vf-accent`)
    },
  )
})

/**
 * The toolbar swatch and the block-level select are two controls over one
 * palette, and they fail in different directions. The select is guarded above by
 * its CSS. The swatch has a second way to go wrong that no CSS check can see:
 * its colours are literal hexes, because the admin has no `--primary` token to
 * resolve — `brandColorStyle()` puts the brand tokens on `<html>` in the
 * front-end layout only. So the editor's preview can drift from the page while
 * every rule in globals.css stays correct, and an editor picks "Brand blue",
 * sees one blue in the box and a different one on the site.
 *
 * The break, run: change `--primary` in globals.css to `#1c75bd` → the palette's
 * own token assertion above goes red first, which is what stops the swatch and
 * the page separating. Change `colour.fallback` to `colour.token` in
 * `richTextColorFeature.ts` → "every swatch paints the palette's colour" fails,
 * naming `brand`, because `var(--primary)` is not a colour the admin can resolve.
 */
describe('the toolbar colour swatches', () => {
  const swatches = brandTextColorFeature().serverFeatureProps.state.color

  it('offers exactly the palette — no more, no fewer', () => {
    // Both directions matter. A key here with no CSS rule is a swatch that does
    // nothing on the page; a palette entry missing here is a colour the select
    // offers and the toolbar does not, for no reason an editor could guess.
    expect(Object.keys(swatches).sort()).toEqual(BRAND_TEXT_COLORS.map((c) => c.key).sort())
  })

  it.each(BRAND_TEXT_COLORS.map((c) => [c.key, c] as const))(
    'every swatch paints the palette’s colour: %s',
    (key, colour) => {
      expect(swatches[key]?.css?.color, `swatch ${key} should preview ${colour.fallback}`).toBe(
        colour.fallback,
      )
      expect(swatches[key]?.label).toBe(colour.label)
    },
  )

  it('keeps White legible in the editor', () => {
    // White on the admin's white background is an invisible swatch and, once
    // applied, text that looks deleted. The outline is admin-only — the page
    // renders `.vf-tc-white` with no shadow.
    expect(swatches.white?.css?.['text-shadow']).toBeTruthy()
  })
})

describe('colorClass', () => {
  it('emits a class for a real palette key', () => {
    expect(colorClass('brand')).toBe('vf-tc-brand')
  })

  it('emits nothing for absent, inherit, or a retired colour', () => {
    // Degrading to the design's own colour is the point: content coloured with a
    // key that is later removed keeps rendering, just uncoloured. Emitting
    // `vf-tc-undefined` would leave a class in the HTML that nothing paints.
    expect(colorClass(null)).toBeUndefined()
    expect(colorClass(undefined)).toBeUndefined()
    expect(colorClass(INHERIT_COLOR)).toBeUndefined()
    expect(colorClass('galaxy')).toBeUndefined()
  })
})

describe('textColorField', () => {
  it('defaults to inherit, so adding the control to a block moves nothing', () => {
    const field = textColorField() as { defaultValue?: string; options?: { value: string }[] }
    expect(field.defaultValue).toBe(INHERIT_COLOR)
    expect(field.options?.[0]?.value).toBe(INHERIT_COLOR)
  })

  it('offers exactly the palette, plus the default', () => {
    const field = textColorField() as { options?: { value: string }[] }
    expect(field.options?.map((o) => o.value)).toEqual([
      INHERIT_COLOR,
      ...BRAND_TEXT_COLORS.map((c) => c.key),
    ])
  })
})

describe('ON_DARK_SELECTORS', () => {
  /**
   * One list, two consumers.
   *
   * `.vf-tc-*`'s dark re-points are hand-written in globals.css; the per-icon
   * default colours the layout publishes (`iconDefaultCss`) are generated in TS
   * and cannot inherit them, because they are keyed by `[data-vf-icon]` rather
   * than by class. So the same three selectors are needed in both places — and
   * "two lists that must name the same things" is the drift this repo keeps
   * recording.
   *
   * This ties them together: the constant is what generates the icon rules, and
   * globals.css must use exactly it for `.vf-tc-*`.
   *
   * Proven red by: dropping `.vf-section--dark` from ON_DARK_SELECTORS, and by
   * adding a fourth selector that globals.css does not use.
   */
  it('is exactly what globals.css uses to re-point .vf-tc-*', () => {
    // Every prefix that appears before a `.vf-tc-` class in a descendant rule.
    const used = new Set<string>()
    for (const m of CSS.matchAll(/(\.[a-z0-9-]+)\s+\.vf-tc-[a-z]+(?![a-z-])/g)) {
      used.add(m[1])
    }

    // Positive control: the scan must find prefixes at all, or the comparison
    // below is between two empty sets and proves nothing.
    expect(used.size, 'found no `.x .vf-tc-*` rules — the scan is not matching').toBeGreaterThan(0)

    expect(
      [...used].sort(),
      'globals.css re-points .vf-tc-* through selectors ON_DARK_SELECTORS does not name (or vice versa) — the icon default colours will disagree with the text palette on a dark band',
    ).toEqual([...ON_DARK_SELECTORS].sort())
  })
})
