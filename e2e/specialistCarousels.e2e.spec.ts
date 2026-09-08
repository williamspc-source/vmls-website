import { test, expect, type Page } from '@playwright/test'

/**
 * The three specialist carousels show the people they claim to show.
 *
 * All three were, or could silently become, a list of whoever happens to sort
 * first. `PeopleGrid` builds no `where` clause when its filters are unset, so an
 * unfiltered block returns the first N specialists by admin drag order — which
 * renders perfectly and means nothing:
 *
 *   - the homepage's "Meet Our Expert Panel" showed Beer→Garg alphabetically;
 *   - /jme's "Specialists Who Conduct JME Assessments" listed ten people of whom
 *     **three** were tagged for JME, while five who were tagged did not appear.
 *
 * ── Why every test here asserts a NON-ZERO count first ──
 * The failure this guards against does not look like a wrong list. It looks like
 * nothing at all: `PeopleGrid` ends with `if (cards.length === 0) return null`, so
 * a filter matching no one deletes the entire band — heading, subheading,
 * carousel and both footer buttons — with no error in the page, the console or
 * the build. A test that only checked "no unfeatured specialist appears" would
 * pass perfectly against that empty band, which is the exact state the change was
 * made to prevent. The count assertion is the load-bearing half.
 *
 * ── The double render ──
 * `ExpertsCarousel` is an infinite marquee: it renders every card twice, the
 * second pass `aria-hidden` and non-focusable, so `translateX(-50%)` loops
 * seamlessly. Names are therefore collected into a Set rather than counted.
 */

/** Every distinct specialist name in the first `.experts-carousel` on the page. */
const carouselNames = async (page: Page): Promise<string[]> => {
  const carousel = page.locator('.experts-carousel').first()
  await expect(carousel, 'the carousel band should be on the page at all').toBeVisible()
  // `.expert-name`, not `.spec-name` — the latter is the SpecialistDirectory
  // card's class and matches nothing inside a carousel, which reads as an empty
  // band rather than as a bad selector.
  const names = await carousel.locator('.expert-name').allInnerTexts()
  return [...new Set(names.map((n) => n.trim()).filter(Boolean))].sort()
}

test.describe('specialist carousels show a real selection', () => {
  /**
   * The seven Featured specialists, as `FEATURED_SLUGS` in
   * src/endpoints/seed/seedFeaturedSpecialists.ts asserts them. Written out
   * rather than derived, because the point of this test is that the seeded
   * editorial choice reaches the page — deriving it from the same source that
   * sets it would assert only that the code agrees with itself.
   */
  const FEATURED = [
    'Adjunct Professor Anna Lenardon',
    'Dr Ashwani Garg',
    'Dr James Reidy',
    'Dr Jason Beer',
    'Dr Lucas Murphy',
    'Dr Simon Perkins',
    'Ms Orla Fox',
  ].sort()

  test('the homepage carousel is exactly the featured specialists', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' })

    const names = await carouselNames(page)

    // Non-zero BEFORE the set comparison: see the header. An empty band would
    // otherwise satisfy "contains no one who should not be there".
    expect(names.length, 'the homepage carousel rendered no specialists at all').toBeGreaterThan(0)
    expect(names).toEqual(FEATURED)
  })

  /**
   * /jme filters by assessment type, so the correct answer is not a fixed list —
   * it is "whoever is tagged for JME", which an editor changes by ticking a box on
   * a specialist's profile. Asserting against the API rather than a hardcoded list
   * is what makes this test still true after they do, and it is the only form that
   * actually checks the filter rather than checking today's data.
   */
  test('the /jme carousel is exactly the JME-tagged specialists', async ({ page, request }) => {
    const types = await request.get('/api/assessment-types?where[slug][equals]=jme&limit=1&depth=0')
    expect(types.ok(), 'assessment-types API should respond').toBe(true)
    const jmeId = (await types.json()).docs?.[0]?.id
    expect(jmeId, 'the "jme" assessment type should exist').toBeTruthy()

    const tagged = await request.get(
      `/api/specialists?where[assessmentTypes][equals]=${jmeId}&limit=100&depth=0`,
    )
    const expected: string[] = ((await tagged.json()).docs ?? [])
      .map((d: { title: string }) => d.title)
      .sort()

    // A positive control on the fixture itself: if nobody is tagged, the
    // comparison below would be satisfied by an empty carousel — the failure this
    // whole file exists to catch, arriving through the back door.
    expect(expected.length, 'no specialist is tagged for JME, so this proves nothing').toBeGreaterThan(0)

    await page.goto('/services/medico-legal/jme', { waitUntil: 'load' })
    const names = await carouselNames(page)

    expect(names.length, 'the /jme carousel rendered no specialists at all').toBeGreaterThan(0)
    expect(names).toEqual(expected)

    // Both directions, named explicitly. Before the filter existed this page
    // showed Karpa (untagged) and omitted Lenardon (tagged) — so these two are the
    // difference the change actually made, and a filter that silently stopped
    // applying would still pass a set comparison against a stale expectation.
    expect(names, 'Lenardon is tagged for JME and was missing before the filter').toContain(
      'Adjunct Professor Anna Lenardon',
    )
    expect(names, 'Karpa is not tagged for JME and was shown before the filter').not.toContain(
      'Dr Michael Karpa',
    )
  })

  /**
   * Make a Booking was already correct — its carousel is hardcoded to
   * `advertise: true` and `seedAvailability`'s ADVERTISED table sets that flag
   * unconditionally on every run. This test exists so it stays correct: nothing
   * else would notice if that query or that table quietly emptied.
   */
  test('the Make a Booking carousel is exactly the advertised specialists', async ({
    page,
    request,
  }) => {
    const res = await request.get(
      '/api/specialists?where[advertise][equals]=true&limit=100&depth=0',
    )
    const expected: string[] = ((await res.json()).docs ?? [])
      .map((d: { title: string }) => d.title)
      .sort()
    expect(expected.length, 'no specialist is advertised, so this proves nothing').toBeGreaterThan(0)

    await page.goto('/make-a-booking', { waitUntil: 'load' })
    const names = await carouselNames(page)

    expect(names.length, 'the booking carousel rendered no specialists at all').toBeGreaterThan(0)
    expect(names).toEqual(expected)

    // Fox is featured on the homepage and deliberately NOT advertised — the two
    // flags drive two different pages, and a repair that conflated them would
    // otherwise go unnoticed.
    expect(names, 'Ms Orla Fox is featured, not advertised').not.toContain('Ms Orla Fox')
  })
})
