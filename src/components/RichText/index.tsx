import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { type DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import {
  type JSXConverters,
  JSXConvertersFunction,
  LinkJSXConverter,
  RichText as ConvertRichText,
} from '@payloadcms/richtext-lexical/react'

import { CodeBlock } from '@/blocks/Code/Component'

import { BannerBlock } from '@/blocks/Banner/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { cn } from '@/utilities/ui'
import { headingId, headingIdAt, type TextishNode } from '@/utilities/headingId'
import { TEXT_FORMAT, internalDocToHref, textConverter, type NodeTypes } from './shared'

export { TEXT_FORMAT, internalDocToHref, textConverter, type NodeTypes }

/**
 * Payload's default heading converter emits `<h2>` with no id, so nothing in a
 * rich-text body can be linked to. Article headings used to get their ids from
 * `ArticleToc` on mount, which meant a pasted `…/article#heading` URL found
 * nothing — the browser resolves a fragment while parsing the document, long
 * before React runs. Emitting the id here puts it in the server HTML.
 *
 * `parent` is the node's parent, which for a top-level heading *is* the editor
 * root — so `parent.children` is the real sibling array and `childIndex` its
 * index, and the id matches the contents list's by construction rather than by
 * two functions agreeing. The cast is needed because the published
 * `SerializedLexicalNodeWithParent` type does not declare `children`; if that
 * shape ever changes the guard falls back to the plain slug, which is what the
 * contents list computed before and no worse than today.
 */
const headingWithIdConverter: JSXConverters<NodeTypes> = {
  heading: ({ childIndex, node, nodesToJSX, parent }) => {
    const NodeTag = node.tag
    const siblings = (parent as { children?: TextishNode[] } | undefined)?.children
    const id = Array.isArray(siblings) ? headingIdAt(siblings, childIndex) : headingId(node)
    // '' means the text slugified to nothing; `id=""` is not a target, so omit it.
    return <NodeTag id={id || undefined}>{nodesToJSX({ nodes: node.children })}</NodeTag>
  },
}

// Hoisted to module level for readability, NOT as an optimisation: `RichText`
// calls a JSXConvertersFunction on every render wherever it was defined.
const buildConverters =
  (headingIds: boolean): JSXConvertersFunction<NodeTypes> =>
  ({ defaultConverters }) => ({
    ...defaultConverters,
    ...LinkJSXConverter({ internalDocToHref }),
    // Opt-in, because most pages also carry block `anchorId`s: a Section
    // anchored `file-review` next to a rich-text "## File Review" would be two
    // elements holding one id, and the browser picks which one a link means.
    ...(headingIds ? headingWithIdConverter : null),
    ...textConverter,
    blocks: {
      banner: ({ node }) => <BannerBlock className="col-start-2 mb-4" {...node.fields} />,
      mediaBlock: ({ node }) => (
        <MediaBlock
          className="col-start-1 col-span-3"
          imgClassName="m-0"
          {...node.fields}
          captionClassName="mx-auto max-w-[48rem]"
          enableGutter={false}
          disableInnerContainer={true}
        />
      ),
      code: ({ node }) => <CodeBlock className="col-start-2" {...node.fields} />,
      cta: ({ node }) => <CallToActionBlock {...node.fields} />,
    },
  })

const convertersWithHeadingIds = buildConverters(true)
const convertersPlain = buildConverters(false)

type Props = {
  data: DefaultTypedEditorState
  enableGutter?: boolean
  enableProse?: boolean
  /**
   * Give each heading an anchor id derived from its text, so it can be linked
   * to. Off by default — see `headingWithIdConverter` for why this is opt-in.
   */
  headingIds?: boolean
} & React.HTMLAttributes<HTMLDivElement>

export default function RichText(props: Props) {
  const {
    className,
    enableProse = true,
    enableGutter = true,
    headingIds = false,
    ...rest
  } = props
  return (
    <ConvertRichText
      converters={headingIds ? convertersWithHeadingIds : convertersPlain}
      className={cn(
        'payload-richtext',
        {
          container: enableGutter,
          'max-w-none': !enableGutter,
          'mx-auto prose md:prose-md dark:prose-invert': enableProse,
        },
        className,
      )}
      {...rest}
    />
  )
}
