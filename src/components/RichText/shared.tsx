import React from 'react'

import {
  type DefaultNodeTypes,
  type SerializedBlockNode,
  type SerializedLinkNode,
} from '@payloadcms/richtext-lexical'
import { type JSXConverters } from '@payloadcms/richtext-lexical/react'

import type {
  BannerBlock as BannerBlockProps,
  CallToActionBlock as CTABlockProps,
  MediaBlock as MediaBlockProps,
} from '@/payload-types'
import type { CodeBlockProps } from '@/blocks/Code/Component'
import { accentText } from '@/utilities/accentText'
import { colorClass } from '@/fields/richTextColors'
import { referencePath, IN_THE_LOOP_PATH } from '@/utilities/routes'

/**
 * The parts of the rich-text rendering both renderers need, with no block
 * components attached.
 *
 * `./index` renders block-level rich text and therefore imports Banner, Media,
 * Code and CTA — which reach `@payloadcms/ui` and its stylesheets. `./Inline`
 * renders a heading or a button label and needs none of that, so importing it
 * from `./index` would pull the entire admin UI chain into every heading on the
 * site. It also made the inline renderer untestable: vitest cannot load the
 * `.scss` those components drag in, and the spec failed to import rather than
 * failing an assertion.
 *
 * So the shared pieces live here: one `text` converter, one link resolver, one
 * format bitmask. Two copies would be two things that can drift, and a drifted
 * pair renders perfectly while one side quietly stops honouring the accent
 * brackets.
 */

export type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<CTABlockProps | MediaBlockProps | BannerBlockProps | CodeBlockProps>

export const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const { value, relationTo } = linkNode.fields.doc!
  if (typeof value !== 'object') {
    throw new Error('Expected value to be an object')
  }
  // Same single resolver CMSLink uses. Previously this branched on `posts` and
  // fell through to docPath() for everything else, so a rich-text link to a
  // specialist produced a top-level `/<slug>` that 404s.
  //
  // `referencePath` returns null in more cases than one: a Post with no stream, a
  // document with no slug, and any `relationTo` outside LINKABLE_COLLECTIONS. The
  // Lexical link converter has to return a string, so there is no "render it
  // unlinked" option here as there is in CMSLink — the hub is the least-wrong
  // destination for an editor-authored internal link we cannot resolve, and it is
  // a real page rather than a 404.
  return referencePath(relationTo, value) ?? IN_THE_LOOP_PATH
}

// Lexical text-format bitmask (bold/italic/etc.), mirrored so we can re-wrap
// accent-transformed text without importing from deep inside the package.
export const TEXT_FORMAT = {
  BOLD: 1,
  ITALIC: 2,
  STRIKETHROUGH: 4,
  UNDERLINE: 8,
  CODE: 16,
  SUBSCRIPT: 32,
  SUPERSCRIPT: 64,
} as const

/**
 * The colour an editor picked from the toolbar, if any.
 *
 * `TextStateFeature` stores it as Lexical NodeState, which serialises under `$`
 * (`NODE_STATE_KEY` in lexical 0.41) — `{ type: 'text', text: '…', $: { color:
 * 'brand' } }`. The serialised node types do not describe that key, hence the
 * cast; the shape is validated by `colorClass`, which returns `undefined` for
 * anything that is not a live palette key, so a hand-edited or retired value
 * degrades to uncoloured text rather than to a class nothing paints.
 *
 * ── This function is the reason the control works at all ────────────────────
 * Payload's bundled `TextJSXConverter` reads `node.format` and nothing else —
 * there is no reference to node state anywhere in its converters. Enabling the
 * toolbar feature without this branch would give an editor a swatch that colours
 * the text in the admin, saves cleanly, and renders no colour on the page: the
 * exact "looks editable, silently does nothing" failure the feature was added to
 * fix. Guarded by `tests/int/inlineRichText.int.spec.tsx`.
 */
const nodeColorClass = (node: unknown): string | undefined =>
  colorClass((node as { $?: { color?: unknown } })?.$?.color as string | undefined)

/**
 * Honour the VERIFY [[accent]] convention inside rich text, and reproduce the
 * default converter's format handling so bold/italic/etc. still work.
 */
export const textConverter: JSXConverters<NodeTypes> = {
  text: ({ node }) => {
    const { format } = node
    let content: React.ReactNode = accentText(node.text)
    if (format & TEXT_FORMAT.BOLD) content = <strong>{content}</strong>
    if (format & TEXT_FORMAT.ITALIC) content = <em>{content}</em>
    if (format & TEXT_FORMAT.STRIKETHROUGH)
      content = <span style={{ textDecoration: 'line-through' }}>{content}</span>
    if (format & TEXT_FORMAT.UNDERLINE)
      content = <span style={{ textDecoration: 'underline' }}>{content}</span>
    if (format & TEXT_FORMAT.CODE) content = <code>{content}</code>
    if (format & TEXT_FORMAT.SUBSCRIPT) content = <sub>{content}</sub>
    if (format & TEXT_FORMAT.SUPERSCRIPT) content = <sup>{content}</sup>

    // Outermost, and after the format wrappers, so `.vf-tc-* .vf-accent` still
    // matches a [[bracketed]] phrase inside a coloured run — `vf-tc--inline` is
    // what then lets the editor's explicit pick win over that accent default.
    const colour = nodeColorClass(node)
    if (colour) content = <span className={`${colour} vf-tc--inline`}>{content}</span>

    return content
  },
}
