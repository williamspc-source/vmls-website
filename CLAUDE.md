# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

VERIFY Medico-Legal Solutions website — Next.js 16 (App Router) + Payload 3 (Postgres), `pnpm`,
Tailwind 4. Started from the Payload website template; heavily extended into a CMS-driven
page-builder for the VERIFY brand.

## Read this before you change anything

**The governing idea: nothing fails silently, and nothing appears to work when it doesn't.** This
site is handed to people who do not write code. A control that looks editable and isn't, a form that
says "sent" and discarded the enquiry, a link that renders as nothing — each is worse than a visible
error, because nobody finds it and nobody can report it. Every rule below exists because that
already happened here.

**Four standing instructions.**

1. **Assume your instrument is lying before you assume the code is broken.** A stale `.next`, an
   unquoted grep glob, a Playwright probe that never logged in — each has produced a confident wrong
   answer here. `docs/TRAPS.md` is the catalogue; read the relevant section before believing a
   measurement.
2. **Every negative result needs a positive control.** Before believing "not found", make the same
   check find something you know is there.
3. **A guard that has never failed is not evidence.** If you add or change one, prove it goes red on
   the real defect (`zsh tests/int/prove-guards.sh`).
4. **Ask before assuming.** Where the request is ambiguous and the readings disagree, say so rather
   than picking the interpretation that is easiest to build.

## The six records, and the rule for all of them

**A change lands in every document it touches, in the same pass** — or the set starts lying, and a
reader cannot tell which one is stale.

| File | Holds | Reader |
|---|---|---|
| `README.md` | Standing a box up, running it, deploying, testing, where images go, and **every known-imperfect thing with its measured cost** | Whoever inherits or maintains the project |
| `CLAUDE.md` | Architecture, invariants, traps index | Whoever changes the code |
| `docs/TRAPS.md` | Why each invariant exists, and every measurement that has already misled someone | ditto, when a reading looks wrong |
| `docs/ADMIN-GUIDE.md` | What every item in the admin sidebar **is**, and what feeds off it | The non-technical editor |
| `src/Styles/HOOKS.md` | Every editable control and where it lives | ditto, for appearance |
| `docs/ARCHITECTURE.md` | The **map**: which subsystems exist, what each owns, how a request becomes a page | Whoever is seeing the codebase for the first time |

**`docs/ARCHITECTURE.md` restates nothing that can go stale** — no counts, no invariant text, no
schema figures — and that restriction is the only reason a sixth file is safe. It describes shape and
points here for rules and at `README.md` for numbers. If it ever disagrees with one of the five, the
five are right. Added 2026-08-26, on request, with that constraint written into its own opening.

This set was **ten** documents and 9,554 lines. It collapsed to five because the rule above could not
be held at that size: on 2026-08-24, one day after a full "update every document" pass, three
documents gave three different counts for the same shell script, and the status file still described
a deploy that had already happened. Three files were merged into `README.md` and three were deleted as
history (`git log` holds all six), and the trap log moved out of this file. **Read that before adding a seventh.**

`docs/ADMIN-GUIDE.md` and `src/Styles/HOOKS.md` share a reader and must not share content. HOOKS.md
owns *"how do I change how this looks"*; ADMIN-GUIDE.md owns *"what is this thing and what feeds off
it"*. Where they touch — the Events recap fields, the specialist qualification icons, the Site
Settings enquiry form — cross-link, do not restate.

**`src/Styles/HOOKS.md` cannot move and its §6 cannot be restructured.**
`tests/int/adminControls.int.spec.ts` reads it by path and parses §6 by name;
`tests/visual/findDeadCss.mjs` builds its dead-CSS allowlist from it.

**Numbers that go stale silently** — test counts, route counts, schema figures — are re-measured, not
edited around. `README.md` records the command beside each one; run it rather than trusting the
printed value.

## Invariants

Every rule below is here because the failure already happened in this repo. The evidence for each is
in `docs/TRAPS.md` under the matching number — **read it before deleting or weakening a rule**, as
several look arbitrary until you see what happened without them.

1. **Never report success a request did not confirm.** A form that cannot reach its backend says so and disables submit; it does not locally acknowledge. <sub>[why](docs/TRAPS.md#i1)</sub>
2. **A field an editor can set must be read, or hidden by `admin.condition`.** No control that silently does nothing. Guarded by `tests/int/adminControls.int.spec.ts`. <sub>[why](docs/TRAPS.md#i2)</sub>
3. **`src/utilities/routes.ts` is the only place a document path is built** — including `generatePreviewPath`. A `null` return means render it unlinked or as plain text, never a fabricated href. <sub>[why](docs/TRAPS.md#i3)</sub>
4. **Globals whose links can point at Posts are read at depth 2.** A Post's `stream` is one relationship deeper than the link itself. <sub>[why](docs/TRAPS.md#i4)</sub>
5. **Seed `ensure*` helpers return their id in both branches**; repairs go outside the early-return. <sub>[why](docs/TRAPS.md#i5)</sub>
6. **Never call `revalidatePath`/`revalidateTag` from `next/cache` directly.** Use `safeRevalidatePath` / `safeRevalidateTag` from `src/utilities/safeRevalidate.ts`, and honour `context.disableRevalidate`. <sub>[why](docs/TRAPS.md#i6)</sub>
7. **Never pass a named cacheLife profile to a tag purge.** `safeRevalidateTag(tag)` takes no profile and always sends `{ expire: 0 }`. Guarded by `adminControls.int.spec.ts`. <sub>[why](docs/TRAPS.md#i7)</sub>
8. **`308` only for moves that will never change again.** Anything whose destination an editor can change is `307`. <sub>[why](docs/TRAPS.md#i8)</sub>
9. **A collection with autosave drafts creates a document when the Create New form is *opened*.** Anything that visits `/admin/collections/<x>/create` must delete what it made. <sub>[why](docs/TRAPS.md#i9)</sub>
10. **Delete documents through Payload, never with SQL.** `_pages_v.parent_id` is `ON DELETE SET NULL`, not CASCADE. <sub>[why](docs/TRAPS.md#i10)</sub>
11. **zsh does not word-split an unquoted `$var`.** A `for id in $ids` loop over newline-separated ids runs **once**, with every id concatenated. <sub>[why](docs/TRAPS.md#i11)</sub>
12. **The admin sidebar's group order is derived from `payload.config.ts` array order**, not declared. Groups appear in order of first appearance while scanning `collections` then `globals`. That array also has to keep taxonomy lookups ahead of the content referencing them — both constraints at once. <sub>[why](docs/TRAPS.md#i12)</sub>
13. **`CMSLink` is imported by client components, so it cannot be async.** A link type needing a server lookup is resolved by the *block*, and offered only on blocks that resolve it (`link({ portalEnquiry: true })`). <sub>[why](docs/TRAPS.md#i13)</sub>
14. **A component that hardcodes `appearance="inline"` must have `appearances: false` in its config**, or read `.appearance` itself. <sub>[why](docs/TRAPS.md#i14)</sub>
15. **Queries against draft-enabled collections pass `overrideAccess` explicitly.** The Local API defaults to `overrideAccess: true`. <sub>[why](docs/TRAPS.md#i15)</sub>
16. **After any collection/global field change:** `pnpm generate:types` locally, `migrate:create` + `migrate` on the box. Dev auto-push hides schema drift. <sub>[why](docs/TRAPS.md#i16)</sub>
17. **A guard that has never failed is not evidence.** Every test in `adminControls.int.spec.ts` records the deliberate break used to prove it goes red. Re-run it if you change the test (`zsh tests/int/prove-guards.sh`). <sub>[why](docs/TRAPS.md#i17)</sub>
18. **A helper takes the narrowest input that answers the question.** Don't accept a wide all-optional shape and return several answers; a caller holding a partial object will get a confident answer to a question it supplied no data for, and TypeScript will not object. <sub>[why](docs/TRAPS.md#i18)</sub>
19. **A "read this field" check must not count code that *writes* it.** <sub>[why](docs/TRAPS.md#i19)</sub>
20. **An in-page anchor link is two halves: the link *and* the target.** Fixing one without the other is invisible. Guarded by `tests/e2e/links.e2e.spec.ts`. <sub>[why](docs/TRAPS.md#i20)</sub>
21. **Content links live in the database, so a seed edit alone fixes nothing.** Pair every link correction with an unconditional repair (`src/endpoints/seed/seedLinkRepairs.ts`, run from `seedVerify`). <sub>[why](docs/TRAPS.md#i21)</sub>
22. **"Has this been written yet?" is answered by `isUnauthored` (`src/endpoints/seed/authored.ts`) — never by counting blocks.** A repair writes only into an *absence*: a missing block, a superseded string, an empty field. Guarded by `tests/int/seedAuthored.int.spec.ts`. <sub>[why](docs/TRAPS.md#i22)</sub>
23. **For a file, "absence" means the stored bytes differ from the source — not that the field is empty.** Media is deduped by `alt`, and Payload suffixes the stored filename on collision (`wes-lerch.png` → `wes-lerch-15.png`), so `filesize` is the only reliable disk↔database link. <sub>[why](docs/TRAPS.md#i23)</sub>
24. **A field with a `defaultValue` cannot be used as a migration signal.** To detect "this document predates the change", key on a *new* field that declares no default. <sub>[why](docs/TRAPS.md#i24)</sub>
25. **An id a link can target must be in the server HTML, and the id and the link must come from one function** (`src/utilities/headingId.ts`; opt in per `RichText` with `headingIds`). Assigning ids in a `useEffect` is too late for the browser and too late to be worth doing. <sub>[why](docs/TRAPS.md#i25)</sub>
26. **A nav that hides an item for a sibling section decides emptiness through the SAME query the section runs.** Extract the block's filter to a `query.ts` beside it (`src/blocks/*/query.ts`), consumed by the block to fetch and by `src/blocks/sectionEmptiness.ts` to count. <sub>[why](docs/TRAPS.md#i26)</sub>
27. **A walk over a block tree guards `Array.isArray` on EVERY child key.** Block field names are not unique across configs, so a key that holds children on one block holds a scalar on another. <sub>[why](docs/TRAPS.md#i27)</sub>
28. **A field an editor types words into is rich text; a field a machine reads is not.** Convert with `inlineRichTextField`, render with `InlineRichText`, and where a value is also read — an `aria-label`, an iframe `title`, a search haystack, a `{count}` template — flatten it with `richTextToPlain` at that point rather than refusing to convert the field. Guarded by `tests/int/proseFields.int.spec.ts`, which fails on any plain text field with no recorded reason. <sub>[why](docs/TRAPS.md#i28)</sub>
29. **Payload ACCEPTS a plain string in a rich-text field and stores it verbatim.** Nothing validates it. The seed's writes therefore go through `seedCreate`/`seedUpdate` (`src/endpoints/seed/seedWrite.ts`), which lift strings using the sanitised config; guarded by `tests/int/seedWrites.int.spec.ts`. <sub>[why](docs/TRAPS.md#i29)</sub>
30. **An empty rich text is a TRUTHY object.** Every `if (!heading)` and `x || 'Default'` guarding a converted field has to become `hasRichText(x)`. <sub>[why](docs/TRAPS.md#i30)</sub>
31. **A `defaultValue` on a rich-text field must be a FUNCTION.** `richTextDefault('…')` returns one. <sub>[why](docs/TRAPS.md#i31)</sub>
32. **The compiler cannot see a component that declares its own `string` props.** `RenderBlocks` spreads a block loosely, so the lie stays inside the file and surfaces as a failed production build naming a *page*, or as React error #31 during hydration. Sweep for raw renders instead of trusting `tsc`. <sub>[why](docs/TRAPS.md#i32)</sub>
33. **A field a SHARED HELPER supplies is invisible to the orphan guard unless the guard reads the helper.** `declaredFieldNames` scans a block's own `config.ts`; anything arriving through `...sectionHeaderFields` is declared in `blockFields.ts` and was never in the set being checked. It resolves the bundles now (`HELPER_BUNDLES`, derived from the module so it cannot drift), guarded by the `A-bundle` case in `prove-guards.sh`. <sub>[why](docs/TRAPS.md#i33)</sub>
34. **A hover effect belongs only on something that can be clicked.** A pointer response is a promise; on a `<div>` with no link in, on or around it, the promise is broken by design. Audit with `tests/visual/findFalseHover.mjs`; the portal case is guarded by `frontend.e2e.spec.ts`. <sub>[why](docs/TRAPS.md#i34)</sub>
35. **A repair that filters or compares a CONVERTED field must go through `storedText`.** A `contains`/`like` query against a rich-text field is not a mismatch, it is a hard Postgres error — `operator does not exist: jsonb ~~* unknown`, raised at PLAN time whether or not any row matches. And `typeof x === 'string'`, `(x ?? '').includes(…)` or `.toLowerCase()` on one is a silent no-op or a `TypeError`. <sub>[why](docs/TRAPS.md#i35)</sub>
36. **Nothing in `tests/` runs the seed, so a green suite says nothing about it.** `grep -rln "seedVerify" tests/` returns nothing. Verify a seed change by seeding a **scratch database**, and take the before-reading — "0 remaining" is only evidence against a non-zero start. <sub>[why](docs/TRAPS.md#i36)</sub>
37. **A third-party widget script that initialises once per page load is incompatible with client-side navigation.** Assume it cannot be re-run, and design a visible fallback rather than reaching into its internals. Guarded by `tests/e2e/tryBooking.e2e.spec.ts`. <sub>[why](docs/TRAPS.md#i37)</sub>
38. **A cross-origin iframe that was REFUSED still exists as an element, with a height.** "An iframe appeared" is therefore not proof an embed worked; wait for a `postMessage` from its origin, which a frame that never loaded cannot send. <sub>[why](docs/TRAPS.md#i38)</sub>
39. **A generated identifier that exceeds Postgres's 63-character limit makes the schema never settle.** Drizzle names a foreign key `<table>_<column>_<reftable>_id_fk`; if that exceeds 63, Postgres truncates, Drizzle never finds the name it wants, and it drops and recreates the constraint on EVERY boot. **Budget the column name before adding a relationship to a block**: 63 − the `_pages_v_` table name − the referenced table − `_id_fk` − 2 separators. For a People Grid field that is **12 characters**. <sub>[why](docs/TRAPS.md#i39)</sub>
40. **A listing block with no filter set is not "showing everything" — it is showing whoever sorts first, under a heading that promises a selection.** A filter an editor never set looks identical to one that does not exist. Guarded by `tests/e2e/specialistCarousels.e2e.spec.ts`. <sub>[why](docs/TRAPS.md#i40)</sub>
41. **A block that returns `null` on an empty result deletes its whole band, silently — so any filter added to one MUST be paired with proof that something matches.** Assert a non-zero count first; a set comparison alone passes perfectly against an empty page. <sub>[why](docs/TRAPS.md#i41)</sub>
42. **A field destructured from props and then never used passes the orphan-field guard.** `readsField`'s destructuring alternative is satisfied by the destructure itself. Measured, not assumed. <sub>[why](docs/TRAPS.md#i42)</sub>
43. **An option that renders identically to "no option" is a dead control, even when its CSS rule is perfect.** A palette guard that checks each key *has* a rule cannot see this; the check has to be that the rule makes a **difference** on a real page. Guarded by `richTextRender.e2e.spec.ts`. <sub>[why](docs/TRAPS.md#i43)</sub>
44. **Payload's own JSX converters read `node.format` and ignore node state entirely.** Anything stored as Lexical NodeState — which serialises under `$` — renders only if *our* converter reads it (`nodeColorClass` in `src/components/RichText/shared.tsx`). <sub>[why](docs/TRAPS.md#i44)</sub>
45. **A guard aimed at a rule that declares nothing passes forever.** Before asserting that rule X beats rule Y, check that Y declares the property at all. <sub>[why](docs/TRAPS.md#i45)</sub>
46. **Never join or interpolate a copy value.** `.join(' ')` and `` `${x}` `` over rich text print `[object Object]` — no error, no warning, just the wrong words. Guarded by `tests/e2e/richTextRender.e2e.spec.ts`. <sub>[why](docs/TRAPS.md#i46)</sub>
47. **`InlineRichText` adds no wrapper unless you ask for one**, and a heading must render `as={Tag}` rather than wrapping its text in a span. <sub>[why](docs/TRAPS.md#i47)</sub>
48. **Booting Payload runs a dev schema push, so a deliberately-broken config is applied to the local database.** `pnpm test:e2e` boots it through `tests/helpers/seedUser.ts`; so does any `payload run` script. Repair with `src/migrations/REFERENCE-inline-richtext.sql` — or its companion `REFERENCE-processSteps-richtext.sql` for a **body** field, which splits on `\n{2,}` into paragraphs where the inline one keeps one paragraph and emits `linebreak` nodes. Both are idempotent for this reason. <sub>[why](docs/TRAPS.md#i48)</sub>
49. **A scratch table in the app's own database hangs the dev push.** Drizzle reads an unknown table as one to drop, and waits on the invisible "Accept warnings?" prompt. <sub>[why](docs/TRAPS.md#i49)</sub>
50. **Don't cache a value that is already stable.** For a `useSyncExternalStore` snapshot, prefer a naturally-stable computation over a module-level memo. <sub>[why](docs/TRAPS.md#i50)</sub>

51. **A field on a collection with `access.read: anyone` is public unless field-level `access.read` says otherwise.** Admin placement, a label and a description change nothing about what the API returns. Guarded by `tests/int/availabilityNotes.int.spec.ts`. <sub>[why](docs/TRAPS.md#i51)</sub>

52. **A block must never write `grid-template-columns` (or any responsive property) inline** — inline beats every media query, so the mobile rule silently never applies. Emit `--vf-cols` and let `globals.css` own the breakpoints. An inline *custom property* also beats a stylesheet one, so the mobile rule sets `grid-template-columns` directly rather than resetting the variable. Guarded by `tests/e2e/responsive.e2e.spec.ts`. <sub>[why](docs/TRAPS.md#i52)</sub>
53. **The header's collapse breakpoint is 1024px and is written in THREE places** — the nested `components` sub-layer, an extracted block, and the drawer block. Changing one leaves the other two and the change appears to do nothing. <sub>[why](docs/TRAPS.md#i53)</sub>

54. **`selfSpaced` membership is decided by MEASURING a block's own computed padding, not by reading its source.** A block's padding may come from a page-scoped rule or an editor-chosen `cssClass`, so removing its `.my-16` wrapper can strip spacing on another page. And `grep '<Section'` matches `<SectionHeader` and comments. <sub>[why](docs/TRAPS.md#i54)</sub>
55. **Colour a Phosphor icon through `color` on its container, never `stroke`.** They are duotone and filled; a `stroke` rule applies and paints nothing. Use the same token as the adjacent text so the two cannot drift. <sub>[why](docs/TRAPS.md#i55)</sub>

56. **A layout that divides a band by a fixed share must say what ONE child means.** `flex: 0 1 50%` on a chooser with a single panel is not half a design, it is half a band and half a void — measured 720px of 1440, and 379px of a 520px band on a phone. Decide the count BEFORE the markup (a child filtered out inside the `.map` is invisible to the container's class), and prefer `flex-grow` to `flex-basis: 100%`: it absorbs the free space a hover rule frees up, so the slide stops without a specificity fight, and it is not a *height* when the row turns column. Guarded by `frontend.e2e.spec.ts`. <sub>[why](docs/TRAPS.md#i56)</sub>
57. **A Payload `select` is a Postgres ENUM, so a field whose values an editor can CREATE must be `text`.** An enum can only hold labels that existed when the schema was built, so an uploaded icon (`upload:12`) can never go in one. Converting later is destructive — 112 enum types had to be dropped — and Payload's dev push then stops on an invisible prompt with every request queued behind it. Decide `text` at the point the field is *designed*, not after. Guarded by `iconLibrary.int.spec.ts`. <sub>[why](docs/TRAPS.md#i57)</sub>
58. **A field declared by more than one helper must be changed in ALL of them — grep the field NAME, never the helper.** `icon` is declared in `blockFields.ts` (65 columns) *and* `link.ts` (45). Converting one and not the other left the config and the database permanently disagreeing, so the schema push rebuilt the same enums on every boot and no amount of `rm -rf .next` cleared it. <sub>[why](docs/TRAPS.md#i58)</sub>
59. **An icon an editor uploads is an empty `<svg>`, painted by `mask-image`, never a `<span>` and never an `<img>`.** `globals.css` sizes and colours icons through **69** rules that select `svg` (re-measured 2026-08-26; `grep -cE "^[^{}]*svg[^{}]*\{" 'src/app/(frontend)/globals.css'` counts 71 including two inside comments); a `<span>` matches none of them, so an upload renders at the wrong size in the wrong colour everywhere. An `<img>` cannot take the band's colour at all. Guarded by `uploadedIcons.e2e.spec.ts`. <sub>[why](docs/TRAPS.md#i59)</sub>

## Commands

```bash
pnpm dev                  # http://localhost:3000 (admin at /admin), binds 0.0.0.0
./start.sh / ./stop.sh    # same server backgrounded → .dev.log / .dev.pid (LAN-shareable)
pnpm dev:prod             # clean build + start — needs LOCAL_PROD_REPRO=1 in .env (see Local development)
pnpm build                # ./stop.sh FIRST — build and dev share .next (see Verifying a change)
                          #   chains a postbuild step: next-sitemap (see Routing)
pnpm start                # next start against an existing .next; what dev:prod chains into
pnpm lint                 # eslint (pnpm lint:fix to autofix)
pnpm test                 # lint → int → e2e, in that order; stops at the first failure
pnpm test:int             # vitest, tests/int/**/*.int.spec.ts
pnpm test:e2e             # playwright, tests/e2e/ — starts/reuses a dev server on :3000
pnpm generate:types       # → src/payload-types.ts   (after ANY collection/global/block field change)
pnpm generate:importmap   # → src/app/(payload)/admin/importMap.js (after adding a custom admin component)

pnpm payload run scripts/inventory.ts   # → photo-inventory.csv + content-inventory.csv (review docs)
```

`scripts/inventory.ts` enumerates every image slot on the site and every page/article/event. Both
CSVs are gitignored working documents and go stale as soon as content changes — a deleted-and-
reseeded document returns with a **new id**, so `admin_url` starts pointing at a record that no
longer exists. Re-run it rather than editing a stale copy.

Single test: `pnpm test:int tests/int/api.int.spec.ts -t "name"` ·
`pnpm test:e2e tests/e2e/frontend.e2e.spec.ts -g "name"`.

`.claude/skills/payload/` is an in-repo skill (collections, fields, hooks, access control, queries,
adapters). Reach for it before guessing at a Payload API.

### What each suite guards

Six of these were never named anywhere in this file, so the invariants they cover read as unguarded
and the specs read as deletable. Counts are deliberately **not** recorded here — they live in
`README.md`, each beside the command that measures it — because four documents once carried four
disagreeing numbers for the same suite.

| File | What it guards |
|---|---|
| `tests/int/adminControls.int.spec.ts` | The control guards: orphan fields, option values with no CSS rule, the class picker, hardcoded brand assets, placeholders with no upload, `cacheLife` on a tag purge, discarded `appearance`, unguarded draft queries. Proved by `zsh tests/int/prove-guards.sh`; every case must report PASS (`README.md` § 8 has the count and how to take it). |
| `tests/int/seedAuthored.int.spec.ts` | `isUnauthored`/`isPlaceholderLayout`, and that every `authorPage` copy uses them rather than counting blocks. Also asserts how many files define `authorPage`, which is the number to trust. |
| `tests/int/cssTokens.int.spec.ts` | `buildTokenCss`/`safeTokenValue` sanitisation — editor-supplied values land inside a `<style>` tag. |
| `tests/int/eventTiming.int.spec.ts` | `isPast` at start-of-day, `registrationOpen` and its fallback, and that the two are allowed to disagree. The unit half of **Event timing** below. |
| `tests/int/headingId.int.spec.ts` | `headingId`/`slugify` — stable slugs, `[[accent]]` stripping, collision disambiguation. The unit half of the anchor-id invariant. |
| `tests/int/iconLibrary.int.spec.ts` | Where an icon can be chosen (a config walk, so a block nested four deep is covered), that `iconUsage` FINDS things rather than merely says no, and — the load-bearing one — that **no icon field is a `select`**, which is the 10-minute hang reduced to a test. |
| `tests/int/iconValue.int.spec.ts` | `parseIconValue`/`formatIconValue` — the one place an icon field's stored value is interpreted. Its important case is the silent direction: an unknown `@suffix` must NOT be cut off the key. |
| `tests/int/svgIcon.int.spec.ts` | `normaliseSvgIcon` — what survives an upload and what does not. Payload 3.85 also refuses hostile SVGs at the upload layer, so this is defence in depth, not the only defence. |
| `tests/e2e/uploadedIcons.e2e.spec.ts` | An uploaded icon is painted the same colour a built-in one is on the same band, measured rather than written down; a placement colour beats the icon's own default; a **library** icon outside the bundled 101 renders identically to one inside it; and the upload screen previews the **stored** markup rather than the file. Seeds its own user via `globalSetup` and restores everything in `finally`. |
| `tests/int/qualificationIcon.int.spec.ts` | Re-derives every qualification→icon pair from the design reference and asserts `qualificationIcon()` reproduces it, returns only icons in `iconMap`, and falls back. |
| `tests/int/api.int.spec.ts` | **One boot smoke test** (`fetches users`). The name promises a suite; it is not one. |
| `tests/int/productionEnv.int.spec.ts` | The boot gate: which environment variables are required while serving, that `next build` waives them all, and that `ALLOW_MISSING_SMTP` waives `SMTP_HOST` **and nothing else**. The negative assertion is the point — a test of only the happy branch cannot tell a targeted opt-out from a waiver of everything. |
| `tests/e2e/frontend.e2e.spec.ts` | The largest e2e file: skip link (both states), centred-heading wrap, hero weight, testimonial hover, and that a one-panel Booking Chooser fills its band without sliding. Most of the browser traps below are its assertions. |
| `tests/e2e/links.e2e.spec.ts` | Every `#fragment` link has a target, plus the behavioural Videolink assertion — the "an anchor link is two halves" invariant. |
| `tests/e2e/images.e2e.spec.ts` | Images are served at the size they render, per route. **The guard for the four image invariants below** (`sizes`, width-only derivatives, the no-derivative majority case, `object-fit` without `fill`). |
| `tests/int/proseFields.int.spec.ts` | Every field an editor types words into is rich text, or is named with a reason. Walks the sanitised config, so it sees fields nested in arrays, groups, tabs and rows. |
| `tests/int/richTextColors.int.spec.ts` | The brand text-colour palette and its CSS agree — every key has a rule, every rule resolves through the token it claims, every token is in `:root` — **and** the toolbar swatches offer exactly that palette, previewing each colour as the literal the admin can resolve. It constructs `TextStateFeature` and reads its props back, so a Payload API change fails here rather than on a page. |
| `tests/int/lexicalText.int.spec.ts` | `richTextToPlain` / `hasRichText` — reading a copy value's words whether it holds a string or a tree. |
| `tests/int/inlineRichText.int.spec.tsx` | `InlineRichText` renders no `<p>`, no wrapper `<div>`, a `<br>` between paragraphs, and no element at all when none was asked for — plus the toolbar colour: a text node carrying `$: {color}` emits `.vf-tc-* .vf-tc--inline`, one without emits no span, and a retired key emits nothing. |
| `tests/int/seedWrites.int.spec.ts` | No seed file calls `payload.create`/`update` directly, bypassing the rich-text lift. |
| `tests/e2e/richTextRender.e2e.spec.ts` | No route renders `[object Object]` or throws while hydrating, **and** an editor's colour beats the page-scoped rule it has to beat — the browser half of the `!important` on `.vf-tc-*`, which no file check can see. |
| `tests/e2e/carousel.e2e.spec.ts` | `SlideCarousel` bounds: rapid next/prev, arrow keys, dot recovery, autoplay wrap. **The guard for the carousel invariant below** — and note it clicks with `{ force: true }`, without which the burst is not rapid. |
| `tests/e2e/specialistCarousels.e2e.spec.ts` | The three specialist carousels show a real selection, not whoever sorts first: the homepage equals the Featured set, /jme equals the JME-tagged set **as queried from the API** (so it stays true when an editor tags someone new), and Make a Booking equals the advertised set. Every case asserts a **non-zero count before** the membership — see the `return null` invariant. |
| `tests/e2e/tryBooking.e2e.spec.ts` | The TryBooking block never leaves a visitor looking at an empty box: the fallback link is present, correct and **visible** when the embed cannot load, the failed embed occupies **zero height**, and the link is in the server HTML with `javaScriptEnabled: false`. Note it asserts the *degraded* state deliberately — the embed is refused over http, so the success path is not testable on the dev server and was confirmed by hand over https. |
| `tests/e2e/responsive.e2e.spec.ts` | The only suite that loads a page at a phone or tablet width — Playwright's single project is Desktop Chrome, which is why four responsive faults shipped green. Covers: no sideways scroll at 390/768/1024/1440, card grids single-column on a phone, the carousel framing photos identically at every width, the drawer opening grouped rather than flattened, and the desktop nav being keyboard-reachable. Every case records the deliberate break that proves it red. |
| `tests/e2e/admin.e2e.spec.ts` | The admin loads and the Pages create form renders. Seeds its own user, and deletes the autosave draft it creates. |
| `tests/helpers/` | `seedUser.ts` (deletes and recreates `dev@payloadcms.com`) and `login.ts`. |

**Changing a field's type (`text` → `richText`) is done by hand, in three steps**, because
the dev push stops on a prompt you cannot see:

1. Boot the app against an empty scratch database — everything is `CREATE TABLE`, so no
   prompt — and dump its catalog. That database *is* the shape the config wants, including
   every `_v` version shadow and every block nested in Tabs/Section/Row.
2. Load that catalog into `verify_cms` as `shape_cols`, run
   `src/migrations/REFERENCE-inline-richtext.sql` (it generates the `ALTER … USING` from
   the join rather than being typed), then **drop `shape_cols`** — an unknown table hangs
   the next push.
3. Diff the two catalogs and expect zero rows.

There is no typecheck script — use `pnpm exec tsc --noEmit`. ESLint ignores `src/payload-types.ts`.
Imports resolve through `@/*` → `src/*` and `@payload-config` → `src/payload.config.ts`.

`tests/e2e/admin.e2e.spec.ts` seeds its own admin user via `tests/helpers/seedUser.ts`, which
**deletes and recreates `dev@payloadcms.com`** in whatever DB `.env` points at — fine locally,
never against production. Playwright's `webServer` reuses an already-running `:3000`.

`README.md` has been rewritten as this project's handover readme (running it locally, deploying,
where the editor's manual lives). It is no longer the Payload template's.

## Local development

Fully isolated from production — it never touches the live database.

- **Database:** PostgreSQL 15+ on `127.0.0.1:5432`, dedicated DB `verify_cms`, owned by the
  developer's own login. It is a throwaway — it is rebuilt from `migrate` + seed rather than
  backed up, and nothing in it is shared with production.
  - The original development machine was a Mac with Homebrew `postgresql@15`, where `psql` and
    `createdb` are not on `PATH` by default and live under `/opt/homebrew/opt/postgresql@15/bin/`.
    On Linux they are on `PATH`. If a `psql` command in these docs is "not found", that is why.
  - **Only ever point `DATABASE_URL` at a database this project owns.** The dev schema push
    reshapes whatever it is given to match the config, so a shared Postgres instance can hold
    unrelated databases safely — but naming one of them here would rewrite it.
- **Env:** `.env` (gitignored, local-only) sets `DATABASE_URL` to `verify_cms` with a fresh
  local `PAYLOAD_SECRET`. `.env.example` documents every variable and marks the three the
  server refuses to boot without (`SMTP_HOST`, `NEXT_PUBLIC_SERVER_URL`, `PREVIEW_SECRET`) —
  each degrades *invisibly* rather than loudly when missing.
  - The check lives in **`src/instrumentation.ts`**, which Next runs once before the first
    request, and it `process.exit(1)`s. It is not in `payload.config.ts` alone, because that
    module loads lazily: measured, `next start` with `SMTP_HOST` unset served the prerendered
    homepage with a **200** and only 500'd on `/admin` and `/api/*`. A half-alive server passes
    a deploy smoke-test that hits `/`.
  - It gates on *serving*, not on `NODE_ENV`. `next build` also sets `NODE_ENV=production`, and
    requiring mail credentials to build an artifact just broke `pnpm build`; the build is
    skipped via `NEXT_PHASE === 'phase-production-build'`.
  - `pnpm dev:prod` runs `next start`, which *is* serving, so it needs **`LOCAL_PROD_REPRO=1`**
    in your local `.env`. That prints a boxed banner on every boot and disables nothing else.
    **Never set it on the box.**
  - **`ALLOW_MISSING_SMTP=1` is the server-side equivalent, and waives `SMTP_HOST` and nothing
    else** — `NEXT_PUBLIC_SERVER_URL` and `PREVIEW_SECRET` stay required, so a genuinely
    misconfigured deploy still refuses to start. It exists because the staging box runs before mail
    credentials do. Guarded by `tests/int/productionEnv.int.spec.ts`, whose load-bearing assertion is
    the *negative* one: that the flag is not a blanket waiver. Proven red both ways — waiver deleted,
    and waiver widened to all three.
    **It must be removed before the site takes real enquiries.** While set, submissions are still
    stored but nobody is emailed, and admin password resets silently fail — surfaced by a boot banner
    and, more usefully, a red banner on the admin dashboard (`BeforeDashboard`), which keys on
    `SMTP_HOST` rather than on the flag so it is equally true on a dev machine.
  - `SMTP_HOST` is unset locally. Payload's built-in fallback is a console adapter that logs at
    *info* and resolves successfully — indistinguishable from a real send — so it is replaced by
    `src/email/emailNotSentAdapter.ts`, which logs `[EMAIL NOT SENT] to=… subject=…` at **error**
    level. The action that triggered the email still completes; only the notification is dropped.
- **Schema:** the Postgres adapter pushes schema in dev (non-production default), so the local
  DB auto-syncs on boot — **no local migrations**. `src/migrations/` holds a single baseline;
  migrations are authored/run on the server for production only.
- Local admin (throwaway): `admin@local.test` / `password`.
- Seed scaffold content (non-destructive, idempotent) while logged in:
  `POST /next/seed-verify` → `src/endpoints/seedVerify.ts`. It creates the nested page tree by
  slug and fills the globals. The template's destructive `/next/seed` route has been removed;
  everything under `src/endpoints/seed/` is now a module of the VERIFY seed (`seedHomepage`,
  `seedServices`, `seedDataLayer`, …) plus its `data/` fixtures.

## Deploy workflow

Production builds and migrates on **the production host** — a Linux server the site's owner
controls. Loop: edit code locally → commit & push → the host pulls, builds, and migrates against
the **live** database. Nothing about the code assumes a particular host; the local `.env` and
`verify_cms` database stay on the development machine and are never pushed.

After a `CollectionConfig`/`GlobalConfig` field change, the server sequence is:
`pnpm payload generate:types` → `pnpm payload migrate:create <name>` → `pnpm payload migrate` →
`pnpm build`. Multiple config changes in one push can share a single `migrate:create`.

## Architecture

### Routing

`src/app/(frontend)/` is the site, `src/app/(payload)/` is the admin + REST/GraphQL API.

- `/` and `/[...slug]` → **Pages**, via the nested-docs plugin. A page's real URL is the chain of
  its ancestors' slugs, stored on the last breadcrumb's `url`. `queryPageByPath` looks up by
  *leaf* slug, then disambiguates same-slug pages by matching the full breadcrumb path. Anything
  unmatched falls through to `PayloadRedirects`.
- Dedicated collection routes: `/posts/*`, `/in-the-loop/[stream]/[slug]` (Posts, grouped by the
  `streams` taxonomy), `/specialists/profiles/[slug]`, `/about/team/[slug]`,
  `/events/event/[slug]`, `/search`, plus five sitemap routes under `(sitemaps)/`. Specialist
  profiles deliberately sit one level down (`/specialists/profiles/`) so a dynamic segment at
  `/specialists/[slug]` doesn't outrank the `[...slug]` catch-all and swallow the CMS pages
  nested under `/specialists`.
- **`src/utilities/routes.ts` is the single source of truth for document URLs** (`docPath`,
  `postPath`, `specialistPath`, `teamPath`, `eventPath`, …). Link components, blocks,
  revalidation hooks, sitemaps, redirects and search sync all import from it — never
  interpolate a document path inline; historically hand-built paths disagreed with real routes
  and revalidated URLs nobody visits. Note `postPath` returns `null` for a post with no
  stream (render it unlinked; the old `/in-the-loop/<slug>` fallback 404'd).
- Draft preview goes through `/next/preview` + `/next/exit-preview`; each collection builds its
  preview URL with `generatePreviewPath`.
- **Sitemaps come from two systems and only one of them is in git.** The five routes under
  `(sitemaps)/` are ours, rendered from Payload at request time. On top of that, `pnpm build` runs
  a `postbuild` hook (`next-sitemap.config.cjs`) that writes `public/robots.txt` and
  `public/sitemap*.xml` — both **gitignored**, so they exist only on a machine that has built.
  That config excludes `/*`, so the generated index adds no URLs of its own; its whole job is to
  point at the five routes above and to disallow `/admin/*`. **Its `siteUrl` falls back to
  `https://example.com`**, and `next build` waives every environment check
  (`missingProductionEnv()` returns `[]` under `phase-production-build`), so a build with
  `NEXT_PUBLIC_SERVER_URL` unset succeeds and bakes `example.com` into both files with no warning.
- Two unrelated redirect systems share the word. `redirects.ts` at the repo root is a Next config
  redirect (Trident user-agents → `/ie-incompatible.html`) and is not editable; `PayloadRedirects`
  is the plugin-backed collection an editor manages from the admin.

### Block system (the page builder)

Every block is a folder in `src/blocks/<Name>/` with `config.ts` (Payload `Block`, with
`interfaceName` so it gets a named generated type) and `Component.tsx`. Adding one means touching
several files:

1. `src/blocks/<Name>/config.ts` + `Component.tsx`.
2. `src/blocks/RenderBlocks.tsx` → add to `blockComponents`; add to `selfSpaced` if the component
   wraps itself in `<Section>` (otherwise it gets the legacy `my-16` wrapper at top level).
3. `src/collections/Pages/index.ts` → add to the `layout` blocks array to make it selectable.
4. Optional: `src/blocks/nestable.ts` (`NESTABLE_RICH_BLOCKS`) to allow it inside Section/Row, and
   `src/blocks/tabContent.ts` for inside Tabs. `tabContent.ts` deliberately re-lists its blocks
   instead of importing `nestable.ts` — importing would create a `Tabs ← nestable ← Tabs` cycle
   that evaluates to `undefined`.
5. `pnpm generate:types`.

`RenderBlocks` is **recursive** with two contexts. At `top` it applies the spacing wrapper; at
`nested` (used by the Section and Row components for their children) it passes `bare` so rich
blocks inherit the parent's background and container width instead of re-banding. Nesting depth is
bounded to `Section > Row > block`.

**Layout primitives:** `Section` (banding, container width, padding, motion) and `Row`
(responsive column grid) are the low-code container blocks; `Heading`/`Text`/`Button`/`Image`/
`Spacer`/`Divider`/`IconBlock` are nestable-only atoms. Editors compose new layouts from these
rather than getting a new bespoke block per design — build capability, don't hardcode a design.

**Porting a reference design: prefer a block *variant* over a page-scoped class.** When a reference
page styles a section differently, the tempting fix is a rule scoped to that page (`.svc-learn-rows`,
`.ime-formats`, `.jme-process`, `.as-how` all do this, and are staying). The better fix is a field on
the block that emits a modifier class — `FeatureGrid.cardStyle: banded`, `ProcessSteps.numberStyle`,
`SplitFeature.rowStyle`/`density`/`bulletStyle` — because the look then becomes available to every
instance instead of one URL. **Default every new variant to what already renders**, so adding it
moves nothing, and prove that with `computedSnapshot.mjs` rather than asserting it.

Page-scope only what is genuinely a per-page *literal* rather than a design choice: a gradient angle
one reference page tilts differently, a palette value. Say which it is in the comment. And a variant
must never make an existing field dead — when `bulletStyle: dot` replaces the tick, it replaces only
the *default* tick, because a bullet the editor gave an icon still has to keep it.

**Copy fields are rich text.** `inlineRichTextField(name, overrides)` is the one-line
form (headings, card titles, button labels — compact editor, no headings or lists) and
`richBodyField` the multi-paragraph one. Render both through
`src/components/RichText/Inline.tsx`, never by interpolating the value.

**Colour has two controls over one palette** (`BRAND_TEXT_COLORS`, `src/fields/richTextColors.ts`),
both emitting `.vf-tc-*` and both storing a *key* so Site Settings repaints every coloured word:

- `textColorField` gives a block a `textColour` select covering a whole heading and subheading. A
  block that spreads `sectionHeaderFields` **must forward it** — `<SectionHeader colour={textColour}>`,
  or `colour=` on each `InlineRichText` if it renders its own header. It is not compile-forced;
  `adminControls.int.spec.ts` is what proves it, and the field shipped read by nothing until that
  guard learned to see bundle-supplied fields.
- `brandTextColorFeature()` (`src/fields/richTextColorFeature.ts`) puts the same palette in every
  rich-text toolbar, registered once on `defaultLexical` so all ten field-level editors inherit it.
  It writes Lexical NodeState (`$`), which **only our converter renders** — see the Invariants table.
  Separate file from the palette because it imports the server export, and `colorClass` is client code.

Inside a coloured element a `[[bracketed]]` phrase keeps the brand accent; inside a *toolbar* pick it
does not, because that pick is `.vf-tc--inline` and an explicit selection outranks a bracket. Both
`.vf-tc-* .vf-accent` lists must name every key — a key missing from the **on-dark** one renders its
bracket at `var(--primary)` on `--band-dark`, measured at **2.12:1**. Guarded, along with everything
else here, by `tests/int/richTextColors.int.spec.ts`.

**The palette is a code-time list, and cannot be made editor-extensible.** Asked for; checked before
answering. `TextStateFeature`'s `state.color` is resolved once inside `sanitizeConfig` and memoised
for the process lifetime, `initLexicalFeatures` copies it verbatim per request, and `toolbarGroups`
has no per-item predicate — there is no point at which a database read could reach the toolbar.
Pre-declared empty slots do not rescue it: an unfilled slot still renders as a pickable swatch whose
`var()` resolves to nothing, which is invariant 2's exact failure and cannot be hidden. What an
editor *can* change is every colour's value, in Site Settings. **Retiring a key is destructive** —
`parse` maps an unknown value to `undefined` and lexical's `toJSON` then deletes it, so a colour
removed from the list is stripped out of stored documents on the next admin save. Adding is free.

**Three of the sixteen are fixed inks** (`black`/`charcoal`/`grey`, tokens `--ink-*`), carrying no
on-dark re-point on purpose: staff asked for ink that stays the colour it says. They are deliberately
NOT the `--text-*-base` tokens, which are semantic and flip — sharing them would mean repainting body
copy also repainted every word coloured Charcoal.

Shared field helpers live in `src/fields/blockFields.ts` (`backgroundField`, `containerWidthField`,
`spacingFields`, `motionField`, `sectionHeaderFields`, `anchorIdField`, `iconField`,
`cssClassField`, …). Use them so blocks stay consistent and every rendered detail is admin-editable.
Section headings support `[[bracketed]]` text for brand-accent highlighting (`accentText.tsx`).

### Hero system

Parallel to the block builder and easy to miss. Pages carry a single `hero` group field defined
in `src/heros/config.ts`; a `type` select drives conditional field visibility through the local
`isType(...)` helper, and `src/heros/RenderHero.tsx` maps `type` → component via a `heroes`
record (`none` and unknown types render `null`). Five types: `pageHero` (default, interior
pages), `homeHero` (definition panel), plus the template's `highImpact`/`mediumImpact`/
`lowImpact`. Adding one means touching both files.

Heros reuse the same `blockFields.ts` helpers as blocks. Their spacing fields default to a
`'default'` sentinel that emits **no** class: the home hero's own 80px padding is not one of the
`--space-*` presets (`normal` is ~88px), so defaulting to a preset would silently reshape the
hero. Leave that sentinel in place.

### Styling and design tokens

**`globals.css` lives inside `@layer verify` and must stay there.** Everything from just after
`@theme inline` to the end of the file is wrapped. That wrapper is the only reason the Custom Styles
global works: an editor's CSS is injected unlayered, and unlayered beats layered at *any*
specificity. Without it a preset is a single class competing with page-scoped ports at (0,2,0) and
(0,3,0), so it wins on ordinary pages and silently loses on every page with a bespoke design — which
is exactly how it shipped. Do not unwrap it, and do not add rules after its closing brace. The
at-rules above it (`@import`, `@config`, `@theme`, `@utility`, `@custom-variant`, `@plugin`,
`@source`) cannot live in a layer, and the `:root` token block is left out deliberately so an
editor's own `:root {}` still ties it and wins on source order.

Three layers, in override order:

1. `src/app/(frontend)/globals.css` `:root` — default values for `--space-*`, `--gap-*`,
   `--size-heading-*`, `--band-*`, `--vf-radius-*`, and the `.vf-*--<preset>` modifier classes
   that consume them.
2. **Design System global** (`src/DesignSystem/config.ts`) — editors set the *values* behind each
   preset; `designTokenStyle()` turns them into inline CSS custom properties on `<html>`, so one
   token edit re-themes every block using that preset. **Site Settings** feeds brand colours the
   same way via `brandColorStyle()`, plus logo/favicon/social image.
3. **Custom Styles global** (`src/Styles/config.ts`) — arbitrary global CSS plus named class
   presets; the `CssClassSelect` field component (`src/fields/CssClassSelect`) offers those presets
   as a strict picker on `cssClass` fields, and `toClassName()` normalises the value.

Block fields therefore store *preset slugs*, never raw CSS values. Icons come from a fixed Phosphor
registry in `src/components/Icon` (`iconMap` → `iconOptions`, consumed by `iconField`); add an icon
there and it becomes selectable everywhere. The brand typeface (MuseoSansRounded) is loaded locally
in `(frontend)/layout.tsx`.

Both `designTokenStyle()` and `brandColorStyle()` are built by `src/utilities/cssTokens.ts`
(`buildTokenCss`, `safeTokenValue`, `stripStyleClose`, `UNSAFE_TOKEN_VALUE`). Editor-supplied
values land inside a `<style>` tag, so sanitisation happens there — keep
`tests/int/cssTokens.int.spec.ts` green when touching token plumbing.

### CSS token tooling

`tests/visual/` holds six Node scripts that `pnpm test` does **not** run — five bullets below,
because the two codemods share one (`ls tests/visual/*.mjs | wc -l`):

- `node tests/visual/computedSnapshot.mjs capture|compare baseline` — computed-style snapshot
  gate against a running `:3000`, keyed by structural index path rather than class name (class
  names are what the migrations change). Token replacements are value-preserving by
  construction, so the expected diff is empty. **A non-empty diff is not by itself evidence,
  though** — measured 2026-08-24, comparing the same unchanged code against itself four times gave
  2, 3, 0, 0 changed nodes, always `marginLeft`/`marginRight` on a `SECTION > DIV` on `/about` and on
  a team profile (an `auto` centring margin resolving before the parent's width settles). Re-run a
  diff two or three times and check which property *indices* moved: 30/31 on those routes is the
  known flake; index 0 (`color`) or any other node is real. `README.md` §10.28 has the measurement.
  It measures **39** properties over **21** routes — `width`/`height`/`gridTemplateColumns`/
  `transform` are in that set, which is what makes it catch a reflow and not just a repaint, but
  that is still a subset of the **28** URLs in the pages sitemap, and it never triggers `:hover`.
  All three re-counted 2026-08-24 (`curl -s localhost:3000/pages-sitemap.xml | grep -c '<loc>'`,
  and the `ROUTES`/`PROPS` arrays themselves). They have drifted three times — to "40 over 18"
  here, "18 of 28" in the harness's own comment, and 27 for the sitemap — so **re-count rather
  than quoting these**. Capture immediately before a change and compare immediately after;
  baselines are gitignored because any content change invalidates them. `capture` refuses a non-200 — it used to bank the 404 page as a
  baseline for two routes that do not exist.
- `node tests/visual/tokenise.mjs <4a|4b|4c|4d> [--dry]` and
  `node tests/visual/tokeniseShape.mjs <radius|gradient> [--dry]` — one-shot codemods over
  `globals.css` (colour literals → `var()`/`color-mix()`, radius/gradient literals → tokens).
  Their carve-outs are deliberate and documented in the file headers.
- `node tests/visual/referenceCssDiff.mjs <family> [--verbose]` — diffs every CSS declaration the
  design reference makes for a selector family against `globals.css`, and exits non-zero until the
  count is zero. **Thirteen families**: `events`, `services`, `ime`, `jme`, `admin-services`,
  `reporting-services`, `specialist-profile`, `for-clients`, `faq-claimants`, `faq-clients`,
  `ime-claims`, `jme-faq`, `join-expert-panel`; all read zero, so any non-zero is something you just did. Resolves each side's
  `:root` **separately** (both define `--radius`, and they disagree — 8px there, 0.5rem here),
  compares font tokens by *name* because the brand typeface is a deliberate deviation, and merges
  base+override rules where we implement a bespoke reference selector through a shared component.
  Three lists are deliberate exceptions and must stay honest: `NOT_PORTED` (with a reason each),
  `IMPLEMENTED_AS`, and `EXPLAINED` (per-declaration, for differences that cannot close — an
  editor-controlled spacing preset against the reference's literal, `stroke` on a filled Phosphor
  icon). **A zero is necessary, not sufficient** — it proves a rule is in the file, not that it
  reached the page. Always confirm with `getComputedStyle`.

  Two failure modes of the tool itself, both seen: **a mapping that lists only the closest-looking
  selector under-reports**, because our scoped rules split across a wrapper and its children while the
  reference declares everything on one element — that produced a phantom `line-height` difference the
  browser disagreed with, and the fix is the list form of `IMPLEMENTED_AS`, not a CSS edit. And **an
  exception entry ages**: `NOT_PORTED`/`EXPLAINED` reasons that cite a past measurement need the
  measurement re-run, not re-read. A skip justified by "verified equal in the browser" was once false
  and hid 11 real spacing gaps.
- `node tests/visual/findFalseHover.mjs [--verbose]` — finds hover effects on elements nothing can
  click. Parses every `:hover` rule in `globals.css` **from disk** (never `document.styleSheets`,
  which throws cross-sheet and reports zero for everything), takes the compound that actually bears
  the pseudo-class — `.card:hover .title` → `.card` — and reports matches that are not interactive,
  contain nothing interactive and sit inside nothing interactive. Rules that *neutralise* a hover
  (`.vf-hover-none .vf-card:hover { transform: none }`, the editor's "no hover effect" option) are
  skipped, or the tool would tell you to delete the fix. Routes come from the sitemaps, not a
  hand-written list. **Candidates, not a verdict** — a row highlighted for readability is legitimate.
  Baseline 2026-08-23: 15 before the portal-tile fix, **14** after.
- `node tests/visual/findDeadCss.mjs` — emits **candidates, not a verdict**. It has already
  produced false positives that would each have broken a live page; read the header's caveats
  before deleting any selector.

### Icons

Three tiers, one **string** column. `iconField` (`src/fields/blockFields.ts`) and the link icon
(`src/fields/link.ts`) are both `text` with the `IconSelect` picker — **not** `select`, because a
select is a Postgres enum and an enum cannot hold a value an editor creates. See invariants 57-59.

| Stored | Renders |
|---|---|
| `brain` | one of the **101** Phosphor components bundled in `src/components/Icon`, as a real component |
| `acorn` | any of the other ~1,400, as an `<svg>` masked from `/api/icon/phosphor/<name>` |
| `upload:12` | an SVG in the **Icons** collection, in that icon's own default colour |
| `brain@deep`, `upload:12@white` | either, forced to a brand palette colour |

**Icons are managed in ONE place: the `icon-library` global.** It renders every icon at once — all
1,513 Phosphor ships plus every upload — each with a tick box, no search required to see them, with
uploading, renaming, recolouring and deleting on the tile. It was briefly two screens plus a
search-gated grid, which is what a user is looking at when they ask why there are two icon libraries.

`Icons` is `admin.hidden` so there is nothing else in the sidebar to find. **That 404s the
collection's routes outright, not just its nav entry** (measured), which is why the edit controls and
the light/dark preview are on the tile rather than behind a link.

The ticks show the **effective** list, not the stored one: an empty global still offers the bundled
101, so the screen ticks those and the first change writes the whole set out explicitly.
`effectiveIconList` (`src/utilities/getIconLibrary.ts`) is the backstop. Unticking an icon stops it
being *offered* and never touches a page that uses it — `IconSelect` still shows a value the current
document holds, under *"Used here, not in the library"*.

**Ten `iconMap` keys are ALIASES** — `activity` is Pulse, `mail` is Envelope, `search` is
MagnifyingGlass — so they are absent from Phosphor's export list. `/api/icon/phosphor/[name]` checks
`iconMap` first for exactly this reason; reading the barrel alone 404s all ten, blanking them in the
picker while they still render on pages.

The barrel import in `/api/icon/phosphor/[name]` is the price of serving all 1,513. **Measured: the
compile step went 5.4s → 6.4s.** It is a route handler, so nothing reaches a browser as JavaScript.

`src/components/Icon/value.ts` is the **only** place that shape is interpreted. The colour rides in
the value rather than in a second column because `iconField` has 38 call sites and 84 `<Icon>` render
sites (re-measured 2026-08-26): a separate field would be 110 new columns and 122 edits, and one forgotten render site is a
control that silently does nothing — the `textColour` failure in invariant 33.

**A two-COLOUR upload becomes a two-TONE one.** Phosphor duotone is a solid path plus one at
`opacity="0.2"`, and a mask reproduces that exactly — but a mask discards colour, so a navy shield
with a pink tick would otherwise arrive flat beside icons that are all duotone. `normaliseSvgIcon`
ranks the distinct fills by luminance, keeps the darkest solid and gives the rest 20%. Artwork that
already carries `opacity` is left alone, because the artist has said what they meant in the units
that survive.

**The admin previews the STORED markup, never the uploaded file.** Payload shows the bytes that were
uploaded; the site renders what was rebuilt from them. On a two-colour test file those were
navy-and-pink against one flat shape — so the library tile, and the light/dark swatches behind its
Edit control, draw it the way a page will.

**Nothing an editor uploads is ever served back.** `normaliseSvgIcon` (`src/utilities/svgIcon.ts`)
keeps recognised geometry and **reconstructs** the SVG, so the output is markup this codebase wrote;
anything unrecognised is absent by construction rather than by having been matched and removed.
Colours are dropped deliberately — an upload is painted by the site through `mask-image`.

Four routes serve the artwork: `/api/icon/library` (what a picker should offer — an editable list,
so the client picker cannot import it), `/api/icon/phosphor` (all 1,513 names, for the library's
browse screen), `/api/icon/phosphor/[name]` and `/api/icon/upload/[id]`.

Each uploaded icon carries a **default colour**, published once per page by the layout as
`[data-vf-icon="12"]{color:…}` (`iconDefaultCss`, from `getCachedIconDefaults`), so changing it
repaints every placement. Its on-dark re-point is derived from the same `BRAND_TEXT_COLORS` entry
`.vf-tc-*` uses; `ON_DARK_SELECTORS` is the single list, tied to `globals.css` by
`richTextColors.int.spec.ts`.

Deleting an uploaded icon that is in use is **refused**, naming the documents. `iconUsage`
(`src/utilities/iconUsage.ts`) decides which collections to scan by walking the sanitised config,
then searches their documents rather than querying 250 derived paths, because a seven-level nested
block path in a `where` is something Payload could not be confirmed to resolve — and a query that
silently matches nothing would let the deletion through.

### Content model

`payload.config.ts` registers taxonomy lookups before the content that references them. The
specialist data layer is a 4-axis taxonomy — `specialties` (+ `specialty-categories`),
`claim-types`, `assessment-types`, `areas-of-expertise` — with `accreditations`, `locations`,
`departments` (the teams staff are grouped into, replacing a four-value select), `event-types`
(likewise, replacing an eleven-option select on Events) and `streams` alongside. Content collections: Pages, Posts, Media, Categories, Users, Specialists,
Team, Events, AvailabilitySessions, Services, Resources, Offices, Testimonials. Directory blocks
(`SpecialistDirectory`, `SpecialtyDirectory`, `EventsExplorer`) filter on those taxonomies, so new
filter axes are added as collections, not as hardcoded option lists.

Globals: Header, Footer, SiteSettings, SpecialistAvailability, SpecialistProfile, ArticleSettings,
EventsSettings, TeamSettings, CustomStyles, DesignSystem.

**Admin labels deliberately follow the site, not the slug** — `posts` shows as **Articles**,
`categories` as **Topics**, `areas-of-expertise` as **Assessment Areas**. The sidebar groups are
Publishing / Reference / Taxonomy / People / Availability / Media / System / Forms / Page settings /
Site / Design; every group holds either records or settings, never both. See `docs/ADMIN-GUIDE.md`. Page-level and section-level copy lives
in globals rather than in components.

**Event timing** is two separate questions, resolved by one helper
(`src/utilities/eventTiming.ts`) that both the detail page and the events listing call:

- `isPast` — from `date`, compared **start-of-day**, so an event stays "Upcoming" for the whole of
  the day it is held. Drives the status badge, the "Event Recap" heading and the listing's
  upcoming/past split.
- `registrationOpen` — from the editable `registrationClosesAt`, falling back to the event start
  when empty. Drives the CTA ("Register Your Interest" vs "Contact Us") and nothing else.

They are allowed to disagree: an event can be under way, or have finished this morning, and still be
taking expressions of interest. Before this, one boolean compared against the *start* time drove
both, so an all-day seminar read "Past Event / Contact Us" from 9am — and the listing (which already
compared start-of-day) disagreed with the detail page about the same event. `now` is a parameter so
the statically-rendered listing can pass the browser's clock instead of a build-time "today".

### Caching and revalidation

Globals are read through `getCachedGlobal(slug, depth)`, tagged `global_<slug>`; the matching
`afterChange` hook calls `revalidateGlobal(slug)` (or a per-global hook for Header/Footer).
Collections with a detail page (Pages, Posts, Specialists, Team, Events, AvailabilitySessions)
have their own `hooks/revalidate<Name>.ts` targeting the path built by `routes.ts` — these also
purge the old path when a published doc moves, and the relevant `<name>-sitemap` tag. Pages
additionally purge `global_header`/`global_footer` on structural changes, because the nav is read
through `unstable_cache` and `revalidatePath` alone won't refresh it.
**All of these go through `src/utilities/safeRevalidate.ts`, never `next/cache` directly** — see the
Invariants table for what an unguarded call did to the admin's Create view. On top of that, most content
collections also run the shared `revalidateSiteOnChange`/`revalidateSiteOnDelete`
(`src/utilities/revalidateSite.ts`), because their docs also surface inside blocks, directories and
archives across arbitrary pages; that hook does `revalidatePath('/', 'layout')` — cheap, because
Next regenerates lazily. Seeding sets `context.disableRevalidate` to avoid a revalidation storm;
respect that flag in any new hook.

### Design reference

`.design-reference/` holds the static HTML target for the redesign. Diff a page family against it
with `node tests/visual/referenceCssDiff.mjs <family>`, and **serve it over HTTP, never `file://`**
— its stylesheet is linked root-absolute and silently fails to load from the filesystem, so every
shared-sheet rule reads as an unstyled default:

```bash
(cd .design-reference && python3 -m http.server 4100)
```

Where the build deliberately differs from the reference, it is recorded in `README.md` →
**Deliberate departures**. Read that before "correcting" anything back — several of those
differences were requested by the client, and one is the reference failing to execute its own
intent.
