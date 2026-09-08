import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { isPlaceholderLayout, isUnauthored } from '@/endpoints/seed/authored'

/**
 * Guards the rule that decides whether the seed may overwrite a page's layout.
 *
 * This exists because the rule was wrong for months and nobody could see it.
 * Every `authorPage` copy asked `layout.length > 2`, which is a proxy for "looks
 * substantial" rather than "someone wrote this" — so **13 of the 27 pages**, each
 * holding one or two blocks, were rewritten from the fixture on every seed run,
 * discarding whatever an editor had changed. Proven at the time by rewording the
 * events hero through the API, re-running the seed, and watching the fixture
 * wording come back.
 *
 * ── The deliberate breaks, and what each actually did when run ──────────────
 *
 * Results recorded after running them, not predicted. All three go red; the tree
 * returns to 8 passed afterwards.
 *
 *   1. In `src/endpoints/seed/authored.ts`, change `isUnauthored` back to
 *      `(layout) => !Array.isArray(layout) || layout.length <= 2`.
 *      → **3 failed / 5 passed.** I expected one. It also takes down "scaffold
 *        plus real content is authored" and "does not mistake an editor-written
 *        content block for the scaffold", because both of those layouts are short
 *        enough for the count rule to call them unauthored too. That breadth is
 *        the point: the old rule was wrong about far more than two-block pages.
 *   2. In the same file, drop the `arr.length === 1` clause from
 *      `isPlaceholderLayout`.
 *      → **1 failed / 7 passed** — "scaffold plus real content is authored".
 *   3. In any seed module, restore `if (Array.isArray(rec.layout) &&
 *      rec.layout.length > 2)`.
 *      → **1 failed / 7 passed** — "no seed module decides by counting blocks",
 *        naming the offending file in the message.
 *
 * A guard that has never failed is not evidence — three of the four patterns in
 * `adminControls.int.spec.ts` were once structurally incapable of failing while
 * the suite reported 94/94.
 */

const SCAFFOLD = [
  {
    blockType: 'content',
    columns: [
      {
        size: 'full',
        richText: { root: { children: [{ text: 'The “Events” page is scaffolded and ready for content.' }] } },
      },
    ],
  },
]

const block = (blockType: string) => ({ blockType, id: blockType })

describe('seed: may the fixture overwrite this page?', () => {
  it('treats an empty or missing layout as unauthored', () => {
    expect(isUnauthored([])).toBe(true)
    expect(isUnauthored(undefined)).toBe(true)
    expect(isUnauthored(null)).toBe(true)
  })

  it('treats the scaffold placeholder as unauthored', () => {
    expect(isPlaceholderLayout(SCAFFOLD)).toBe(true)
    expect(isUnauthored(SCAFFOLD)).toBe(true)
  })

  // The regression itself. /events sits at exactly two blocks — carousel plus
  // explorer — and the old rule (`> 2`) called that unauthored, so every seed run
  // reverted it. One and two block pages are the whole failure population.
  it('treats a one- or two-block page as AUTHORED, so the seed leaves it alone', () => {
    expect(isUnauthored([block('eventsExplorer')])).toBe(false)
    expect(isUnauthored([block('slideCarousel'), block('eventsExplorer')])).toBe(false)
    expect(isUnauthored([block('content')])).toBe(false)
  })

  it('treats scaffold plus real content as authored', () => {
    expect(isPlaceholderLayout([...SCAFFOLD, block('ctaBand')])).toBe(false)
    expect(isUnauthored([...SCAFFOLD, block('ctaBand')])).toBe(false)
  })

  // A page holding one `content` block that an editor wrote is NOT the scaffold.
  // Matching on blockType alone would call it unauthored and overwrite it.
  it('does not mistake an editor-written content block for the scaffold', () => {
    const written = [
      {
        blockType: 'content',
        columns: [{ size: 'full', richText: { root: { children: [{ text: 'Our privacy policy.' }] } } }],
      },
    ]
    expect(isPlaceholderLayout(written)).toBe(false)
    expect(isUnauthored(written)).toBe(false)
  })
})

describe('seed: one rule, not seven copies', () => {
  // Seven modules each carried their own copy of the block-counting rule. That is
  // the shape that let the collection→prefix map in routes.ts drift apart, per
  // CLAUDE.md. Any reintroduction is named here rather than found later.
  it('no seed module decides authorship by counting blocks', () => {
    const dir = join(process.cwd(), 'src/endpoints/seed')
    const offenders: string[] = []
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.ts'))) {
      if (file === 'authored.ts') continue // its header quotes the old rule
      const src = readFileSync(join(dir, file), 'utf8')
      if (/layout\??\.length\s*[<>]=?\s*\d/.test(src)) offenders.push(file)
    }
    expect(offenders, `these decide by block count instead of isUnauthored: ${offenders.join(', ')}`).toEqual([])
  })

  // Scoped to `authorPage` itself, and that scope is deliberate — the first
  // version matched any file mentioning "already authored" and flagged two that
  // are correct: `seedBlockBands.ts`, which only quotes the log line in a comment
  // explaining why it exists, and `authorPageReplace` in `seedInfoBooking.ts`,
  // which skips on a *signature block* being present rather than on a count, so
  // it can replace one specific older scaffold exactly once. Proving a guard red
  // is half the job; the other half is proving it stays green on a lookalike.
  it('every authorPage imports the shared rule', () => {
    const dir = join(process.cwd(), 'src/endpoints/seed')
    const missing: string[] = []
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.ts'))) {
      const src = readFileSync(join(dir, file), 'utf8')
      if (/async function authorPage\s*\(/.test(src) && !src.includes("from './authored'"))
        missing.push(file)
    }
    expect(missing, `these define authorPage without isUnauthored: ${missing.join(', ')}`).toEqual([])
  })

  // A "no offenders" result means nothing if the search matched no files. This
  // control caught its own test being written against a guessed number: the rule
  // lives in seven places, but only **six** are named `authorPage` — the seventh
  // is inlined in `seedHomepage`'s exported function, and is covered by the
  // block-count check above instead.
  it('finds the authorPage copies at all — the control for the check above', () => {
    const dir = join(process.cwd(), 'src/endpoints/seed')
    const withAuthorPage = readdirSync(dir)
      .filter((f) => f.endsWith('.ts'))
      .filter((f) => /async function authorPage\s*\(/.test(readFileSync(join(dir, f), 'utf8')))
    expect(withAuthorPage.length).toBe(6)
    expect(readFileSync(join(dir, 'seedHomepage.ts'), 'utf8')).toContain('isUnauthored(rec.layout)')
  })
})
