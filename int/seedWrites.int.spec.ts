import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Every seed write goes through `seedWrite.ts`, and this is what enforces it.
 *
 * The reason is measured, not theoretical: Payload **accepts a plain string
 * written into a rich-text field** and stores it verbatim. A probe wrote
 * `heading: 'PROBE STRING VALUE'` through `payload.update()` — no error, no
 * validation failure, and the value came back out of the `jsonb` column as a
 * string. The front end even renders it, because `InlineRichText` accepts a
 * string too. The only place it shows is the admin, where the editor cannot
 * open the field.
 *
 * The seed writes fixture copy from around forty files, all of it plain
 * strings, so one call that bypasses `seedCreate`/`seedUpdate` puts unopenable
 * content into the database and reports success. Nothing else in the suite can
 * see that.
 *
 * Proven red: change one `seedUpdate(payload, {` back to `payload.update({` and
 * this fails, naming the file and line.
 */

const ROOT = join(process.cwd(), 'src/endpoints')
// The wrappers themselves are where the real calls live.
const ALLOWED = new Set(['seedWrite.ts'])

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) return walk(full)
    return full.endsWith('.ts') ? [full] : []
  })

describe('seed writes go through the lifting wrappers', () => {
  const files = walk(ROOT).filter((f) => !ALLOWED.has(f.split('/').pop()!))

  it('finds seed files to check', () => {
    // Positive control: every assertion below iterates this list, so an empty
    // one would pass while checking nothing.
    expect(files.length).toBeGreaterThan(10)
  })

  it('no file calls payload.create / payload.update / payload.updateGlobal directly', () => {
    const offenders: string[] = []
    for (const file of files) {
      readFileSync(file, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          // Skip comment lines. CLAUDE.md records the orphan-field guard being
          // fooled by a field name written in a comment; this is the same
          // blindness inverted — the docblock explaining *why* the wrappers
          // exist naturally says `payload.update()`, and matched itself. A guard
          // that goes red on its own explanation gets its explanation deleted.
          const code = line.trim()
          if (code.startsWith('//') || code.startsWith('*') || code.startsWith('/*')) return
          if (/\bpayload\.(create|update|updateGlobal)\(/.test(line)) {
            offenders.push(`${file.replace(process.cwd() + '/', '')}:${i + 1}`)
          }
        })
    }
    expect(
      offenders,
      `these bypass the rich-text lift, so a fixture string lands in a jsonb column unopenable in the admin:\n  ${offenders.join('\n  ')}`,
    ).toEqual([])
  })
})
