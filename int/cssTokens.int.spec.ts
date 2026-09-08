import { describe, expect, it } from 'vitest'

import {
  __tokenNames,
  buildTokenCss,
  safeTokenValue,
  safeUrlToken,
  stripStyleClose,
} from '@/utilities/cssTokens'
import type { DesignSystem } from '@/payload-types'

// Every brand-colour field filled, so __tokenNames reports the full name set.
const ALL_COLORS = {
  primary: '#111111',
  primaryStrong: '#111111',
  text: '#111111',
  mutedText: '#111111',
  accent: '#111111',
  border: '#111111',
  accentLight: '#111111',
  primaryDeep: '#111111',
  textOnDark: '#111111',
  mutedTextOnDark: '#111111',
  accentOnDark: '#111111',
  borderOnDark: '#111111',
  inkBlack: '#111111',
  inkCharcoal: '#111111',
  inkGrey: '#111111',
}

// Same for the Design System groups. Cast: this is a field-value fixture, not a
// full DesignSystem document (no id/updatedAt/createdAt).
const ALL_TOKENS = {
  typography: { headingFont: 'X', bodyFont: 'X', baseSize: '1rem' },
  spacing: { compact: '1px', normal: '1px', spacious: '1px', xl: '1px' },
  gaps: { tight: '1px', normal: '1px', wide: '1px' },
  headings: { sm: '1px', md: '1px', lg: '1px', xl: '1px', display: '1px' },
  text: { sm: '1px', base: '1px', lg: '1px' },
  radius: { sm: '1px', md: '1px' },
  bands: { muted: '#111', accent: '#111', primary: '#111', dark: '#111' },
  effects: {
    color: '#111',
    colorDeep: '#111',
    xs: '0 1px 1px #111',
    sm: '0 1px 1px #111',
    md: '0 1px 1px #111',
    lg: '0 1px 1px #111',
    xl: '0 1px 1px #111',
    xxl: '0 1px 1px #111',
    glowSm: '0 1px 1px #111',
    glowMd: '0 1px 1px #111',
    glowLg: '0 1px 1px #111',
    ring: '0 0 0 1px #111',
    insetHighlight: 'inset 0 1px 0 #111',
    hard: '1px 1px 0 #111',
  },
} as unknown as DesignSystem

describe('cssTokens', () => {
  it('keeps brand and design token names disjoint', () => {
    // The old implementation spread two objects together, so a name written by
    // both would have silently resolved to whichever spread came last. Keep the
    // sets disjoint and that class of bug cannot reappear.
    const { brand, design } = __tokenNames(ALL_COLORS, ALL_TOKENS)
    const overlap = brand.filter((name) => design.includes(name))
    expect(overlap).toEqual([])
  })

  it('sets the -base text/border vars, not the derived ones', () => {
    // globals.css derives --text-dark/--text-mid/--border from the -base vars,
    // and .vf-on-light restores from them. Writing the derived names meant a
    // brand edit silently reverted inside dark bands.
    const css = buildTokenCss({ text: '#abcdef', mutedText: '#123456', border: '#654321' }, null)
    expect(css).toContain('--text-dark-base:#abcdef')
    expect(css).toContain('--text-mid-base:#123456')
    expect(css).toContain('--border-base:#654321')
    expect(css).not.toContain('--text-dark:')
    expect(css).not.toContain('--text-mid:')
    expect(css).not.toContain('--border-light:')
  })

  it('emits a :root rule and nothing at all when empty', () => {
    expect(buildTokenCss({ primary: '#abcdef' }, null)).toBe(':root{--primary:#abcdef}')
    expect(buildTokenCss(null, null)).toBe('')
    expect(buildTokenCss({ primary: '   ' }, null)).toBe('')
  })

  it('accepts the real token shapes we ship', () => {
    // color-mix, var() indirection, gradients and multi-layer shadows all have
    // to survive the sanitiser or the defaults would silently win.
    for (const value of [
      'color-mix(in srgb, var(--primary) 13%, transparent)',
      'var(--primary)',
      'linear-gradient(135deg, #eef9ff 0%, #d9efff 100%)',
      'rgba(255,255,255,0.82)',
      'clamp(3.5rem, 8vw, 5.5rem)',
      '0 24px 60px rgba(43,74,98,0.13)',
    ]) {
      expect(safeTokenValue(value), value).toBe(value)
    }
  })

  it('rejects values that could break out of the <style> element', () => {
    for (const value of [
      '</style><script>alert(1)</script>',
      'red; --primary: blue',
      'red} body{display:none',
      'red/* comment */',
      'x'.repeat(201),
    ]) {
      expect(safeTokenValue(value), value).toBeNull()
    }
  })

  /**
   * `safeUrlToken` exists because a URL lands INSIDE `url("…")`, one level
   * deeper than a colour. `UNSAFE_TOKEN_VALUE` alone does not reject a quote or
   * a closing paren, so a filename containing either would end the CSS function
   * early and leave the remainder parsed as CSS.
   */
  it('wraps a media URL as a url() token', () => {
    expect(safeUrlToken('/api/media/file/shield.png')).toBe('url("/api/media/file/shield.png")')
    // Hyphens, spaces and a cache-busting query are all legitimate in real
    // filenames and must survive — rejecting them would silently fall back to
    // the bundled default and look like the upload did nothing.
    expect(safeUrlToken('/api/media/file/VERIFY Shield-2026.png?2026-08-13')).toBe(
      'url("/api/media/file/VERIFY Shield-2026.png?2026-08-13")',
    )
  })

  it('rejects a URL that could escape url("…")', () => {
    for (const value of [
      '/media/a".png',
      "/media/a'.png",
      '/media/a).png',
      '/media/a(.png',
      '/media/a\\.png',
      '/media/a.png</style>',
      '/media/' + 'x'.repeat(220),
      '',
      null,
    ]) {
      expect(safeUrlToken(value as string | null), String(value)).toBeNull()
    }
  })

  it('strips a style close tag from assembled CSS', () => {
    expect(stripStyleClose('a{}</style><b>')).toBe('a{}><b>')
    expect(stripStyleClose('a{}</STYLE >')).toBe('a{} >')
  })
})
