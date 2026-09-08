import { describe, expect, it } from 'vitest'

import {
  headingId,
  headingIdAt,
  headingLabel,
  lexicalNodeText,
  slugify,
  type TextishNode,
} from '@/utilities/headingId'

/**
 * The anchor ids for article headings.
 *
 * These exist because the id and the link that points at it used to be computed
 * by two copies of the same function — one in the article page for the contents
 * list's hrefs, one in `ArticleToc` which assigned the ids on mount. Two copies
 * are two things that can drift, and a drifted pair fails silently: everything
 * still renders and the links just do nothing.
 *
 * The end-to-end guard in `tests/e2e/links.e2e.spec.ts` proves the ids reach the
 * browser. This proves the arithmetic, in 200ms rather than 40 seconds.
 */

const heading = (text: string): TextishNode => ({
  type: 'heading',
  tag: 'h2',
  children: [{ type: 'text', text }],
})

describe('headingId', () => {
  it('slugifies a heading into a stable anchor', () => {
    expect(headingId(heading('The Errors We See Most'))).toBe('the-errors-we-see-most')
  })

  it('strips the [[accent]] markers, which are display syntax and not content', () => {
    // Without this the contents list prints the brackets literally while the
    // heading itself renders them as colour.
    expect(headingLabel(heading('Preparing the [[Claimant]]'))).toBe('Preparing the Claimant')
    expect(headingId(heading('Preparing the [[Claimant]]'))).toBe('preparing-the-claimant')
    // A marker with no surrounding space must not fuse two words into one:
    // the id follows the words a reader sees, not the raw field value.
    expect(headingId(heading('[[Accuracy]]Matters'))).toBe('accuracymatters')
  })

  it('reads text out of nested children, not just a flat text node', () => {
    const withLink: TextishNode = {
      type: 'heading',
      tag: 'h2',
      children: [
        { type: 'text', text: 'See the ' },
        { type: 'link', children: [{ type: 'text', text: 'brief guide' }] },
      ],
    }
    expect(lexicalNodeText(withLink)).toBe('See the brief guide')
    expect(headingId(withLink)).toBe('see-the-brief-guide')
  })

  it('returns "" when there is nothing to slugify', () => {
    // Callers must treat '' as "no id". Emitting it anyway gives the contents
    // list `href="#"`, which scrolls to the top and reads as a broken link.
    expect(headingId(heading('?!'))).toBe('')
    expect(headingId(heading('   '))).toBe('')
    expect(slugify('---')).toBe('')
  })
})

describe('headingIdAt', () => {
  it('agrees with headingId when nothing collides', () => {
    const siblings = [heading('Overview'), { type: 'paragraph' }, heading('Method')]
    expect(headingIdAt(siblings, 0)).toBe('overview')
    expect(headingIdAt(siblings, 2)).toBe('method')
    expect(headingIdAt(siblings, 2)).toBe(headingId(siblings[2]!))
  })

  it('disambiguates repeated headings by counting only what precedes them', () => {
    // Suffixing from earlier siblings alone is what lets the renderer and the
    // contents list compute the same answer from the same array without sharing
    // any state — they never speak to each other.
    const siblings = [heading('Overview'), heading('Method'), heading('Overview'), heading('Overview')]
    expect(siblings.map((_, i) => headingIdAt(siblings, i))).toEqual([
      'overview',
      'method',
      'overview-2',
      'overview-3',
    ])
  })

  it('does not count a non-heading sibling that happens to say the same thing', () => {
    const siblings = [
      { type: 'paragraph', children: [{ type: 'text', text: 'Overview' }] },
      heading('Overview'),
    ]
    expect(headingIdAt(siblings, 1)).toBe('overview')
  })

  it('stays "" for an unslugifiable heading rather than becoming a bare suffix', () => {
    const siblings = [heading('?!'), heading('?!')]
    expect(siblings.map((_, i) => headingIdAt(siblings, i))).toEqual(['', ''])
  })

  it('is out-of-range safe', () => {
    expect(headingIdAt([], 0)).toBe('')
    expect(headingIdAt([heading('Overview')], 5)).toBe('')
  })
})
