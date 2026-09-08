import { describe, expect, it } from 'vitest'

import { formatIconValue, isUploadedIcon, parseIconValue } from '@/components/Icon/value'
import { BRAND_TEXT_COLORS, INHERIT_COLOR, colorClass } from '@/fields/richTextColors'

/**
 * The one place an icon field's stored value is interpreted.
 *
 * ## Why this is worth a spec of its own
 *
 * The colour rides in the value (`brain@deep`) rather than in a second column,
 * so this parser stands between every stored icon and what renders. Two failure
 * directions matter, and only one of them is loud:
 *
 *  · reading a colour that is not there — loud, the icon disappears;
 *  · **cutting an icon key at an `@` that was never a colour** — silent, and it
 *    would corrupt values wholesale.
 *
 * The second is why a suffix is only honoured when it names a colour the palette
 * actually has.
 *
 * ## Proven red by
 *
 *  · dropping the `BRAND_TEXT_COLORS.some(...)` check in `parseIconValue`
 *    → "leaves an unknown suffix alone" fails
 *  · using `indexOf('@')` instead of `lastIndexOf`
 *    → nothing here fails today, which is recorded rather than hidden: no icon
 *      key contains an `@`, so the two agree. The last-`@` rule is chosen for
 *      what it does to a future key, not for a case that exists now.
 *  · returning the raw suffix from `formatIconValue` without validating it
 *    → "never writes a colour the palette does not have" fails
 */

describe('parseIconValue', () => {
  it('reads a bare curated name — the form every existing value takes', () => {
    expect(parseIconValue('brain')).toEqual({ key: 'brain', colour: null, uploadId: null })
  })

  it('splits a colour suffix off', () => {
    expect(parseIconValue('brain@deep')).toEqual({ key: 'brain', colour: 'deep', uploadId: null })
  })

  it('reads an upload, with and without a colour', () => {
    expect(parseIconValue('upload:12')).toEqual({
      key: 'upload:12',
      colour: null,
      uploadId: '12',
    })
    expect(parseIconValue('upload:12@white')).toEqual({
      key: 'upload:12',
      colour: 'white',
      uploadId: '12',
    })
  })

  it('leaves an unknown suffix alone rather than cutting the key', () => {
    // The silent-corruption direction. `@nonsense` is not a colour, so the whole
    // string stays the key — which renders nothing, rather than rendering the
    // WRONG icon called `weird`.
    expect(parseIconValue('weird@nonsense')).toEqual({
      key: 'weird@nonsense',
      colour: null,
      uploadId: null,
    })
  })

  it('treats a retired colour as no colour', () => {
    // A key removed from the palette must degrade to "follows the band", not to a
    // `.vf-tc-undefined` class. `colorClass` is the other half of that contract.
    const parsed = parseIconValue('brain@somethingretired')
    expect(parsed?.colour).toBeNull()
    expect(colorClass('somethingretired')).toBeUndefined()
  })

  it('returns null for nothing at all', () => {
    expect(parseIconValue(null)).toBeNull()
    expect(parseIconValue('')).toBeNull()
    expect(parseIconValue(undefined)).toBeNull()
  })

  it('does not read a leading @ as a colour', () => {
    // `lastIndexOf('@') > 0`, not `>= 0` — otherwise `@brand` parses to an empty
    // key, which is an icon that silently is not there.
    expect(parseIconValue('@brand')?.key).toBe('@brand')
  })
})

describe('formatIconValue', () => {
  it('round-trips every palette colour', () => {
    for (const c of BRAND_TEXT_COLORS) {
      const stored = formatIconValue('brain', c.key)
      expect(stored).toBe(`brain@${c.key}`)
      expect(parseIconValue(stored)).toEqual({ key: 'brain', colour: c.key, uploadId: null })
    }
  })

  it('writes a bare key for "follows the band"', () => {
    // The no-op case, and the one that matters most: choosing the default must
    // store exactly what every icon stores today, or adding this control would
    // rewrite the whole site's values the first time anyone opened a block.
    expect(formatIconValue('brain', INHERIT_COLOR)).toBe('brain')
    expect(formatIconValue('brain', null)).toBe('brain')
    expect(formatIconValue('brain')).toBe('brain')
  })

  it('never writes a colour the palette does not have', () => {
    expect(formatIconValue('brain', 'chartreuse')).toBe('brain')
  })

  it('returns an empty string for no icon', () => {
    expect(formatIconValue('', 'deep')).toBe('')
  })
})

describe('isUploadedIcon', () => {
  it('tells the two tiers apart, coloured or not', () => {
    expect(isUploadedIcon('upload:4')).toBe(true)
    expect(isUploadedIcon('upload:4@brand')).toBe(true)
    expect(isUploadedIcon('brain')).toBe(false)
    expect(isUploadedIcon('brain@brand')).toBe(false)
    // `upload:` with no id is not an upload — it has nothing to fetch.
    expect(isUploadedIcon('upload:')).toBe(false)
  })
})
