import { test, expect, type Page } from '@playwright/test'

/**
 * Guards against shipping images far larger than the box they render into.
 *
 * ── Why this exists ──
 * A 5246×6016 / 3094 KB headshot was served straight into a 265×265 card. It
 * looked WORSE than its 300×300 neighbours — a ~10× single-step downscale
 * aliases on fine detail — so the symptom read as "low resolution" when the file
 * was the largest on the site. Nothing caught it: there was no test anywhere
 * that asserted anything about images, and the two causes are both silent.
 * Sitewide the six heaviest routes carried 19.5 MB of images; they now carry
 * 4.5 MB.
 *
 * ── Scope ──
 * CMS-served images only (`/api/media/file/…` and `/_next/image`), because those
 * are what the fix governs: Payload generates sized derivatives for them and
 * `mediaSrc`/`<Media>` choose one. Bundled static assets under `/assets/` are
 * excluded — the decorative shield on the homepage is a 1166px PNG in a 50px box
 * (23.4×) with no derivatives to choose from, recorded in README.md > Known issues.
 */

// 4×, set from measurement rather than taste. The binding case is the brand
// logo at 3.29× (600px file, 182px header box): the header and footer share one
// URL deliberately, so it is sized for the larger footer box of 264px and the
// header over-fetches. Anything materially looser than this stops being a guard.
const MAX_OVERSIZE = 4

// The largest CMS image currently served is a 477 KB PNG derivative. PNG is what
// forces this ceiling so high — the same headshots as JPEG/WebP are ~30 KB — see
// README.md > Known issues. It is still far below the 3094 KB original that prompted this.
const MAX_IMAGE_KB = 600

const ROUTES = [
  '/',
  '/about/meet-the-team',
  '/about/team/spencer-winchester',
  '/specialists',
  '/events',
  '/in-the-loop',
]

const isCmsImage = (url: string): boolean =>
  url.includes('/api/media/file/') || url.includes('/_next/image')

/** Reads every rendered image once the page has settled. */
const renderedImages = async (page: Page) =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll('img'))
      .map((img) => {
        const box = img.getBoundingClientRect().width
        return {
          src: img.currentSrc || img.src || '',
          natural: img.naturalWidth,
          box: Math.round(box),
        }
      })
      // Not yet laid out or not yet decoded — nothing to judge.
      .filter((i) => i.box > 0 && i.natural > 0),
  )

for (const route of ROUTES) {
  test(`${route} serves images sized for the box they render into`, async ({ page }) => {
    const requests: string[] = []
    let biggest = { kb: 0, url: '' }

    page.on('response', (res) => {
      const type = res.headers()['content-type'] || ''
      if (!type.startsWith('image/')) return
      const url = res.url()
      // Key on the path: the logo was fetched twice because two call sites built
      // the same file's URL differently, and only the query string differed.
      requests.push(url.split('?')[0])
      const kb = Number(res.headers()['content-length'] || 0) / 1024
      if (isCmsImage(url) && kb > biggest.kb) biggest = { kb, url }
    })

    await page.goto(route, { waitUntil: 'load' })
    // Several of these pages build their images client-side, so poll for the
    // images rather than reading at domcontentloaded — a link audit once
    // reported 65 dead anchors for exactly that reason.
    await page
      .waitForFunction(() => document.querySelectorAll('img').length > 0, undefined, {
        timeout: 15000,
      })
      .catch(() => {})
    await page.waitForTimeout(1500)

    const images = await renderedImages(page)
    // Positive control: a route that rendered no images would pass every
    // assertion below while proving nothing at all.
    expect(images.length, `${route} rendered no images to check`).toBeGreaterThan(0)

    const oversized = images
      .filter((i) => isCmsImage(i.src))
      .filter((i) => i.natural > i.box * MAX_OVERSIZE)
      .map((i) => `${i.natural}px into ${i.box}px (${(i.natural / i.box).toFixed(1)}×) ${i.src}`)
    expect(oversized, `images far larger than their box on ${route}`).toEqual([])

    expect(
      biggest.kb,
      `largest CMS image on ${route}: ${biggest.url} at ${Math.round(biggest.kb)} KB`,
    ).toBeLessThan(MAX_IMAGE_KB)

    const duplicates = [...new Set(requests.filter((u, i) => requests.indexOf(u) !== i))]
    expect(duplicates, `the same image file fetched more than once on ${route}`).toEqual([])
  })
}
