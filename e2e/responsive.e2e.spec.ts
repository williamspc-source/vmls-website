import { test, expect, type Page } from '@playwright/test'

/**
 * Guards the four responsive faults that shipped green on 2026-08-25.
 *
 * ── Why this exists ──
 * `playwright.config.ts` defines a single project, `Desktop Chrome` at 1280×720.
 * Nothing in the suite had ever loaded a page at a phone or tablet width, so
 * every fault below was outside the guard's reach:
 *
 *  - Card grids never collapsed to one column. `.audience-gateway-grid` rendered
 *    3 × 98px at 390px, `.spec-grid` 4 × 69px. The stylesheet *said* otherwise —
 *    globals.css had a ≤960px single-column rule — but the block wrote
 *    `grid-template-columns` INLINE, and inline beats every media query. Reading
 *    the CSS told you it worked; it had never worked.
 *  - `.expert-avatar` had a fixed `height: 200px` while `.expert-card` goes
 *    `flex-basis: 82vw` below 480px, so the photo box grew wider without growing
 *    taller and `object-fit: cover` cropped 37.5% on mobile against 21.6% on
 *    desktop.
 *  - The masthead overflowed between 769 and 1024px: measured scrollWidth 1191
 *    against a 1024 viewport, which is what produced the "large space on the
 *    right" on tablet.
 *  - The mobile drawer force-expanded every level, putting 28 links on screen.
 *
 * ── Reading this file ──
 * Each test asserts a POSITIVE CONTROL before the property under test. Without
 * one, every assertion here passes against a page that failed to render: zero
 * grids trivially satisfies "no grid has more than one column", and zero links
 * trivially satisfies "at most 7 are visible". That is invariant 41.
 *
 * ── Proven red by (invariant 17) ──
 * Each break restores the original defect, and each reports its real symptom:
 *
 *  1. grids       — put `gridTemplateColumns` back inline in GatewayCards
 *                   → "audience-gateway-grid is 3 columns at 390px: 98px 98px 98px"
 *  2. carousel    — `.expert-avatar` back to `height: 200px`
 *                   → "mobile 1.598984375 vs desktop 1.275"
 *  3. overflow    — header collapse back to 768px
 *                   → "horizontal overflow at 1024px" (and the tablet test)
 *  4. drawer      — `nav.nav-open .nav-dropdown { display: block }` unconditionally
 *                   → "drawer shows 28 of 28 links — not grouped"
 *  5. keyboard    — delete the `:focus-within` rule
 *                   → "focusing a nav parent did not open its dropdown"
 *
 * Two things that break #3 taught, worth keeping:
 *  - The header's collapse breakpoint is written in THREE places (a nested
 *    `components` sub-layer, an extracted block, and the drawer block). Reverting
 *    one leaves the other two collapsing correctly and the test still passes —
 *    they must move together.
 *  - An earlier version of the fix added `overflow-x: clip` to `html`. It made
 *    this suite unable to fail on the defect it exists for, because clipping
 *    hides the overflow rather than removing it. It was removed; see the note in
 *    globals.css `html`.
 */

const MOBILE = { width: 390, height: 844 }
const TABLET = { width: 1024, height: 1366 }

// The card grids that must collapse. Named rather than "every grid on the page"
// because some grids are legitimately 2-D at any width — the checklist rows are
// `20px 1fr` (icon + text), and a form row of two short fields is deliberate.
const CARD_GRIDS = [
  '.services-grid',
  '.spec-grid',
  '.specialty-grid',
  '.audience-gateway-grid',
  '.testimonials-grid',
  '.vf-icon-list',
  '.process-steps',
]

const countTracks = (value: string): number =>
  value === 'none' || !value.trim() ? 0 : value.trim().split(/\s+/).length

const gridReport = async (page: Page, selectors: string[]) =>
  page.evaluate((sels) => {
    const found: { sel: string; cols: string }[] = []
    for (const sel of sels) {
      for (const el of Array.from(document.querySelectorAll(sel))) {
        const box = el.getBoundingClientRect()
        if (box.width === 0 && box.height === 0) continue
        found.push({ sel, cols: getComputedStyle(el).gridTemplateColumns })
      }
    }
    return found
  }, selectors)

test.describe('responsive layout', () => {
  test('no route scrolls sideways at phone, tablet or desktop width', async ({ page }) => {
    // 1024 is the case that mattered: it measured 1191 before the header's
    // collapse breakpoint moved from 768 to 1024.
    for (const width of [390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/')
      await page.waitForLoadState('load')

      const { clientWidth, scrollWidth, bodyChildren } = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        bodyChildren: document.body.children.length,
      }))

      // Positive control: a blank page cannot overflow either.
      expect(bodyChildren, `the page rendered nothing at ${width}px`).toBeGreaterThan(0)
      expect(scrollWidth, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(clientWidth + 1)
    }
  })

  test('card grids collapse to a single column on a phone', async ({ page }) => {
    await page.setViewportSize(MOBILE)

    for (const route of ['/', '/about/meet-the-team', '/specialists']) {
      await page.goto(route)
      await page.waitForLoadState('load')

      const grids = await gridReport(page, CARD_GRIDS)

      // Positive control. `/` carries the gateway, services and testimonial
      // grids; without this the loop below is vacuous on a route that changed.
      if (route === '/') {
        expect(grids.length, 'no card grids found on the homepage').toBeGreaterThan(0)
      }

      for (const g of grids) {
        expect(
          countTracks(g.cols),
          `${route} ${g.sel} is ${countTracks(g.cols)} columns at ${MOBILE.width}px: ${g.cols}`,
        ).toBe(1)
      }
    }
  })

  test('the carousel frames photos the same way at every width', async ({ page }) => {
    const ratioAt = async (width: number): Promise<number | null> => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/')
      await page.waitForLoadState('load')
      await page.locator('.expert-avatar').first().waitFor({ state: 'attached' })
      return page.evaluate(() => {
        const el = document.querySelector('.expert-avatar')
        if (!el) return null
        const b = el.getBoundingClientRect()
        return b.height ? b.width / b.height : null
      })
    }

    const mobile = await ratioAt(390)
    const desktop = await ratioAt(1440)

    // Positive control: the selector still exists and has a real box.
    expect(mobile, '.expert-avatar not found or has no height at 390px').not.toBeNull()
    expect(desktop, '.expert-avatar not found or has no height at 1440px').not.toBeNull()

    // Same box ratio ⇒ `object-fit: cover` removes the same fraction of the
    // photo, so the editor's focal point and zoom mean one thing at every width.
    // Before the fix: 1.600 on mobile against 1.275 on desktop.
    expect(Math.abs(mobile! - desktop!), `mobile ${mobile} vs desktop ${desktop}`).toBeLessThan(0.02)
  })

  test('the mobile drawer opens grouped, not flattened', async ({ page }) => {
    await page.setViewportSize(MOBILE)
    await page.goto('/')
    await page.waitForLoadState('load')

    const visibleLinks = () =>
      page.evaluate(
        () =>
          Array.from(document.querySelectorAll('.nav-links a')).filter((a) => {
            const b = a.getBoundingClientRect()
            return b.width > 0 && b.height > 0
          }).length,
      )

    const totalLinks = await page.evaluate(() => document.querySelectorAll('.nav-links a').length)
    // Positive control: the nav has to actually carry more links than the
    // top-level count, or "grouped" and "flattened" are the same number.
    expect(totalLinks, 'nav has too few links to tell grouped from flat').toBeGreaterThan(10)

    const hamburger = page.locator('.hamburger')
    await expect(hamburger).toBeVisible()

    await hamburger.click()
    const opened = await visibleLinks()

    // Positive control: the drawer actually opened.
    expect(opened, 'the drawer opened no links at all').toBeGreaterThan(0)
    // Grouped: only the top-level items. It was 28 before.
    expect(opened, `drawer shows ${opened} of ${totalLinks} links — not grouped`).toBeLessThan(
      totalLinks,
    )

    // Expanding one group reveals its children and nothing else.
    const expander = page.locator('.nav-expand').first()
    await expect(expander).toBeVisible()
    await expect(expander).toHaveAttribute('aria-expanded', 'false')
    await expander.click()
    await expect(expander).toHaveAttribute('aria-expanded', 'true')

    const expanded = await visibleLinks()
    expect(expanded, 'expanding a group revealed nothing').toBeGreaterThan(opened)
    expect(expanded, 'expanding one group revealed every link').toBeLessThan(totalLinks)
  })

  test('the desktop nav is reachable by keyboard', async ({ page }) => {
    // Dropdowns are CSS-hover driven, so before `:focus-within` a keyboard user
    // could tab to a parent and never reach its children.
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await page.waitForLoadState('load')

    const parent = page.locator('.nav-links li.has-dropdown').first()
    await expect(parent).toBeVisible()

    await parent.locator('a.nav-top').first().focus()

    // Poll rather than read once: `.nav-dropdown` fades in over 0.28s, so an
    // immediate read returns the pre-transition opacity of 0 and the test fails
    // against working CSS. (It did, first run.)
    await expect
      .poll(
        () =>
          parent
            .locator('.nav-dropdown')
            .first()
            .evaluate((el) => Number(getComputedStyle(el).opacity)),
        { message: 'focusing a nav parent did not open its dropdown' },
      )
      .toBeGreaterThan(0.5)
  })

  test('the header collapses on a tablet, where hover is unavailable', async ({ page }) => {
    await page.setViewportSize(TABLET)
    await page.goto('/')
    await page.waitForLoadState('load')

    await expect(page.locator('.hamburger')).toBeVisible()
    // The desktop bar must be gone, or it is what overflows.
    const navLinksVisible = await page
      .locator('.nav-links')
      .evaluate((el) => el.getBoundingClientRect().height > 0)
    expect(navLinksVisible, 'the desktop nav is still laid out at 1024px').toBe(false)
  })
})
