import type { Payload } from 'payload'

import { archiveHasContent, type ArchiveSource } from './ArchiveBlock/query'
import { featuredHasContent, type FeaturedSource } from './FeaturedArticles/query'
import { resourcesHasContent, type ResourcesSource } from './ResourcesGrid/query'

/**
 * Answers "would this block render nothing at all?" for the sticky Section Nav,
 * so a tab can be dropped alongside the section it points at.
 *
 * Every answer is reached through the same query builder the block itself uses
 * (`<Block>/query.ts`), never a second copy — see the header of
 * `ArchiveBlock/query.ts` for why.
 *
 * The predicate is deliberately `hideWhenEmpty && empty` and not just `empty`:
 * a section with the tickbox off still renders its heading and band, so its tab
 * must stay. That keeps one field driving both halves, which is what makes it
 * impossible for the nav to hide a tab for a section the visitor can see.
 *
 * Anything this cannot decide — a block type with no query, or a nav item whose
 * anchor matches no sibling — keeps its tab. A nav that silently drops items it
 * does not understand would be the worse failure: the section is right there on
 * the page and the visitor has lost the way to reach it.
 */

export type MaybeHideable = {
  blockType?: string
  anchorId?: string | null
  hideWhenEmpty?: boolean | null
} & Record<string, unknown>

type BlockNode = MaybeHideable & {
  content?: unknown
  columns?: unknown
}

/**
 * Every block on a page, flattened out of the Section/Row containers.
 *
 * A hideable section does not have to be a direct sibling of the nav — an editor
 * can drop one inside a Section, and then a nav that only scanned the top level
 * would keep a tab for a section that hid itself. Nesting is bounded to
 * `Section > Row > block`, so this walk terminates with it.
 */
export const flattenBlocks = (blocks: unknown[] | null | undefined): BlockNode[] => {
  if (!Array.isArray(blocks)) return []
  return blocks.flatMap((raw) => {
    const block = raw as BlockNode
    if (!block || typeof block !== 'object') return []
    // `columns` is the Row block's array of columns — and ALSO Archive's and
    // ResourcesGrid's "how many per row" select, where it holds the string '3'.
    // Reading it without the isArray guard threw `flatMap is not a function` and
    // 500'd /in-the-loop, which is the shared-field-name trap CLAUDE.md records
    // for the orphan-field guard, here in its runtime form.
    const columns = Array.isArray(block.columns)
      ? (block.columns as { content?: unknown }[])
      : []
    const children: BlockNode[] = [
      ...flattenBlocks(block.content as unknown[]),
      ...columns.flatMap((c) => flattenBlocks(c?.content as unknown[])),
    ]
    return [block, ...children]
  })
}

export const blockRendersNothing = async (
  payload: Payload,
  block: MaybeHideable,
  now: Date,
): Promise<boolean> => {
  if (!block?.hideWhenEmpty) return false

  switch (block.blockType) {
    case 'archive':
      return !(await archiveHasContent(payload, block as ArchiveSource, now))
    case 'featuredArticles':
      return !(await featuredHasContent(payload, block as FeaturedSource))
    case 'resourcesGrid':
      return !(await resourcesHasContent(payload, block as ResourcesSource))
    default:
      return false
  }
}

/**
 * The anchor ids on this page whose section will render nothing.
 *
 * Only anchors the caller asks about are queried, so a page with a long layout
 * and a three-item nav costs three counts.
 */
export const hiddenAnchorIds = async (
  payload: Payload,
  siblings: unknown[] | null | undefined,
  anchorIds: string[],
  now: Date,
): Promise<Set<string>> => {
  const wanted = new Set(anchorIds)
  const byAnchor = new Map<string, MaybeHideable>()
  for (const block of flattenBlocks(siblings)) {
    const anchor = typeof block.anchorId === 'string' ? block.anchorId : null
    // First match wins, mirroring the browser's resolution of a duplicated #id.
    if (anchor && wanted.has(anchor) && !byAnchor.has(anchor)) byAnchor.set(anchor, block)
  }

  const entries = [...byAnchor.entries()]
  const results = await Promise.all(
    entries.map(async ([anchor, block]) =>
      (await blockRendersNothing(payload, block, now)) ? anchor : null,
    ),
  )
  return new Set(results.filter((a): a is string => a !== null))
}
