import { stripAccent } from './accentText'

/**
 * Reading a stored value as plain words, whether it is a string or rich text.
 *
 * Most copy fields on this site are becoming rich text so an editor can bold,
 * italicise and link a phrase. That changes the stored value from a `string` to
 * a Lexical editor state, and a good deal of code needs the *words* rather than
 * the tree: an `aria-label`, an `alt`, an iframe `title`, a search haystack, a
 * `{count}` template, and every seed repair that compares stored copy against a
 * literal.
 *
 * Those call sites are the dangerous half of the conversion. Passing an object
 * where a string is expected does not throw — a template literal renders it as
 * `[object Object]`, a comparison quietly stops matching, and the page keeps
 * working while the search box finds nothing. So the flattening lives in one
 * place and every one of those sites goes through it.
 *
 * `lexicalNodeText` in `headingId.ts` already walked a Lexical *node*, but
 * handed a whole editor state (`{ root: … }`) it returns `''`, because a root
 * has neither `.text` nor a `.children` the walker recognises as its own. That
 * is the exact shape of quiet wrong answer this repo keeps re-learning, so
 * `richTextToPlain` takes the state and unwraps it.
 */

/**
 * Structural view of a Lexical node — the minimum needed to read its text
 * without depending on the editor's serialised types.
 *
 * `type` is load-bearing, not decoration. Without at least one property in
 * common with `SerializedLexicalNode` (`{ type, version }`) this is a TypeScript
 * *weak type*, and passing a real heading node's `children` to it fails with
 * TS2559 "has no properties in common".
 *
 * Lives here rather than in `headingId.ts` because it is now shared; that module
 * imports it back, so there is still one definition.
 */
export type TextishNode = {
  type?: string
  tag?: string
  text?: string
  children?: TextishNode[]
}

/** A Lexical editor state as Payload stores it. */
type EditorState = { root?: TextishNode }

/**
 * What a converted copy field holds, at any point during the conversion.
 *
 * The `string` arm is not a transitional convenience to be removed later: some
 * fields are deliberately never converted (a `<option>` label cannot carry
 * markup), and every component that renders copy should accept both so it can be
 * migrated once and left alone.
 */
export type RichTextValue = EditorState | string | null | undefined

/** Plain text of a Lexical node, including any nested link/format children. */
export const lexicalNodeText = (node: TextishNode): string =>
  node.text ?? (Array.isArray(node.children) ? node.children.map(lexicalNodeText).join('') : '')

const isEditorState = (value: unknown): value is EditorState =>
  !!value && typeof value === 'object' && 'root' in (value as Record<string, unknown>)

export type RichTextToPlainOptions = {
  /**
   * What to put between top-level blocks. Defaults to a single space, because
   * most consumers are attributes and comparisons where a newline would be
   * noise. Pass `'\n'` where the line structure matters.
   */
  separator?: string
  /**
   * Keep `[[double brackets]]` in the output. Off by default: the brackets are
   * display syntax for the brand accent colour (see `accentText`), not content,
   * so an `aria-label` or a search haystack should never contain them.
   */
  keepAccent?: boolean
}

/**
 * The words of a stored copy value, whatever shape it is in.
 *
 * Accepts a plain string (fields that have not been converted, and fields that
 * never will be), a Lexical editor state, a bare node, or nothing. Returns `''`
 * for anything it cannot read, which is the same answer a missing field gives —
 * callers already handle empty, and a thrown error inside an `aria-label` would
 * take a page down over a decoration.
 *
 * Deliberately not built on `convertLexicalToPlaintext` from
 * `@payloadcms/richtext-lexical/plaintext`: it hardcodes a blank line between
 * blocks and knows nothing about the accent convention, so wrapping it would
 * mean a second tree-walk with different rules — the drift this module exists
 * to prevent.
 */
export const richTextToPlain = (value: unknown, options: RichTextToPlainOptions = {}): string => {
  const { separator = ' ', keepAccent = false } = options

  let text: string
  if (typeof value === 'string') text = value
  else if (isEditorState(value)) {
    const children = value.root?.children
    text = Array.isArray(children)
      ? children.map(lexicalNodeText).filter(Boolean).join(separator)
      : ''
  } else if (value && typeof value === 'object') text = lexicalNodeText(value as TextishNode)
  else text = ''

  const flattened = (keepAccent ? text : stripAccent(text)).replace(/\s+/g, ' ').trim()
  return flattened
}

/**
 * Does this field actually have words in it?
 *
 * The reason this exists rather than a truthiness check: an **empty rich text is
 * a truthy object**. `{ root: { children: [ { type: 'paragraph', children: [] } ] } }`
 * is what an untouched editor stores, so `if (!heading)` — correct for a string
 * — becomes permanently false the moment the field is converted, and a component
 * that used to render nothing starts rendering an empty band on every page.
 */
export const hasRichText = (value: unknown): boolean => richTextToPlain(value) !== ''
