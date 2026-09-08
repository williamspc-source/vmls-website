import { test, expect, Page } from '@playwright/test'
import { login } from '../helpers/login'
import { seedTestUser, cleanupTestUser, cleanupPage, testUser } from '../helpers/seedUser'

test.describe('Admin Panel', () => {
  let page: Page

  // Set by the create-view test below. Opening the Create New form autosaves an
  // empty Pages draft immediately, so the suite has to take it away again.
  let createdPageId: string | undefined

  test.beforeAll(async ({ browser }) => {
    await seedTestUser()

    const context = await browser.newContext()
    page = await context.newPage()

    await login({ page, user: testUser })
  })

  test.afterAll(async () => {
    await cleanupPage(createdPageId!)
    await cleanupTestUser()
  })

  test('can navigate to dashboard', async () => {
    await page.goto('http://localhost:3000/admin')
    await expect(page).toHaveURL('http://localhost:3000/admin')
    const dashboardArtifact = page.locator('span[title="Dashboard"]').first()
    await expect(dashboardArtifact).toBeVisible()
  })

  // The two assertions below were the template's and had gone stale against this
  // Payload version, so `pnpm test:e2e` was red regardless of the code:
  //
  //   - the list view now redirects to `?depth=1&limit=10`, so an exact
  //     `toHaveURL` on the bare path never matched;
  //   - the create view renders its title input as `#field-title`, not
  //     `input[name="title"]`.
  //
  // Matched to what the admin actually renders, and loosened where the exact form
  // is Payload's business rather than ours.
  test('can navigate to list view', async () => {
    await page.goto('http://localhost:3000/admin/collections/users')
    await expect(page).toHaveURL(/\/admin\/collections\/users/)
    const listViewArtifact = page.locator('h1', { hasText: 'Users' }).first()
    await expect(listViewArtifact).toBeVisible()
  })

  test('can navigate to edit view', async () => {
    await page.goto('http://localhost:3000/admin/collections/pages/create')
    await expect(page).toHaveURL(/\/admin\/collections\/pages\/[a-zA-Z0-9-_]+/)
    const editViewArtifact = page.locator('#field-title')
    await expect(editViewArtifact).toBeVisible()

    // The id Payload redirected to IS the autosaved draft — the URL assertion
    // above only passes because one was created. Record it so afterAll can
    // remove it; `create` itself is not an id.
    const id = new URL(page.url()).pathname.split('/').pop()
    if (id && id !== 'create') createdPageId = id
  })

  /**
   * The point of the rich-text conversion, checked at the layer the editor uses.
   *
   * Everything else in this pass can pass while the admin is unusable: the
   * database can hold correct Lexical trees, the site can render them perfectly,
   * the types can compile — and the field can still be a text box, or a broken
   * editor nobody can type into. The whole reason for the work is that staff can
   * format copy themselves, so it is asserted where staff are.
   *
   * Selectors here were read off the rendered admin rather than guessed, and it
   * took three corrections to get there — each one a way this test could have
   * reported "not converted" about a perfectly converted page:
   *   1. the layout lives behind a **tab**; on load the form shows only the Hero;
   *   2. the tab has to be waited for, because the admin renders fields after
   *      hydration and clicking a button that is not there yet does nothing;
   *   3. blocks render **collapsed**, and a collapsed block's fields are absent
   *      from the DOM entirely — not hidden, absent.
   *
   * Proven red: change `inlineRichTextField` to emit `type: 'text'`, rebuild, and
   * this fails on the missing editor while the other three admin tests still pass.
   */
  test('section headings are rich-text editors with a colour control', async () => {
    // /about carries WhyVerify and MissionPillars, both of which use the shared
    // section header, and it is authored — so these are real fields with real
    // content rather than an empty create form.
    // The id is looked up rather than guessed from the row's title: titles are
    // editable content, and a test that clicks a link by its wording breaks the
    // day someone renames the page.
    const res = await page.request.get(
      'http://localhost:3000/api/pages?where[slug][equals]=about&limit=1&depth=0',
    )
    const aboutId = (await res.json())?.docs?.[0]?.id
    expect(aboutId, '/about should exist — it carries the shared section header').toBeTruthy()

    await page.goto(`http://localhost:3000/admin/collections/pages/${aboutId}`)
    // Wait for the form itself, not just the document: the admin renders its
    // fields after hydration, and clicking a tab that is not there yet silently
    // does nothing — which reads exactly like a conversion that did not happen.
    const contentTab = page.locator('.tabs-field__tab-button', { hasText: 'Content' }).first()
    await expect(contentTab).toBeVisible({ timeout: 30_000 })
    // The layout lives behind this tab. On load the form shows only the Hero
    // fields.
    // Click until the tab is actually selected, rather than once and hoping.
    //
    // A single click is silently lost: the button is visible and stable, so
    // Playwright's actionability checks pass, but React has not attached its
    // handler yet. Measured at this point in the test — `activeTab: "Hero"`,
    // `hasLayoutField: false`, one collapsible, zero editors — and waiting a
    // further **30 seconds** for the tab to become active never helped, because
    // there was nothing still in flight. The click simply never happened.
    //
    // That was masked for months by a `waitForTimeout(300)` in the expansion loop
    // below, which gave a later re-render time to land, so the counts came out
    // right for the wrong reason. When the admin slowed down the mask slipped and
    // the test began reporting 3 editors against an expected 6 — reading exactly
    // like a page that had lost its rich-text fields. Raising that sleep to
    // 1500ms made it pass again and would have hidden the cause a second time.
    await expect(async () => {
      await contentTab.click()
      await expect(page.locator('.tabs-field__tab-button--active')).toHaveText(/Content/, {
        timeout: 2_000,
      })
    }).toPass({ timeout: 30_000 })

    // And the pane's own field, not just the tab's styling.
    await expect(page.locator('[id*="field-layout"]').first()).toBeAttached({ timeout: 30_000 })

    // Blocks render collapsed, and a collapsed block's fields are not in the DOM
    // at all — so counting editors without expanding one reports zero on a
    // perfectly converted page. Same shape as the Tabs trap in CLAUDE.md: the
    // content is not hidden, it is absent.
    // Converted: a Lexical editing surface. A plain text field renders an
    // `<input>`, so this is what distinguishes "rich text" from "still a text box".
    const editors = page.locator('[data-lexical-editor="true"]')

    /**
     * Wait until expanding a block has finished adding editors.
     *
     * This used to be `waitForTimeout(300)` after each click, and it began
     * failing consistently at **3 editors** against an expected 6. Not flake and
     * not a regression: `/about` had not been touched since the last green run,
     * the admin had simply got slower, and 300ms stopped covering the mount.
     * Raising the sleep to 1500ms made it pass — which is the diagnosis, not the
     * fix, because a fixed delay is wrong in both directions.
     *
     * Two things had to be true and only one was obvious. Polling harder at the
     * END does not work: measured, with the four clicks fired back to back the
     * page settles at 3 editors and stays there for a full 30s, because the list
     * reflows as blocks expand and a later `nth(i)` no longer resolves to the row
     * it was counted for. So the wait has to sit BETWEEN the clicks, which is
     * what the original sleep was really doing.
     */
    const settled = async () => {
      let previous = -1
      let stableFor = 0
      for (let i = 0; i < 100; i++) {
        const now = await editors.count()
        // One matching read is not stability. The first version of this returned
        // on the first repeat and still reported 3, because immediately after a
        // click the count has not moved YET — so "unchanged" meant "nothing has
        // started" rather than "everything has finished". Require a plateau.
        stableFor = now === previous ? stableFor + 1 : 0
        if (stableFor >= 6) return now
        previous = now
        await page.waitForTimeout(100)
      }
      return previous
    }

    const toggles = page.locator('.collapsible__toggle')
    const toExpand = Math.min(await toggles.count(), 4)
    for (let i = 0; i < toExpand; i++) {
      await toggles.nth(i).click()
      await settled()
    }

    await expect(editors.first()).toBeVisible({ timeout: 30_000 })
    expect(await editors.count()).toBeGreaterThan(5)

    // The per-section colour control.
    await expect(page.locator('[id$="__textColour"]').first()).toBeAttached({ timeout: 30_000 })

    // And the compact treatment is live rather than merely written: the inline
    // editors are capped, while a body rich-text editor on the same page is not.
    // Without the control this would pass against a stylesheet that never loaded.
    const heights = await page.evaluate(() => {
      const inline = document.querySelector('.vf-inline-richtext .ContentEditable__root')
      const body = [...document.querySelectorAll('.ContentEditable__root')].find(
        (el) => !el.closest('.vf-inline-richtext'),
      )
      const maxHeight = (el: Element | null | undefined) =>
        el ? getComputedStyle(el).maxHeight : null
      return { inline: maxHeight(inline), body: maxHeight(body) }
    })
    expect(heights.inline).not.toBe('none')
    expect(heights.body).toBe('none')
  })
})
