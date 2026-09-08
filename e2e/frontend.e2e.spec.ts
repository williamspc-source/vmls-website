import { test, expect } from '@playwright/test'

/**
 * These assertions used to read:
 *
 *   await expect(page).toHaveTitle(/Payload Website Template/)
 *   await expect(page.locator('h1').first()).toHaveText('Payload Website Template')
 *
 * — the unmodified template's, against a site that has been rebranded for months.
 * So `pnpm test:e2e` was red before anyone touched it, which is the same as
 * having no e2e suite at all: a run that is always failing carries no signal, and
 * nobody looks at the output.
 *
 * They now assert things that are true of THIS site and that would break if the
 * homepage stopped rendering: the brand in the title, exactly one h1, and a
 * header and footer that actually rendered.
 */
test.describe('Frontend', () => {
  test('homepage renders the VERIFY site', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.status(), 'homepage should return 200').toBe(200)

    await expect(page).toHaveTitle(/VERIFY/i)

    // Exactly one h1 — more than one is an accessibility and SEO defect, and it
    // is how a duplicated hero shows up.
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1')).not.toBeEmpty()

    // `.site-nav`, not `<header>`: the site renders its masthead as
    // `<nav class="site-nav">` with no `<header>` landmark anywhere on the page.
    // Asserting on `<header>` fails, which is how that was found. The `<main>`
    // landmark that was missing alongside it now exists and has its own test below.
    await expect(page.locator('nav.site-nav').first()).toBeVisible()
    await expect(page.locator('footer.site-footer').first()).toBeVisible()
  })

  /**
   * The main landmark and its skip link.
   *
   * Before this existed, `grep '<main'` returned zero hits site-wide and there was
   * no skip link, so a keyboard or screen-reader user traversed the entire nav on
   * every page — a standard axe/Lighthouse failure.
   *
   * `/search` is in the list deliberately: it is the one route with no `<article>`
   * of its own, so it is what would break first if the landmark were ever moved
   * out of the root layout onto the individual pages.
   *
   * Proven red by deleting the `<main>` wrapper in
   * `src/app/(frontend)/layout.tsx` — a guard that has never failed is not
   * evidence.
   */
  for (const path of ['/', '/search']) {
    test(`${path} has one main landmark reachable by a skip link`, async ({ page }) => {
      await page.goto(path)

      const main = page.locator('main#main-content')
      await expect(main, 'exactly one main landmark').toHaveCount(1)

      // The link must target the landmark, and be the FIRST thing Tab reaches —
      // a skip link placed after the nav skips nothing.
      const skip = page.locator('a.skip-link')
      await expect(skip).toHaveCount(1)
      await expect(skip).toHaveAttribute('href', '#main-content')
      await expect(skip, 'skip link must not be empty').not.toBeEmpty()

      // Offscreen until focused, on-screen once focused. Both halves are asserted
      // on the rendered position rather than on a class name.
      //
      // The first version of this test only checked the focused half, with
      // `top >= 0`. That is trivially true of an *unstyled* link sitting statically
      // at the top of the page — so it passed while the stylesheet was not
      // reaching the browser at all and "Skip to content" was rendering as visible
      // body text above the nav on every page. Asserting the hidden half is what
      // makes this catch a missing rule.
      const top = () => skip.evaluate((el) => el.getBoundingClientRect().top)
      expect(await top(), 'skip link must be offscreen until focused').toBeLessThan(0)

      await page.keyboard.press('Tab')
      await expect(skip, 'skip link should be the first focusable element').toBeFocused()

      // It slides in over ~0.28s, so poll rather than reading at t+0.
      await expect
        .poll(top, { message: 'skip link should slide on-screen while focused', timeout: 4000 })
        .toBeGreaterThanOrEqual(0)
    })
  }

  /**
   * A centred section header must not narrow itself into a line break.
   *
   * `.vf-section-header--centered` used to carry `max-width: var(--vf-measure,
   * 720px)`, inherited from the component's old inline styles and with no
   * counterpart in the design reference, where the same headings get the
   * container's full 1132px. Measured at 1440px it wrapped 10 titles across 8
   * pages, including the homepage's "Comprehensive Medico-Legal Services"
   * (needs 808px) and "Medico-Legal Support, Tailored to You" (798px).
   *
   * The test states that as a causal claim rather than a width comparison: take
   * away the header's OWN `max-width`, and if a title that was on two lines
   * collapses to one, the header did that to itself.
   *
   * Framing it that way is what makes it exempt the legitimate cases without an
   * allowlist, and the first version of this test — natural width vs. the
   * nearest `.container` — got that wrong. It reported `/services` as broken:
   * that header is `display: grid` (`.svc-admin-split`), so its title correctly
   * occupies a 620px track of a 1132px container and neutralising `max-width`
   * changes nothing. Same for a title in a narrow column (the enquiry panel's,
   * the JME FAQ's) and for one that genuinely outruns the full container.
   *
   * The `<br>` skip is load-bearing: `accentText()` turns an editor-typed
   * newline in the heading field into a `<br>`, so two lines there are the
   * editor's decision, not a layout fault.
   *
   * Proven red by restoring `max-width: 720px` on `.vf-section-header--centered`
   * in `src/app/(frontend)/globals.css` — a guard that has never failed is not
   * evidence. Re-run after the INTENTIONAL exemption below was added: **3 specs
   * fail**, reporting 2 violations on `/` ("Medico-Legal Support, Tailored to
   * You", "Comprehensive Medico-Legal Services"), 1 on `/about` ("CCARRE — The
   * Principles That Guide Us") and 1 on `/services/medico-legal/admin-services`
   * ("Four Services. One Less Thing to Manage."), with none on `/services`.
   *
   * That last one is the point of re-proving: the exemption skips the `as-how`
   * header on that page and the guard still catches the *other* header there. An
   * exemption that blinded the whole page would be worse than no guard.
   */
  for (const path of ['/', '/about', '/services', '/services/medico-legal/admin-services']) {
    test(`${path} centred section headers do not narrow themselves into a wrap`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 })
      await page.goto(path)

      const measured = await page.evaluate(() => {
        const rows: { text: string; before: number; after: number; capped: string }[] = []

        /**
         * Sections whose header is capped ON PURPOSE, each with the reference
         * rule it ports. The guard's claim is "a header should not narrow its
         * own title *by accident*", and it cannot tell an accident from a
         * deliberate port by measuring — both look identical in the DOM.
         *
         * The original fault was a SHARED rule (`--vf-measure` on
         * `.vf-section-header--centered`) capping every centred header on the
         * site. These are page-scoped ports of a specific reference value, and
         * the reference's own heading wraps to two lines at exactly this width.
         *
         * Keep this honest: an entry is a claim that the wrap is the design.
         * Anything merely inconvenient belongs in the CSS, not here.
         */
        const INTENTIONAL: Record<string, string> = {
          'as-how': 'reference .as-how-header — max-width: 560px, and its heading wraps to two lines',
          'jme-process': 'reference .jme-process-header — max-width: 600px, same',
        }

        document
          .querySelectorAll<HTMLElement>('.vf-section-header--centered')
          .forEach((header) => {
            const title = header.querySelector<HTMLElement>('.section-title')
            if (!title || title.querySelector('br')) return
            const section = header.closest('section')
            if (section && Object.keys(INTENTIONAL).some((c) => section.classList.contains(c))) return

            const lineHeight = parseFloat(getComputedStyle(title).lineHeight)
            if (!lineHeight) return
            const lines = () => Math.round(title.getBoundingClientRect().height / lineHeight)

            const before = lines()
            const capped = getComputedStyle(header).maxWidth

            // Neutralise only the header's own max-width, then put it back.
            const inline = header.style.maxWidth
            header.style.maxWidth = 'none'
            const after = lines()
            header.style.maxWidth = inline

            rows.push({ text: title.textContent?.trim().slice(0, 60) ?? '', before, after, capped })
          })

        return rows
      })

      // A positive control. Without it, "no violations" would be vacuously true
      // the moment the selector stopped matching — the shape of failure that made
      // three earlier guards in this repo meaningless.
      expect(
        measured.length,
        'should have found centred section headers to measure',
      ).toBeGreaterThan(0)

      const selfInflicted = measured.filter((m) => m.after < m.before)

      expect(
        selfInflicted,
        `these headers wrapped their own title by capping their width:\n${selfInflicted
          .map((m) => `  "${m.text}" — ${m.before} lines at max-width ${m.capped}, ${m.after} without`)
          .join('\n')}`,
      ).toEqual([])
    })
  }

  /**
   * A testimonial card highlights on hover without moving.
   *
   * `.testimonials-viewport` is `overflow: hidden` and exactly the card's height,
   * so it has no slack at all. The block's `hoverEffect` field defaults to
   * `lift` and the seed never sets it, so Payload stored `lift` by itself and
   * `.vf-hover-lift .vf-card:hover` translated the card up 4px — which put its
   * top edge and rounded corners outside the viewport and cut them off. The
   * design reference gives these cards a colour-only hover.
   *
   * Two clauses beyond "did not move", both load-bearing:
   *
   *  - the border colour must *change*, or "no movement" is also satisfied by a
   *    hover that never registered at all;
   *  - a gateway card, in a section with no clipping ancestor, must still lift —
   *    a positive control that proves `:hover` works in this harness and that
   *    the fix is scoped to testimonials rather than having killed card motion
   *    everywhere.
   *
   * Three deliberate breaks were applied to `src/app/(frontend)/globals.css`,
   * and what each one did is worth recording, including the one that did not
   * fail:
   *
   *  1. Delete `.testimonial-card:hover { transform: none; }` → RED, on the
   *     main assertion: `matrix(1, 0, 0, 1, 0, -4)`.
   *  2. Widen it to `.testimonial-card:hover, .vf-card:hover` → still green,
   *     and correctly so. `.audience-card:hover` is unlayered at the same
   *     (0,2,0) and declared later, so the gateway card kept its lift; nothing
   *     regressed, so nothing should fail. This control detects a hover that is
   *     not registering, not every over-broad selector one could write.
   *  3. Neutralise `.audience-card:hover`'s own `translateY(-6px)`, so hover
   *     becomes undetectable → RED, on the positive control, which is the
   *     scenario it exists for.
   */
  test('a testimonial card highlights on hover without moving', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')

    // Park the pointer somewhere harmless before every resting reading.
    // `scrollIntoViewIfNeeded` moves the page under a stationary cursor, so a
    // card can end up hovered before it is measured — that is how the first
    // draft of the positive control below read the same transform at rest and
    // on hover, and would have passed no matter what the CSS said.
    const restPointer = () => page.mouse.move(4, 4)

    const settle = async (locator: ReturnType<typeof page.locator>) => {
      await locator.scrollIntoViewIfNeeded()
      await restPointer()
      // Cards animate over `--transition`, and the scroll-reveal has its own
      // 0.6s; read only once both have finished.
      await page.waitForTimeout(900)
    }

    const transformOf = (locator: ReturnType<typeof page.locator>) =>
      locator.evaluate((el) => getComputedStyle(el).transform)

    const card = page.locator('.testimonial-card').first()
    await settle(card)

    const atRest = await card.evaluate((el) => ({
      transform: getComputedStyle(el).transform,
      borderColor: getComputedStyle(el).borderTopColor,
    }))
    expect(atRest.transform, 'a testimonial card should be untransformed at rest').toBe('none')

    await card.hover()
    await page.waitForTimeout(700)

    const hovered = await card.evaluate((el) => {
      const viewport = el.closest('.testimonials-viewport')
      return {
        transform: getComputedStyle(el).transform,
        borderColor: getComputedStyle(el).borderTopColor,
        clippedAbove: viewport
          ? viewport.getBoundingClientRect().top - el.getBoundingClientRect().top
          : 0,
      }
    })

    expect(hovered.transform, 'a testimonial card must not move on hover').toBe('none')
    expect(
      hovered.clippedAbove,
      'a testimonial card must not be clipped by its carousel viewport',
    ).toBeLessThanOrEqual(0)
    expect(hovered.borderColor, 'the hover highlight must still happen').not.toBe(
      atRest.borderColor,
    )

    // Positive control — a card in a section with no clipping ancestor must
    // still move, so "did not move" above cannot be satisfied by a hover that
    // never landed, and the fix is shown to be scoped to testimonials.
    const gateway = page.locator('.vf-gateway-cards .vf-card').first()
    await settle(gateway)
    const gatewayAtRest = await transformOf(gateway)

    await gateway.hover()
    await page.waitForTimeout(700)

    expect(
      await transformOf(gateway),
      'gateway cards should still lift on hover — if this matches their resting transform, hover is not registering and the assertions above prove nothing',
    ).not.toBe(gatewayAtRest)
  })

  test('the enquiry drawer opens and can be submitted', async ({ page }) => {
    await page.goto('/')

    const trigger = page.locator('[data-enquiry-panel]').first()
    // Not every page carries a trigger; if the homepage does not, that is itself
    // worth knowing, so assert rather than skip.
    await expect(trigger, 'homepage should have at least one enquiry CTA').toBeVisible()

    await trigger.click()
    const panel = page.locator('.enquiry-panel')
    await expect(panel).toHaveClass(/is-open/)

    // The drawer disables Send until it has confirmed which form it posts into.
    // A permanently-disabled button means site-wide lead capture is dead — the
    // exact failure this suite exists to catch.
    const submit = panel.locator('button[type="submit"]')
    await expect(submit, 'Send should become enabled once the form resolves').toBeEnabled({
      timeout: 10_000,
    })
    await expect(panel).not.toContainText('temporarily unavailable')
  })

  test('a legacy /posts/<slug> URL does not 404 outright', async ({ page }) => {
    // Either it redirects to the article, or the Redirects collection handles it,
    // or it is a genuine 404 for a slug that does not exist. What it must never do
    // is 500.
    const response = await page.goto('/posts/does-not-exist-abc123')
    expect([404, 200, 301, 302, 307, 308]).toContain(response?.status() ?? 0)
  })

  /**
   * The interior hero title is as bold as the reference renders it.
   *
   * This exists because the opposite was shipped, deliberately, and written up as
   * a correction: `.page-hero h1` weight "800 → 700" was listed among seventeen
   * values "aligned to the reference". See README.md > Deliberate departures.
   *
   * **The reference holds this rule twice and the two copies disagree.** The
   * shared sheet (`.design-reference/assets/css/styles.css:2587`) says 700. Every
   * one of the nine reference pages redeclares `.page-hero h1` in an inline
   * `<style>` that loads *after* the `<link>`, at equal specificity, and wins with
   * **800**. The pass read the shared sheet, so its "alignment" moved the build
   * away from what the reference actually renders — on 59 pages plus every event
   * detail page. Tellingly it took the *size* from the inline rule and the weight
   * from the shared one, so it had both copies in front of it.
   *
   * So this guard does not hardcode 800. It reads the expected weight out of the
   * reference page and compares it to what the build computes — the comparison
   * that pass got wrong. A number in a test would have been just as wrong as the
   * number in the CSS, and would have locked the mistake in.
   *
   * Proven red by setting `.page-hero h1` back to 700 in globals.css — confirmed
   * live in the browser with `getComputedStyle` before believing the run, because
   * a stale Turbopack build has faked a proof twice in this repo and hidden a
   * working change twice more. Stays green on `/` and an article page, whose hero
   * titles are 800 by different rules and must not be disturbed.
   */
  test('interior hero titles are as bold as the reference renders them', async ({ page }) => {
    const { readFileSync } = await import('node:fs')

    // Read the weight the reference PAGE declares — not the shared stylesheet,
    // which these pages override. Only the inline <style> is consulted, and only
    // its `.page-hero h1` rule.
    const referenceWeight = (file: string): number | null => {
      const html = readFileSync(`.design-reference/${file}`, 'utf8')
      for (const style of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
        const rule = style[1].match(/\.page-hero\s+h1\s*\{([^}]*)\}/)
        const weight = rule?.[1].match(/font-weight:\s*(\d+)/)
        if (weight) return Number(weight[1])
      }
      return null
    }

    const pairs = [
      ['/information-centre/for-claimants', 'information-centre/for-claimants.html'],
      ['/about', 'about/about-verify.html'],
      ['/specialists/specialist-panel', 'specialists/specialist-panel.html'],
    ] as const

    await page.setViewportSize({ width: 1440, height: 900 })

    for (const [builtPath, referenceFile] of pairs) {
      const expected = referenceWeight(referenceFile)
      // Positive control on the parser. A regex that matched nothing must not
      // read as a pass — that mistake has been made four times in this repo.
      expect(
        expected,
        `no .page-hero h1 font-weight found in ${referenceFile} — the parser is broken, or the reference moved the rule out of its inline <style>`,
      ).not.toBeNull()

      await page.goto(builtPath)
      const actual = await page.evaluate(() => {
        const h1 = document.querySelector<HTMLElement>('.page-hero h1')
        if (!h1) return null
        return { weight: getComputedStyle(h1).fontWeight, text: h1.textContent?.trim().slice(0, 40) }
      })
      expect(actual, `${builtPath} should render a .page-hero h1`).not.toBeNull()
      // Control the other way: a computed weight must be a number. `normal`
      // would mean nothing is setting it, which is the impact-hero fault.
      expect(
        Number(actual!.weight),
        `${builtPath}: computed font-weight is "${actual!.weight}", not a number — nothing is setting it`,
      ).not.toBeNaN()

      expect(
        Number(actual!.weight),
        `${builtPath} "${actual!.text}" renders at ${actual!.weight}; ${referenceFile} renders it at ${expected}`,
      ).toBe(expected)
    }
  })

  /**
   * Meet the Team's intro sits on its own light-blue band, above a grey grid.
   *
   * The reference models this as two sections — `.team-intro` over
   * `.team-grid-section` — and the build had folded the intro into the grid's
   * block, so one block meant one background and the blue band was simply absent.
   * The People Grid block now has a **Header band** control; this asserts the
   * stored value still produces the reference's two bands.
   *
   * Both halves are asserted, and the second is the one that matters. "The intro
   * is blue" is equally satisfied by the whole section going blue, which is the
   * wrong design and was the cheap alternative to this work — so the grid band
   * must also be measured, and must differ.
   *
   * The expected colour is parsed out of the reference page rather than written
   * here as a gradient. `--band-accent` is an editable Design System token, so a
   * literal in this file would go stale the moment someone retunes it, and would
   * be asserting a number rather than the agreement with the reference.
   *
   * Proven red by:
   *   - setting the stored `headerBackground` back to 'default' → one band, the
   *     intro assertion fires;
   *   - setting the grid's own `background` to 'accent' as well → both bands blue,
   *     the "must differ" assertion fires, so it is not vacuous.
   * Each break confirmed live in the browser before believing the run.
   * Stays green on `/` and `/jme`, whose People Grids keep the sentinel and must
   * render exactly one band.
   */
  /**
   * UPDATED 2026-08-25. This test used to assert that the "Our People" intro band
   * and the team grid sat on two DIFFERENT bands, mirroring the reference's
   * `.team-intro` / `.team-grid-section` pair. That intro band was removed on
   * request — Meet the Team now runs straight from the hero into the staff grid —
   * so the two-band comparison has no subject any more.
   *
   * What survives is the half that still has one: the grid band must be the
   * colour the reference gives `.team-grid-section`. The removal itself is
   * asserted too, so this cannot quietly pass if the intro band comes back.
   */
  test('the Meet the Team grid sits on the reference band, with no intro band above it', async ({
    page,
  }) => {
    const { readFileSync } = await import('node:fs')

    // Read from the page's inline <style>: the reference links its shared sheet
    // root-absolutely, so only the inline half is authoritative here.
    const referenceBackground = (selector: string): string | null => {
      const html = readFileSync('.design-reference/about/meet-the-team.html', 'utf8')
      for (const style of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
        const rule = style[1].match(new RegExp(`\\${selector}\\s*\\{([^}]*)\\}`))
        const background = rule?.[1].match(/background:\s*([^;]+);/)
        if (background) return background[1].trim()
      }
      return null
    }

    // Two colours in, two colours out — a hex the reference declares, as the
    // browser will report it.
    const toRgb = (hex: string): string => {
      const m = hex.trim().match(/^#([0-9a-f]{6})$/i)
      if (!m) return hex.trim()
      const n = parseInt(m[1], 16)
      return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`
    }

    const introDeclared = referenceBackground('.team-intro')
    const gridDeclared = referenceBackground('.team-grid-section')
    // Positive control on the parser: a regex that matched nothing must not read
    // as a pass.
    expect(
      introDeclared,
      'no .team-intro background found in the reference page — parser broken, or the rule moved out of its inline <style>',
    ).toBeTruthy()
    expect(gridDeclared, 'no .team-grid-section background found in the reference page').toBeTruthy()

    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/about/meet-the-team')

    const bands = await page.evaluate(() => {
      const read = (section: Element | null | undefined) => {
        if (!section) return null
        const cs = getComputedStyle(section)
        return cs.backgroundImage !== 'none' ? cs.backgroundImage : cs.backgroundColor
      }
      const sections = [...document.querySelectorAll('main section')]
      const intro = sections.find((s) =>
        s.querySelector('.section-label')?.textContent?.trim().toLowerCase().startsWith('our people'),
      )
      const grid = sections.find((s) => s.querySelector('.spec-grid, .vf-people-grid__groups'))
      return { intro: read(intro), grid: read(grid) }
    })

    // Control: the grid must actually be on the page, or the colour assertion
    // below is comparing null to null (invariant 41).
    expect(bands.grid, 'no section on the page carries the team grid').toBeTruthy()

    // 1. The intro band is gone on purpose. Asserted rather than assumed, so the
    //    page cannot silently regain it.
    expect(
      bands.intro,
      'an "Our People" band is back above the team grid; Meet the Team should run hero → grid',
    ).toBeNull()

    // 2. The grid band is still the colour the reference gives
    //    `.team-grid-section`. Compare on the colour stops, since the browser
    //    normalises hex to rgb() and adds an explicit 100% stop the reference
    //    leaves implicit.
    expect(bands.grid, `the team grid band is ${bands.grid}`).toContain(toRgb(gridDeclared!))
  })

  /**
   * A Booking Chooser with ONE panel fills its band, and does not slide.
   *
   * ── Why ──
   * The block is the full-bleed 50/50 pair on Make a Booking, and `.booking-half`
   * takes a fixed share of it: `flex: 0 1 50%`. The same block with a single half
   * is the "Specialist Availability" signpost under the hero on /specialists and
   * /specialists/specialist-panel — where that share had nothing to share with.
   * Measured before the fix, at 1440x900:
   *
   *   - the panel was 720px of a 1440px band, the other 720px being the section's
   *     own white;
   *   - hovering it slid the panel edge to 835px (58%) and back;
   *   - at 390px, where the split turns column, the panel was 379px of a 520px
   *     band, leaving a 141px white strip beneath it.
   *
   * The fix is one declaration — `.booking-split--solo .booking-half { flex-grow: 1 }`
   * — and the reason it also stops the slide is worth keeping: a single growing
   * item absorbs ALL free space, so as the hover rule animates the basis 50% -> 58%
   * the free space shrinks by exactly as much and the USED width stays 100%. That
   * is an inference about the flexbox algorithm, so this test samples through the
   * whole 0.6s transition rather than reading the width once at each end.
   *
   * ── The second control ──
   * Case 3 asserts Make a Booking STILL slides. Without it, deleting the two
   * `.booking-split:hover` rules outright would make cases 1-2 pass while removing
   * the effect from the page it belongs on.
   *
   * ── Proven red by (invariant 17) ──
   *  1. delete `.booking-split--solo .booking-half { flex-grow: 1 }` from globals.css
   *     -> "/specialists: the lone panel is 720px of a 1440px band"
   *  2. delete the two `.booking-split:hover` rules -> case 3:
   *     "/make-a-booking: hovering a half of a two-half chooser moved it 0px"
   *
   * Break 2 was first attempted as "widen the fix to `.booking-split .booking-half`"
   * and the suite stayed GREEN, which is the useful half of the exercise: with two
   * halves the bases already sum to 100%, so there is no free space for `flex-grow`
   * to absorb and the slide survives untouched. The rule is safe to widen; it is
   * scoped anyway, because scoping is what makes the intent readable.
   *
   * Both breaks were confirmed against the CSS the browser had actually received
   * (`curl` the `_next/static/chunks/*.css` chunk and read the rule), because the
   * dev server took ~20s to recompile the stylesheet here and one earlier run of
   * break 2 reported a false PASS against the pre-break CSS.
   */
  test('a chooser with one panel fills its band and does not resize on hover', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    for (const route of ['/specialists', '/specialists/specialist-panel']) {
      await page.goto(route, { waitUntil: 'load' })

      const split = page.locator('.booking-split').first()
      const half = split.locator('.booking-half').first()

      // Positive control. Every assertion below is satisfied by a page that
      // rendered no chooser at all — 0 === 0 (invariant 41).
      await expect(split, `${route} renders no .booking-split`).toBeVisible()
      const boxes = await split.evaluate((el) => ({
        split: el.getBoundingClientRect().width,
        halves: [...el.querySelectorAll(':scope > .booking-half')].map(
          (h) => h.getBoundingClientRect().width,
        ),
      }))
      expect(boxes.split, `${route}: the chooser band has no width`).toBeGreaterThan(0)
      expect(
        boxes.halves.length,
        `${route}: this guard is about a ONE-panel chooser; found ${boxes.halves.length}`,
      ).toBe(1)

      // 1. The lone panel fills the band.
      expect(
        Math.abs(boxes.halves[0] - boxes.split),
        `${route}: the lone panel is ${Math.round(boxes.halves[0])}px of a ${Math.round(
          boxes.split,
        )}px band`,
      ).toBeLessThanOrEqual(1)

      // 2. And keeps filling it under the pointer. Sampled ACROSS the 0.6s
      //    flex-basis transition, not just at the ends: a slide that starts and
      //    finishes at the same width is exactly what a two-reading test misses.
      await half.hover()
      const widths: number[] = []
      for (let i = 0; i < 6; i++) {
        await page.waitForTimeout(120)
        widths.push(await half.evaluate((el) => el.getBoundingClientRect().width))
      }
      const drift = Math.max(...widths.map((w) => Math.abs(w - boxes.halves[0])))
      expect(
        drift,
        `${route}: the panel moved ${Math.round(drift)}px while hovered — widths ${widths
          .map(Math.round)
          .join(', ')}`,
      ).toBeLessThanOrEqual(1)
    }

    // 3. The control: two halves still slide, which is the effect the design has
    //    on the page it was built for.
    await page.goto('/make-a-booking', { waitUntil: 'load' })
    const halves = page.locator('.booking-split .booking-half')
    expect(
      await halves.count(),
      '/make-a-booking should carry the two-half chooser this case controls for',
    ).toBe(2)

    const first = halves.first()
    const resting = await first.evaluate((el) => el.getBoundingClientRect().width)
    await first.hover()
    await page.waitForTimeout(900)
    const hovered = await first.evaluate((el) => el.getBoundingClientRect().width)
    expect(
      hovered - resting,
      `/make-a-booking: hovering a half of a two-half chooser moved it ${Math.round(
        hovered - resting,
      )}px`,
    ).toBeGreaterThan(50)
  })
})

/**
 * A hover response is a promise that a click will do something.
 *
 * The booking-portal band ends in three tiles — Specialist Availability,
 * Download CV, Sample Redacted Report — which are plain `<div>`s naming what the
 * portal offers. They used to brighten under the pointer, so they read as
 * buttons, and clicking did nothing: there is no CV or sample report on this
 * site. They were faithful ports — the design reference declares
 * `.portal-opt4-tile:hover` on its own non-interactive `<div>`s — which is why
 * nothing flagged it until someone noticed by eye, across 26 specialist profiles
 * and three pages.
 *
 * Nothing else running can see this. `computedSnapshot.mjs` never fires a hover,
 * and a declaration diff cannot tell a `<div>` from a link. Only a browser can.
 *
 * ── Three things this test needs to be worth anything ───────────────────────
 *  1. **A positive control.** `.opt-btn-white` — the real "Make an Enquiry" link,
 *     in the same band — must be asserted to CHANGE. Without it the test passes
 *     just as happily on a page where hover never fires at all, which is the
 *     degenerate pass the skip-link guard once shipped with.
 *  2. **Park the pointer first.** Playwright's mouse is stationary while
 *     `scrollIntoViewIfNeeded` moves the page underneath it, so an element can
 *     already be hovered when its "resting" value is read. `mouse.move(4, 4)`
 *     before every rest reading.
 *  3. **Wait for the transition.** Written without this, the first run of this
 *     measurement reported the tile changing AND the control button not changing
 *     — both wrong, because a value read immediately after `.hover()` is caught
 *     mid-flight. The tell was the control: a positive control that fails is a
 *     broken instrument, not a finding.
 *
 * Proven red by restoring `.portal-opt4-tile:hover { background: color-mix(in
 * srgb, var(--white) 17%, transparent) }` — fails naming the tile, with
 * `color(srgb 1 1 1 / 0.17)` against a resting `/ 0.1`.
 */
test.describe('nothing that cannot be clicked reacts to the pointer', () => {
  test('the booking-portal tiles do not, and the enquiry button does', async ({ page }) => {
    await page.goto('/specialists/profiles/dr-adam-parr', { waitUntil: 'load' })

    const background = (selector: string) =>
      page.locator(selector).first().evaluate((el) => getComputedStyle(el).backgroundColor)

    /** Poll until the value stops moving, so a transition is never read mid-flight. */
    const settled = async (selector: string) => {
      let previous = await background(selector)
      for (let i = 0; i < 40; i++) {
        await page.waitForTimeout(50)
        const now = await background(selector)
        if (now === previous) return now
        previous = now
      }
      return previous
    }

    const measure = async (selector: string) => {
      const el = page.locator(selector).first()
      await el.scrollIntoViewIfNeeded()
      await page.mouse.move(4, 4)
      const rest = await settled(selector)
      await el.hover()
      const hover = await settled(selector)
      await page.mouse.move(4, 4)
      return { rest, hover }
    }

    const tile = page.locator('.portal-opt4-tile').first()
    await expect(tile, 'no booking-portal tile on this profile').toBeVisible()

    // The tiles must not be links either — if one ever becomes clickable, a hover
    // response is correct and this whole test should be rewritten rather than
    // silently kept passing by removing the effect again.
    expect(
      await tile.evaluate((el) => !!(el.closest('a[href], button') || el.querySelector('a[href], button'))),
      'a portal tile is now clickable — it should have a hover effect, and this guard needs rewriting',
    ).toBe(false)

    const button = await measure('.opt-btn-white')
    expect(button.hover, 'the enquiry button did not respond to hover — the measurement is broken, not the page').not.toBe(
      button.rest,
    )

    const tileColour = await measure('.portal-opt4-tile')
    expect(
      tileColour.hover,
      'a booking-portal tile brightens on hover, so it reads as a button — and nothing happens when it is clicked',
    ).toBe(tileColour.rest)
  })
})
