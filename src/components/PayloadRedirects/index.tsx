import type React from 'react'
import type { Page, Post } from '@/payload-types'

import { getCachedDocument } from '@/utilities/getDocument'
import { getCachedRedirects } from '@/utilities/getRedirects'
import { notFound, redirect } from 'next/navigation'
import { referencePath, IN_THE_LOOP_PATH } from '@/utilities/routes'

interface Props {
  disableNotFound?: boolean
  url: string
}

// Resolve a redirect's reference target to its canonical URL. Pages are nested
// (docPath → breadcrumb path); posts live under their stream (postPath). The
// redirects plugin is configured only for these two collections.
const referenceDestination = (relationTo: string | undefined, doc: Page | Post | null): string | null => {
  if (!doc) return null
  // Shared resolver — this was a third private copy of the collection→path map.
  return referencePath(relationTo, doc) ?? IN_THE_LOOP_PATH
}

/* This component helps us with SSR based dynamic redirects */
export const PayloadRedirects: React.FC<Props> = async ({ disableNotFound, url }) => {
  const redirects = await getCachedRedirects()()

  const redirectItem = redirects.find((redirect) => redirect.from === url)

  if (redirectItem) {
    if (redirectItem.to?.url) {
      redirect(redirectItem.to.url)
    }

    const relationTo = redirectItem.to?.reference?.relationTo
    const value = redirectItem.to?.reference?.value

    let redirectUrl: string | null

    if (typeof value === 'string') {
      // Reference stored as an id — fetch the doc to read its slug/breadcrumbs/stream.
      const document = (await getCachedDocument(relationTo!, value)()) as Page | Post
      redirectUrl = referenceDestination(relationTo, document)
    } else {
      redirectUrl = referenceDestination(relationTo, (value as Page | Post | undefined) ?? null)
    }

    if (redirectUrl) redirect(redirectUrl)
  }

  if (disableNotFound) return null

  notFound()
}
