import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { docPath } from '@/utilities/routes'

const getPagesSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://example.com'

    const results = await payload.find({
      collection: 'pages',
      overrideAccess: false,
      draft: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      where: {
        _status: {
          equals: 'published',
        },
      },
      select: {
        slug: true,
        breadcrumbs: true,
        updatedAt: true,
      },
    })

    const dateFallback = new Date().toISOString()

    // Routes with no Pages document behind them, so they cannot come from the
    // query above. `/posts` used to be listed here too — a leftover from the
    // Payload template. This site has no /posts index (articles live under
    // /in-the-loop, and only /posts/<slug> exists as a legacy redirect), so the
    // sitemap was advertising a 404 to every crawler. Nothing on the site links
    // to it, which is why a link crawl never found it; the sitemap-driven test
    // in tests/e2e/links.e2e.spec.ts did.
    const defaultSitemap = [
      {
        loc: `${SITE_URL}/search`,
        lastmod: dateFallback,
      },
    ]

    const sitemap = results.docs
      ? results.docs
          .filter((page) => Boolean(page?.slug))
          .map((page) => {
            // docPath yields the nested breadcrumb URL (/services/medico-legal/ime),
            // not the flat slug, so the sitemap advertises canonical URLs.
            const path = docPath(page)
            return {
              loc: path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`,
              lastmod: page.updatedAt || dateFallback,
            }
          })
      : []

    return [...defaultSitemap, ...sitemap]
  },
  ['pages-sitemap'],
  {
    tags: ['pages-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getPagesSitemap()

  return getServerSideSitemap(sitemap)
}
