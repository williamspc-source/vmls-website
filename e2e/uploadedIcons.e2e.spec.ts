import { test, expect, type APIRequestContext } from '@playwright/test'

import { iconTestUser } from '../helpers/globalSetup'
import { login } from '../helpers/login'

/**
 * An uploaded icon behaves like a built-in one.
 *
 * ## Why this has to be a browser test
 *
 * The claim is about a COMPUTED colour, and nothing in the source can settle it.
 * An uploaded icon is a `<span>` painted with `background-color: currentColor`
 * and masked by the artwork's alpha; a built-in is a Phosphor `<svg>` filling
 * from `currentColor`. Two completely different elements that have to end up the
 * same colour on the same band — which only `getComputedStyle` can confirm.
 *
 * It caught two real defects on the way in, neither visible in the source:
 *
 *  · The mask was a `<span>`. globals.css sizes and colours icons through **69**
 *    rules that select `svg` (re-measured 2026-08-26) — `.ni-card-img svg { width: 36px }`,
 *    `.img-qa svg { color: … }` — and a span matches none of them, so an upload
 *    rendered at 24px in `rgb(65,64,66)` where the built-in it replaced was 36px
 *    in a tinted blue. It is an empty `<svg>` now, painted entirely by
 *    `background-color: currentColor` through the artwork's alpha.
 *  · The per-icon default colour is published by the layout as
 *    `[data-vf-icon="3"]{color:…}`, and the first version used the raw token — so
 *    on the navy portal band an upload defaulting to Brand blue painted
 *    `rgb(28,117,188)` beside a built-in painting `rgb(147,208,247)`. The dark
 *    re-point is derived from the same palette entry `.vf-tc-*` uses
 *    (`onDarkToken`), and case 2 below is what keeps it that way.
 *
 * ## Why the comparison is measured, not written down
 *
 * Case 1 reads what a BUILT-IN icon is painted on this exact band *before*
 * anything changes, then requires the upload to reproduce it. A hardcoded colour
 * would have to be updated whenever the design changes, and would pass while
 * meaning nothing.
 *
 * ## What it does to the database
 *
 * Uploads one icon and borrows one stream's `icon` field, then puts both back in
 * `finally` — including when an assertion fails, so a red run does not leave the
 * next one measuring the wrong thing.
 *
 * ## Proven red by (invariant 17)
 *
 *  1. drop `background-color: currentColor` from `.vf-icon-mask` in globals.css
 *     → "the upload paints rgba(0, 0, 0, 0) where the built-in it replaced
 *        painted color(srgb 0.109804 0.458824 0.737255 / 0.35)"
 *  2. drop the `entry.onDarkToken` branch from `iconDefaultCss`
 *     → "no on-dark re-point was published — this icon will stay brand blue on a
 *        dark band"
 *  3. stop `Icon` applying `colorClass(...)`
 *     → "the placement colour produced no class"
 *
 * All three were run against the CSS the browser had actually received, because
 * the dev server lags globals.css by ~20s and has faked a PASS here before.
 */

const SERVER = 'http://localhost:3000'

/**
 * Its OWN user, seeded once by `globalSetup` — not the shared `seedTestUser`
 * account, which is deleted and recreated on every use and so cannot be shared
 * across two spec files running in parallel. See `tests/helpers/globalSetup.ts`.
 */
const iconUser = iconTestUser

// A deliberately garish two-colour SVG: the mask reads alpha only, so BOTH of
// these colours must be gone from what renders. A file that happened to be the
// right colour already would prove nothing.
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <path d="M16 2 L28 7 V16 C28 23 22 28 16 30 C10 28 4 23 4 16 V7 Z" fill="#ff00ff"/>
</svg>`

/** Two colours, so the stored markup should come back as two TONES. */
const TWO_COLOUR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <path d="M16 2 L28 7 V16 C28 23 22 28 16 30 C10 28 4 23 4 16 V7 Z" fill="#1a3a5c"/>
  <path d="M11 16 l4 4 l7 -8 l-2 -2 l-5 6 l-2 -2 Z" fill="#ff2d95"/>
</svg>`

/**
 * `/in-the-loop` cards render their stream's icon in `.ni-card-img`, as the
 * fallback for a post with no hero image. Only the stream that HAS posts appears,
 * so the test asks the API which one that is rather than assuming.
 */
const STREAM_ROUTE = '/in-the-loop'

type Ctx = { api: APIRequestContext; token: string }

const authed = (t: string) => ({ Authorization: `JWT ${t}`, 'Content-Type': 'application/json' })

const login2 = async (api: APIRequestContext): Promise<string> => {
  const res = await api.post(`${SERVER}/api/users/login`, { data: iconUser })
  expect(res.ok(), 'could not log in to place a test icon').toBeTruthy()
  return (await res.json()).token as string
}

const uploadIcon = async ({ api, token }: Ctx, colour: string, svg = SVG): Promise<number> => {
  const res = await api.post(`${SERVER}/api/icons`, {
    headers: { Authorization: `JWT ${token}` },
    multipart: {
      file: { name: 'e2e-icon.svg', mimeType: 'image/svg+xml', buffer: Buffer.from(svg) },
      _payload: JSON.stringify({ name: 'E2E test icon', colour }),
    },
  })
  const body = await res.json()
  expect(body?.doc?.id, `upload failed: ${JSON.stringify(body?.errors ?? body).slice(0, 300)}`).toBeTruthy()
  return body.doc.id as number
}

/** What the listing's first stream icon is, and what it is painted. */
const readIcon = async (page: import('@playwright/test').Page) => {
  await page.goto(`${SERVER}${STREAM_ROUTE}`, { waitUntil: 'load' })
  return page.evaluate(() => {
    const card = document.querySelector('.ni-card-img')
    // The mask is itself an <svg>, so it is looked for FIRST and the built-in
    // query excludes it — otherwise `tier` reads "builtin" for an upload.
    const mask = card?.querySelector<SVGElement>('.vf-icon-mask') ?? null
    const svg = card?.querySelector<SVGElement>('svg:not(.vf-icon-mask)') ?? null
    const el = (mask ?? svg) as HTMLElement | null
    const box = el?.getBoundingClientRect()
    return {
      tier: mask ? 'upload' : svg ? 'builtin' : 'none',
      painted: mask
        ? getComputedStyle(mask as unknown as Element).backgroundColor
        : svg
          ? getComputedStyle(svg).color
          : null,
      maskImage: mask ? getComputedStyle(mask).maskImage : null,
      size: box ? [Math.round(box.width), Math.round(box.height)] : null,
      // `getAttribute`, not `.className`: the mask is an <svg> element, whose
      // `className` is an SVGAnimatedString rather than a string — `toContain`
      // on one throws "a is not iterable" instead of failing readably.
      classes: mask?.getAttribute('class') ?? null,
      // The layout's published defaults, read from the page itself rather than
      // from the source that generated them.
      publishedCss: document.getElementById('verify-design-tokens')?.textContent ?? '',
    }
  })
}

test.describe('an uploaded icon behaves like a built-in one', () => {
  test('paints the site colour, follows a dark band, and obeys a placement colour', async ({
    page,
    request,
  }) => {
    const token = await login2(request)
    const ctx: Ctx = { api: request, token }

    // The stream that actually has posts — it is the only one whose icon appears
    // on the listing, and which that is is content, not something to assume.
    const posts = await (
      await request.get(`${SERVER}/api/posts?limit=1&depth=1&sort=-publishedAt`, {
        headers: authed(token),
      })
    ).json()
    const stream = posts?.docs?.[0]?.stream
    expect(stream?.id, 'no published post with a stream — nothing renders a stream icon').toBeTruthy()
    const originalIcon = stream.icon ?? null

    const setIcon = async (value: string | null) => {
      const res = await request.patch(`${SERVER}/api/streams/${stream.id}`, {
        headers: authed(token),
        data: { icon: value },
      })
      expect(res.ok(), `could not set the stream icon to ${value}`).toBeTruthy()
    }

    // What a BUILT-IN icon is painted on this exact band, measured before
    // anything changes. This is the number the upload has to reproduce, and
    // taking it from the page rather than writing it down is what keeps the test
    // true when the design changes.
    const builtin = await readIcon(page)
    expect(builtin.tier, 'no stream icon on the listing to compare against').toBe('builtin')
    expect(builtin.painted, 'the built-in stream icon is painted nothing').toBeTruthy()

    // `inherit`, so the upload has no colour of its own and must land on exactly
    // the built-in's colour. Any other default would make the comparison a
    // coincidence rather than a proof.
    const iconId = await uploadIcon(ctx, 'inherit')

    try {
      // ── 1. It renders, it is masked, and it takes the band's colour ──
      await setIcon(`upload:${iconId}`)
      const plain = await readIcon(page)

      // Positive control: without this, every assertion below is comparing null
      // to null on a page that rendered no icon (invariant 41).
      expect(plain.tier, `no .vf-icon-mask on ${STREAM_ROUTE} — the upload never reached the page`).toBe('upload')
      expect(plain.size?.[0], 'the uploaded icon has no width').toBeGreaterThan(0)
      expect(plain.maskImage, 'no mask-image, so the element is a solid block of colour').toContain(
        `/api/icon/upload/${iconId}`,
      )

      // The artwork is magenta. If any of it survived, this is not a mask.
      expect(plain.painted, "the upload kept the file's own colour — it is not a mask").not.toBe(
        'rgb(255, 0, 255)',
      )
      expect(
        plain.painted,
        `the upload paints ${plain.painted} where the built-in it replaced painted ${builtin.painted}`,
      ).toBe(builtin.painted)

      // ── 2. A default colour on the RECORD reaches the page, dark rule and all ──
      const patched = await request.patch(`${SERVER}/api/icons/${iconId}`, {
        headers: authed(token),
        data: { colour: 'brand' },
      })
      expect(patched.ok(), 'could not set the icon record colour').toBeTruthy()

      const branded = await readIcon(page)
      expect(
        branded.publishedCss,
        'the layout published no default-colour rule for this icon',
      ).toContain(`[data-vf-icon="${iconId}"]`)
      // The half that was wrong first time round: without the on-dark re-point an
      // icon defaulting to Brand blue keeps painting #1c75bc on a navy band while
      // every built-in beside it turns pale. Derived from the same palette entry
      // `.vf-tc-*` uses, so the two cannot drift.
      expect(
        branded.publishedCss,
        'no on-dark re-point was published — this icon will stay brand blue on a dark band',
      ).toContain(`.vf-on-dark [data-vf-icon="${iconId}"]`)
      expect(branded.publishedCss).toContain('--accent-on-dark')
      expect(branded.painted, 'the record colour did not reach the icon').not.toBe(builtin.painted)

      // ── 3. A colour chosen at the placement beats the record's default ──
      await setIcon(`upload:${iconId}@white`)
      const forced = await readIcon(page)
      expect(forced.classes, 'the placement colour produced no class').toContain('vf-tc-white')
      expect(
        forced.painted,
        `a placement colour did not win: expected rgb(255, 255, 255), got ${forced.painted}`,
      ).toBe('rgb(255, 255, 255)')
    } finally {
      await setIcon(originalIcon)
      await request.delete(`${SERVER}/api/icons/${iconId}`, { headers: authed(token) })
    }
  })
})

test.describe('the icon library', () => {
  /**
   * An icon an admin adds is indistinguishable from one the site bundles.
   *
   * `iconMap` holds 101 of Phosphor's 1,513. The other ~1,400 render as an empty
   * `<svg>` painted through `mask-image` rather than as a React component, so the
   * claim that they look the same is a claim about two different elements — which
   * only a browser can settle. Measured while building it: `acorn` came back at
   * the same 36×36 and the same `color(srgb 0.109804 0.458824 0.737255 / 0.35)`
   * as the bundled icon it replaced.
   *
   * Proven red by removing the third branch from `Icon` → "the library icon did
   * not render at all".
   */
  test('an icon outside the bundled 101 renders like one inside it', async ({ page, request }) => {
    const token = await login2(request)

    const posts = await (
      await request.get(`${SERVER}/api/posts?limit=1&depth=1&sort=-publishedAt`, {
        headers: authed(token),
      })
    ).json()
    const stream = posts?.docs?.[0]?.stream
    expect(stream?.id, 'no published post with a stream').toBeTruthy()
    const originalIcon = stream.icon ?? null

    const setIcon = async (value: string | null) => {
      const res = await request.patch(`${SERVER}/api/streams/${stream.id}`, {
        headers: authed(token),
        data: { icon: value },
      })
      expect(res.ok()).toBeTruthy()
    }

    // The bundled icon's rendering, taken before anything changes — the number
    // the library icon has to reproduce.
    const bundled = await readIcon(page)
    expect(bundled.tier, 'no stream icon to compare against').toBe('builtin')

    try {
      // `acorn` is deliberately NOT in iconMap: an icon that happened to be
      // bundled would prove nothing about the library path.
      await setIcon('acorn')
      const library = await readIcon(page)

      expect(library.tier, 'the library icon did not render at all').toBe('upload')
      expect(library.maskImage, 'not served from the Phosphor route').toContain(
        '/api/icon/phosphor/acorn',
      )
      expect(
        library.painted,
        `library icon paints ${library.painted}, the bundled one it replaced painted ${bundled.painted}`,
      ).toBe(bundled.painted)
      expect(
        library.size,
        `library icon is ${library.size?.join('×')}, the bundled one was ${bundled.size?.join('×')}`,
      ).toEqual(bundled.size)
    } finally {
      await setIcon(originalIcon)
    }
  })
})

test.describe('the icon upload screen', () => {
  /**
   * The library must show what the SITE renders, not the file that was uploaded.
   *
   * This is the bug that prompted the pass: Payload previews the uploaded bytes,
   * while a page renders markup `normaliseSvgIcon` rebuilt from them with the
   * colours stripped. Measured on a two-colour file — navy and hot pink in the
   * admin, one flat shape on the page.
   *
   * It lives on the library tile rather than on the icon's own record, because
   * `admin.hidden` makes Payload 404 that record's routes outright. One screen,
   * and the preview is on it.
   *
   * Proven red by pointing the swatches at `/api/icons/file/...` → "the preview
   * is showing the uploaded file, not what the site renders".
   */
  test('previews the normalised icon on both bands, not the uploaded file', async ({
    page,
    request,
  }) => {
    // An upload, a browser login and an admin screen holding 1,500 tiles do not
    // fit the 30s default — and the symptom when they do not is a `finally`
    // reporting "browser has been closed", which reads like a teardown bug.
    test.setTimeout(120_000)
    const token = await login2(request)
    const iconId = await uploadIcon({ api: request, token }, 'inherit', TWO_COLOUR_SVG)

    try {
      // Half the claim, and the cheap half: two colours in, two TONES out, which
      // is what makes it a duotone icon rather than a flat blob.
      const doc = await (
        await request.get(`${SERVER}/api/icons/${iconId}?depth=0`, { headers: authed(token) })
      ).json()
      expect(doc.markup, 'a two-colour upload did not become duotone').toContain('opacity="0.2"')
      expect(doc.markup, 'the file\u2019s own colours survived').not.toContain('#1a3a5c')

      await login({ page, user: iconTestUser })
      await page.goto(`${SERVER}/admin/globals/icon-library`, { waitUntil: 'load' })
      await page.locator('.vf-icon-library__tile').first().waitFor({ timeout: 90_000 })

      // The uploaded icon sorts first, and only uploads carry an Edit control.
      const edit = page.locator('.vf-icon-library__edit').first()
      await expect(edit, 'no uploaded tile on the library screen').toBeVisible()
      await edit.click()

      const swatches = await page.evaluate(() =>
        [...document.querySelectorAll('.vf-icon-library__panel .vf-icon-preview__swatch')].map(
          (s) => {
            const el = s.querySelector<HTMLElement>('.vf-icon-select__preview')
            return {
              painted: el ? getComputedStyle(el).backgroundColor : null,
              mask: el ? getComputedStyle(el).maskImage : '',
            }
          },
        ),
      )

      // Positive control: two swatches, or the comparison below is vacuous.
      expect(swatches.length, 'the preview rendered no swatches').toBe(2)

      for (const sw of swatches) {
        expect(
          sw.mask,
          'the preview is showing the uploaded file, not what the site renders',
        ).toContain(`/api/icon/upload/${iconId}`)
        expect(sw.mask).not.toContain('/api/icons/file/')
      }

      // The point of two swatches: the icon takes the band, so they must differ.
      expect(
        swatches[0]!.painted,
        `both swatches painted ${swatches[0]!.painted} — the preview is not showing the band's colour`,
      ).not.toBe(swatches[1]!.painted)
    } finally {
      await request.delete(`${SERVER}/api/icons/${iconId}`, { headers: authed(token) })
    }
  })
})

test.describe('the icon library screen', () => {
  /**
   * One screen, everything on it, and the current set already ticked.
   *
   * It was neither. Uploads lived in Media → Icons while the Phosphor choice
   * lived in a second place behind a search box that rendered nothing until you
   * typed — and the icons the site was already offering showed as **zero ticked**,
   * because the list was empty and the fallback happened invisibly.
   *
   * ## Proven red by (invariant 17)
   *
   *  1. require a search term before rendering tiles → "the library rendered 0
   *     tiles before anything was typed"
   *  2. tick from the stored value instead of the effective one → "0 of the icons
   *     on offer are ticked"
   *  3. drop the `iconMap` lookup from `/api/icon/phosphor/[name]` → "mail (an
   *     alias) is not servable: 404"
   */
  test('shows every icon without searching, with the offered set already ticked', async ({
    page,
    request,
  }) => {
    // 1,500+ tiles, four route checks and an admin login.
    test.setTimeout(120_000)
    // ── The aliases, first, because they are cheap and they regressed ──
    // Ten of the bundled icons are named for what they mean rather than for the
    // Phosphor component behind them — `mail` is Envelope, `search` is
    // MagnifyingGlass. Renaming this route to read the Phosphor barrel 404'd
    // every one, blanking them in the picker while they still rendered on pages.
    const offered = await (await request.get(`${SERVER}/api/icon/library`)).json()
    const values = (offered?.icons ?? []).map((i: { value: string }) => i.value)

    // Positive control: an empty list would satisfy the loop below trivially.
    expect(values.length, 'the library offers nothing at all').toBeGreaterThan(50)

    for (const name of ['mail', 'search', 'home', 'activity']) {
      expect(values, `${name} should be one of the bundled icons`).toContain(name)
      const res = await request.get(`${SERVER}/api/icon/phosphor/${name}`)
      expect(res.status(), `${name} (an alias) is not servable: ${res.status()}`).toBe(200)
    }

    // ── The screen ──
    await login({ page, user: iconTestUser })
    await page.goto(`${SERVER}/admin/globals/icon-library`, { waitUntil: 'load' })
    await page.locator('.vf-icon-library__tile').first().waitFor({ timeout: 90_000 })

    const state = await page.evaluate(() => ({
      tiles: document.querySelectorAll('.vf-icon-library__tile').length,
      ticked: document.querySelectorAll('.vf-icon-library__check input:checked').length,
      hasUpload: Boolean(document.querySelector('.vf-icon-library__upload input[type=file]')),
      hasSearch: Boolean(document.querySelector('.vf-icon-select__search')),
    }))

    // Everything, on arrival, with nothing typed.
    expect(
      state.tiles,
      `the library rendered ${state.tiles} tiles before anything was typed`,
    ).toBeGreaterThan(1_400)

    // And every icon the site currently offers is ticked. Compared against the
    // API rather than a written-down number, so it stays true when the set moves.
    expect(
      state.ticked,
      `${state.ticked} of the ${values.length} icons on offer are ticked`,
    ).toBe(values.length)

    // Uploading happens HERE. Its absence is what made this two screens.
    expect(state.hasUpload, 'no upload control on the library screen').toBe(true)
    expect(state.hasSearch, 'no search on the library screen').toBe(true)

    // ── And there is nothing else in the sidebar to find ──
    // Checked in the SAME test rather than a second one: each admin login and
    // page load is a real cost, and two spec files loading the admin in parallel
    // is what makes this suite flake (README §10.1).
    await page.goto(`${SERVER}/admin`, { waitUntil: 'load' })
    await page.locator('nav a[href="/admin/collections/pages"]').first().waitFor({ timeout: 60_000 })

    // Positive control: the nav rendered, so a zero below means "hidden" rather
    // than "nothing loaded".
    expect(
      await page.locator('nav a[href^="/admin/collections/"]').count(),
      'the admin nav rendered no collection links',
    ).toBeGreaterThan(5)

    expect(
      await page.locator('nav a[href="/admin/collections/icons"]').count(),
      'Media → Icons is back in the sidebar — there should be one place to manage icons',
    ).toBe(0)

    // `admin.hidden` does not merely drop a collection from the nav — Payload
    // 404s its routes outright. Asserted, because it is why renaming, colour and
    // deletion had to move onto the library tile instead of being a link.
    const res = await page.goto(`${SERVER}/admin/collections/icons`, { waitUntil: 'load' })
    expect(
      res?.status(),
      'the icons collection route is reachable again — a tile linking to it would be sensible after all',
    ).toBe(404)
  })

})
