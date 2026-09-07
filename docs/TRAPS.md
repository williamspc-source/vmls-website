# Traps

Every entry here is a mistake that was actually made in this repository, and the measurement that
settled it. None of it is hypothetical, and none of it is advice — each one cost somebody hours.

**Read the relevant section before you believe a measurement.** Most wrong conclusions in this
project came from a bad *reading*, not from bad code: a grep that could not match, a browser probe
that measured a stale build, a diff tool that skipped the property in question. The pattern repeats
often enough that the working assumption should be *"my instrument is lying"* before *"the code is
broken"*.

`CLAUDE.md` holds the rules. This file holds why each one exists, and the traps that are not rules
because there is nothing to obey — only something to check.

## Contents

- [Why each invariant exists](#why-each-invariant-exists) — the evidence behind the numbered rules in `CLAUDE.md`
- [The dev server and the build](#the-dev-server-and-the-build)
- [An admin preview can show something the site never renders](#an-admin-preview-can-show-something-the-site-never-renders)
- [`useMemo` can disable the React compiler for a whole component](#usememo-can-disable-the-react-compiler-for-a-whole-component)
- [Running the e2e suite](#running-the-e2e-suite)
- [Searching, grepping, and reading a tool's output](#searching-grepping-and-reading-a-tools-output)
- [Driving a browser](#driving-a-browser)
- [An inline style defeats every media query, so a responsive rule can be dead](#an-inline-style-defeats-every-media-query-so-a-responsive-rule-can-be-dead)
- [`pnpm dev` and a desktop-only test suite cannot see a responsive fault](#pnpm-dev-and-a-desktop-only-test-suite-cannot-see-a-responsive-fault)
- [`stroke` on a filled icon, and other rules that read correctly and do nothing](#stroke-on-a-filled-icon-and-other-rules-that-read-correctly-and-do-nothing)
- [The `.my-16` wrapper: two ways it costs 64px](#the-my-16-wrapper-two-ways-it-costs-64px)
- [Taxonomy-before-content in `payload.config.ts` is a convention, not a requirement](#taxonomy-before-content-in-payloadconfigts-is-a-convention-not-a-requirement)
- [A hook that throws a plain `Error` tells the editor nothing](#a-hook-that-throws-a-plain-error-tells-the-editor-nothing)
- [Writing a guard that can actually fail](#writing-a-guard-that-can-actually-fail)
- [Writing a guard against a stylesheet: CSS-shaped text inside a COMMENT](#writing-a-guard-against-a-stylesheet-css-shaped-text-inside-a-comment)
- [`computedSnapshot.mjs` is NOT deterministic on `/about`](#computedsnapshotmjs-is-not-deterministic-on-about)
- [CSS, the design reference, and the diff tools](#css-the-design-reference-and-the-diff-tools)
- [Content, the seed, and stored data](#content-the-seed-and-stored-data)
- [Retiring a Lexical `TextStateFeature` value DELETES it from stored documents](#retiring-a-lexical-textstatefeature-value-deletes-it-from-stored-documents)
- [Adding a `select` option races two concurrent Payload boots](#adding-a-select-option-races-two-concurrent-payload-boots)
- [A control that "does nothing" may be losing the cascade, not unwired](#a-control-that-does-nothing-may-be-losing-the-cascade-not-unwired)
- [The HOOKS §6 guard proves a rule exists, not that anything emits it](#the-hooks-6-guard-proves-a-rule-exists-not-that-anything-emits-it)
- [A `sort:` on a column nothing writes is not an error — it is arbitrary order](#a-sort-on-a-column-nothing-writes-is-not-an-error--it-is-arbitrary-order)
- [A migration that passes locally can be untestable locally](#a-migration-that-passes-locally-can-be-untestable-locally)
- [Images](#images)

---

# Why each invariant exists

These are numbered to match the Invariants list in `CLAUDE.md`. The rule is there; the failure that
produced it is here. If you are about to delete or weaken a rule, read its entry first — several of
them look arbitrary until you see what happened without them.

<a id="i1"></a>
**1. Never report success a request did not confirm**

The enquiry drawer used to `setStatus('sent')` whenever the form lookup had not resolved — visitors were thanked and the enquiry was discarded.

<a id="i2"></a>
**2. A field an editor can set must be read, or hidden by `admin.condition`**

A page hero's `media` upload was ignored unless "image panel" was ticked; `SpecialtyGrid.columns` did nothing in checklist mode; `AvailabilitySessions.notes` said "shown with the slot" and was rendered nowhere.

<a id="i3"></a>
**3. `src/utilities/routes.ts` is the only place a document path is built**

Five copies of a collection→prefix map drifted apart. The last one sent draft Preview to `/posts/<slug>`, which 404s. `Card` interpolated an undefined `relationTo` into `/undefined/<slug>`.

<a id="i4"></a>
**4. Globals whose links can point at Posts are read at depth 2**

At depth 1 `postPath` returned null and `CMSLink` returned null, so a header nav item to an article rendered as *nothing* — the nav just looked short.

<a id="i5"></a>
**5. Seed `ensure*` helpers return their id in both branches**

`ensureForm` returned `void` and bailed when the form existed, so any repair built on it could only ever run on a virgin database. `site-settings.enquiryForm` was never set, and the enquiry drawer was disabled site-wide on every install.

<a id="i6"></a>
**6. Never call `revalidatePath`/`revalidateTag` from `next/cache` directly**

Next 16 throws when either is called outside a Server Action or route handler, and Payload runs `afterChange` *inside the transaction*. Building the **Create New** form state tripped it, so `/admin/collections/pages/create` rendered the sidebar and **no form at all** — zero inputs, HTTP 200, nothing in the browser console. No page or post could be created. Same for CLI and job writes, where the throw rolls the write back.

<a id="i7"></a>
**7. Never pass a named cacheLife profile to a tag purge**

Every purge in the repo used to pass `'max'`. Given *any* profile Next sets `stale = now` but `expired = now + expire*1000` — and `max`'s expire is a **year**, which `areTagsExpired` (`expiredAt <= now`) never satisfies. So the tag went stale-while-revalidate instead of expiring. Measured under `next start`: after saving a Design System token, the editor's **first reload served the old value**, and three quick edits left the page two versions behind. Related: a tag purge only reaches the manifest of the process that calls it, so a `payload run` script cannot purge a separately running server.

<a id="i8"></a>
**8. `308` only for moves that will never change again**

`/posts/<slug>` 308'd to a stream-derived URL; browsers cache that forever, so reassigning an article's stream stranded everyone who had followed the old link.

<a id="i9"></a>
**9. A collection with autosave drafts creates a document when the Create New form is *opened***

`admin.e2e.spec.ts` opens the Pages create form every run, so the suite left one empty draft behind each time — **72** had accumulated locally, and the Pages list was unusable to look at. Its own assertion is the tell: it expects a document *id* in the URL, which is only possible because autosave already wrote one. It now records that id and deletes it in `afterAll`, beside the existing `cleanupTestUser`. Proven both ways — 72→73 on a run before the fix, 73→73 after.

<a id="i10"></a>
**10. Delete documents through Payload, never with SQL**

A raw `DELETE FROM pages` over 72 empty drafts would have left **144** version rows pointing at nothing — invisible in the admin, and waiting to confuse a later migration. Payload's own delete removes the versions with the document; measured 0 null-parent rows in `_pages_v`, `_posts_v` and `_events_v` afterwards.

<a id="i11"></a>
**11. zsh does not word-split an unquoted `$var`**

A delete loop over 73 ids fired a single request to `/api/pages/97\n64\n69…`, got HTTP 000 and removed nothing — while the same loop over a one-id list worked, so two of the three collections succeeded and it looked partially fine. Use `while read -r`. Same family as the `--include=*` glob trap already recorded.

<a id="i12"></a>
**12. The admin sidebar's group order is derived from `payload.config.ts` array order**

Assigning tidy `admin.group` names left the sidebar in an arbitrary order (Media second, Reference after Availability) because nothing declares it. Reordering the array is the only lever, and it is the same array carrying the taxonomy-first rule.

<a id="i13"></a>
**13. `CMSLink` is imported by client components, so it cannot be async**

Making it async would break `HighImpact`, `Header/Nav` and `Header/Component.client`. Offering `portalEnquiry` on every block instead would give an editor a type that renders an inert `data-link-unresolved` span wherever nothing resolves it — a control that can be set and silently does nothing. The resolver's return type narrows `type` to CMSLink's union, so a block that forwards raw links fails to compile; both call sites errored with `'portalEnquiry' is not assignable` before they were wired.

<a id="i14"></a>
**14. A component that hardcodes `appearance="inline"` must have `appearances: false` in its config**

`CMSLink` destructures `appearance`, so a literal after `{...link}` wins and the editor's stored choice is discarded.

<a id="i15"></a>
**15. Queries against draft-enabled collections pass `overrideAccess` explicitly**

A legacy `/specialists/<slug>` URL matched *unpublished* specialists and 308'd to a profile that 404s — while its own comment claimed it checked for published ones.

<a id="i16"></a>
**16. After any collection/global field change**

The checked-in baseline silently fell behind by ~29 FK columns plus several new fields.

<a id="i17"></a>
**17. A guard that has never failed is not evidence**

Three of four guard patterns were structurally incapable of failing — one asserted an array it never wrote to — and "94/94 passing" was reported as proof the work was sound.

<a id="i18"></a>
**18. A helper takes the narrowest input that answers the question**

`eventTiming()` accepted `{date?, registrationClosesAt?}` and returned both `isPast` and `registrationOpen`. The events listing passes an `EventItem`, which has no `registrationClosesAt` — it compiled, and a wrong `registrationOpen` sat there waiting to be read. Split out `isEventPast(EventDateInput)`.

<a id="i19"></a>
**19. A "read this field" check must not count code that *writes* it**

The orphan-field guard's haystack included `src/endpoints`, where the seed writes `{ hoursNote: '…' }`. That looks identical to a read, so every seeded field appeared consumed — measured: deleting the only renderer of `Offices.hoursNote` still passed.

<a id="i20"></a>
**20. An in-page anchor link is two halves: the link *and* the target**

The homepage's Videolink link was corrected to `#videolink-appointment` and the guide still opened on In-Person — the anchor ids had never reached the database, because `seedInfoBooking` early-returns on an authored page. The href looked right in every check that read hrefs.

<a id="i21"></a>
**21. Content links live in the database, so a seed edit alone fixes nothing**

The seed had *already* been corrected to canonical paths. Every existing install, the box included, still served the old ones: 30 links across 9 pages on flat legacy paths that only resolved through a 308.

<a id="i22"></a>
**22. "Has this been written yet?" is answered by `isUnauthored` (`src/endpoints/seed/authored.ts`) — never by counting blocks**

All the `authorPage` guards asked `layout.length > 2`, which is a proxy for "looks substantial", not "someone wrote this" — so **13 of 27 pages** were rewritten from the fixture on every seed run, discarding editor changes. Proven: the events hero was reworded to `EDITOR WORDING TEST`, the seed re-run, and the fixture wording came back. The correct predicate already existed as `isPlaceholderLayout`; today it has one direct call site (`src/endpoints/seedVerify.ts:798`) plus its use inside `isUnauthored` itself. `tests/int/seedAuthored.int.spec.ts` asserts **six** files define `authorPage` — the seventh copy is inlined in `seedHomepage` — and its comment records that this control is what caught a guessed number, so trust the spec over any count written here.

<a id="i23"></a>
**23. For a file, "absence" means the stored bytes differ from the source — not that the field is empty**

The photo backfill guarded on `if (rec.photo) continue`, the team lookup hardcoded `${slug}.png` so a JPEG never matched, and `getOrCreateMedia` matched on `alt` and handed back the *old* doc. Three independent reasons a replacement photo committed to `public/assets/images/` changed nothing, none of which logged anything, on a seed run that reported success — covering all 26 specialists and 14 of 19 team members. Replace the file **in place** on the existing doc (`payload.update({ filePath })`): the id, alt, focal point and zoom survive, every reference updates at once, derivatives regenerate, and PNG alpha is preserved.

<a id="i24"></a>
**24. A field with a `defaultValue` cannot be used as a migration signal**

A repair meant to fire once keyed on all four new fields being unset. A new column does not arrive null when its field has a default: the adapter emits `ADD COLUMN … DEFAULT`, which Postgres backfills into every existing row. Measured before the repair had ever run, the block already read `spaced/default/check` — indistinguishable from an editor's choice, so the repair would never have fired at all. `placeholderIcon` (no default) was the only genuine absence available.

<a id="i25"></a>
**25. An id a link can target must be in the server HTML, and the id and the link must come from one function**

Article heading ids were assigned by `ArticleToc` on mount, so a *pasted* `…/article#section` URL found nothing and stayed at the top — the browser resolves a fragment while parsing. Restoring that mount loop as a test break confirmed it: `scrollY 0`, heading still resting at y=972. The two slugify copies (one for the contents hrefs, one for the ids) were also free to drift, and a drifted pair renders perfectly and does nothing.

<a id="i26"></a>
**26. A nav that hides an item for a sibling section decides emptiness through the SAME query the section runs**

The sticky Section Nav on `/in-the-loop` drops the tab of any section that renders nothing. Two copies of "which posts does this list" are free to disagree, and the failure is silent in both directions — a tab pointing at a section that is not there, or a live section with no way to reach it. Exactly how the five copies of the collection→prefix map in `routes.ts` drifted, and how three byte-identical event-type label maps nearly shipped a blank badge. The alternative — the client dropping pills whose `#id` is missing — cannot drift either, but costs a visible flash of tabs that then vanish and does nothing with JavaScript off.

<a id="i27"></a>
**27. A walk over a block tree guards `Array.isArray` on EVERY child key**

`columns` is the Row block's array of columns *and* Archive's/ResourcesGrid's "how many per row" select, where it is the string `'3'`. `flattenBlocks` read it without the guard and threw `flatMap is not a function`, 500-ing `/in-the-loop` — the runtime form of the shared-field-name hole already recorded for the orphan-field guard. The neighbouring repairs in `src/endpoints/seed/` had the guard; the new helper was written from the same shape and lost it.

<a id="i28"></a>
**28. A field an editor types words into is rich text; a field a machine reads is not**

Staff came from WordPress and could not bold a word. Two fields even claimed they could: AudiencePathways' step lead-in described itself as *"Bold step lead-in"* and LeadershipSpotlight's tagline as a *"Short italic pull-quote"*, both on plain inputs.

<a id="i29"></a>
**29. Payload ACCEPTS a plain string in a rich-text field and stores it verbatim**

Measured with a probe: `payload.update({ heading: 'PROBE STRING VALUE' })` was accepted and came back out of the `jsonb` column as a string. The front end even rendered it, because `InlineRichText` takes both. The only place it showed was the admin, where the field would not open.

<a id="i30"></a>
**30. An empty rich text is a TRUTHY object**

Nine block components guarded their header with `Boolean(eyebrow || heading || subheading)`. Converted, that is permanently true — every blank header would have started painting an empty band, on every page.

<a id="i31"></a>
**31. A `defaultValue` on a rich-text field must be a FUNCTION**

Payload writes a literal default into the DDL. A string default produced `"heading" jsonb DEFAULT 'What Sets Us [[Apart]]'`, which Postgres rejects as invalid JSON; the correct Lexical object produced an *unescaped* JSON literal, so the apostrophe in "Minimising Your Client's Report Costs" closed the SQL string and killed the `CREATE TABLE` with a bare syntax error naming the table, not the field.

<a id="i32"></a>
**32. The compiler cannot see a component that declares its own `string` props**

`/events` returned HTTP 200 with complete, correct server HTML and then died hydrating, leaving 11 rendered nodes where there had been 425. `/specialists/specialty-list` and three profile pages each failed a build the same way, one at a time.

<a id="i33"></a>
**33. A field a SHARED HELPER supplies is invisible to the orphan guard unless the guard reads the helper**

`textColour` was added to `sectionHeaderFields`, appeared on **26 blocks**, saved to Postgres — and **not one component passed it on**. `SectionHeader` declares a `colour` prop and a grep for `colour=` across `src/blocks`, `src/heros` and `src/components` returned exactly one file: `SectionHeader` itself, defining it. Every editor on every section heading could pick a colour and watch nothing happen, for as long as the suite reported green. Fixing the guard immediately found a **second** case in the same shape — `SpecialistDirectory.subheading`, whose own component comment says "there is no subheading" — now hidden with `admin.condition: () => false`, which is the other half of the invariant. Third instance of this family, after the common-name hole (`icon`, `title`) and one name serving two purposes in one file.

<a id="i34"></a>
**34. A hover effect belongs only on something that can be clicked**

The booking-portal band's three tiles — Specialist Availability, Download CV, Sample Redacted Report — brightened on hover and did nothing, on 26 specialist profiles plus three pages. They are non-interactive `<div>`s **in the design reference too**, which still declares `.portal-opt4-tile:hover`, so a faithful port inherited the reference's own mistake. Nothing could have caught it: `computedSnapshot` never fires a hover, a declaration diff cannot tell a `<div>` from a link, and **no diff family matches `.portal-opt4*`** — a third instance of the `match`-regex trap, on a page whose family reads zero.

<a id="i35"></a>
**35. A repair that filters or compares a CONVERTED field must go through `storedText`**

A fresh seed on the box died on `where: { timeLabel: { contains: '–' } }`. Fixing only that would have left `if (typeof doc.timeLabel !== 'string') continue` in the same file, which skipped **every** document and logged `docs.length` as its success count. Two more of the same family were found by running the seed to completion: `(r.title ?? '').includes(…)` in `repairContentImages` threw and stopped the chain, and `norm()` in `seedLinkRepairs` returned `''` for every link label, so all three `LABEL_SCOPED_FIXES` had been dead since the conversion. **Sweep for the string METHODS, not just for `typeof`** — the first sweep looked for `typeof`/`contains:` and missed `.includes(`, which cost an extra reseed.

<a id="i36"></a>
**36. Nothing in `tests/` runs the seed, so a green suite says nothing about it**

The four faults above shipped under 215/215 int and 61/61 e2e. Worse, the *local* database cannot reproduce them: it holds **0** en-dashed events against **11** in the fixtures, because those rows were repaired while the column was still `varchar`. So a seed run here would also have passed. The proof was `createdb` → `migrate` → seed → count: **7 → 0**, with the gateway link gaining the `#join-form` it had never had.

<a id="i37"></a>
**37. A third-party widget script that initialises once per page load is incompatible with client-side navigation**

TryBooking's `widget.js` scans for `.tryb-widget` at `load`, sets a private `trybWidgetsInitialized` global, and exposes no re-init API — so a div React inserts during a soft navigation never renders, and re-adding the script does nothing. Measured in a browser: a widget added after `load` got no iframe at all. The block therefore renders a booking **link** that is hidden only on confirmed success; the degraded state is designed, and asserted, rather than chased.

<a id="i38"></a>
**38. A cross-origin iframe that was REFUSED still exists as an element, with a height**

TryBooking's embed sends `frame-ancestors 'self' https:` and so is refused over `http` — the dev server. The iframe element was still created at **380px** (against 1324px when it works), holding a `chrome-error://chromewebdata/` document. A first probe read `iframe: true` and reported success; the page was in fact showing the browser's "refused to connect" panel. Keying the fallback on that would hide the booking link exactly when a visitor needs it.

<a id="i39"></a>
**39. A generated identifier that exceeds Postgres's 63-character limit makes the schema never settle**

`PeopleGrid.assessmentType` yielded `_pages_v_blocks_people_grid_assessment_type_id_assessment_types_id_fk` — 69 characters. Fixed by renaming the field to `asmtType` (column `asmt_type_id`, 12), which lands the name on exactly 63 and untruncated; **the proof is the oid holding still across three boots**, not the arithmetic. Measured: the constraint's oid changed on each `getPayload()` (1674921 → 1674968 → 1675016), and because vitest boots Payload per test file in parallel, two boots racing that DDL fail with `42704 undefined_object`. It read exactly like a flaky test and was twice dismissed as "the environment"; `pnpm test:int` failed 1–2 runs in 3 and now passes 5 in 5. `dbName` is **not** available as a fix — Payload 3.85 rejects it on a relationship field and the build fails to type check.

<a id="i40"></a>
**40. A listing block with no filter set is not "showing everything" — it is showing whoever sorts first, under a heading that promises a selection**

`PeopleGrid` builds no `where` clause when its filters are empty, so it returned the first N specialists by drag order. The homepage's *Meet Our Expert Panel* was the alphabet, and /jme's *Specialists Who Conduct JME Assessments* listed ten people of whom **three** were tagged for JME while five who were tagged were absent — for as long as the page had existed. The data to answer it was already there (`assessmentTypes`, 8 tagged); the block simply offered no filter on that axis, so no editor could reach it.

<a id="i41"></a>
**41. A block that returns `null` on an empty result deletes its whole band, silently — so any filter added to one MUST be paired with proof that something matches**

`PeopleGrid` ends `if (cards.length === 0) return null`. Ticking "Only featured specialists" while `Specialists.featured` was `false` on all 26 would have removed the homepage carousel, its heading, its subheading and both footer buttons — no error, no empty state, nothing in the console. `repairFeaturedSpecialists` therefore writes the flags **before** the filter and refuses to set the filter at all if the count is zero, and the e2e asserts the count before the membership.

<a id="i42"></a>
**42. A field destructured from props and then never used passes the orphan-field guard**

Deleting the entire `assessmentType` query from `PeopleGrid/Component.tsx` left `assessmentType,` in the props destructure — Pattern A **stayed green**, `tsc --noEmit` passed, and ESLint reported it only as a *warning*, which `pnpm lint` exits 0 on. So `pnpm test` was green on a dead control. The guard that goes red is the e2e. Same family as the common-name hole (`icon`, `title`) and the one-name-two-purposes hole, in a third shape: the guard is not fooled by a coincidental match but by the declaration of intent to read.

<a id="i43"></a>
**43. An option that renders identically to "no option" is a dead control, even when its CSS rule is perfect**

`heading` and `body` resolve to `--text-dark`/`--text-mid`, which on a light band are the colours the text already is: Default and "Heading text" both computed **`rgb(65, 64, 66)`**, identical to the byte. They sat first in the dropdown, directly under "Default (as designed)" — so the first thing an editor tried was the one thing that could not show a change, and a control that had just been fixed and measured was reported broken a second time. They are last now, labelled *"Follows the band"*, and excused by name in the guard rather than by silence.

**The exemption list was the wrong shape, and the palette outgrew it.** A *fixed* Charcoal (#414042, added because staff asked for ink that stays put) is identical to Default on a light band too — but it is not dead: on a dark band it stays charcoal while Default turns white. A one-context guard calls that a dead control, and the tempting fix is to add it to the exemption list, which would then have grown by one entry every time the palette did. The honest fix is to measure the same heading in **two** contexts and require a colour to differ from Default in *at least one* — which lets every entry be asserted instead of excused, and permits three further assertions the old shape could not make: that the band-following pair and the two on-dark re-points **must** move with the band, and that **every other entry must not**. That last one is the browser half of "an explicit pick is fixed", and nothing else in the repo would have noticed a `.vf-on-dark .vf-tc-charcoal` rule being added. Proven red five ways; the list is in the spec's doc-block.

<a id="i44"></a>
**44. Payload's own JSX converters read `node.format` and ignore node state entirely**

`TextStateFeature` puts a colour swatch in the toolbar and writes `{"$":{"color":"brand"}}` onto the text node. Registering it alone gives an editor a control that colours the text in the admin, saves cleanly, and paints nothing on the page — a brand-new instance of the failure it was added to fix. The two halves must ship together.

<a id="i45"></a>
**45. A guard aimed at a rule that declares nothing passes forever**

The `!important` on `.vf-tc-*` was justified in a comment naming `.vf-client-overview .vf-split__title` as a 0,2,0 competitor. It sets `margin-bottom`, `font-size` and `font-weight` and **no colour** — so the e2e written against it stayed green with the flag deleted, and read as a guard that could not fail. Dark-band headings are the same trap for a different reason: `.vf-on-dark .vf-tc-*` carries its own flag, so those pass either way. The real competitors were found by parsing the *served* stylesheet for rules setting `color` on a header class at ≥2 classes, then measuring each with the flag removed: `.why-verify--light .why-header .section-title` goes brand blue with it and stays `rgb(65,64,66)` without.

<a id="i46"></a>
**46. Never join or interpolate a copy value**

FAQ joined its help card's heading and body; `/information-centre/for-clients` shipped "[object Object] [object Object]" beside an info icon. `computedSnapshot` found it only because the paragraph had become one line instead of two. `/contact` printed it four more times, from `` ` | ${t.note}` `` separators.

<a id="i47"></a>
**47. `InlineRichText` adds no wrapper unless you ask for one**

Defaulting to `<span>` added 48 elements sitewide and nested `<span class="ni-card-link"><span>…</span></span>`. Worse, the Heading block's `<Tag><span>text</span></Tag>` handed the brand colour to the wrapper — `.section-title span` is the *accent* rule — and the heading itself went grey.

<a id="i48"></a>
**48. Booting Payload runs a dev schema push, so a deliberately-broken config is applied to the local database**

Proving one guard red converted **156 columns** back to varchar, keeping the Lexical JSON as text. Nothing said so; the next build simply failed.

<a id="i49"></a>
**49. A scratch table in the app's own database hangs the dev push**

A `shape_cols` helper table left in `verify_cms` hung `getPayload()` for ten minutes with an empty log and no DB activity — indistinguishable from a slow boot.

<a id="i50"></a>
**50. Don't cache a value that is already stable**

`startOfDay(Date.now())` already returns the same number all day. Memoising it in a module variable froze "today" for the life of the JS bundle — which outlives a page, since client-side navigation doesn't re-evaluate modules — so a tab open overnight never re-bucketed events.

<a id="i51"></a>
**51. A field on a publicly-readable collection is public, wherever it sits in the admin**

AvailabilitySessions is `access.read: anyone`, so its `notes` field — a staff note — was served to unauthenticated callers on `/api/availability-sessions`. Measured: an anonymous `curl` returned the `notes` key, and returned real values for the collection's other optional fields (`location` came back as "Brisbane CBD"), so the exposure was live rather than theoretical. Moving a field to the sidebar, labelling it "Internal note" and writing "staff only" in its description change nothing — only field-level `access.read` removes it from the response. Guarded by `tests/int/availabilityNotes.int.spec.ts`, whose second assertion is the positive control: without it the test passes just as happily against a field that is empty, misspelled or deleted.

<a id="i53"></a>
**53. The header's collapse breakpoint is written in three places**

`1024px`, not `768px`, and it appears three times in `globals.css` — measured 2026-08-26:
**line 683** (the nested `components` sub-layer), **line 3703** (the extracted block) and
**line 4141** (the drawer block). The file says so itself at 4141: *"1024, matching the two blocks
above: all three must move together or the header half-collapses."*

Change one and the change appears to do nothing, because the other two still hold the old value and
un-sublayered rules beat sublayered ones per declaration. The breakpoint is 1024 rather than 768 for
a measured reason recorded at line 683: between 769 and 1024 the full desktop bar (logo, seven
nowrap links, CTA) does not fit `.container`, so the document grew sideways — **scrollWidth 1191
against a 1024 viewport** — and every full-bleed band stopped short of the right edge. Collapsing
here also gives touch tablets the dropdowns, which are hover-only above this width.

`tests/e2e/responsive.e2e.spec.ts` is what goes red on this; note that `overflow-x: clip` on `html`
once made that spec unable to fail on the very defect it was written for.

<a id="i56"></a>
**56. A layout that divides a band by a fixed share must say what ONE child means**

`bookingChooser` is the full-bleed 50/50 pair on Make a Booking, and `.booking-half` takes its share as `flex: 0 1 50%`. The block accepts a single half, and the same block with one half is the "Specialist Availability" signpost under the hero on `/specialists` and `/specialists/specialist-panel` — where a 50% share had nothing to share with. Measured at 1440×900 before the fix: the panel was **720px of a 1440px band**, the other 720px being the section's own white; hovering it slid the edge to **835px** (58%) and back; and at 390px, where the split turns column, the panel was **379px of a 520px band**, leaving a 141px white strip beneath it. Nothing was broken in the sense of throwing — the block rendered exactly what it was told, which was "take half".

Two things this cost, both worth keeping:

- **The count has to be decided BEFORE the markup.** The component filtered contentless halves from *inside* its `.map`, returning `null` per item, so at the point the container class was written nothing knew how many panels would appear. And the emptiness test was `half.eyebrow || half.title || half.description` — every one of those a converted rich-text field, every one of them a **truthy object when empty** (invariant 30), so a blank half counted. Both had to move for the fix to be expressible at all.
- **`flex-grow`, not `flex-basis: 100%`.** The fix is one declaration, `.booking-split--solo .booking-half { flex-grow: 1 }`, and it stops the hover slide as a side effect rather than by fighting it: a single growing item absorbs **all** the free space, so as the hover rule animates the basis 50% → 58% the free space shrinks by exactly as much and the used width stays 100% throughout — sampled six times across the 0.6s transition to confirm the algebra in a real browser rather than on paper. `flex-basis: 100%` would have needed a second rule to win the specificity contest against `.booking-split:hover .booking-half:hover`, and would have been a **height** of 100% in the mobile column direction.

Guarded by `tests/e2e/frontend.e2e.spec.ts` → *"a chooser with one panel fills its band and does not resize on hover"*, whose third case asserts Make a Booking **still slides** — otherwise deleting the two `.booking-split:hover` rules outright would satisfy the first two cases while stripping the effect from the page it was designed for.

<a id="i57"></a>
**57. A Payload `select` is a Postgres ENUM, so anything an editor can CREATE must be `text`**

<a id="i58"></a>
**58. A field declared by more than one helper must be changed in ALL of them**

<a id="i59"></a>
**59. An uploaded icon is an empty `<svg>` painted by `mask-image`**

These three come from one afternoon. Icon uploads were built on 2026-08-23 and reverted the same day
after the local site hung on every request; the work survived in `git stash` and was rebuilt on
2026-08-25. What follows is why it hung, established by reproducing it rather than by reading the
code.

**The field was a `select`, which is one enum type PER COLUMN.** Measured two ways that agreed:
`SELECT count(*) FROM pg_type WHERE … enumlabel='brain'` returned **112**, and the committed baseline
migration contained **112** matching `CREATE TYPE` statements — 64 live columns and 48 `_v` version
shadows. An enum can only hold labels that existed when the schema was built, so `upload:12` can
never go in one. Converting them to `text` means dropping 112 types, which is destructive.

**What the destructive push actually does is worse than the "Accept warnings?" prompt already
recorded here.** Reproduced deliberately: with the config changed to `text` and the database still
holding the enums, `curl` returned **000** and the log ended in

```
Is enum_icons_colour enum created or renamed from another enum?
❯ + enum_icons_colour                                          create enum
  ~ enum__appt_guide_v_types_icon › enum_icons_colour           rename enum
  … 111 more
```

— drizzle-kit's **rename-resolution** prompt: a 113-option arrow-key menu, written to a backgrounded
log, waiting on input nobody can give. It appears because 112 enums vanish while one new one
(`enum_icons_colour`, the uploaded icon's default colour) appears, so every disappearance is offered
as a possible rename. `getPayload()` never settles and every request queues behind it. Grep the log
for *"rename enum"* as well as *"Accept warnings"*.

**And the first attempt made it permanent by missing a file.** `iconField` is declared in
`src/fields/blockFields.ts` — 65 columns — and again, independently, in `src/fields/link.ts` for
every link's icon: 45 more (`link_icon` 42, `view_all_link_link_icon` 2, `cta_link_icon` 1). The
repair SQL matched *any enum containing the label `brain`* and so converted all 112, including the 45
the config still called enums. That is drift the push can never settle: it rebuilds those enums on
every boot. Unlike the one-off prompt, `rm -rf .next` does not clear it. **Grep the field name, not
the helper** — `iconOptions` would have found both; `iconField` finds one.

**The fix was not to convert anything.** The box was being rebuilt from scratch anyway, so the local
database was dropped and recreated with the config already saying `text`: every statement is a
`CREATE`, there is nothing destructive to prompt about, and the boot was clean first time. Verified
afterwards — 0 icon enum types, 112 `character varying` icon columns, and all **1,033** stored icon
values present after reseeding. `REFERENCE-icon-enum-to-text.sql` is kept for a box that cannot be
wiped; its header said "45 columns", which was true on the day and stale by 2.5× two days later.

**The `<span>` that could not be styled.** With the schema sorted, an uploaded icon rendered as a
`<span>` painted with `background-color: currentColor` and masked by the artwork's alpha. It looked
right in isolation and wrong on every real page: measured `rgb(65,64,66)` at 24px where the built-in
it replaced was a tinted blue at 36px. The cause is that `globals.css` sizes and colours icons
through **66** rules that select `svg` — `.ni-card-img svg { width: 36px }`, `.img-qa svg { color: … }`,
`.audience-card-icon svg`, and so on — and a `<span>` matches none of them. Widening 66 selectors was
the obvious fix; the better one was to make the element an **empty `<svg>`**, which matches all of
them and is still painted entirely by the mask. One word, no CSS churn.

**A default colour published as CSS still has to re-point on dark bands.** The uploaded icon's own
colour is emitted by the layout as `[data-vf-icon="12"]{color:var(--primary)}`. That first version
used the raw token, so on the navy portal band the upload painted `rgb(28,117,188)` beside a built-in
painting `rgb(147,208,247)` — the exact contrast failure the palette exists to prevent. `.vf-tc-*`
gets its dark behaviour from hand-written rules in `globals.css` that a `[data-vf-icon]` rule cannot
inherit, so the re-point is generated from the same `BRAND_TEXT_COLORS` entry (`onDarkToken`) and the
selector list lives once in `ON_DARK_SELECTORS`, tied to the stylesheet by a test.

---

# Traps that are not rules

There is nothing to obey in this section — only something to check. They are grouped by what you
are doing when each one bites.

## The dev server and the build

**Two ways this repo's dev server has faked a reading, both this week.**

*The one on port 3000 may not be a dev server at all.* `./start.sh prod` serves a **prebuilt** `.next`
under `LOCAL_PROD_REPRO`, and nothing about the page says so. A CSS and component change made against
it measured as having no effect whatsoever — the class was simply absent from the DOM — which reads
exactly like a broken selector. `tail .dev.log` names the mode in a boxed banner; check it before
concluding a change did nothing.

*And its stylesheet lags the file by ~20 seconds.* A `sleep 3` after editing `globals.css` was not
enough, and a Playwright break-proof run against the stale chunk reported a confident **PASS** for a
guard that was in fact red — the failure mode invariant 17 exists to prevent, arriving through the
tooling instead of the test. Confirm the browser has the edit before believing any run that depends
on it:

```bash
curl -s http://localhost:3000/make-a-booking | grep -o '/_next/static/[^"]*\.css' | head -1
curl -s "http://localhost:3000<that path>" | tr '}' '}\n' | grep '<your selector>'
```

Note `grep -c` on that chunk is useless as a presence test — the CSS is one long line, so it answers
0 or 1 no matter how many rules match. Split on `}` first, as above.

**`pnpm dev` cannot reproduce a staleness bug, so "works locally" is not evidence against one.** The
frontend routes are ISR: `src/app/(frontend)/[...slug]/page.tsx` sets `export const revalidate = 3600`,
and `.next/prerender-manifest.json` confirms `/make-a-booking` and
`/specialists/specialist-availability` prerender with a 3600s window. In production an edit therefore
appears only when `revalidatePath` succeeds, or up to an hour later. `pnpm dev` re-renders every
request and shows the change instantly.

Reported 2026-08-25 as "the availability chip tooltip never renders even with a note saved". It was
reproduced locally in two seconds — save, then `title="…"` in the served HTML — proving the code
correct. The deployed box has the wiring too (its payload carries a `note` key per chip), and its
caching is measured: `cache-control: s-maxage=3600, stale-while-revalidate=31532400` with
`x-nextjs-cache: HIT`, so a **year-long** SWR window serves the stale page while refreshing behind the
visitor. An editor can therefore see the old page well past the hour.

**Two lessons, and keep them separate.** The first is the rule above: dev cannot reproduce this class
at all. The second is about how far a measurement licenses you to go — the cache was written up as the
*proven cause* of that report before anyone checked whether the note had reached the box's database.
It had not: zero sessions there carry a note, which is equally consistent with "never saved" and
"removed after testing", and the two cannot be separated after the fact. A measured fault that would
produce the reported symptom is not the same as the confirmed cause of it, and saying so cost nothing
here only because the field was being deleted anyway.

When you cannot reproduce on the reporting environment, check `prerender-manifest.json` and the box's
log, because `safeRevalidatePath` never throws — it logs `Revalidation skipped (path …): …` and
carries on, invisible unless somebody reads the log. That line is real: it appears in a full
`pnpm test:e2e` run as `Invariant: static generation store missing in revalidatePath /`.

Two further instruments lied during the same investigation, both listed elsewhere here: the on-disk
`.next` was a stale mixed build whose server chunks disagreed with what the running server served, and
a positive control (`grep -c startTime`) returned 0 against it, which is what exposed the file as the
wrong instrument rather than the code as broken.


Nearly every "my edit did nothing" in this repo was a stale build before it was a bad edit.

- **Never run `pnpm build` while `pnpm dev` is running.** They share `.next`, and the production
  build overwrites what the dev server is serving from. Measured: a hover rule that had just been
  confirmed working (`.audience-card:hover` → `translateY(-6px)`) started computing to `none` on
  every run, while `:hover` still matched and `elementFromPoint` was inside the card — the signature
  of correct CSS that never arrived. Four reproductions in a row made it look like a real,
  deterministic defect in the *test*, not the environment. `./stop.sh && rm -rf .next && ./start.sh`
  restored it, source unchanged. Run `pnpm test` first and `pnpm build` last, then restart dev.

- **A new rule in `globals.css` may not reach the browser.** A `.skip-link` rule was in the source,
  and the element rendered completely unstyled — `position: static`, no background — as visible body
  text above the nav on every page. Turbopack had not recompiled the stylesheet; `rm -rf .next` and a
  restart fixed it, source unchanged. So a CSS change that "does nothing" is a stale build before it
  is a bad selector. Confirm with `getComputedStyle` on the element and a **positive control** on a
  rule you know works (`nav.site-nav` → `position: sticky`). Do not try to read `document.styleSheets`
  — cross-sheet access throws, and a `try/catch` around it reports zero matches for *every* selector,
  including ones that are plainly applied.

- **A deleted CSS rule can go on being SERVED.** The stale-Turbopack trap already recorded runs in
  this direction too: `.portal-opt4-tile:hover` was gone from `globals.css` — verified by stripping
  comments and searching the source — while the served stylesheet still carried **two** copies. The
  new guard therefore passed in isolation and failed in a full run, which reads like a flaky test and
  is not. `./stop.sh && rm -rf .next && ./start.sh`, source unchanged, and the served sheet went to
  zero. When a hover/CSS assertion disagrees with itself between runs, `curl` the stylesheet the page
  actually links and grep it before touching the test.

- **A stale Turbopack build will fake a guard's proof, not just a feature.** Deleting
  `scroll-padding-top` and re-running its test reported PASS — the guard looked incapable of failing.
  The dev server had not recompiled. Confirm the break is *live in the browser*
  (`getComputedStyle`) before believing a proof run, exactly as you would for the fix itself.
  **It also fakes the fix's absence.** A correct heading-id converter served `<h2>` with no id
  through every reload and cache-buster query; `rm -rf .next` and a restart, source unchanged, and
  the ids appeared. Four occurrences now, in three sittings — two where it hid a working change and
  two where it hid a deliberate break. Treat "my edit did nothing" as a stale build first and a bad
  edit second, and re-prove *both* directions after restarting.

- **`computedSnapshot.mjs` reporting *every* node as changed means it captured nothing, not that
  everything moved.** Its header line is the tell: `nodes: baseline 8385, now 0` followed by
  `DIFF: 8385 node(s) changed`. Seen after several back-to-back `pnpm test` and `prove-guards.sh`
  runs left the dev server wedged — `curl` returned **000** while `.dev.log` showed requests
  completing in 25-30s, with no *"Accept warnings"* prompt anywhere in it, so it was neither the
  destructive-DDL prompt nor the redundant-`CREATE TYPE` loop already recorded, just an exhausted
  Turbopack. `./stop.sh && rm -rf .next && ./start.sh` and the same comparison read **DIFF EMPTY at
  8385 nodes**, source unchanged. Read the `now N` count before reading the diff: a zero there
  invalidates the run.

- **A destructive schema change hangs dev-push on a prompt you cannot see.** Dropping two columns
  left the push waiting on *"Accept warnings and push schema to database? (y/N)"* inside a
  backgrounded log, and two unrelated new columns silently failed to push for half an hour. Apply
  that DDL by hand (`psql`) and restart, so the push finds no drift — that is how
  `ProcessSteps.description` was converted `varchar → jsonb`, prompt-free, in one
  `ALTER COLUMN … USING`.
  **Seen again 2026-08-20, from removing a field added ten minutes earlier.** "I only just added it"
  does not make a removal non-destructive: dropping `Departments.description` hung the push the same
  way. The symptom that time was `curl` returning **000** and a single admin request sitting at
  *"200 in 10.0min"* in the log, with the prompt several lines above it. Check `.dev.log` for
  *"Accept warnings"* before assuming the server is merely slow.

- **A dev-push failure takes the whole local site down, and the error names the wrong culprit.**
  Narrowing a select's options narrows a Postgres **enum**, and `pushDevSchema` runs inside
  `getPayload()` — so `ALTER TABLE … SET DATA TYPE` failing with `22P02 enum_in` makes *every* page
  500 with a `generateStaticParams` stack trace, not an obvious config error. The cause is rows
  still holding a removed value, and **`_pages_v` is where they hide**: `pages.hero_type` was clean
  (59 pageHero, 2 homeHero) while `_pages_v.version_hero_type` held **62 `lowImpact`** rows of
  template-era history. Count both tables before removing any select option. The failure is atomic —
  the enum and all 481 rows were intact afterwards — but until the config is reverted nothing serves.

- **A dev schema push that has already SUCCEEDED can retry and fail forever, and the symptom is a
  hanging page, not an error.** Adding an `iconField` creates a Postgres enum; the push created it,
  then a later push retried `CREATE TYPE … AS ENUM(…)` and died on *"type already exists"*, so
  `getPayload()` never settled and every request hung — `curl` returned nothing, and the only visible
  message in `.dev.log` was the unrelated pre-existing `instrumentation.ts` Edge Runtime warning. It
  reads exactly like a component you have just broken. **Check the database before believing drift**:
  here all four columns and both enums (live *and* `_pages_v`) were already present and correctly
  typed, so there was nothing to repair — `./stop.sh && rm -rf .next && ./start.sh` cleared it,
  source unchanged. Distinct from the destructive-DDL prompt already recorded: that one waits on
  input, this one loops on a redundant statement.

- **A write script that exits 0 may have written nothing.** `pnpm payload run` produced no output,
  made no changes, and succeeded. Assert the write in the store afterwards; never trust the exit code.
  One specific cause: `payload run` **imports** the module, it does not call a default export — a
  script written as `export default async function ({ payload })` runs zero lines, prints nothing and
  exits 0. Do the work at the top level with `getPayload({ config })`.

## An admin preview can show something the site never renders

**Payload's upload preview shows the FILE. That is not always what the page shows.** An uploaded icon
is normalised on save — recognised geometry kept, the SVG rebuilt, colours dropped so the band can
supply them — and the site renders *that*, from `/api/icon/upload/[id]`. The admin was still showing
`/api/icons/file/<name>.svg`, the original bytes.

Measured on a deliberately garish test file: the admin showed a navy shield with a hot-pink tick; the
page showed one flat shape. Nothing was broken, nothing errored, and an editor had no way to find out
until the icon was on a page. The library tile now renders the stored markup, with light and dark
swatches behind its Edit control (`src/fields/IconLibraryPicker`).

Three things that cost time building it:

- **`admin.hidden` 404s a collection's ROUTES, not just its nav entry.** Hiding `Icons` so there was
  one destination therefore broke the preview screen it had been built on, and would have made every
  "Edit" link on a tile a 404. Measured, both `/admin/collections/icons` and `…/create`. The controls
  moved onto the tile.
- **A document's id is not a form field.** `useFormFields(([f]) => f.id.value)` is always `undefined`,
  so the preview rendered its "save this first" state on a saved icon. The id comes from
  `useDocumentInfo()`. The markup does come from the form, deliberately — reading the saved document
  would show the *previous* upload until a reload.
- **A re-upload keeps the same id**, so the icon's URL does not change and a cached preview shows the
  old artwork. The URL carries `?v=<markup length>`, which changes when the artwork does.

## `useMemo` can disable the React compiler for a whole component

`pnpm lint` reports `Compilation Skipped: Existing memoization could not be preserved` as an **error**,
not a warning — and the consequence is not that one value goes unmemoised, it is that the component is
skipped entirely. Two ways to trigger it, both hit here: mutating an array inside the memo (`push`),
and depending on a value the compiler thinks may be mutated later. Neither is a bug in the code; both
are the compiler refusing to reason.

The fix is usually to delete the `useMemo`. A list of a few hundred small objects is cheaper to
rebuild than a whole component is to leave unoptimised, and the compiler memoises it anyway —
invariant 50, from the other direction.

## Running the e2e suite

- **Playwright runs spec FILES in parallel locally** (`workers: undefined`), and two spec files that
  each boot Payload in a `beforeAll` start two schema pulls against the database the dev server is
  already using. The run fills with *"Pulling schema from database…"* and one of them times out — a
  different file each time, which is the shape of the flake README §10.1 records for
  `admin.e2e.spec.ts`. `tests/helpers/globalSetup.ts` now does that seeding once, in the main
  process, before any worker exists.
- **`tests/helpers/seedUser.ts` DELETES and recreates `dev@payloadcms.com`.** A second spec sharing
  it deletes the account the first is logged in as: both passed alone, both failed together. A spec
  that needs its own credentials gets its own user.
- **A red full run is not automatically a regression, and the *timing* is the tell.** `admin.e2e.spec.ts`
  failed twice immediately after a full suite (47-51s per run) and then passed **three times in a row**
  alone (22-24s). Its failure mode is a tab whose button reads `[active]` while the pane still shows the
  previous tab's fields — a desync the spec's own comment documents at length. Re-run it on a rested
  server before believing it.

## Searching, grepping, and reading a tool's output

Every one of these produced a confident, wrong answer that was acted on.

- **Every negative result needs a positive control.** Before believing "not found", make the same
  check find something you already know is there. Each of these produced a confident, wrong "no":
  `grep --include=*` (unquoted, so zsh ate the glob and grep errored per-iteration) reported all 13
  dead-CSS candidates absent — acting on it would have deleted live CSS; searching for
  `safeRevalidateTag(` found **zero** of its 27 call sites, because every one imports it *aliased*
  as `revalidateTag`; grepping rendered HTML for Phosphor icon slugs could only ever say "absent",
  since Phosphor emits `<path>` data and never the slug; and a `LIKE '%"format":1%'` check on a
  `jsonb` column always fails, because Postgres re-serialises with a space after the colon (query
  the structure with `jsonb_array_elements`, not the text).

- **Grepping rendered HTML matches the first hit, which is usually the header.** Checking an event's
  CTA with `grep 'class="btn'` returned the site header's button and gave the wrong answer twice.
  Scope the search to the region first (find the section, slice, then match inside it).

- **Content inside an inactive Tabs pane is not in the HTML.** `curl | grep` for the AAMLE panel
  found nothing on the homepage and the block was rendering perfectly — only the active tab is
  server-rendered. Drive a browser and click the tab.

- **A link crawl cannot see a page nothing links to.** `/posts` was advertised in the pages sitemap
  and returned 404 — a leftover default from the Payload template. No page links to it, so crawling
  from links found nothing; the sitemap-driven test found it immediately. Enumerate from the
  sitemaps, not from the link graph.

- **`referenceCssDiff.mjs` prints TWO numbers with the word "differences" in them, and the one that
  looks like the answer is not.** Its footer reads *"Reference selectors: 32 · build: 48 ·
  deliberately not ported: 3 · explained differences: 32"*, then a separate `✓`/`✗` verdict line.
  A `grep -Eo 'differences: [0-9]+'` matches the **explained** count — the tally of documented,
  deliberate exceptions — so a family with 32 recorded exceptions and zero real differences reads as
  "32 differences". Measured: that grep reported 11 of 13 families non-zero, including a family
  whose own next line said *"no desktop differences"*, and the false alarm survived a git-bisect
  across four commits before the output was read properly. Key on the verdict line, never on a
  number in the summary.

- **A comment is just more text to a regex, in CSS as well as in TypeScript.** Writing the literal
  selector `.vf-on-dark .vf-tc-brand` inside the explanatory comment above the palette rules made
  `richTextColors.int.spec.ts` — which finds that rule with
  `\.vf-on-dark \.vf-tc-<key>[^{]*\{` — match the comment and then run on to the next real rule,
  reading the wrong declarations. One test went red on a change that touched no CSS. Second instance
  of this hazard; the first is the orphan guard's `object.property` form in a JSX comment, already
  in the Invariants table. Re-run the affected guard after editing any comment near one.

- **A `prettier --write` glob reaches every file it matches, not the files you edited.** Running it
  over `src/blocks/**/Component.tsx` to tidy a two-line change reformatted **24 unrelated
  components** plus all 12k lines of `globals.css` — 8,715 insertions in one file — because the repo
  is not prettier-clean and nothing enforces it (`pnpm lint` passes either way; the raw edits passed
  it before the formatter ran). The churn buries the actual change and makes the diff unreviewable.
  Same family as the `perl -0pi` bulk-edit trap already recorded, and the fix is the same: read
  `git diff --stat` before believing the edit was confined. Formatting is not exempt from that.

- **A regex bulk edit across a fixture file reaches further than the page you are editing.** Adding
  one field to five rows via `perl -0pi -e` matched **13** — every row in `seedServices.ts` with the
  same two-line preamble, including `/services`, which must not have it. It was caught by reading
  `git diff` before moving on, which is the only reason it did not ship. Count the matches and name
  the line numbers before accepting a bulk edit to seeded content; the fixtures for several pages
  live in one file and look alike by design.

## Driving a browser

- **An unresolvable `mask-image` paints NOTHING, not the element's box.** Worth knowing before
  designing around it: `.vf-icon-mask` is `background-color: currentColor` masked by an icon's alpha,
  so a 404 could plausibly have left the background unmasked and painted a solid coloured square where
  an icon should be. Measured instead of assumed — screenshot each case and count pixels, because
  `getComputedStyle` reports the same `background-color` and the same `mask-image` either way:

  | mask URL | red pixels | white |
  |---|---|---|
  | a real icon | 24% | 41% (plus 35% antialiasing and the 20% duotone tone) |
  | a 404 | **0%** | **100%** |

  So an icon name that does not resolve degrades to invisible. Two things needed for that measurement
  to work at all: `javaScriptEnabled: false`, because React re-renders and wipes anything
  `setContent` put on the page; and navigating to an HTML page first, since `setContent` throws
  `Only HTML documents support open()` on an SVG response.

Playwright will happily measure the wrong thing and report it as a pass.

- **A Playwright probe can lie.** A DOM-walk that reported "event not on listing" was wrong; the
  event was there. Assert on something you have independently confirmed (curl the HTML, query the
  DB) before concluding a feature is broken.

- **A Playwright probe that never logged in reports every page as broken.** `waitForURL('**/admin**')`
  matches `/admin/login`, so the probe sailed on unauthenticated and read the login form's two
  inputs as "the create form is empty" — the exact signature of a real past bug. Wait for a URL that
  *excludes* `/login`, and assert something only an authenticated page has.

- **The site has no `<header>` element** — the masthead is `<nav class="site-nav">`, and the footer is
  `footer.site-footer`. `playwright.config.ts` now sets `baseURL`, so specs can use `page.goto('/')`.

- **A click on a visible, stable element can be silently dropped before hydration.** Playwright's
  actionability checks pass — the button is there and not moving — but React has not attached its
  handler, so nothing happens and nothing errors. `admin.e2e.spec.ts` clicked the **Content** tab,
  never switched panes (`activeTab: "Hero"`, `hasLayoutField: false`), and went on to count the
  *Hero* tab's fields: 3 rich-text editors against an expected 6, which reads exactly like a page
  that lost its converted fields. Waiting 30s for the tab to activate does not help — there is
  nothing in flight. Retry the click until the state changes (`expect(async () => { click; assert
  })` `.toPass()`). **A `waitForTimeout(300)` had masked this for months**, by giving a later
  re-render time to land, so the counts were right for the wrong reason; when the admin slowed the
  mask slipped, and raising the sleep to 1500ms "fixed" it and would have hidden the cause again.

- **Hover measurements need the pointer parked somewhere harmless first.** Playwright's mouse is
  stationary while `scrollIntoViewIfNeeded` moves the page underneath it, so the element you are
  about to measure "at rest" can already be hovered. That read the same transform for rest and hover
  and made a positive control pass while proving nothing. `page.mouse.move(4, 4)` before every
  resting reading.

- **Read the DOM after the page has settled, and pick a control that arrives on the same schedule.**
  A link audit that checked fragments at `domcontentloaded` reported **65 dead anchors**. All 65 were
  false positives: `ArticleToc` assigns article heading ids on mount, and other sections stream in.
  The control used — `#main-content` — is in the root layout and present in the first byte, so it
  passed in exactly the runs that were wrong. Re-checked with `waitUntil: 'load'` and polling:
  **0 dead of 202**. Prefer `waitForFunction` over a fixed delay; a fixed delay is wrong in both
  directions — too short then, flaky under load later.

- **`page.goto(url + '#frag')` when the page is already on `url` is a *same-document* navigation.**
  No request is made; the browser scrolls the document it already has, fully hydrated. A test that
  reads the TOC on a page and then "navigates" to one of its fragments is therefore measuring the
  hydrated page, not a fresh load — it went green against the unfixed code. Give every state its own
  `browser.newPage()`.

- **`javaScriptEnabled: false` is the strongest available proof that server HTML is doing the work,
  but `waitForFunction` does not work in it.** Playwright implements in-page polling with a script
  the page runs; `page.evaluate` still works, because that goes over CDP. So poll from Node with
  repeated `evaluate` calls. Related: `document.fonts.status` is `'loading' | 'loaded'` — there is no
  `'complete'`, and a settle predicate that waits for one never fires, then silently reads whatever
  was on screen when the timeout hit.

- **`parseFloat('auto')` is `NaN`, and `NaN` fails every comparison silently.** Deleting
  `scroll-padding-top` to prove the deep-link guard red made it fail — with *"no article heading sits
  below the fold"*, because the candidate filter compared against `NaN`. True, and it named nothing.
  Where a computed style can be a keyword, assert it is a usable number **as its own precondition**,
  with the raw string in the message.

- **Playwright's `click()` waits for the element to be stable, so a "rapid click" test is not rapid.**
  The regression spec for the carousel above was written first and **passed against the broken
  component** — inside a track under a 0.55s transform transition, actionability checks made each
  click wait out the animation, so the burst arrived slower than the bug needs. `{ force: true }`
  skips those checks and it went red immediately, naming the exact position. Same family as the
  probes already recorded here: a check that quietly does something gentler than the thing you meant
  to test reads exactly like a check that found nothing wrong.

- **A carousel that recovers only in `transitionend` has no recovery once clicks outrun the
  transition.** `SlideCarousel` tracked an unbounded `pos` and snapped the clone back only when
  `onTransitionEnd` saw exactly `count + 1` or `0`. Rapid clicks keep restarting the 0.55s transform,
  so the event does not fire until the LAST click settles — by then `pos` is past the end and matches
  neither branch. Measured on `/events`: 8 fast clicks left the track at `translateX(-9702px)`,
  position 9 of a 6-card track, with **no slide in the viewport**. The tell is that it reads as a
  rendering bug: the dots kept highlighting, because the active dot is computed with modulo, so it
  looked like a working carousel that had lost its content. Bound the position at the point of
  *change*; a recovery keyed on exact values is not a bound. `FeaturedArticles` was unaffected — it
  advances with `(c + 1) % count`.

<a id="i52"></a>

## An inline style defeats every media query, so a responsive rule can be dead

**A `@media` rule that reads correctly, sits in the right file and matches the right selector can
still never once apply.** globals.css had
`@media (max-width: 960px) { .audience-gateway-grid { grid-template-columns: 1fr } }` — and the
homepage rendered **three 98px columns on a 390px phone**, because
`src/blocks/GatewayCards/Component.tsx` wrote `style={{ gridTemplateColumns: … }}` on the element.
Inline styles beat every stylesheet declaration, media queries included. Anyone reading the CSS would
conclude mobile stacking worked; it had never worked, on any phone, since the block shipped.

**The corollary that catches the obvious fix:** an inline *custom property* wins too. Nine blocks set
`style={{ '--vf-cols': n }}`, so `@media { .x { --vf-cols: 1 } }` cannot override them either. The
media query has to set `grid-template-columns` **directly**.

**And a third:** those grids are also targeted by `.spec-grid[style*='--vf-cols']` (0,2,0), so a
plain-class mobile rule (0,1,0) loses to it regardless of order. Match the specificity.

The check is never "is the rule in the file". It is `getComputedStyle` on a real element at a real
viewport width. Three separate page-scoped workarounds for this same grid family already existed in
globals.css (10793-10800, 9455-9468) — each one added because the shared rule "didn't work", none
diagnosing why. Guarded now by `tests/e2e/responsive.e2e.spec.ts`.

## `pnpm dev` and a desktop-only test suite cannot see a responsive fault

`playwright.config.ts` defined exactly one project — `Desktop Chrome`, 1280×720, DPR 1 — so no test
had ever loaded a page at a phone or tablet width. Four faults shipped green on 2026-08-25: grids that
never collapsed, a carousel that cropped 37.5% of a photo on mobile against 21.6% on desktop, a
masthead that overflowed by 167px between 769 and 1024px, and a drawer that flattened 28 links.

Two specific traps inside that:

- **A fixed height plus a viewport-relative width is a crop that changes with the viewport.**
  `.expert-avatar { height: 200px }` against `.expert-card { flex-basis: 82vw }` meant the photo box
  grew wider on a phone without growing taller, and `object-fit: cover` ate the difference. An editor's
  `zoom`, tuned against the desktop framing, then multiplied on top. Use `aspect-ratio` for anything
  cropping a photograph, and pick the ratio the desktop already renders so the change is a no-op there.
- **`overflow-x: clip` on `html` hides the evidence.** It was added as a backstop while fixing the
  masthead, and it made `responsive.e2e.spec.ts` unable to go red on the defect it was written for —
  proven by reverting the header breakpoint and watching the test still pass. A clipped element is a
  silently broken layout. It was removed.

Also: `computedSnapshot.mjs` keys nodes by **structural index path**, so inserting one DOM element
(here, the nav's accordion `<button>`) renumbers every later sibling and reports them all as changed
with `after: undefined`. That is not a style regression. Check whether any node *outside* the changed
subtree moved — on this pass, zero did.

<a id="i55"></a>

## `stroke` on a filled icon, and other rules that read correctly and do nothing

**A Phosphor icon in this repo is DUOTONE and filled** — `<svg fill="currentColor">` with two paths
and no stroke geometry. A `stroke:` declaration on it is applied and paints nothing. The gateway cards
carried `.card-accent-{1,2,3} .audience-card-icon svg { stroke: … }` for three accents; all three were
dead, so every icon inherited `#414042` from `body` and sat at **2.92:1** on the blue tile and
**2.02:1** on the grey ones, under WCAG 1.4.11's 3:1 for graphics. The reference declares BOTH halves
(`svg { stroke }` for its inline SVGs *and* `i { color }` for its webfont glyphs); only the `color`
half maps onto our renderer, and the port kept the wrong one.

Colour the **container**, with the same token the neighbouring text already uses, so the two cannot
drift. `.ct-info-item-icon` had already solved this and said so in a comment — the gateway rules were
the one place contradicting it.

<a id="i54"></a>

## The `.my-16` wrapper: two ways it costs 64px

`RenderBlocks` wraps every block NOT in `selfSpaced` in `.my-16` (64px top and bottom). That is right
for a block with no banding of its own and doubles up on one that bands itself.

- **A block that renders `null` still gets the wrapper.** `/in-the-loop` seeds six Archive blocks and
  five match no posts, each emitting `<div class="my-16"></div>` — 174px of dead white above the first
  heading, 110px once `.my-16:empty` collapses them.
- **A band that supplies its own padding gets both.** The IME claim-types FAQ has 72/80 of its own plus
  the wrapper's 64/64: 152px of white above the next section's heading, 88px after — which is that
  section's own padding and nothing more.

**`selfSpaced` is NOT a safe blanket fix, and this is the trap.** A block's padding may be conditional:
`.vf-faq` has **no base padding at all** — IME's comes from the page-scoped `.ime-claim-faq`, while
**/jme's top-level FAQ measures 0 and depends on the wrapper** — and `.ni-section`'s padding arrives
through an editor-chosen `cssClass`. Adding either to `selfSpaced` strips their spacing elsewhere.
Decide membership by **measuring the block's own computed padding on a real page**, never by reading
its source.

Which is the third lesson here: `grep '<Section' Component.tsx` **also matches `<SectionHeader` and
code comments**. That false positive put two blocks on a fix list they did not belong on; the positive
control that caught it was noticing `gatewayCards` — which IS in `selfSpaced` — being reported as
missing.

## Taxonomy-before-content in `payload.config.ts` is a convention, not a requirement

Invariant 12 carries two rules in one array: the admin sidebar's group order comes from array order,
**and** "taxonomy lookups [must be] ahead of the content referencing them". The second half reads like
a schema constraint and is not one.

Measured 2026-08-25: `Events` is registered at line 138, and already relates to `locations` (:151),
`media` (:163), `specialists` (:159) and `team` (:160) — four collections registered *after* it — with
no ill effect. Adding `event-types` at :149, also after `Events`, produced **zero** FK drop/recreate
churn on boot (`grep -icE 'drop constraint|recreat' .dev.log` → 0).

So order the array for the sidebar, and do not contort it to put a lookup ahead of its consumer. The
constraint that IS real is the identifier-length one (invariant 39).

## A hook that throws a plain `Error` tells the editor nothing

Payload turns `throw new Error('…')` in a `beforeDelete` into a 500 whose body is the generic
**"Something went wrong."** — measured against `/api/event-types/:id`. The guard works and the delete
is refused, but the editor is told only that it failed, not that four events depend on this type or
what to do next, and the real message reaches the server log where nobody is looking.

Throw `APIError(message, 400)` instead; the text then reaches the admin. `Departments.ts` still uses
the plain form and has the same weakness.

## Writing a guard that can actually fail

**The orphan-field guard is keyed by BARE FIELD NAME across the whole repo, so a dead field hides
behind any same-named live one.** `readsField` in `adminControls.int.spec.ts` runs one regex over a
single concatenated blob of `src/{app,components,blocks,heros,utilities,search,Footer,Header,plugins,
collections,hooks}`. A match *anywhere* satisfies the field for *every* collection at once.
`AvailabilitySessions.location` was read by nothing and the guard was green throughout, because
`event.location` (ArchiveBlock, EventsExplorer), the PeopleGrid `location` filter and plain
`window.location` all match the same pattern. The field shipped as an editable rich-text control that
reached no page, on a collection an editor uses weekly.

The same keying makes an `ALLOWED_UNREAD_CONFIG` exemption blunt: one entry silences that name on
every collection. Before adding one, check how many configs declare the name — `notes` is declared
only on AvailabilitySessions, so its entry is precise, whereas an entry for `location` would have
blinded Events and PeopleGrid too. The honest fix when a name is shared is to delete the dead field
rather than exempt it. Verified 2026-08-25 by grepping the haystack for each of the four `readsField`
shapes with a positive control (`startTime`, which must hit).


A guard that has never failed is not evidence. These are the ways one silently cannot.

- **`pnpm lint` / `pnpm test:e2e` had both been broken for months** — lint crashed on a config shim,
  e2e asserted the Payload template's title. A suite that has never run is not a passing suite. Both
  now run in `pnpm test`; keep it that way.

- **Assert both states of a two-state behaviour, or the guard passes on the degenerate one.** The
  skip-link test checked only "on-screen when focused" (`top >= 0`) — trivially true of an unstyled
  element sitting statically at the top of the page, so it went green while the link was visibly
  broken on every page. Adding the other half — offscreen *before* focus — is what makes it fail.
  Same shape as the orphan-field guard: a check that only looks at the "working" end of a behaviour
  cannot distinguish working from absent.

- **Run a new guard against something that is deliberately fine before trusting it.** Proving a guard
  goes red on a real defect is only half the job; the other half is proving it stays green on a
  lookalike. The first heading-wrap guard compared each title's natural width against the nearest
  `.container` and reported `/services` as broken — that header is `display: grid`
  (`.svc-admin-split`), so its title correctly occupies a 620px track of a 1132px container. Acting
  on that would have "fixed" a section that was right. The rewrite states the fault causally
  (neutralise the header's own `max-width`; if a two-line title collapses to one, the header did it
  to itself), which exempts every legitimate case without an allowlist. **Prefer a guard that
  measures cause over one that compares numbers** — the numeric version needs an exception list, and
  an exception list is where the next false positive hides.

- **Breaking one consumer does not prove an orphan-field guard works** if the field has two
  consumers. Pick a field with exactly one renderer (`Offices.hoursNote`), not one with several
  (`Offices.hours`, read by both the Footer and ContactDetails).

- **The orphan-field guard is blind to any field whose name is common across configs.** It joins every
  consumer file into ONE haystack and asks whether `readsField(haystack, name)` matches — deliberately,
  because scoping per collection produced false positives wherever a consumer reaches data through a
  helper. The cost is that a field called `icon` can never be reported: **27 files** in `src/blocks`,
  `src/components` and `src/heros` contain a `.icon` property read, so the pattern is satisfied no
  matter what. Measured consequence: `Accreditations.icon` was declared, described in the admin as
  driving "the profile chips", and read by **nothing** — the specialist profile hardcoded `seal-check`
  — and the guard was green throughout. The same hole covers `title`, `description`, `link` and any
  other shared name. When adding a field with a common name, check its consumer by hand; the suite
  will not do it for you.

- **One field name serving two purposes in one component makes the orphan guard blind to both.**
  `PeopleGrid` reads `department` twice: the block's own filter (which documents it) and each team
  member's `department` (which groups them). Deleting the filter read entirely still **passed** —
  `readsField` only asks whether *something* in that file reads a property of that name. Measured; it
  is the common-name hole CLAUDE.md already records for `icon` and `title`, now in a form where both
  reads live in the same file. The filter was proven by hand instead, which is the only way: setting
  it to Client Support took Meet the Team from four groups to one of four cards, and unsetting it
  restored all four. When a block field shares a name with the record field it filters on, check it in
  the browser and do not trust the suite.

- **A comment that names a removed field in `object.property` form re-arms the orphan guard's blind
  spot.** `readsField` (`adminControls.int.spec.ts`) deliberately matches member access rather than a
  bare word, and it does not know what a comment is — so writing *"`labels.roleLabel` went with it"* in
  the very JSX comment explaining the removal made the field look consumed. Measured: re-adding
  `roleLabel` to `TeamSettings` with nothing rendering it **passed**. Reworded to avoid the dot form,
  the same break fails and names the field. The guard's own header warns that a comment can satisfy a
  bare-word match; this is the same hazard surviving the fix that was supposed to close it. Write
  removed fields as prose ("the Role label in Team Settings"), and re-run the break after editing any
  comment near a guard.

- **A control has to be the thing you meant to test.** Checking that the new `headingWeight` field
  had not leaked, `/for-clients`' first `.section-title` measured **800** — apparently a site-wide
  leak. It was not: that heading is a `.vf-split__title` inside `.vf-client-overview`, which has
  carried its own 800 since it was ported, and `document.querySelectorAll('.vf-headings--heavy')`
  returned **0** on that page. A control selected by `querySelector` position rather than by the
  property under test will eventually select something with its own reason to differ.

- **A two-state control proven on a page that lacks the content proves nothing.** The dot-bullet
  variant was first verified on `/services`: the modifier appeared, and "the default ticks are gone"
  passed. Both were true and worthless — only `reporting-services` and `/style-guide` have any
  bullets at all, so the tick count was zero before the change too. Re-pointed at `/style-guide`,
  where it goes **5 → 0 → 5**, the assertion has content. (**`/style-guide` was removed on
  2026-08-20**, so `reporting-services` is now the only page with bullets and the only place this
  can be proven; the lesson stands, the second control does not.) This is the positive-control rule again in
  its most seductive form: the check *did* find the page, *did* find the section, and still measured
  an empty set. Assert a non-zero count in the "before" state, or the "after" state means nothing.

- **A break that stays green is a result worth recording, not a failure of the exercise.** Widening
  the testimonial fix to `.vf-card:hover` did not fail its guard, and should not have: the gateway
  card's own unlayered `:hover` is declared later at equal specificity, so nothing regressed. Write
  down what each attempted break *did*, including the ones that did nothing, or the next person
  re-derives it — and knows which failure the guard actually covers.

- **A break that behaves differently from the way you wrote it up is the finding.** The deep-link
  guard's comment claimed that restoring `ArticleToc`'s mount loop would sneak past the browser
  measurement, so the server-HTML and no-JavaScript checks were what caught it. Measured, it does
  not: an id assigned on mount produces no jump at all, so every step goes red. The comment now says
  what happened, and gives the checks' real justification (breadth, and foreclosing a *future* JS
  corrector). Run your break; do not narrate it.

## Writing a guard against a stylesheet: CSS-shaped text inside a COMMENT

A guard that reads `globals.css` as text has been fooled three separate times by CSS that is not
CSS, because it sits inside a `/* … */`. All three were silent, and two of them produced a *false
green* rather than a false red — the worse direction.

- **`CSS.indexOf(':root')` does not find `:root`.** The file's first `:root` is at **line 48**, inside
  a comment in the `@theme` block, 29 lines above the real one at 77.
- **`CSS.indexOf('}', CSS.indexOf('--radius'))` does not find the end of `:root`.** It finds the `}`
  in `body { font-size }`, in another comment, ~57 lines short of the real close.
- Between them, `richTextColors.int.spec.ts` sliced lines 48–239 and called it "`:root`". It had
  been green for months. The cost surfaced only when three palette entries were pointed at
  `--form-error`, `--callout-success` and `--callout-warning` (lines 287/290/291) and all three
  reported **"is not declared in `:root`"** while sitting plainly in it. Starting the slice inside
  `@theme` was the false-green half: an unanchored token search could have resolved a `@theme`
  declaration in preference to the `:root` one.
- The same week, the comment introducing the on-dark re-points — which quotes
  `` `.vf-section--primary .vf-accent` `` — was enough to make an unrelated rule look like a second
  `.vf-tc-* .vf-accent` selector list, so the matcher found two, gave up, and returned empty. Every
  membership assertion built on it then failed with a confusing message.

**Blank the comments once, up front, keeping the length so nothing else shifts:**

```js
const CSS_CODE = CSS.replace(/\/\*[\s\S]*?\*\//g, (m) => ' '.repeat(m.length))
```

and do every structural match against that. Cheaper than making each regex comment-aware, and it
cannot be forgotten in one place. Then **assert the slice itself** — that it starts where you think,
contains the block's first and last declaration, and does *not* contain something from the block
next door. That check goes red on the old slicer with no manufactured break, which is its own proof.

## `computedSnapshot.mjs` is NOT deterministic on `/about`

Its header says a diff is "a real bug, not a tolerance". That is true of the colour and token
properties it was built for, and **not** currently true of the layout properties added later.
Measured: capturing a baseline and immediately comparing it against the *same unchanged code* four
times in a row gave **2, then 3, then 0, then 0** changed nodes. The moving values are
`marginLeft`/`marginRight` on a `SECTION > DIV` on `/about` and on a team profile, flipping between
`0px` and `130px` — an `auto` centring margin resolving against a parent whose width has not settled
when the snapshot is taken.

So a non-empty diff is **not** by itself evidence. Before believing one: re-run it two or three
times, and check *which property indices* actually differ. A diff confined to indices 30/31 on those
routes is this. A diff on index 0 (`color`), or on any node outside them, is real. Do not "fix" it by
widening a tolerance — the instrument needs a settle, not a threshold.

## CSS, the design reference, and the diff tools

The largest group, because this is where a clean report most often means the instrument missed it.

- **The design reference declares most rules twice, and the copy that renders is the page's inline
  `<style>`, not the linked sheet.** `assets/css/styles.css` loads first; each page then redeclares
  what it needs in a `<style>` block at equal specificity, which therefore wins. Porting from the
  shared sheet gives you a value the reference does not render: `.page-hero h1` was "aligned" from
  800 to 700 that way, on 59 pages, and the change was written up as a *correction*, which is what stopped anyone re-checking it. Two further consequences —
  a browser reading of the reference over `file://` only measures the inline half, because the
  sheet is linked root-absolute (`/assets/css/styles.css`) and silently fails to load, so anything
  from the shared sheet reads as an unstyled default; and a guard should compare against the value
  parsed out of the reference *page*, never a number copied into the test, or the port's mistake
  just moves into the assertion. The sweep for others is done: parsing all three sources and
  diffing every declaration found **exactly two** cases, `.page-hero h1` and `.contact-form`
  padding — don't redo it from scratch.

- **A structural match is not a visual match, and reporting one as the other is how a whole page
  ships wrong.** `/events` was rebuilt, verified, and reported as matching the reference. The check
  compared the `h1` string and the list of `h2` headings — it found four slide titles out of four and
  stopped. Never measured: hero alignment, type scale (60.8px/800 against the reference's 52.8/700),
  section background, card design, and every slide *body*, which were paraphrases from the showcase fixture
  (`seedShowcase.ts`, since deleted — that authoring now lives in the per-page modules under
  `src/endpoints/seed/`).
  Three rounds of "you missed something" followed, each finding another by eye. Spotting differences
  does not converge; enumerating them does. `node tests/visual/referenceCssDiff.mjs <family>` parses
  every declaration on both sides and prints a count that has to reach zero — and it caught two things
  no amount of looking had: a `::before` drawing a 24px dash before an eyebrow the reference hides, and
  a literal `20px` the radius codemod had rewritten to `var(--radius)` (0.5rem here, 8px there) despite
  those codemods being documented as value-preserving.

- **`node tests/visual/computedSnapshot.mjs` is keyed by structural index path, so any content change
  invalidates the baseline.** Running the seed as part of a verification pass destroyed a comparison
  that had been captured beforehand. Capture/compare *before* seeding, or recapture after.
  A handful of sub-pixel `matrix(…)`/`opacity` diffs are scroll-reveal animation frames, not
  regressions — same node count and only transform/opacity differing is the signature.
  **Its printed diff truncates** (`…and N more`), so "which routes changed?" cannot be answered by
  eyeballing or `grep`-ing the output — a `uniq -c` over the visible slice reported two routes when
  seven had moved. Read `tests/visual/__snapshots__/<name>.json` and count keys directly; the route is
  the substring before the first space. And when adding a route to `ROUTES`, add it **before**
  capturing the baseline, or the new route has nothing to compare against and reads as clean.

- **A harness silently covers less than it claims.** `computedSnapshot.mjs` listed two routes that do
  not exist (`/about-verify`, `/legal/privacy-policy`); both 404, `capture` never checked status, so
  it banked the not-found page as a baseline **twice** — 178 nodes each, an identical count, which is
  the only reason it was noticed — while two real pages went unmeasured. It now refuses any non-200.
  Whenever a checker takes a list of inputs, assert the inputs resolve; a tool that quietly measures
  the wrong thing reads exactly like a tool that found nothing wrong.

- **`computedSnapshot`'s `ROUTES` is a claim about coverage, and it was wrong about `/events`.** It
  listed `/events` but neither `/events/upcoming-events` nor `/events/past-events` — the two pages
  whose rows a reader would assume it covered. Both added before capturing the baseline, per the
  rule already recorded; a route added afterwards has nothing to compare against and reads as clean.
  Worth noting their rows render **client-side**, so `curl | grep` finds zero `.event-list-row` on a
  page that has eight — `networkidle` plus the harness's settle does capture them (verified: 90
  article nodes), but any check on these pages must drive a browser.

- **`computedSnapshot.mjs` reports one differing node on two routes with the code unchanged.** Measured
  2026-08-20: three captures of the same tree, and `.vf-section__inner.container` on
  `/information-centre/for-clients` and `/for-claimants` flips `marginLeft`/`marginRight` between
  `0px` and the used `130px` — same node count, same `width`, direction reversing between runs. Probed
  directly at rest it is never `0px` (6 containers, 3 loads, both pages), so it is transient during the
  harness's own scroll-and-settle. Different signature from the `matrix(…)`/`opacity` reveal frames
  already recorded, and worth knowing before chasing it: **a one-node diff of that shape is noise**.
  Establish it the same way — capture twice without changing anything and diff the two; doing exactly
  that during the /contact note move reproduced the `/for-clients` node flipping back on identical
  code. **`/about` shows it too** — seen once, same node shape and the same `130px`↔`0px` pair — so
  the route list here is the set observed, not a closed one.

- **A computed-style comparison only covers the properties you thought to list.** After unifying the
  events date glyph, a 10-property check reported the hub and the listing rows **identical** — and a
  screenshot showed "20 AUG" on one and "20 Aug" on the other. `.event-card-media` sets
  `text-transform: uppercase` and `letter-spacing: 0.1em`, both of which **inherit**, and
  `.cal-day`/`.cal-month` redeclare neither, so the difference lived entirely outside the list.
  Measured 56.0px against 47.5px for the same month. Same family as the `font-weight: unset` trap:
  when a ported element sits inside a differently-styled parent, enumerate the *inherited*
  properties — `text-transform`, `letter-spacing`, `font-weight`, `color`, `line-height`,
  `text-align` — not just the ones either rule declares.

- **A declaration diff is blind to a property neither side declares.** `referenceCssDiff.mjs`
  reported **zero** for the events family while four headings rendered at `font-weight: 400` against
  the reference's 700. The reference omits the weight and inherits the browser's `h2 { bold }`; the
  `@layer base` block at the top of `globals.css` resets `h1…h6` to `font-weight: unset`, which for
  an inherited property means *inherit*, so a faithful port of that omission takes the body's 400
  instead. Identical stylesheets, different rendering, nothing for the diff to see. Whenever a port
  relies on the reference's defaults, **measure the inherited properties in the browser** — weight,
  size, colour, alignment — because that is exactly where a clean diff lies.

- **A tool that treats `@layer` like `@media` is blind to whatever is inside it.** `referenceCssDiff.mjs`
  collected `@layer` rules into the media bucket, which it never compares — so every rule in
  `@layer components` (`.vf-section`, `.vf-split__icon`, …) was reported as **absent from the build**
  while sitting in the file. A cascade layer is not a conditional group: its rules apply at every
  viewport, they only lose priority ties. Fixed; the events family still read zero afterwards, so
  nothing had been resting on it. The general shape: when a checker buckets rules by at-rule, check
  which at-rules are *conditional* and which merely reorder.

- **A diff family's zero is scoped to its `match` regex, not to the page it is named after.** The `ime`
  family matches `/^\.ime-format/` and `jme` matches `/^\.jme-process/`. Both read zero for months while
  a *second* section on each of those same two pages — the `.ime-claim-*` and `.jme-faq-*` accordions —
  was covered by nothing at all, and there was no Information Centre family in existence. So "the `ime`
  family is zero" was repeatedly read as "the /ime page is right". Measured once the families existed:
  15 and 13 reference selectors respectively, absent from the build. Before trusting a family, print the
  reference selectors it actually collected and check that against the sections on the page; a checker
  that silently measures a subset reads exactly like one that found nothing wrong.

- **A diff family that reads zero may be measuring almost none of its page.** The
  `join-expert-panel` family matched only the enquiry form — **9 of that page's 46 reference
  selectors** — and read zero for months while the section above it shipped unstyled. This is the
  `match`-regex trap already recorded, now with a second instance on a different page, so treat
  "family X is zero" as a claim about a regex and never about a page. Print the selectors a family
  collects and check them against the sections that exist.

- **A declaration diff cannot see which BRANCH of a component renders.** The reference's
  `.event-list-calendar*` rules (`events.css:749-806`) are **dead in the reference** — leftovers its
  JS never uses, since it draws a blue "Event Photo" placeholder on every row. We ported them
  faithfully, which made every declaration match, so the `events` family read zero across **119**
  selectors while the pages rendered a completely different panel from the reference. A family's
  zero says the rules agree; it says nothing about which rule the markup reaches for. Where a
  component picks between two treatments, the guard has to be a rendered-DOM assertion.

- **Before deleting an `!important`, find out which rule it was beating.** One was removed from
  `.svc-admin-split .vf-section-header__subtitle` on the reasoning that the scoped rule already
  outranked `.section-subtitle`. True, and irrelevant: the competitor was
  `.vf-section-header--centered .vf-section-header__subtitle { margin-inline: auto }` — **equal
  specificity, declared 1,600 lines later**, so it won on order. The intro paragraph moved 326px in
  from the left at every width. `SectionHeader` always emits that modifier, which is why the sibling
  `margin-inline`/`max-width` rules in the same block carry `!important` too.
  **`computedSnapshot.mjs` reported the page as unchanged**, because it measured `marginTop`/
  `marginBottom` and no horizontal spacing, padding or position at all — the element's width never
  moved, so a pure sideways shift was outside the instrument. It now records `marginLeft`/`Right`,
  `paddingLeft`/`Right` and `textAlign`; proven by re-introducing the break, which takes it from 0
  changed nodes to 2. Related: `referenceCssDiff.mjs` used to compare `!important` as part of a
  value, so `margin: 0 !important` read as differing from `margin: 0` — which is what made deleting
  it look like closing a gap. It strips the flag now, since it models declarations and not the
  cascade.

- **A comparison tool's skip list is load-bearing, and "verified equal in the browser" expires.**
  `referenceCssDiff.mjs` excluded `margin` and `margin-bottom` from comparison for any selector
  checked under a rename, with a comment saying they were set elsewhere in our cascade and confirmed
  equal. They were not: the reference gives `.admin-header` and `.reporting-header`
  `margin-bottom: 48px`, ours measured **0px and 16px**, and the cards sat flush against the intro
  text on a page the tool had just reported as **zero**. Removing those two from the skip surfaced 11
  real spacing differences on `/services` and one on `events`. The events one was a genuine false
  positive — `margin: 0 0 24px` against `margin-bottom: 24px` — which is now fixed properly, by
  expanding box shorthands into longhands rather than by adding an exception. Two rules follow:
  spacing is precisely what a reader expects a declaration diff to catch, so it must never be
  skipped; and a skip whose justification is a past measurement needs that measurement re-run, not
  re-read.

- **A blanket property skip in a comparison tool is not a reason, it is an unexamined habit — and
  `color` was one.** `referenceCssDiff.mjs` skipped `position`, `z-index`, `overflow` and **`color`**
  for every aliased selector. That is how a *reported* defect survived a family reading zero: the
  /ime "What's Included" label renders brand blue in the reference and rendered `rgb(34,34,34)` here.
  Worse, the skip sat directly above a comment narrating the identical lesson about `margin` — which
  had been removed from that same list after hiding 11 real spacing gaps. Deleting `color` surfaced
  **five** more across three families: one real (the /services placeholder caption, still
  50%-translucent primary against an opaque reference literal) and four token-resolution artefacts,
  each then measured in the browser before being excused. If a checker excludes a property, the
  exclusion needs a per-case reason in `EXPLAINED` with a measurement, never a global list.

- **A `null` in `IMPLEMENTED_AS` deletes a selector from the comparison, so its justification has to
  be true.** `'.ime-format-included-text span': null` carried the comment *"no rule of its own on
  either side; both inherit body type"*. The reference declares three properties on it, and ours
  declared none — the detail descriptions rendered at **18px/30.6px against 12.8px/19.84px**, which is
  why those cards ran far taller than the reference's. The tool cannot check a claim like that; only
  reading the reference can. Treat every `null` mapping as an assertion needing evidence.

- **Map every rule that contributes a declaration, not the one that looks equivalent.**
  `referenceCssDiff.mjs` reported `line-height: 1.75` against the reference's `1.8` while the browser
  correctly measured `1.8`. Not a CSS bug — an `IMPLEMENTED_AS` gap: the reference puts colour, size,
  line-height and margin on one element, ours splits them between a body wrapper and the paragraphs
  inside it, and only the paragraph rule had been listed. The list form exists precisely for this;
  omit a contributing rule and the tool reports a difference that is not there, which trains you to
  distrust it. Cross-check any single reported difference against `getComputedStyle` before changing
  CSS to satisfy the tool.

- **A `var()` with a fallback renders correctly and is opaque to a declaration diff.**
  `border-top: 1px solid var(--vf-faq-rule, #e2e8f0)` computes to the reference's literal in every case
  where nothing sets the custom property, and still reports as differing forever. Where a default exists
  to be compared, declare the literal and let the variants override it — the CSS is simpler *and*
  checkable. The same applies to shorthands: a variant that sets only `border-color` cannot close a
  reference `border-top`, so the variant declares the whole shorthand.

- **A structural difference is not automatically a visual one — but only enumeration can tell you which.**
  The reference hangs its accordion hairlines off the list's `border-top` plus every item's
  `border-bottom`; ours off every item's `border-top` plus `:last-child`. That reads as four differing
  declarations. Walking the DOM and collecting every border with a non-zero width settled it: 10 rules on
  both sides on /ime, one colour, spanning an identical 763px; 6 on both on /jme, same colour, identical
  440px. Count the rendered artefacts before either "fixing" a construction or excusing it — and note
  that the reference used *both* constructions across its own pages, so some family must carry the note.

- **`.prose` has two owners, and each one hides a different half of the bug.** The reference uses a
  plain `.prose` class, ported at `globals.css:4192–4208`; `@tailwindcss/typography` is also enabled
  (`globals.css:25`) and owns the same name. Measured on the event detail page: the body computed
  `max-width: 594.648px` (65ch) and `font-size: 16px` against the reference's **1132px / 18px** — our
  port declares neither property, so the plugin's won unopposed. The legal pages had the same 16px.
  The trap is the obvious fix: our port declares no `font-weight` either, so **every heading and every
  `<strong>` on those pages was getting its weight from the plugin**, and simply dropping the class
  takes the bold with it (`@layer base` resets `h1…h6` to `font-weight: unset` → 400). The event page
  now uses its own `.event-body` scope with weights declared explicitly, as `.art-body` does. Two more
  headings were found at 400 the same way — `.event-presenters__heading` and
  `.art-attachments__heading`, the latter live on the article page too. **When a class name is shared
  with a plugin, read the computed value; the source file cannot tell you who won.**

- **"Visually inert" is not "unchanged", and only the snapshot knows the difference.** A new variant's
  whole claim was that it moves no other page. `.vf-split__media--placeholder { flex-direction:
  column; gap: 12px }` was written unscoped on the reasoning that stacking a *single* child does
  nothing — which is true, and it still moved `row-gap` from `normal` to `12px` on six boxes across
  `/`, `/about`, `/services` and `/ime`. Gating it on `:has(.vf-split__placeholder-icon)` took the
  compare down to the one intended route plus the usual `/in-the-loop` scroll-reveal frame. Reason
  about the *selector's* reach, not the rendering's; "it looks the same" is not the claim being made
  when you say a default changed nothing.

- **The reference's `:first-child` is rarely our `:first-child`.** Its rows sit in a dedicated
  `.rs-services-rows` wrapper; ours are siblings of the section header inside `.vf-section__inner`,
  so `:first-child` matches the *header* and the first row keeps the rule it was supposed to lose.
  `:first-of-type` fails identically — both are `div`. The working form is the adjacent sibling:
  `.vf-section-header + .vf-split`. Whenever a ported rule depends on position, diff the two DOM
  shapes before trusting the selector; the CSS is valid either way and simply matches nothing.

- **A shared "tidy the last child" rule will close a gap the reference is relying on.**
  `.vf-split__body p:last-child { margin-bottom: 0 }` exists to stop trailing space. On a row whose
  body is a *single* paragraph, that paragraph is both first and last — so the reference's 20px
  below the description, which is what separates it from the "When to Request" label, computed to
  **0px**. The fix is to not re-declare the zeroing inside the scope that needs the gap. Before
  porting a spacing value, check whether a `:last-child`/`:only-child` rule upstream will eat it.

- **A BEM parent class can be absent while all its children are present, and the page still looks
  right.** `/contact`'s portal card renders correctly, and `.ct-portal-card` — the *bare* class —
  never reaches the DOM at all; only `__head`, `__label`, `__text`, `__btn` and `__features` do. So
  the three rules scoped to `.ct-page .ct-portal-card` (globals.css 9182, 9201, 9202) are dead, and
  were invisible because a *separate* live rule (`.ct-enquiry-grid .ct-portal-card__btn`) already
  supplies the same treatment. Checking for `ct-portal-card` with a substring grep says "present" —
  every child class contains it. Split the class attribute into a set and test membership, and keep a
  child class as the positive control. Note the fix is not simply to add the parent class: the dead
  rule sets `margin: 12px 0 4px` where the live one sets `margin-top: 12px`, so restoring it would
  move the page.

- **The reference does not always render what the reference declares.** `/services` has
  `<i class="ph-duotone ph-activity">` above a heading, with CSS for it — and draws nothing, because
  `ph-activity` is not in Phosphor's duotone set. Measured: `width: 0, height: 0`, `::before` content
  `none`, while a sibling `.reporting-card-icon i` on the same page resolves to a real 24px glyph, so
  the webfont had loaded and only the name was wrong. Ours drew one because Phosphor **React** has
  `activity`. Before porting or removing something on the strength of a screenshot, check whether the
  reference is *expressing* an intent it failed to execute — and say which of the two you are matching.

- **Before porting a value the reference declares, count how many of its 108 pages declare it.**
  `/specialists/join-expert-panel` sets `.section-title { font-weight: 800 }` in its inline block;
  every other reference page renders the shared sheet's 700, which is what globals.css declares.
  Changing the global to close a one-page diff is the `.page-hero h1` mistake — that one moved 59
  pages and was written up as a *correction*, which is what stopped anyone re-checking it. One
  `grep` over all pages answers it; here it returned exactly one file, so the fix was a block field
  (`headingWeight`) rather than a global edit.

- **Verify at the layer the visitor sees.** Two Custom Styles presets were in the database and the
  REST API returned all 27, while the served page still had 25. The database being right proves
  nothing about the page — that gap was the caching bug in the Invariants table.

- **A subagent's "dead code" verdict is a candidate, not a finding.** `.who-image-main` was reported
  dead; it is live in `WhyVerify/Component.tsx`, and deleting it would have broken a page.

## Content, the seed, and stored data

Content lives in the database, so a code edit alone changes nothing on an existing install.

- **A seed step that writes a page's layout BEFORE that page's authoring module runs silently
  disables the fixture — and only on a fresh install.** `seedVerify` used to place the contact form
  itself, guarded on `isPlaceholderLayout`. It ran ~12 seconds before `seedInfoBooking`, replaced the
  scaffold placeholder with a lone `formBlock`, and so made `isUnauthored` false: the real fixture
  logged *"contact already authored, skipping"* against a database ninety seconds old. Measured on a
  clean reseed — **/contact ended with 1 block instead of 13**, no portal card, no contact details,
  no map, **zero `cssClass` rows**, which in turn left `repairPortalEnquiry` with no
  `ct-portal-card__btn` anchor and made *it* a silent no-op too. An incrementally-grown database hides
  all of this, because the page was authored before the ordering existed; `links.e2e.spec.ts` caught
  it only after a wipe. **The box is a fresh install, so this would have shipped.** The pattern occurs
  three times and only one was a bug: `for-claimants` already worked around it with
  `authorPageReplace`, and `specialist-availability` is benign because the early build and the fixture
  are the same single block — so check whether the two layouts actually differ before "fixing" the
  next one.

- **A page-scoped `cssClass` is stored data, so CSS written against one is unreachable until a repair
  puts the class in the database.** `/specialists/join-expert-panel` had a complete, correct port of its
  enquiry band — the 1fr 1.5fr grid, the left-aligned intro, the form promoted to a card — hung off four
  `vf-join-eoi*` classes that a seed fixture set and `authorPage` never delivered. Measured: **zero**
  `cssClass` rows for that page, no `vf-join-eoi*` class in the served HTML, and ~110 lines of dead CSS
  while the page shipped centred and uncarded. One of the five selectors was single-hyphen against a
  BEM double-underscore fixture and could not have matched even with the data present. This is the
  strongest argument for the "prefer a block variant over a page-scoped class" rule above: a **field
  travels with the block**, and cannot be silently absent. When you do find CSS that renders nothing,
  check whether its hook is stored data before assuming the selector is wrong.

- **A page-scoped `cssClass` can fail the same way twice on the same page, directly beneath the
  comment warning about it.** `/specialists/join-expert-panel` had its enquiry band rebuilt as block
  fields precisely because four `.vf-join-eoi*` classes never reached the database — and the block
  immediately below that write-up was hung off `.vf-join-benefits`, which never reached it either.
  Measured: **65** `cssClass` rows sitewide, **zero** for that page, so ~50 lines of correct CSS were
  dead and the cards rendered the bare `.service-card` — icon tile, left-aligned text, the
  neo-brutalist diagonal hover — against a reference that is centred, plainly iconed and gently
  lifted. The user reported three separate faults; there was one cause. A sitewide audit
  (`pages_texts.path LIKE '%cssClass%'` against every class the fixtures set) found it was the last
  one. **When a fix "does nothing", check whether its hook is stored data before re-reading the CSS**
  — and note the audit needs both lists sorted, since `comm` on unsorted input silently reports
  garbage (caught here only because the positive control `ct-page` failed).

- **A form-builder `fields` override REPLACES arrays, it does not extend them.** The plugin merges with
  `deepMergeWithSourceArrays`, whose documented behaviour is *"arrays in the target are replaced by the
  source's"*. Passing `{ fields: [placeholderField] }` to `formBuilderPlugin({ fields: { text: … } })`
  would wipe each block's real fields — name, label, width, required — and leave only the addition.
  Append inside `formOverrides.fields` instead, where you can map over the built blocks without
  restating anything the plugin already defines.

## Retiring a Lexical `TextStateFeature` value DELETES it from stored documents

Adding a colour to `BRAND_TEXT_COLORS` is free — no column, no migration. **Removing one is not**,
and both halves of the mechanism are in `node_modules`:

- `registerTextStates` (`@payloadcms/richtext-lexical/…/textState/textState.js`) compiles
  `parse: value => typeof value === 'string' && Object.keys(stateValues).includes(value) ? value : undefined`
  — so a stored key no longer in the palette parses to `undefined`;
- `NodeState.toJSON` in `lexical@0.41` then runs
  `if (stateConfig.isEqual(v, stateConfig.defaultValue)) delete state[stateConfig.key]`, and that
  default **is** `undefined`.

The next time an editor opens and saves a document containing a retired colour, the key is removed
from the stored JSON. Rendering degrades gracefully either way — `colorClass()` returns `undefined`
and the text renders uncoloured — which is exactly why this is invisible: the page looks the same
whether the value is still there or has just been destroyed, and re-adding the key to the palette
will not bring it back.

`richTextColors.ts` and `README.md` §10.19 both used to say stored content was never at risk. That was
written about a Payload *API* change, where it is true, and it read as a general guarantee, where it
is not. Retire a colour only with a repair that rewrites the affected nodes first.

## Adding a `select` option races two concurrent Payload boots

`pnpm test:int` boots Payload in more than one test file at once. The first run after adding options
to a `select` field failed one whole file with Postgres **42710** (`AddEnumLabel`, duplicate object):
both boots ran the dev schema push and both tried to add the same new enum labels. The second run
was clean, because by then the labels existed. So: a `42710` on `AddEnumLabel` immediately after a
field change is this, not a broken migration — re-run once before investigating. It cannot happen on
the box, where migrations are explicit and serialised.

## A control that "does nothing" may be losing the cascade, not unwired

The Custom Styles global was reported as doing nothing, and every instinct said orphaned field. It
was not: all 50 blocks that offer a CSS-class picker consume it, `toClassName` is clean, the presets'
CSS genuinely reaches the page, and the `<style>` tag is injected last in the document — the
strongest position available. It still lost, on plain specificity, to the ~11,400 lines of
`globals.css` that were also unlayered, because the ported design-reference rules are scoped two and
three classes deep while a preset is one.

Two things to take from it:

- **"Works on some pages and not others" is a specificity signature.** A wiring fault fails
  everywhere. If a control works on generic pages and dies on the ones with a bespoke port, stop
  looking for the missing `props.x` and compare selector weights.
- **Unlayered beats layered at ANY specificity**, which is why the fix was to put `globals.css`
  inside `@layer verify` rather than to add `!important` to anything. The repo had already met this
  once and cured it for `.vf-tc-*` alone with `!important` — one patient, same disease. Check for a
  general cure before writing a local one.

Related instrument warning: **CSS hot-reload is not reliable here.** Twice in one session the dev
server served a stale stylesheet after an edit — once silently failing an e2e colour assertion, once
returning `DIFF EMPTY` from `computedSnapshot.mjs` for a change that had not reached the browser.
Before believing any CSS measurement, fetch the served chunk and grep it for the rule you just wrote,
with a positive control on a rule you did not touch.

## The HOOKS §6 guard proves a rule exists, not that anything emits it

`adminControls.int.spec.ts` → *"every class in HOOKS.md §6 is emitted somewhere in `src/`"*, failing
with *"documented as a stable hook but nothing emits it"*. Both the name and the message overstate
it. Its walker takes `` /\.(tsx?|css)$/ ``, and `globals.css` lives under `src/` — so **the CSS rule
for a class satisfies the check by itself**. A class that is documented, has a rule, and is emitted
by nothing at all passes.

Measured, not inferred: after adding `.vf-portrait--{square|portrait|tall}` to §6, one entry of the
class map was changed from the literal `'vf-portrait--tall'` to `` `vf-portrait--${'tall'}` `` — the
exact defect the guard is supposed to catch — and all **94** cases stayed green. Restored, still 94.

So when adding a documented hook class, do not treat a green suite as proof the class reaches the
DOM. Check the rendered HTML for it. (`findDeadCss.mjs` is the tool that does care whether the class
is built literally in source — that reason for spelling class maps out is real, and unchanged.)

## A `sort:` on a column nothing writes is not an error — it is arbitrary order

The specialist directory offered Custom / Surname / Given name. Surname worked, the other two were
reported as doing nothing, and the obvious suspicion — an orphan control — was wrong. Every option
had a code branch, the branches were correct, `tsc` was clean and all 286 tests passed. The fault was
that **`firstName` had never been written by anything**: not the seed, not a hook, not the admin.
Measured, `count(*) = 26` and `count(first_name) = 0`. `ORDER BY first_name` over an all-NULL column
is perfectly legal SQL that returns rows in heap order, so the page simply looked unchanged.

The lesson is where to look. For "this sort option does nothing", the first check is
**`SELECT count(col) FROM table`**, not "does the code handle this option" — code review cannot
distinguish a column that is empty from one that is full, and neither can a green test suite. The
same shape applies to any filter or grouping keyed on an optional column.

Two related traps in the same control, both of which made it *look* like more was broken:

- **`_order` was seeded in surname order**, so the Custom option was byte-identical to Surname until
  someone dragged a row. An option that produces the same output as its neighbour reads as broken —
  the same illusion as TRAPS #43, in data rather than CSS.
- **The stored value never reached the page.** Both live directory blocks were saved with
  `sortBy = 'lastName'`, so dragging in the admin could never have changed `/specialists`. Check what
  the *documents* hold before concluding the *code* is wrong: `SELECT sort_by FROM
  pages_blocks_specialist_directory` answered in seconds what reading the block could not.

## A migration that passes locally can be untestable locally

The `editor_controls` migration passed here and failed on the box, and the reason is the whole
lesson: **the local database is schema-pushed, so it already had every enum label the migration was
supposed to ADD.** Running it locally exercised almost none of its statements. The box had the old
enums and had to actually alter them.

Two Postgres rules then bit, and Payload gives no way round either:

- `ALTER TYPE ... ADD VALUE` **cannot run inside a transaction block** before PostgreSQL 12, and
  even on 12+ a label added inside a transaction **cannot be used until that transaction commits**.
  The generated migration added `'hero'` and then did `SET DEFAULT 'hero'` in the same file.
- `runMigrationFile` in `@payloadcms/drizzle` **always** wraps `up()` in
  `initTransaction` → `commitTransaction`. There is no `disableTransaction` flag in Payload 3.85 —
  the runner was read, not assumed.

Reproduced locally once the fixture was right: `ERROR: unsafe use of new value "hero" of enum type
enum_pages_blocks_mission_pillars_background`. The fix is two migrations — labels first, through
`payload.db.pool` so they land outside the wrapping transaction, then everything that uses them in
the next migration's own transaction.

**How to test a migration honestly.** Never against the dev database; it is already at the new
schema, which is precisely why it cannot fail. Instead:

```bash
createdb verify_cms_migtest
DATABASE_URL=…/verify_cms_migtest pnpm payload migrate        # baseline ONLY → the box's real state
```

then assert the fixture is genuinely old (`'hero'` absent, `colors_steel` present) **before**
applying anything, run the new migrations, and finish with `migrate:create` — *"No schema changes
detected"* is the proof the result matches the config. And prove the fixture can fail: run the
original statements as one transaction and watch the error appear. A test that cannot reproduce the
bug cannot demonstrate the fix.

## Images

Seven ways an image is served at the wrong size, cropped twice, or not at all.

- **An invalid `sizes` attribute fails by making the browser fetch the LARGEST candidate, and
  nothing anywhere says so.** `ImageMedia` emitted `(max-width: 1920px) 3840w, …`; `w` is a **srcset**
  descriptor and is not a valid `sizes` length, so the browser discarded the entire list, fell back to
  the `100vw` default and assumed every image spanned the viewport. No error, no console warning, no
  layout symptom — images were merely several times too big. Measured: a **1440×1651** file into a
  **320×367** box on a 4669 KB page. The list was also ordered widest-first, and `sizes` is
  first-match-wins, so the 1920 entry would have won at every viewport even with a valid unit. Read
  the attribute the browser actually receives, and compare `naturalWidth` against the rendered box.

- **`object-fit: cover` on a Next `<Image>` does nothing unless the image is in `fill` mode.** Eight
  photographs sat in their tiles with a band of background showing beneath — box 530×398, image
  530×354 — while `getComputedStyle` reported `object-fit: cover` on the element the entire time.
  Without `fill`, Next emits width/height attributes and the browser sizes by the image's own aspect
  ratio; a `h-full` utility class never gets to apply. And `fill` positions absolutely, so the
  container needs `position: relative` — `.vf-split__media` was `static`, and adding `fill` alone
  would have anchored the photo to an ancestor further up and appeared to change nothing. Two blocks
  already had it right (`WhyVerify`, `LeadershipSpotlight`), which is the fastest way to tell the two
  states apart: compare against a call site that works rather than reading the CSS again.

- **A component that already applies a focal `object-position` must only ever be handed a WIDTH-ONLY
  derivative.** Payload's `square` and `og` sizes CROP — measured, `square` turns a 5246×6016 original
  into 500×**500**, aspect 0.872 → 1.0 — while our person cards crop again in CSS from the editor's
  focal point. Handing over a pre-cropped file crops twice and shifts every face on the site, and it
  would pass any byte or ratio check while doing so. The width-only ladder
  (`thumbnail`/`small`/`medium`/`large`/`xlarge`) preserves aspect exactly.

- **"Which derivative do I serve" has a fallback case that is the MAJORITY, not an edge.** Payload
  only generates a size smaller than the source, so a modest upload has **none**. Three of the four
  photos on `/about/meet-the-team` are 300×300 originals with zero derivatives; a helper that assumed
  `sizes.small` exists would have broken the common case while fixing the rare one. Prove both states
  in a single reading — the sized and the unsized rendering side by side — because a check pointed
  only at the big photo says nothing about the four beside it.

- **A rounded derivative is not the same aspect ratio as its original.** Payload rounds
  1359 × (600/4267) to **191**, so the logo's generated size is 0.07% wider than the source. With CSS
  setting a height and `width: auto`, the rendered logo moved 182.094px → 182.188px — 63 nodes in the
  computed snapshot, and the only layout movement from an image-sizing pass. Harmless here, but it
  means "sizes preserve the aspect ratio" is *approximately* true, and a comment claiming it exactly
  is wrong.

- **An OG image is served through the `og` derivative, which CROPS — so a wide logo cannot be the
  social image.** `generateMeta` reads `media.sizes.og.url`, and that size is `1200×630, crop:
  'center'`. Pointing the field at the 4267×1359 logo scaled it to 1978px wide and centre-cropped to
  1200, **losing 39% of the width**: the rendered derivative reads "VERI" over "MEDICO-LEGAL SOL"
  with the shield sliced in half. Nothing warns, and the field reads as set. Supply a source already
  at 1200×630 — the crop is then a no-op — and check the *derivative*, not the upload. Transparency
  is the second half: a PNG with alpha is composited by each platform onto its own, usually dark,
  background, which would have hidden the grey strapline entirely.

- **`sharp`'s `flatten()` is applied to the INPUT, before `composite()`, whatever order you call them
  in.** Building the share card as `sharp({create}).composite([logo]).flatten({background}).png()`
  produced a file that looked perfect and was still RGBA — `channels: 3` on the canvas does not help
  either, because compositing an RGBA overlay promotes it back to 4. The fix is a second pass:
  composite `.toBuffer()`, then `sharp(buffer).flatten(...)`. Read the colour type out of the PNG
  header (byte 25; 4 or 6 means alpha) rather than trusting that a white-looking image is opaque.
