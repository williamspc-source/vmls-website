import React from 'react'

import {
  type JSXConverters,
  type JSXConvertersFunction,
  LinkJSXConverter,
  RichText as ConvertRichText,
} from '@payloadcms/richtext-lexical/react'

import { accentText } from '@/utilities/accentText'
import { colorClass } from '@/fields/richTextColors'
import { hasRichText, type RichTextValue } from '@/utilities/lexicalText'
import { cn } from '@/utilities/ui'

import { internalDocToHref, textConverter, type NodeTypes } from './shared'

/**
 * Rich text rendered *inline* — inside a heading, a label, a button, a card title.
 *
 * ## Why the default renderer will not do
 *
 * `<RichText>` wraps its content in `<div class="payload-richtext …"><p>…</p></div>`.
 * Put that inside an `<h2>` and you get `<h2><p>Heading</p></h2>`: a block
 * element inside a heading, the paragraph's own typography fighting the
 * heading's, and **no error anywhere**. It renders. It just renders wrong, which
 * is the failure mode this codebase is least able to notice.
 *
 * So this component takes the tag from the caller — `<InlineRichText as="h2">`
 * still emits `<h2 class="section-title">` — and converts paragraphs to inline
 * content rather than to `<p>`.
 *
 * ## Why a paragraph becomes a line break
 *
 * Headings on this site are two-line lockups: "Ensuring Accuracy," /
 * "Empowering Justice". Those used to be a `textarea` and a literal `\n`, which
 * `accentText` turned into a `<br/>`. In a rich-text field the editor presses
 * Enter and gets a second *paragraph*, so a second paragraph has to mean the
 * same thing it always meant — the next line of the same heading. Anything else
 * silently reflows every lockup on the site the day its field is converted.
 *
 * ## Why it still accepts a plain string
 *
 * The conversion runs in waves, so at any moment some callers hold a converted
 * field and some hold a string. Accepting both means a component can be migrated
 * once and left alone, instead of being edited again when its field's turn
 * comes — and it means a field that is deliberately never converted can still
 * use this component for its accent handling.
 */

/**
 * Paragraphs render inline, separated by `<br/>`.
 *
 * `childIndex` is the paragraph's position among the root's children, so the
 * break goes *before* every paragraph but the first — which is what makes a
 * two-paragraph value render as two lines of one heading rather than as two
 * headings or as one run-on line.
 */
const inlineParagraphConverter: JSXConverters<NodeTypes> = {
  paragraph: ({ childIndex, node, nodesToJSX }) => (
    <React.Fragment>
      {childIndex ? <br /> : null}
      {nodesToJSX({ nodes: node.children })}
    </React.Fragment>
  ),
}

const inlineConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
  ...textConverter,
  ...inlineParagraphConverter,
})

type Props = {
  /**
   * The element to render.
   *
   * Omit it — along with `className`, `id` and `colour` — and nothing is
   * wrapped: the words go straight into whatever element the caller already
   * has. That case is common (`<a class="card-link"><InlineRichText data={x} /></a>`)
   * and a default wrapper there is not free. Measured: defaulting to `<span>`
   * added 48 elements across the site and produced
   * `<span class="ni-card-link"><span>Read More →</span></span>`, which is the
   * kind of nesting that quietly changes what `.parent span` selectors match —
   * exactly how the Heading block lost its accent colour earlier in this pass.
   */
  as?: React.ElementType
  /** A converted field, or a plain string from one not converted yet. */
  data?: RichTextValue
  className?: string
  /** A palette key from the block's `textColour` field. */
  colour?: string | null
  id?: string
}

export const InlineRichText: React.FC<Props> = ({ as, data, className, colour, id }) => {
  const classes = cn(className, colorClass(colour))
  // No element asked for and nothing to hang on one → add no element.
  const Tag = as ?? (classes || id ? 'span' : React.Fragment)
  const tagProps = Tag === React.Fragment ? {} : { className: classes || undefined, id }

  // A string still goes through `accentText`, so `[[brackets]]` behave the same
  // either side of a conversion.
  if (typeof data === 'string') {
    if (!hasRichText(data)) return null
    return <Tag {...tagProps}>{accentText(data)}</Tag>
  }

  // `hasRichText` rather than a truthiness check, and the `!data` half is what
  // narrows the type: an untouched rich-text field is an empty *object*, which
  // is truthy, so `if (!data)` alone would stop being false the day a field is
  // converted and every blank heading would start rendering an empty element.
  if (!data || !hasRichText(data)) return null

  return (
    <Tag {...tagProps}>
      <ConvertRichText
        converters={inlineConverters}
        data={data as never}
        // Without this the upstream component wraps everything in its own
        // `<div class="payload-richtext">`, which inside a heading is a block
        // element in an inline context.
        disableContainer
        disableIndent
        disableTextAlign
      />
    </Tag>
  )
}

export default InlineRichText
