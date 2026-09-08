// Converts a plain-text bio (paragraphs separated by blank lines) into the
// minimal Lexical richText shape Payload expects. Shared by the data-layer seed.

const textNode = (text: string, format = 0) => ({
  type: 'text',
  detail: 0,
  format,
  mode: 'normal',
  style: '',
  text,
  version: 1,
})

// Lexical stores inline emphasis as a bitmask on the text node: bold 1, italic 2.
const BOLD = 1
const ITALIC = 2

/**
 * Splits a line into runs, honouring `**bold**` and `*italic*`.
 *
 * Seeded copy is plain strings, so before this there was no way to seed the
 * emphasis the design reference uses — the AAMLE panel bolds "Brigham and
 * Associates, Inc." and italicises "Guides to the Evaluation of Permanent
 * Impairment". Without a parser the richText conversion would have shipped and
 * changed nothing visible.
 *
 * Bold is matched first so `**x**` never reads as an empty italic. A marker with
 * no closing partner is left as a literal asterisk rather than swallowed.
 */
const inlineNodes = (text: string) => {
  const nodes: ReturnType<typeof textNode>[] = []
  const pattern = /\*\*([^*]+)\*\*|\*([^*]+)\*/g
  let last = 0
  let m: RegExpExecArray | null

  while ((m = pattern.exec(text)) !== null) {
    if (m.index > last) nodes.push(textNode(text.slice(last, m.index)))
    nodes.push(m[1] !== undefined ? textNode(m[1], BOLD) : textNode(m[2]!, ITALIC))
    last = m.index + m[0].length
  }
  if (last < text.length) nodes.push(textNode(text.slice(last)))

  return nodes.length ? nodes : [textNode(text)]
}

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: inlineNodes(text),
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: 0,
  version: 1,
})

const heading = (text: string, tag: 'h2' | 'h3') => ({
  type: 'heading',
  tag,
  children: inlineNodes(text),
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
})

// A blank-line-separated block beginning with `## ` (or `### `) becomes a real
// Lexical heading node — this is how article bodies get the H2 sections the
// scroll-spy TOC keys off. Everything else is a paragraph. (`.` doesn't match
// newlines without the `m` flag, so multi-line blocks never match.)
const blockToNode = (block: string) => {
  const m = /^(#{2,3})\s+(.+)$/.exec(block)
  if (m) return heading(m[2].trim(), m[1].length === 3 ? 'h3' : 'h2')
  return paragraph(block)
}

export const plainTextToLexical = (text?: string | null) => {
  const blocks = (text || '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

  return {
    root: {
      type: 'root',
      children: blocks.length ? blocks.map(blockToNode) : [paragraph('')],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  }
}
