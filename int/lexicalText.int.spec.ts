import { describe, expect, it } from 'vitest'

import { hasRichText, lexicalNodeText, richTextToPlain } from '@/utilities/lexicalText'
import { storedText } from '@/endpoints/seed/repairMatch'

/**
 * Reading a copy field's words whether it holds a string or a Lexical tree.
 *
 * This is the seam the rich-text conversion turns on. Every field a visitor
 * reads is moving from `string` to a Lexical editor state, and the dangerous
 * half of that move is not the rendering — it is the dozens of places that read
 * a copy value as *words*: an `aria-label`, an iframe `title`, a search
 * haystack, a `{count}` template, and every seed repair that compares stored
 * copy against a literal. None of those throw when handed an object. They
 * render `[object Object]`, or quietly stop matching, and the page keeps working.
 *
 * The breaks that prove these are worth having:
 *
 *  · Replace the `{ root }` branch of `richTextToPlain` with the old
 *    `lexicalNodeText(value)` call — the real prior behaviour, since that walker
 *    returns `''` for a root, silently. Measured: **6 of the 12 fail**, every one
 *    that reads an editor state. Worth knowing which two did NOT, because they
 *    are the shape of a check that cannot catch this: "reads a bare node" (it
 *    never had a root to unwrap) and "an empty editor state has no words" —
 *    `'' === ''` is true whether the walker works or is broken. It is the
 *    *non-empty* assertion, "is true once there are words", that goes red. Assert
 *    both states of a two-state behaviour or the guard passes on the degenerate
 *    one.
 *  · Drop the `stripAccent` call and "strips the accent brackets" fails: an
 *    `aria-label` would then read "Meet Our [[Expert Panel]]" aloud, brackets
 *    and all.
 *  · Make `hasRichText` a truthiness check and "an empty editor state has no
 *    words" fails. An untouched rich-text field is a truthy object, so every
 *    `if (!heading)` in the codebase silently becomes "always false" the day its
 *    field is converted, and components that rendered nothing start rendering
 *    empty bands.
 */

const state = (...paragraphs: string[]) => ({
  root: {
    type: 'root',
    children: paragraphs.map((text) => ({
      type: 'paragraph',
      children: [{ type: 'text', text, format: 0 }],
    })),
  },
})

/** A heading with a bolded run inside it — three text nodes, one heading. */
const formatted = {
  root: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [
          { type: 'text', text: 'Ensuring ', format: 0 },
          { type: 'text', text: 'Accuracy', format: 1 },
          { type: 'text', text: ', Empowering Justice', format: 0 },
        ],
      },
    ],
  },
}

describe('richTextToPlain', () => {
  it('unwraps a whole editor state', () => {
    expect(richTextToPlain(state('Meet Our Expert Panel'))).toBe('Meet Our Expert Panel')
  })

  it('reads a bare node, as headingId has always done', () => {
    expect(lexicalNodeText(formatted.root.children[0]!)).toBe(
      'Ensuring Accuracy, Empowering Justice',
    )
  })

  it('joins the runs of a formatted heading without losing a word', () => {
    expect(richTextToPlain(formatted)).toBe('Ensuring Accuracy, Empowering Justice')
  })

  it('passes a plain string straight through, because most fields are not converted yet', () => {
    expect(richTextToPlain('Four Services.')).toBe('Four Services.')
  })

  it('strips the accent brackets, which are display syntax rather than content', () => {
    expect(richTextToPlain(state('Meet Our [[Expert Panel]]'))).toBe('Meet Our Expert Panel')
    expect(richTextToPlain('Meet Our [[Expert Panel]]')).toBe('Meet Our Expert Panel')
  })

  it('keeps the brackets when asked, for a caller that re-renders them', () => {
    expect(richTextToPlain('Meet Our [[Expert Panel]]', { keepAccent: true })).toBe(
      'Meet Our [[Expert Panel]]',
    )
  })

  it('joins top-level blocks with a separator rather than running the words together', () => {
    expect(richTextToPlain(state('Ensuring Accuracy,', 'Empowering Justice'))).toBe(
      'Ensuring Accuracy, Empowering Justice',
    )
  })

  it('returns empty for null, undefined and an empty state rather than throwing', () => {
    // An aria-label is not worth taking a page down for.
    expect(richTextToPlain(null)).toBe('')
    expect(richTextToPlain(undefined)).toBe('')
    expect(richTextToPlain(state(''))).toBe('')
  })
})

describe('hasRichText', () => {
  it('an empty editor state has no words, despite being a truthy object', () => {
    const empty = state('')
    expect(Boolean(empty)).toBe(true)
    expect(hasRichText(empty)).toBe(false)
  })

  it('is true once there are words', () => {
    expect(hasRichText(state('Anything'))).toBe(true)
    expect(hasRichText('Anything')).toBe(true)
  })

  it('is false for an absent field', () => {
    expect(hasRichText(null)).toBe(false)
  })
})

describe('storedText, as the seed repairs use it', () => {
  /**
   * The point of the whole exercise: a repair table keys on a heading, and that
   * heading is about to become a Lexical tree. Both shapes must reduce to the
   * same literal, or the repair stops firing and says nothing — which is how the
   * "an in-page anchor is two halves" fault would arrive by a new route.
   */
  it('matches the same literal whether the heading is a string or rich text', () => {
    const literal = 'Four Services. One Less Thing to Manage.'
    expect(storedText('Four Services. [[One Less Thing to Manage.]]')).toBe(literal)
    expect(storedText(state('Four Services. [[One Less Thing to Manage.]]'))).toBe(literal)
  })
})
