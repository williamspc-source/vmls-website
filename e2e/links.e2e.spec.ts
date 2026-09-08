import { test, expect, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Site-wide link audit.
 *
 * This exists because "the links all match the design reference" was reported as
 * fact and was not true: one link 404'd, thirty pointed at flat legacy paths that
 * only resolved through a 308, and several went to the wrong section entirely.
 * None of it was measured. This test measures it.
 *
 * It crawls every page in the five sitemaps rather than a hand-kept list, so a
 * new page is covered the day it is published.
 *
 * ## The timing trap this test is built around
 *
 * The first version of this audit read the DOM at `domcontentloaded` and reported
 * **65 dead anchors**. Every one was a false positive: article heading ids were
 * assigned by `ArticleToc` on mount (they are server-rendered now — see the last
 * test in this file), and other sections stream in, so checking early sees a
 * half-built page.
 *
 * The control used at the time — `#main-content` — could not catch it: it lives in
 * the root layout and is in the first byte, so it passed in exactly the runs that
 * were wrong. **A positive control must arrive on the same schedule as the thing
 * being measured.** The fragment test below therefore *polls* for the id rather
 * than reading once after a delay — a fixed delay is wrong in both directions,
 * too short during the audit and flaky under load — and the crawl collects
 * failures rather than asserting per page so one bad route cannot mask the rest.
 * The poll is still needed: several targets (accordion panels, the appointment
 * guide) genuinely are built by client components.
 */

const LEGACY_PATHS = [
  '/for-clients',
  '/for-claimants',
  '/join-expert-panel',
  '/specialist-panel',
  '/ime',
  '/jme',
  '/meet-the-team',
  '/upcoming-events',
]

const SITEMAPS = ['pages', 'posts', 'specialists', 'team', 'events']

const collectPages = async (baseURL: string): Promise<string[]> => {
  const out = new Set<string>(['/'])
  for (const name of SITEMAPS) {
    const res = await fetch(`${baseURL}/${name}-sitemap.xml`)
    if (!res.ok) continue
    const xml = await res.text()
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) out.add(new URL(m[1]).pathname)
  }
  return [...out].sort()
}

test.describe('Links', () => {
  test.describe.configure({ mode: 'serial', timeout: 600_000 })

  test('every internal link resolves, and no link uses a redirecting legacy path', async ({
    page,
    baseURL,
  }) => {
    const base = baseURL!
    const pages = await collectPages(base)
    expect(pages.length, 'sitemaps should yield pages to crawl').toBeGreaterThan(20)

    type Found = { page: string; href: string; text: string }
    const links: Found[] = []
    // Collect rather than assert per page, so one bad route does not hide the
    // rest — and so the failure message lists every offender at once.
    const unrenderable: string[] = []
    for (const path of pages) {
      const res = await page.goto(base + path, { waitUntil: 'domcontentloaded' })
      if ((res?.status() ?? 500) >= 400) {
        unrenderable.push(`${path} → ${res?.status() ?? 'ERR'}`)
        continue
      }
      const found = await page.evaluate(() =>
        [...document.querySelectorAll('a[href]')].map((a) => ({
          href: a.getAttribute('href') || '',
          text: (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 50),
        })),
      )
      found.forEach((f) => links.push({ page: path, ...f }))
    }
    // A page in a sitemap that does not render is a 404 promised to search
    // engines. Nothing need link to it for that to be true, so a link crawl
    // alone cannot find it — this is the check that caught `/posts`.
    expect(
      unrenderable,
      `pages listed in a sitemap that do not render:\n  ${unrenderable.join('\n  ')}`,
    ).toEqual([])
    expect(links.length, 'should have found links to check').toBeGreaterThan(1000)

    const internal = [
      ...new Set(
        links
          .map((l) => l.href)
          .filter((h) => h && !/^(https?:|mailto:|tel:|javascript:)/.test(h)),
      ),
    ]

    // 1. Every internal destination must be a 200 in its own right. A 3xx counts
    //    as a failure: the project reserves permanent redirects for destinations
    //    that can never change, and an in-app navigation through one can drop the
    //    #fragment — which is what made anchored links land in the wrong place.
    const broken: string[] = []
    for (const href of internal) {
      const [path] = href.split('#')
      if (!path) continue
      const res = await fetch(base + path, { redirect: 'manual' })
      if (res.status !== 200) broken.push(`${path} → ${res.status} ${res.headers.get('location') ?? ''}`)
    }
    expect(broken, `internal links that do not return 200:\n  ${broken.join('\n  ')}`).toEqual([])

    // 2. No content link may use one of the flat legacy paths.
    const legacy = [
      ...new Set(
        links
          .filter((l) => LEGACY_PATHS.includes(l.href.split('#')[0]))
          .map((l) => `${l.page}  "${l.text}" → ${l.href}`),
      ),
    ]
    expect(legacy, `links still on a legacy path:\n  ${legacy.join('\n  ')}`).toEqual([])
  })

  test('every #fragment link has a target on the page it points at', async ({ page, baseURL }) => {
    const base = baseURL!
    const pages = await collectPages(base)

    const wanted = new Map<string, Set<string>>()
    for (const path of pages) {
      await page.goto(base + path, { waitUntil: 'domcontentloaded' })
      const hrefs = await page.evaluate(() =>
        [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href') || ''),
      )
      for (const href of hrefs) {
        if (!href || /^(https?:|mailto:|tel:)/.test(href)) continue
        const [p, frag] = href.split('#')
        if (!frag) continue
        const target = p || path
        if (!wanted.has(target)) wanted.set(target, new Set())
        wanted.get(target)!.add(frag)
      }
    }
    expect(wanted.size, 'should have found fragment links to check').toBeGreaterThan(5)

    const dead: string[] = []
    for (const [target, frags] of wanted) {
      const res = await page.goto(base + target, { waitUntil: 'load' })
      if (!res || res.status() >= 400) {
        frags.forEach((f) => dead.push(`${target}#${f} (page ${res?.status() ?? 'ERR'})`))
        continue
      }
      // Poll rather than read once after a fixed delay. A single timed read is
      // what produced 65 false positives during the audit, and a fixed delay is
      // also flaky the other way: under load the page can still be settling when
      // the timer fires. Waiting for the condition removes the timing dependence
      // in both directions — only a genuine absence survives the full timeout.
      const list = [...frags]
      let missing: string[] = []
      try {
        await page.waitForFunction(
          (ids) => ids.every((id) => !!document.getElementById(id)),
          list,
          { timeout: 8000 },
        )
      } catch {
        missing = await page.evaluate(
          (ids) => ids.filter((id) => !document.getElementById(id)),
          list,
        )
      }
      missing.forEach((f) => dead.push(`${target}#${f}`))
    }

    expect(dead, `links pointing at an id that does not exist:\n  ${dead.join('\n  ')}`).toEqual([])
  })

  /**
   * The four faults that prompted this suite, asserted on behaviour rather than on
   * the href — an href can be right while the page still does the wrong thing,
   * which is exactly what happened with the appointment guide: the link was
   * corrected and the guide still opened on In-Person because the anchor ids had
   * never reached the database.
   *
   * Proven red by reverting any one of: the `scroll-padding-top` on `html`, the
   * hash handling in `AppointmentGuide/GuideClient.tsx`, or the corresponding
   * entry in `src/endpoints/seed/seedLinkRepairs.ts`.
   */
  test('the homepage gateway and service links land where they say', async ({ page, baseURL }) => {
    const base = baseURL!
    await page.setViewportSize({ width: 1440, height: 900 })

    // Videolink must select the Videolink type, not merely scroll somewhere.
    await page.goto(`${base}/information-centre/for-claimants#videolink-appointment`, {
      waitUntil: 'load',
    })
    await page.waitForTimeout(1800)
    const guide = await page.evaluate(() => {
      const btns = [...document.querySelectorAll('.vf-ag-type-btn')]
      const sel = btns.find((b) => b.getAttribute('aria-selected') === 'true')
      return {
        selected: sel?.querySelector('.vf-ag-type-btn-label')?.textContent?.trim() ?? null,
        top: sel ? Math.round(sel.getBoundingClientRect().top) : null,
        navH: Math.round(document.querySelector('nav.site-nav')!.getBoundingClientRect().height),
        scrolled: Math.round(window.scrollY),
      }
    })
    expect(guide.selected, 'deep link should select the Videolink type').toBe(
      'Videolink Appointment',
    )
    expect(guide.scrolled, 'should have scrolled to the guide').toBeGreaterThan(200)
    expect(guide.top!, 'the toggle must clear the sticky nav').toBeGreaterThanOrEqual(guide.navH)

    // Anchored service links must put the TITLE below the nav, not behind it.
    for (const [path, id] of [
      ['/services/medico-legal/reporting-services', 'file-review'],
      ['/services/medico-legal/reporting-services', 'expert-evidence'],
      ['/services/medico-legal/admin-services', 'surrogate-assessment'],
    ] as const) {
      await page.goto(`${base}${path}#${id}`, { waitUntil: 'load' })
      await page.waitForTimeout(1600)
      const r = await page.evaluate((anchor) => {
        const el = document.getElementById(anchor)!
        const t =
          el.querySelector('.as-accordion-trigger-title') ?? el.querySelector('h1,h2,h3,h4')
        return {
          navH: Math.round(document.querySelector('nav.site-nav')!.getBoundingClientRect().height),
          titleTop: t ? Math.round(t.getBoundingClientRect().top) : null,
          title: t?.textContent?.trim().slice(0, 40) ?? null,
        }
      }, id)
      expect(r.titleTop, `#${id} should have a title to land on`).not.toBeNull()
      expect(
        r.titleTop!,
        `#${id}: "${r.title}" is behind the ${r.navH}px sticky nav at y=${r.titleTop}`,
      ).toBeGreaterThanOrEqual(r.navH)
    }
  })

  /**
   * A pasted article deep link lands on its heading.
   *
   * Article heading ids used to be assigned by `ArticleToc` on mount, so they were
   * not in the server HTML: clicking a contents link worked, but opening
   * `…/article#some-heading` in a fresh tab left the reader at the top of the page
   * (measured: `scrollY` 0). The browser resolves a fragment while parsing, long
   * before React runs. Copying an article URL out of the address bar is a normal
   * thing to do, so this was a real, silent failure.
   *
   * ## Why this test is shaped the way it is
   *
   * **Step 1 measures the cause.** Whether the id is in the *server* HTML is the
   * actual claim; a browser reading can be satisfied by client-side JavaScript
   * putting it there afterwards, which is exactly the bug.
   *
   * **Step 3 removes JavaScript entirely.** With page script off there is no
   * `ArticleToc`, no hydration and no corrector of any kind, so a jump can only
   * have come from the server HTML plus the browser.
   *
   * **Every state gets a fresh page.** `page.goto(url + '#frag')` when the page is
   * already on `url` is a *same-document* navigation — the browser scrolls the
   * hydrated document it already has, where the old mount loop had long since
   * assigned the ids. A version of this test that reused the page went green
   * against the unfixed code.
   *
   * **Both states are asserted.** Without the no-fragment half, "the heading is at
   * the top of the viewport" is also true of a page that never needed to scroll.
   *
   * ## The breaks, and what each one actually did
   *
   *  1. **Drop `headingIds` from the article's `<RichText>`** → red at step 1
   *     (no `<h2 id>` in the server HTML) and at step 3 (the element does not
   *     exist at all, so the settle times out).
   *  2. **The same, plus `ArticleToc`'s old mount loop restored** — written up in
   *     an earlier draft of this comment as the case that would sneak past step 2.
   *     It does not: measured `scrollY 0`, heading resting at y=972, i.e. no jump.
   *     Assigning an id after mount is too late to matter, which is the original
   *     bug exactly. Step 2 catches this one too. Steps 1 and 3 still earn their
   *     place for different reasons: step 1 checks **all** 55 contents links with
   *     a message naming each article, where step 2 measures at most three; and
   *     step 3 forecloses a *future* `useEffect` that re-scrolls on the hash,
   *     which would make step 2 pass over server HTML that is still wrong.
   *  3. **Delete `scroll-padding-top` from `html`** → red. The first version of
   *     this test reported it as "no article heading sits below the fold", because
   *     `parseFloat('auto')` is `NaN` and `NaN > 200` is false, so every candidate
   *     was silently skipped: a true statement that named nothing. Hence the
   *     explicit precondition below.
   *
   * Stays green on `/services/medico-legal/reporting-services#file-review` and
   * `#expert-evidence`, and `/information-centre/for-claimants#videolink-appointment`
   * — ids that come from block `anchorId`s and were never client-assigned. All
   * three land at y=96 on the scroll line. If this helper turns those red, the
   * helper is wrong and not the page.
   */
  test('a pasted article deep link lands on its heading, with or without JavaScript', async ({
    browser,
    baseURL,
  }) => {
    const base = baseURL!

    // ── 1. Cause: the id is in the server HTML, on every article ───────────
    const xml = await (await fetch(`${base}/posts-sitemap.xml`)).text()
    const articles = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname)
    // The bound is 0, not a headcount. It used to be `> 5`, which was calibrated
    // to 24 scaffold articles; deleting the AI-written ones on 2026-08-20 left 4
    // real articles and the test failed on its own precondition rather than on
    // anything about the site. What this control exists to catch is a regex that
    // matched NOTHING reading as a pass — `> 0` catches exactly that and does not
    // go stale as content changes.
    expect(articles.length, 'the posts sitemap should list articles to check').toBeGreaterThan(0)

    type Candidate = { path: string; frag: string }
    const candidates: Candidate[] = []
    const missing: string[] = []
    let fragmentsChecked = 0

    for (const path of articles) {
      const html = await (await fetch(base + path)).text()
      const frags = [...html.matchAll(/class="art-toc-link[^"]*"\s+href="#([^"]+)"/g)].map(
        (m) => m[1],
      )
      if (!frags.length) continue
      for (const frag of frags) {
        fragmentsChecked++
        // Anchored to a heading tag, so an id on some other element cannot
        // satisfy a contents link that promises to reach a heading.
        if (new RegExp(`<h[1-6][^>]*\\sid="${frag}"`).test(html)) {
          candidates.push({ path, frag })
        } else {
          missing.push(`${path}#${frag}`)
        }
      }
    }

    // Positive controls: a regex that matched nothing must not read as a pass.
    // Same recalibration: `> 10` assumed the scaffold's article count. The four
    // real articles carry 8 contents links between them (2 each), so the bound is
    // again "the regex found something", not a volume.
    expect(fragmentsChecked, 'articles should have contents links to check').toBeGreaterThan(0)
    expect(
      missing,
      `contents links whose heading id is absent from the SERVER html — a pasted\nURL with this fragment will not jump:\n  ${missing.join('\n  ')}`,
    ).toEqual([])

    // ── 2. Behaviour, both states, each on its own fresh page ──────────────
    const read = (page: Page, id: string) =>
      page.evaluate((anchor) => {
        const el = document.getElementById(anchor)
        const nav = document.querySelector('nav.site-nav')
        if (!el || !nav) return null
        return {
          ready: document.readyState,
          // FontFaceSet reports 'loading' | 'loaded'; there is no 'complete'.
          fonts: document.fonts ? document.fonts.status : 'loaded',
          top: Math.round(el.getBoundingClientRect().top),
          scrollY: Math.round(window.scrollY),
          // Read the offset rather than hardcoding 96, so retuning
          // --vf-scroll-offset in the Design System cannot turn this red for the
          // wrong reason. Keep the raw value too: with no rule at all this is
          // the string "auto", and parseFloat('auto') is NaN — which silently
          // poisons every comparison it touches.
          padTop: parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop),
          padTopRaw: getComputedStyle(document.documentElement).scrollPaddingTop,
          navH: Math.round(nav.getBoundingClientRect().height),
          maxScroll: Math.round(document.documentElement.scrollHeight - window.innerHeight),
        }
      }, id)

    // Poll from Node rather than with `waitForFunction`: Playwright implements
    // in-page polling with a script the page runs, which cannot happen in the
    // JavaScript-disabled context below. Stabilise on the *measured* quantity —
    // `scrollY` settling does not prove the target stopped moving, since a late
    // font swap or image load shifts the element while the scroll offset holds.
    // The landing is not instant: `html { scroll-behavior: smooth }` means the
    // browser animates it, measured at ~600ms on a warm dev server.
    const settle = async (page: Page, id: string) => {
      const deadline = Date.now() + 20_000
      let last: number | null = null
      let stable = 0
      let sample: Awaited<ReturnType<typeof read>> = null
      while (Date.now() < deadline) {
        sample = await read(page, id)
        if (sample && sample.ready === 'complete' && sample.fonts !== 'loading') {
          if (sample.top === last) {
            if (++stable >= 5) return sample
          } else {
            stable = 0
            last = sample.top
          }
        }
        await page.waitForTimeout(100)
      }
      throw new Error(`#${id} never settled: ${JSON.stringify(sample)}`)
    }

    // `.art-layout` collapses to one column at ≤860px, which moves every
    // heading — so fix the viewport before navigating, not after.
    const viewport = { width: 1440, height: 900 }

    const chosen: { path: string; frag: string; rest: number }[] = []
    const tooShort: string[] = []
    const ctx = await browser.newContext({ viewport })
    for (const c of candidates) {
      const page = await ctx.newPage()
      await page.goto(base + c.path, { waitUntil: 'load' })
      const a = await settle(page, c.frag)
      expect(a.scrollY, `${c.path} should open at the top of the page`).toBe(0)
      // Precondition, stated as its own cause: without a scroll offset that
      // clears the masthead every anchor on the site lands behind it. Assert it
      // here rather than letting NaN propagate — parseFloat('auto') poisons the
      // candidate arithmetic below and the test then fails saying it could not
      // find an article, which is true and useless.
      expect(
        a.padTop,
        `html { scroll-padding-top } computes to "${a.padTopRaw}", which does not clear the ${a.navH}px sticky nav`,
      ).toBeGreaterThanOrEqual(a.navH)
      // The two states have to be distinguishable, and the heading has to be
      // able to reach the line — a heading in the last viewport of a short
      // article clamps at the document bottom. State the reason and move on
      // rather than loosening the assertion into an allowlist.
      if (a.top - a.padTop > 200 && a.top - a.padTop <= a.maxScroll) {
        chosen.push({ ...c, rest: a.top })
      } else {
        tooShort.push(`${c.path}#${c.frag} (rest y=${a.top}, max scroll ${a.maxScroll})`)
      }
      await page.close()
      if (chosen.length >= 3) break
    }
    await ctx.close()
    expect(
      chosen.length,
      `no article heading both sits below the fold and can reach the scroll line, so\nthis test would prove nothing. Skipped:\n  ${tooShort.join('\n  ')}`,
    ).toBeGreaterThan(0)

    // ── 3. With JavaScript, and then without it ────────────────────────────
    for (const javaScriptEnabled of [true, false]) {
      const context = await browser.newContext({ viewport, javaScriptEnabled })
      for (const c of chosen) {
        const page = await context.newPage()
        await page.goto(`${base}${c.path}#${c.frag}`, { waitUntil: 'load' })
        const b = await settle(page, c.frag)
        const where = `${c.path}#${c.frag} (javaScript ${javaScriptEnabled ? 'on' : 'off'})`
        expect(
          Math.abs(b.top - b.padTop),
          `${where}: heading landed at y=${b.top}, not on the ${b.padTop}px scroll line (it rests at y=${c.rest})`,
        ).toBeLessThanOrEqual(4)
        expect(
          b.top,
          `${where}: heading is behind the ${b.navH}px sticky nav at y=${b.top}`,
        ).toBeGreaterThanOrEqual(b.navH)
        await page.close()
      }
      await context.close()
    }
  })

  /**
   * The registration enquiry email.
   *
   * Portal access is by registration only, so two buttons open the visitor's mail
   * app with the request already written: "Email Us to Register" on /contact and
   * "Register an Account" on /make-a-booking. Both read one template in Site
   * Settings, so this asserts the *decoded* subject and body rather than the
   * presence of a link.
   *
   * ── Why the crawl above does not cover this ──
   * It filters `mailto:` out at both the collection and the fragment step (a
   * mail client is not something Playwright can follow), so these buttons are
   * invisible to it. Without these tests the feature would be entirely unguarded.
   *
   * ── Why the selectors are scoped ──
   * /contact already carried three plain `mailto:admin@vmls.com.au` links before
   * this feature existed — the hero meta item and the map's "Email Us" — so an
   * unscoped "is there a mailto?" passes whether or not the button was ever
   * added. Measured before the change: 3 mailtos on the page, 0 of them carrying
   * a subject. Everything below is scoped to the portal card and keyed on the
   * subject, so the assertion cannot be satisfied by the pre-existing links.
   *
   * The expected wording is parsed out of the design reference rather than
   * copied into this file, so a drift in the port cannot be absorbed by editing
   * the assertion — the same rule the CSS diff tool follows.
   */
  test('the registration buttons open a prefilled email matching the reference', async ({
    page,
    baseURL,
  }) => {
    const base = baseURL!

    // The reference ships this exact email on 28 of its own pages.
    const refHtml = readFileSync(
      join(process.cwd(), '.design-reference/specialists/profiles/dr-adam-parr.html'),
      'utf8',
    )
    const refMatch = refHtml.match(/href="(mailto:[^"]*Portal%20Access[^"]*)"/)
    expect(refMatch, 'the design reference should contain the portal-access mailto').toBeTruthy()
    const ref = new URL(refMatch![1])
    const refSubject = ref.searchParams.get('subject')
    const refBody = ref.searchParams.get('body')
    expect(refBody, 'the reference body should be non-empty').toBeTruthy()

    // ── /contact — scoped to the Online Booking Portal card ──
    await page.goto(`${base}/contact`, { waitUntil: 'load' })
    // Scoped to the portal card's own button area. NOT `.ct-portal-card` — that
    // class is in globals.css but never reaches the DOM (the seed sets only the
    // BEM children), so a selector built on it silently matches nothing.
    const card = page.locator('.ct-portal-card__btn')
    expect(
      await card.count(),
      'the portal card should hold Log In, Call, and the new email button',
    ).toBe(3)

    const pageMailtos = await page
      .locator('a[href^="mailto:"]')
      .evaluateAll((els) => els.map((e) => e.getAttribute('href') || ''))
    expect(
      pageMailtos.length,
      'positive control: /contact has plain mailto links, so a bare "is there a mailto" check would pass regardless',
    ).toBeGreaterThan(1)

    const subjectBearing = pageMailtos.filter((h) => h.includes('subject='))
    expect(
      subjectBearing.length,
      'exactly one mailto on /contact should carry a subject (it was 0 before this feature)',
    ).toBe(1)

    const cardLink = card.locator('a[href^="mailto:"]').first()
    expect(await cardLink.count(), 'the email button should be inside the portal card').toBe(1)
    expect((await cardLink.innerText()).trim()).toBe('Email Us to Register')

    // ── Both buttons, decoded ──
    const targets: { label: string; href: string }[] = [
      { label: '/contact card button', href: (await cardLink.getAttribute('href')) || '' },
    ]

    await page.goto(`${base}/make-a-booking`, { waitUntil: 'load' })
    const register = page
      .locator('.booking-half-actions a', { hasText: 'Register an Account' })
      .first()
    expect(await register.count(), '"Register an Account" should be on /make-a-booking').toBe(1)
    const registerHref = (await register.getAttribute('href')) || ''
    expect(
      registerHref,
      '"Register an Account" used to navigate to /contact and should now open an email',
    ).not.toBe('/contact')
    targets.push({ label: '/make-a-booking Register an Account', href: registerHref })

    for (const { label, href } of targets) {
      expect(href.startsWith('mailto:'), `${label}: href is ${href.slice(0, 60)}`).toBe(true)
      const url = new URL(href)
      expect(url.pathname, `${label}: recipient`).toBe('admin@vmls.com.au')
      expect(url.searchParams.get('subject'), `${label}: subject`).toBe(refSubject)
      // Byte-for-byte, trailing spaces after each blank included.
      expect(url.searchParams.get('body'), `${label}: body`).toBe(refBody)
    }
  })
})
