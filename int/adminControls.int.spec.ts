/**
 * Guards against admin controls that look editable but do nothing.
 *
 * These exist because nobody will be reviewing code after the handover, and the
 * audit that prompted them found ~118 verified cases of exactly these shapes.
 *
 * ── Every guard here must be provable ───────────────────────────────────────
 * An earlier version of this file carried the note "a crude test that runs is
 * worth more than an accurate one that rots". That licensed three patterns that
 * could not fail on the defect they named, and the suite was reported as
 * evidence the work was sound:
 *
 *   - Pattern B collected failures into an array it never wrote to.
 *   - Pattern C's regex omitted `appearance`, the only one of its three
 *     advertised props that anything actually violated.
 *   - Pattern A matched field names as bare words against one concatenated blob
 *     of the whole `src/` tree, so `hours`, `phone`, `email` and `address` — the
 *     exact orphans the audit had to find by hand — all passed coincidentally.
 *
 * So: **a guard that has never failed is not evidence.** Each pattern below
 * records the deliberate break that was used to prove it goes red. If you change
 * one, re-run its break and confirm it still fails, or you have replaced a guard
 * with a decoration.
 *
 *     zsh tests/int/prove-guards.sh
 *
 * applies each break in turn, checks the matching test goes red, and restores
 * every file it touched. All ten must report PASS (ten `run_case` invocations,
 * counted 2026-08-21 — it said five while running ten).
 *
 * When one of these fails, the fix is almost always to wire the control up. If it
 * genuinely should not be wired, add it to the allowlist WITH a reason.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'

import * as blockFields from '@/fields/blockFields'

const SRC = join(process.cwd(), 'src')
const BLOCKS = join(SRC, 'blocks')
const GLOBALS_CSS = readFileSync(join(SRC, 'app/(frontend)/globals.css'), 'utf8')

const rel = (f: string) => relative(process.cwd(), f)

/** Every `.ts`/`.tsx` under `dir`, recursively. */
const walkFiles = (dir: string, out: string[] = []): string[] => {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) walkFiles(full, out)
    else if (/\.tsx?$/.test(entry.name)) out.push(full)
  }
  return out
}

/**
 * Every field name a config declares — including the ones a helper names.
 *
 * `name: 'heading'` is the obvious form. It is no longer the only one: the
 * rich-text conversion moved ~300 fields to `inlineRichTextField('heading', …)`,
 * where the name is an argument rather than a property. A matcher that looks
 * only for `name:` therefore stopped seeing them — silently, and in the
 * direction that matters: the orphan-field guard simply had nothing to check,
 * so it went green on a config it was no longer reading. Found because a
 * deliberate break stopped going red.
 *
 * Keep this in step with the field factories in `src/fields/blockFields.ts`.
 */
const FIELD_NAME_PATTERNS = [
  /\bname:\s*'([a-zA-Z][\w]*)'/g,
  /\b(?:inlineRichTextField|richBodyField|spacingField|presetClassField|textColorField)\(\s*'([a-zA-Z][\w]*)'/g,
]

/**
 * Every field name a shared bundle contributes, read from the bundle itself.
 *
 * ── The hole this closes, measured ──────────────────────────────────────────
 * The patterns above scan a block's own `config.ts`. A block that writes
 * `...sectionHeaderFields` declares four fields whose names appear nowhere in
 * that file — they live in `src/fields/blockFields.ts` — so for all **26**
 * blocks using it, this guard was checking a set that did not include its
 * heading, its eyebrow, its subheading or its text colour.
 *
 * That is not hypothetical. `textColour` was declared, shown in the admin, saved
 * to Postgres, and read by **nothing**: `SectionHeader` takes a `colour` prop and
 * not one of the 26 components passed it. An editor could pick a colour on any
 * section heading on the site and watch nothing happen — the exact failure this
 * file exists to prevent — while every test here stayed green.
 *
 * Third instance of the same family. CLAUDE.md already records two: a field
 * whose name is common across configs (`icon`, `title`) can never be reported,
 * and one name serving two purposes in one component hides both. This one is
 * different in that the guard was not fooled by a coincidental match — it simply
 * never knew the field existed.
 *
 * Derived from the module rather than a hand-written table, so adding a field to
 * a bundle enrols it here with no second edit. Note the match is
 * `source.includes(name)`, which is deliberately loose: it also fires on
 * `sectionHeaderFieldsWithDefaults(…)` and on the local `const whyHeaderFields =`
 * aliases in CostGrid, MissionPillars and WhyVerify, all of which really do
 * contribute those fields. A stray mention in a comment would add a name to the
 * *declared* set, which makes this stricter rather than laxer — the safe
 * direction for a guard.
 */
const namesIn = (fields: unknown[]): string[] =>
  fields.flatMap((entry) => {
    const field = entry as { name?: string; fields?: unknown[] }
    if (typeof field?.name === 'string') return [field.name]
    // A `row` or `collapsible` holds its children at the same level as itself —
    // `spacingFields` is one row wrapping paddingTop/paddingBottom, so skipping
    // this would silently contribute nothing.
    return Array.isArray(field?.fields) ? namesIn(field.fields) : []
  })

const HELPER_BUNDLES: [string, string[]][] = Object.entries(blockFields)
  .filter(([, value]) => Array.isArray(value))
  .map(([name, value]) => [name, namesIn(value as unknown[])] as [string, string[]])
  // Option lists (`BACKGROUND_OPTIONS`, …) are arrays too, and contribute no
  // names — dropped so they cannot match a config by accident.
  .filter(([, names]) => names.length > 0)

const declaredFieldNames = (source: string): string[] => [
  ...FIELD_NAME_PATTERNS.flatMap((re) => [...source.matchAll(re)].map((m) => m[1]!)),
  ...HELPER_BUNDLES.filter(([name]) => source.includes(name)).flatMap(([, names]) => names),
]

const blockDirs = readdirSync(BLOCKS, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(BLOCKS, d.name, 'config.ts')))
  .map((d) => d.name)

/** Every source file in a block folder that could consume a field. */
const blockSources = (name: string): string => {
  const dir = join(BLOCKS, name)
  return readdirSync(dir)
    .filter((f) => /\.(tsx|ts)$/.test(f) && f !== 'config.ts')
    .map((f) => readFileSync(join(dir, f), 'utf8'))
    .join('\n')
}

/**
 * Does `haystack` actually *read* a field called `field`?
 *
 * Not a bare word-boundary match. `\bhours\b` is satisfied by a local variable, a
 * comment, a CSS class or an unrelated import, which is how four real orphans
 * passed. Require one of the shapes that genuinely reads a property:
 *
 *   doc.hours          member access
 *   doc?.hours         optional member access
 *   doc['hours']       computed access
 *   const { hours }    destructuring (start of pattern, or after a comma)
 *   { hours: renamed } destructuring with rename
 *   { hours = [] }     destructuring with default
 *   hours={...}        JSX prop being passed on
 *
 * ── Known false negative, measured ──────────────────────────────────────────
 * A JSX expression container holding a bare identifier — `href={hostEventUrl}` —
 * is textually identical to the `{ field }` destructuring shape, so it satisfies
 * this matcher without reading the property at all. Found by deliberately
 * breaking two new fields at once: `EventsSettings.labels.galleryHeading` was
 * caught, `Events.hostEventUrl` was not, because a local of the same name was
 * still being interpolated into JSX further down the file.
 *
 * Not tightened, because the two shapes are distinguishable only by whitespace
 * convention, and a matcher keyed on that would fail on formatting. Recorded so
 * the next person knows the guard is weakest where a field's value is copied
 * into an identically-named local — check those by hand.
 */
const readsField = (haystack: string, field: string): boolean => {
  const f = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(
    [
      `\\.\\s*${f}\\b`, // .field  /  ?.field
      `\\[\\s*['"\`]${f}['"\`]\\s*\\]`, // ['field']
      `[{,]\\s*${f}\\s*[,}:=]`, // { field } / { field: x } / { field = x }
      `\\b${f}=\\{`, // JSX: field={...}
    ].join('|'),
  ).test(haystack)
}

/**
 * Fields a block config declares but its components legitimately never name.
 * Each entry needs a reason — an unexplained entry is how a real dead control
 * gets normalised.
 */
const ALLOWED_UNREAD: Record<string, Record<string, string>> = {
  // Shared helpers are spread into the config and consumed by <Section>, which
  // receives them as props rather than by name inside the block component.
  '*': {
    anchorId: 'passed to <Section id>',
    background: 'passed to <Section background>',
    containerWidth: 'passed to <Section containerWidth>',
    motion: 'passed to <Section motion>',
    hoverEffect: 'passed to <Section hoverEffect>',
    shadow: 'passed to <Section shadow>',
    cssClass: 'applied via toClassName()',
    blockName: 'Payload built-in admin label',
  },
  // Per-block entries. This one was found by the bundle fix above, not by a
  // person: the block's own comment says "there is no subheading", and the field
  // arrived anyway because it is spread in with the header bundle. It is now
  // hidden with `admin.condition: () => false` in that block's config, which is
  // the other half of the invariant — read it, or do not offer it.
  SpecialistDirectory: {
    subheading: 'hidden by admin.condition — the filter panel has no subheading',
  },
}

describe('admin controls are wired', () => {
  /**
   * Pattern A — "field mounted, nobody reads it" (blocks).
   *
   * Proven red by: replacing `{item.text}` with `{null}` in
   * src/blocks/IconList/Component.tsx → reports `text` as unread.
   */
  it.each(blockDirs)('%s: every field name is read by the block components', (name) => {
    const config = readFileSync(join(BLOCKS, name, 'config.ts'), 'utf8')
    const src = blockSources(name)
    if (!src.trim()) return // config-only block (e.g. re-exported elsewhere)

    const declared = declaredFieldNames(config)
    const allowed = { ...ALLOWED_UNREAD['*'], ...(ALLOWED_UNREAD[name] ?? {}) }

    const unread = [...new Set(declared)].filter(
      (field) => !allowed[field] && !readsField(src, field),
    )

    expect(unread, `${name}: declared but never read — wire up or remove`).toEqual([])
  })

  /**
   * Pattern A, corollary — a field name that is a PREFIX of a field the component
   * already reads must not satisfy the guard.
   *
   * `PeopleGrid` declares `asmtType` (the filter) and reads `sp.assessmentTypes`
   * (the specialist's own tags) in the same file. The two now share no prefix at
   * all — the field was shortened because its foreign key overran Postgres's
   * 63-character limit — but the boundary this asserts is what made the ORIGINAL
   * singular/plural pair safe, and it is what any future rename must preserve. If
   * `readsField` matched on prefix, a filter named for its plural sibling would
   * look consumed no matter what
   * — the shape that makes `icon` and `title` permanently invisible to Pattern A,
   * and that let `Accreditations.icon` ship reading nothing.
   *
   * `\b` is what stops it, so this asserts the boundary directly rather than
   * trusting the block to keep its current spelling. Proven red by deleting the
   * `\b` from readsField's first alternative → the plural read satisfies the
   * singular field and the first assertion reports true.
   *
   * ── What this does NOT cover, measured ──
   * Pattern A cannot tell "read" from "destructured and then ignored". Deleting
   * the whole `asmtType` query from PeopleGrid/Component.tsx leaves the
   * `asmtType,` line in the props destructure, which satisfies the
   * `[{,] name [,}:=]` alternative — so **Pattern A stayed green on a genuinely
   * dead field**. `tsc --noEmit` also passed; ESLint reported it, but only as a
   * *warning*, and `pnpm lint` exits 0 on warnings, so `pnpm test` was green too.
   * The guard that actually goes red on that break is the /jme case in
   * `tests/e2e/specialistCarousels.e2e.spec.ts`. Widening Pattern A to require a
   * read beyond the destructure would touch every block and is deliberately not
   * attempted here; this note exists so the next person does not re-derive it.
   */
  it('readsField does not treat a plural read as reading the singular field', () => {
    expect(readsField('sp.assessmentTypes.map(t => t.id)', 'assessmentType')).toBe(false)
    expect(readsField('const { assessmentTypes } = doc', 'assessmentType')).toBe(false)
    // Positive control, in the two forms the field is genuinely read in: the props
    // destructure, and a member access. `if (asmtType)` on its own is NOT
    // one of readsField's four patterns — an earlier version of this control used
    // it, asserted true, and failed, which is the check working.
    expect(readsField('const { specialty, asmtType, department } = props', 'asmtType')).toBe(true)
    expect(readsField('block.asmtType', 'asmtType')).toBe(true)
  })

  /**
   * Pattern B — "the class an option names does not exist".
   *
   * The previous version declared a `missing` array, never pushed to it, and
   * asserted it was empty. Its only live assertions checked that a class *family*
   * had at least one rule anywhere — which says nothing about whether the specific
   * value an editor can pick has one.
   *
   * This resolves the actual option values from the field definitions and checks
   * each produced class individually.
   *
   * Proven red by: adding `{ label: 'Tilt', value: 'tilt' }` to
   * `hoverEffectField.options` in src/fields/blockFields.ts with no matching CSS
   * → reports `.vf-hover-tilt`.
   */
  it('every vf-* modifier class an option can produce exists in globals.css', () => {
    const blockFields = readFileSync(join(SRC, 'fields/blockFields.ts'), 'utf8')
    const section = readFileSync(join(SRC, 'components/Section/index.tsx'), 'utf8')

    /** Pull the `value:` list out of a named select field in blockFields.ts. */
    const optionValues = (fieldName: string): string[] => {
      const start = blockFields.indexOf(`name: '${fieldName}'`)
      expect(start, `blockFields.ts declares no field named '${fieldName}'`).toBeGreaterThan(-1)
      const optionsAt = blockFields.indexOf('options: [', start)
      const end = blockFields.indexOf(']', optionsAt)
      const body = blockFields.slice(optionsAt, end)
      const values = [...body.matchAll(/value:\s*'([a-z0-9-]+)'/g)].map((m) => m[1])
      expect(values.length, `could not parse options for '${fieldName}'`).toBeGreaterThan(0)
      return values
    }

    const missing: string[] = []

    // `vf-hover-<value>`: every value emits a class, including 'none'.
    for (const value of optionValues('hoverEffect')) {
      if (!new RegExp(`\\.vf-hover-${value}\\b`).test(GLOBALS_CSS)) {
        missing.push(`.vf-hover-${value} (hoverEffect option "${value}")`)
      }
    }

    // `vf-shadow-<value>`: 'default' deliberately emits nothing (see Section).
    for (const value of optionValues('shadow')) {
      if (value === 'default') continue
      if (!new RegExp(`\\.vf-shadow-${value}\\b`).test(GLOBALS_CSS)) {
        missing.push(`.vf-shadow-${value} (shadow option "${value}")`)
      }
    }

    // Backgrounds and container widths go through lookup maps in Section rather
    // than string interpolation, so read the classes the map actually emits.
    const mapClasses = (mapName: string): string[] => {
      const start = section.indexOf(`export const ${mapName}`)
      expect(start, `Section exports no map named ${mapName}`).toBeGreaterThan(-1)
      const end = section.indexOf('}', section.indexOf('{', start))
      return [...section.slice(start, end).matchAll(/'([^']*vf-[^']*)'/g)]
        .flatMap((m) => m[1].split(/\s+/))
        .filter((c) => c.startsWith('vf-'))
    }

    for (const cls of mapClasses('bgClasses')) {
      if (!new RegExp(`\\.${cls}\\b`).test(GLOBALS_CSS)) {
        missing.push(`.${cls} (emitted by Section's bgClasses)`)
      }
    }

    expect(missing, 'an editor can select this, and no rule defines it').toEqual([])
  })

  /**
   * Pattern B2 — "the CSS-class picker offers a class that styles nothing".
   *
   * `CODE_DEFINED_CLASSES` exists so page-layout classes that live in globals.css
   * (rather than in the Custom Styles global) are still selectable — otherwise
   * removing one from a block was a one-way door. That list is hand-maintained,
   * so it can drift into advertising a class no rule defines, which is the same
   * failure in a new place.
   *
   * Proven red by: adding `{ name: 'vf-home-nope', label: 'x' }` to
   * src/fields/codeDefinedClasses.ts → reports `.vf-home-nope`.
   */
  it('every class the CSS-class picker offers from code exists in globals.css', () => {
    const src = readFileSync(join(SRC, 'fields/codeDefinedClasses.ts'), 'utf8')
    const names = [...src.matchAll(/name:\s*'([a-zA-Z][\w-]*)'/g)].map((m) => m[1]!)
    expect(names.length, 'could not parse CODE_DEFINED_CLASSES').toBeGreaterThan(0)

    const missing = names.filter((n) => !new RegExp(`\\.${n}\\b`).test(GLOBALS_CSS))
    expect(missing, 'offered by the class picker, but no rule defines it').toEqual([])
  })

  /**
   * Pattern C — "the editor's Appearance choice is discarded".
   *
   * `CMSLink` destructures `appearance`, so a literal written AFTER a `{...link}`
   * spread wins and whatever the editor stored is thrown away. That is only a bug
   * when the editor was offered the choice in the first place, so this checks the
   * component against its own config: either the config passes
   * `appearances: false` (no control exists), or the component reads
   * `.appearance` and translates it itself.
   *
   * The previous version's regex listed `icon|newTab` — neither of which anything
   * violates — while its title promised `appearance`. It matched 0 files.
   *
   * Proven red by: removing `appearances: false` from
   * src/blocks/GatewayCards/config.ts → reports GatewayCards/Component.tsx.
   */
  it('a hardcoded appearance= never overrides a choice the editor was offered', () => {
    // Components outside src/blocks, mapped to the config that defines their links.
    const EXTRA: Record<string, string> = {
      'src/Header/Nav/index.tsx': 'src/Header/config.ts',
      'src/Header/Component.client.tsx': 'src/Header/config.ts',
      'src/Footer/Component.tsx': 'src/Footer/config.ts',
      'src/heros/HomeHero/index.tsx': 'src/heros/config.ts',
      'src/heros/PageHero/index.tsx': 'src/heros/config.ts',
    }

    // Blocks whose Appearance control is inert but documented as such in the
    // field's admin description, so the editor is told rather than misled.
    // Preferred fix is still `appearances: false`; that drops a populated column,
    // which this schema has deliberately kept additive.
    const DOCUMENTED_INERT: Record<string, string> = {
      Callout:
        'linkGroup description: "Callout links all render in the same style, so a link’s Appearance … makes no difference here."',
      MapEmbed: 'linkGroup description explains Appearance applies on the standard map layout only',
    }

    const SPREAD_APPEARANCE = /\{\.\.\.[A-Za-z_.?[\]0-9]+\}\s*(?:\n\s*)?appearance=/

    const offenders: string[] = []

    const check = (componentFile: string, configFile: string, allowKey?: string) => {
      if (!existsSync(componentFile) || !existsSync(configFile)) return
      const component = readFileSync(componentFile, 'utf8')
      if (!SPREAD_APPEARANCE.test(component)) return
      if (allowKey && DOCUMENTED_INERT[allowKey]) return

      const config = readFileSync(configFile, 'utf8')

      // No `link()` / `linkGroup()` helper means no Appearance select was ever
      // generated — e.g. IconList declares its own `link` group holding a single
      // `url`. Nothing is being discarded there.
      const usesLinkHelper = /\b(link|linkGroup)\s*\(/.test(config)
      if (!usesLinkHelper) return

      const noControl = /appearances:\s*false/.test(config)
      const honoursIt = /\.\s*appearance\b/.test(component)
      if (!noControl && !honoursIt) {
        offenders.push(
          `${rel(componentFile)} hardcodes appearance= after a spread, but ${rel(
            configFile,
          )} still offers the Appearance select and the component never reads it`,
        )
      }
    }

    for (const name of blockDirs) {
      const dir = join(BLOCKS, name)
      for (const f of readdirSync(dir).filter((f) => f.endsWith('.tsx'))) {
        check(join(dir, f), join(dir, 'config.ts'), name)
      }
    }
    for (const [component, config] of Object.entries(EXTRA)) {
      check(join(process.cwd(), component), join(process.cwd(), config))
    }

    expect(offenders, 'the stored Appearance value is silently discarded').toEqual([])
  })

  /**
   * Pattern D — "query without access control leaks drafts".
   *
   * The previous version searched a fixed 400-character window after
   * `payload.find({`, so a longer query simply produced no match and no assertion
   * — the queries with the most surface were the ones it silently skipped. It also
   * walked `src/blocks` only, missing all 13 calls under `src/app/(frontend)`, and
   * `continue`d past any call whose `collection:` was a variable.
   *
   * This brace-matches the real extent of each call, walks the route handlers too,
   * and FAILS on a call it cannot classify rather than ignoring it.
   *
   * Proven red by: removing `overrideAccess: false` from the specialists query in
   * src/app/(frontend)/specialists/profiles/[slug]/page.tsx.
   */
  it('queries against draft-enabled collections are access-controlled', () => {
    // Only collections with drafts enabled can leak an unpublished document.
    // Taxonomy lookups (specialties, services, testimonials…) have no _status.
    const DRAFT_COLLECTIONS = ['events', 'pages', 'posts', 'specialists', 'team']

    // Call sites that legitimately read drafts, each with the reason.
    const ALLOWED = [
      // Sitemaps and the legacy redirect gate on draftMode() / _status themselves.
      'src/endpoints/', // seed runs as an authenticated admin request
      // Runs only inside the Icons `beforeDelete` hook, to answer "does ANY
      // document reference this icon". It has to see every document including
      // drafts — an icon referenced only by an unpublished draft comes back the
      // moment that draft is published — and it never returns a document to a
      // visitor, only a count and a title in an error message shown to the admin
      // performing the delete. This is the one shape `overrideAccess: true` is
      // correct for, so it is listed rather than the guard being widened.
      'src/utilities/iconUsage.ts',
    ]

    /** Extract the full `payload.find({...})` argument by matching braces. */
    const findCalls = (text: string): string[] => {
      const out: string[] = []
      const re = /payload\.find\(\s*\{/g
      let m: RegExpExecArray | null
      while ((m = re.exec(text))) {
        let depth = 1
        let i = m.index + m[0].length
        while (i < text.length && depth > 0) {
          const ch = text[i]
          if (ch === '{') depth++
          else if (ch === '}') depth--
          i++
        }
        // depth > 0 means an unbalanced call — report it rather than skip it.
        out.push(
          depth === 0 ? text.slice(m.index, i) : `UNBALANCED:${text.slice(m.index, m.index + 80)}`,
        )
      }
      return out
    }

    const offenders: string[] = []
    const files = [
      ...walkFiles(BLOCKS),
      ...walkFiles(join(SRC, 'app')),
      ...walkFiles(join(SRC, 'utilities')),
      ...walkFiles(join(SRC, 'components')),
      ...walkFiles(join(SRC, 'heros')),
    ]

    for (const file of files) {
      if (ALLOWED.some((a) => rel(file).startsWith(a))) continue
      const text = readFileSync(file, 'utf8')

      for (const call of findCalls(text)) {
        if (call.startsWith('UNBALANCED:')) {
          offenders.push(`${rel(file)}: could not parse the extent of a payload.find call`)
          continue
        }

        const guarded =
          /overrideAccess:\s*(false|draft|isEnabled)/.test(call) || /_status/.test(call)

        const literal = call.match(/collection:\s*'([a-z-]+)'/)?.[1]
        if (!literal) {
          // A non-literal `collection:` cannot be classified statically. The old
          // version silently `continue`d here, which is precisely how a real leak
          // stays invisible: no match, no assertion, green. Demand that such a
          // call states its access intent explicitly instead.
          if (/collection[,:]/.test(call) && !guarded) {
            offenders.push(
              `${rel(file)}: payload.find uses a non-literal collection — this guard cannot ` +
                `tell whether it targets a draft-enabled collection. Inline the slug, or add ` +
                `an explicit overrideAccess.`,
            )
          }
          continue
        }
        if (!DRAFT_COLLECTIONS.includes(literal)) continue

        if (!guarded) {
          offenders.push(
            `${rel(file)}: payload.find({ collection: '${literal}' }) has no overrideAccess and no _status filter`,
          )
        }
      }
    }

    expect(offenders, 'Local API defaults to overrideAccess: true and will serve drafts').toEqual(
      [],
    )
  })
})

/**
 * Pattern E — "the save succeeded and the site kept the old value".
 *
 * `revalidateTag(tag, profile)` with a *named* cacheLife profile does not purge.
 * Given any profile, Next sets `stale = now` but `expired = now + expire*1000`;
 * the built-in `max` profile's `expire` is a year, and `areTagsExpired` requires
 * `expiredAt <= now`. The entry therefore goes stale-while-revalidate rather
 * than expiring: measured under `next start`, the first reload after every save
 * served the PREVIOUS value, and three quick edits left the page two versions
 * behind. `{ expire: 0 }` is the immediate, hard purge.
 *
 * Why this guard reads the *alias*: every call site imports the helper as
 * `import { safeRevalidateTag as revalidateTag }`. A guard grepping for
 * `safeRevalidateTag(` matches nothing and can never fail — which is exactly
 * how the first search for these call sites reported zero of the real 27.
 *
 * Proven red by: re-adding `, 'max'` to a call site, and separately by changing
 * the `{ expire: 0 }` in safeRevalidate.ts back to a named profile.
 */
/**
 * Pattern F — "the photo can't be changed from the admin".
 *
 * The site ships before its photography does, so every image slot is standing
 * empty behind a placeholder and someone who does not write code has to be able
 * to fill them all in later. Two ways that quietly stops being true, one of
 * which had already happened.
 */
describe('every image is uploadable from the admin', () => {
  /**
   * A brand asset referenced straight from CSS cannot be changed by an editor.
   *
   * This is the one that had already gone wrong: `.page-hero-shield` (every
   * interior page) and the contact page's portal cards both hardcoded
   * `url('/assets/images/VERIFY Shield.png')`, while the *same* shield on the
   * home hero read from Site Settings. Uploading a new shield changed one page
   * and silently left the rest.
   *
   * The `:root` token default is the one legitimate use — that is the fallback
   * for "nothing uploaded yet" — so the rule is not "never reference the file",
   * it is "only a custom-property declaration may".
   *
   * Proven red by: pointing `.page-hero-shield` back at the file directly.
   */
  it('no rule references a bundled brand asset directly', () => {
    const offenders = GLOBALS_CSS.split('\n')
      .map((line, i) => ({ line: line.trim(), n: i + 1 }))
      .filter(({ line }) => /url\(\s*['"]?\/assets\/images\//.test(line))
      // A `--vf-*: url(...)` declaration is the documented default behind a
      // Site Settings upload. Anything else is a hardcoded asset.
      .filter(({ line }) => !/^--[\w-]+\s*:/.test(line))
      .map(({ line, n }) => `globals.css:${n}  ${line}`)

    expect(offenders, 'reference it through a token fed by Site Settings').toEqual([])
  })

  /**
   * A block that draws a placeholder must offer a way to replace it.
   *
   * Keyed on `placeholderLabel` / `placeholderIcon` — the two props that mark an
   * *image* placeholder in this codebase. Matching the bare word `placeholder`
   * would drag in every text input (Newsletter, the Form blocks, the directory
   * search) and demand they accept uploads.
   *
   * Proven red by: removing the `image` upload field from WhyVerify/config.ts.
   */
  it('a block that renders an image placeholder has an upload field', () => {
    const offenders: string[] = []

    for (const name of blockDirs) {
      const src = blockSources(name)
      if (!/placeholderLabel|placeholderIcon/.test(src)) continue
      const config = readFileSync(join(BLOCKS, name, 'config.ts'), 'utf8')
      if (!/type:\s*'upload'/.test(config)) {
        offenders.push(`${name}: draws a placeholder but its config offers no upload`)
      }
    }

    // Guard the guard: if the prop names are ever renamed this finds nothing and
    // silently passes, which is the failure mode the whole file exists to avoid.
    const covered = blockDirs.filter((n) =>
      /placeholderLabel|placeholderIcon/.test(blockSources(n)),
    )
    expect(
      covered.length,
      'no block matched — has the placeholder prop been renamed?',
    ).toBeGreaterThanOrEqual(4)

    expect(offenders, 'a placeholder with no upload cannot be replaced by an editor').toEqual([])
  })
})

describe('cache purges actually purge', () => {
  it('no tag purge passes a named cacheLife profile', () => {
    const wrapperPath = join(SRC, 'utilities/safeRevalidate.ts')
    const wrapper = readFileSync(wrapperPath, 'utf8')

    // 1. The one place next/cache's revalidateTag is called must use a
    //    zero-expiry cacheLife object, not a profile name.
    const call = /\brevalidateTag\(\s*tag\s*,([^)]*)\)/.exec(wrapper)
    expect(call, 'could not find the revalidateTag call in safeRevalidate.ts').not.toBeNull()
    expect(
      call![1].replace(/\s/g, ''),
      'a named profile never hard-expires the tag; pass { expire: 0 }',
    ).toBe('{expire:0}')

    // 2. Nothing else may import next/cache's revalidateTag and re-introduce it.
    const directImporters = walkFiles(SRC)
      .filter((f) => /\.tsx?$/.test(f) && f !== wrapperPath)
      .filter((f) =>
        /import\s*\{[^}]*\brevalidateTag\b[^}]*\}\s*from\s*'next\/cache'/.test(
          readFileSync(f, 'utf8'),
        ),
      )
      .map(rel)
    expect(directImporters, 'must go through safeRevalidateTag').toEqual([])

    // 3. No call site may pass a second argument that is a string literal.
    //    Resolve each file's local alias for the helper first — they all rename
    //    it, so matching the exported name would match nothing.
    const offenders: string[] = []
    for (const file of walkFiles(SRC).filter((f) => /\.tsx?$/.test(f) && f !== wrapperPath)) {
      const text = readFileSync(file, 'utf8')
      const imported = /\bsafeRevalidateTag\s+as\s+(\w+)|\b(safeRevalidateTag)\b\s*[,}]/.exec(text)
      if (!imported) continue
      const alias = imported[1] ?? imported[2]
      const calls = text.matchAll(new RegExp(`\\b${alias}\\(([^)]*)\\)`, 'g'))
      for (const m of calls) {
        // Split on top-level commas only; a template literal tag has none.
        const args = m[1].split(/,(?![^(]*\))/).map((a) => a.trim())
        if (args.length > 1 && /^['"]/.test(args[1])) {
          offenders.push(`${rel(file)}: ${alias}(${m[1]})`)
        }
      }
    }
    expect(offenders, 'a named cacheLife profile leaves the tag unexpired').toEqual([])
  })
})

describe('documented style hooks exist', () => {
  // The manual calls its class list "a published API"; 15 entries did not exist,
  // and three shipped Custom Styles presets were written against them.
  it('every class in HOOKS.md §6 is emitted somewhere in src/', () => {
    const hooks = readFileSync(join(SRC, 'Styles/HOOKS.md'), 'utf8')
    const section = (hooks.split('## 6. Hook classes')[1]?.split('\n---')[0] ?? '')
      .split('\n')
      // Drop blockquotes: those document the classes that were REMOVED for not
      // existing, so scanning them would re-report exactly what was just fixed.
      .filter((line) => !line.trimStart().startsWith('>'))
      .join('\n')
    const classes = [...section.matchAll(/`\.(vf-[a-z0-9_-]+)`/g)].map((m) => m[1])

    const sources: string[] = []
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name)
        if (entry.isDirectory()) walk(full)
        else if (/\.(tsx?|css)$/.test(entry.name) && !full.endsWith('HOOKS.md')) {
          sources.push(readFileSync(full, 'utf8'))
        }
      }
    }
    walk(SRC)
    const haystack = sources.join('\n')

    const missing = [...new Set(classes)].filter(
      (c) => !new RegExp(`[.\`"'\\s]${c}\\b`).test(haystack),
    )
    expect(missing, 'documented as a stable hook but nothing emits it').toEqual([])
  })
})

// ---------------------------------------------------------------------------
// Pattern A, extended to globals and collections.
//
// The block-level check above missed this whole surface, which is exactly where
// the longest-lived orphans hid — an editable "Office hours" the footer never
// rendered, phone/email on Offices while the real ones lived in the Footer.
//
// The haystack is scoped PER CONFIG to the files that actually reference that
// collection or global. The previous version searched one blob of the entire
// `src/` tree for a bare word, so 52 of 117 declared field names matched
// something unrelated somewhere — including `hours`, `phone`, `email` and
// `address`, the very orphans it was written to catch.
// ---------------------------------------------------------------------------

const GLOBAL_CONFIGS = [
  'Header',
  'Footer',
  'SiteSettings',
  'ArticleSettings',
  'EventsSettings',
  'TeamSettings',
  'SpecialistProfile',
  'SpecialistAvailability',
  'DesignSystem',
  'Styles',
]
  .map((d) => join(SRC, d, 'config.ts'))
  .filter((f) => existsSync(f))

const collectionConfigs = (): string[] => {
  const dir = join(SRC, 'collections')
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith('.ts')) out.push(join(dir, entry.name))
    else if (entry.isDirectory() && existsSync(join(dir, entry.name, 'index.ts'))) {
      out.push(join(dir, entry.name, 'index.ts'))
    }
  }
  return out
}

/**
 * Every file that could consume a global/collection field, read once.
 *
 * Excludes exactly the config files under test — not the whole `collections/`
 * tree, which is where the collection hooks live. `Posts.authors` is read by
 * `collections/Posts/hooks/populateAuthors.ts`, and blanket-excluding the
 * directory reported it as an orphan.
 *
 * `src/endpoints` is excluded on purpose. The seed *writes* these fields
 * (`{ hoursNote: '...' }`), which looks identical to reading one and is the
 * opposite of what this test asks. Including it made every seeded field appear
 * consumed — measured: with `endpoints` in the list, deleting the only renderer
 * of `Offices.hoursNote` still passed.
 */
const CONFIG_FILE_PATHS = new Set<string>()

const CONSUMER_FILES: { path: string; text: string }[] = [
  'app',
  'components',
  'blocks',
  'heros',
  'utilities',
  'search',
  'Footer',
  'Header',
  'plugins',
  'collections',
  'hooks',
]
  .flatMap((d) => walkFiles(join(SRC, d)))
  .filter((f) => !f.endsWith('payload-types.ts'))
  .map((path) => ({ path, text: readFileSync(path, 'utf8') }))

/**
 * ── Why this is not scoped per collection ───────────────────────────────────
 * The obvious tightening — only search files that mention the collection's slug
 * — was tried and rejected: it produces false positives wherever a consumer
 * reaches the data through a helper. `Footer/Component.tsx` renders
 * `office?.phone` but never contains the string `'offices'`; only
 * `utilities/primaryOffice.ts` does. Chasing that needs the import graph walked
 * in both directions, whose transitive closure is most of the app anyway.
 *
 * The load-bearing fix is `readsField` instead of a bare `\b<name>\b` match. The
 * old version's false negatives came from matching *any* token: `hours`, `phone`,
 * `email` and `address` each occur as a local variable, a CSS class or a comment
 * somewhere in `src/`, so four real orphans passed. Requiring an actual property
 * read (`x.hours`, `{ hours }`, `hours={…}`) removes that whole class.
 */
for (const f of [...GLOBAL_CONFIGS, ...collectionConfigs()]) CONFIG_FILE_PATHS.add(f)

const CONSUMER_HAYSTACK = CONSUMER_FILES.filter((f) => !CONFIG_FILE_PATHS.has(f.path))
  .map((f) => f.text)
  .join('\n')

/**
 * Fields no rendering path reads, each with the reason it is acceptable.
 *
 * An entry here is a promise that the field is either consumed by Payload
 * itself, or deliberately admin-only. Anything else belongs in the code, not
 * this list — an unexplained entry is how a real dead control gets normalised.
 */
const ALLOWED_UNREAD_CONFIG: Record<string, string> = {
  // Payload/plugin-owned — consumed by the framework, never by our components.
  slug: 'slugField(); used in queries and routes.ts',
  slugLock: 'slugField() internal',
  title: 'useAsTitle / admin list',
  id: 'Payload primary key',
  updatedAt: 'Payload timestamp',
  createdAt: 'Payload timestamp',
  _status: 'Payload drafts',
  meta: 'plugin-seo group; read via generateMeta',
  overview: 'plugin-seo admin-only preview',
  preview: 'plugin-seo admin-only preview',
  image: 'plugin-seo meta.image, read via generateMeta',
  description: 'plugin-seo meta.description on collections with SEO tabs',
  email: 'Users auth field / Offices contact, read via getPrimaryOffice',
  password: 'Payload auth',
  name: 'Users display name; also array-item labels read positionally',
  blockName: 'Payload built-in block label',
  // Media `imageSizes` entries. These are not editor controls at all — Payload
  // generates a derivative per entry on upload and serves them through the
  // `sizes` object / srcSet. Only `og` is selected by name in our code
  // (generateMeta). Listed individually rather than pattern-matched so adding a
  // new size is a deliberate act.
  thumbnail: 'Media imageSizes name — generated and served by Payload/next-image',
  square: 'Media imageSizes name — generated and served by Payload/next-image',
  small: 'Media imageSizes name — generated and served by Payload/next-image',
  medium: 'Media imageSizes name — generated and served by Payload/next-image',
  large: 'Media imageSizes name — generated and served by Payload/next-image',
  xlarge: 'Media imageSizes name — generated and served by Payload/next-image',

  // Structured alternatives to a rendered free-text field. The text field is
  // what renders today; these are captured for future use and are NOT offered
  // as if they changed the page.
  locationRef: 'Events: structured location; the rendered value is the `location` text field',
  relatedSpecialist:
    'Posts: captured for spotlight attribution; the byline renders from `author.source`',

  // Admin-only ordering and grouping. These drive the admin list view, not the
  // public site, and their descriptions now say so.
  // Keyed by bare field name, so this one entry exempts `order` on all eleven
  // collections that declare it. Nine of those ARE read (Team, Departments,
  // Offices, Specialties, SpecialtyCategories, ClaimTypes, Resources, Services,
  // Testimonials) and do not need exempting; the reason used to name Offices,
  // whose `order` is read by primaryOffice.ts. The two it actually covers are
  // Streams and Locations, which now sort their own admin list via `defaultSort`
  // — a config property, which this file's source scan cannot see as a read.
  order: 'Streams/Locations only: consumed by `defaultSort` in their own config, which the consumer scan cannot see. Public order is authored per-block.',
  region:
    'Locations admin grouping; the directory filter derives from specialist-denormalised titles',

  // Deliberately never rendered. `notes` on AvailabilitySessions is a staff-only
  // note; it used to feed the availability chip's `title`/`aria-label`, and that
  // rendering was removed on purpose so staff can write candid notes. What keeps
  // it internal is field-level `access.read` in the collection config, not this
  // entry — the collection is `read: anyone`, so without that the value is served
  // to unauthenticated callers. Guarded by tests/int/availabilityNotes.int.spec.ts.
  // Safe as a bare-name key: `notes` is declared on no other collection or global
  // (unlike `location`, which Events and PeopleGrid also declare).
  notes: 'AvailabilitySessions internal staff note — never rendered by design; kept off the public API by field-level access.read',

  // Deprecated, hidden from the admin, column retained pending a drop migration.
  availabilityHighlight: 'deprecated, admin.hidden — superseded by `advertise`',
  availabilityNote: 'deprecated, admin.hidden — superseded by `advertise`',
}

describe('globals and collections have no orphan fields', () => {
  /**
   * Proven red by: renaming `office.hoursNote` in src/blocks/MapEmbed/Component.tsx
   * (its only renderer) → reports `hoursNote` on Offices.
   *
   * Note on choosing a break: the first attempt removed the `hours` rendering from
   * the Footer and the guard stayed green — correctly, because `ContactDetails`
   * reads `office?.hours` too. A field with more than one consumer cannot prove
   * this test. Pick one with exactly one renderer.
   */
  it.each([...GLOBAL_CONFIGS, ...collectionConfigs()])('%s', (file) => {
    const config = readFileSync(file, 'utf8')
    const declared = declaredFieldNames(config)

    const unread = [...new Set(declared)].filter(
      (field) => !ALLOWED_UNREAD_CONFIG[field] && !readsField(CONSUMER_HAYSTACK, field),
    )

    expect(
      unread,
      `${rel(file)}: declared but nothing renders it — wire it up, or add it to ALLOWED_UNREAD_CONFIG with a reason`,
    ).toEqual([])
  })
})
