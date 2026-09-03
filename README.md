# VERIFY Medico-Legal Solutions — website

**If you have just inherited this project, read this file top to bottom once.** It takes you from
nothing to a running site, then covers deploying, testing, where images go, and everything that is
knowingly imperfect. It assumes you can run a Node app and nothing else about this codebase.

| You want to | Read |
|---|---|
| Understand or change the code | [`CLAUDE.md`](CLAUDE.md) — architecture, invariants, the block system |
| Work out why a measurement looks wrong | [`docs/TRAPS.md`](docs/TRAPS.md) — every reading that has already misled someone here |
| Know what something in the admin sidebar is | [`docs/ADMIN-GUIDE.md`](docs/ADMIN-GUIDE.md) — written for a non-technical editor |
| Change a colour, font, spacing or corner radius | [`src/Styles/HOOKS.md`](src/Styles/HOOKS.md) — ditto |
| Find your way around the codebase for the first time | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — the map, not the rules |

**This file and those five are the whole record set** — six documents, where there were ten. A
change lands in every one it touches, in the same pass; a stale record is worse than none, because a
reader cannot tell which one is lying. The set shrank because that rule could not be held at ten:
one day after a full sync pass, three documents gave three different counts for the same shell
script. The history lives in `git log`.

`docs/ARCHITECTURE.md` was added last, on the condition that it carries **no counts, no invariant
text and no schema figures** — only structure. That is what keeps it from becoming a seventh thing
that can disagree with the rest.

**In this file:**
[1. What this is](#1-what-this-is) ·
[2. Standing a box up](#2-standing-a-box-up-from-nothing) ·
[3. The environment file](#3-the-environment-file) ·
[4. Email](#4-email--read-this-even-if-you-skip-everything-else) ·
[5. Running it locally](#5-running-it-locally) ·
[6. Before you deploy](#6-before-you-deploy) ·
[7. Deploying](#7-deploying) ·
[8. Testing and guards](#8-testing-and-the-guards-you-should-not-delete) ·
[9. Images](#9-images-and-where-to-upload-them) ·
[10. Known issues](#10-known-issues) ·
[11. Deliberate departures](#11-deliberate-departures)

---

## 1. What this is

A [Next.js 16](https://nextjs.org) site with [Payload 3](https://payloadcms.com) as its CMS, on
Postgres, using `pnpm`. Payload runs **inside** the Next app — there is no separate CMS server. The
public site is `src/app/(frontend)/`, the admin is `src/app/(payload)/`.

Content is edited at `/admin` and goes live on save. There is no publish step beyond each document's
Draft/Published toggle, and **no deploy is needed for a content change** — copy, images, colours,
spacing and page layouts are all database changes an editor makes.

Almost nothing is hardcoded. Pages are built from blocks an editor arranges; colours, spacing and
copy come from the database. That is deliberate: the client's staff maintain the site without a
developer, and adding a hardcoded value takes something away from them.

---

## 2. Standing a box up from nothing

**Prerequisites:** Node 22 LTS (`package.json` requires `>=20.9.0`; Node 20 left maintenance in
April 2026, so a new host should be on 22), `pnpm` 9 or 10, PostgreSQL 15+.

> **This section is the summary.** The command-at-a-time version for someone who has not done it
> before — provisioning Ubuntu, systemd, Cloudflare, TLS, email — is
> `VERIFY-Deployment-Runbook.md`, which ships **alongside** this repository, not inside it. Use it
> for a first deploy; use the six steps below as the checklist once you know the shape.

```bash
createdb verify_cms            # 1. a database
pnpm install                   # 2. the code
cp .env.example .env           # 3. configuration — see §3 before filling this in
$EDITOR .env
pnpm payload migrate           # 4. create the schema. One migration; it only creates tables
pnpm build                     # 5. build and run
pnpm start
```

Then open `/admin`. **The first account you create becomes the administrator** — there is no separate
setup step and no default password.

### Content

The site is not much use empty. With `ENABLE_SEED_ENDPOINT=true` in `.env` and a logged-in admin:

```bash
curl -X POST https://your-site/next/seed-verify -H "Cookie: <your admin session cookie>"
```

It is idempotent and non-destructive — safe to run twice — and creates the page tree, taxonomy,
specialists, team, events and settings.

**Then remove `ENABLE_SEED_ENDPOINT` from `.env` and restart.** It rewrites page parents, which
changes live URLs, and overwrites editable copy from code fixtures. It is a scaffolding tool, not an
admin feature.

### After a seed: what to do, and what only looks like a fault

1. **Admin → System → Search → Reindex.** Search results store their own canonical URL (`uri`),
   written on save. Documents that predate a seed keep whatever they had, and a result with no `uri`
   renders unlinked. On one local database only 7 of 66 search documents had one until it was
   reindexed. **This one is required after every seed or bulk import.**
2. **Admin → Site → Site Settings** — the breadcrumb separator (`Home` / `›` / `Breadcrumb`) and the
   brand assets start empty. Not a fault; fill them when you have the artwork.
3. **If the nav, footer or branding still looks stale**, open **Site → Header** and **Site → Footer**
   and press **Save** on each. You should not need to: `seedVerify` ends by purging `global_*` for
   all ten cached globals and `revalidatePath('/', 'layout')`, which was added for exactly this
   symptom. Saving forces the same purge, and is the recovery step if it did not take.

---

## 3. The environment file

`.env.example` documents every variable and what breaks when each is wrong. Four matter most:

| Variable | If it is wrong |
|---|---|
| `DATABASE_URL` | Nothing runs |
| `PAYLOAD_SECRET` | Changing it logs every admin user out |
| `NEXT_PUBLIC_SERVER_URL` | Every absolute link, sitemap entry and social preview points at localhost. **No visible error** |
| `PREVIEW_SECRET` | Draft preview links cannot be validated |

**The app refuses to boot** while serving without `NEXT_PUBLIC_SERVER_URL`, `PREVIEW_SECRET` or
`SMTP_HOST`. That is deliberate — each fails *silently* rather than loudly, and a server that
half-works passes a deploy smoke test. It exits rather than starting.

The check lives in `src/instrumentation.ts`, which Next runs once before the first request. It is not
in `payload.config.ts` alone because that module loads lazily: measured, `next start` with
`SMTP_HOST` unset served the prerendered homepage with a **200** and only 500'd on `/admin` and
`/api/*`.

It gates on *serving*, not on `NODE_ENV` — `next build` also sets `NODE_ENV=production`, and
requiring mail credentials to build an artifact just breaks the build, so the build is skipped via
`NEXT_PHASE === 'phase-production-build'`. Guarded by `tests/int/productionEnv.int.spec.ts`.

---

## 4. Email — read this even if you skip everything else

**The site is handed over with email switched off**, and is designed to run that way until real
SMTP credentials exist. You turn it off with `ALLOW_MISSING_SMTP=1` in `.env`; a development machine
may instead be using `LOCAL_PROD_REPRO=1`, which waives all three required variables rather than
just this one. Either way the behaviour below is the same.

**What still works.** Enquiries, contact forms and newsletter signups are **captured normally**.
They are in the admin under **Forms → Form Submissions**. Nothing is lost.

**What does not.**

- **Nobody is emailed when an enquiry arrives.** Someone has to check that list by hand. If the
  client is expecting enquiry emails, they are not getting them.
- **Admin password resets do not work.** The reset appears to send and nothing arrives. An admin who
  forgets their password needs a developer to reset it directly.

**How you know.** A boxed banner prints on every boot, and the admin dashboard carries a **red
warning on every login** for as long as mail is unconfigured. Every attempted send is logged at
*error* level as `[EMAIL NOT SENT]` — not at info, and not through Payload's built-in console
adapter, which resolves successfully and so is indistinguishable from a real send.

**Turning it on.** Two changes in `.env`, then restart:

1. Fill in the `SMTP_*` block — at minimum `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`.
2. **Delete the `ALLOW_MISSING_SMTP` line.**

Then check **Forms → Forms → *(each form)* → Emails** to confirm who is notified — the addresses are
per form, and are the thing most likely to be wrong after a handover.

> `ALLOW_MISSING_SMTP` waives `SMTP_HOST` and **nothing else**; `NEXT_PUBLIC_SERVER_URL` and
> `PREVIEW_SECRET` stay required, so a genuinely misconfigured deploy still refuses to start.
> Leaving it set on the site that takes real enquiries is the single most expensive mistake
> available here. It fails silently by design: the visitor is thanked, the submission is stored, and
> nobody is told.

---

## 5. Running it locally

```bash
pnpm install
cp .env.example .env      # then fill in DATABASE_URL and PAYLOAD_SECRET
pnpm dev                  # http://localhost:3000, admin at /admin
```

Requires Postgres. Local development uses a dedicated `verify_cms` database and never touches
production. The Postgres adapter pushes schema in dev, so the local database auto-syncs on boot —
**there are no local migrations**.

| Command | What it does |
| --- | --- |
| `pnpm dev` | Dev server on `:3000` (binds `0.0.0.0`, so it is reachable on the LAN) |
| `./start.sh` / `./stop.sh` | The same server backgrounded → `.dev.log` / `.dev.pid` |
| `pnpm build` / `pnpm start` | Production build and serve |
| `pnpm dev:prod` | Build + serve in production mode locally — needs `LOCAL_PROD_REPRO=1` |
| `pnpm lint` | ESLint (`pnpm lint:fix` to autofix) |
| `pnpm test` | lint → integration → e2e, stopping at the first failure |
| `pnpm test:int` | Integration only (vitest) |
| `pnpm test:e2e` | End-to-end only (playwright) — starts or reuses a dev server on `:3000` |
| `pnpm generate:types` | Regenerate `src/payload-types.ts` after ANY field change |
| `pnpm generate:importmap` | Regenerate the admin import map after adding a custom admin component |
| `pnpm exec tsc --noEmit` | Typecheck — there is no `typecheck` script |

Single test: `pnpm test:int tests/int/api.int.spec.ts -t "name"` ·
`pnpm test:e2e tests/e2e/frontend.e2e.spec.ts -g "name"`.

Local admin (throwaway): `admin@local.test` / `password`.

### Running in production mode locally

`pnpm dev:prod` runs `next start`, which sets `NODE_ENV=production` — so the boot check in §3 fires
and the server exits, even though this is your laptop. To run it anyway, add to your local `.env`:

```
LOCAL_PROD_REPRO=1
```

It disables nothing except the refusal to start, prints a banner on every boot, and every email is
still reported as `[EMAIL NOT SENT]`. **Never set it on the server** — it is the only thing between a
misconfigured deploy and months of silently discarded enquiries.

### Comparing a page against the design reference

`.design-reference/` holds the static HTML target for the redesign. **Serve it over HTTP, never open
it over `file://`:**

```bash
(cd .design-reference && python3 -m http.server 4100)
```

Its stylesheet is linked root-absolute (`/assets/css/styles.css`) and silently fails to load from the
filesystem, so every shared-sheet rule reads as an unstyled default and you measure the wrong thing.
Note also that each reference page redeclares what it needs in an inline `<style>` block at equal
specificity — **the inline copy is the one that renders**, not the shared sheet.

Where the build deliberately differs from the reference, it is in [§11](#11-deliberate-departures).
Read that before "correcting" anything back.

---

## 6. Before you deploy

In order. Each step catches something the next one would hide.

> **`pnpm build` goes after the tests, not before them.** `pnpm build` and `pnpm dev` both write
> `.next`, so building while the dev server is up replaces the bundle it is serving — and
> `pnpm test:e2e` reuses that same running server. Do it in the wrong order and e2e runs against a
> half-replaced build. That has already happened here: a hover rule confirmed working minutes
> earlier computed to `none` on four consecutive runs, and it read like a real defect in the test
> rather than a poisoned server. `rm -rf .next` and a restart fixed it with the source untouched.
> If you must build mid-session, `./stop.sh` first and `./start.sh` after.

1. `pnpm exec tsc --noEmit`
2. `pnpm test` — lint, then integration, then e2e
3. `./stop.sh` (if a dev server is up), then `pnpm build` — must pass **without**
   `LOCAL_PROD_REPRO`; building needs no deploy secrets
4. `pnpm dev:prod` and click through: submit the enquiry drawer and confirm a row appears under
   **Form Submissions**; open a draft post's **Preview**; check the header and footer nav links
   resolve
5. After any bulk content import or seed: **Admin → System → Search → Reindex**

### Committing

**Every commit must typecheck on its own**, not merely at the end of the branch. When one pass is
split into several commits, a file touched by more than one of them gets staged in part — and it is
easy to leave a commit whose code refers to something a later commit introduces. `git log` then holds
a revision that does not build, which breaks `git bisect` and any deploy pinned to it.

This has already cost a rewind of two commits here. Check it the cheap way, per commit:

```bash
git worktree add /tmp/wt <sha> && ln -s "$PWD/node_modules" /tmp/wt/node_modules
(cd /tmp/wt && pnpm exec tsc --noEmit)
rm -f /tmp/wt/node_modules && git worktree remove --force /tmp/wt
```

---

## 7. Deploying

Production builds and migrates on **the production host** — a Linux server the site's owner
controls, reached however that host is normally administered. The loop is: commit locally → push →
the host pulls, builds and migrates against the **live** database. Nothing below assumes a
particular machine, operating system or network; every command is about the code.

> **If you have just inherited this project, the host does not exist yet.** The site was built and
> proven on the original developer's own server, which did not transfer. Standing one up is
> `VERIFY-Deployment-Runbook.md`, which ships alongside this repository rather than inside it.

```bash
git pull
pnpm install          # only if dependencies changed
pnpm payload migrate  # only if a migration was added
pnpm build
# restart the server
```

**The schema is frozen behind a single baseline migration.** `src/migrations/` holds one
`20260825_130820_fresh_baseline`, generated on 2026-08-25 against an empty scratch database and
verified against the dev-pushed schema: **314 `CREATE TABLE`, 542 `CREATE TYPE`, zero drops and zero
type conversions**, with a whitespace-insensitive column-level checksum of both catalogues matching
exactly (3,640 columns each).

It supersedes two same-day baselines, each deleted **with its `.json` snapshot** —
`migrate:create` diffs against that file, so leaving it produces an incremental that looks like a
baseline. The type count fell by 111 against the first because the **112 icon enums are gone**: icon
fields are `varchar` now, plus one new `enum_icons_colour`. The table count rose by three — `icons`,
and `icon_library` with its `icon_library_texts` list.

It replaces the previous `20260823_130006_baseline` and the two `editor_controls` migrations, which
were deleted: the box is being wiped and reseeded, so it creates the final shape directly rather than
replaying an `ALTER TYPE` sequence. Two changes that were pending as separate migrations are now baked
into the baseline — `availability_sessions` has no `location` column, and `specialists.profile_photo_shape`
defaults to `'square'` (Team stays `'tall'`).

**The icon set became editor-managed on 2026-08-25.** **Design → Icon Library** is the one place
icons are managed: every icon visible at once with a tick box, uploading, renaming, recolouring and
deleting on the tile, and `Icons` hidden from the sidebar so there is nothing else to find. An empty
list falls back to the 101 the app bundles, so the global can be emptied or ignored without changing
what editors see — and the ticks show that effective list, not the stored one. Anything outside those 101
renders as an `<svg>` masked from `/api/icon/phosphor/<name>` rather than as a bundled component —
measured to be indistinguishable: same colour, same 36×36 box, on the same band.

**That route imports the whole Phosphor set, and the cost is measured rather than assumed: the compile
step went 5.4s → 6.4s.** It is a route handler, so none of it reaches a browser as JavaScript. The
first attempt at this feature reached for the same import and was never built at all.

**Icon uploads landed on 2026-08-25**, and with them the last of the icon enums. `iconField`
(`src/fields/blockFields.ts`) and the link icon (`src/fields/link.ts`) are `text` rather than
`select`, because a select is a Postgres enum and an enum cannot hold a value an editor creates.

**On a wiped box this costs nothing** — the baseline creates `varchar` columns directly. **On a box
that is migrated instead**, it is 112 enum types to drop across live and `_v` tables, which is
destructive: run `src/migrations/REFERENCE-icon-enum-to-text.sql` by hand FIRST and then deploy the
config, so the push finds no drift. Read that file's header before doing so — an earlier attempt
converted the columns while leaving `link.ts` declaring a select, and the resulting drift made the
local site hang on every request until the database was rebuilt. `docs/TRAPS.md` #i57-59 has the
whole account.

**Event Types became a collection on 2026-08-25**, so `events.event_type` (a Postgres enum) is now
`events.event_type_id`, an FK to `event_types`, and the two enums are gone. On a wiped box the baseline
creates the final shape and the seed writes the links. **On a box that is migrated rather than
reseeded**, the data has to be carried across before the old column is dropped:

```sql
UPDATE events        SET event_type_id         = et.id FROM event_types et WHERE et.slug = events.event_type::text;
UPDATE _events_v     SET version_event_type_id = et.id FROM event_types et WHERE et.slug = _events_v.version_event_type::text;
```

The `_events_v` half is easy to miss and matters: old autosave versions can carry types no live row
uses.

**Regenerating a baseline: delete the `.json` snapshots too.** `migrate:create` diffs the config
against the previous migration's `.json`, not against the database. Leaving them behind produced a
7-statement incremental (5 `ALTER TABLE`, 1 `DROP COLUMN`) that looked like a baseline and was not.

Only a **code** change that adds or alters a collection, global or block *field* needs a migration:

```bash
pnpm payload generate:types
pnpm payload migrate:create <name>   # answer "create column" unless it is genuinely a rename
pnpm payload migrate
pnpm build
```

Multiple config changes in one push can share a single `migrate:create`.

**Keep the schema additive.** A dropped column is irreversible data loss on a live site, and the
`migrate:create` prompt that asks "created or renamed from another column?" is where that happens by
accident — choosing *rename* moves an unrelated column's data into the new field. **If a generated
migration drops a column, stop and find out why.**

**Both changes that were pending as separate migrations are now in the baseline**, so there is no
outstanding `DROP COLUMN` to approve: `availability_sessions.location` (removed 2026-08-25 because
nothing read it) simply never gets created, and `specialists.profilePhotoShape` is created with
`DEFAULT 'square'`. On a wiped box the seed writes `square` from the start, so
`repairSpecialistPortraitShape` finds nothing to move and logs "already done" — it exists for a box
that is migrated rather than reseeded.

**Budget the column name before adding a relationship field to a block.** Postgres truncates
identifiers at 63 characters and Drizzle builds foreign-key names from the table, column and
referenced table; overrun it and Drizzle recreates the constraint on every boot, which surfaces as an
intermittent `42704` in the test suite rather than as anything obviously schema-shaped. See the
identifier invariant in `CLAUDE.md`.

### After deploying, check these first

They cover the areas where a silent failure would otherwise go unnoticed:

- `/admin/collections/pages/create` renders **a form, not just a sidebar** — the canary for the
  revalidation crash described in `CLAUDE.md`.
- The enquiry drawer submits and a row appears under **Form Submissions**. A drawer that cannot reach
  its backend must say so and disable submit — never acknowledge locally.
- A page with a **Process Steps** block renders its step descriptions as paragraphs, not raw JSON.
- Header and footer nav links resolve, including any pointing at an article.
- One interior page hero, and a testimonial card.

---

## 8. Testing, and the guards you should not delete

```bash
pnpm test                  # lint → integration → e2e, stopping at the first failure
pnpm exec tsc --noEmit
zsh tests/int/prove-guards.sh   # re-applies each deliberate break; every case must report PASS
```

**Re-measured 2026-08-26 — re-run these rather than trusting the numbers:**

| Gate | Result | Count it with |
|---|---|---|
| `pnpm test:int` | **334 passed, 17 files** | `pnpm test:int` |
| `pnpm test:e2e` | **72 total.** Last full run: 70 passed, 2 failed — one the flake in [§10.1](#1-four-e2e-specs-flake-under-a-loaded-dev-server) (passed alone), one the real database-state fault in [§10.32](#32-deleting-an-uploaded-icon-leaves-it-ticked-in-the-icon-library) | `pnpm test:e2e` |
| `zsh tests/int/prove-guards.sh` | **11 cases** | `grep -c '^run_case "' tests/int/prove-guards.sh` |
| `referenceCssDiff.mjs` | **13 families**, all zero | the `FAMILIES` object in the harness |
| `computedSnapshot.mjs` | **21 routes, 39 properties** | the `ROUTES` and `PROPS` arrays |

The e2e count **cannot be derived from source** — `images.e2e.spec.ts` and `richTextRender.e2e.spec.ts`
each parameterise one test per route, so 45 `test(` declarations expand to far more. Run it.

**A red e2e run is not automatically a regression.** Taking these very readings, a second full run
against an already-hammered dev server gave `2 failed, 2 did not run, 57 passed` — the two failures
being `admin.e2e.spec.ts`'s `beforeAll` timing out at `browser.newContext()`, with two more skipped
behind it by serial mode. Re-run alone: **4 passed in 32s**. That is [§10.1](#1-four-e2e-specs-flake-under-a-loaded-dev-server),
not a defect, and the failing spec's *name* is not diagnostic — any spec can draw the short straw.

### The doctrine

**A guard that has never failed is not evidence.** An earlier version of this file justified itself
with *"a crude test that runs beats an accurate one that rots"*, and under that licence three of its
four patterns could not fail on the defect they named — one collected results into an array it never
wrote to. The suite reported 94/94 and meant nothing.

Every test now records, in a comment above it, the deliberate break used to prove it goes red.
`prove-guards.sh` applies each in turn and restores the tree. **If you change a test, re-run it.**

Three habits separate these from the guards that rotted:

- **State the fault as a cause, not as a number.** The first heading-wrap guard compared natural
  width against the nearest container and flagged `/services`, whose header is deliberately a
  two-column grid. A numeric threshold needs an exception list, and the exception list is where the
  next false positive hides.
- **Carry a positive control in the same test.** The hover guard also hovers a card elsewhere and
  requires *that* one to move. Without it, "the testimonial did not move" is equally satisfied by a
  hover that never registered.
- **Write up the break after running it, not before.** The deep-link guard's comment described an
  asymmetry that turned out not to exist. A confident, wrong explanation in a test comment outlives
  the person who wrote it.

### What each suite guards

| File | What it guards |
|---|---|
| `tests/int/adminControls.int.spec.ts` | Orphan fields, option values with no CSS rule, the class picker, hardcoded brand assets, placeholders with no upload, `cacheLife` on a tag purge, discarded `appearance`, unguarded draft queries |
| `tests/int/seedAuthored.int.spec.ts` | That a seed module never decides "has this been written?" by counting blocks — that rule once rewrote 13 of 27 pages from fixtures on every run |
| `tests/int/proseFields.int.spec.ts` | Every field an editor types words into is rich text, or is named with a reason |
| `tests/int/richTextColors.int.spec.ts` | The 16-colour brand palette, its CSS and the toolbar swatches agree; every key is in **both** `.vf-accent` lists; the `:root` slice it reads is asserted to be the real one — and a Payload API change fails here rather than on a page |
| `tests/int/productionEnv.int.spec.ts` | Which variables are required while serving, and that `ALLOW_MISSING_SMTP` waives `SMTP_HOST` **and nothing else** |
| `tests/int/cssTokens.int.spec.ts` | Sanitisation of editor-supplied token values, which land inside a `<style>` tag |
| `tests/int/seedWrites.int.spec.ts` | No seed file calls `payload.create`/`update` directly, bypassing the rich-text lift |
| `tests/int/{eventTiming,headingId,qualificationIcon,lexicalText,inlineRichText}` | The unit halves of event timing, anchor ids, qualification icons, and rich-text reading/rendering |
| `tests/e2e/frontend.e2e.spec.ts` | Skip link (both states), centred-heading wrap, hero weight, testimonial hover, a one-panel Booking Chooser filling its band, and that nothing unclickable reacts to the pointer |
| `tests/e2e/uploadedIcons.e2e.spec.ts` | An uploaded icon is painted the same colour a built-in one is on the same band, and a placement colour beats the icon's own default. Uploads its own icon and borrows one stream's `icon` field, restoring both in `finally` |
| `tests/e2e/links.e2e.spec.ts` | Every internal link and every `#fragment` has a target |
| `tests/e2e/images.e2e.spec.ts` | Images are served at the size they render |
| `tests/e2e/carousel.e2e.spec.ts` | The carousel cannot be clicked past its own end. **Note it clicks with `{ force: true }`** — Playwright's normal click waits for stability, so a "rapid" burst is not rapid and the test passes against the broken component |
| `tests/e2e/richTextRender.e2e.spec.ts` | No route renders `[object Object]` or throws while hydrating |
| `tests/e2e/specialistCarousels.e2e.spec.ts` | The three specialist carousels show a real selection, not whoever sorts first. Every case asserts a **non-zero count before** the membership |
| `tests/e2e/tryBooking.e2e.spec.ts` | The TryBooking block never leaves a visitor looking at an empty box |
| `tests/e2e/admin.e2e.spec.ts` | The admin loads and the Pages create form renders. Seeds its own user, and deletes the autosave draft it creates |

`tests/helpers/seedUser.ts` **deletes and recreates `dev@payloadcms.com`** in whatever database
`.env` points at — fine locally, never against production.

`pnpm lint` runs as part of `pnpm test` and is enforced, not advisory: it had been crashing on an
obsolete config shim and so had never run at all, which is how ten React Compiler errors — two of them
real bugs — sat unnoticed. Those were fixed by changing the code, not by suppressing the rules, and
there is now **no `react-hooks/*` disable anywhere in `src/`**.

### Tools `pnpm test` does not run

`tests/visual/` holds six Node scripts (`ls tests/visual/*.mjs | wc -l`) — five bullets, because
the two codemods share one. They are described in full in `CLAUDE.md` → *CSS token tooling*; the
short version:

- `referenceCssDiff.mjs <family>` — diffs every declaration the design reference makes against
  `globals.css`. **A zero is necessary, not sufficient**: it proves a rule is in the file, not that it
  reached the page. Always confirm with `getComputedStyle`.
- `computedSnapshot.mjs capture|compare <name>` — computed-style gate. Capture immediately before a
  change and compare immediately after; any content change invalidates a baseline. **A non-empty diff
  is not by itself evidence** — see §10.28: it is nondeterministic on `/about`.
- `findFalseHover.mjs` — hover effects on elements nothing can click. **Candidates, not a verdict.**
- `findDeadCss.mjs` — unreachable selectors. **Candidates, not a verdict** — it has already produced
  false positives that would each have broken a live page.
- `tokenise.mjs` / `tokeniseShape.mjs` — one-shot codemods over `globals.css`.

---

## 9. Images and where to upload them

**The photography arrives in stages, and the site works at every stage.** All 19 team headshots and
all 26 specialist portraits are in. Of the twenty in-page image slots, eight are filled and **twelve
still show a placeholder** — listed at [§10.12](#12-twelve-of-the-twenty-image-placeholders-have-no-photograph).
Every slot, filled or not, is fillable from `/admin` — no code change, no deploy.

Nothing here is hardcoded: where a bundled file appears (the logo, the shield), it is a *fallback*
that only shows while the corresponding field is empty. Two guards in
`tests/int/adminControls.int.spec.ts` keep it that way.

### Site-wide — **Admin → Site → Site Settings**

| Field | Where it appears | If left empty |
| --- | --- | --- |
| Logo | Header, and the footer if no footer logo is set | Bundled VERIFY wordmark |
| Footer logo | Footer only | Falls back to Logo, then the bundled wordmark |
| Favicon | Browser tab | `public/favicon.png` |
| Social image | Link previews when a page is shared | The generated 1200×630 share card, set by the seed |
| Shield / seal mark | Home hero watermark, the mark behind **every** interior page hero, and the Contact page's portal cards | Bundled VERIFY shield |

### People and content — **Admin → Collections**

| Collection | Field | If left empty |
| --- | --- | --- |
| Specialists | Photo (also CV, Sample report) | The person's initials on a plain avatar |
| Team | Photo | The person's initials on a plain avatar |
| Services | Photo | In the accordion layout, a blue gradient tile with the service icon |
| Events | Image | Card renders without an image |
| Posts | Hero image, Author photo | Article header renders with no image behind it |
| Resources | File | The resource has nothing to download |

### Inside a page — **Admin → Pages → *page* → Layout**

| Block | Field | If left empty |
| --- | --- | --- |
| Split Feature | Row → Image | Pale-blue placeholder tile if that row's "Show an image placeholder" is ticked; otherwise the row goes full width |
| Process Steps (Claimant) | Left-column photo | Pale-blue placeholder tile if ticked; otherwise nothing renders |
| Why VERIFY | Image | Labelled gradient box |
| AAMLE Education | Image | Labelled gradient box, if the row's placeholder is ticked |
| Leadership Spotlight | Photo | Labelled box with a person icon |
| FAQ | Item → Image | Split layout only, and only the **first** item that has one is used |
| Slide Carousel · Image · Media | Image / Media | Nothing renders for that slide or block |
| Page hero (Hero tab) | Media | Hero renders without an image panel |

### Four things worth knowing before you start

- **Uploading always wins.** If a block shows a placeholder and you attach an image, the image
  replaces it — you never need to untick anything first.
- **Fix a bad crop with the focal point, not a new file.** Uploads live in the **Media** collection,
  which stores alt text plus a focal point and zoom. If a portrait crops through someone's face, open
  it in Media and move the focal point — every place that image is used re-crops around it.
- **Upload a JPEG unless the picture needs transparency.** Payload's derivatives inherit the source's
  format, so a PNG photograph stays a PNG at every size, at several times the cost — and nothing in
  the admin warns you. See [§10.10](#10-photo-derivatives-are-png-costing-15-mb). Cut-outs that need a
  transparent background (the specialist portraits) are the exception, and are PNG on purpose.
- **You do not need to resize before uploading.** The site picks the smallest generated size that
  still covers the box at 2× (`src/utilities/mediaSrc.ts`) and re-encodes at quality 82.

### Photos that have to survive a rebuild

An upload made in the admin lands in `public/media/`, which is **gitignored** — a fresh install has
nothing. For the headshots, which have to be reproducible, the source is a tracked folder:

| | Path | Filename | Format |
| --- | --- | --- | --- |
| Team | `public/assets/images/team/` | the person's **slug** — `wes-lerch.jpg` | JPEG |
| Specialists | `public/assets/images/specialist/` | the person's **display name** — `Dr Adam Parr.png` | **PNG** — cut-outs with a transparent background |
| Page photos | `public/assets/images/content/` | anything — the filename is mapped explicitly | JPEG |

Drop the file in, commit, and run the seed. The rules:

- **The folder wins.** If a person has a file there, the seed keeps their stored photo in step with
  it — replacing the file *in place*, so alt text, focal point and zoom are preserved and every page
  using that image updates at once.
- **To manage a photo from the admin instead, delete the folder file.** With no file, the seed leaves
  that person alone forever.
- **Delete the file you are replacing, in the same commit.** A `wes-lerch.png` left beside a new
  `wes-lerch.jpg` is two files for one person; the seed names both in a warning and skips them.
- **The seed log says what it did** — added / replaced / unchanged, each replaced person by name, and
  any file that matched nobody.

Specialist matching ignores honorifics, so `Dr Adam Parr.png`, `Adam Parr.png` and `Prof Adam
Parr.png` all reach the same person.

**Page photographs work differently**, because a filename cannot say which section it belongs to.
Drop the file in `content/`, then add an entry to `TARGETS` in
`src/endpoints/seed/repairContentImages.ts` naming the page and the block.

---

## 10. Known issues

Things that are known-imperfect and were **deliberately not fixed**, with what each one actually
costs and what fixing it would cost. Every figure was measured against the repository, not estimated.
Where an issue is *not* currently reachable, that is stated — several are traps for a future change
rather than live faults.

**Keep this true.** Delete an entry when it is fixed; add one whenever something is knowingly left
undone. A stale register is worse than none, because people trust it.

| # | Issue | Live today? | Impact | Effort |
|---|---|---|---|---|
| 1 | Four e2e specs flake under a loaded dev server | Test-only | `pnpm test` fails intermittently on a healthy machine | ~10 min |
| 2 | Three template hero types render their title at 400 | Latent | An editor who picks one gets a visibly unstyled heading | ~30 min **+ a data migration** |
| 3 | `.contact-form` padding follows the reference's superseded rule | Cosmetic | 12px more padding than one reference page shows | ~5 min |
| 4 | Light-band breadcrumbs are darker and heavier than the reference | Cosmetic, ~25 pages | A slightly heavier trail | ~10 min + re-baseline |
| 5 | Three dead CSS rules on a class that never reaches the DOM | No | None — a live rule covers it | ~5 min |
| 6 | A Service with no `linkOverride` would link to a page that does not exist | Latent — 0 broken links today | Only if someone adds one of 6 services to the one grid with linking on | ~20 min + schema change |
| 7 | "Send enquiry" vs "Send Enquiry" | Cosmetic | One word, one button | ~10 min + a repair |
| 8 | The Join the Expert Panel intro is 2–4px off, on shared selectors | Cosmetic, 1 page | Sub-pixel to 4px on one intro band | ~15 min + re-baseline |
| 9 | The portal tiles still read as instructions ("Download CV") | Yes, mild | A visitor may try to click a tile that does nothing | Editing 12 labels in the admin |
| 10 | Photo derivatives are PNG, costing ~1.5 MB across two pages | Yes | `/` and `/specialists` carry ~1.5 MB more than needed | 2 lines + regenerating every derivative |
| 11 | The bundled homepage shield is a 1166px PNG in a 50px box | Yes | 73 KB for a 50px logo, on every page | ~10 min |
| 12 | Twelve of the twenty image placeholders have no photograph | Yes | Twelve pale-blue placeholders where a photo belongs | Per photo: drop the file in and map it |
| 13 | `public/media/` accumulates orphaned uploads across reseeds | Local only | None — disk on the dev machine | ~5 min |
| 14 | `.events-summary-section` is a faithful port nothing can reach | No | None — dead CSS | ~5 min |
| 15 | Two self-sectioning blocks are missing from `selfSpaced` | Partly fixed | A stray 64px; the two reported symptoms are gone, see below | ~5 min + re-baseline |
| 16 | An article is bylined to someone who is not on the team | Yes | A byline that does not link, where others do | ~5 min + a reseed |
| 17 | The reference-diff exceptions rest on ageing measurements | No | The tool's exceptions cannot be trusted until re-taken | ~45 min |
| 18 | Five blocks are on no page, so nothing reviews them | No | A regression in them would ship unseen | ~30 min |
| 19 | The toolbar colour swatch rides an `@experimental` Payload API | Live and working | None today; an upgrade could remove the control, never the content | ~20 lines to rebuild or drop back |
| 20 | Enter in a heading makes a paragraph, not a line break | Admin only | The page renders correctly either way | ~40 lines **+ two pinned Lexical deps** |
| 21 | Payload boots in ~7s, and that is now load-bearing | Dev/test only | A suite can report green while checking nothing | Unknown |
| 22 | `Specialists.availabilityHighlight` is written by the seed, read by nothing | No | None — hidden from the admin | ~5 min **+ a destructive DDL by hand** |
| 23 | The TryBooking form does not load on a client-side navigation | Yes, mild | A visitor arriving via the menu gets a button, not the embedded form | Not fixable without vendor internals |
| 24 | **This deployment runs without email** | Yes, by choice | Enquiries captured but nobody emailed; password reset does not work | ~5 min once SMTP exists |
| 25 | Nothing exercises the seed | Test-only | Four seed faults shipped under a fully green suite | ~2 h |
| 26 | `LABEL_SCOPED_FIXES` is not tracked, so a stale key is silent | Latent | A link fix quietly stops applying when copy is reworded | ~2 lines |
| 27 | The text-colour palette cannot be extended by an editor | Yes, mild | "Add a colour" needs a developer and a deploy; the 16 values are all editable | Not fixable in the toolbar — see below |
| 28 | `computedSnapshot.mjs` is not deterministic on `/about` | Test-only | A clean change can report a 2–3 node diff, or none, run to run | Unknown — needs a settle, not a tolerance |
| 29 | Drag-ordering specialists means dragging across pages | Yes, mild | The admin list shows 10 of 26, so moving someone far is awkward | Raise the list `limit`, ~1 line |
| 30 | An availability edit can take up to an hour to reach the live site | Yes, mild | Editors read a cached page as a lost save and re-enter the slot | See below — needs a host-side reading first |
| 31 | What still sits two-across on a phone | Yes, mild | `form-row` (two short form fields) stays 2-up below 600px | Deliberate — see below |
| 32 | Deleting an uploaded icon leaves it ticked in the Icon Library | Yes | A permanently-ticked entry with no tile, and a red `uploadedIcons` spec until it is unticked | ~10 lines in a hook, or in `iconUsage` |

### 32. Deleting an uploaded icon leaves it ticked in the Icon Library

**Measured 2026-08-26**, on a database where the `icons` collection was empty and
`icon_library_texts` held **103** rows — 102 Phosphor names plus a dangling **`upload:51`**.
`uploadedIcons.e2e.spec.ts:449` goes red with *"103 of the 102 icons on offer are ticked"*, and it
reproduces in isolation, so it is not the flake above.

**The mechanism, traced rather than guessed.** `iconUsage` (`src/utilities/iconUsage.ts`) is the
guard that refuses to delete an icon that is in use, and it *does* scan globals — but its loop opens
`if (!iconFieldPaths(global.fields).length) continue`. The Icon Library global's list is
`name: 'icons', type: 'text'` (`src/IconLibrary/config.ts:42`), declared directly rather than
through `iconField`, so `iconFieldPaths` finds nothing on it and **the one global that exists to
hold icon choices is the one global the guard skips.** Deleting a ticked upload therefore succeeds
and orphans its entry: the library counts it as ticked and renders no tile for it.

`uploadedIcons.e2e.spec.ts` reaches this by design — its `finally` deletes the icon it uploaded
(line 381) but never unticks it — so **running that spec is what plants the orphan**, and every
later full run fails until the entry is removed.

*Fix:* either have `iconUsage` treat the Icon Library's own list as usage (so the delete is refused,
matching every other holder), or prune the key from the global in the Icons `afterDelete` hook (so
the delete stays allowed and cleans up after itself). The second is closer to what an editor
expects. Until then, untick the stale entry in **Design → Icon Library** — the screen shows it as
ticked with nothing beside it.

### 1. Four e2e specs flake under a loaded dev server

`admin.e2e.spec.ts`, `links.e2e.spec.ts`, `tryBooking.e2e.spec.ts` and `frontend.e2e.spec.ts` fail
intermittently, and **only in a full run**. `frontend` was added on 2026-08-26: *"the booking-portal
tiles do not, and the enquiry button does"* failed at the end of a full run and passed alone
immediately after (**1 passed in 32s**) — the same signature as the three below. `tryBooking` was added to this list on 2026-08-24: *"the fallback booking link
is present and correct when the widget cannot load"* failed once at the end of a full run and passed
4/4 in isolation immediately after, which is the same signature as the two below. Measured
across six full runs: *"Admin Panel › can navigate to dashboard"* failed twice; it passes every time
in isolation. Playwright's serial mode then skips the tests behind it, so the run reports failures for
tests that never ran.

**The cause is a default timeout, not the admin.** Both `tests/helpers/login.ts` and the dashboard
test wait with Playwright's default 5-second `expect` timeout, against a **dev server** compiling the
admin bundle on demand, immediately after the link crawl has walked 114 pages through it.

It also produces outright **500s**, which read like a broken route and are not: across one session
`/in-the-loop` served 200 twenty-five times and 500 once, `/` served 200 one hundred and seven times
and 500 once. `seedUser.ts` builds its own Payload instance while the crawl is still running, so the
admin spec can take the *next* spec down with it.

**Two things follow.** A 500 in this suite is not evidence of a broken page until it reproduces —
check the ratio of 200s to 500s for that route in `.dev.log`. And the failing spec's *name* is not
diagnostic: any spec can draw the short straw.

*Fix:* give those assertions and `beforeAll` their own timeout (`{ timeout: 30_000 }`), or warm
`/admin` once before starting the clock. **Not** a longer global timeout.

### 2. Three template hero types render their title at 400

`High impact` / `Medium impact` / `Low impact` are Payload-template heroes never designed for VERIFY.
They render through `RichText` with prose enabled, and `tailwind.config.mjs:12` sets
`h1 { fontWeight: 'normal' }`, so the title computes **400**. **0 of 61 pages** use one — but the
dropdown offers them.

**Removing them is not free.** `hero.type` is a Postgres enum, so dropping options rewrites the type
on both tables, and the dev push fails with `22P02 enum_in` because rows still hold a removed value —
**not in the live table**:

| Table | Contents |
|---|---|
| `pages.hero_type` | 59 `pageHero`, 2 `homeHero` — clean |
| `_pages_v.version_hero_type` | 411 `pageHero`, 8 `homeHero`, **62 `lowImpact`** |

Those 62 are template-era draft history. While the config was in that state, `getPayload()` threw on
init and **every page 500'd**. *Fix:* count both tables, add the `UPDATE` ahead of the enum change,
then remove the options and the three hero directories.

### 3. `.contact-form` padding follows the reference's superseded rule

The reference's shared sheet and the build both say `padding: 40px`; one page's inline block says
`28px 24px`. Left alone because **one** page is not enough to call the inline value the intended norm,
where `.page-hero h1` had nine agreeing. Does not affect `/specialists/join-expert-panel`, which
declares no inline rule — measured 40px on both sides.

### 4. Light-band breadcrumbs are darker and heavier than the reference

Measured on a specialist profile at 1440px:

| | Ours | Reference |
|---|---|---|
| Link | `rgb(34, 34, 34)` | `rgb(115, 115, 115)` |
| Separator | `rgb(34, 34, 34)`, 12.48px | `rgb(176, 176, 176)`, 10.6px |
| Current item | `rgb(26, 58, 92)`, weight 700 | `rgb(65, 64, 66)`, weight 900 |

Not a page quirk — `#737373`, `#b0b0b0` and `#414042` appear **49, 23 and 46 times** across the
reference. *Fix:* three token values in the light `--bc-*` context (`globals.css:4189-4191`; the dark
override at `:4235-4237` must move with it). It changes ~25 pages at once, which is why it is a
decision rather than a tidy-up.

### 5. Three dead CSS rules on a class that never reaches the DOM

`globals.css` scopes three rules to `.ct-page .ct-portal-card` (lines **9192**, **9211**, **9212**).
The bare class is **not in the served HTML** — only its children are, which is why a substring grep
reports it present. A separate live rule supplies the same treatment.

**Do not simply add the missing class:** the dead rule sets `margin: 12px 0 4px` where the live one
sets `margin-top: 12px`, so restoring it would move the page. Delete the three rules instead.

### 6. A Service with no `linkOverride` would link to a page that does not exist

The `services` collection has **no public route**. `ServicesGrid` nonetheless offers *Link to service
page*, which builds a `<prefix>/<slug>` href that would 404. `/information-centre/for-clients` has
`linkToService: true`, published — but all **8** services on that grid carry a `linkOverride`, so
every href resolves.

The risk is narrower: **6 of 14 services have no override.** Four sit only on grids with linking off;
two are on no page. Add any to the for-clients grid and it 404s. `links.e2e.spec.ts` catches it — it
has to be run, which is the whole exposure.

### 7. "Send enquiry" vs "Send Enquiry"

The availability grid's button reads *"Send enquiry"*; every form submit button reads *"Send
Enquiry"*. A one-word fix to `SpecialistAvailability → labels.sendEnquiryLabel`, plus an
unconditional repair, because it is stored copy.

*Measured false, do not re-derive:* there are **not** five wordings for one thing. There are four for
four different actions — **Make an Enquiry** opens the drawer, **Send Enquiry** submits a form,
**Enquire →** is a service-card link, **Contact Us** is the nav item.

### 8. The Join the Expert Panel intro is 2–4px off

Measured at 1440/1100/900px. Four differences, every one on a **shared** selector:
`.section-label` margin-bottom (14 vs 12px), `.section-title` margin-bottom (20 vs 16px) and
font-size clamp (2.4 vs 2.5rem max), `.vf-split__body p` line-height (1.85 vs 1.75), centred subtitle
`max-width` (640 vs 600px).

Closing any of them to satisfy one page changes ~29 pages — the shape of the `.page-hero h1` mistake.
**The proper fix is one variant, not five edits:** `.vf-client-overview` (`globals.css:9240-9241`)
already encodes exactly this treatment as a page scope for `/for-clients`, so a shared "editorial
intro" density on SplitFeature would serve both and let that scope be deleted.

### 9. The portal tiles still read as instructions

"Download CV" and "Sample Redacted Report" are imperative labels on tiles that cannot be clicked.
Removing the hover stops them *looking* like buttons; it does not stop them *reading* like one, and
"Download CV" names a file this site does not serve. Noun-phrase wording was offered and declined for
now. **No code cost** — the labels are rich-text fields an editor can change: three on the
**Specialist Profile** global, three on each of the three pages carrying the Portal CTA block.

### 10. Photo derivatives are PNG, costing ~1.5 MB

| Route | Now | Largest single image |
|---|---|---|
| `/` | 1732 KB | `Dr Timothy Doyle-15-600x600.png` — **477 KB** |
| `/specialists` | 2066 KB | `Dr Simon Perkins-15-300x300.png` — **148 KB** |

Payload generates each derivative in the **source's** format, and the headshots were uploaded as PNG.
A 600×600 PNG photograph is ~477 KB where the same image as JPEG or WebP is ~30 KB. The
`<Media>`/next-image path converts to WebP automatically, which is why `/about/team/<slug>` is 66 KB;
the plain-`<img>` sites cannot.

*Two fixes, both with a cost:* add `formatOptions: { format: 'webp' }` to `imageSizes` in
`src/collections/Media.ts` — but Payload only generates derivatives **on upload**, and there is no
"regenerate sizes" command; or re-upload the headshots as JPEG, which needs no code but relies on the
next person knowing. `images.e2e.spec.ts` caps a single CMS image at **600 KB** to accommodate these;
that ceiling should come down when this closes.

### 11. The bundled homepage shield is a 1166px PNG in a 50px box

73 KB at 1166px wide, rendering 50px — **23.4× oversized**. It is a bundled static asset, not a Media
upload, so there are no derivatives to choose from. The code path sizes it correctly when **Site
Settings → Brand assets → Shield** is set; it is unset, so the fallback renders. Upload a shield, or
re-export the bundled PNG at ~100px.

### 12. Twelve of the twenty image placeholders have no photograph

Eight are done. The mechanism gap is closed — page photographs are seeded from
`public/assets/images/content/` by `src/endpoints/seed/repairContentImages.ts`, so a filled
placeholder survives a rebuild. Still empty:

| Page | Placeholder |
|---|---|
| `/services` | Independent Medical Examinations · Joint Medical Examinations |
| `/services/medico-legal` | Everything a Matter Needs, Under One Roof |
| `/services/medico-legal/ime` | An Expert Medical Opinion, Independent of All Parties |
| `/services/medico-legal/jme` | One Specialist. Jointly Instructed by Both Parties. |
| `/services/medico-legal/reporting-services` | Supplementary Report · Expert Evidence · Teleconference · File Review |
| `/specialists/join-expert-panel` | A Specialist Partnership Built on Quality & Integrity |
| `/services`, `/services/educational-services` | the two AAMLE Education panels |

**The trap:** filling one through the admin works immediately and is lost the next time the database
is rebuilt. The repair route is the one that survives.

### 13. `public/media/` accumulates orphaned uploads across reseeds

Seventeen copies of one headshot — `wes-lerch.png` through `wes-lerch-16.png` — sit in
`public/media/`, and exactly one is referenced. Disk only, and local only. A cleanup script must
enumerate from the **database**, not from a filename pattern, or it will delete a file in use.

### 14. `.events-summary-section` is a faithful port nothing can reach

`globals.css:5104-5105` carries the reference's rules and **neither can ever match** — the reference
gives each group its own `<section>`; we render both inside one. Measured 0 occurrences in the
browser, with `.events-section-header` ×3 as a positive control.

**Deliberately left dead** rather than wired up: adding the class would apply `padding: 78px 0` to
every group on all three events pages, including two that have no second group. Deleting the rules
needs a `NOT_PORTED` entry in the same pass, or the `events` family reports them missing.

### 15. Two self-sectioning blocks are missing from `selfSpaced`

`EventsExplorer` and `FeaturedArticles` both render their own `<Section>` and are not in
`selfSpaced`, so each is wrapped in `.my-16` and carries **64px above and below its own Section
padding**. Two lines in `RenderBlocks.tsx` — held back because it moves four pages nobody has
complained about. Do it behind a `computedSnapshot` capture and expect a diff.

*(An audit initially reported three blocks, including `ArchiveBlock` — a false positive, because its
match was a comment. A second audit on 2026-08-25 walked into the identical trap, and a third block,
`FAQ`, matched only because `grep '<Section'` also matches `<SectionHeader`. See docs/TRAPS.md.)*

**Updated 2026-08-25.** The two symptoms anyone had actually complained about are fixed, without
touching `selfSpaced`:

- `/services/medico-legal/ime` — 152px of white above *Assessment Formats*, now **88px** (the next
  section's own padding, and nothing more).
- `/in-the-loop` — 174px above the first heading, now **110px**. The cause there was six Archive
  blocks that match no posts and still emit `<div class="my-16"></div>`.

Two rules do it: `.my-16:empty` and a collapse for the IME band, joining the two `:has()` collapses
already in the file. `selfSpaced` was left alone deliberately — `.vf-faq` has no base padding, so
/jme's top-level FAQ (measured 0) depends on its wrapper, and `.ni-section`'s padding arrives through
an editor `cssClass`. `EventsExplorer` and `FeaturedArticles` genuinely do self-section and remain the
honest two-line fix described above.

### 16. An article is bylined to someone who is not on the team

`src/endpoints/seed/data/posts.ts` names **Evie Le** as an author; she is not among the 19 team
members the seed creates. The name renders as plain text where other authors link to a profile.
Nothing 404s — `teamPath` returns nothing rather than fabricating an href. A content decision:
re-attribute, or restore her with a photograph.

### 17. The reference-diff exceptions rest on ageing measurements

Seven `EXPLAINED`/`NOT_PORTED` reasons in `referenceCssDiff.mjs` cite browser measurements from
2026-08-18/19; `globals.css` has changed by 164 lines since. All 13 families read zero, so this is a
trap for a future reading. The file's own rule is that an aged exception needs its measurement
**re-run, not re-read** — one justified by "verified equal in the browser" was once false and hid
**11 real spacing gaps**.

### 18. Five blocks are on no page, so nothing reviews them

**Stats Band**, **Spacer**, **Divider**, **Icon** and **Image** are selectable and appear nowhere.
They were only displayed on `/style-guide`, removed on 2026-08-20 because a visitor could reach it. A
regression in any would ship unseen. *Fix:* an unlisted, `noindex` style-guide page — close to what
was just deleted, so doing nothing is defensible. **Do not** put them on a real page to make a
checklist tidy.

### 19. The toolbar colour swatch rides an `@experimental` Payload API

`TextStateFeature` is marked *"There may be breaking changes to this API"*. Registered once, in
`src/fields/richTextColorFeature.ts`.

**Stored content is not at risk from an API change:** what is written is the bare palette key
(`{"$":{"color":"brand"}}`), never CSS, and the *reading* half is ours (`nodeColorClass` in
`src/components/RichText/shared.tsx`). Content coloured today keeps rendering even if the editor half
disappears.

**It IS at risk from retiring a colour, which this section used to imply it was not.** Measured in
`node_modules`: `registerTextStates` parses a value that is no longer in the palette to `undefined`,
and `lexical@0.41`'s `NodeState.toJSON` deletes a key whose value equals its default — so a colour
removed from `BRAND_TEXT_COLORS` is **stripped out of stored documents** on the next admin save, and
re-adding it later will not bring it back. Adding a colour is free; removing one needs a repair that
rewrites the affected nodes first. `docs/TRAPS.md` has the trace. After any Payload upgrade, re-read the feature's `.d.ts` and run
`tests/int/richTextColors.int.spec.ts`, which constructs the feature and reads its props back — so an
API change fails a test rather than a page.

### 20. Enter in a heading makes a paragraph, not a line break

`InlineRichText` renders a paragraph break as `<br>`, so **the page is correct**; only the admin shows
two paragraphs where the page shows two lines.

**The cost was measured by writing it.** The code is ~40 lines. What stopped it is the dependency:
`lexical` and `@lexical/react` are **not installed** — Payload vendors them and pnpm does not hoist
them — so they must be added and **pinned to the version `@payloadcms/richtext-lexical` vendors**
(0.41.0 today). Two copies of Lexical in one bundle is a subtle failure, and the pin needs re-checking
on every upgrade.

### 21. Payload boots in ~7 seconds, and that is now load-bearing

Up from low single digits, because the config carries 585 rich-text fields. Two integration specs
that boot Payload exceeded vitest's 10s hook timeout and were reported as **skipped**, not failed —
the suite went green while checking nothing. Their timeouts are 30s now, but the number keeps
creeping.

### 22. `Specialists.availabilityHighlight` is written by the seed and read by nothing

A hidden, deprecated checkbox that `seedAvailability.ts` still writes on **every** run. Four
specialists carry `true`; a repo-wide search for a read outside the seed returns nothing.

The orphan-field guard **already knows** — it is allowlisted with a reason. The point is that an
allowlist entry is a *deferral*, not a resolution. Removing the field is a destructive schema change
that stops the dev push on the invisible "Accept warnings?" prompt, so it should be done in the same
pass as a fresh baseline, where the column simply never gets created.

### 23. The TryBooking form does not load on a client-side navigation

By design. TryBooking's `widget.js` scans for `.tryb-widget` once at `load`, sets a private global and
exposes no re-init API, so a div React inserts during a soft navigation never renders.

**What a visitor sees:** the **Book on TryBooking** button instead of the embedded form. They can
still book, and a fresh page load — including every `target="_blank"` link — embeds normally. Forcing
re-initialisation means deleting a private global and re-injecting their script: an undocumented
internal on a site with no maintainer. `tests/e2e/tryBooking.e2e.spec.ts` asserts this degraded state
deliberately.

### 24. This deployment runs without email, on purpose

Covered in full at [§4](#4-email--read-this-even-if-you-skip-everything-else). Recorded here so it
cannot be forgotten on the host that matters. **The risk this entry exists for is leaving
`ALLOW_MISSING_SMTP` set on the site that takes real enquiries.**

### 25. Nothing exercises the seed

`grep -rln "seedVerify" tests/` returns **nothing**. The seed is ~30 repair steps plus the whole
content fixture, and no test runs any of it.

**Not theoretical.** Four defects shipped under a fully green suite and were found only by wiping a
database and reseeding: a jsonb column queried with `contains` (a hard Postgres error that stopped the
seed dead); the same file's `typeof === 'string'` guard, which skipped every document and logged a
success count for work it had not done; `.includes` on a rich-text `title`; and `norm()` returning
`''` for every rich-text link label, killing three link fixes.

**The local database cannot substitute for a fresh one** — it holds 0 en-dashed events against 11 in
the fixtures. The reproduction needs `createdb` → `migrate` → seed. A smoke test doing that is slow
and needs `createdb` in the test environment, so it likely becomes a separate command.

### 26. `LABEL_SCOPED_FIXES` is not tracked, so a stale key is silent

`repairMatch.ts` provides `matchTracker`, which reports at error level when a table's key matches
nothing. `seedLinkRepairs.ts` wires it to two tables and **not** to `LABEL_SCOPED_FIXES` — which is
exactly how the gateway-card link fix stayed broken while carrying two independent faults on one line.
Its keys are *current* copy that must still be there, so zero matches means drift. Left undone only
because `matchTracker.report` throws outside production.

### 27. The text-colour palette cannot be extended by an editor

Staff asked whether they could **add a colour**. The 16 entries are all editable — Site Settings →
Brand colours sets what each one *is*, and changing "Mid grey" repaints every word already using it.
What cannot be added at runtime is a sixteenth-and-first entry, and the blocker is in Payload, not in
our wiring:

- `TextStateFeature`'s `state.color` is resolved once inside `sanitizeConfig` — which is what
  `getPayload()` awaits — and memoised for the process lifetime. `initLexicalFeatures` copies
  `clientFeatureProps` verbatim per request; there is no hook, and `toolbarGroups` has no per-item
  predicate.
- Its compiled `parse` rejects any key not in that list, so a fetched-later colour would not survive
  a save even if it could be shown.

**Pre-declared empty slots were considered and rejected.** Six spare rows in Site Settings would
work mechanically, but an unfilled slot still renders as a pickable toolbar swatch whose `var()`
resolves to nothing — text that visibly does not change. That is the exact failure invariant 2 and
`TRAPS.md` [#i43](docs/TRAPS.md#i43) exist to prevent, it cannot be hidden (the admin does not load the brand tokens at
all), and it would ship four permanently-dead controls to answer a request for one live one.

The block-level dropdown *alone* could be made dynamic, following the `CssClassSelect` precedent.
That was not done because it breaks the documented "two controls over one palette" architecture: the
same colour would exist in the dropdown and not in the toolbar. If it is ever wanted, it is a
deliberate decision with its own entry here, not a rider on a palette change.

### 28. `computedSnapshot.mjs` is not deterministic on `/about`

The harness's own header says a diff is "a real bug, not a tolerance". Measured: capturing a baseline
and immediately comparing it against the **same unchanged code** four times gave **2, 3, 0, 0**
changed nodes. The movement is `marginLeft`/`marginRight` on a `SECTION > DIV` on `/about` and on a
team profile, flipping between `0px` and `130px` — an `auto` centring margin resolving against a
parent whose width has not settled when the snapshot is taken.

Left as-is because the fix is a settle, not a threshold, and a tolerance would blunt the one tool
that catches a reflow. **How to use it meanwhile:** re-run a non-empty diff two or three times, and
check which property *indices* differ. Confined to 30/31 on those two routes, it is this. Anything on
index 0 (`color`), or on any other node, is real.

### 29. Drag-ordering specialists means dragging across pages

The Specialist Directory's **Custom** sort reads the drag order set on the Specialists list. That
works, but the admin list shows **10 rows of 26**, so moving someone from the bottom to the top means
dragging them up three pages. Raising the collection's list `limit` would fix it in about a line; it
was left alone because 26 rows on one page is a judgement about the admin UI rather than a defect,
and nobody has asked for it yet.

Two things about Custom that read as faults and are not, both now said plainly in the control's own
description: dragging changes nothing on the public site unless that block's Sort order is set to
Custom (it ships on Surname), and the drag order starts alphabetical by surname, so switching to
Custom looks like nothing happened until a row is actually moved.

### 30. An availability edit can take up to an hour to reach the live site

Reported on 2026-08-25 as *"the availability chip tooltip never renders even with a note saved"*.
**The code is correct.** Locally, saving a note put `title="…"` in the served HTML within two
seconds, and a production build served all 12 chips with a `note` key in the payload — so the
wiring is there.

**What is measured, and what is not.** The caching is real. Taken against a production build of
this site (`next start`, not `pnpm dev` — the dev server does not cache and cannot reproduce this):

```
$ curl -sD- -o/dev/null https://<your-host>/make-a-booking
cache-control: s-maxage=3600, stale-while-revalidate=31532400
x-nextjs-cache: HIT
```

`x-nextjs-cache: HIT` means the page is served without re-rendering, and the
`stale-while-revalidate` window is **roughly a year** — so once the 3600s freshness lapses, a
visitor is served the *stale* page while the refresh happens behind them, and only the reload
*after* that shows the change. An editor saving a slot and reloading can therefore see the old page
well past the hour. That is the "appears to work when it doesn't" shape, and it applies to every
availability edit, not just the note.

**Not confirmed:** whether the reported note ever reached the database it was reported against.
There were **zero** sessions carrying a note there when it was checked, so it was either never saved
or removed after the test, and the two cannot be told apart after the fact. Do not record the cache
as the proven cause of *that* report — record it as a measured fault that would produce exactly that
symptom.

**Take this reading before changing anything.** `safeRevalidatePath` deliberately never throws —
losing the write is worse than serving a stale page — so a failed purge is visible *only* in the
server log:

```
Revalidation skipped (path /make-a-booking): … The write itself succeeded; affected pages may serve stale content until the next change.
```

That line is real and reachable: a full `pnpm test:e2e` run produces it as
`Invariant: static generation store missing in revalidatePath /`. Save a session on the production
host, then grep its log for `Revalidation skipped`. If it appears, the purge is failing and the fix
belongs in the hook's calling context. If it does not, the purge works and the delay is the SWR
window. **Do not "fix" this by lowering `revalidate` before taking that reading** — it would mask a
broken purge behind more frequent rebuilds.

Editors are told about the delay in `docs/ADMIN-GUIDE.md` so that a slow update does not get
re-entered as a lost save.

### 31. What still sits two-across on a phone

The mobile pass on 2026-08-25 collapsed every **card** grid to one column below 600px. Two things were
left two-across on purpose, and both were measured at 390px:

- **`form-row`** — two short fields side by side at 160px each. Stacking them makes the enquiry form
  noticeably longer for no legibility gain; 160px holds a first name.
- **The checklist rows** (`20px 306px`) — an icon column and a text column, i.e. a list item, not two
  cards. Collapsing it would put the tick above the text.

Everything else — `.services-grid`, `.spec-grid`, `.specialty-grid`, `.audience-gateway-grid`,
`.testimonials-grid`, `.vf-icon-list`, `.process-steps` — is a single column below 600px, asserted by
`tests/e2e/responsive.e2e.spec.ts`.

Note the **columns** control on those blocks now applies only above 600px. That is the intent: an
editor choosing "4 columns" is choosing a desktop layout, and four 69px cards on a phone was the bug.

## 11. Deliberate departures

**Read this before "correcting" anything back to the design reference.** Each item below differs
from `.design-reference/` on purpose — most at the client's request, one because the reference fails
to execute its own intent. Every one will read as a *defect* to somebody diffing the build against
the reference, and `referenceCssDiff.mjs` cannot catch any of them: it compares declarations, not
which branch of a component renders.

They were extracted from a 3,700-line design log before it was deleted, precisely because these are
the decisions a new developer would otherwise revert in good faith.

### 1. A date calendar where the reference draws a photo placeholder

The reference renders a blue `Event Photo` box on every listing row. We render an outlined calendar
glyph with the day and month, on the listings *and* the `/events` hub cards. The reference's own
`.event-list-calendar*` rules (`events.css:749–806`) are dead in the reference — leftovers its JS
never uses — which is how we came to have them. For the same reason we do **not** draw the 3px accent
rule that block declares (`events.css:753`): the reference never renders it, and it had made the
listing rows disagree with the hub cards. That omission is in `referenceCssDiff`'s `EXPLAINED` for
`events`.

Chosen because a placeholder box tells a visitor nothing while the date is the single most useful
thing about an event. It is only ever a **fallback**: uploading **Event photo** on the event shows
the photograph instead, in both places.

*To reverse:* render `.event-list-photo` with a `<span>` label instead of `<EventCalendar />` in the
three call sites (`EventsExplorerClient`'s `EventRow` and `EventCard`, `ArchiveBlock`'s event card),
delete `src/components/EventCalendar/`, and delete the calendar CSS.

### 2. No pagination control on a single page

The reference always draws `‹ 1 ›`; ours returns `null` at `pages <= 1`
(`EventsExplorerClient.tsx`, `Pagination`). Chosen because a control that cannot go anywhere is
noise. *To reverse:* delete the `if (pages <= 1) return null` guard — the rest of the component
already matches the reference's `renderPagination` verbatim, disabled arrows included.

### 3. No hover effect on the booking-portal tiles

The reference declares `.portal-opt4-tile:hover { background: rgba(255,255,255,0.17) }`; we declare
nothing, and removed the `transition` with it.

Its tiles — Specialist Availability, Download CV, Sample Redacted Report — are non-interactive
`<div>`s in the reference exactly as they are here, so the hover promised a click that could never do
anything. The band appears on 26 specialist profiles plus `/specialists`,
`/specialists/specialty-list` and `/specialists/specialist-panel`, so it was wrong in 29 places.

This is the reference failing to execute its own intent rather than us mis-porting it — the same
shape as its `ph-activity` icon, which is not in Phosphor's duotone set and draws nothing. **No
`referenceCssDiff` family matches `.portal-opt4*`**, which is why this entry and the comment in
globals.css both exist. Guarded by `frontend.e2e.spec.ts` → *"nothing that cannot be clicked reacts
to the pointer"*.

*To reverse:* restore the two declarations. But if the tiles ever become links, restore the hover
**and** rewrite that guard — it asserts they are not clickable, so it would otherwise be satisfied
by deleting the effect again.

### 4. Claim Types get their own heading

The reference lists claim types and assessment types together under a single **Assessment Types**
heading, and has no Claim Types heading at all. We split them.

An assessment type is a thing done (file review, IME, JME); a claim type is the matter it is done for
(MVA, public liability). They are different questions, maintained in different collections. Measured:
23 of 26 specialists carry claim types, 90 relationships — so a Claim Type never appeared under its
own name anywhere on the site while being a collection an editor maintains separately.

The heading is editable at **Page settings → Specialist Profile → Claim Types**. A profile without
claim types renders no stray heading and no empty block.

### 5. A photograph in the claimant process column

`.claimant-process-left` in the reference holds a section label, an `h2` and one paragraph — **no
image**. A photograph beneath the intro was asked for, and supplied as a mockup.

Four fields on the **Process Steps** block carry it, all conditioned on `variant === 'claimant'`,
which is used on exactly one page (`for-claimants`). `imagePlaceholder` **defaults to `false`** so
that adding the fields moved nothing — measured at 9,292 nodes on both sides of the change — and the
one block that should show the tile is switched on as *data*, by
`src/endpoints/seed/repairClaimantProcessImage.ts`.

### 6. The founder photograph is portrait, not square

`.leader-img-main` was `aspect-ratio: 4/4`. The supplied photograph of Wes Lerch is 934×1400 (2:3),
so a square box cropped away the top and bottom of the frame. Changed to `2/3`.

**Profile pages now share that proportion**, so this is no longer a one-off. Both profile templates
framed every portrait square — `.staff-photo` at `1/1`, `.profile-avatar` at a fixed 230×230 — and
were doing the same crop to every photo. They now default to `2/3` and carry a per-person **Photo
shape on the profile page** control (Tall / Portrait / Square) on the Team and Specialists records.
Do not "restore" either to a square: the square was the bug in both cases — the founder
photograph above, and every portrait on both profile templates. Exactly one
Leadership Spotlight block exists site-wide, on `/about`; `.leader-badge` is absolutely positioned
against that box and was re-measured rather than assumed.

### 7. `/in-the-loop` drops the tabs of sections that render nothing

The reference has content in all eight of its sections, so its sticky `.ni-section-nav` can afford
eight pills. Ours had **8 tabs, 8 anchors and four rendered cards**, all of them in QA Insights.

A `hideWhenEmpty` field on `ArchiveBlock`, `FeaturedArticles` and `ResourcesGrid` renders the block
`null` when it has nothing to list, and the Section Nav drops the pill pointing at it. **The nav
decides that through the section's own query** — each block's filter lives in a `query.ts` beside it,
used by the block to fetch and by `src/blocks/sectionEmptiness.ts` to count — so the two cannot
disagree. Decided on the server; measured identical with `javaScriptEnabled: false`.

The scroll hint was deleted in the same pass, as was the bare `<div id>` fallback that existed only
to stop `links.e2e.spec.ts` flagging `#featured` and `#resources`.

### 8. A rule between Upcoming and Past events, where the reference uses a band

The reference puts each group in its own `<section class="events-summary-section">` and tints the
past one `bg-soft` (`#f6fbff`). We render both groups inside a **single** `<Section>`, so neither that
class nor its band could ever reach the page — measured: 0 in the DOM, both groups
`rgba(0, 0, 0, 0)`, 52px apart. The two headings ran together.

Two independent controls on the Events Explorer block, under *Separating Upcoming from Past*, both
**off by default**: a divider line (None / Line / Dots / Gradient, plus Full / Narrow width) and a
background tint for the past group. `src/endpoints/seed/repairEventsSeparator.ts` turns on the chosen
one as data.

### 9. The ROLE pin is gone from team profiles

Every reference team profile renders a `.staff-sidebar-item` with a `ph-briefcase` glyph, the label
**Role** and the member's role, directly beneath the photo. It was a faithful port and it came out at
the client's request: the same role is already printed under the name in the hero two hundred pixels
above it.

`TeamSettings.labels.roleLabel` went with it — a label for something nothing renders is a control an
editor can change that does nothing, which `adminControls.int.spec.ts` exists to fail on.
**Qualifications stay**: they render in the same blue pill, and unlike the pin they are ours.

### 10. Aligned card heights in the `/services` admin section

The reference aligns only the reporting cards (`flex-direction: column`, `p { flex: 1 }`,
`link { margin-top: auto }`) and leaves the admin ones genuinely ragged — 283 / 264 / 264 / 309.
Aligning both was requested; ours are 279 ×4. Recorded in the CSS beside the rule.

### 11. Five smaller ones, all recorded in `referenceCssDiff`'s `EXPLAINED`

The IME card keeps its white→`#f7fbff` body gradient (reference: flat white) — asked for. Its item
icons are centred against the whole item (reference: top-aligned with a 1px optical nudge, which is
meaningless once centred) — asked for. Section padding stays the editable `--space-normal` preset and
the column count stays the editor's `--vf-cols`, rather than the reference's literals, because an
editor controls both. `stroke` is not set on filled Phosphor icons.

### 12. The specialist carousel is on the events hub

It was removed once, on the grounds that it was "not present in either Target page". That comparison
only ever looked at the two listing pages, so it could not have found it. It is on the hub, and it is
back. See `src/endpoints/seed/seedHubs.ts`.

### Not a departure, but do not "fix" it either: `.page-hero h1` weight

The reference holds this rule **twice and the two copies disagree**. The shared sheet
(`.design-reference/assets/css/styles.css:2587`) says `700`. Every one of the nine reference pages
redeclares `.page-hero h1` in an inline `<style>` that loads after the `<link>`, at equal
specificity, and wins with **800**.

A past pass read the shared sheet and "aligned" the build from 800 to 700 — on 59 pages plus every
event detail page — and wrote it up as a *correction*, which is what stopped anyone re-checking it.
It took the *size* from the inline rule and the weight from the shared one, so it had both copies in
front of it.

`frontend.e2e.spec.ts` guards this by reading the expected weight **out of the reference page** and
comparing it to what the build computes. It does not hardcode 800 — a number in a test would have
been just as wrong as the number in the CSS, and would have locked the mistake in.

