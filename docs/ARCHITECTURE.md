# Architecture

*Added 2026-08-26. Last reviewed 2026-08-26.*

The VERIFY Medico-Legal Solutions website: how it is put together, and where each part lives.

## What this document is, and what it deliberately is not

This is a **map**. It describes shape — which subsystems exist, what each one owns, and how a request
becomes a page — so someone new can find their way without reading the whole tree first.

It restates nothing that can go stale. **No test counts, no route counts, no schema figures, no
invariant text.** Those live in exactly one place each, and this file points at them rather than
keeping a second copy that can quietly disagree.

That restraint is the whole reason this document is allowed to exist. `CLAUDE.md` records that the
project's documentation was **ten files and 9,554 lines**, and that it collapsed to five because "a
change lands in every document it touches" could not be held at that size: one day after a full
update pass, three documents gave three different counts for the same shell script. A sixth file is
only safe while it holds what the other five do not.

**The five records this one defers to:**

| File | Read it for |
|---|---|
| `README.md` | Running a box, deploying, testing, and every known-imperfect thing with its measured cost |
| `CLAUDE.md` | The invariants — the rules that must not be broken, and what guards each |
| `docs/TRAPS.md` | Why each rule exists, and every measurement that has already misled someone |
| `docs/ADMIN-GUIDE.md` | What each thing in the admin sidebar *is*, for the non-technical editor |
| `src/Styles/HOOKS.md` | Every editable appearance control and where it lives |

When this document and one of those disagree, **the other one is right**.

---

## The stack

- **Next.js 16**, App Router, React Server Components
- **Payload 3** as the CMS, mounted inside the same Next app rather than beside it
- **PostgreSQL** via `@payloadcms/db-postgres` (Drizzle underneath)
- **Tailwind 4** plus a large hand-written stylesheet
- **pnpm**, TypeScript throughout, Vitest for unit/integration, Playwright for browser tests

Payload is not a separate service. It shares the Next process, so the CMS admin, the REST and GraphQL
APIs, and the public site are one deployable.

## The two halves of `src/app`

```
src/app/
  (frontend)/     the public site
  (payload)/      the admin UI, REST API, GraphQL
```

Two Next route groups, two layouts, one server.

`(payload)` is almost entirely Payload's own machinery: a catch-all admin route, a catch-all API
route, GraphQL. The parts we own there are the admin's `custom.scss` and the generated `importMap.js`
that registers custom admin components.

`(frontend)` is the site. Its shape:

| Route | Serves |
|---|---|
| `/` and `/[...slug]` | **Pages**, resolved through the nested-docs plugin |
| `/in-the-loop/[stream]/[slug]` | Posts, grouped by the `streams` taxonomy |
| `/specialists/profiles/[slug]` | Specialist profiles |
| `/about/team/[slug]` | Team members |
| `/events/event/[slug]` | Events |
| `/search` | Site search |
| `(sitemaps)/*.xml` | Sitemaps rendered from Payload at request time |
| `/next/preview`, `/next/exit-preview` | Draft preview in and out |
| `/next/seed-verify` | The seed endpoint |
| `/api/icon/*` | Icon artwork and the icon library list |

**Every document URL is built by `src/utilities/routes.ts`** — `docPath`, `postPath`,
`specialistPath`, `teamPath`, `eventPath`. Link components, blocks, revalidation hooks, sitemaps,
redirects and search sync all import from it. Nothing interpolates a path inline. A `null` return
means "render this unlinked", not "guess".

Specialist profiles sit one level down at `/specialists/profiles/` on purpose: a dynamic segment at
`/specialists/[slug]` would outrank the `[...slug]` catch-all and swallow the CMS pages nested under
`/specialists`.

## Content model

Content is split three ways, and the split is meaningful.

**Collections** (`src/collections/`) — things there are many of. Pages, Posts, Events, Media, Users,
plus the domain records: Specialists, Team, Services, Resources, Offices, Testimonials,
AvailabilitySessions, Icons.

**Taxonomy collections** — small lists that classify the above: Specialties, SpecialtyCategories,
ClaimTypes, AssessmentTypes, AreasOfExpertise, Accreditations, Locations, Streams, Categories,
Departments, EventTypes. They are collections rather than hardcoded `select` options so staff can
extend them without a deploy. Directory blocks filter on them, so **a new filter axis is a new
collection, never a new option list**.

The specialist data layer is a four-axis taxonomy — specialties, claim types, assessment types,
areas of expertise — with accreditations, locations and departments alongside.

**Globals** (`src/Header/`, `src/Footer/`, `src/SiteSettings/`, …) — one-of-a-kind settings and
page-level copy. Header, Footer, SiteSettings, SpecialistProfile, SpecialistAvailability,
ArticleSettings, EventsSettings, TeamSettings, CustomStyles, DesignSystem, IconLibrary. Page-level
and section-level wording lives here rather than in components, so it is editable.

`payload.config.ts` registers everything, and **its array order is load-bearing twice over**:
taxonomy lookups come before the content that references them, and the admin sidebar derives its
group order from first appearance while scanning that array. There is no way to declare sidebar
order; the array *is* the order.

Admin labels deliberately follow the site rather than the slug — `posts` shows as **Articles**,
`categories` as **Topics**.

## The page builder

This is the largest subsystem and the one most of the site is made of.

**A block is a folder** in `src/blocks/<Name>/` containing `config.ts` (a Payload `Block`) and
`Component.tsx`. Adding one touches several files — the config, the component, the renderer's map,
the Pages `layout` array, and optionally the nestable lists. `CLAUDE.md` has the checklist.

**`RenderBlocks.tsx` is recursive, with two contexts.** At `top` it applies a spacing wrapper; at
`nested` — used by the Section and Row components for their children — it renders `bare`, so nested
blocks inherit the parent's background and container width instead of re-banding. Nesting is bounded
to `Section > Row > block`.

Three registration lists decide where a block may appear:

- `RenderBlocks.tsx` — block type → component, plus the `selfSpaced` set for blocks that wrap
  themselves in `<Section>`
- `nestable.ts` — blocks allowed inside Section and Row
- `tabContent.ts` — blocks allowed inside Tabs, which re-lists rather than importing `nestable.ts`,
  because importing would create a cycle that evaluates to `undefined`

**Layout primitives versus bespoke blocks.** `Section` (banding, container width, padding, motion) and
`Row` (responsive columns) are containers; `Heading`, `Text`, `Button`, `Image`, `Spacer`, `Divider`
and `IconBlock` are nestable atoms. Editors compose layouts from these. The standing preference is to
**build capability rather than hardcode a design**: when a reference page needs a different look, add
a variant field to the block that emits a modifier class, so every instance gains it — not a rule
scoped to one URL.

**Heroes are a parallel system**, easy to miss. Pages carry one `hero` group defined in
`src/heros/config.ts`; a `type` select drives conditional visibility, and `RenderHero.tsx` maps type
to component. Adding a hero type means touching both files.

## Fields, and the shared helpers

`src/fields/` is where field definitions are centralised so blocks stay consistent.

`blockFields.ts` supplies the bundles almost every block uses — `backgroundField`,
`containerWidthField`, `spacingFields`, `motionField`, `sectionHeaderFields`, `anchorIdField`,
`iconField`, `cssClassField`. Because these arrive through a spread, a field added to a bundle appears
on dozens of blocks at once, which is powerful and is exactly how a control once shipped read by
nothing.

**Copy fields are rich text.** `inlineRichTextField` for one-line copy (headings, card titles, button
labels), `richBodyField` for prose. Both render through `src/components/RichText/Inline.tsx`. A value
is never interpolated into a string — where a machine needs the words (an `aria-label`, a search
haystack, a `{count}` template) it is flattened with `richTextToPlain` at that point.

**Colour is one palette with two controls**, defined once in `src/fields/richTextColors.ts`: a
block-level select covering a whole heading, and a toolbar swatch covering a selection. Both emit the
same `.vf-tc-*` class and both store a *key*, never a hex, so Site Settings can repaint every coloured
word at once.

**Custom admin components** live beside their fields: `IconSelect` (the icon picker),
`IconLibraryPicker` (the icon library screen), `CssClassSelect` (the strict class-preset picker),
`ColorPicker`. Each is registered through the generated `importMap.js`.

## Icons

Icons are their own small subsystem because they cross the site, the admin and the database.

- **The bundled set** is a fixed Phosphor registry in `src/components/Icon`, rendered as real
  components.
- **Everything else Phosphor ships** is served as SVG by `/api/icon/phosphor/[name]` and rendered as
  an empty `<svg>` painted through `mask-image`, so it takes the band's colour exactly as a bundled
  icon does.
- **Uploaded SVGs** live in the `Icons` collection. Nothing uploaded is ever served back: the file is
  normalised — recognised geometry kept, the SVG reconstructed, colours dropped — and the stored
  markup is what pages render.
- **The `IconLibrary` global decides what editors are offered**, from one admin screen that also
  handles uploading, renaming, recolouring and deleting.

An icon field stores a plain string, optionally carrying a colour (`brain`, `upload:12@white`), parsed
in one place: `src/components/Icon/value.ts`.

## Styling

Three layers, in override order:

1. **`globals.css`** — `:root` design tokens and the `.vf-*--<preset>` modifier classes that consume
   them. Everything below the token block is wrapped in `@layer verify`, and **that wrapper is load
   bearing**: an editor's custom CSS is injected unlayered, and unlayered beats layered at any
   specificity. Without it the escape hatch cannot escape.
2. **Design System global** — editors set the *values* behind each preset; `designTokenStyle()` turns
   them into custom properties on the page. Site Settings feeds brand colours the same way.
3. **Custom Styles global** — arbitrary global CSS plus named class presets, offered to `cssClass`
   fields through a strict picker.

Block fields therefore store **preset slugs, never raw CSS values**. Editor-supplied values that end
up inside a `<style>` tag are sanitised by `src/utilities/cssTokens.ts`.

`src/Styles/HOOKS.md` is the editor-facing reference for all of this, and **it cannot move**: an
integration test reads it by path and a dead-CSS tool builds its allowlist from it.

## Caching and revalidation

Globals are read through `getCachedGlobal(slug, depth)` and tagged `global_<slug>`. Collections with a
detail page have their own `hooks/revalidate<Name>.ts`, which purges the path built by `routes.ts` —
including the *old* path when a published document moves — plus the relevant sitemap tag. Most content
collections additionally run a shared site-wide revalidation, because their records also surface
inside blocks and directories on arbitrary pages.

**Every purge goes through `src/utilities/safeRevalidate.ts`**, never `next/cache` directly, and hooks
honour `context.disableRevalidate` so the seed does not trigger a revalidation storm.

Frontend routes are ISR. That matters more than it looks: in production an edit appears when
revalidation succeeds or when the window lapses, so `pnpm dev` cannot reproduce a staleness bug.

## Plugins, and what they own

Payload plugins supply five subsystems, configured in `src/plugins/`:

- **nested-docs** — the page tree. A page's real URL is the chain of its ancestors' slugs.
- **redirects** — the editor-managed redirect collection. (Not to be confused with the root
  `redirects.ts`, which is a Next config redirect and is not editable.)
- **form-builder** — the enquiry forms, including the drawer form used site-wide.
- **search** — a synced search collection, with `beforeSync` shaping what gets indexed.
- **seo** — meta fields and previews.

Email goes through nodemailer when SMTP is configured. When it is not, a deliberate adapter logs
`[EMAIL NOT SENT]` at **error** level rather than falling back to Payload's console adapter, which
resolves successfully and is indistinguishable from a real send.

## The seed

`src/endpoints/seed/` is a set of modules — homepage, services, data layer, specialists, events and so
on — run by `POST /next/seed-verify`. It is **idempotent and non-destructive**: it creates the page
tree by slug and fills globals, and re-running it does not clobber edited content.

Two things about it worth knowing before changing it:

- Whether a page has been written yet is decided by `isUnauthored`, never by counting blocks. A repair
  writes only into an absence.
- Content links live in the database, so editing a seed file fixes nothing on its own. Link
  corrections are paired with unconditional repairs that run every time.

Nothing in `tests/` runs the seed, so a green suite says nothing about it. Seed changes are verified
against a scratch database.

## Schema and migrations

Local development uses Payload's **dev schema push**: the database follows the config on boot, and
there are no local migrations. Production is the opposite — migrations are authored and applied
explicitly on the server.

`src/migrations/` holds **one baseline** rather than a chain, because the box is rebuilt rather than
migrated forward. Alongside it are `REFERENCE-*.sql` files: hand-written DDL for conversions the dev
push cannot perform unattended, each documenting why.

The push is the single most dangerous part of local development. A destructive change — dropping a
column, converting a `select` to `text` — stops it on an interactive prompt inside a backgrounded log,
and every request queues behind it. `docs/TRAPS.md` catalogues the three ways this has happened and
what each looked like.

## Testing

Four layers, deliberately different in kind:

- **`tests/int/`** — Vitest. Pure-function units, plus config-walking guards that assert structural
  properties: that no editable field goes unread, that copy fields are rich text, that a colour option
  has a rule, that an icon field is not an enum.
- **`tests/e2e/`** — Playwright. Everything that only a browser can settle: computed colour, layout at
  a real viewport width, hydration, whether a link has a target.
- **`tests/int/prove-guards.sh`** — the guards on the guards. It breaks the code deliberately and
  asserts each guard goes red. A guard that has never failed is not evidence.
- **`tests/visual/`** — six Node tools that `pnpm test` does not run: a computed-style snapshot gate, a
  design-reference declaration diff, a false-hover audit, a dead-CSS finder, and two CSS codemods.
  Their output is **candidates, not verdicts**; each has already produced a false positive worth
  reading about before acting.

`README.md` records what each suite counts and the command that measures it. Run the command; do not
trust a written number.

## Environments

**Local** is fully isolated: a dedicated Postgres database, a local `.env`, throwaway admin
credentials, and schema pushed on boot. It never touches production.

**Production** builds and migrates on the production host: commit and push, the host pulls,
generates types, creates and runs a migration, builds. A boot-time environment check refuses to start a server missing
the variables whose absence would otherwise degrade *invisibly* — mail credentials, the public URL,
the preview secret — because a half-alive server passes a deploy smoke test.

`README.md` has the exact sequence, and the flags that exist for standing a box up before mail
credentials do.
