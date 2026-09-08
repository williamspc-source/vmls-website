import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { eventPath } from '@/utilities/routes'

// Consumes the `events-sitemap` cache tag that revalidateEvent already purges.
const getEventsSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://example.com'

    const results = await payload.find({
      collection: 'events',
      overrideAccess: false,
      draft: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      where: { _status: { equals: 'published' } },
      select: { slug: true, updatedAt: true },
    })

    const dateFallback = new Date().toISOString()

    return results.docs
      ? results.docs
          .map((doc) => {
            const path = eventPath(doc?.slug)
            return path ? { loc: `${SITE_URL}${path}`, lastmod: doc.updatedAt || dateFallback } : null
          })
          .filter((entry): entry is { loc: string; lastmod: string } => entry !== null)
      : []
  },
  ['events-sitemap'],
  {
    tags: ['events-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getEventsSitemap()

  return getServerSideSitemap(sitemap)
}
