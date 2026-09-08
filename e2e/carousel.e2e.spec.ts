import { test, expect, type Page } from '@playwright/test'

/**
 * The Programs & Partnerships carousel on /events (`SlideCarousel`).
 *
 * ── The defect these guard ──
 * The track is `[cloneOfLast, ...slides, cloneOfFirst]`, so with 4 slides the
 * only valid positions are 0…5. `step()` incremented an unbounded `pos`, and the
 * ONLY thing that pulled it back was `onTransitionEnd` matching exactly
 * `count + 1` or `0`. Clicking faster than the 0.55s transform transition keeps
 * restarting it, so `transitionend` does not fire until the last click settles —
 * by which point `pos` is past the end and matches neither branch. Nothing ever
 * snapped it back.
 *
 * Measured on the unfixed component: 8 fast clicks left the track at
 * `translateX(-9702px)` — position 9 on a 6-card track — with **no card in the
 * viewport at all**. The dots kept highlighting throughout, because the active
 * dot is computed with modulo, so it read as a rendering bug rather than a state
 * one: a working-looking carousel showing an empty blue panel.
 *
 * ── Which of these were proven to fail, and which were not ──
 * Two went red against the unfixed component: the next-arrow burst (position 8.98
 * of a 6-card track) and the arrow-key burst. The previous-arrow, dots and
 * autoplay tests PASSED in both states — the backward path is unbounded in the
 * same code but did not reproduce a stuck state in three attempts, and autoplay
 * alone fires slowly enough (5800ms) that every transition completes and the snap
 * always runs. They are kept as regression cover for the fix, not as evidence of
 * the original defect. Recorded because a guard that has never failed is not
 * evidence, and it is worth knowing which of these are which.
 *
 * ── Why every click here is `{ force: true }` ──
 * Playwright's default `click()` runs actionability checks and waits for the
 * element to be stable — which, inside a track under a 0.55s transform
 * transition, means it waits for the animation. The burst then arrives slower
 * than the transition and the bug does not reproduce: measured, this whole spec
 * PASSED against the broken component until the clicks were forced. A probe that
 * quietly does something gentler than the thing you meant to test reads exactly
 * like a probe that found nothing wrong.
 *
 * ── Why these assert on the CARD and not just the transform ──
 * A transform inside the valid range with nothing visible is exactly the failure
 * being fixed. Checking the number alone would pass on a carousel that had run
 * off the end and been clamped to an empty position.
 */

const STAGE = '.events-offer-stage'
const TRACK = '.events-offer-track'
const VIEWPORT = '.events-offer-carousel'

/** How much of the viewport each card covers, and where the track sits. */
const readCarousel = (page: Page) =>
  page.evaluate(
    ({ track, viewport }) => {
      const trackEl = document.querySelector(track) as HTMLElement
      const vpRect = (document.querySelector(viewport) as HTMLElement).getBoundingClientRect()
      const m = getComputedStyle(trackEl).transform.match(/matrix\(1, 0, 0, 1, (-?[\d.]+)/)
      const x = m ? Number(m[1]) : 0
      const cards = [...trackEl.querySelectorAll('.events-offer-card')]
      const covering = cards
        .map((c) => {
          const r = c.getBoundingClientRect()
          const overlap = Math.min(r.right, vpRect.right) - Math.max(r.left, vpRect.left)
          return Math.round((overlap / vpRect.width) * 100)
        })
        .filter((pct) => pct >= 90)
      return {
        x,
        // Track position in slide-widths, which is what the component's `pos` is.
        position: Math.round((-x / vpRect.width) * 100) / 100,
        cardCount: cards.length,
        cardsFillingViewport: covering.length,
      }
    },
    { track: TRACK, viewport: VIEWPORT },
  )

/** Settle: the transition is 0.55s, so allow it to finish and any snap to run. */
const settle = (page: Page) => page.waitForTimeout(1200)

const openCarousel = async (page: Page) => {
  await page.goto('/events')
  await page.locator(STAGE).scrollIntoViewIfNeeded()
  await expect(page.locator(`${TRACK} .events-offer-card`).first()).toBeVisible()
  // Park the pointer away from the stage: hovering it pauses autoplay, which
  // would quietly change what the autoplay test is measuring.
  await page.mouse.move(4, 4)
}

test.describe('Programs & Partnerships carousel', () => {
  test('clicking next faster than the transition does not run off the track', async ({ page }) => {
    await openCarousel(page)
    const { cardCount } = await readCarousel(page)
    // 4 slides + 2 clones. Stated so the position bounds below mean something.
    expect(cardCount, 'track should be slides + 2 clones').toBeGreaterThanOrEqual(3)
    const maxPosition = cardCount - 1

    const next = page.locator('.events-offer-arrow-next')
    for (let i = 0; i < 8; i++) {
      await next.click({ force: true })
      await page.waitForTimeout(90) // well inside the 0.55s transition
    }
    await settle(page)

    const after = await readCarousel(page)
    expect(
      after.position,
      `track ran off the end: position ${after.position} of a ${cardCount}-card track`,
    ).toBeLessThanOrEqual(maxPosition)
    expect(after.position, 'track ran off the front').toBeGreaterThanOrEqual(0)
    expect(
      after.cardsFillingViewport,
      'a slide should fill the viewport — an empty panel is the reported bug',
    ).toBe(1)
  })

  test('clicking previous faster than the transition does not run off the track', async ({
    page,
  }) => {
    await openCarousel(page)
    const { cardCount } = await readCarousel(page)

    const prev = page.locator('.events-offer-arrow-prev')
    for (let i = 0; i < 8; i++) {
      await prev.click({ force: true })
      await page.waitForTimeout(90)
    }
    await settle(page)

    const after = await readCarousel(page)
    expect(after.position, 'track ran off the front').toBeGreaterThanOrEqual(0)
    expect(after.position, 'track ran off the end').toBeLessThanOrEqual(cardCount - 1)
    expect(after.cardsFillingViewport, 'a slide should fill the viewport').toBe(1)
  })

  test('the arrow keys share the same bound as the arrows', async ({ page }) => {
    await openCarousel(page)
    const { cardCount } = await readCarousel(page)

    await page.locator(VIEWPORT).focus()
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('ArrowRight')
      await page.waitForTimeout(90)
    }
    await settle(page)

    const after = await readCarousel(page)
    expect(after.position).toBeGreaterThanOrEqual(0)
    expect(after.position).toBeLessThanOrEqual(cardCount - 1)
    expect(after.cardsFillingViewport, 'a slide should fill the viewport').toBe(1)
  })

  test('the dots recover a carousel, and select an absolute slide', async ({ page }) => {
    await openCarousel(page)
    const { cardCount } = await readCarousel(page)

    // Burst first: the dots are what a stuck visitor reaches for, so they have to
    // work FROM the broken state, not only from a clean one.
    const next = page.locator('.events-offer-arrow-next')
    for (let i = 0; i < 8; i++) {
      await next.click({ force: true })
      await page.waitForTimeout(90)
    }
    await settle(page)

    await page.locator('.events-offer-dots button').first().click({ force: true })
    await settle(page)

    const after = await readCarousel(page)
    expect(after.position, 'first dot should select the first real slide').toBe(1)
    expect(after.cardsFillingViewport).toBe(1)
    expect(after.position).toBeLessThanOrEqual(cardCount - 1)
  })

  test('autoplay wraps without leaving the track', async ({ page }) => {
    // Five 5800ms intervals plus settle — past Playwright's 30s default.
    test.setTimeout(60_000)
    await openCarousel(page)
    const { cardCount } = await readCarousel(page)

    // The interval is 5800ms. Five of them carries it past the wrap from slide 1
    // of 4, which is the case that used to strand the unbounded counter. The
    // pointer stays parked at (4, 4) — hovering the stage pauses autoplay.
    await page.waitForTimeout(5800 * 5 + 1500)

    const after = await readCarousel(page)
    expect(after.position, 'autoplay ran off the end').toBeLessThanOrEqual(cardCount - 1)
    expect(after.position, 'autoplay ran off the front').toBeGreaterThanOrEqual(0)
    expect(after.cardsFillingViewport, 'a slide should fill the viewport').toBe(1)
  })
})
