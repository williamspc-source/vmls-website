import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { InlineRichText } from '@/components/RichText/Inline'

/**
 * The inline renderer, checked by looking at the markup it produces.
 *
 * Every failure this component exists to prevent is invisible to a test that
 * does not read the HTML. `<h2><p>Heading</p></h2>` renders, throws nothing, and
 * merely looks wrong; a two-line heading collapsing to one line renders too. So
 * these assertions are all about shape.
 *
 * The breaks, run:
 *
 *  · Remove `disableContainer` → "renders no wrapper div" fails, and the markup
 *    shows the `<div class="payload-richtext">` the upstream component adds
 *    inside the `<h2>`.
 *  · Delete `inlineParagraphConverter` → "a second paragraph becomes a line
 *    break" fails with `<p>` in the output. This is the one that would otherwise
 *    ship: it needs no code change to appear, only the converter being left out.
 *  · Delete the `nodeColorClass` branch at the end of `textConverter`
 *    (src/components/RichText/shared.tsx) → the two toolbar-colour cases below
 *    fail. That branch is the entire rendering half of the toolbar swatch:
 *    Payload's own text converter reads `node.format` and ignores node state, so
 *    without it an editor picks a colour, sees it in the admin, saves it, and the
 *    page shows nothing.
 */

const state = (...paragraphs: string[]) =>
  ({
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        textFormat: 0,
        children: [
          { type: 'text', text, format: 0, detail: 0, mode: 'normal', style: '', version: 1 },
        ],
      })),
    },
  }) as never

/**
 * One paragraph whose single text node carries the NodeState that
 * `TextStateFeature` writes — `$` is lexical's `NODE_STATE_KEY`, and this is the
 * literal shape that comes back out of the `jsonb` column.
 */
const coloured = (text: string, colour?: string) =>
  ({
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: [
        {
          type: 'paragraph',
          format: '',
          indent: 0,
          version: 1,
          direction: 'ltr',
          textFormat: 0,
          children: [
            {
              type: 'text',
              text,
              format: 0,
              detail: 0,
              mode: 'normal',
              style: '',
              version: 1,
              ...(colour ? { $: { color: colour } } : {}),
            },
          ],
        },
      ],
    },
  }) as never

const html = (el: React.ReactElement) => renderToStaticMarkup(el)

describe('InlineRichText', () => {
  it('renders the tag the caller asked for, with its classes', () => {
    const out = html(
      <InlineRichText as="h2" className="section-title" data={state('Meet Our Expert Panel')} />,
    )
    expect(out).toContain('<h2')
    expect(out).toContain('section-title')
    expect(out).toContain('Meet Our Expert Panel')
  })

  it('renders no paragraph and no wrapper div inside the heading', () => {
    // The whole point. Both of these render perfectly well and are both wrong.
    const out = html(<InlineRichText as="h2" data={state('Meet Our Expert Panel')} />)
    expect(out).not.toContain('<p')
    expect(out).not.toContain('payload-richtext')
  })

  it('a second paragraph becomes a line break, not a second block', () => {
    // The two-line lockups depend on this: "Ensuring Accuracy," / "Empowering
    // Justice" is one heading on two lines, and was a textarea newline before.
    const out = html(
      <InlineRichText as="h1" data={state('Ensuring Accuracy,', 'Empowering Justice')} />,
    )
    expect(out).toContain('<br/>')
    expect(out).not.toContain('<p')
    expect(out.indexOf('Ensuring Accuracy,')).toBeLessThan(out.indexOf('Empowering Justice'))
  })

  it('keeps the accent convention working inside rich text', () => {
    const out = html(<InlineRichText as="h2" data={state('Meet Our [[Expert Panel]]')} />)
    expect(out).toContain('vf-accent')
    expect(out).not.toContain('[[')
  })

  it('applies the editor’s colour choice as a class', () => {
    const out = html(<InlineRichText as="h2" colour="brand" data={state('Coloured')} />)
    expect(out).toContain('vf-tc-brand')
  })

  it('adds no colour class for the default choice', () => {
    // Adding the control to a block must move nothing until someone picks.
    const out = html(<InlineRichText as="h2" colour="inherit" data={state('Plain')} />)
    expect(out).not.toContain('vf-tc-')
  })

  it('still renders a plain string, because the conversion runs in waves', () => {
    const out = html(<InlineRichText as="h2" className="section-title" data="Still A String" />)
    expect(out).toContain('<h2')
    expect(out).toContain('Still A String')
  })

  it('honours [[accent]] and newlines in a plain string exactly as before', () => {
    const out = html(<InlineRichText as="h1" data={'Ensuring Accuracy,\nEmpowering [[Justice]]'} />)
    expect(out).toContain('vf-accent')
    expect(out).toContain('<br/>')
  })

  it('wraps in nothing when no element was asked for', () => {
    // The default used to be a <span>, which added 48 elements across the site
    // and nested `<span class="ni-card-link"><span>…</span></span>`. A wrapper
    // is not free: `.parent span` selectors start matching it.
    const out = html(<InlineRichText data={state('Read More')} />)
    expect(out).toBe('Read More')
  })

  it('still wraps when there is something to hang on the element', () => {
    expect(html(<InlineRichText className="x" data={state('Read More')} />)).toContain('<span')
    expect(html(<InlineRichText colour="brand" data={state('Read More')} />)).toContain(
      'vf-tc-brand',
    )
    expect(html(<InlineRichText as="p" data={state('Read More')} />)).toContain('<p')
  })

  it('paints a colour the editor picked from the toolbar', () => {
    const out = html(<InlineRichText as="h2" data={coloured('Expert Panel', 'brand')} />)
    expect(out).toContain('vf-tc-brand')
    // The marker that lets a toolbar pick beat the [[bracket]] accent. Without
    // it, colouring a bracketed phrase is a click that changes nothing.
    expect(out).toContain('vf-tc--inline')
  })

  it('adds no span when no colour was picked', () => {
    // The other half of the two-state rule: a guard that only checks the
    // coloured case would pass on a converter that wrapped everything.
    expect(html(<InlineRichText as="h2" data={coloured('Expert Panel')} />)).not.toContain('span')
  })

  it('ignores a colour key that is not in the palette', () => {
    // Content coloured with a key that is later retired keeps rendering, just
    // uncoloured. Emitting `vf-tc-galaxy` would leave a class nothing paints.
    expect(
      html(<InlineRichText as="h2" data={coloured('Expert Panel', 'galaxy')} />),
    ).not.toContain('vf-tc-')
  })

  it('renders nothing for an empty field, in both shapes', () => {
    // An empty rich text is a truthy object; a component that rendered it would
    // paint an empty heading band on every page with a blank header.
    expect(html(<InlineRichText as="h2" data={state('')} />)).toBe('')
    expect(html(<InlineRichText as="h2" data="" />)).toBe('')
    expect(html(<InlineRichText as="h2" data={null} />)).toBe('')
  })
})
