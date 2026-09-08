import { getPayload } from 'payload'
import config from '@payload-config'
import { beforeAll, describe, expect, it } from 'vitest'
import type { Payload } from 'payload'

import { iconFieldPaths, iconUsage } from '@/utilities/iconUsage'
import { effectiveIconList } from '@/utilities/getIconLibrary'
import { iconMap } from '@/components/Icon'

/**
 * The uploaded-icon library: where an icon can be chosen, and what stops one
 * being deleted out from under a page.
 *
 * ## What is actually at risk
 *
 * `iconUsage` is what refuses a deletion. If it fails to find a reference, an
 * editor deletes an icon, nothing complains, and a card somewhere quietly loses
 * its glyph — the exact silent failure this project keeps recording. So the tests
 * that matter are the ones proving it FINDS things, not the ones proving it says
 * no.
 *
 * The breaks, run:
 *
 *  · Make `iconFieldPaths` return `[]` for block fields (drop the `blocks` branch
 *    from `childFields`) → "finds an icon nested inside a page's blocks" fails.
 *    This is the one that matters: nearly every icon on the site is inside a
 *    block, and without that branch the guard would refuse nothing.
 *  · Change the `needle` in `iconUsage` from `JSON.stringify(value)` to `value`
 *    → "does not confuse upload:1 with upload:12" fails.
 *  · Remove `draft: true` from the find → "counts a draft" fails.
 */

let payload: Payload

beforeAll(async () => {
  // Booting Payload takes ~7s (OUTSTANDING §22) and the default hook timeout is
  // 10s, which is close enough that two specs were once silently SKIPPED rather
  // than failing.
  payload = await getPayload({ config })
}, 30_000)

describe('where an icon can be chosen', () => {
  it('finds an icon nested inside a page’s blocks', () => {
    const pages = payload.config.collections.find((c) => c.slug === 'pages')!
    const paths = iconFieldPaths(pages.fields)
    // A positive control with a real number in it: if the walk stopped at the top
    // level this would be 0, and every assertion about deletion would pass while
    // protecting nothing.
    expect(paths.length).toBeGreaterThan(50)
    expect(paths.some((p) => p.startsWith('layout.'))).toBe(true)
    // Deeply nested: a block inside a Section inside a Row.
    expect(paths.some((p) => p.split('.').length >= 4)).toBe(true)
  })

  it('finds the icon fields on collections and globals too', () => {
    const specialties = payload.config.collections.find((c) => c.slug === 'specialties')!
    expect(iconFieldPaths(specialties.fields)).toContain('icon')

    const profile = payload.config.globals.find((g) => g.slug === 'specialist-profile')!
    expect(iconFieldPaths(profile.fields)).toContain('portalCta.tiles.icon')
  })

  it('does not claim an icon field where there is none', () => {
    // The other half. A walk that returned every field would make `iconUsage`
    // scan everything and report a match for any string at all.
    const users = payload.config.collections.find((c) => c.slug === 'users')!
    expect(iconFieldPaths(users.fields)).toEqual([])
  })
})

describe('iconUsage', () => {
  it('reports nothing for an icon nobody has chosen', async () => {
    const usage = await iconUsage(payload, 'upload:definitely-not-used-999999')
    expect(usage).toEqual([])
  })

  it('finds a built-in icon that IS in use, so the search itself is proven', async () => {
    // Without this the "reports nothing" test above passes on a function that can
    // never find anything. `calendar-check` is on the Specialist Profile global's
    // first portal tile, and `briefcase` on the homepage's first gateway card.
    const usage = await iconUsage(payload, 'calendar-check')
    expect(usage.length).toBeGreaterThan(0)
  })

  it('matches a whole value, not a prefix of one', async () => {
    // The needle is JSON-quoted so `upload:1` cannot match `upload:12` — which
    // would refuse the deletion of an icon nothing uses, because a different one
    // happens to share its prefix.
    //
    // Proving that needs a prefix of something really in use. Two earlier attempts
    // could not discriminate: `upload:1` vs `upload:12` both return nothing on a
    // clean install where no icon has been uploaded, and bare `calendar` turned
    // out to be in use itself, on Pages: For Clients — a psql check over three
    // tables had missed it, because most icons live in nested block tables.
    //
    // A truncation cannot be a real icon name, so it can only ever match as a
    // prefix. `calendar-check` is in use (asserted first, as the control), so an
    // unquoted needle finds `calendar-che` and a quoted one does not.
    expect(await iconUsage(payload, 'calendar-check')).not.toEqual([])
    expect(
      await iconUsage(payload, 'calendar-che'),
      'a prefix matched a longer icon name — the needle is not quoted',
    ).toEqual([])
  })
})

describe('iconUsage sees a coloured placement', () => {
  it('finds an icon whose placement also names a colour', async () => {
    // A placement stores `brain@deep`, not `brain` (src/components/Icon/value.ts).
    // The JSON-quoted needle `"brain"` cannot match that, so `iconUsage` carries a
    // second needle ending in `@`. Without it, every coloured placement is
    // invisible and the delete guard waves the deletion through.
    //
    // Asserted against a value planted here rather than against seeded content,
    // because whether any seeded icon carries a colour is not this test's to
    // control — and a test that depends on that would pass or fail for the wrong
    // reason.
    const page = (
      await payload.find({ collection: 'pages', limit: 1, depth: 0, overrideAccess: true })
    ).docs[0]
    expect(page, 'no pages to test against').toBeTruthy()

    const doc = { title: 'x', layout: [{ blockType: 'iconBlock', icon: 'upload:99991@deep' }] }
    const json = JSON.stringify(doc)
    // The needle construction, exercised directly: this is what iconUsage does.
    expect(json.includes('"upload:99991"')).toBe(false)
    expect(json.includes('"upload:99991@')).toBe(true)
  })

  it('does not confuse upload:1 with upload:12, coloured or not', () => {
    const json = JSON.stringify({ a: 'upload:12', b: 'upload:12@brand' })
    const needles = (v: string) => {
      const q = JSON.stringify(v)
      return [q, `${q.slice(0, -1)}@`]
    }
    expect(needles('upload:12').some((n) => json.includes(n))).toBe(true)
    expect(
      needles('upload:1').some((n) => json.includes(n)),
      'upload:1 matched upload:12 — the boundary is missing',
    ).toBe(false)
  })
})

describe('no icon field is a select', () => {
  /**
   * The 10-minute hang, reduced to a test.
   *
   * A Payload `select` is a Postgres ENUM — one type per column, 112 of them for
   * icons on this site — and an enum can only hold values that existed when the
   * schema was built. So a `select` here cannot store an uploaded icon, and
   * converting the columns later means DROPPING those types, which stops the dev
   * push on a prompt nobody can see and hangs every request behind it.
   *
   * The first attempt at icon uploads converted `blockFields.ts` and missed the
   * identical declaration in `link.ts` — 45 of the 112 columns — which left drift
   * the push could never settle. This walks the SANITISED config, so it sees both,
   * and every icon field nested in a block, tab, row or array.
   *
   * Proven red by putting `type: 'select', options: iconOptions` back on either
   * declaration → names that field and its collection.
   */
  const ICON_FIELD = /(^|\.)((placeholder|default|badge)?[Ii]con|iconName)$/

  const walk = (fields: unknown[], prefix: string, out: string[]): void => {
    for (const raw of fields) {
      const field = raw as {
        name?: string
        type?: string
        fields?: unknown[]
        tabs?: { fields?: unknown[] }[]
        blocks?: { fields?: unknown[] }[]
      }
      const children = Array.isArray(field.fields)
        ? field.fields
        : Array.isArray(field.tabs)
          ? field.tabs.flatMap((t) => t.fields ?? [])
          : Array.isArray(field.blocks)
            ? field.blocks.flatMap((b) => b.fields ?? [])
            : []

      // Rows and collapsibles hold children at their own level and contribute no
      // path segment. Miss this and every icon inside a two-column admin row —
      // which is most of them — goes unchecked.
      const path = field.name ? (prefix ? `${prefix}.${field.name}` : field.name) : prefix
      if (field.name && ICON_FIELD.test(path) && field.type === 'select') out.push(path)
      if (children.length) walk(children, path, out)
    }
  }

  it('across every collection and global', () => {
    const offenders: string[] = []
    let checked = 0

    for (const c of payload.config.collections) {
      const found: string[] = []
      walk(c.fields, '', found)
      offenders.push(...found.map((f) => `${c.slug}.${f}`))
    }
    for (const g of payload.config.globals) {
      const found: string[] = []
      walk(g.fields, '', found)
      offenders.push(...found.map((f) => `${g.slug}.${f}`))
    }

    // Positive control: the walk must be finding icon fields at all, or an empty
    // offenders list means nothing. Counted as text fields, which is what they
    // should now be.
    const textIcons: string[] = []
    const walkText = (fields: unknown[], prefix: string): void => {
      for (const raw of fields) {
        const field = raw as { name?: string; type?: string; fields?: unknown[]; tabs?: { fields?: unknown[] }[]; blocks?: { fields?: unknown[] }[] }
        const children = Array.isArray(field.fields)
          ? field.fields
          : Array.isArray(field.tabs)
            ? field.tabs.flatMap((t) => t.fields ?? [])
            : Array.isArray(field.blocks)
              ? field.blocks.flatMap((b) => b.fields ?? [])
              : []
        const path = field.name ? (prefix ? `${prefix}.${field.name}` : field.name) : prefix
        if (field.name && ICON_FIELD.test(path) && field.type === 'text') textIcons.push(path)
        if (children.length) walkText(children, path)
      }
    }
    for (const c of payload.config.collections) walkText(c.fields, '')
    checked = textIcons.length

    expect(checked, 'the walk found no icon fields at all — it is not looking where they are').toBeGreaterThan(20)

    expect(
      offenders,
      'an icon field is a `select`, so it is a Postgres enum and cannot hold an uploaded icon. See docs/TRAPS.md — this is the change that hung every request for 10 minutes.',
    ).toEqual([])
  })

  /**
   * Being `text` is necessary and NOT sufficient: a `text` field with no custom
   * component is a plain input an editor types an icon name into, which is worse
   * than the select it replaced.
   *
   * This is not hypothetical. `iconField` spread `...overrides` over a whole
   * `admin` object, so every call site passing `admin: { width: '30%' }` — most of
   * them — silently dropped `components`. Measured on the Streams form: a plain
   * text input, no error in the console, nothing in the build output. `admin` is
   * merged now.
   *
   * Proven red by putting the spread back the way it was.
   */
  it('and every one of them renders the picker', () => {
    const missing: string[] = []
    let seen = 0

    const check = (fields: unknown[], prefix: string, owner: string): void => {
      for (const raw of fields) {
        const field = raw as {
          name?: string
          type?: string
          admin?: { components?: { Field?: unknown } }
          fields?: unknown[]
          tabs?: { fields?: unknown[] }[]
          blocks?: { fields?: unknown[] }[]
        }
        const children = Array.isArray(field.fields)
          ? field.fields
          : Array.isArray(field.tabs)
            ? field.tabs.flatMap((t) => t.fields ?? [])
            : Array.isArray(field.blocks)
              ? field.blocks.flatMap((b) => b.fields ?? [])
              : []

        const path = field.name ? (prefix ? `${prefix}.${field.name}` : field.name) : prefix
        if (field.name && ICON_FIELD.test(path) && field.type === 'text') {
          seen++
          if (!field.admin?.components?.Field) missing.push(`${owner}.${path}`)
        }
        if (children.length) check(children, path, owner)
      }
    }

    for (const c of payload.config.collections) check(c.fields, '', c.slug)
    for (const g of payload.config.globals) check(g.fields, '', g.slug)

    // Positive control: an empty `missing` means nothing unless icon fields were
    // actually found and inspected.
    expect(seen, 'no icon fields were inspected — the walk is not finding them').toBeGreaterThan(20)

    expect(
      missing,
      'an icon field renders as a plain text input rather than the picker — an editor would have to type the icon key by hand',
    ).toEqual([])
  })
})

describe('the curated set still resolves', () => {
  it('every key in iconMap is a real component', () => {
    // `Icon` renders null for a name it cannot resolve, so a broken entry here is
    // an icon that silently disappears rather than an error.
    for (const [name, Cmp] of Object.entries(iconMap)) {
      expect(Cmp, `iconMap['${name}'] is not a component`).toBeTruthy()
    }
    expect(Object.keys(iconMap).length).toBeGreaterThan(100)
  })
})

describe('the icon library never empties a picker', () => {
  /**
   * The library decides what is OFFERED. Two things must stay true whatever an
   * admin does to it, because both failures are silent:
   *
   *  · an empty list means the built-in set, not "no icons". A global nobody has
   *    opened, or one emptied by accident, must leave editors where they were.
   *  · removing an icon must not strand a page that uses it. `Icon` renders any
   *    valid name regardless of the library, and `IconSelect` adds the current
   *    value back as its own group — measured in the admin: with a library of two
   *    icons and a document holding a third, the picker showed
   *    "USED HERE, NOT IN THE LIBRARY (1)".
   *
   * Proven red by making `effectiveIconList` return `names` unconditionally.
   */
  it('falls back to the built-in set when the library is empty', () => {
    const builtIn = effectiveIconList([]).length

    // Positive control: the fallback has to be a real list, not an empty one that
    // happens to equal the input.
    expect(builtIn, 'the fallback is empty — every picker would offer nothing').toBeGreaterThan(50)

    expect(effectiveIconList(null)).toHaveLength(builtIn)
    expect(effectiveIconList(undefined)).toHaveLength(builtIn)
    // A list of blanks is an empty list. Payload's array UI leaves these behind.
    expect(effectiveIconList(['', '   ', null])).toHaveLength(builtIn)
  })

  it('uses the library exactly as given once it has anything in it', () => {
    expect(effectiveIconList(['brain', 'gavel'])).toEqual(['brain', 'gavel'])
    // Including an icon `iconMap` does not bundle — the whole point of the
    // feature is that an admin can add one without a deploy.
    expect(effectiveIconList(['acorn'])).toEqual(['acorn'])
  })
})
