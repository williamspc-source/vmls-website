import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

import { describe, it, expect } from 'vitest'

import { ACCREDITATION_ICON, qualificationIcon } from '@/utilities/qualificationIcon'
import { iconMap } from '@/components/Icon'

const PROFILES = path.resolve(process.cwd(), '.design-reference/specialists/profiles')

/**
 * Every qualification/accreditation string in the design reference, paired with
 * the icon the reference draws beside it.
 *
 * This is the ground truth the classifier exists to reproduce. Extracting it here
 * rather than pasting a table means the test re-derives it from the reference on
 * every run — a table copied into a test can only ever prove that the copy still
 * matches itself.
 */
const referencePairs = (): Map<string, string> => {
  const pairs = new Map<string, string>()
  for (const file of readdirSync(PROFILES).filter((f) => f.endsWith('.html'))) {
    const html = readFileSync(path.join(PROFILES, file), 'utf8')
    for (const m of html.matchAll(
      /<i class="ph-duotone ph-([a-z-]+) profile-qual-icon"><\/i>\s*([^<]+)/g,
    )) {
      pairs.set(m[2].trim().toUpperCase(), m[1])
    }
  }
  return pairs
}

describe('qualificationIcon', () => {
  /**
   * The guard that matters. Every specialist profile rendered the SAME `medal`
   * icon on every qualification, because the per-row icon field was never
   * written and the fallback was a flat literal. The fix is a classifier, and a
   * classifier is only worth anything if it reproduces the design it claims to.
   *
   * Proven to go red: changing the `certificate` branch to return
   * 'graduation-cap' fails with 8 mismatches; dropping `fracds` from the medal
   * list fails with 1 ("FRACDS (OMS) RACDS"), which is the case that a
   * sensible-looking earlier version of the rule got wrong.
   */
  it('reproduces the design reference icon for every qualification it lists', () => {
    const pairs = referencePairs()
    // A positive control: if the extraction silently stopped matching (a markup
    // change, a moved directory), an empty corpus would make this test pass
    // while proving nothing.
    expect(pairs.size).toBeGreaterThan(80)

    const wrong: string[] = []
    for (const [text, icon] of pairs) {
      const got = icon === ACCREDITATION_ICON ? ACCREDITATION_ICON : qualificationIcon(text)
      if (got !== icon) wrong.push(`${text} → expected ${icon}, got ${got}`)
    }
    expect(wrong).toEqual([])
  })

  it('only ever returns icons that exist in the registry', () => {
    const names = ['MBBS (Hons)', 'Fellow, Royal Australasian College of Surgeons', 'LDS', '']
    for (const n of names) expect(iconMap).toHaveProperty(qualificationIcon(n))
    expect(iconMap).toHaveProperty(ACCREDITATION_ICON)
  })

  it('falls back to a degree icon for text it cannot classify', () => {
    expect(qualificationIcon('Something Entirely Novel')).toBe('graduation-cap')
    expect(qualificationIcon(null)).toBe('graduation-cap')
  })
})
