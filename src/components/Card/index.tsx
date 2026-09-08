'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { Fragment } from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'

export type CardPostData = Pick<Post, 'slug' | 'categories' | 'meta' | 'title'> & {
  // Present on search results — the pre-computed canonical URL of the indexed doc.
  uri?: string | null
}

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  href?: string
  relationTo?: 'posts'
  showCategories?: boolean
  title?: string
}> = (props) => {
  const { cardRef, linkRef } = useClickableCard({})
  const { className, doc, href: hrefFromProps, relationTo, showCategories, title: titleFromProps } = props

  const { slug, categories, meta, title } = doc || {}
  const { description, image: metaImage } = meta || {}

  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space
  // Prefer an explicit href (search results carry a canonical `uri`); fall back to
  // the legacy posts path only when neither is supplied.
  //
  // Guarded on both parts. The old unconditional template produced
  // `/undefined/<slug>` when `relationTo` was absent — the only caller
  // (CollectionArchive on the search page) passes `href` and never `relationTo`,
  // so any search result whose `uri` had not been synced rendered a card linking
  // to a URL that cannot exist. A card with no destination is rendered inert
  // below rather than pointing somewhere invented.
  const href =
    hrefFromProps || doc?.uri || (relationTo && slug ? `/${relationTo}/${slug}` : null)

  return (
    <article
      className={cn(
        'border border-border rounded-lg overflow-hidden bg-card hover:cursor-pointer',
        className,
      )}
      ref={cardRef}
    >
      <div className="relative w-full ">
        {!metaImage && <div className="">No image</div>}
        {metaImage && typeof metaImage !== 'string' && <Media resource={metaImage} size="33vw" />}
      </div>
      <div className="p-4">
        {showCategories && hasCategories && (
          <div className="uppercase text-sm mb-4">
            {categories?.map((category, index) => {
              if (typeof category === 'object') {
                const { title: titleFromCategory } = category

                const categoryTitle = titleFromCategory || 'Untitled category'

                const isLast = index === categories.length - 1

                return (
                  <Fragment key={index}>
                    {categoryTitle}
                    {!isLast && <Fragment>, &nbsp;</Fragment>}
                  </Fragment>
                )
              }

              return null
            })}
          </div>
        )}
        {titleToUse && (
          <div className="prose">
            <h3>
              {href ? (
                <Link className="not-prose" href={href} ref={linkRef}>
                  {titleToUse}
                </Link>
              ) : (
                // Same contract as CMSLink: show the title, don't invent a URL.
                <span className="not-prose" data-link-unresolved="true">
                  {titleToUse}
                </span>
              )}
            </h3>
          </div>
        )}
        {description && <div className="mt-2">{description && <p>{sanitizedDescription}</p>}</div>}
      </div>
    </article>
  )
}
