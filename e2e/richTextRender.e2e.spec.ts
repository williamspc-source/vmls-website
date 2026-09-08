import { expect, test } from '@playwright/test'

import { BRAND_TEXT_COLORS } from '../../src/fields/richTextColors.js'

/*
 * The palette is IMPORTED, not mirrored. It used to be a hand-copied array of
 * keys, on the stated grounds that `page.evaluate` runs in the browser and
 * cannot reach the Node module graph. That reason was wrong twice over: the
 * array is passed *into* `page.evaluate` as an argument, so it is evaluated here
 * in Node; and `richTextColors.ts`'s only import is `import type`, so nothing of
 * Payload comes with it. The comment also claimed `richTextColors.int.spec.ts`
 * kept the mirror honest by asserting the same keys against the source — it does
 * not, and never did. No test opens this file. Adding a colour therefore used to
 * leave it silently unguarded here, which is the one place a dead colour is
 * visible.
 */

/**
 * No page renders a rich-text value as `[object Object]`, and no page dies
 * hydrating one.
 *
 * Both failures happened during the rich-text conversion, and neither is
 * catchable by the compiler, because the components involved declare their own
 * `string` props and the parent hands them a value through a cast:
 *
 *  · `FAQ` joined its help card's heading and body with `.join(' ')`. Rich text
 *    stringifies rather than throwing, so `/information-centre/for-clients`
 *    shipped the literal text "[object Object] [object Object]" beside an info
 *    icon. Nothing failed. It was found by a computed-style snapshot noticing
 *    the paragraph had become one line instead of two.
 *  · `EventsExplorerClient` rendered a converted `intro` straight into JSX. The
 *    server HTML was correct and complete, then hydration threw React error #31
 *    and blanked the page — `/events` went from 425 rendered nodes to 11 while
 *    still returning HTTP 200.
 *
 * So this checks the two things a visitor would actually see, on every route in
 * the sitemap-covered set. It is deliberately cheap: no fixtures, no seeding.
 *
 * Proven red by restoring the `.join(' ')`: **2 of 18 fail**, naming
 * `/information-centre/for-clients` and `/information-centre/for-claimants` —
 * the two pages carrying that help card — while the other 16 stay green. That is
 * the useful shape: it points at the pages, and the message says what happened.
 */

const ROUTES = [
  '/',
  '/about',
  '/about/meet-the-team',
  '/services',
  '/specialists',
  '/in-the-loop',
  '/events',
  '/events/upcoming-events',
  '/events/past-events',
  '/contact',
  '/privacy-policy',
  '/services/medico-legal/ime',
  '/services/medico-legal/jme',
  '/services/medico-legal/reporting-services',
  '/specialists/join-expert-panel',
  '/information-centre/for-clients',
  '/information-centre/for-claimants',
  '/make-a-booking',
]

test.describe('Rich text reaches the page as words', () => {
  for (const route of ROUTES) {
    test(`${route} renders no stringified objects and survives hydration`, async ({ page }) => {
      const pageErrors: string[] = []
      page.on('pageerror', (e) => pageErrors.push(e.message.split('\n')[0]))

      const response = await page.goto(route, { waitUntil: 'networkidle' })
      expect(response?.status(), `${route} should serve`).toBe(200)

      // Hydration must not throw. A page that dies here still returns 200 and
      // still has correct server HTML — the damage only shows in the browser.
      expect(pageErrors, `${route} threw while hydrating`).toEqual([])

      const text = await page.evaluate(() => document.body.innerText)
      expect(text, `${route} rendered a rich-text value as a stringified object`).not.toContain(
        '[object Object]',
      )

      // A positive control: a page that failed to hydrate can end up nearly
      // empty, and an empty page trivially satisfies both checks above.
      const nodes = await page.evaluate(() => document.querySelectorAll('*').length)
      expect(nodes, `${route} rendered almost nothing`).toBeGreaterThan(100)
    })
  }
})

/**
 * The editor's colour choice reaches the page, and beats the rules it has to beat.
 *
 * `.vf-tc-*` carries `!important`, and that flag is the whole design. Section
 * headings are painted by `.section-title` (0,1,0), but several page-scoped ports
 * declare a colour at higher specificity — `.why-verify--light .why-header
 * .section-title` is 0,3,0 — so a plain `.vf-tc-brand` would lose on exactly the
 * pages an editor is most likely to be looking at, and lose *silently*: they pick
 * a colour, save, and nothing changes. That cascade cannot be checked by reading
 * the stylesheet; it needs a browser.
 *
 * ── Picking the control took two attempts, and the first one is the lesson ────
 * This started out pointed at `.vf-client-overview .vf-split__title`, which the
 * comment in globals.css names as the reason for the flag. Removing the
 * `!important` did not fail the test — because that rule declares
 * `margin-bottom`, `font-size` and `font-weight` and **no colour at all**. It was
 * never a competitor, and a test aimed at it can only ever pass. The same is true
 * of any heading on a dark band: `.vf-on-dark .vf-tc-brand` carries its own
 * `!important`, so those pass with the flag removed from the bare class too.
 *
 * A control has to be the thing you meant to test. The two below were found by
 * parsing the served stylesheet for rules that genuinely set `color` on a header
 * element at two classes or more, then measuring each in the browser.
 *
 * The class is applied here rather than through content, so the test needs no
 * fixture and no seeded colour. What it measures is the cascade — whether the
 * class wins where it must. That the *converter* emits the class is covered by
 * `tests/int/inlineRichText.int.spec.tsx`, and that the class has a rule
 * resolving through the right token by `tests/int/richTextColors.int.spec.ts`;
 * the three together span the path from a stored key to a painted colour.
 *
 * Both states are asserted, because "it is brand blue with the class" is
 * trivially satisfiable by a heading that was brand blue already — that is the
 * degenerate pass the skip-link guard once shipped with.
 *
 * Proven red by deleting the `!important` from `.vf-tc-brand` in globals.css:
 * the `/about` case fails, staying at rgb(65, 64, 66) — the page-scoped default —
 * where it should have gone to rgb(28, 117, 188). Restoring the flag takes the
 * same element to the brand blue on the next load, measured both ways. Deleting
 * the whole `.vf-tc-brand` rule fails both cases.
 */
/**
 * Every colour in the palette does something — and does only what it says.
 *
 * This exists because the control was reported broken a second time, after it had
 * been fixed and measured. The report was fair: the editor picked the choice
 * sitting directly under "Default (as designed)", which was then labelled
 * "Heading text" and resolves to `--text-dark` — **the colour a heading already
 * is on a light band**. Default and that choice both compute `rgb(65, 64, 66)`,
 * identical to the byte. Nothing was wrong with the wiring; the palette offered a
 * click that could not do anything where the editor was looking.
 *
 * So the palette is not just checked for having a CSS rule (that is
 * `richTextColors.int.spec.ts`) — it is checked for the rule making a
 * *difference* on a real page.
 *
 * ## Why this measures two bands rather than excusing entries
 *
 * The first version of this test measured a light band only and skipped
 * `heading`/`body` by name. That does not survive a fixed Charcoal: `charcoal` is
 * #414042, which on a light band IS the default — but on a dark band it stays
 * charcoal while the default turns white, so it is a live control that a
 * one-context test calls dead. An exemption list would have hidden that, and
 * would have grown by one entry every time the palette did.
 *
 * Measuring the same heading in both contexts instead lets every entry be
 * asserted, and asserts more:
 *
 *  · a colour must differ from "no colour" in at least ONE band;
 *  · the band-following pair and the two that re-point MUST move with the band;
 *  · **every other entry must NOT** — the browser half of "an explicit pick is
 *    fixed", which staff asked for when they asked for a black that stays black.
 *    Nothing else in the repo would notice a `.vf-on-dark .vf-tc-charcoal` rule.
 *
 * Proven red, each restored after:
 *  · point `bright` at `--text-dark` → the "does something" assertion, naming
 *    `bright`, with all four readings in the message;
 *  · add `.vf-on-dark .vf-tc-charcoal { color: var(--text-on-dark) !important }`
 *    → the fixed-colour assertion, naming `charcoal`;
 *  · delete the `.vf-on-dark .vf-tc-brand` rule → the moves-with-the-band
 *    assertion, naming `brand` (before this, only a file regex saw that);
 *  · point `.vf-tc-heading` at `var(--primary)` → same assertion, naming
 *    `heading`;
 *  · remove `.vf-on-dark` from the selector list at globals.css:1475 → the
 *    positive control, which is the one that stops the dark half going vacuous.
 */
test('every colour in the palette does something, and only what it says', async ({ page }) => {
  await page.goto('/', { waitUntil: 'load' })

  const measured = await page.evaluate((keys) => {
    // A heading that is NOT already inside a dark band, or the "light" half of
    // this test measures a dark one and every comparison below is against the
    // wrong default.
    const el = Array.from(document.querySelectorAll('.vf-section-header__title')).find(
      (n) => !n.closest('.vf-on-dark, .vf-section--dark, .vf-section--primary, .vf-cta-band'),
    )
    if (!el?.parentElement) return null

    const read = () => {
      const base = getComputedStyle(el).color
      const seen: Record<string, string> = {}
      for (const key of keys) {
        el.classList.add(`vf-tc-${key}`)
        seen[key] = getComputedStyle(el).color
        el.classList.remove(`vf-tc-${key}`)
      }
      return { base, seen }
    }

    const light = read()
    // Simulate the band on the PARENT rather than hunting for a dark page:
    // `.vf-on-dark` re-pointing the tokens is precisely the mechanism under test,
    // and it is the selector the `.vf-on-dark .vf-tc-*` rules key on.
    el.parentElement.classList.add('vf-on-dark')
    const dark = read()
    el.parentElement.classList.remove('vf-on-dark')

    return { light, dark }
  }, BRAND_TEXT_COLORS.map((c) => c.key))

  expect(measured, 'no light-band section heading on the homepage').not.toBeNull()
  const { light, dark } = measured!

  // POSITIVE CONTROL, and the load-bearing one: if `.vf-on-dark` did not change
  // the default colour then the simulated band never took, and every dark-band
  // reading below would pass for the wrong reason.
  expect(
    dark.base,
    'adding .vf-on-dark did not change the default text colour — the band did not take, so every dark-band reading here is vacuous',
  ).not.toBe(light.base)

  for (const { key, followsBand, onDarkToken } of BRAND_TEXT_COLORS) {
    const l = light.seen[key]
    const d = dark.seen[key]

    if (!followsBand) {
      expect(
        l !== light.base || d !== dark.base,
        `"${key}" renders ${l} on a light band (default ${light.base}) and ${d} on a dark one (default ${dark.base}) — the same as no colour at all in both, so an editor picks it and sees nothing`,
      ).toBe(true)
    }

    if (followsBand || onDarkToken) {
      expect(
        l,
        `"${key}" is meant to move with the band and did not — it renders ${l} on both`,
      ).not.toBe(d)
    } else {
      expect(
        l,
        `"${key}" changed from ${l} to ${d} on a dark band. It is a fixed colour: an editor who picks it has said what they want, and nothing may re-point it`,
      ).toBe(d)
    }
  }
})

test.describe('an editor-chosen text colour wins', () => {
  const CASES = [
    // A heading with only the shared rule on it.
    { route: '/', selector: '.vf-section-header__title' },
    // A heading a page-scoped port has already given a colour to, on a LIGHT
    // band — the case the `!important` exists for, and the only shape that can
    // distinguish the flag being there from it being absent.
    { route: '/about', selector: '.why-verify--light .why-header .section-title' },
  ]

  for (const { route, selector } of CASES) {
    test(`${route} — ${selector}`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'load' })

      const measure = await page.evaluate((sel) => {
        const el = document.querySelector(sel)
        if (!el) return null
        const before = getComputedStyle(el).color
        el.classList.add('vf-tc-brand')
        const after = getComputedStyle(el).color
        el.classList.remove('vf-tc-brand')
        return {
          before,
          after,
          restored: getComputedStyle(el).color,
          brand: getComputedStyle(document.documentElement).getPropertyValue('--primary').trim(),
        }
      }, selector)

      expect(measure, `${route}: no element matched ${selector}`).not.toBeNull()

      // The token has to resolve, or every comparison below is against ''.
      expect(measure!.brand, 'the --primary token is not set').toMatch(/^#[0-9a-f]{6}$/i)
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(measure!.brand.slice(i, i + 2), 16))
      const brandRgb = `rgb(${r}, ${g}, ${b})`

      expect(measure!.after, `${selector} did not take the editor's colour`).toBe(brandRgb)
      // Without this the test passes on a heading that was already brand blue.
      expect(measure!.before, `${selector} was already the colour under test`).not.toBe(brandRgb)
      expect(measure!.restored, 'the class was not actually what changed it').toBe(measure!.before)
    })
  }
})
