import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { specialistPath } from '@/utilities/routes'

// Consumes the `specialists-sitemap` cache tag that revalidateSpecialist already
// purges — previously that tag had no route, so specialist profiles never appeared
// in any sitemap.
const getSpecialistsSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://example.com'

    const results = await payload.find({
      collection: 'specialists',
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
            const path = specialistPath(doc?.slug)
            return path ? { loc: `${SITE_URL}${path}`, lastmod: doc.updatedAt || dateFallback } : null
          })
          .filter((entry): entry is { loc: string; lastmod: string } => entry !== null)
      : []
  },
  ['specialists-sitemap'],
  {
    tags: ['specialists-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getSpecialistsSitemap()

  return getServerSideSitemap(sitemap)
}
