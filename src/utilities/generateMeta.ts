import type { Metadata } from 'next'

import type { Page, Post } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'
import { getCachedGlobal } from './getGlobals'

const mediaURL = (image: unknown, fallback: string): string => {
  const serverUrl = getServerSideURL()

  if (image && typeof image === 'object' && 'url' in image) {
    const media = image as { url?: string | null; sizes?: { og?: { url?: string | null } } }
    const ogUrl = media.sizes?.og?.url
    if (ogUrl) return serverUrl + ogUrl
    if (media.url) return serverUrl + media.url
  }

  return fallback
}

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | null
  /**
   * Canonical path for this document, from `src/utilities/routes.ts`.
   *
   * Required in practice: `og:url` used to be
   * `Array.isArray(doc?.slug) ? doc.slug.join('/') : '/'`, and `slug` is a string
   * on every collection — so the test never passed and EVERY page, post,
   * specialist and event advertised `og:url: "/"`. Sharing any inner page
   * attributed the preview to the homepage.
   */
  url?: string | null
}): Promise<Metadata> => {
  const { doc, url } = args

  // Site-wide defaults (name + fallback social image) come from Site Settings.
  const settings = await getCachedGlobal('site-settings', 1)()
  const siteName = settings?.siteName || 'VERIFY Medico-Legal Solutions'
  const fallbackOg = mediaURL(settings?.socialImage, getServerSideURL() + '/website-template-OG.webp')

  // Per-page SEO image (plugin-seo) overrides the site default.
  const ogImage = mediaURL(doc?.meta?.image, fallbackOg)

  const title = doc?.meta?.title ? `${doc.meta.title} | ${siteName}` : siteName

  return {
    description: doc?.meta?.description,
    openGraph: mergeOpenGraph({
      description: doc?.meta?.description || '',
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      // Absolute: og:url must be a full URL, not a path.
      url: `${getServerSideURL()}${url && url.startsWith('/') ? url : '/'}`,
    }),
    title,
  }
}
