import { test, expect } from '@playwright/test'

import { cleanupPage, createPageWithBlock } from '../helpers/seedUser'

/**
 * The TryBooking block never leaves a visitor looking at an empty box.
 *
 * ── Why the fallback is what is tested, and not the widget ──
 * Measured before this block was written: TryBooking's widget iframe carries
 * `frame-ancestors 'self' https:`, so it is **refused over http**. The dev
 * server is `http://localhost:3000`, which means the embedded form can never
 * load here and the success path is not testable locally at all. Over https it
 * works — verified by hand against a real event: the frame loaded, reported
 * 1498 characters of the listing, and the container grew to 1328px.
 *
 * So this file asserts the state that http can actually produce, which happens
 * to be the state that matters most: **the widget failed, and the visitor still
 * has a working way to book.**
 *
 * ── The trap this encodes ──
 * The obvious success check — "an iframe appeared, so hide the fallback" — is
 * wrong. When framing is refused the iframe ELEMENT is still created and still
 * has height (380px), holding a `chrome-error://chromewebdata/` document. A
 * block keying on that would hide the booking link exactly when it is needed.
 * The component therefore waits for a postMessage from TryBooking's origin,
 * which a frame that never loaded cannot send — and the first assertion below
 * is what would fail if anyone "simplified" it back.
 */

const SLUG = 'e2e-trybooking-fixture'
const EVENT_ID = '1525708'

let pageId: number | string | undefined

// Both hooks boot Payload in-process, and a boot runs a dev schema pull — visible
// in a full run as a long "Pulling schema from database…" spinner. Under the load
// of all 61 specs that comfortably exceeds Playwright's default 30s hook timeout,
// and the spec then fails with no assertion error, which reads like a broken test
// rather than a slow one. Measured: this file passes alone and alongside
// admin.e2e.spec.ts, and failed only in the full run. The timeout is sized to the
// real work rather than masking anything — see README.md > Known issues on Payload's
// boot cost being load-bearing in the suite.
const PAYLOAD_BOOT_TIMEOUT = 120_000

test.beforeAll(async () => {
  test.setTimeout(PAYLOAD_BOOT_TIMEOUT)
  pageId = await createPageWithBlock(SLUG, {
    blockType: 'tryBooking',
    eventId: EVENT_ID,
    widgetType: 'landingPageEmbed',
  })
})

test.afterAll(async () => {
  test.setTimeout(PAYLOAD_BOOT_TIMEOUT)
  if (pageId) await cleanupPage(pageId)
})

test.describe('TryBooking block', () => {
  test('the fallback booking link is present and correct when the widget cannot load', async ({
    page,
  }) => {
    await page.goto(`/${SLUG}`, { waitUntil: 'load' })

    const fallback = page.locator('.vf-trybooking__fallback a')
    await expect(fallback, 'the fallback link should render').toHaveCount(1)
    await expect(fallback).toHaveAttribute(
      'href',
      `https://www.trybooking.com/${EVENT_ID}`,
    )
    await expect(fallback).toHaveAttribute('target', '_blank')

    // The load is given time to fail: over http the iframe element still gets
    // created, so a check taken too early would pass for the wrong reason.
    await page.waitForTimeout(3000)
    await expect(
      fallback,
      'the widget cannot load over http, so the link must still be visible — if this fails, ' +
        'success is being inferred from the iframe element rather than from a message',
    ).toBeVisible()

    // And the failed embed must not be occupying the page. A refused frame still
    // creates an iframe with a height, which rendered as a large grey
    // "refused to connect" panel sitting above a perfectly good booking button.
    const embed = page.locator('.vf-trybooking__embed')
    await expect(embed, 'a failed embed must not be given a class claiming it loaded').not.toHaveClass(/is-loaded/)
    expect(
      await embed.evaluate((el) => Math.round(el.getBoundingClientRect().height)),
      'a failed embed must take up no vertical space',
    ).toBe(0)
  })

  test('the widget container is rendered with TryBooking’s own markup', async ({ page }) => {
    await page.goto(`/${SLUG}`, { waitUntil: 'load' })

    // Their script finds widgets by class name and reads these two attributes;
    // renaming either silently produces a page that never embeds anything.
    const widget = page.locator('.tryb-widget')
    await expect(widget).toHaveCount(1)
    await expect(widget).toHaveAttribute('data-eid', EVENT_ID)
    await expect(widget).toHaveAttribute('data-type', 'landingPageEmbed')
  })

  test('the fallback survives the script being blocked entirely', async ({ page }) => {
    // The other half of the two-state check. Without this, a block that simply
    // never loaded the script would pass the first test too.
    await page.route('**/trybooking.com/**', (route) => route.abort())
    await page.goto(`/${SLUG}`, { waitUntil: 'load' })

    const fallback = page.locator('.vf-trybooking__fallback a')
    await expect(fallback).toBeVisible()
    await expect(fallback).toHaveAttribute('href', `https://www.trybooking.com/${EVENT_ID}`)
  })

  test('the fallback link is in the server HTML, with no JavaScript at all', async ({ browser }) => {
    // The strongest available proof that a visitor with scripts disabled — for
    // whom the widget can never work — still gets a booking link. A fallback
    // that appeared via an effect would leave them with nothing.
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto(`/${SLUG}`, { waitUntil: 'load' })

    const fallback = page.locator('.vf-trybooking__fallback a')
    await expect(fallback).toHaveAttribute('href', `https://www.trybooking.com/${EVENT_ID}`)
    // VISIBLE, not merely present. Checking only the href passes against a link
    // rendered with `hidden` — measured: a break that revealed the fallback on
    // mount instead of in the server HTML sailed through the href assertion,
    // because a hidden anchor still has one. With scripts off nothing will ever
    // remove that attribute, so the visitor gets no booking link at all.
    await expect(fallback, 'a hidden link is no use to a visitor without JavaScript').toBeVisible()
    await context.close()
  })
})
