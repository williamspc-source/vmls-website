import { InlineRichText } from '@/components/RichText/Inline'
import { mediaSrc } from '@/utilities/mediaSrc'
import type { Post, Category, Stream } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import { Section } from '@/components/Section'
import { cn } from '@/utilities/ui'
import { toClassName } from '@/utilities/cssClass'
import { postPath, IN_THE_LOOP_PATH } from '@/utilities/routes'
import { FeaturedArticlesClient, type FeaturedSlide } from './FeaturedArticlesClient'
import { featuredPostsWhere, featuredSelectedPosts } from './query'

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const formatDate = (value?: string | null): string => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`
}


// Resolve a post's byline name from the free-text author fields, falling back
// to a linked Team member / Specialist (source relationship), then authors.
const resolveAuthorName = (post: Post): string | null => {
  const author = post.author
  if (author?.name) return author.name

  const source = author?.source
  if (source && typeof source === 'object' && source.value && typeof source.value === 'object') {
    const person = source.value as { title?: string | null }
    if (person.title) return person.title
  }

  const populated = post.populatedAuthors
  if (Array.isArray(populated) && populated.length > 0 && populated[0]?.name) {
    return populated[0].name
  }
  return null
}

// Category/stream label — prefer the post's OWN first category so each slide
// shows its specific tag, falling back to the stream title.
//
// The fallback is why `badge` is passed in. A featured post with no category
// falls back to its stream, and the stream that makes a post featured is itself
// called "Featured" — so the card printed the badge word twice, side by side
// ("FEATURED  FEATURED"). Seeding the three featured articles with real topic
// chips fixes today's data; this comparison is what stops it returning the next
// time anyone adds a post to that stream without one. A chip that merely repeats
// the badge carries no information, so dropping it loses nothing.
const postTagLabel = (post: Post, stream: Stream | null, badge: string): string | null => {
  const firstCategory = Array.isArray(post.categories)
    ? (post.categories.find((c) => typeof c === 'object') as Category | undefined)
    : undefined
  const label = firstCategory?.title || stream?.title || null
  if (!label) return null
  return label.trim().toLowerCase() === badge.trim().toLowerCase() ? null : label
}

const toSlide = (post: Post, badgeLabel: string, bylinePrefix: string): FeaturedSlide => {
  const stream = typeof post.stream === 'object' && post.stream ? (post.stream as Stream) : null
  const href = postPath(post) ?? IN_THE_LOOP_PATH

  const name = resolveAuthorName(post)
  const dateLabel = formatDate(post.publishedAt)
  const bylineParts = [name, dateLabel].filter(Boolean)
  const byline = bylineParts.length ? `${bylinePrefix} ${bylineParts.join('  ·  ')}` : null

  return {
    imageUrl: mediaSrc(post.heroImage, 565 * 2), // .ni-featured-img, measured 565px
    badge: badgeLabel,
    category: postTagLabel(post, stream, badgeLabel),
    title: post.title,
    excerpt: post.excerpt ?? null,
    byline,
    href,
  }
}

type Props = {
  id?: string
  eyebrow?: string | null
  source?: 'auto' | 'manual' | null
  posts?: (number | string | Post)[] | null
  limit?: number | null
  anchorId?: string | null
  background?: 'white' | 'muted' | 'accent' | 'primary' | 'dark' | null
  cssClass?: string | string[] | null
  bare?: boolean
  autoplay?: boolean | null
  interval?: number | null
  showArrows?: boolean | null
  showDots?: boolean | null
  hideWhenEmpty?: boolean | null
}

export const FeaturedArticlesBlock: React.FC<Props> = async (props) => {
  const { id, eyebrow, source, limit: limitFromProps, anchorId, background, cssClass, bare } = props

  // Read defensively — payload-types is not regenerated yet, so these admin
  // fields are not on the Props type. Fall back to the original literals.
  const badgeLabel = (props as { badgeLabel?: string | null }).badgeLabel || 'Featured'
  const bylinePrefix = (props as { bylinePrefix?: string | null }).bylinePrefix || 'By:'
  const ctaLabel = (props as { ctaLabel?: string | null }).ctaLabel || 'Read Full Article →'
  const { autoplay, interval, showArrows, showDots, hideWhenEmpty } = props

  const limit = limitFromProps || 6
  let posts: Post[] = []

  if (source === 'manual') {
    // Manual selection — use the populated relationship docs, preserving order.
    posts = featuredSelectedPosts(props)
  } else {
    const payload = await getPayload({ config: configPromise })

    const fetched = await payload.find({
      collection: 'posts',
      // Local API defaults to overrideAccess: true, which would feature drafts.
      overrideAccess: false,
      // depth 2 so the author's linked Team/Specialist, categories and stream
      // are populated for the slide byline/tag/href.
      depth: 2,
      limit,
      sort: '-publishedAt',
      // Same filter the Section Nav counts against (./query.ts).
      where: await featuredPostsWhere(payload),
    })
    posts = fetched.docs
  }

  const slides = posts.map((p) => toSlide(p, badgeLabel, bylinePrefix))

  // With nothing to show, an unticked box keeps the (empty) section as it was —
  // ticked, the section goes, and the sticky nav on /in-the-loop drops its
  // `#featured` tab in the same pass. This replaces a bare `<div id>` fallback
  // that existed only to stop links.e2e.spec.ts flagging a tab pointing at a
  // missing id; with the tab gone there is no link left to satisfy.
  if (slides.length === 0 && hideWhenEmpty) return null

  return (
    <Section
      bare={bare}
      background={background || 'white'}
      id={anchorId || `block-${id}`}
      className={cn('ni-featured', toClassName(cssClass))}
    >
      <InlineRichText as="div" className="ni-featured-label" data={eyebrow} />
      {/* An empty carousel is not a preview of anything — the arrows would draw
          and do nothing, and there are no dots to draw. With the box unticked
          and no featured posts, the band and its label are what an editor sees. */}
      {slides.length > 0 ? (
        <FeaturedArticlesClient
          slides={slides}
          ctaLabel={ctaLabel}
          autoplay={autoplay}
          interval={interval}
          showArrows={showArrows}
          showDots={showDots}
        />
      ) : null}
    </Section>
  )
}
