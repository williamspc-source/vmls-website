import { hasRichText } from '@/utilities/lexicalText'
import { InlineRichText } from '@/components/RichText/Inline'
import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'

import RichText from '@/components/RichText'
import { Media } from '@/components/Media'
import { Icon } from '@/components/Icon'
import { CMSLink } from '@/components/Link'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { generateMeta } from '@/utilities/generateMeta'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { mediaFocal, focalImgStyle } from '@/utilities/focalPoint'
import { headingIdAt, headingLabel, type TextishNode } from '@/utilities/headingId'
import { postPath, IN_THE_LOOP_PATH } from '@/utilities/routes'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { getCrumbSettings, postCrumbs } from '@/utilities/breadcrumbs'
import { ArticleToc } from './ArticleToc'

import type { ArticleSetting, Category, Post, Stream } from '@/payload-types'

type Args = { params: Promise<{ stream?: string; slug?: string }> }

// "5 May 2026"-style date used across the article chrome.
const fmtDate = (value?: string | null): string =>
  value
    ? new Date(value).toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : ''

// Build a table of contents from the top-level h2 headings in the post body.
//
// The ids come from `headingIdAt` over the same sibling array the rich-text
// heading converter walks, so a contents link and the heading it points at
// cannot disagree — they are one function called twice, not two copies of one.
// `headingIdAt` also disambiguates two headings with identical words; mapping
// over the full children array (rather than filtering first) is what keeps the
// index it needs.
const tocFromContent = (post: Post): { id: string; text: string }[] => {
  if (post.showToc === false) return []
  const children = (post.content?.root?.children as TextishNode[] | undefined) ?? []
  return children
    .map((n, i) =>
      n.type === 'heading' && n.tag === 'h2'
        ? { id: headingIdAt(children, i), text: headingLabel(n) }
        : null,
    )
    .filter((i): i is { id: string; text: string } => Boolean(i?.id && i.text))
}

// Resolve the URL for an In-the-Loop post; a stream-less legacy post has no
// canonical article path, so link to the hub rather than a URL that 404s.
const postHref = (post: Pick<Post, 'slug' | 'stream'>): string =>
  postPath(post) ?? IN_THE_LOOP_PATH

// Time-based safety net: a stale article self-heals within the hour even if an
// on-demand revalidation hook is missed.
export const revalidate = 3600

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const res = await payload.find({
    collection: 'posts',
    draft: false,
    depth: 1,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
  })
  return res.docs
    .filter((d) => d.slug && typeof d.stream === 'object' && (d.stream as Stream)?.slug)
    .map((d) => ({ stream: (d.stream as Stream).slug, slug: d.slug }))
}

export default async function InTheLoopArticlePage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { stream: streamParam = '', slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const url = `/in-the-loop/${streamParam}/${decodedSlug}`

  const post = await queryPostBySlug({ slug: decodedSlug })
  if (!post) return <PayloadRedirects url={url} />

  const settings = (await getCachedGlobal('article-settings', 1)()) as ArticleSetting
  const sidebarCards = Array.isArray(settings?.sidebarCards) ? settings.sidebarCards : []
  const labels = (settings?.labels ?? {}) as Record<string, string | null | undefined>

  const stream = typeof post.stream === 'object' && post.stream ? post.stream : null
  const streamTitle = stream?.title

  // The trail ends on the stream, still linked — the reference does this on 23 of
  // its 24 article pages, and it keeps the crumb from repeating the <h1> directly
  // beneath it. It links to the stream's own listing rather than an anchor into
  // the hub, which is why the old hub-anchor mapping is gone.
  const crumbSettings = await getCrumbSettings()
  const crumbs = postCrumbs(stream, {
    home: crumbSettings.homeLabel,
    section: labels.breadcrumbSectionLabel,
  })

  const heroImage = typeof post.heroImage === 'object' ? post.heroImage : null

  // Byline: prefer the free-text author fields, then fall back to a linked
  // Team member / Specialist source.
  const author = post.author ?? {}
  const src =
    author.source && typeof author.source === 'object' && typeof author.source.value === 'object'
      ? (author.source.value as unknown as Record<string, unknown>)
      : null
  const authorName = author.name || (src?.title as string) || (src?.name as string) || ''
  const authorRole = author.role || (src?.role as string) || (src?.position as string) || ''
  const authorBio = author.bio || (typeof src?.bio === 'string' ? (src.bio as string) : '') || ''
  // Author avatar: a per-post uploaded photo overrides the linked person's
  // profile photo (Team member / Specialist via `author.source`); when neither
  // exists we keep the placeholder icon.
  const authorPhoto =
    (author.photo && typeof author.photo === 'object' && author.photo) ||
    (src && typeof src.photo === 'object' && src.photo) ||
    null
  const authorFocal = mediaFocal(authorPhoto, 56) // article byline avatar

  const toc = tocFromContent(post)

  const related = Array.isArray(post.relatedPosts)
    ? post.relatedPosts.filter((p): p is Post => typeof p === 'object' && p !== null)
    : []

  const tags = Array.isArray(post.categories)
    ? post.categories
        .filter((c): c is Category => typeof c === 'object' && c !== null)
        .map((c) => c.title)
        .filter((t): t is string => Boolean(t))
    : []

  return (
    <article>
      {draft && <LivePreviewListener />}
      <PayloadRedirects disableNotFound url={url} />

      {/* ── Hero ──────────────────────────────────────────── */}
      <div className="art-hero vf-on-dark">
        {heroImage ? (
          <Media
            resource={heroImage}
            className="art-hero__media"
            imgClassName="art-hero__img"
          />
        ) : null}
        <div className="art-hero-overlay" />
        <div className="art-hero-content">
          <div className="container">
            {/* The trail sits in the hero rather than in a bar below it, and it
                replaces the stream pill: the pill named the stream unlinked, the
                trail's last crumb names it linked. Stacking both would print the
                same word twice within 40px. */}
            {crumbs.length >= 2 ? (
              <Breadcrumbs
                items={crumbs}
                separator={crumbSettings.separator}
                label={crumbSettings.navLabel}
              />
            ) : streamTitle ? (
              <div className="art-hero-tag">
                {stream?.icon ? <Icon name={stream.icon} className="size-3" /> : null}
                {streamTitle}
              </div>
            ) : null}
            <h1 className="art-hero-title">{post.title}</h1>
          </div>
        </div>
      </div>

      {/* ── Meta bar ──────────────────────────────────────── */}
      <div className="art-meta-bar">
        <div className="container">
          <div className="art-meta-inner">
            <div className="art-meta-right">
              {authorName ? (
                <div className="art-meta-author">
                  {hasRichText(labels.bylinePrefix) ? <InlineRichText data={labels.bylinePrefix} /> : 'By '}
                  <strong>{authorName}</strong>
                  {authorRole ? `, ${authorRole}` : ''}
                </div>
              ) : null}
              {post.publishedAt ? (
                <div className="art-meta-date">{fmtDate(post.publishedAt)}</div>
              ) : null}
              {post.readTime ? (
                <div className="art-meta-read">
                  {post.readTime} {labels.minReadSuffix || 'min read'}
                </div>
              ) : null}
              <div className="art-share-btns">
                <a
                  aria-label={labels.shareLinkedinLabel || 'Share on LinkedIn'}
                  className="art-share-btn"
                  href="https://www.linkedin.com/sharing/share-offsite/"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  in
                </a>
                <a
                  aria-label={labels.shareCopyLabel || 'Copy link'}
                  className="art-share-btn"
                  href={url}
                >
                  <Icon name="link" className="size-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3-column layout ───────────────────────────────── */}
      <div className="container">
        <div className="art-layout">
          {/* LEFT: table of contents (scroll-spy client component) */}
          {toc.length ? (
            <ArticleToc items={toc} label={hasRichText(labels.toc) ? <InlineRichText data={labels.toc} /> : 'In This Article'} />
          ) : (
            <aside aria-hidden className="art-toc" />
          )}

          {/* CENTRE: article body */}
          <article className="art-body">
            {/* `headingIds` puts an anchor on every heading in the server HTML,
                so a pasted …#some-heading URL lands on it. The ids and the
                contents list above both come from `headingIdAt`. */}
            <RichText data={post.content} enableGutter={false} enableProse={false} headingIds />

            {/* "Downloads / attachments" — the field existed and nothing rendered
                it, so an editor could attach a PDF that no reader could reach. */}
            {Array.isArray(post.attachments) && post.attachments.length ? (
              <div className="art-attachments">
                <h2 className="art-attachments__heading">{hasRichText(labels.attachmentsHeading) ? <InlineRichText data={labels.attachmentsHeading} /> : 'Downloads'}</h2>
                <ul className="art-attachments__list">
                  {post.attachments.map((a, i) => {
                    const file = a?.file && typeof a.file === 'object' ? a.file : null
                    if (!file?.url) return null
                    return (
                      <li key={i}>
                        <a href={file.url} className="art-attachment" download>
                          <Icon name="file-text" className="size-5" />
                          <span>
                            {hasRichText(a?.label) ? (
                              <InlineRichText data={a?.label} />
                            ) : (
                              file.filename || 'Download'
                            )}
                          </span>
                        </a>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ) : null}

            {tags.length ? (
              <div className="art-tags-footer">
                <span className="art-tags-label">{hasRichText(labels.topics) ? <InlineRichText data={labels.topics} /> : 'Topics'}:</span>
                {tags.map((tag) => (
                  <span key={tag} className="art-tag-pill">
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            {authorName ? (
              <div className="art-author-card">
                <div className="art-author-avatar">
                  {authorFocal.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={authorFocal.url}
                      alt={authorName}
                      style={focalImgStyle(authorFocal.focus, authorFocal.zoom, {
                        width: '100%',
                        height: '100%',
                      })}
                    />
                  ) : (
                    <Icon name="user" className="size-6" weight="light" />
                  )}
                </div>
                <div>
                  <div className="art-author-name">{authorName}</div>
                  <InlineRichText as="div" className="art-author-role" data={authorRole} />
                  <InlineRichText as="div" className="art-author-bio" data={authorBio} />
                </div>
              </div>
            ) : null}
          </article>

          {/* RIGHT: sidebar */}
          <aside className="art-sidebar">
            {related.length ? (
              <div className="art-related-section">
                <div className="art-related-label">{hasRichText(labels.related) ? <InlineRichText data={labels.related} /> : 'You Might Also Like'}</div>
                <div className="art-related-list">
                  {related.map((rp) => {
                    const rpStream =
                      typeof rp.stream === 'object' && rp.stream ? rp.stream : null
                    return (
                      <a key={rp.id} className="art-related-item" href={postHref(rp)}>
                        {rpStream?.title ? (
                          <span className="art-related-tag">{rpStream.title}</span>
                        ) : null}
                        <span className="art-related-title">{rp.title}</span>
                        {rp.publishedAt ? (
                          <span className="art-related-date">{fmtDate(rp.publishedAt)}</span>
                        ) : null}
                      </a>
                    )
                  })}
                </div>
              </div>
            ) : null}

            {sidebarCards.map((card, i) => {
              const dark = i === 0
              return (
                <div key={card.id ?? i} className={dark ? 'art-cta-card' : 'art-cta-card-2'}>
                  {dark && card.icon ? (
                    <div className="art-cta-card-icon">
                      <Icon name={card.icon} className="size-6" weight="regular" />
                    </div>
                  ) : null}
                  <InlineRichText as="h4" data={card.heading} />
                  <InlineRichText as="p" data={card.body} />
                  {/* Spread the whole link rather than naming props: listing them
                      individually silently dropped `icon`, so Article Settings'
                      per-card link Icon picker did nothing here while working
                      everywhere else. */}
                  <CMSLink
                    className={dark ? 'art-cta-btn' : 'art-cta-btn-2'}
                    {...card.link}
                  />
                </div>
              )
            })}
          </aside>
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const post = await queryPostBySlug({ slug: decodeURIComponent(slug) })
  return generateMeta({ doc: post as never, url: postPath(post) })
}

// The [stream] segment is only for the URL folder — the post is looked up by slug.
const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'posts',
    draft,
    depth: 2,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: { slug: { equals: slug } },
  })
  return result.docs?.[0] || null
})
