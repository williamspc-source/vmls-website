# VERIFY Medico-Legal Solutions — Handover and Operations Manual

**Spencer Winchester · 26 August 2026**

Everything needed to take a zip of the source code and end up with a live site under VERIFY's
control, then run it, edit it and change it. It is all in this one file so you are not hunting
through the codebase mid-task.

## Before you start

**There is no running copy.** The site was built and proven on my own server, on my own domain.
Both leave with me. Standing it up on a server VERIFY controls is the first job; Part 2 covers it,
one command at a time.

**This file is a snapshot, dated above.** Six documentation files ship inside the code and stay
current as the code changes. This one will not. Where they disagree, the code's copy is right.
Appendix D lists them.

**It is long. You will read a fraction of it.** The table below says which.

## Who reads what

| You are | Read |
|---|---|
| **Standing the site up** | Part 1, then **Part 2** end to end, then **Part 3** once staging is proven |
| **Editing content** | **Parts 6 and 7** |
| **Changing the code** | Parts 4, 8 and 5 |
| **Signing off go-live** | Parts 1 and 3, the email section in Part 5, and Part 9 |
| **Moving a domain between accounts or registrars** | **Appendix A** — a different job from Part 3 |

Editors: Parts 6 and 7. That is the whole list.

Read Parts 2 and 3 through before you start typing. Both have decisions that depend on earlier
ones — how you expose the site, lowering a DNS timer a day ahead, whether FortiTech is on the call.

**Two registers stayed in the code**, and a developer will want both: `docs/TRAPS.md`, every
measurement that turned out to be a lie, which Part 8's rules link straight into; and `README.md`
§10 and §11, everything knowingly imperfect and every deliberate difference from the design
reference. They are reference for changing the code, not for running the site.

## The parts

| Part | Covers | For |
|---|---|---|
| **1** | What this is, what you were handed, what you must provide | Everyone |
| **2** | **Standing it up** — Ubuntu, database, build, service, HTTPS, email, content | Whoever deploys |
| **3** | **Going live** — pointing `vmls.com.au` at the new site without breaking the old one | Whoever deploys, plus FortiTech |
| **4** | **Architecture** — the map, then the detail | Whoever changes code |
| **5** | **Running it** — settings, email, local development, deploys, testing, images, backups | Whoever operates it |
| **6** | **The admin** — every item in the sidebar | Content editors |
| **7** | **Appearance** — colours, fonts, spacing, block options, custom CSS | Content editors |
| **8** | **The rules** — 59 invariants and what guards each | Whoever changes code |
| **9** | **When it breaks** — symptom to cause, and when to escalate | Whoever is on the spot |

| Appendix | Covers |
|---|---|
| **A** | **Domain transfers** — moving DNS between Cloudflare accounts, moving a registration between registrars |
| **B** | **Glossary** |
| **C** | **Command reference** |
| **D** | **The documentation inside the code** |

## How this was put together

Eight documents, merged. Where two covered the same ground the fuller one was kept and anything
unique to the other folded in, so the seed, the email setup and the troubleshooting each appear
once — in the part you would be standing in when you need them.

Every number was re-measured against the repository on the date above rather than copied forward.
Where a figure can go stale the command that measures it is printed beside it. Run the command.

## Full contents

*Parts and their sections. Subsections below that are not listed.*


**[Part 1 — What this system is, and what you were handed](#part-1--what-this-system-is-and-what-you-were-handed)**

- [What this system is](#what-this-system-is)
- [What you were handed, and what you must provide](#what-you-were-handed-and-what-you-must-provide)
    - [What the zip carries that Git will not](#what-the-zip-carries-that-git-will-not)
    - [Where the content comes from](#where-the-content-comes-from)
    - [Project status — what's done, and what remains](#project-status--whats-done-and-what-remains)
- [How the website works (the non-technical picture)](#how-the-website-works-the-non-technical-picture)
- [The infrastructure it needs](#the-infrastructure-it-needs)
    - [How a request reaches the site](#how-a-request-reaches-the-site)
    - [What that host has to provide](#what-that-host-has-to-provide)

**[Part 2 — Standing it up: from zip to running site](#part-2--standing-it-up-from-zip-to-running-site)**

- [Step 0 — What you need before you start](#step-0--what-you-need-before-you-start)
- [Step 1 — Put the code in a repository](#step-1--put-the-code-in-a-repository)
- [Step 2 — Prepare the Ubuntu server](#step-2--prepare-the-ubuntu-server)
- [Step 3 — Create the database](#step-3--create-the-database)
- [Step 4 — Get the code onto the server and configure it](#step-4--get-the-code-onto-the-server-and-configure-it)
- [Step 5 — Build the site and start it running](#step-5--build-the-site-and-start-it-running)
- [Step 6 — Put it behind the domain, with HTTPS](#step-6--put-it-behind-the-domain-with-https)
    - [Option A (recommended): Cloudflare Tunnel — no open ports](#option-a-recommended-cloudflare-tunnel--no-open-ports)
    - [Option B: Reverse proxy with nginx + a public port](#option-b-reverse-proxy-with-nginx--a-public-port)
    - [After either option](#after-either-option)
    - [Protecting the admin panel](#protecting-the-admin-panel)
    - [Switching the real domain over](#switching-the-real-domain-over)
- [Step 7 — Set up email](#step-7--set-up-email)
- [Step 8 — Load the starting content and create the first login](#step-8--load-the-starting-content-and-create-the-first-login)
- [Step 9 — Day-to-day, once it's live](#step-9--day-to-day-once-its-live)
- [Step 10 — If something goes wrong while standing it up](#step-10--if-something-goes-wrong-while-standing-it-up)

**[Part 3 — Going live: connecting the domain](#part-3--going-live-connecting-the-domain)**

- [Step 0 — What you need before the cutover](#step-0--what-you-need-before-the-cutover)
- [Step 1 — Decide how the new site connects to Cloudflare](#step-1--decide-how-the-new-site-connects-to-cloudflare)
    - [1.1 Install the Cloudflare connector on the new server](#11-install-the-cloudflare-connector-on-the-new-server)
    - [1.2 Create the tunnel in the Cloudflare dashboard](#12-create-the-tunnel-in-the-cloudflare-dashboard)
    - [1.3 Point the STAGING hostname at the app](#13-point-the-staging-hostname-at-the-app)
- [Step 2 — Tell the app its (staging) address and rebuild](#step-2--tell-the-app-its-staging-address-and-rebuild)
- [Step 3 — Verify the new site thoroughly on staging](#step-3--verify-the-new-site-thoroughly-on-staging)
- [Step 4 — Map the old site's URLs so you don't lose search rankings](#step-4--map-the-old-sites-urls-so-you-dont-lose-search-rankings)
- [Step 5 — Email from the new site](#step-5--email-from-the-new-site)
- [Step 6 — The cutover: point vmls.com.au at the new site](#step-6--the-cutover-point-vmlscomau-at-the-new-site)
    - [6.1 A day ahead — lower the TTL](#61-a-day-ahead--lower-the-ttl)
    - [6.2 Point the app at its final address](#62-point-the-app-at-its-final-address)
    - [6.3 Add the real hostnames to the tunnel](#63-add-the-real-hostnames-to-the-tunnel)
    - [6.4 If FortiTech controls the zone](#64-if-fortitech-controls-the-zone)
- [Step 7 — Verify after the flip](#step-7--verify-after-the-flip)
- [Step 8 — Rollback (if needed)](#step-8--rollback-if-needed)
- [Step 9 — After it's confirmed live (don't rush this)](#step-9--after-its-confirmed-live-dont-rush-this)
- [Step 10 — If something goes wrong during the cutover](#step-10--if-something-goes-wrong-during-the-cutover)
- [Reference — what changes and what doesn't](#reference--what-changes-and-what-doesnt)
    - [Reference — the commands for this part](#reference--the-commands-for-this-part)

**[Part 4 — The architecture](#part-4--the-architecture)**

- [4A — The map](#4a--the-map)
    - [What this document is, and what it deliberately is not](#what-this-document-is-and-what-it-deliberately-is-not)
    - [The stack](#the-stack)
    - [Fields, and the shared helpers](#fields-and-the-shared-helpers)
    - [Plugins, and what they own](#plugins-and-what-they-own)
    - [The seed](#the-seed)
    - [Schema and migrations](#schema-and-migrations)
    - [Testing](#testing)
    - [Environments](#environments)
- [4B — The detail](#4b--the-detail)

**[Part 5 — Running and maintaining it](#part-5--running-and-maintaining-it)**

- [The environment file](#the-environment-file)
- [Email — read this even if you skip everything else](#email--read-this-even-if-you-skip-everything-else)
- [Running it locally](#running-it-locally)
    - [Running in production mode locally](#running-in-production-mode-locally)
    - [Comparing a page against the design reference](#comparing-a-page-against-the-design-reference)
- [Before you deploy](#before-you-deploy)
    - [Committing](#committing)
- [Deploying](#deploying)
    - [After deploying, check these first](#after-deploying-check-these-first)
- [Testing, and the guards you should not delete](#testing-and-the-guards-you-should-not-delete)
    - [The doctrine](#the-doctrine)
    - [Tools `pnpm test` does not run](#tools-pnpm-test-does-not-run)
- [Images and where to upload them](#images-and-where-to-upload-them)
    - [Site-wide — **Admin → Site → Site Settings**](#site-wide--admin--site--site-settings)
    - [People and content — **Admin → Collections**](#people-and-content--admin--collections)
    - [Inside a page — **Admin → Pages → *page* → Layout**](#inside-a-page--admin--pages--page--layout)
    - [Before you upload anything](#before-you-upload-anything)
    - [Photos that have to survive a rebuild](#photos-that-have-to-survive-a-rebuild)
    - [Microsoft 365: the two that go wrong](#microsoft-365-the-two-that-go-wrong)
- [Backups, security, and maintenance](#backups-security-and-maintenance)

**[Part 6 — Using the admin: for content editors](#part-6--using-the-admin-for-content-editors)**

- [The idea, in five sentences](#the-idea-in-five-sentences)
- [1. The sidebar, as a map](#1-the-sidebar-as-a-map)
- [2. "I want to…" — where to go](#2-i-want-to--where-to-go)
- [3. Publishing](#3-publishing)
    - [Pages](#pages)
    - [Articles](#articles)
    - [Events](#events)
- [4. Reference](#4-reference)
    - [Services](#services)
    - [Resources](#resources)
    - [Offices](#offices)
    - [Testimonials](#testimonials)
- [5. Taxonomy](#5-taxonomy)
    - [Adding an event type](#adding-an-event-type)
    - [Adding a new team](#adding-a-new-team)
- [6. People, and Availability](#6-people-and-availability)
    - [Specialists](#specialists)
    - [Team Members](#team-members)
    - [Availability Sessions](#availability-sessions)
- [7. The rest](#7-the-rest)
    - [Media](#media)
    - [Your own icons](#your-own-icons)
    - [Icon Library *(under Design)*](#icon-library-under-design)
    - [Forms, and Form Submissions](#forms-and-form-submissions)
    - [Taking bookings with TryBooking](#taking-bookings-with-trybooking)
    - [Users, Redirects, Search Results](#users-redirects-search-results)
    - [Page settings](#page-settings)
    - [Recent changes to shared content](#recent-changes-to-shared-content)
    - [Site](#site)
    - [Design](#design)
- [7a. Formatting your words](#7a-formatting-your-words)
- [8. Admin word → site word](#8-admin-word--site-word)
- [9. Drafts, and what hides a page](#9-drafts-and-what-hides-a-page)
- [10. Traps](#10-traps)

**[Part 7 — Changing how the site looks](#part-7--changing-how-the-site-looks)**

- [1. How the three layers stack](#1-how-the-three-layers-stack)
- [2. "I want to change X" — where to go](#2-i-want-to-change-x--where-to-go)
- [3. Token reference, grouped by where you edit it](#3-token-reference-grouped-by-where-you-edit-it)
    - [Site Settings → Brand colours](#site-settings--brand-colours)
    - [Design System](#design-system)
    - [Not editable from a field](#not-editable-from-a-field)
- [4. The `-base` rule](#4-the--base-rule)
- [5. Limits of each editing surface](#5-limits-of-each-editing-surface)
- [6. Hook classes](#6-hook-classes)
- [6a. Formatting copy — bold, italic, links and colour](#6a-formatting-copy--bold-italic-links-and-colour)
    - [Colouring text](#colouring-text)
    - [`[[Brackets]]` still work, and are not the same thing](#brackets-still-work-and-are-not-the-same-thing)
    - [Pressing Enter in a heading](#pressing-enter-in-a-heading)
- [7. Built-in options (no CSS needed)](#7-built-in-options-no-css-needed)
- [8. Five-minute recipes](#8-five-minute-recipes)
- [9. Tips](#9-tips)
    - [A form or signup box is missing from the page — it is not CSS](#a-form-or-signup-box-is-missing-from-the-page--it-is-not-css)
    - [Two-tone sections: a heading band above the content](#two-tone-sections-a-heading-band-above-the-content)
    - [Article headings each have a shareable link — and renaming one changes it](#article-headings-each-have-a-shareable-link--and-renaming-one-changes-it)
    - [An event page's recap is the page — here is everything you can put on one](#an-event-pages-recap-is-the-page--here-is-everything-you-can-put-on-one)
    - [Feature cards can have a tinted header band](#feature-cards-can-have-a-tinted-header-band)
    - [Carousels — what you can change, and what the numbers mean](#carousels--what-you-can-change-and-what-the-numbers-mean)
    - [Which specialists a carousel shows](#which-specialists-a-carousel-shows)
    - [A TryBooking booking form on a page](#a-trybooking-booking-form-on-a-page)
    - [Step numbers can be `1` or `01`](#step-numbers-can-be-1-or-01)
    - [Split Feature rows have three looks, mixed and matched](#split-feature-rows-have-three-looks-mixed-and-matched)
    - [Image placeholders, and how to replace one](#image-placeholders-and-how-to-replace-one)
    - [The photo in "Your Examination Step by Step"](#the-photo-in-your-examination-step-by-step)
    - [A specialist's job title, qualification icons and accreditations](#a-specialists-job-title-qualification-icons-and-accreditations)
    - [Card styles on a Feature Grid, and what makes service cards centre](#card-styles-on-a-feature-grid-and-what-makes-service-cards-centre)
    - [Making a section's heading heavier](#making-a-sections-heading-heavier)
    - [The FAQ accordion — six settings, and every one leaves the others alone](#the-faq-accordion--six-settings-and-every-one-leaves-the-others-alone)
    - [A fifth section background: Pale blue](#a-fifth-section-background-pale-blue)
    - [The enquiry form — a card, and placeholders](#the-enquiry-form--a-card-and-placeholders)
    - [A button that opens a prefilled email](#a-button-that-opens-a-prefilled-email)
    - [The Booking Chooser can be a single, shorter panel](#the-booking-chooser-can-be-a-single-shorter-panel)
    - [Choosing an icon, and its colour](#choosing-an-icon-and-its-colour)
    - [Two-column rows that are not 50/50](#two-column-rows-that-are-not-5050)
    - [An icon list can be left-aligned](#an-icon-list-can-be-left-aligned)
    - [A section that hides itself — and its tab — when it has nothing to show](#a-section-that-hides-itself--and-its-tab--when-it-has-nothing-to-show)
    - [Telling Upcoming Events from Past Events apart](#telling-upcoming-events-from-past-events-apart)

**[Part 8 — The rules the code must not break](#part-8--the-rules-the-code-must-not-break)**

- [Read this before you change anything](#read-this-before-you-change-anything)
- [Invariants](#invariants)
- [Commands](#commands)
    - [What each suite guards — the fuller table](#what-each-suite-guards--the-fuller-table)
- [The developer environment and the deploy loop — the code-facing view](#the-developer-environment-and-the-deploy-loop--the-code-facing-view)
    - [Local development](#local-development)
    - [Deploy workflow](#deploy-workflow)

**[Part 9 — If something goes wrong](#part-9--if-something-goes-wrong)**


**[Appendix A — Domain transfers](#appendix-a--domain-transfers)**

- [A1 — Which transfer do you actually need?](#a1--which-transfer-do-you-actually-need)
- [A2 — Move a domain's DNS from one Cloudflare account to another](#a2--move-a-domains-dns-from-one-cloudflare-account-to-another)
    - [2.1 Measure the outage before you commit](#21-measure-the-outage-before-you-commit)
    - [2.2 Capture everything that has no export button](#22-capture-everything-that-has-no-export-button)
    - [2.3 Have the new account ready and access confirmed](#23-have-the-new-account-ready-and-access-confirmed)
    - [2.4 The move itself — don't pause between these two](#24-the-move-itself--dont-pause-between-these-two)
    - [2.5 Rebuild the DNS records](#25-rebuild-the-dns-records)
    - [2.6 Re-apply the zone settings, most important first](#26-re-apply-the-zone-settings-most-important-first)
    - [2.7 Point the registrar at the new nameservers](#27-point-the-registrar-at-the-new-nameservers)
    - [2.8 Verify — from outside, not just your own screen](#28-verify--from-outside-not-just-your-own-screen)
    - [2.9 Tidy up afterwards](#29-tidy-up-afterwards)
- [A3 — Transfer a domain's registration from one provider to another](#a3--transfer-a-domains-registration-from-one-provider-to-another)
    - [3.1 Check it's even allowed to move yet](#31-check-its-even-allowed-to-move-yet)
    - [3.2 Make sure the registrant email is current and you can read it](#32-make-sure-the-registrant-email-is-current-and-you-can-read-it)
    - [3.3 Unlock the domain at the current registrar](#33-unlock-the-domain-at-the-current-registrar)
    - [3.4 Get the authorisation code (EPP / auth code)](#34-get-the-authorisation-code-epp--auth-code)
    - [3.5 Handle DNSSEC before you move (skip only if it's off)](#35-handle-dnssec-before-you-move-skip-only-if-its-off)
    - [3.6 Start the transfer at the NEW registrar](#36-start-the-transfer-at-the-new-registrar)
    - [3.7 Approve the transfer](#37-approve-the-transfer)
    - [3.8 Confirm it completed](#38-confirm-it-completed)
- [A4 — If something goes wrong](#a4--if-something-goes-wrong)
- [A5 — Reference: the distinction in one table](#a5--reference-the-distinction-in-one-table)
- [A6 — Reference: command cheat sheet](#a6--reference-command-cheat-sheet)
- [A7 — Reference: glossary of domain terms](#a7--reference-glossary-of-domain-terms)

**[Appendix B — Glossary](#appendix-b--glossary)**

- [Glossary — the stack](#glossary--the-stack)
- [Running it](#running-it)
- [Content and the admin](#content-and-the-admin)
- [Deploying and going live](#deploying-and-going-live)

**[Appendix C — Command reference](#appendix-c--command-reference)**

- [On the server, day to day](#on-the-server-day-to-day)
- [Deploying a code change](#deploying-a-code-change)
- [Backing up and restoring](#backing-up-and-restoring)
- [Running the seed](#running-the-seed)
- [Checking DNS and the live site](#checking-dns-and-the-live-site)
- [Local development commands](#local-development-commands)
- [Testing commands](#testing-commands)
- [Code generation, after a field change](#code-generation-after-a-field-change)
- [Tools `pnpm test` does not run — the commands](#tools-pnpm-test-does-not-run--the-commands)

**[Appendix D — The documentation inside the code](#appendix-d--the-documentation-inside-the-code)**

- [The rule that governs all six, and why it exists](#the-rule-that-governs-all-six-and-why-it-exists)
- [What that means for this file](#what-that-means-for-this-file)

**[A closing note on this handover](#a-closing-note-on-this-handover)**


## Part 1 — What this system is, and what you were handed

*Short, and everything later assumes it.*
### What this system is

This is the new public website for **VERIFY Medico-Legal Solutions**, built to replace the current
WordPress site at **vmls.com.au**. It is a content-managed site: staff edit pages, specialists,
events and articles through an admin panel, and the changes appear on the public site immediately.

Technically it is a **Node.js application** — **Next.js 16** for the website, **Payload 3** as the
CMS, **PostgreSQL** for the data. Payload runs *inside* the Next process, so the public site, the
admin panel, and the REST/GraphQL APIs are one deployable, not separate services.

**It is not WordPress or PHP.** There is no `wp-admin`, no cPanel, no plugins in the WordPress sense.
It runs as a long-lived Node process, is compiled with a build step, and manages its database
structure through migrations. If your experience is mostly WordPress, that difference is the single
thing to keep front of mind — most early confusion comes from expecting WordPress conventions.

The design philosophy, which explains almost every decision in the code: **almost nothing is
hardcoded.** Pages are built from blocks an editor arranges; colours, spacing, fonts and copy all come
from the database and are editable in the admin. This is deliberate — VERIFY's staff maintain the site
without a developer, and every hardcoded value would take something away from them.

### What you were handed, and what you must provide

**What you have:** a zip of the complete source code, including all of its documentation. That is the
whole system in source form.

**What does not come with it, and why:**

- **There is no running copy to inspect.** The site was built and tested on the author's **personal
  server** (a Proxmox box at home) using the author's **personal domain/staging address**. The author
  is leaving VERIFY, so **that server and that address go with them** — they are not VERIFY's to keep,
  and nothing about the production site should depend on them. The zip is the whole system; the home
  test rig is not part of the handover and will disappear.
- **No production infrastructure.** The site has **never been deployed to a data centre or any host
  VERIFY controls.** Standing it up on company-controlled infrastructure is the first block of
  remaining work.

**What VERIFY must provide to finish and go live:**

| Need | Detail | Covered in |
|---|---|---|
| A production server | A **data-centre host** — physical, dedicated, or a VM — running Linux. Sizing below | Part 1, Part 2 |
| The domain & DNS | `vmls.com.au`, controlled by **FortiTech** through their Cloudflare account | Part 3 |
| Email sending (SMTP) | Never configured. Microsoft 365 is the firm's mail provider | Part 5 |
| Fresh secrets | New `PAYLOAD_SECRET`, `PREVIEW_SECRET`, database password — never reuse the development ones | Part 2 |
| Remaining photography | Twelve in-page image slots still show placeholders | Part 5 |

> **Two different domains, don't conflate them.** `vmls.com.au` is *this* project — the public
> website, and it is the **company's** domain (via FortiTech), which does **not** leave with the author.
> `vmlsapps.com.au` is a **separate** internal tools suite on the company's own Cloudflare account.
> This handover is about `vmls.com.au` only.

#### What the zip carries that Git will not

**This matters the moment you run `git init`.** The zip is a copy of the author's working folder, so
it contains more than the repository does. `.gitignore` deliberately excludes several things, and
`git add -A` will skip them **silently** — no warning, no error. Keep the original zip somewhere safe
as the archive; do not treat the Git repository as a complete copy of what you were given.

| In the zip | Size | What happens when you push to Git |
|---|---|---|
| `.env` | small | **Excluded, and rightly so** — it holds secrets. But read the warning below before you do anything else with it. |
| `public/media/` | ~371 MB | **Excluded.** Every image uploaded through the admin lives here; there is no cloud storage. A fresh clone has none of them. |
| `.design-reference/` | ~12 MB | **Excluded.** The static HTML design target. Losing it does not affect the site, but `README.md` §11 (in the code) and the CSS comparison tool both become uncheckable. |
| `node_modules/`, `.next/` | ~1 GB | **Excluded, and you want that.** Never copy these to a server — run `pnpm install` and `pnpm build` there instead. |
| `*-inventory.csv`, test snapshots, logs | small | Excluded. All regenerable; ignore them. |

> **Delete the `.env` that came in the zip. Do not copy it to a server.** It holds the author's
> development secrets, and it sets two flags that must **never** reach a live site:
> `LOCAL_PROD_REPRO` (which waives every start-up safety check) and `ENABLE_SEED_ENDPOINT` (which
> leaves the content-overwriting seed endpoint open). Build a fresh `.env` from `.env.example` on the
> server, as Part 2, Step 4.3 describes.

**About the images.** Losing `public/media/` sounds worse than it is. The 19 team headshots, 26
specialist portraits and 8 page photographs are **tracked in Git** under
`public/assets/images/{team,specialist,content}`, and the seed re-imports them, so a fresh install
rebuilds every photograph that matters. What is not recoverable is anything uploaded through the
admin that has no counterpart in those folders. Part 5 explains the rule; the short version
is that a photo which must survive a rebuild goes in the tracked folder, not just the admin.

#### Where the content comes from

**The seed is the content.** The code contains a "seed" (Part 2, Step 8) that populates a fresh database
with the whole site — the page tree, the specialist directory, team, events, articles, taxonomy and
every settings screen. **VERIFY staff have been shown the seeded site and accepted it as the
starting point.** Run it once after first setup and you have roughly 95% of the finished site.

The remaining 5% is not code:

- **Twelve in-page photographs** are still placeholders, awaiting photography (Part 5, and `README.md` §10 (in the code)).
- **Everything else is editing** — copy, images, new specialists, new events — done in the admin,
  by staff, with no developer and no deploy.

There is **no database dump** in the handover, and none is needed: the seed reproduces the accepted
state from code. Once you are live, that changes — from then on the database is the source of truth
and the seed is a scaffolding tool, not a restore mechanism. **Back up the database** (Part 5), and
do not re-run the seed on a live site expecting it to restore anything.

#### Project status — what's done, and what remains

The system is **complete and working as software.** What is unfinished is entirely *deployment and
content*, not code. A team picking this up should expect this sequence:

**Done (in the code you were handed):**

- The full website — pages, specialist directory, events, articles, enquiry forms — built and working.
- The admin/CMS, the block-based page builder, the taxonomy, the seed content, the test suites.
- All 19 team headshots and all 26 specialist portraits.
- Built and exercised end-to-end on the author's own server, and the seeded site was reviewed and
  accepted by VERIFY staff. Note what that does **not** mean: `README.md` §10 (in the code) records that
  **nothing in the test suite runs the seed**, so a green suite says nothing about it. Verify a
  fresh install by looking at it, not by running the tests.

**Remaining, in order (this document is the map for each):**

1. **Provision a data-centre host** under VERIFY's control (below), and **stand the site up on it**
   from the zip (Part 2). This is the big one — it has never run on company infrastructure.
2. **Configure email** (Part 5) — the site currently runs with sending disabled.
3. **Load the remaining photography** — twelve in-page image slots are still placeholders (Part 5).
4. **Verify on a staging address** through FortiTech's Cloudflare (Part 3).
5. **Cut `vmls.com.au` over** from the current WordPress site to the new one (Part 3).
6. **Protect the admin** with Cloudflare Access, and confirm backups are running (Part 2 and Part 5).

None of this requires the author or their equipment — only this document, the code, a data-centre
host, and FortiTech's cooperation on the domain.

### How the website works (the non-technical picture)

For a visitor it is an ordinary public website — pages, a directory of medico-legal specialists, an
events listing, an articles hub branded **"In the Loop"**, and enquiry forms. No login, nothing to
explain.

The value is in how it is **managed**. Almost everything is editable without touching code:

- **Content** — page copy, images, adding or editing a specialist, posting an article, changing an
  event — is edited in the admin panel at `/admin` and goes live on Save. No deployment, no developer,
  no downtime.
- **Appearance** — brand colours, fonts, the logo, favicon, and the colour/background options on each
  content block — are also editable from the admin, through Site Settings and per-block controls.

**Structured content is organised, not free-typed.** "Workers' Compensation," for example, is one
defined value that specialists are linked to, rather than text retyped on each profile. This is what
makes filtering and consistency work, and it is why adding a specialist is a matter of ticking
existing options rather than re-entering everything.

**Email.** The site sends email for enquiry-form notifications and admin password resets. This
requires SMTP to be configured (Part 5). Until it is, those actions silently succeed while sending
nothing — which is why the application deliberately refuses to start without either real SMTP settings
or an explicit override.

Content editors need only **Part 6** of this document, plus **Part 7** for changing how things
look. Nothing else here applies to them.

### The infrastructure it needs

#### How a request reaches the site

```
Browser
    │  https://www.vmls.com.au
    ▼
Cloudflare            filters traffic, presents the public HTTPS certificate
    │
    ▼
Your host             a reverse proxy, or a Cloudflare Tunnel
    │
    ▼
The Node application  serves pages, reads and writes the database
    │
    ▼
PostgreSQL            the content store
```

The DNS record, TLS mode, and any admin-path protection live in **FortiTech's Cloudflare dashboard**,
not on the server. Everything from "Your host" down is what Part 2 builds; the Cloudflare layer is
what Part 3 connects.

**The application itself is one process, not several.** Payload runs inside the Next.js app, so the
public site, the admin panel and the REST/GraphQL APIs are a single deployable — one thing to start,
one thing to restart, one thing to back up.

#### What that host has to provide

The application is not tied to any particular host. The intended target is a **data-centre server**,
but the commands are identical whether that is a physical/dedicated machine or a VM, in a data centre
or a cloud — it is just a Linux box. It requires:

- **A Linux host** with **Node.js 22 LTS** and **pnpm** 9 or 10. (The code accepts Node 20.9+, but
  Node 20 left maintenance in April 2026 — do not start a new host on it.)
- **PostgreSQL 15+** — same machine or a separate/managed database.
- **HTTPS with a public certificate** — either a reverse proxy (nginx/Caddy) handling TLS, or a
  **Cloudflare Tunnel** (no open inbound ports; fits a Cloudflare-fronted domain). The Tunnel is the
  lowest-maintenance option and the recommended default, since the domain is already behind Cloudflare
  — but a data-centre host with a static IP can equally use a reverse proxy with a Cloudflare Origin
  certificate if the team prefers.
- **A process manager** — systemd, PM2, or Docker — to keep the process alive and restart it on crash
  or reboot. **This document assumes a systemd service named `payload`**; substitute your equivalent
  if you use something else.
- **2 CPU cores and 4 GB RAM minimum; 8 GB is comfortable**, because compiling the site is the
  memory-hungry step. **~20 GB disk** — the app, its dependencies and the build come to roughly 5 GB,
  and the rest is headroom for the database, uploaded images and local backups.

The content is a public website, not client records, so region choice is about latency and any
company data-residency preference. An Australian region is a reasonable default.

## Part 2 — Standing it up: from zip to running site

*One command at a time, on whatever host VERIFY provisions. Read it through first — a couple of
steps depend on decisions made earlier. "Step 4.3" means Step 4, sub-step 3.*
This walks you from the zip file of the website code to a live site, one command at a time,
with an explanation of what each step does and why. It assumes you can use a terminal and are
comfortable following instructions, but not that you already know this stack.

**The target in this guide** is a single machine running **Ubuntu Server 24.04 LTS** — a free,
long-supported Linux — with everything on the one box: the web application, the PostgreSQL database,
and the web server. That is the simplest arrangement and the right starting point. If you later split
the database onto its own machine, only the database steps change.

**The stack you're deploying:** a Node.js application (Next.js for the website, Payload as the
content management system) with a PostgreSQL database. It is not WordPress or PHP — there is no
cPanel and no `wp-admin`. It runs as a background service and is compiled with a build step.

**Roughly what you'll do, in order:**
1. Put the code in a Git repository you own.
2. Prepare an Ubuntu server (Node.js, PostgreSQL, a web server).
3. Configure the application and build it.
4. Put it behind a domain with HTTPS.
5. Set up email.
6. Load the starting content.

Set aside a couple of hours the first time. Nothing here is irreversible if you take the backups
where the guide tells you to.

Throughout: lines in code blocks are commands to type (or paste) into the terminal, one at a time,
pressing Enter after each. `sudo` means "run as administrator" and may prompt for your password.
Text after a `#` is a comment, not something to type.

### Step 0 — What you need before you start

- **The zip** of the website code.
- **A server**: a machine or virtual server running **Ubuntu Server 24.04 LTS**, with at least
  **2 CPU cores, 4 GB RAM** (8 GB is better — the build step is memory-hungry) and **~20 GB disk**
  (about 5 GB is the app, its dependencies and the build; the rest is headroom for the database,
  uploaded images and local backups). This can be a physical box, a dedicated data-centre server or
  a rented virtual server — the commands are identical.
- **Administrator (sudo) access** to that server, and its IP address.
- **A GitHub (or GitLab) account** to hold the code.
- **The domain**: VERIFY's site is `vmls.com.au`, controlled through **FortiTech's Cloudflare
  account**. You will need FortiTech's help for the domain/DNS steps in Step 6 — line that up early.
- **Email sending details**: an SMTP account the site can send mail through (Step 7). VERIFY uses
  Microsoft 365, so this is likely a Microsoft 365 mailbox and its SMTP settings.

You reach the server over SSH (a secure remote terminal). From your own computer's terminal:

```bash
ssh your-username@YOUR_SERVER_IP     # e.g. ssh admin@203.0.113.10
```

Every command in Step 2 onward is run on the server, inside that SSH session, unless it clearly says
"on your own computer".

### Step 1 — Put the code in a repository

Do this first, on your own computer. A repository gives you a history of the code and a way to undo
changes, and it's how the server will fetch the code.

**1.1 Unzip the code** somewhere on your computer, and open a terminal in that folder.

**1.2 Turn it into a Git repository and make the first commit:**

```bash
git init                                   # start version control in this folder
git add -A                                 # stage every file
git commit -m "Initial import of VERIFY website"   # save the first version
```

**1.3 Create an empty private repository** on GitHub (in the browser: New repository → name it
`verify-website` → **Private** → do not add a README or licence, leave it empty → Create).

**1.4 Connect your folder to it and upload (replace the URL with your repo's):**

```bash
git remote add origin git@github.com:YOUR-ACCOUNT/verify-website.git
git branch -M main
git push -u origin main
```

If Git asks about authentication, GitHub's guide "Connecting to GitHub with SSH" walks you through
creating a key — a one-time setup.

> **Important:** the file called `.env`, which holds passwords, is deliberately excluded from Git and
> must never be committed. The code already tells Git to ignore it. You create it fresh on the server
> in Step 4. **Delete the `.env` that came in the zip** — it holds the previous developer's settings,
> including two flags that must never reach a live site.
>
> **`git add -A` also skips other things, silently.** `public/media/` (images uploaded through the
> admin, ~371 MB), `.design-reference/` (the design target, ~12 MB) and `node_modules/` are all
> excluded by design. Nothing warns you. **Keep the original zip as your archive** — the repository
> is not a complete copy of what you were handed. The photographs that matter are safe: team and
> specialist headshots are tracked under `public/assets/images/`, and the seed (Part 8) re-imports
> them.

### Step 2 — Prepare the Ubuntu server

From here on you are in the SSH session on the server.

**2.1 Update the system's package list and installed software:**

```bash
sudo apt update           # refresh the list of available packages
sudo apt upgrade -y       # install available updates ( -y answers "yes" automatically )
```

**2.2 Install the basic tools** you'll need:

```bash
sudo apt install -y git curl ca-certificates gnupg
```

- `git` fetches your code, `curl` downloads things, the other two let the system trust secure
  downloads.

**2.3 Install Node.js 22 LTS** (the runtime the application runs on). This adds the official
Node.js software source, then installs it:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

> **Why 22 and not 20.** The code requires Node 20.9 or newer, so either works — but Node 20 left
> maintenance in April 2026 and should not be the runtime under a site you are standing up now.
> Nothing in the code needs changing for 22.

Check it worked — this should print a version number starting with `v22`:

```bash
node -v
```

**2.4 Install pnpm** (the tool that manages the application's building blocks). Node includes a helper
called Corepack that installs it cleanly:

```bash
sudo corepack enable
sudo corepack prepare pnpm@10 --activate
pnpm -v                    # should print a 10.x version number
```

Both lines need `sudo`: Corepack installs into Node's own directory, which your login cannot write
to. Without it the second line fails with a permissions error.

**2.5 Install PostgreSQL** (the database):

```bash
sudo apt install -y postgresql
```

Confirm it's running:

```bash
sudo systemctl status postgresql --no-pager
```

Press `q` to exit that view. You want to see it described as active/running.

### Step 3 — Create the database

The application needs a database and a user account to connect as.

**3.1 Open the PostgreSQL command line** (as the database's own admin user):

```bash
sudo -u postgres psql
```

Your prompt changes to `postgres=#`. The next three lines are **SQL commands** — type each and press
Enter. **Choose a strong password** and use it in place of `CHOOSE_A_PASSWORD`, and **write it down**
— you'll need it again in Part 4.

```sql
CREATE USER verify WITH ENCRYPTED PASSWORD 'CHOOSE_A_PASSWORD';
CREATE DATABASE verify_cms WITH OWNER verify ENCODING 'UTF8' LC_COLLATE 'C.UTF-8' LC_CTYPE 'C.UTF-8' TEMPLATE template0;
GRANT ALL PRIVILEGES ON DATABASE verify_cms TO verify;
```

- The first makes the login the app will use. The second creates the database, owned by that login,
  using UTF-8 text (which matters — it lets the site store accented names and symbols correctly). The
  third grants the login full control of it.

**3.2 Leave the PostgreSQL command line:**

```sql
\q
```

You're back at the normal server prompt. The database now exists but is empty — Step 5 fills it.

### Step 4 — Get the code onto the server and configure it

**4.1 Choose where the app will live and clone your repository into it:**

```bash
sudo mkdir -p /opt/verify-cms                       # create the folder
sudo chown $USER:$USER /opt/verify-cms              # let your user own it
git clone git@github.com:YOUR-ACCOUNT/verify-website.git /opt/verify-cms
cd /opt/verify-cms                                  # move into it
```

Every remaining command in this part is run from inside `/opt/verify-cms`.

**4.2 Install the application's dependencies** (this downloads the building blocks the code needs — a
few minutes):

```bash
pnpm install
```

> **Do not delete or replace the `.npmrc` file** in the project folder. One line in it
> (`enable-pre-post-scripts=true`) is what allows `pnpm build` to run the follow-up step that
> generates `robots.txt` and the sitemap. Without it the build still appears to succeed and those
> two files are simply never created — which nothing tells you, and which search engines notice.

**4.3 Create the configuration file.** The app reads its settings and passwords from a file called
`.env`. The code ships with an example. Copy it, then edit it:

```bash
cp .env.example .env
nano .env
```

`nano` is a text editor. Fill in the values below; use the arrow keys to move. The values
after each `=` are what you change. When done, press **Ctrl+O** then Enter to save, and **Ctrl+X** to
exit.

```bash
# The database connection. Use the password you chose in Step 3.
# The 127.0.0.1 means "the database is on this same machine".
DATABASE_URL=postgres://verify:CHOOSE_A_PASSWORD@127.0.0.1:5432/verify_cms

# A long random secret that signs logins and encrypts data. Generate one in the next step.
PAYLOAD_SECRET=paste_generated_value_here

# The public web address of the site. For now use the server's address; you'll change it
# to the real domain in Step 6. No slash at the end.
NEXT_PUBLIC_SERVER_URL=http://YOUR_SERVER_IP

# Another long random secret, for content previews. Generate one too.
PREVIEW_SECRET=paste_generated_value_here

# Email settings — fill these in Step 7. Leave as-is for now.
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false          # only `true` for a mailbox on port 465 (see Part 7)
SMTP_USER=
SMTP_PASS=
SMTP_FROM_NAME=VERIFY Medico-Legal Solutions
SMTP_FROM_ADDRESS=no-reply@vmls.com.au

# Signs scheduled-publish jobs. Nothing uses it today, but do not leave a live
# site with a blank secret — generate one the same way as the two above.
CRON_SECRET=paste_generated_value_here

# Because email isn't set up yet, this line lets the app start without it.
# You will REMOVE this line in Step 7 once real email is configured.
ALLOW_MISSING_SMTP=1
```

`.env.example` is the full list with a note on each — the values above are the ones you must set by
hand. Leave the rest as they come.

**4.4 Generate the three secrets.** Run this command three times; each prints a long random string.
Paste them into `PAYLOAD_SECRET`, `PREVIEW_SECRET` and `CRON_SECRET` (re-open the file with
`nano .env` to paste them in):

```bash
openssl rand -hex 32
```

> **Why these matter:** `PAYLOAD_SECRET` must never change once the site is live and holds data —
> changing it would lock people out and scramble stored secrets. Set it once and leave it.

### Step 5 — Build the site and start it running

**5.1 Create the database structure.** The app builds its own tables from definitions in the code:

```bash
pnpm payload migrate
```

You should see it apply a migration and finish with `Done`. Because the database is empty, this runs
cleanly.

**5.2 Build the site** (compiles it for production — a few minutes, and the heaviest step for memory;
this is why 8 GB of RAM helps):

```bash
pnpm payload generate:importmap    # prepares the admin panel
pnpm build                         # compiles the site
```

Wait for it to finish with a list of pages and no red error messages.

**5.3 Make it run as a background service** so it starts on boot and restarts if it crashes. Create a
service definition:

```bash
sudo nano /etc/systemd/system/payload.service
```

First find where pnpm actually is — the next step needs its full path:

```bash
which pnpm            # usually /usr/bin/pnpm or /usr/local/bin/pnpm
```

Paste the following. Change `User=YOUR_USERNAME` to your actual login name on the server, put the
path `which pnpm` printed into `ExecStart`, and confirm the folder matches where you put the code:

```ini
[Unit]
Description=VERIFY website (Payload CMS)
After=network.target postgresql.service

[Service]
Type=simple
User=YOUR_USERNAME
WorkingDirectory=/opt/verify-cms
ExecStart=/usr/bin/pnpm start
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Save and exit (Ctrl+O, Enter, Ctrl+X). Then tell the system to load and start it:

```bash
sudo systemctl daemon-reload          # read the new service file
sudo systemctl enable payload         # start it automatically on boot
sudo systemctl start payload          # start it now
sudo systemctl status payload --no-pager | head -5   # check it's running
```

You want to see `active (running)`. Press `q` if the view pauses.

> **If it won't start:** the app deliberately refuses to run if a required setting is missing, and
> says which one. Read the log with `sudo journalctl -u payload -n 40 --no-pager` — it names the
> problem. The most common cause at this stage is a typo in `.env`.

**5.4 Quick local check** — confirm the app is answering on the machine itself:

```bash
curl -I http://localhost:3000
```

`HTTP/1.1 200 OK` (or a redirect) means the app is up. It's only reachable from the machine so far —
Step 6 exposes it to the world.

### Step 6 — Put it behind the domain, with HTTPS

The site must be reachable at `vmls.com.au` and served over HTTPS (the padlock). The recommended
approach uses **Cloudflare**, which VERIFY (via FortiTech) already uses for the domain. There are two
common ways; pick one.

**This part needs FortiTech**, because they control the `vmls.com.au` domain and its Cloudflare
account. Arrange to do it with them.

> **Do this against a temporary address first.** `vmls.com.au` currently serves the existing
> WordPress site. Bring the new site up on a **staging address** (for example
> `new.vmls.com.au`) and check everything there before switching the real address over. Keep the
> ability to switch back until the new site is proven.

#### Option A (recommended): Cloudflare Tunnel — no open ports

A Cloudflare Tunnel makes an outbound connection from your server to Cloudflare, so you don't have to
open any ports to the internet. This is the safest option and works even behind restrictive networks.

**6A.1 Install the Cloudflare connector on the server:**

```bash
curl -fsSL https://pkg.cloudflare.com/install.sh | sudo bash
sudo apt install -y cloudflared
```

**6A.2 The rest is done in FortiTech's Cloudflare dashboard** (Zero Trust → Networks → Tunnels):
create a tunnel, and it will give you a single command to run on the server that connects and
installs it as a service. Then, in the tunnel's **Public Hostname** settings, point your chosen
hostname (e.g. `new.vmls.com.au`) at `http://localhost:3000` — that's your running app. Cloudflare
provides the HTTPS certificate automatically.

FortiTech will be familiar with this; the Cloudflare documentation "Create a tunnel (dashboard)" is
the reference.

#### Option B: Reverse proxy with nginx + a public port

If you'd rather serve it directly, put nginx in front of the app and let it handle HTTPS. This
requires opening port 443 to the server and a certificate.

**6B.1 Install nginx:**

```bash
sudo apt install -y nginx
```

**6B.2 Create a site configuration:**

```bash
sudo nano /etc/nginx/sites-available/verify
```

Paste (replace `new.vmls.com.au` with your hostname):

```nginx
server {
    listen 80;
    server_name new.vmls.com.au;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable it and reload nginx:

```bash
sudo ln -s /etc/nginx/sites-available/verify /etc/nginx/sites-enabled/
sudo nginx -t              # check the configuration is valid
sudo systemctl reload nginx
```

**6B.3 Add HTTPS** with a free Let's Encrypt certificate (this needs the DNS record for your hostname
already pointing at the server, and port 443 open):

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d new.vmls.com.au
```

Certbot edits the nginx config for you and sets up automatic renewal.

#### After either option

Update the app's own idea of its address. Edit `.env`:

```bash
nano .env
```

Change the line to your real hostname (use `https://`):

```bash
NEXT_PUBLIC_SERVER_URL=https://new.vmls.com.au
```

This value is **compiled into the site**, so you must rebuild and restart for it to take effect:

```bash
pnpm build
sudo systemctl restart payload
```

Now open your hostname in a browser. You should see the site.

#### Protecting the admin panel

The admin area is at `/admin`. It has its own login, but it's good practice to also gate it at
Cloudflare so the login page isn't exposed to the whole internet. In FortiTech's Cloudflare dashboard
(Zero Trust → Access → Applications), add an application covering the path `/admin` on your hostname,
allowing only approved email addresses. This is how the previous setup worked.

#### Switching the real domain over

Once the staging address is fully verified, FortiTech switches `vmls.com.au` (and `www.vmls.com.au`)
to point at the new site in Cloudflare, and you update `NEXT_PUBLIC_SERVER_URL` to the final address
and rebuild. Keep the old WordPress site available until the new one is confirmed live.

### Step 7 — Set up email

The site sends email for two things: notifying staff of enquiry-form submissions, and admin password
resets. Until this is configured, both silently do nothing — which is why the app currently runs with
the `ALLOW_MISSING_SMTP=1` line from Step 4.

**7.1 Get SMTP details** from VERIFY's mail provider. For Microsoft 365 these are typically:

- Host: `smtp.office365.com`
- Port: `587`
- Username: a real mailbox address (e.g. `noreply@vmls.com.au`)
- Password: that mailbox's password, or an app password if multi-factor login is enabled

(Microsoft 365 sometimes requires enabling "SMTP AUTH" for the mailbox — the mail administrator can
do this. If sending fails with an authentication error, that's the usual cause.)

**7.2 Put them in `.env`:**

```bash
nano .env
```

Fill in the four SMTP lines, and **delete the `ALLOW_MISSING_SMTP=1` line entirely** — with real
email configured, the override is no longer needed and shouldn't be left in:

```bash
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=noreply@vmls.com.au
SMTP_PASS=the_mailbox_password
```

Save and exit, then restart so it takes effect:

```bash
sudo systemctl restart payload
```

**7.3 Test it — but not yet.** You need an admin account first, which you create in Step 8. Once you
have one, come back here: use the admin login page's "forgot password" once and confirm the email
arrives. If it doesn't, check the log
(`sudo journalctl -u payload -n 40 --no-pager`) for the SMTP error.

### Step 8 — Load the starting content and create the first login

The database is still empty. Two steps fill it: create an administrator, then run the "seed" that
populates the site's pages, specialists, events and settings.

**8.1 Create the first admin account.** In a browser, go to your site address followed by `/admin`
(e.g. `https://new.vmls.com.au/admin`). Because the database is empty, it offers to **create the
first user**. Fill in an email and a strong password — this is the administrator account. Keep the
password; you need it in the next step.

**8.2 Run the seed.** The seed is behind a safety switch so it can't be triggered casually. On the
server:

```bash
cd /opt/verify-cms
```

Turn the switch on and restart:

```bash
echo 'ENABLE_SEED_ENDPOINT=true' >> .env
sudo systemctl restart payload
```

Log in and run the seed (replace the email and password with the admin account you just made, and the
hostname with your site's):

```bash
curl -s -c cookies.txt -X POST https://new.vmls.com.au/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ADMIN_EMAIL","password":"ADMIN_PASSWORD"}'

curl -X POST https://new.vmls.com.au/next/seed-verify -b cookies.txt
```

The first line logs in and saves a session; the second runs the seed. Success prints
`{"success":true}`. It may take a minute — it's building a lot of content.

Confirm it actually finished, rather than trusting the HTTP response:

```bash
sudo journalctl -u payload -n 30 --no-pager
```

The last line should read **`VERIFY scaffold seed complete.`** If it does not, the seed stopped
part-way and the log says where.

**8.3 Turn the switch back off** (important — don't leave the seed endpoint open):

```bash
rm cookies.txt
sed -i '/ENABLE_SEED_ENDPOINT=true/d' .env      # removes the line
sudo systemctl restart payload
```

**8.4 Two finishing touches, in the admin panel:**

- Go to **System → Search → Reindex**, so the site's search feature finds the new content. **This
  one is required** — until you do it, search results appear unlinked or missing.
- **Only if the menu, footer or branding looks stale:** open **Site → Header** and **Site → Footer**
  and click **Save** on each. You should not need to — the seed clears those caches itself as its
  last act — but saving forces the same refresh if it did not take.

**8.5 Check the site.** Open your hostname in a browser (a private/incognito window avoids cached
copies) and click through — the homepage, the specialist directory, events, articles. It should look
like the finished VERIFY site.

### Step 9 — Day-to-day, once it's live

**Editing content.** Almost everything — page text, images, specialists, events, articles, and even
brand colours and the logo — is edited in the admin panel at `/admin` and appears on the site
immediately. No commands, no developer. Two parts of this document cover it in plain language:
Part 6 (what each part of the admin does) and Part 7 (changing how things look).

**Deploying a code change.** If a developer changes the actual code (something not editable in the
admin), the update is applied like this, on the server:

```bash
cd /opt/verify-cms
git pull                              # fetch the new code
pnpm install                          # pick up any new dependencies
pnpm payload generate:types           # refresh internal definitions

# Only if the change altered the database structure (new or changed fields):
pnpm payload migrate:create some_short_name    # writes the migration...
pnpm payload migrate                           # ...then applies it

pnpm payload generate:importmap
pnpm build                            # recompile
sudo systemctl restart payload        # switch to the new version
```

The Part 5 is the full technical reference for this.

**Backups — do this before any change, and regularly.** Save a copy of the database. Run this from
the app folder, so it picks up the connection details from `.env`:

```bash
cd /opt/verify-cms
set -a; . ./.env; set +a                       # load DATABASE_URL from .env
pg_dump "$DATABASE_URL" > ~/verify-backup-$(date +%F).sql
```

> **Why not just `pg_dump verify_cms`?** The database is owned by the `verify` role you created in
> Part 3, and your login is not a PostgreSQL user at all — so the short form fails with
> `role "yourname" does not exist`. Going through `DATABASE_URL` connects as `verify`, with the
> password, exactly as the app does.

To restore that copy if something goes wrong:

```bash
sudo systemctl stop payload
sudo -u postgres dropdb verify_cms
sudo -u postgres createdb verify_cms --owner=verify --encoding=UTF8 \
  --lc-collate=C.UTF-8 --lc-ctype=C.UTF-8 --template=template0
cd /opt/verify-cms && set -a; . ./.env; set +a
psql "$DATABASE_URL" < ~/verify-backup-YYYY-MM-DD.sql
sudo systemctl start payload
```

The `--owner=verify` matters: recreate it owned by anyone else and the app cannot write to its own
database. The encoding flags repeat Step 3 so the restored database is shaped identically.

Copy backups **off the server** as well (to company storage) — a backup on the same machine doesn't
protect against that machine failing. Images uploaded through the admin live in the server folder
`/opt/verify-cms/public/media`; include that folder in your off-server backups too.

**Checking health / logs:**

```bash
sudo systemctl status payload --no-pager | head -5    # is it running?
sudo journalctl -u payload -n 50 --no-pager           # recent activity and errors
```

### Step 10 — If something goes wrong while standing it up

**The site won't load and the app won't start.** Read the log — it almost always names the cause:

```bash
sudo journalctl -u payload -n 40 --no-pager
```

The commonest cause is a missing or mistyped value in `.env`; the log's `REFUSING TO START` message
names the exact setting. Fix `.env`, then `sudo systemctl restart payload`.

**The app is running but the public address doesn't load.** The problem is between Cloudflare/the
proxy and the server, not the app. This is FortiTech's area (their domain and Cloudflare): check the
DNS record still points at the server, the tunnel or nginx is running, and Cloudflare's SSL setting
is correct.

**A database change (migration) fails.** A migration runs inside a safety wrapper and rolls back on
failure, so the database is unharmed — you can retry once the code is fixed. One known quirk: adding
new options to a dropdown can fail with an "unsafe use of new value" message; the fix and the
explanation are in `docs/TRAPS.md` (in the code). Hand this to whoever maintains the code.

**Content looks wrong or missing.** First check it isn't just a filter or an unpublished draft (the
public site hides drafts). If content genuinely disappeared, restore the most recent database backup
(Step 9). Take a backup of the current state first, even the bad one.

**When to get help.** Anything in the Cloudflare dashboard, a repeatedly failing migration, or a
database that won't start are the points to bring in FortiTech or a developer rather than pressing on.

## Part 3 — Going live: connecting the domain

*Only once Part 2 is done and the site answers on the server itself. `vmls.com.au` currently serves
the live WordPress site, so this is the part with consequences.*

**This is not Appendix A.** Here the domain stays where it is and only the website record moves.
Appendix A moves the domain itself, between accounts or registrars.
This walks you through pointing the live `vmls.com.au` domain away from the existing **WordPress** site
and onto the **new Payload site** on a cloud server, one step at a time, with an explanation of what
each step does and why. It assumes you can follow instructions and use a terminal, but not that you
already know DNS.

**Read this first — what this is, and what it isn't.** This is a *cutover*, not a transfer. You are
**not** moving who owns the domain (it stays with whoever it is registered to) and **not** moving
where the DNS lives (it stays in the Cloudflare account that controls `vmls.com.au`). You are only changing **where
the website record points** — swinging it from the old WordPress server to the new Payload server.
That means:

- **The old WordPress site keeps running, untouched, the entire time.** Nothing is deleted.
- **It is reversible.** If anything looks wrong after the switch, you point the record back and the old
  site returns.
- **You can prove the new site works on the real domain before any visitor sees it**, using a staging
  address. This is the safe pattern Part 2 already assumes.

Because it's reversible and testable, this is low-risk work — as long as you do the verification on
staging *before* the flip, and don't skip lowering the TTL.

> **Who controls the DNS.** `vmls.com.au` sits in **FortiTech's Cloudflare account** (unlike the
> `vmlsapps.com.au` tools, which are on the company's own account). The final DNS change in Step 6 may
> therefore need to be made by FortiTech, or by whoever now holds that zone. **Confirm who can edit
> `vmls.com.au`'s DNS before you start**, and line them up for the day of the cutover — this is the one
> external dependency that can hold everything up.

Throughout: lines in code blocks are commands to type into a terminal, one at a time. Text after a `#`
is a comment, not something to type. "The app" means the running Payload/Next.js
site, which listens on `localhost:3000` on the new server.

### Step 0 — What you need before the cutover

- **The new Payload site, built and running on the new server**, reachable locally on that server at
  `http://localhost:3000`. That's your existing **Part 2, Steps 1–8** — do that first; this document picks up after the app runs locally.
- **A staging hostname** you can point at the new server without disturbing the live site — this guide
  uses **`new.vmls.com.au`**. You'll add it as its own DNS record, test on it, and only later move the
  real `vmls.com.au` across.
- **Access to edit `vmls.com.au`'s DNS in Cloudflare** — yours, or FortiTech's cooperation (see the
  note above).
- **The new server's details** — its public IP, and SSH access to it.
- **The Microsoft 365 mailbox** the new site will send email through, and its SMTP settings (Step 5).

You reach the new server over SSH from your own computer:

```bash
ssh YOUR_USERNAME@NEW_SERVER_IP     # e.g. ssh admin@203.0.113.10
```

Commands are run on the new server inside that SSH session unless a step says "on your own computer".

### Step 1 — Decide how the new site connects to Cloudflare

The app runs privately on `localhost:3000`. Something has to put it behind `vmls.com.au` over HTTPS.
For a **server handed over for someone else to maintain, the recommended choice is a Cloudflare
Tunnel**, and the rest of this runbook assumes it. Here's the reasoning, so you can make the call
deliberately:

| Approach | Good for | Why / why not here |
|---|---|---|
| **Cloudflare Tunnel** (recommended) | Any host, cloud or data centre | No ports opened to the internet (nothing to attack), no certificate to manage, no firewall allowlist to maintain, survives an IP change. Lowest upkeep. |
| nginx + Origin cert + firewall allowlist | A box you control behind your own firewall (the `vmlsapps` setup) | Means deliberately exposing port 443 and hand-maintaining Cloudflare's IP ranges in the firewall — more surface and more upkeep. |
| nginx + Let's Encrypt | A server not using Cloudflare | Redundant here — Cloudflare already provides HTTPS at its edge; you'd be managing certificates you don't need. |

The Tunnel makes an **outbound** connection from the server to Cloudflare, so the server never has to
accept inbound web traffic directly. It's also what Part 2, Step 6 recommends as its Option A.

#### 1.1 Install the Cloudflare connector on the new server

```bash
curl -fsSL https://pkg.cloudflare.com/install.sh | sudo bash
sudo apt install -y cloudflared
```

#### 1.2 Create the tunnel in the Cloudflare dashboard

In the Cloudflare account that controls `vmls.com.au` (FortiTech's, unless it's been moved):
**Zero Trust → Networks → Tunnels → Create a tunnel**. Name it something obvious like
`vmls-payload`. Cloudflare shows a single command to run on the server that connects it and installs
it as a service — run that on the VM. The tunnel should then show as **Healthy**.

> The tunnel token in that command is a **credential** — treat it like a password, don't paste it into
> shared chats or commit it anywhere.

#### 1.3 Point the STAGING hostname at the app

Still in the tunnel's settings, under **Public Hostnames**, add:

- **Hostname:** `new.vmls.com.au`
- **Service:** `http://localhost:3000`

Cloudflare provides the HTTPS certificate automatically and creates the `new.vmls.com.au` DNS record
for you. **Leave the real `vmls.com.au` completely alone at this stage** — it's still serving
WordPress, and that's the point.

### Step 2 — Tell the app its (staging) address and rebuild

The app compiles its own address into the site, so it has to be told the staging hostname and rebuilt.
On the new server, in the app's folder (`/opt/verify-cms` per the deployment runbook):

```bash
cd /opt/verify-cms
nano .env
```

Set the address line to the staging hostname (with `https://`):

```bash
NEXT_PUBLIC_SERVER_URL=https://new.vmls.com.au
```

Save (Ctrl+O, Enter, Ctrl+X), then rebuild and restart so it takes effect:

```bash
pnpm build
sudo systemctl restart payload
```

> You'll set this to the **final** `https://vmls.com.au` and rebuild once more at the cutover (Step 6).
> Testing on staging with the staging URL now avoids the site generating links to the wrong address.

### Step 3 — Verify the new site thoroughly on staging

This is where the safety comes from: everything is checked on `new.vmls.com.au` while the public still
sees WordPress on `vmls.com.au`. Open `https://new.vmls.com.au` in a **private/incognito** browser
window and work through:

- [ ] Homepage loads over HTTPS with a valid padlock.
- [ ] Click through every main section — pages, specialist directory, events, articles.
- [ ] The admin panel at `/admin` loads and you can log in.
- [ ] Submit a contact/enquiry form and confirm the submission appears under **Forms → Form
      Submissions** in the admin.
- [ ] **Separately**, confirm the notification *email* arrives. This only works once real SMTP is
      configured (Step 5 below, and Part 2, Step 7). While `ALLOW_MISSING_SMTP` is still set,
      the form stores the enquiry perfectly and emails nobody — so a stored row is **not** evidence
      that email works. This is the single highest-value check before go-live.
- [ ] Images and logos load (they're served from the app, not WordPress).
- [ ] Check on a phone as well as a desktop.

From a terminal, confirm it's genuinely the new site answering:

```bash
curl -sI https://new.vmls.com.au | grep -iE "HTTP/|cf-ray"   # want a 2xx and a cf-ray header
```

> **Fix anything wrong now, while it costs nothing.** Once you flip the real domain, problems are
> public. The whole reason for staging is that this list can fail and no visitor is affected.

### Step 4 — Map the old site's URLs so you don't lose search rankings

WordPress and Payload almost certainly use **different URL patterns**. If `vmls.com.au/about-us/`
existed in WordPress and the new site uses `/about`, then every visitor from Google — and Google
itself — hits a dead link the moment you cut over. This quietly damages search rankings and frustrates
returning visitors, and it's the most-missed step in a website replacement.

**4.1 List the old site's real URLs.** The quickest source is the WordPress sitemap — visit
`https://vmls.com.au/sitemap.xml` (or `/sitemap_index.xml`) **before** the cutover and save the list
of page addresses. Also note any URLs that appear in printed material, email signatures, or ads.

**4.2 Decide the mapping.** For each important old URL, decide which new page it should land on. A
handful of key pages (services, contact, about, any high-traffic article) matters most; you don't need
every single one.

**4.3 Implement the redirects.** The cleanest place is a **Cloudflare Bulk Redirect** (Rules →
Redirect Rules), because it works at the edge regardless of the app. Set each as a **301 (permanent)**
redirect from the old path to the new one. If there are only a few, single redirect rules are fine.

> A 301 tells Google "this moved permanently," so it transfers the old page's ranking to the new one.
> A missing redirect just 404s and the ranking is lost. This is worth getting right.

### Step 5 — Email from the new site

The new site needs to send email **as `vmls.com.au`** — for enquiry-form notifications and admin
password resets. Two separate things matter, and it's easy to conflate them:

**Sending mail** is configured in the app (**Part 2, Step 7**): point it at Microsoft 365's
SMTP and give it a mailbox to send through. Because the mail then physically leaves **from Microsoft
365's servers**, the domain's existing M365 email setup (SPF/DKIM) already vouches for it — **you do
not need to add anything to DNS for the new server to send mail**. This is the payoff of sending
through M365 rather than direct from the VM.

**Receiving mail** (anything sent *to* `@vmls.com.au`) is governed by the domain's `MX` records, which
this cutover **does not touch** — you're only changing the website record. So inbound email is
unaffected by everything in this runbook.

Two things to actually do:

**5.1 Enable SMTP AUTH on the sending mailbox.** Microsoft 365 disables authenticated SMTP by default.
The mail administrator enables it for the specific mailbox the site sends through. Without this, sending
fails with an authentication error — it's the usual cause when form emails don't arrive.

**5.2 Confirm SPF already includes Microsoft 365.** In the `vmls.com.au` DNS, the `SPF` record (a
`TXT` record) should contain `include:spf.protection.outlook.com`. If M365 is already the company's
mail, it will. If you're unsure whether the *old* WordPress site was sending mail some other way, it
doesn't matter for the new site — sending through M365 stands on its own. Just don't remove any
existing mail-related `TXT` or `MX` records during the cutover.

> **The cutover does not change email.** If someone worries the switch will break mail, this is the
> reassurance: inbound is `MX` (untouched), and outbound from the new site rides on M365's existing
> reputation. Nothing about pointing the website record affects either.

### Step 6 — The cutover: point vmls.com.au at the new site

Everything above happened without touching the live site. This is the only part that does. It's small
and reversible.

#### 6.1 A day ahead — lower the TTL

The **TTL** is how long the internet is allowed to cache the current answer. If it's high, your switch
takes hours to reach everyone; lowering it first makes the actual cutover near-instant and, crucially,
makes a **rollback** near-instant too. In Cloudflare, on the `vmls.com.au` and `www.vmls.com.au`
records, set the **TTL to a low value** (e.g. 2 minutes / Auto if proxied) **the day before**. If the
records are proxied (orange cloud), TTL is already effectively controlled by Cloudflare and this is
less critical — but check.

Also, a day ahead, from your computer, note the current answer so you can recognise the change and
have the old target written down for rollback:

```bash
dig vmls.com.au A +short        # the old WordPress IP — write it down
dig www.vmls.com.au +short
```

#### 6.2 Point the app at its final address

On the new server, set the real hostname and rebuild (this is the same edit as Part 2, now with the
production address):

```bash
cd /opt/verify-cms
nano .env                                    # set NEXT_PUBLIC_SERVER_URL=https://vmls.com.au
pnpm build
sudo systemctl restart payload
```

#### 6.3 Add the real hostnames to the tunnel

In the tunnel's **Public Hostnames**, add two more entries pointing at the app:

- `vmls.com.au` → `http://localhost:3000`
- `www.vmls.com.au` → `http://localhost:3000`

Adding a public hostname makes Cloudflare update that name's DNS to route through the tunnel — which is
the actual switch. **The moment you save, `vmls.com.au` starts serving the new site.**

> **Expect Cloudflare to object first.** Both names already have DNS records pointing at WordPress.
> Depending on the record type, Cloudflare either offers to overwrite it or refuses and tells you a
> record already exists. **Do not delete the old record before you have written its value down** —
> that value is your rollback (Step 8), and once it is gone you cannot put it back from memory. Take
> the `dig` readings in 6.1 first; if you are asked to confirm an overwrite, confirming is correct.

> **Handle `www` and the bare domain together.** People reach the site both ways. If you switch only
> one, half your visitors get the new site and half get the old — a confusing split that's hard to
> diagnose. Do both, and make sure one redirects to the other consistently (whichever the site
> prefers).

#### 6.4 If FortiTech controls the zone

If you can't edit `vmls.com.au`'s DNS yourself, then 6.3 is the moment you need FortiTech: give them
the tunnel's hostname routing to set up, or the specific DNS change, and have them make it while you
watch. This is why confirming access in Step 0 matters — everything up to here you can do alone, but
this step may not be.

### Step 7 — Verify after the flip

Check from outside your own machine, because your computer may still hold the old cached answer:

```bash
dig @1.1.1.1 vmls.com.au A +short        # should be Cloudflare addresses, not the old WordPress IP
dig @8.8.8.8 www.vmls.com.au +short
curl -sI https://vmls.com.au | grep -iE "HTTP/|cf-ray"   # want a 2xx and a cf-ray header
```

Then in a **private/incognito** window:

- [ ] `https://vmls.com.au` shows the **new** site, with a valid padlock.
- [ ] `https://www.vmls.com.au` also lands on the new site (redirecting to the bare domain, or however
      the site prefers).
- [ ] A couple of the **old** URLs you mapped in Part 4 redirect to the right new pages.
- [ ] The admin panel and a contact form both work on the live domain.
- [ ] Check on a phone (a different network entirely) — proves it's not just your machine.

> **HSTS means there's no HTTP fallback.** Once the site has told a browser "always use HTTPS," that
> browser won't load it over plain HTTP at all. So if the certificate isn't ready, the site looks
> fully dead, not merely insecure. If you see certificate errors right after the flip, give the tunnel
> a minute to finish provisioning before assuming something's broken.

### Step 8 — Rollback (if needed)

Because nothing was deleted, undoing the cutover is quick:

- **If you used the tunnel for the switch:** remove the `vmls.com.au` and `www.vmls.com.au` public
  hostnames from the tunnel, and restore their DNS records to the **old WordPress IP** you wrote down
  in 6.1. Within the (now-lowered) TTL, the old site is back.
- Leave the staging hostname and the new server running so you can diagnose the problem without
  pressure, then try again.

The low TTL from 6.1 is what makes rollback fast — another reason not to skip it.

### Step 9 — After it's confirmed live (don't rush this)

Wait until you're **confident over several days** — traffic looks normal, forms arrive, nothing's
broken — before doing anything irreversible.

- **Keep the WordPress server running** as a safety net for at least a week or two. It costs little and
  it's your instant fallback.
- Once confident, **submit the new sitemap to Google Search Console**
  (`https://vmls.com.au/sitemap.xml`) so Google re-crawls the new structure and picks up the
  redirects. **Open that address in a browser first.** The file is written by a follow-up step of
  `pnpm build`, not served from the database, so if the build ever ran without it you would be
  submitting a 404. If it is missing, re-run `pnpm build` and check that the project's `.npmrc` file
  is still present — one line in it is what enables that step.
- Watch Search Console for a spike in 404s over the following weeks — each one is a missed redirect
  from Step 4; add it.
- Only after all that, decommission or archive the WordPress site. Take a full backup of it first
  (files and database) and keep it off-server — you may need old content later.

### Step 10 — If something goes wrong during the cutover

**After the flip, the site shows a certificate error or won't load at all.** The tunnel hostname may
still be provisioning its certificate — wait a few minutes. HSTS means there's no insecure fallback, so
"provisioning" looks like "dead." Confirm the tunnel shows **Healthy** in the dashboard and the public
hostname is listed.

**Half the time I get the new site, half the time the old one.** `www` and the bare domain weren't both
switched, or a resolver is still caching the old answer. Check both records point at the tunnel (Step 6.3) and re-run the `dig @1.1.1.1` / `@8.8.8.8` checks.

**Old links from Google 404.** Missing redirects (Step 4). Grab the failing URL, add a 301 to the right
new page. This is expected cleanup for the first few weeks, not a failure.

**Contact form emails don't arrive.** Almost always SMTP AUTH not enabled on the M365 mailbox (Step 5.1), or a typo in the app's SMTP settings. Check the app log on the server:
`sudo journalctl -u payload -n 40 --no-pager` — it names the SMTP error.

**The app itself won't start after the final rebuild.** It refuses to run if a required setting is
missing and says which. Read `sudo journalctl -u payload -n 40 --no-pager`; the commonest cause is a
mistyped value in `.env`. Fix it and `sudo systemctl restart payload`.

**When to bring in FortiTech.** Anything you can't fix from the app or the server itself — particularly
if you don't have edit access to `vmls.com.au`'s DNS — is their area. Don't fight the DNS if it isn't
yours to change; get them on the line.

### Reference — what changes and what doesn't

| | Changes in this cutover? |
|---|---|
| Domain registration (wherever the domain is registered) | **No** |
| Which Cloudflare account holds the zone | **No** |
| `MX` records / receiving email | **No** |
| SPF/DKIM (outbound mail vouching, via M365) | **No** |
| The website `A`/hostname record for `vmls.com.au` + `www` | **Yes** — repointed to the new server |
| `NEXT_PUBLIC_SERVER_URL` in the app | **Yes** — set to `https://vmls.com.au` |
| Redirects for old WordPress URLs | **Added** |

#### Reference — the commands for this part

Every command used above is collected in **Appendix C** (*Checking DNS and the live site*, and
*Deploying a code change*), so it is not repeated here.

## Part 4 — The architecture

*Two passes: the **map**, then the **detail**. The rules this has to obey are Part 8; the evidence
behind each is `docs/TRAPS.md` in the code.*

### 4A — The map
*Added 2026-08-26. Last reviewed 2026-08-26.*

The VERIFY Medico-Legal Solutions website: how it is put together, and where each part lives.

#### What this document is, and what it deliberately is not

This is a **map**. It describes shape — which subsystems exist, what each one owns, and how a request
becomes a page — so someone new can find their way without reading the whole tree first.

It restates nothing that can go stale. **No test counts, no route counts, no schema figures, no
invariant text.** Those live in exactly one place each, and this file points at them rather than
keeping a second copy that can quietly disagree.

That restraint is why a sixth file was allowed at all. Appendix D records that the
project's documentation was **ten files and 9,554 lines**, and that it collapsed to five because "a
change lands in every document it touches" could not be held at that size: one day after a full
update pass, three documents gave three different counts for the same shell script. A sixth file is
only safe while it holds what the other five do not.

**In this document those five are:**

| File | Read it for |
|---|---|
| **Part 5** | Running a box, deploying, testing, and images |
| **Part 8** | The invariants — the rules that must not be broken, and what guards each |
| `docs/TRAPS.md` (in the code) | Why each rule exists, and every measurement that has already misled someone |
| **Part 6** | What each thing in the admin sidebar *is*, for the non-technical editor |
| **Part 7** | Every editable appearance control and where it lives |

Where this map and the detail that follows disagree, **the detail is right** — the map is
deliberately shallow so that it cannot go stale.

#### The stack

- **Next.js 16**, App Router, React Server Components
- **Payload 3** as the CMS, mounted inside the same Next app rather than beside it
- **PostgreSQL** via `@payloadcms/db-postgres` (Drizzle underneath)
- **Tailwind 4** plus a large hand-written stylesheet
- **pnpm**, TypeScript throughout, Vitest for unit/integration, Playwright for browser tests

Payload is not a separate service. It shares the Next process, so the CMS admin, the REST and GraphQL
APIs, and the public site are one deployable.

#### Fields, and the shared helpers

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

#### Plugins, and what they own

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

#### The seed

`src/endpoints/seed/` is a set of modules — homepage, services, data layer, specialists, events and so
on — run by `POST /next/seed-verify`. It is **idempotent and non-destructive**: it creates the page
tree by slug and fills globals, and re-running it does not clobber edited content.

Two things before you change it:

- Whether a page has been written yet is decided by `isUnauthored`, never by counting blocks. A repair
  writes only into an absence.
- Content links live in the database, so editing a seed file fixes nothing on its own. Link
  corrections are paired with unconditional repairs that run every time.

Nothing in `tests/` runs the seed, so a green suite says nothing about it. Seed changes are verified
against a scratch database.

#### Schema and migrations

Local development uses Payload's **dev schema push**: the database follows the config on boot, and
there are no local migrations. Production is the opposite — migrations are authored and applied
explicitly on the server.

`src/migrations/` holds **one baseline** rather than a chain, because the box is rebuilt rather than
migrated forward. Alongside it are `REFERENCE-*.sql` files: hand-written DDL for conversions the dev
push cannot perform unattended, each documenting why.

The push is the single most dangerous part of local development. A destructive change — dropping a
column, converting a `select` to `text` — stops it on an interactive prompt inside a backgrounded log,
and every request queues behind it. `docs/TRAPS.md` (in the code) catalogues the three ways this has happened and
what each looked like.

#### Testing

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

Part 5 records what each suite counts and the command that measures it. Run the command; do not
trust a written number.

#### Environments

**Local** is fully isolated: a dedicated Postgres database, a local `.env`, throwaway admin
credentials, and schema pushed on boot. It never touches production.

**Production** builds and migrates on the production host: commit and push, the host pulls,
generates types, creates and runs a migration, builds. A boot-time environment check refuses to start a server missing
the variables whose absence would otherwise degrade *invisibly* — mail credentials, the public URL,
the preview secret — because a half-alive server passes a deploy smoke test.

Part 5 has the exact sequence, and the flags that exist for standing a box up before mail
credentials do.

### 4B — The detail

*The same subsystems in depth: URLs, the page builder, colour, icons, caching.*
##### Routing

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

##### Block system (the page builder)

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
  It writes Lexical NodeState (`$`), which **only our converter renders** — see the invariants table in Part 8.
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

##### Hero system

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

##### Styling and design tokens

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

##### CSS token tooling

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
  known flake; index 0 (`color`) or any other node is real. `README.md` §10 (in the code) has the measurement.
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

##### Icons (in detail)

Three tiers, one **string** column. `iconField` (`src/fields/blockFields.ts`) and the link icon
(`src/fields/link.ts`) are both `text` with the `IconSelect` picker — **not** `select`, because a
select is a Postgres enum and an enum cannot hold a value an editor creates. See invariants 57–59 in Part 8.

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
control that silently does nothing — the `textColour` failure in invariant 33 (Part 8).

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

##### Content model (in detail)

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
Site / Design; every group holds either records or settings, never both. See Part 6. Page-level and section-level copy lives
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

##### Caching and revalidation (in detail)

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

##### Design reference

`.design-reference/` holds the static HTML target for the redesign. Diff a page family against it
with `node tests/visual/referenceCssDiff.mjs <family>`, and **serve it over HTTP, never `file://`**
— its stylesheet is linked root-absolute and silently fails to load from the filesystem, so every
shared-sheet rule reads as an unstyled default:

```bash
(cd .design-reference && python3 -m http.server 4100)
```

Where the build deliberately differs from the reference, it is recorded in `README.md` §11 (in the code) → **Deliberate departures**. Read that before "correcting" anything back — several of those
differences were requested by the client, and one is the reference failing to execute its own
intent.

## Part 5 — Running and maintaining it

*Settings, email, local development, deploys, testing, images, backups, security. Part 2 is the
procedure; this is the reference behind it. Commands are not repeated.*
### The environment file

`.env.example` documents every variable and what breaks when each is wrong. Four matter most:

| Variable | If it is wrong |
|---|---|
| `DATABASE_URL` | Nothing runs |
| `PAYLOAD_SECRET` | Changing it logs every admin user out |
| `NEXT_PUBLIC_SERVER_URL` | Every absolute link, sitemap entry and social preview points at localhost. **No visible error** |
| `PREVIEW_SECRET` | Draft preview links cannot be validated |

**The app refuses to boot** while serving without `NEXT_PUBLIC_SERVER_URL`, `PREVIEW_SECRET` or
`SMTP_HOST`. Each of those fails *silently* rather than loudly, and a half-working server passes a
deploy smoke test. So it exits instead of starting.

The check lives in `src/instrumentation.ts`, which Next runs once before the first request. It is not
in `payload.config.ts` alone because that module loads lazily: measured, `next start` with
`SMTP_HOST` unset served the prerendered homepage with a **200** and only 500'd on `/admin` and
`/api/*`.

It gates on *serving*, not on `NODE_ENV` — `next build` also sets `NODE_ENV=production`, and
requiring mail credentials to build an artifact just breaks the build, so the build is skipped via
`NEXT_PHASE === 'phase-production-build'`. Guarded by `tests/int/productionEnv.int.spec.ts`.

### Email — read this even if you skip everything else

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

### Running it locally

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

#### Running in production mode locally

`pnpm dev:prod` runs `next start`, which sets `NODE_ENV=production` — so the boot check in The environment file fires
and the server exits, even though this is your laptop. To run it anyway, add to your local `.env`:

```
LOCAL_PROD_REPRO=1
```

It disables nothing except the refusal to start, prints a banner on every boot, and every email is
still reported as `[EMAIL NOT SENT]`. **Never set it on the server** — it is the only thing between a
misconfigured deploy and months of silently discarded enquiries.

#### Comparing a page against the design reference

`.design-reference/` holds the static HTML target for the redesign. **Serve it over HTTP, never open
it over `file://`:**

```bash
(cd .design-reference && python3 -m http.server 4100)
```

Its stylesheet is linked root-absolute (`/assets/css/styles.css`) and silently fails to load from the
filesystem, so every shared-sheet rule reads as an unstyled default and you measure the wrong thing.
Note also that each reference page redeclares what it needs in an inline `<style>` block at equal
specificity — **the inline copy is the one that renders**, not the shared sheet.

Where the build deliberately differs from the reference, it is in `README.md` §11 (in the code).
Read that before "correcting" anything back.

### Before you deploy

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

#### Committing

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

### Deploying

Production builds and migrates on **the production host** — a Linux server the site's owner
controls, reached however that host is normally administered. The loop is: commit locally → push →
the host pulls, builds and migrates against the **live** database. Nothing below assumes a
particular machine, operating system or network; every command is about the code.

> **If you have just inherited this project, the host does not exist yet.** The site was built and
> proven on the original developer's own server, which did not transfer. Standing one up is
> **Part 2** of this document.

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

**Icon uploads landed on 2026-08-25**, and with them the last of the icon enums — the icon fields
are `text` rather than `select`, for the reason Part 4B gives under *Icons*. What matters here is
the migration cost:

**On a wiped box this costs nothing** — the baseline creates `varchar` columns directly. **On a box
that is migrated instead**, it is 112 enum types to drop across live and `_v` tables, which is
destructive: run `src/migrations/REFERENCE-icon-enum-to-text.sql` by hand FIRST and then deploy the
config, so the push finds no drift. Read that file's header before doing so — an earlier attempt
converted the columns while leaving `link.ts` declaring a select, and the resulting drift made the
local site hang on every request until the database was rebuilt. `docs/TRAPS.md` (in the code), invariants 57–59, has the whole account.

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
intermittent `42704` in the test suite rather than as anything obviously schema-shaped. See invariant 39 in Part 8.

#### After deploying, check these first

They cover the areas where a silent failure would otherwise go unnoticed:

- `/admin/collections/pages/create` renders **a form, not just a sidebar** — the canary for the
  revalidation crash described in Part 8.
- The enquiry drawer submits and a row appears under **Form Submissions**. A drawer that cannot reach
  its backend must say so and disable submit — never acknowledge locally.
- A page with a **Process Steps** block renders its step descriptions as paragraphs, not raw JSON.
- Header and footer nav links resolve, including any pointing at an article.
- One interior page hero, and a testimonial card.

### Testing, and the guards you should not delete

```bash
pnpm test                  # lint → integration → e2e, stopping at the first failure
pnpm exec tsc --noEmit
zsh tests/int/prove-guards.sh   # re-applies each deliberate break; every case must report PASS
```

**Re-measured 2026-08-26 — re-run these rather than trusting the numbers:**

| Gate | Result | Count it with |
|---|---|---|
| `pnpm test:int` | **334 passed, 17 files** | `pnpm test:int` |
| `pnpm test:e2e` | **72 total.** Last full run: 70 passed, 2 failed — one a known flake, one a real database-state fault — both in `README.md` §10 (in the code) | `pnpm test:e2e` |
| `zsh tests/int/prove-guards.sh` | **11 cases** | `grep -c '^run_case "' tests/int/prove-guards.sh` |
| `referenceCssDiff.mjs` | **13 families**, all zero | the `FAMILIES` object in the harness |
| `computedSnapshot.mjs` | **21 routes, 39 properties** | the `ROUTES` and `PROPS` arrays |

The e2e count **cannot be derived from source** — `images.e2e.spec.ts` and `richTextRender.e2e.spec.ts`
each parameterise one test per route, so 45 `test(` declarations expand to far more. Run it.

**A red e2e run is not automatically a regression.** Taking these very readings, a second full run
against an already-hammered dev server gave `2 failed, 2 did not run, 57 passed` — the two failures
being `admin.e2e.spec.ts`'s `beforeAll` timing out at `browser.newContext()`, with two more skipped
behind it by serial mode. Re-run alone: **4 passed in 32s**. That is the known flake in `README.md` §10 (in the code),
not a defect, and the failing spec's *name* is not diagnostic — any spec can draw the short straw.

#### The doctrine

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

#### Tools `pnpm test` does not run

`tests/visual/` holds six Node scripts (`ls tests/visual/*.mjs | wc -l`) — five bullets, because
the two codemods share one. They are described in full in Part 4B → *CSS token tooling*; the
short version:

- `referenceCssDiff.mjs <family>` — diffs every declaration the design reference makes against
  `globals.css`. **A zero is necessary, not sufficient**: it proves a rule is in the file, not that it
  reached the page. Always confirm with `getComputedStyle`.
- `computedSnapshot.mjs capture|compare <name>` — computed-style gate. Capture immediately before a
  change and compare immediately after; any content change invalidates a baseline. **A non-empty diff
  is not by itself evidence** — see `README.md` §10 (in the code): it is nondeterministic on `/about`.
- `findFalseHover.mjs` — hover effects on elements nothing can click. **Candidates, not a verdict.**
- `findDeadCss.mjs` — unreachable selectors. **Candidates, not a verdict** — it has already produced
  false positives that would each have broken a live page.
- `tokenise.mjs` / `tokeniseShape.mjs` — one-shot codemods over `globals.css`.

### Images and where to upload them

**The photography arrives in stages, and the site works at every stage.** All 19 team headshots and
all 26 specialist portraits are in. Of the twenty in-page image slots, eight are filled and **twelve
still show a placeholder** — listed in `README.md` §10 (in the code).
Every slot, filled or not, is fillable from `/admin` — no code change, no deploy.

Nothing here is hardcoded: where a bundled file appears (the logo, the shield), it is a *fallback*
that only shows while the corresponding field is empty. Two guards in
`tests/int/adminControls.int.spec.ts` keep it that way.

#### Site-wide — **Admin → Site → Site Settings**

| Field | Where it appears | If left empty |
| --- | --- | --- |
| Logo | Header, and the footer if no footer logo is set | Bundled VERIFY wordmark |
| Footer logo | Footer only | Falls back to Logo, then the bundled wordmark |
| Favicon | Browser tab | `public/favicon.png` |
| Social image | Link previews when a page is shared | The generated 1200×630 share card, set by the seed |
| Shield / seal mark | Home hero watermark, the mark behind **every** interior page hero, and the Contact page's portal cards | Bundled VERIFY shield |

#### People and content — **Admin → Collections**

| Collection | Field | If left empty |
| --- | --- | --- |
| Specialists | Photo (also CV, Sample report) | The person's initials on a plain avatar |
| Team | Photo | The person's initials on a plain avatar |
| Services | Photo | In the accordion layout, a blue gradient tile with the service icon |
| Events | Image | Card renders without an image |
| Posts | Hero image, Author photo | Article header renders with no image behind it |
| Resources | File | The resource has nothing to download |

#### Inside a page — **Admin → Pages → *page* → Layout**

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

#### Before you upload anything

- **Uploading always wins.** If a block shows a placeholder and you attach an image, the image
  replaces it — you never need to untick anything first.
- **Fix a bad crop with the focal point, not a new file.** Uploads live in the **Media** collection,
  which stores alt text plus a focal point and zoom. If a portrait crops through someone's face, open
  it in Media and move the focal point — every place that image is used re-crops around it.
- **Upload a JPEG unless the picture needs transparency.** Payload's derivatives inherit the source's
  format, so a PNG photograph stays a PNG at every size, at several times the cost — and nothing in
  the admin warns you. See `README.md` §10 (in the code). Cut-outs that need a
  transparent background (the specialist portraits) are the exception, and are PNG on purpose.
- **You do not need to resize before uploading.** The site picks the smallest generated size that
  still covers the box at 2× (`src/utilities/mediaSrc.ts`) and re-encodes at quality 82.

#### Photos that have to survive a rebuild

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

#### Microsoft 365: the two that go wrong

VERIFY sends through **Microsoft 365**. The block above says which variables to set; these are the
two that go wrong after a handover.

- **Enable SMTP AUTH on the sending mailbox.** Microsoft 365 disables authenticated SMTP by
  default; the mail administrator enables it for that specific mailbox. Without it, sending fails
  with an authentication error — the usual cause of "form emails don't arrive."
- **`SMTP_SECURE` must match the port.** The code tests it against the literal string `true`. M365
  on port 587 uses STARTTLS, so `false` is correct there — point it at a mailbox on port 465 and
  leave it `false`, and the connection fails with an error that reads like bad credentials.
- **Check who each form notifies.** In **Forms → Forms → (each form) → Emails**, confirm the
  recipient addresses. These are per-form and are the thing most likely to be wrong after a
  handover.

**Deliverability needs nothing from you.** Because mail leaves from M365's servers, the domain's
existing M365 SPF/DKIM already vouch for it — **you do not add sender records for the app server**.
Receiving mail (`MX`) and the domain cutover are separate again: pointing the website record at the
new server does not touch mail flow at all.

### Backups, security, and maintenance
##### 12.1 Backups

There is no automatic undo beyond what you put in place.

**Before any code change** — commit to the repository, so a bad change reverts with `git revert`.

**Before any migration or re-seed** — back up the database. The commands are in **Part 2, Step 9**
and in **Appendix C**; use those rather than the short `pg_dump verify_cms` form, which fails on a
server built by Part 2 because your login is not a PostgreSQL role.

Also enable the host's own snapshot facility, and **keep a copy of the database backups somewhere
other than the host** — a backup on the same machine doesn't survive that machine failing. Put it on
company SharePoint or equivalent. Backups contain content but **not** the secrets in `.env` — record
`.env` separately and securely. **Include `public/media` in host backups** — uploaded images live
there and are not in the repository.

##### 12.2 Security

- **The public site is open by design; the admin is what needs protecting.** Put **Cloudflare Access**
  in front of `/admin` (Part 2, Step 6) so only approved emails reach the login page.
- **The admin login is a second layer** — only accounts an administrator creates can sign in. Anonymous
  sign-up is closed.
- **Secrets live only in `.env` on the host** — never in the repository, a message, or a file inside
  the code. Generate fresh values for VERIFY rather than reusing development ones.
- **Email requires real SMTP** — the app refuses to start without it (or the override that must never
  be used in production), precisely so resets and notifications can't silently fail.
- **Database backups are confidential** — they contain the site's content; keep their storage
  access-restricted.

##### 12.3 Maintenance

Little is routine — no scheduled jobs are required for the site to run. Worth doing: keep the host
patched; take a database backup before any change and keep an off-host copy; watch disk space (mostly
uploaded media and local backups); and if you use Cloudflare it manages TLS certificates, so there's
nothing to renew by hand (if you use a reverse proxy with Let's Encrypt instead, confirm auto-renewal
works).

**Before any planned change:** back up the database → take a host snapshot if the change touches the
schema → make the change through the deploy loop (above) → confirm with a real login and a look at the
live site before calling it done.

## Part 6 — Using the admin: for content editors

*This and Part 7 are the whole of what an editor needs.*

### The idea, in five sentences

You edit at `/admin`, and a change is live the moment you press **Save**. There is no separate
publish step beyond each item's Draft/Published toggle, no deployment, and no developer — copy,
images, colours, spacing and whole page layouts are all things you change yourself. Only five kinds
of thing have a draft state at all: **Pages, Articles, Events, Specialists and Team Members**;
everything else, including every settings screen, goes live on Save. Almost every box you type words
into is a **rich-text box** — select a word and a small toolbar appears — and a box *without* a
toolbar is deliberate, because formatting there would never show up on the page. If something looks
wrong rather than reads wrong, it is **Part 7** you want, not this part.

The rest of this part is the full reference: what every item in the sidebar is, and what feeds off
it. **Part 5** has the table of where each image goes and what shows when a slot is empty.
**Who this is for:** whoever logs in at `/admin` to keep the site up to date. You do not need to
write code, and nothing in this guide asks you to.

**What it covers:** every item in the left-hand sidebar — what it is, what it changes on the public
site, and what happens if you delete something. It does **not** cover colours, fonts, spacing or
CSS; that is **Part 7**, the styling manual. The split is:

> **Part 7** answers *"how do I change how this looks?"*
> **This guide** answers *"what is this thing, and what feeds off it?"*

Changes go live when you press **Save**. There
is no deployment to run and no cache to clear. The only gate is the **Draft / Published** toggle,
and only five things have one (see [Drafts](#9-drafts-and-what-hides-a-page)).

### 1. The sidebar, as a map

Eleven groups. Each holds **one kind of thing** — either records you add and delete, or fixed
wording you edit.

| Group | What lives here | You will use it |
|---|---|---|
| **Publishing** | Pages, Articles, Events | Constantly — this is the site's content |
| **Reference** | Services, Resources, Offices, Testimonials | Occasionally — records that feed sections of pages |
| **Taxonomy** | Eleven lists that classify specialists, articles, events and staff | Rarely — set up once, extended now and then |
| **People** | Specialists, Team Members | When someone joins, leaves or changes role |
| **Availability** | Availability Sessions | Regularly, if you advertise appointment slots |
| **Media** | Every uploaded image and file | Whenever you add a photo |
| **System** | Users, Redirects, Search Results | Rarely |
| **Forms** | Forms, Form Submissions | To read enquiries, or change a form's fields |
| **Page settings** | Fixed wording on templated pages | Rarely — set once |
| **Site** | Header, Footer, Site Settings | When the nav, footer or branding changes |
| **Design** | Custom Styles, Design System, Icon Library | See Part 7 |

**Records vs settings.** *Publishing*, *Reference*, *Taxonomy*, *People*, *Availability*, *Media*
and *Forms* hold **records** — you add and delete rows. *Page settings*, *Site* and *Design* hold
**settings** — a single screen you edit, never a list. That distinction is why the groups were
reorganised: the settings screens used to sit among the content collections with nothing marking
them apart.

### 2. "I want to…" — where to go

| I want to… | Go to |
|---|---|
| Change words on a normal page | **Publishing → Pages** → the page |
| Publish a new article | **Publishing → Articles** → *Create new* (pick a **Stream**) |
| Add a specialist to the panel | **People → Specialists** → *Create new* |
| Add a staff member | **People → Team Members** |
| Put an event up, or write it up afterwards | **Publishing → Events** |
| Advertise appointment slots | **Availability → Availability Sessions** |
| Change the main menu | **Site → Header** |
| Change the footer or opening hours | **Site → Footer**, or **Reference → Offices** |
| Change the phone number or address | **Reference → Offices** (the primary one) |
| Read enquiries that came in | **Forms → Form Submissions** |
| Change who is emailed about enquiries | **Forms → Forms** → the form → **Emails** tab |
| Change the logo, favicon or brand colours | **Site → Site Settings** |
| Change the wording of the "register for the portal" email | **Site → Site Settings** → *Booking portal registration email* |
| Fix a badly cropped photo | **Media** → the image → move the focal point |
| Change a heading like "Assessment Areas" on every profile | **Page settings → Specialist Profile** |
| Change colours, spacing, fonts | See Part 7 |

### 3. Publishing

#### Pages

**What it is:** every ordinary page of the site — Home, About, Services, Contact and the rest.
Each is built from **blocks** you add, reorder and remove.

**Where it appears:** at its own web address.

**The one thing to understand:** a page's address comes from its **Parent**, not from anything you
type. `ime` with parent `medico-legal`, whose parent is `services`, gives
`/services/medico-legal/ime`. **Changing the parent changes the URL**, and any link anyone has
saved to the old one will break — so add a **Redirect** (see *System*) when you do.

**Draft or instant:** has a Draft/Published toggle. New pages start as drafts.

**If you delete one:** the address 404s. Links to it elsewhere on the site render as plain text
rather than broken links, but they stop working.

#### Articles

**What it is:** the articles published to **In the Loop**.

> **The admin says "Articles"; the site says "In the Loop".** They are the same thing. The section
> is branded *In the Loop* for visitors — that is the nav item, the web address and the heading —
> while the admin calls the individual items Articles, because that reads more clearly beside Pages
> and Events. See [§8](#8-admin-word--site-word) for the full translation table.

**Where it appears:** `/in-the-loop`, and each article at `/in-the-loop/<stream>/<slug>`.

**Every article needs a Stream.** The stream is the folder in the address. **An article with no
stream has no address at all** — it will not appear and cannot be linked to. This is the single
most common way to lose an article.

**Topics** are the coloured chips on article cards. They are optional and separate from Streams.

**Draft or instant:** has a Draft/Published toggle.

#### Events

**What it is:** seminars and webinars, before and after they happen.

**Where it appears:** `/events`, split into Upcoming and Past, and each at `/events/event/<slug>`.

**Upcoming vs Past is worked out from the date** — you do not set it. An event stays "Upcoming" for
the whole of the day it is held, not until its start time. Registration is controlled separately by
**Registration closes at**, so an event can be running and still taking expressions of interest.

**Event type** is the badge on the card, and it is what a visitor's search matches when they type
"webinar" into the events search box — so it decides where an event turns up as much as how it reads.

**The list is yours to manage.** It lives at **Taxonomy → Event Types**; add, rename or remove a type
there and every event picker updates immediately, no developer and no deploy. Until 2026-08-25 it was
eleven options fixed in code. Pick the one a visitor would expect: a conference VERIFY exhibits at is
a Conference, an event it puts its name to is a Sponsorship.

**Event photo** is worth setting. It is shown on the two listing pages and on the `/events` hub
cards. Leave it empty and the event falls back to a date calendar showing the day and month — so a
missing photo never leaves an empty panel, and you can add photos gradually rather than all at once.
It is cropped to fill its panel, so a landscape image works best.

**After the event**, the same record becomes the write-up: add a **Recap**, a **Photo gallery** and
**Downloads**. Part 7 → *An event page's recap* has the full list of what an event page can hold.

**Draft or instant:** has a Draft/Published toggle.

### 4. Reference

These four hold records that **feed sections of pages** rather than having pages of their own.

#### Services

**What it is:** the service cards that appear in Services grids.

**Where it appears:** the homepage, `/services` and its sub-pages, and For Clients.

> **A Service is a card, not a page.** There is no `/services/<something>` address generated from
> this collection — the actual service pages are **Pages**. Each Service card carries a **Link
> override** pointing at the page it should open. If you add a Service and leave that empty, the
> card has nowhere to go.

**Draft or instant:** instant — saving publishes.

#### Resources

**What it is:** downloadable guides, checklists and PDFs.

**Where it appears:** **one place** — the Resources section of the In the Loop hub. Adding a
resource changes that section and nothing else.

**Draft or instant:** instant.

#### Offices

**What it is:** your physical offices — address, phone, email, opening hours, map, parking, public
transport, and a free-text **Note**. The note reads as the last line of *Nearby Car Parks*, or at the
foot of the card when that office lists no car parks — so a caveat about parking sits with the
parking rather than drifting away from it.

**Where it appears:** the **footer of every page**, and the "Where to Find Us" section on Contact
and on Information for Claimants.

**Mark one as Primary.** The primary office is the one the footer and contact blocks use. If none is
marked, the lowest **Order** wins. Note the Footer has its own phone/email fields that **override**
this — if you change the number here and the footer still shows the old one, clear the footer's copy.

**Draft or instant:** instant.

#### Testimonials

**What it is:** client quotes, attributed by role and organisation rather than by name.

**Where it appears:** **one place** — the testimonial carousel on the homepage.

**Draft or instant:** instant.

### 5. Taxonomy

Eleven lists that classify things. You will rarely add to them, and you should think before deleting
from them — other records point at these.

| List | What it classifies | Where a visitor sees it |
|---|---|---|
| **Specialties** | Specialists | The Specialty List page, and directory filters |
| **Specialty Categories** | Specialties | The filter buttons above the Specialty List |
| **Assessment Types** | Specialists | A profile's "Assessment Types" section |
| **Claim Types** | Specialists | A profile's "Claim Types" section |
| **Assessment Areas** | Specialists | A profile's "Assessment Areas" section |
| **Accreditations** | Specialists | Chips on a profile, and a directory filter |
| **Locations** | Specialists | A profile's location line, and a directory filter |
| **Streams** | Articles | **Nothing** — it is the folder in the web address |
| **Topics** | Articles | The coloured chips on article cards, and "Topics" on an article |
| **Departments** | Team members | The group headings on Meet the Team, in the order you set |
| **Event Types** | Events | The badge on an event card, and what the events search matches |

#### Adding an event type

**Taxonomy → Event Types → Create new.** Give it a name — that name *is* the badge a visitor sees —
and it is immediately selectable on every event. The list shows alphabetically everywhere.

**You cannot delete a type that events still use.** The admin refuses and tells you how many events
depend on it, because the alternative is worse: Event type is a required field, so removing it would
leave those events with no type at all, their badge gone from the site, while their records still say
Published. Move them to another type first, then delete.

#### Adding a new team

**Taxonomy → Departments → Create new.** Give it a name and an **Order** (lower shows first on Meet
the Team), and it is immediately selectable on every team member. Assign someone to it and a new
labelled group appears on Meet the Team — no developer, no deploy.

Renaming one renames its heading. Reordering them reorders the groups. Both were fixed in code until
2026-08-20 and could only be changed by a developer.

**Two things point at a department**, and both follow a rename automatically:

- **Team members** — each person's Department, which is what groups them on Meet the Team.
- **People Grid blocks** — a People Grid placed on any page can be limited to one department, and can
  be told to group by department. Since 2026-08-20 the block chooses from this same list rather than
  a fixed one, so the two can no longer offer different teams. If you retire a department, check any
  People Grid that was pinned to it: it will have nothing left to show.

> **Deleting a department that still has members is refused**, and the message says how many. Move
> them to another department first. Without that guard they would keep their profiles but vanish from
> Meet the Team, which is the sort of thing nobody notices for months.

**Two of these are named differently from what a visitor reads.** *Assessment Areas* used to be
called "Areas of Expertise" in the admin, and *Topics* used to be called "Categories" — both were
renamed so the admin matches the site.

> **Deleting a Stream strands its articles.** A stream is the folder in an article's address, so
> removing one leaves every article in it with no address. Move the articles to another stream first.

> **Locations is not Offices.** *Locations* are places specialists consult, used as a filter.
> *Offices* are your own premises, with an address and opening hours.

### 6. People, and Availability

#### Specialists

**What it is:** the external doctors on your panel.

**Where it appears:** the Specialist Panel and Specialty List pages, and each profile at
`/specialists/profiles/<slug>`.

**How a profile is built:** most of it comes from the taxonomy lists above — pick the specialties,
assessment types, claim types, assessment areas, accreditations and locations, and the profile
assembles itself. The free-text parts are the biography, qualifications and position line.

**Ordering the directory.** The Specialist Directory block has a **Sort order** with three choices:

| Choice | What it does |
|---|---|
| **Surname (A–Z)** / **Given name (A–Z)** | Alphabetical. Both read the **Given name** and **Surname** boxes in the sidebar of each specialist, which **fill in automatically from the Full name** — the honorific is stripped and everything after the first word is treated as the surname, so a two-word surname like "Mar Fan" stays whole. Type over either if a name splits wrongly. |
| **Custom — the drag order on the Specialists list** | The order you set by dragging rows on the Specialists list, using the handle at the left of each row. |

Two things about **Custom**, neither of them a fault. Dragging changes nothing on the site
unless that block's Sort order is actually set to Custom — it ships set to Surname. And the drag
order starts out alphabetical by surname, so switching to Custom looks like nothing happened until
you move someone. The list also shows 10 at a time, so moving a person a long way means dragging
across pages.

**The photo's shape is per person.** **Photo shape on the profile page** gives you Tall (2:3, the
same proportion as the founder photograph on the About page), Portrait (4:5) or Square. **For
specialists the default is Square**, because the headshots are square cut-outs on a transparent
background and a tall frame cropped the sides off every one of them. Team members default to Tall,
where the photography really is portrait. It changes the frame on that specialist's own profile page
only — their card in the panel and
the directories keeps its fixed shape. If the photo is *framed* badly rather than the wrong shape,
move the focal point on the image under Media instead; that fixes every place it appears at once.

**Qualifications and accreditations are two different things**, and the difference decides how far a
change reaches. **Qualifications** are typed on the specialist and belong to that one person; each row
carries its own icon, chosen from the wording if you leave it empty. **Accreditations** are *shared
records* (Reference → Accreditations) — a profile picks from the list, so editing one accreditation
changes it on every specialist who holds it, and it doubles as a filter on the specialist directory.
Leave the **Position line** empty and the specialty is used instead, so the line under a name is never
blank. Part 7 → *Choosing an icon* covers changing the icons themselves.

**You can drag to reorder** this list; the order is used on the panel page — and it is also the order
the carousels below render in, so a carousel has no "first" you can set except by dragging here.

**Three different things decide which carousel a specialist appears in**, and they are independent.
Two are tickboxes in the sidebar of their profile; the third is a taxonomy pick.

| Setting | Where it is | What it drives |
|---|---|---|
| **Featured** | Specialist profile, sidebar | The homepage's *Meet Our Expert Panel* carousel |
| **Feature in availability carousel** (advertise) | Specialist profile, sidebar | The carousel at the top of *Make a Booking* and *Specialist Availability* |
| **Assessment Types** | Specialist profile — see Taxonomy above | Which service page carousels they appear in, e.g. tagging *Joint Medical Examination (JME)* puts them on the JME page |

They deliberately do not have to agree. Someone can be Featured on the homepage without being
advertised for booking, and vice versa.

> **The list below the Make a Booking carousel is a fourth thing again**, and the tickbox does not
> control it. That list is built purely from **Availability Sessions** — a specialist appears in it
> only while they have a session that is available, dated today or later, and not past its
> *Advertise until* date. So an advertised specialist with no sessions shows in the carousel and not
> in the list, which is correct and is what Dr Beer does today.

**If a carousel disappears entirely, this is why.** A carousel that filters to nobody renders
*nothing* — the whole band goes, including its heading and buttons. Untick the last Featured
specialist and the homepage section vanishes rather than showing an empty space. The fix is always to
tick someone, not to hunt for the missing section.

**Draft or instant:** has a Draft/Published toggle — saving as a draft removes them from the site.

#### Team Members

**What it is:** VERIFY's own staff.

**Where it appears:** `/about/meet-the-team`, and each at `/about/team/<slug>`.

> Note the two addresses differ — the list is at `/about/meet-the-team` while an individual is at
> `/about/team/…`. Long-standing, and nothing needs doing about it.

**Two photos, and which page each feeds.** A person can show one photo in the team grid and a
different one on their own profile:

| field | where it shows |
|---|---|
| **Team photo** | Meet the Team, and the byline photo wherever they are credited on an article. Also their profile page, unless the next field is set. |
| **Profile photo** | Their profile page **only**. Leave it empty to use the Team photo in both places. |
| **Show no photo on the profile page** | No photo on the profile; they still appear with their Team photo on Meet the Team. This wins over both uploads, so you can hide a photo without deleting it. |
| **Photo shape on the profile page** | The shape of the frame on their profile page — **Tall (2:3)**, **Portrait (4:5)** or **Square**. Tall matches the founder photograph on the About page and is the default **for Team**, because most portrait photography is taller than it is wide and a square frame cuts the top and bottom off. **Specialists default to Square** — their headshots are square cut-outs, so a tall frame only cropped the sides. Meet the Team and bylines are unaffected. |

With no photo *and* no qualifications, the profile's bio widens to the full page rather than leaving
a gap where the photo was. For a bad crop, see **Media** below — it is fixed there, once, for every
page the picture appears on.

**Draft or instant:** has a Draft/Published toggle.

#### Availability Sessions

**What it is:** advertised appointment slots. Each belongs to a specialist and has a date, a time,
a mode (in-person / telehealth / either) and a status.

**Where it appears:** the availability grid on **Make a Booking**. A visitor ticks the sessions they
want and presses Send, which opens their email app with the selection written out.

**Advertise until** stops a slot showing after that date, and defaults to the end of the month — so
old slots disappear on their own rather than needing tidying.

**A specialist appears in the list as soon as they have available sessions** — there is nothing
else to switch on. The separate **Feature in availability carousel** toggle, on the specialist
record, controls only the carousel *above* the list.

**Internal note** (in the sidebar) is **staff only**. It is never shown on the website, never read
out to a screen reader and never included in the enquiry email — it is not returned to the public
website at all, so it is the right place for anything you would not want a visitor to read. Use the
slot's own fields for anything a visitor *should* see.

There is no longer a **Location** field on a session. It never appeared anywhere on the site, and a
visitor learns the location from the specialist's own record instead. Removed 2026-08-25.

**Draft or instant:** instant — but see the note below.

**A change can take up to an hour to appear on the live site.** The pages that show availability are
cached and normally refresh the moment you save. If a slot you have just added or edited is not
showing, that is the cache, not a lost save: your change is stored. Reload after a few minutes before
re-entering it, and tell whoever maintains the site if it is consistently slow.

### 7. The rest

#### Media

Every uploaded image and file. Set **alt text** here — it is what a screen reader announces and what
search engines read.

**Fix a bad crop with the focal point, not a new upload.** If a portrait crops through someone's
face, open the image and move the focal point; every place that image is used re-crops around it.

**Upload at full quality — do not shrink images by hand.** The site makes its own smaller copies and
serves whichever one fits the space, so a large photo is now an advantage (it stays sharp on a retina
screen) rather than a problem. This was not always true: a 5246×6016 headshot was once sent to
visitors at full size and, squeezed into a small card, actually looked *worse* than the low-resolution
photos beside it. Fixed on 2026-08-19.

Save photographs as **JPEG**, not PNG. PNG is lossless and is the
right choice for a logo, but a PNG photograph is roughly ten times the file size of the identical
JPEG, and the site cannot convert between formats. See `README.md` §10 (in the code). The exception is the
**specialist** headshots: those are cut-outs with a transparent background, and JPEG cannot store
transparency, so they stay PNG.

**The social preview image is already set, site-wide.** Every page, article, event, specialist and
team member has its own optional *Meta Image* for link previews, and all of them fall back to
**Site Settings → Social image**, which holds a 1200×630 VERIFY share card. Only override it on a
document that deserves its own picture. If you do, use a **1200×630** image on an opaque background:
anything else gets centre-cropped to that shape, and a transparent PNG picks up whatever background
LinkedIn or Teams happens to use. The logo itself is the wrong choice here — it is too wide, and
crops to "VERI".

**Some page photographs are seeded too.** The larger pictures on About, the homepage, Information for
Clients and Claimants, and Administrative Services come from files in the repository, not from an
upload here — so they survive a rebuild. You can still replace one by uploading over it; it will hold
until someone rebuilds the database from scratch, at which point the repository file returns. If a
picture should change permanently, ask whoever maintains the site to swap the file.

**Team and specialist photos have a second source, and it overrides you.** Those two sets of
headshots are also kept as files in the repository, so that a rebuilt site still has them — an admin
upload lives only on the server it was uploaded to. If someone has a file there, the next seed run
replaces their photo with it, keeping your alt text, focal point and zoom. So if you upload a new
headshot here and it reverts, that is why: the repository file has to be replaced too, or deleted to
hand the photo over to the admin permanently. Ask whoever maintains the site; the folders and naming
are in Part 5 under *Photos that have to survive a rebuild*. Everyone else's images — page
blocks, events, articles — are yours alone and are never touched.

#### Your own icons

Uploaded from **Design → Icon Library** — the same screen that decides which icons editors can choose.
There is no separate place for them. Use the **Upload SVG** button, and pick a **single-colour SVG**
(or a two-colour one; see below).

**A two-colour file becomes a two-tone one.** The built-in icons are all *duotone* — one shape solid,
another at 20% — and an upload gets the same treatment: whichever colour is lighter becomes the faint
tone. If you drew it with a faint shape already, that is kept exactly as you made it.

**What you see in the library is what the site will show.** The tile, and the bigger preview behind
**Edit**, are drawn from the processed artwork — on a light band and a dark one — so you can check it
before it goes anywhere near a page. It will not match the file you uploaded.

**The site paints the icon; the file's own colours are ignored.** That is what makes an uploaded
icon behave like a built-in one — it turns white on the dark navy bands and takes
the brand colour on a light one, with nothing for you to set. It also means a **two-colour logo will
not survive**: it comes out as one flat shape. Put a multi-colour mark on the page as an image
instead.

**Default colour** is the colour that icon should be wherever it is used. Leave it on *"Follows the
band"* and it behaves exactly like the built-in icons. Choose one and it applies everywhere that icon
appears — and if you change it later, every place it is used changes with it. Any single placement
can still override it: see *"Choosing an icon, and its colour"* in Part 7.

**Deleting an icon that is still in use is refused**, and the message names the documents using it —
change those to a different icon first. Deleting it would leave a gap nobody would notice.

Only SVG files are accepted, and an SVG carrying anything other than shapes is rejected at upload.

#### Icon Library *(under Design)*

**Everything to do with icons is on this one screen.** Open **Design → Icon Library** and you see
every icon at once — the **1,513** names Phosphor ships, plus any SVG you have uploaded — with the ones
editors can currently choose already ticked.

- **Tick or untick to decide what editors are offered.** No searching required to see them; search
  only narrows the list. **Only ticked** hides everything else.
- **Upload your own** with the button at the top. It appears in the grid immediately, already ticked,
  because you uploaded it in order to use it.
- **Click Edit on one of your uploads** to rename it, set its default colour, or delete it — and to
  see it drawn the way the site will draw it, on a light band and a dark one.
- **Unticking never changes a page.** The icon stops being *offered*; anywhere already using it keeps
  showing it, and that page's editor still sees it in their picker under *"Used here, not in the
  library"*.
- **Unticking everything does not leave editors with none** — they fall back to the set the site
  ships with. The screen says so when that happens.

Use it to keep the icon set on-brand; there is no reason for a games controller to be one keystroke
away from a medico-legal page.

#### Forms, and Form Submissions

**Forms** are the enquiry forms used across the site. **Form Submissions** is the record of what
visitors have sent — read-only.

**Who gets notified is set per form**, on that form's **Emails** tab. If enquiries stop arriving,
that is the first place to look.

> **If the dashboard shows a red "No notification emails are being sent" banner**, that is not a
> fault you can fix from here, and **no enquiry is being lost**. Everything visitors submit is still
> arriving under **Form Submissions** — but nobody is emailed when one does, so that list has to be
> checked by hand. It also means **password reset will not work**: if you are locked out of the
> admin you will need whoever looks after the server.
>
> The banner disappears on its own once mail is configured on the server. It is showing because this
> installation is deliberately running without an email account attached yet.

> If the **Make an Enquiry** drawer opens but says it is unavailable, the drawer does not know which
> form to use. Fix it at **Site → Site Settings → Enquiry drawer form**. The usual cause is that
> someone renamed the form.

#### Taking bookings with TryBooking

Events are booked through TryBooking, and there are two ways to send someone there.

**A link** — the simplest, and it always works. On the event, fill in **Registration URL** with the
event's TryBooking address (`https://www.trybooking.com/1525708`, using your event's own number).
The Register button then opens TryBooking in a new tab.

**The booking form embedded in the page** — build a page, add the **TryBooking Form** block, and put
the event's number in **TryBooking event ID**. Digits only: for `trybooking.com/1525708` the ID is
`1525708`. Then point an event's **Registration URL** at that page.

> **Event pages cannot hold blocks.** An event is a fixed template, so the TryBooking Form block goes
> on a *page*, which you then link to from the event. That is a limitation of how events are built,
> not a mistake at your end.

**Two things that are not faults:**

- **On a test or preview address the form may not appear**, showing a **Book on TryBooking** button
  instead. TryBooking only allows its form to be embedded on secure (`https`) addresses, so it will
  not load on a local preview but works correctly on the live site.
- **If the form fails to load, the button appears in its place.** Visitors always get a working way
  to book; you never see an empty gap where the form was. The
  button's wording is editable on the block as **Fallback button label**.

Part 7 covers where the block sits on the page and how it is spaced; this section owns what it is
and where the number comes from.

#### Users, Redirects, Search Results

**Users** are admin logins. **Everyone has full access** — there are no restricted roles — so only
add people you trust with the whole site.

**Redirects** send an old address to a new one. Add one whenever you change a page's slug or parent.

**Search Results** is built automatically so the site search can find things. Nothing here is edited
by hand.

#### Page settings

Five screens holding the **fixed wording** on templated pages — the headings and labels that appear
on *every* article, event, team profile or specialist profile, rather than on one page.

| Screen | Controls |
|---|---|
| **Article Settings** | The sidebar cards and fixed labels on every article ("In This Article", "Topics") |
| **Events Settings** | Boilerplate on event pages, per host (AAMLE / VERIFY) |
| **Team Settings** | Breadcrumb, the “About …” bio heading and the Qualification label on every team profile |
| **Specialist Profile** | The section headings on every specialist profile, and the booking-portal band |
| **Specialist Availability** | Wording on the availability grid, and the enquiry email its Send button opens |

#### Recent changes to shared content

Three pieces of copy appear on many pages at once, so a change to one changes them all. Recorded here
because "why did this move on twelve pages?" is otherwise a hard question to answer.

- **The "Ready to Refer Your Next Matter" band** now shows **View Specialist Panel** on the left and
  **Make an Enquiry** on the right. It appears on ten pages and they all follow the same source.
- **The Online Booking Portal band** no longer carries the phone number beside *Send Enquiry*. That
  band appears on Specialist Panel, Specialists and Specialty List, so it went from all three.
- **Meet the Team** runs straight from its hero into the staff grid; the "Our People" heading that sat
  between them has been removed.

#### Site

**Header** is the main menu and its dropdowns. **On a phone or tablet the menu is grouped**: the
button opens a list of your top-level items only, and tapping one expands *its* dropdown while the
others stay shut. Nothing extra to configure — the grouping follows the Dropdown items and
Sub-dropdown items you have already set, and a parent item's own link still works when you tap its
label rather than the arrow. Adding a seventh or eighth top-level item is therefore safe on mobile;
before this it put every link on screen at once. The full bar returns above 1024px.

**Footer** is the link columns, contact details and opening hours. **Site Settings** holds the logo, favicon, brand colours, the enquiry-drawer form, and
the wording of the booking-portal registration email. Inside **Brand colours**, the group named
**Fixed text colours** is the Black, Charcoal and Mid grey offered in every text-colour control;
unlike *Body text* and *Strong text* beside them, those three never flip to white on a dark band.

Two groups inside Site Settings are easy to miss, and both change wording that appears on **every**
page:

- **Breadcrumbs** — the trail under the title on interior pages. **Home label** is the first crumb
  ("Home"), shared site-wide; **Separator** is the character between crumbs (default `›`); and
  **Screen-reader label** names the trail for screen readers, which is the only way someone using one
  can tell it apart from the main menu. The middle crumb — "About", "Events" — comes from the content
  type rather than from here, and an individual page can hide its trail from its own Hero tab.
- **Accessibility** — **Skip-link text** is the wording of the link that appears when a keyboard user
  presses Tab on a fresh page, letting them jump past the menu. The link itself is always there; only
  its wording is editable.

#### Design

**Custom Styles** and **Design System** — see Part 7.

**Icon Library** — the one screen where icons are chosen, uploaded, renamed, recoloured and
deleted. It is documented in full at [Icon Library](#icon-library-under-design) above, beside the
other upload screens, because that is where you go looking for it.

### 7a. Formatting your words

Almost every box you type into is a **rich-text box** — select a word and a small toolbar appears,
in headings and card titles as much as in body copy. A box *without* a toolbar is deliberate: web
and email addresses, anchor ids and CSS classes stay plain, because formatting there would never
reach the page.

**Colour comes from the brand palette**, through either of two controls, and both store a palette
*key* so Site Settings repaints every coloured word at once. **Part 7 → _Formatting copy_ is the
full reference** — which control to reach for, what each of the sixteen colours is, and what
happens when one meets a `[[bracketed]]` phrase. It is not repeated here.

### 8. Admin word → site word

Where the admin and the site use different words for the same thing.

| The admin says | A visitor sees | Why |
|---|---|---|
| **Articles** | *In the Loop* | The section is branded for visitors; the admin names the content type |
| **Topics** | *Topics* | Matches — this was renamed from "Categories" |
| **Assessment Areas** | *Assessment Areas* | Matches — this was renamed from "Areas of Expertise" |
| **Streams** | *nothing* | A stream is only the folder in an article's web address |
| **Specialists** | *Specialist Panel*, *Expert Panel*, *Our Panel of Medical Specialists* | The collection is the people; the pages use marketing wording |
| **Team Members** | *Meet the Team*, *Our People* | ditto |
| **Services** | *the service cards* | These are cards; the service **pages** are Pages |

### 9. Drafts, and what hides a page

**Only five things have a Draft/Published toggle:** Pages, Articles, Events, Specialists and Team
Members. A draft is invisible to visitors.

**Everything else publishes the moment you press Save** — Services, Resources, Offices,
Testimonials, every taxonomy list, and all the settings screens. There is no way to stage a change
to those, so make them when you are ready.

### 10. Traps

- **Opening "Create New" creates the record straight away — before you type anything.** Pages,
  Articles and Events save themselves continuously so live preview works, which means clicking
  *Create New* to have a look and then navigating away leaves an empty `<No Title>` row behind. If
  you open one by mistake, delete it before you leave. (74 of these had built up and were cleared on
  2026-08-18 — one Article and one Event from clicking about, the rest from the test suite.)
- **An article with no Stream has no web address.** It will not appear anywhere.
- **Deleting a Stream strands every article in it.** Move them first.
- **Changing a page's Parent changes its URL** and breaks saved links. Add a Redirect.
- **The Footer's contact fields override the primary Office.** Clear them to fall back.
- **A Service card with no Link override has nowhere to go.**
- **Renaming a Form can disconnect the enquiry drawer.** Re-select it in Site Settings.
- **Only the active tab of a Tabs block is in the page for search engines.** Do not hide anything
  important in a second tab.
- **Clearing "Send to" on the registration email disables those buttons on purpose** — they render
  as plain text rather than opening an email with no recipient. The wording of that email, and what
  each field does, is in Part 7.

## Part 7 — Changing how the site looks

*All of it from the admin. None of it needs a developer or a deploy.*
Everything visual on this site can be changed from the admin. This document tells you where.

> **Looking for what something *is* rather than how it looks?** Part 6
> explains every item in the admin sidebar — what it holds, where it appears on the site, and what
> happens if you delete one. This file is the styling half.

<!-- FOR DEVELOPERS: this file cannot move, and §6 cannot be restructured.
     tests/int/adminControls.int.spec.ts reads it at this exact path and parses §6 by name;
     tests/visual/findDeadCss.mjs builds its dead-CSS allowlist from it. Both break silently
     if the path changes, and the allowlist failing open would mark live CSS as dead. -->

Start with **§1** if you only read one section: it explains why edits sometimes appear not to
work, and how to guarantee they always do.

### 1. How the three layers stack

Styles are applied in three passes. Each one beats the one above it, and **the last one always
wins**:

| # | Layer | Where it comes from | Who edits it |
| --- | --- | --- | --- |
| 1 | Built-in defaults | `globals.css` in the codebase | a developer |
| 2 | `<style id="verify-design-tokens">` | **Site Settings** + **Design System** | you, via admin fields |
| 3 | `<style id="verify-custom-styles">` | **Custom Styles → Global CSS** and presets | you, by writing CSS |

**Your CSS wins over the built-in stylesheet outright** — not on a tie, and not only when your
selector is more specific. `globals.css` lives inside a cascade layer (`@layer verify`), and CSS
gives *unlayered* rules — which is what both admin `<style>` tags are — priority over layered ones at
**any** specificity.

> **Why this changed.** This section used to say all three were "at the
> same specificity, so plain source order decides". That was true of the `:root` token overrides
> below and false of every class preset, and the difference was invisible: a preset like
> `.heading-primary { color: … }` is one class, while the design-reference rules ported into
> `globals.css` are scoped two and three classes deep — `.why-verify--light .why-header
> .section-title`. Presets therefore worked on ordinary pages and did nothing on exactly the pages
> with a bespoke design, which read as "Custom CSS is broken sometimes". If you hit a preset that
> still does nothing, it is now a typo — check the selector matches the class name — not the cascade.

**This means Global CSS can override anything**, including any token set in Site Settings:

```css
/* Custom Styles → Global CSS — this wins over the Site Settings "Primary" field */
:root { --primary: #b0202a; }
```

> **Historical note, in case you find old advice saying otherwise.** These tokens used to be
> applied as an inline `style` attribute on `<html>`. Inline styles outrank every stylesheet, so
> `:root { … }` written in Global CSS was silently ignored. That is fixed — Global CSS is now a
> genuine, unlimited override layer. If you ever see tokens move back onto `<html style>`, this
> guarantee breaks.

**Order to try things, cheapest first:** a built-in block option → a Design System / Site Settings
field → a Custom Styles preset → Global CSS.

### 2. "I want to change X" — where to go

| You want to… | Go to |
| --- | --- |
| Change the brand blue | Site Settings → Brand colours → **Primary** |
| Change body / heading text colour | Site Settings → Brand colours → **Body text (paragraphs)** / **Strong text (headings)** |
| Fix pale text on a dark band | Site Settings → Brand colours → the four **on dark** fields |
| Change the page or card background | Site Settings → Surfaces → **Pure white** (most surfaces) |
| Change error / warning / success colours | Site Settings → **Status & feedback** |
| Change the specialist availability legend | Site Settings → Status & feedback → **Availability** |
| Make the whole site bigger or smaller | Design System → Typography → **Overall size** |
| Change fonts | Design System → **Typography** |
| Round the cards more (or square everything off) | Design System → **Corner rounding** |
| Change section spacing | Design System → **Section spacing** |
| Change the coloured section bands | Design System → **Section bands** |
| Change shadow depth or glow | Design System → **Shadows & glows** |
| Retint every shadow at once | Design System → Shadows & glows → **Shadow colour** |
| Change a gradient's angle | Design System → **Gradients** |
| Speed up / disable hover animations | Design System → Shadows & glows → **Transition** |
| Centre the service cards (icon + title, equal height) | that Services Grid block → **Card alignment** → Centred |
| Make one AAMLE step's pill stand out | that step → **Badge emphasis** → Highlight |
| Force a line break in a heading | press **Enter** in the heading field (`[[brackets]]` still colour a phrase) |
| Change the muted blue-grey (card link arrows) | Site Settings → Brand colours → **Muted blue-grey** |
| Put a block's heading on its own coloured band | that People Grid block → **Header band** (leave as *Same as the section* for one band) |
| Change one block only | that block's **Custom CSS class(es)** + a Custom Styles preset |
| Change the home hero's band or padding | the Home page → **Hero** tab |
| Anything not listed above | Custom Styles → **Global CSS** |

Every field is optional. **Leave it empty to fall back to the built-in default** — that is always
the safe way to undo a change.

### 3. Token reference, grouped by where you edit it

Defaults live in `globals.css :root`. Empty admin field = default.

#### Site Settings → Brand colours

**Core brand**
`--primary` · `--primary-strong` · `--foreground` + `--text-dark-base` (Body text) ·
`--muted-foreground` + `--text-mid-base` (Strong text — the DARKER of the two) · `--bg-light-1` + `--accent` ·
`--border-base` + `--input` · `--accent-light` · `--primary-deep`

**On dark** — used automatically wherever text sits on a dark or coloured band
`--text-on-dark` · `--text-muted-on-dark` · `--accent-sky` + `--accent-on-dark` · `--border-on-dark`

**Surfaces**
`--background` (page) · `--card` + `--popover` (cards/panels) ·
`--card-foreground` + `--popover-foreground` · `--white` · `--muted` ·
`--primary-foreground` (text on primary) · `--ring` (focus outline)

**Extended blues** — the ramp the gradients and decorative panels draw from
`--secondary` · `--secondary-foreground` + `--accent-foreground` · `--secondary-bright` ·
`--gradient-start` · `--steel` · `--navy` · `--definition-blue` · `--bg-light-2`

**Fixed text colours** — the Black, Charcoal and Mid grey in the text-colour palette
`--ink-black` · `--ink-charcoal` · `--ink-grey`
Deliberately separate from Body text / Strong text above. Those two are *semantic* and flip to
white on a dark band; these three do not flip. Keeping them
apart means repainting body copy does not also repaint every word someone coloured Charcoal.

**Status & feedback**
`--success` · `--warning` · `--error` + `--destructive` · `--form-error` ·
`--callout-info` · `--callout-note` · `--callout-success` · `--callout-warning` ·
`--sa-inperson` · `--sa-telehealth` · `--sa-either`

#### Design System

| Group | Variables |
| --- | --- |
| Typography | `--font-heading`, `--font-body`, `--font-size-base`, **`--vf-text-scale`** |
| Section spacing | `--space-{compact\|normal\|spacious\|xl}` |
| Column gaps | `--gap-{tight\|normal\|wide}` |
| Heading sizes | `--size-heading-{sm\|md\|lg\|xl\|display}` |
| Text block sizes | `--size-text-{sm\|base\|lg}` |
| Corner rounding | `--vf-radius-{none\|sm\|chip\|card\|tile\|md\|panel\|pill\|circle}`, `--radius` |
| Section bands | `--band-{muted\|accent\|primary\|dark}` |
| Gradients | `--vf-grad-{image-tint\|deep\|hero\|avatar}` |
| Shadows & glows | `--vf-shadow-{color\|color-deep\|xs\|sm\|md\|lg\|xl\|2xl}`, `--vf-glow-{sm\|md\|lg}`, `--vf-shadow-{ring\|inset-highlight\|hard}`, `--transition` |

`--shadow` and `--shadow-lg` still exist and are aliases of `--vf-shadow-sm` / `--vf-shadow-lg`.
Edit those rungs rather than the aliases.

**Overall size** multiplies the root font size. Because nearly all type on this site is sized in
`rem`, one change scales everything proportionally — including the spacing around text, since
Tailwind's spacing scale is also rem-based. Page width is fixed in pixels, so a larger setting
means bigger type in the same column. Layout breakpoints are unaffected by design.

**Shadow colour** tints the whole shadow scale at once and follows Primary unless you override it.
A darker brand colour therefore makes every shadow heavier.

#### Not editable from a field
`--chart-1…5` and `--sidebar-*` affect Payload's own admin chrome, not the public site.
Override them in Global CSS if you ever need to.

### 4. The `-base` rule

Three tokens exist in two forms:

| Flips inside `.vf-on-dark` | Never flips |
| --- | --- |
| `--text-dark` | `--text-dark-base` |
| `--text-mid` | `--text-mid-base` |
| `--border` | `--border-base` |

**Paint text with the flipping ones. Paint backgrounds and borders with `-base`.**

Get it backwards and you get an invisible element: a surface painted with `var(--text-dark)` turns
white inside a dark band, because that token is *supposed* to become the on-dark text colour there.

- `.vf-on-dark` is added automatically to every `primary` and `dark` Section. Everything inside it
  flips — you never need to restyle a section for a dark background.
- `.vf-on-light` goes on a light surface **inside** a dark band (a white card, a pale panel) to
  restore the light tokens. Without it, text on that card inherits the on-dark palette and can end
  up white-on-white.

### 5. Limits of each editing surface

**Token fields** (Site Settings, Design System) accept any CSS value *except* `<`, `>`, `{`, `}`,
`;`, `\` and comment markers, up to 200 characters. Those characters could break out of the
stylesheet, so they're rejected when you save and the field will tell you. An invalid value is
never rendered — the built-in default is used instead.

**Custom Styles → presets and Global CSS** are unrestricted CSS. Nothing is filtered except the
literal text `</style`, which cannot appear in valid CSS anyway.

**Custom Styles presets** are the only classes an editor can apply to a block: define one, then
pick it from the **Custom CSS class(es)** dropdown. There is no free-text class field by design.

### 6. Hook classes

These class names are a **published API**. They are load-bearing — the dead-code sweep treats
everything listed here as live, and they should not be renamed without updating this file.

**Sections** — `.vf-section`, `.vf-section__inner`, `.vf-section-header`,
`.vf-section-header__eyebrow`, `.vf-section-header__title`,
`.vf-section-header__subtitle`, `.vf-section-header--centered`

> The header's rule under the title is plain `.divider`, not
> `.vf-section-header__divider`. That name was documented here for a while and
> never existed; target `.vf-section-header .divider`.

**Block roots** — `.vf-gateway-cards`, `.vf-feature-grid`, `.vf-stats-band`, `.vf-process-steps`,
`.vf-tabs`, `.vf-split-feature`, `.vf-cta-band`, `.vf-specialty-grid`, `.vf-people-grid`,
`.vf-faq`, `.vf-home-hero`, `.vf-callout-block`

**Shared parts** — `.vf-card` (every card/tile/stat/person card — target this for card styling),
`.vf-card__icon`, `.vf-card__title`, `.vf-badge`, `.vf-form-error`

**Components**
- Carousel: `.vf-carousel`, `__viewport`, `__track`, `__arrow` (`--prev`/`--next`)
- Person card: `.vf-team-card`, `__photo`, `__image`, `__name`, `__role`, `__body`, `__link`,
  `__mono`, plus `.vf-person-card__avatar` on the avatar itself. Person cards are also
  `.vf-card`, so `.vf-card` styling reaches them.
- Stats: `.vf-stats-band__stat`, `__number`, `__label`
- Process: `.vf-process-steps__step`, `__number`
- Tabs: `.vf-tabs__tablist`, `__tab` (`--active`), `__panel`, `.vf-tabs__tabbar` (the centred pill bar)
- Specialty grid: `.vf-specialty-grid` on the block, `.vf-checklist` on its checklist variant
  (rows are `.claims-list li`, the arrow is `.claim-arrow`, the label `.claim-name`);
  each card-variant tile is a `.vf-card` with `.vf-card__icon` / `.vf-card__title`
- Services grid: `.services-grid`, plus `.vf-cards--center` when **Card alignment** is Centred
- FAQ: `.vf-faq__item`, `__question`, `__question-text`, `__question-icon`, `__answer`, `__list`,
  plus the help card `.vf-faq__help`, `__help-message`, `__help-icon`, `__help-text`,
  `__help-contact`, `__help-contact-item`. Appearance variants appear on the block root:
  `.vf-faq--divided`, `--toggle-chevron`, `--toggle-pill`, `--icon-tile`, `--compact`,
  `--rule-grey`, `--rule-brand`, `--split`
- Callout: `.vf-callout`, `__content`, `__icon`, `__tag`, `__heading`, `__body`, `__links`
- Heroes: the interior hero root is `.page-hero` (with `.page-hero--light|dark|service`);
  its meta row is `.vf-page-hero__meta` / `__meta-item`. Home hero:
  `.vf-home-hero`, `__title`, `__definition`.

> **Removed from this list because nothing emits them.** `.vf-person-card` (the
> root is `.vf-team-card`), `.vf-person-card__name` / `__position` / `__location`
> / `__badge` / `__avatar-img` / `__avatar-initials`, `.vf-specialty-grid__tile`
> / `__label` / `__arrow`, and `.vf-carousel__item` / `__controls` / `__dots` /
> `__dot`. A preset written against any of these silently does nothing.
>
> **Three shipped presets were written against those names and did nothing:**
> *Carousel · Overlay arrows*, *Avatars · Gradient initials* and *Divider · Bold*.
> They are corrected in the seed, but **presets are database rows** — an existing
> site keeps the old CSS until someone opens Design → Custom Styles and edits
> those three presets by hand. Re-running the seed will not fix them.

**Layout primitives and atoms**
- Section: padding `.vf-section--pt-{none|compact|normal|spacious|xl}` and `--pb-*`;
  bands `.vf-section--{white|muted|accent|accent-solid|primary|dark}`
- Row/Column: `.vf-row`, `.vf-row--gap-{none|tight|normal|wide}`,
  `.vf-row--alignY-{top|center|bottom|stretch}`, `.vf-col`, `.vf-col--span-{1..4}`
- Atoms: `.vf-heading--{sm|md|lg|xl|display}`, `.vf-text--{sm|base|lg}`, `.vf-btn--{sm|lg}`,
  `.vf-image--{full|wide|normal|narrow}`, `.vf-image--rounded-{none|sm|md|full}`,
  `.vf-portrait--{square|portrait|tall}` (profile-page photo shape),
  `.vf-image--shadow-{none|sm|md|lg|xl}`, `.vf-spacer--{xs|sm|md|lg|xl}`,
  `.vf-divider--{line|dots|gradient}`, `.vf-icon--{sm|md|lg}`,
  `.vf-icon--{primary|accent|muted|inherit}`, `.vf-align-{left|center|right}`
- Effects: `.vf-hover-{lift|glow|zoom|accent-bar}`, `.vf-shadow-{none|xs|sm|md|lg|xl|glow|glow-strong}`
- Nested blocks render in bare mode (`.vf-section-bare`) — no banding or padding, inheriting the
  parent Section's background and width.

### 6a. Formatting copy — bold, italic, links and colour

**Every box you type words into is a rich-text box.** Select a word and the small
toolbar above the field gives you **bold**, *italic*, underline and a link. That
is true of headings, card titles, bullets, captions, button labels and body copy
alike — not just the big text areas.

A few boxes are still plain, and they are the ones where formatting
could not show up even if you applied it: a web address, an email address, an
anchor id, a CSS class, a colour value, and a handful of labels that the page
builds into a button or a filter with JavaScript. If a box has no toolbar, that
is why.

#### Colouring text

There are two ways, and they are for different jobs.

**To colour some words** — a phrase, a line, or everything in one box — select
them and use the **colour swatch in the toolbar**, next to **B** / *I* / U. It is
in every box that has a toolbar. Pick **Default style** at the top of that menu to
take a colour back off.

**To colour a whole heading** — the heading and its subheading together, without
selecting anything — use the block's **Text colour** dropdown, usually just below
the heading fields.

> **The dropdown reaches the block's own heading and subheading, and nothing
> else.** It does not colour the cards, list items or steps underneath. Those are
> their own fields, so select their words and use the toolbar swatch. This is the
> single most common reason the dropdown looks like it is doing nothing.

Both offer the same brand palette:

| Choice | What it is |
| --- | --- |
| **Default (as designed)** | Leave it here unless you have a reason. Nothing changes. |
| **Brand blue** / **Deep navy** | The two brand blues. Both lighten on a dark band so they stay legible. |
| **Deep link blue** | The darker blue a link turns on hover. |
| **Bright blue** | A lighter accent blue. |
| **Definition blue** / **Sky blue** | Pale blues for text on a dark band or a photograph. On a white background they are very hard to read — Sky blue especially, which is close to invisible. |
| **Muted grey-blue** | For a line that should sit back from the copy around it. |
| **Black** / **Charcoal** / **Mid grey** | Plain ink. **These stay the colour they say on every band, including a dark one** — that is what separates them from the two "Follows the band" choices at the bottom. Charcoal is the colour headings already are, so on a light background it looks like Default; the difference shows on a dark band, where Charcoal stays dark and "Follows the band" turns white. |
| **White** | For text over a photograph or a coloured panel. |
| **Success green** / **Warning amber** / **Error red** | The same three colours the Callout block uses, for a line of copy that has to match a panel beside it. Both green and amber are only comfortable to read at larger sizes. |
| **Follows the band — heading** / **— body** | The site's own two text colours. On a normal light background **these look exactly like Default, because they are the colour the text already is.** They earn their place on a dark band, where they turn white and pale — so a card you later switch from light to dark stays readable with no further action. If you are on a light background and want to see a change, pick almost anything above instead. |

The colours come from **Site Settings → Brand colours**, so if the brand changes,
every coloured line on the site changes with it. That is the reason to pick from
this list rather than to reach for CSS: a hex typed into a style sheet would be
left behind.

**One thing to know about White.** In the editor it is drawn with a faint dark
outline so you can see it on the white background of the box. That outline is
only in the admin — on the page the text is plain white.

**And remember to Publish.** Pages save your typing to a draft as you go, so the
live page keeps showing the old colour until you press **Publish**. A colour that
"did not work" is worth re-checking for this first.

#### `[[Brackets]]` still work, and are not the same thing

Wrapping a phrase in `[[double brackets]]` paints *that phrase* in the brand
accent — a heading's highlighted words. It is the older way of doing it, and it
still works everywhere.

When two of these meet, the more specific instruction wins:

| Situation | What you see |
| --- | --- |
| Brackets inside a heading you coloured with the **Text colour dropdown** | The bracketed words keep the brand accent. The dropdown sets the line's default, and the brackets are more specific than a default. |
| Brackets you selected and coloured with the **toolbar swatch** | Your chosen colour wins. You highlighted those exact words and asked for a colour, so the brackets give way. |

If you want a phrase in the accent blue, brackets are the quickest way. If you
want it in any other colour, select it and use the swatch.

#### Pressing Enter in a heading

You get a second line of the same heading, which is how the two-line lockups on
the home page are built ("Ensuring Accuracy," / "Empowering Justice"). It does
not start a new heading or a new paragraph on the page.

### 7. Built-in options (no CSS needed)

**Formatting is not in this list** — bold, italic, links and both ways of
colouring text are on the field itself; see §6a. What follows is the block-level layout options.

**Not every block has all of these** — that sentence used to say "every block exposes…" and sent
people hunting for a Background field on Heading, Text and Spacer, which have never had one.
Measured 2026-08-21 across the 52 blocks: **Background** on 24, **Container width** on 25,
**Motion** on 24, **Extra CSS classes** on 15, **Hover effect** on 11, **Card shadow** on 12, and a
**Style preset** on 49. Broadly: a block that draws a band across the page has the section controls;
the atoms you drop *inside* one (Heading, Text, Button, Image, Spacer, Divider, Icon) do not, because
they take their background from the Section around them.

**The block's own edit panel is the authority, not this page.** If the control is not there, that
block does not have it. Layout primitives add padding, gap, columns/span and alignment. The home hero
adds background, width and padding. Reach for CSS only after these.

**The controls on the pieces inside a Section.** §6 above lists the CSS classes these produce, which
is no help if you are looking for the setting. Each of these is a normal field on the block:

| On this block | The control | What it does |
| --- | --- | --- |
| Heading | **Heading level** | H1–H4. Changes what the page announces to a screen reader, not just the size |
| Heading | **Size** | Small → Display, independent of the level |
| Text | **Text size** | Small / Base / Large |
| Button | **Size** | Small / Default / Large |
| Image | **Width** | Full, Wide, Normal, Narrow |
| Image | **Corner rounding** | None → Fully round. **Not the same control as Design System → Corner rounding**, which sets the site-wide default; this one overrides it for one image |
| Image | **Shadow** | None → Extra large |
| Spacer | **Height** | XS → XL — for adding space without an empty paragraph |
| Divider | **Style** and **Width** | Line, dots or gradient; how far across the column it runs |
| Icon | **Size** and **Colour** | Small/Medium/Large; brand blue, accent, muted or inherit |
| Any of them | **Alignment** | Left / Centre / Right |
| Row | **Vertical alignment** | Top, centre, bottom or stretch — how columns of different heights line up |
| Column | **Column span** | How many of the row's columns this one occupies |
| Anywhere an icon appears | **the icon picker** | A fixed set of icons. Type to filter; only icons in the set can be chosen, so an icon can never fail to draw |
| A person's record (Team / Specialists) | **Photo shape on the profile page** | Tall (2:3), Portrait (4:5) or Square. **Team defaults to Tall, Specialists to Square** (their headshots are square cut-outs; a tall frame cropped the sides). Changes the shape of the frame on **that person's own profile page only** — their card on the listing pages, in directories and on article bylines keeps its fixed shape, so one person cannot make a grid ragged. If the photo is *badly framed* rather than the wrong shape, move the focal point on the image in Media instead |

**Blocks this guide had never mentioned.** They are in the *Add block* list and they work; there was
simply nowhere describing them, and the one page that displayed them was deleted on 2026-08-20:

- **Stats Band** — a row of big numbers with labels, on a band.
- **Call to Action** — a heading, a line of text and a button.
- **Spacer**, **Divider**, **Icon** — the atoms in the table above, droppable inside a Section or Row.
- **Banner** and **Code** — available *inside a rich-text field* rather than the block list; a
  coloured callout, and a code sample.

> **Linking to a section of another page.** Every link now has a **Jump to section** box under the
> document picker. Type the section's Anchor ID there — without the `#` — and the link lands on that
> section instead of the top of the page. It only appears for *Internal link*, and it is the right
> way to do it: the link still follows the page if the page is ever moved or renamed, which a
> hand-typed address does not. The Appointment Guide's In-Person / Videolink options each have their
> own Anchor ID too, so a link can open the guide *on* one of them.

> **One exception: Testimonials ignores Hover effect → Lift.** Those cards deliberately do not move
> on hover — they highlight by turning their border brand blue, which is what the design calls for.
> The carousel crops tightly to the card, so anything that moved a card cut its top edge off. Glow,
> Zoom, Accent bar and None all still work on that block.

### 8. Five-minute recipes

**Rebrand to a different colour**
Site Settings → Brand colours → Primary. Most of the site follows it, including shadows and
gradients. Then check Primary (hover/active) and Deep primary.

**Make everything bigger**
Design System → Typography → Overall size → 110%.

**Square off every corner**
Design System → Corner rounding → set every field to `0`.

**Change the section band gradients**
Design System → Section bands. Any CSS colour or gradient works.

**Turn off all hover animation**
Design System → Shadows & glows → Transition → `0s`.

**Add a webfont**
Custom Styles → Global CSS:
```css
@font-face { font-family: 'Your Font'; src: url('https://…') format('woff2'); font-display: swap; }
```
then Design System → Typography → Heading font → `'Your Font', sans-serif`.

**Restyle one block only**
Custom Styles → add a preset named `quiet-cards`:
```css
.quiet-cards .vf-card { box-shadow: none; border: 1px solid var(--border-base); }
```
then pick **quiet-cards** in that block's *Custom CSS class(es)*.

### 9. Tips

- Scope to a block: `.<your-class>.vf-section { … }` or `.<your-class> .vf-card { … }`.
- Use **Element styles** (Heading / Cards / Buttons) to target one part of a block.
- Prefer tokens over literal colours — `var(--primary)` keeps working after a rebrand, `#1c75bc`
  does not.
- If a change seems to do nothing, check §1: something later in the order is overriding it.
  Global CSS always wins.

#### A form or signup box is missing from the page — it is not CSS

If the **"Make an Enquiry"** drawer opens but its Send button is greyed out and it says
*"This form is temporarily unavailable"*, nothing is hidden and no styling is at fault — so there is
nothing to fix on this page. **Part 6 → Forms explains what has happened and how to fix it.**

Same for a **newsletter band** that shows a heading and *"Signups are temporarily unavailable"*
instead of an email box: open that block on the page and set its **Form** field. If it shows the
box but nothing is stored, the chosen form is missing a field named `email` — add one under
**Forms**.

Neither will ever show a working-looking box that throws the submission away.

#### Two-tone sections: a heading band above the content

Some designs put the intro on one colour and the content below it on another —
**About us → Meet the Team** is the example: *"Our People / Experienced, Dedicated & Client-Focused"*
sits on light blue, the team photos on grey.

That is one block, not two. Open the **People Grid** block and you will see two colour pickers:

- **Background** — the band behind the block's content (the photos).
- **Header band** — the band behind the eyebrow, heading and intro paragraph.

Leave **Header band** on *"Same as the section"* and everything sits on one colour, exactly as
before. Pick any other colour and the heading moves onto its own full-width band above the content.

The colours themselves are not set here — they come from **Design System → Section bands**, so
changing *Accent (light blue)* there restyles every accent band on the site at once.

Two things:

- If the block has no eyebrow, heading or intro text, **no band appears** however you set this. An
  empty coloured stripe is never rendered.
- Inside a Section or Row, a block already inherits its parent's background, so the setting has no
  effect there.

#### Article headings each have a shareable link — and renaming one changes it

Every **Heading 2** in an In the Loop article automatically gets a link of its own, built from the
heading's own words: *"A Simple Pre-Send Check"* becomes
`…/five-common-errors…#a-simple-pre-send-check`. There is nothing to fill in, and the same words
appear in the **In This Article** list down the left of the page.

Two things follow from that:

- **Clicking a contents item now puts that link in the address bar**, so you can copy it straight
  out and send someone to that exact section.
- **Rewording a heading changes its link.** Anyone who saved or shared the old one lands at the top
  of the article instead — the article still opens, nothing 404s, they just have to scroll. Worth a
  thought before renaming a heading in an article you have circulated.

`[[Double brackets]]` work in article headings the same way they do everywhere else, and they are
tidied out of both the contents list and the link — `Preparing the [[Claimant]]` reads
*"Preparing the Claimant"* in the sidebar and links as `#preparing-the-claimant`.

If two headings in one article are worded identically, the second gets `-2` on the end so both stay
reachable.

#### An event page's recap is the page — here is everything you can put on one

Open **Events → the event → Details**. Everything below is optional; each surface simply does not
appear until you put something in it.

| Field | What it does on the page |
|---|---|
| **Recap (past events)** | The main write-up, shown once the event date has passed. Formats exactly like an article body — Heading 2, Heading 3, bold, lists, links. |
| **Show "In this recap" contents list** | On by default. Lists the recap's Heading 2s above it, each one a link. Only appears once the recap has **two or more** of them, so a short recap is not given a one-item contents box. |
| **Photo gallery** | Photos from the day, in a grid under the recap. Each can carry a caption. |
| **Downloads / attachments** | Slides, handouts, a recording — one download button each. The **Label** is what the visitor reads; leave it empty and they get the filename. |
| **Image** | Turns the plain hero into a full-width photo hero, the same treatment an article gets. Leave it empty and the hero stays as it is. |
| **Host event page URL** | The event's own page on aamle.com.au. Adds a "View this event on AAMLE" button to the row at the bottom. This is *not* the Registration URL, which usually points at the general seminar menu. |

Recap headings get their own shareable links, exactly as article headings do — see the section
above, including the warning about rewording one you have already circulated.

**Cost and CPD** no longer appear on the event page itself; they read on the event *cards* in
listings instead. The wording of all three ("Free", "CPD eligible", the points template) lives in
**Events Settings → Event page labels**.

**The "this event has now concluded" line is two lines.** A past event with no recap written yet
shows one of them, and which one depends on whether you have attached anything:

- nothing attached → *"…Contact our team for recordings or resources from this session."*
- photos or downloads attached → *"…Photos and resources from the session are below."*

Both are in **Events Settings → Event page labels**. They are separate because the first one, shown
above a Downloads list, tells the visitor to email you for the file they are looking straight at.

**Two buttons that people ask about:**

- The **"Contact Us"** button that replaces "Register" once registrations close goes to
  **Events Settings → Event page labels → Contact page URL** (`/contact` by default). It used to
  reuse the event's registration link, which sent people to a booking page they could no longer use.
- The **AAMLE / VERIFY intro paragraph and the tinted callout** under it are shared by every event
  with that host and live in **Events Settings → AAMLE events / VERIFY events**. Both are rich text,
  so you can bold a name or link out.

#### Feature cards can have a tinted header band

**Pages → the page → the Feature Grid block → Card style.** Three choices:

| Card style | What it looks like |
|---|---|
| **Card (bordered)** | The default — a bordered box with a subtle gradient, everything stacked inside it. |
| **Plain (no border)** | No border, no background. For a list of points that should not look like cards. |
| **Banded (tinted header)** | The icon and title sit on a pale blue panel across the top of the card; the description and any "What's Included" details sit below it on the card's own background. |

"Banded" is what `/services/medico-legal/ime` uses for its four assessment formats. Nothing else needs
setting — pick it and the block rearranges itself.

Two more, on that block generally:

- The **"What's Included"** list under a card comes from the *Details* rows on each feature. Each row
  takes an icon, a bold heading and a description; leave the list empty and nothing renders.
- The **Columns** field sets the *desktop* layout. **Below 600px every card grid is one column**, whatever
  you pick — four cards across a phone measured 69px wide each, which is not a card. Between 600px and
  1024px most grids show two. This was only half-true when first written here: the blocks wrote their
  column count in a way that beat every screen-size rule, so a grid set to 3 or 4 stayed that way at
  390px. Fixed on 2026-08-25 and now asserted by `tests/e2e/responsive.e2e.spec.ts`.

#### Carousels — what you can change, and what the numbers mean

Two different kinds of carousel, and their speed fields mean different things. Getting this backwards
is the usual reason one ends up too fast.

| Block | Where | Speed field | What the number means |
|---|---|---|---|
| **People Grid** (Layout: Carousel) | Home, JME specialists | **Loop duration (seconds)** | How long the whole strip takes to scroll past **once**. It never stops — it is a continuous ribbon, not slides. **Lower = faster.** The design uses **60**. |
| **Availability** | Make a Booking, Specialist Availability | *(none)* | Same ribbon, fixed at 60 seconds. |
| **Featured Articles Carousel** | In the Loop | **Autoplay interval (ms)** | How long **each slide** is shown before the next one. The design uses **5000** (5 seconds). |
| **Slide Carousel** | Events | **Autoplay interval (ms)** | Same — per slide. The design uses **5800**. |
| **Testimonials** (Layout: Carousel) | Home | *(none)* | Never moves on its own; the arrows are the only way through. |

Both auto-advancing carousels also have **Auto-advance slides** (untick it and it only moves when
someone clicks), **Show prev / next arrows** and **Show dot indicators**.

The ribbon carousels have **Show direction arrows** instead. Those arrows do not step through cards —
they reverse the direction the ribbon travels. All of them pause while the pointer is over them, or
while anything inside has keyboard focus. There is no setting for it.

Arrows and dots also hide themselves automatically when there is only one item to show, whatever the
tickbox says.

#### Which specialists a carousel shows

Not a styling question, but it is the one people ask next, and the answer is not in the block.

A **People Grid** set to *Specialists* shows **everyone** unless you narrow it. The four narrowing
options sit together on the block:

| Option | Shows |
|---|---|
| **Only featured specialists** | Those with **Featured** ticked on their profile — the homepage carousel uses this |
| **Only advertised specialists** | Those with **Feature in availability carousel** ticked |
| **Specialty** / **Location** | Those carrying that one specialty or location |
| **Assessment Type** | Those whose profile lists it — the JME page uses this, so tagging a specialist with *Joint Medical Examination (JME)* puts them on that page with no other edit |

> **A carousel that matches nobody renders nothing at all** — the whole band goes, heading and
> buttons with it, rather than leaving an empty space. So if a section has vanished, check the filter
> before checking the CSS. Untick the last Featured specialist and the homepage section disappears.

Changing *who* is on a profile — Featured, the availability tick, the Assessment Types list — is
Part 6 → **Specialists**. This section only owns how the ribbon looks and moves.

#### A TryBooking booking form on a page

Add the **TryBooking Form** block and put the event's number in **TryBooking event ID** — digits
only, so `1525708` for `trybooking.com/1525708`. Everything else is the usual section furniture:
eyebrow, heading and subheading above it, plus **Background**, **Container width**, **Spacing** and
**Motion**.

What is *not* adjustable is the form's height. TryBooking sizes its own frame and tells the page how
tall to be, so there is no height setting and none is wanted — declaring one would either clip the
booking steps or leave dead space beneath them.

> **The form is hidden until it has actually loaded**, and a **Book on TryBooking** button shows in
> its place until then. A booking form that failed to load would otherwise leave a large empty
> panel, so the visitor always sees something that works. Change the button's words with
> **Fallback button label**; it is rich text like every other label.
>
> On a local preview you will usually see only the button, because TryBooking allows its form to be
> embedded on secure (`https`) addresses only. It works on the live site.

For which event, and how to link one from an event page, see the TryBooking section in Part 6.

#### Step numbers can be `1` or `01`

**Pages → the page → the Process Steps block → Step number style.** The design uses both, so this is
per-section rather than a site-wide setting:

- **Plain — 1, 2, 3** — the JME process, and the Administrative Services "how it works".
- **Padded — 01, 02, 03** — Information for Clients, Information for Claimants.

Changing it affects only the block you are editing.

#### Split Feature rows have three looks, mixed and matched

**Pages → the page → the Split Feature block.** Three independent settings near the top. Each one
leaves everything else alone, so you can take any combination.

| Setting | Choices | What changes |
|---|---|---|
| **Row style** | Spaced · **Divided by a rule** | Spaced leaves a gap between rows. Divided draws a hairline rule between them instead, with even padding either side — no rule above the first row. |
| **Text density** | Default · **Compact** | Compact steps the *whole section* down a size: the section heading, the intro, each row's title, its body copy, its bullets and the caption inside an image placeholder. |
| **Bullet style** | Tick icon · **Plain dot** | What marks a bullet that has no icon of its own. |

`/services/medico-legal/reporting-services` is all three at once, and is what the design calls for.

**A bullet with its own icon always keeps it.** Setting Bullet style to Plain dot changes only the
bullets you have *not* given an icon — so you can mark three points with dots and one with a tick,
and no choice you made gets thrown away.

#### Image placeholders, and how to replace one

Each Split Feature row can show a pale blue box in place of a photo, so a page can be laid out before
the photography exists. Per row:

- **Show an image placeholder** — the tickbox that turns it on.
- **Placeholder label** — the caption inside it, e.g. "Image Placeholder".
- **Placeholder icon** — an optional glyph above the caption. Reporting Services uses the `image`
  one; the /services rows deliberately have none.

**To replace it, just upload an image to that row.** The whole placeholder disappears — box, caption
and glyph together — and the photo takes its place. You do **not** need to untick anything, and
removing the image later brings the placeholder back exactly as it was.

#### The photo in "Your Examination Step by Step"

**Pages → Information for Claimants → the Process Steps block.** The same four controls, in the
left-hand column beneath the intro copy — a **Left-column photo**, plus the placeholder tickbox,
caption and glyph. They appear only on the *Claimant step list* layout, because it is the only one
of the four with a column to put a photo in; on Cards, Two-row and AAMLE panels they are hidden
rather than offered and ignored.

The frame is a fixed 4:3 whatever you upload, so the column keeps the same height and the page never
reflows around a tall or panoramic photo. If the crop cuts through the wrong part of the picture,
that is a Media setting rather than a styling one — **Part 6 → Media** explains the focal
point. The tile shows the pale blue placeholder with "IMAGE PLACEHOLDER" until a photo is added.

#### A specialist's job title, qualification icons and accreditations

**Specialists → the specialist.**

- **Position / title line** is what shows under the name on the profile — "Consultant Spinal Surgeon",
  not the specialty. Leave it empty and the specialty is used instead, so the line is never blank.
- **Qualifications** is a list, and each row has its **own icon**. The defaults follow the design: a
  graduation cap for a degree, a medal for a fellowship, a certificate for a certificate or diploma.
  Add a row and leave the icon empty and it picks the right one from the wording — set one and your
  choice always wins.
- **Accreditations** carry their own icon too, and default to the seal-check tick, which is what the
  design calls for. They are *shared records*, so changing one changes every specialist who holds it
  — **Part 6 → Specialists** covers what they are and what else reads them.

#### Card styles on a Feature Grid, and what makes service cards centre

**Pages → the page → the Feature Grid block → Card style.** There are now five:

| Card style | What it looks like |
|---|---|
| **Card (bordered)** | The default — a bordered box with a subtle gradient. |
| **Plain (no border)** | No border, no background. For points that should not look like cards. |
| **Banded (tinted header)** | Icon and title on a pale blue panel across the top. |
| **Soft** | Flat white, a wider corner, a soft blue shadow, and a gentle lift on hover instead of the bolder shift. The support cards on **Information for Clients** use this. |
| **Benefit (plain icon, centred)** | Centred, with a large plain blue icon instead of an icon tile, and the description justified. The **Why Join VERIFY** cards on *Join the Expert Panel* use this. It also drops to two columns at 960px and one at 640px, rather than the shared 1024px breakpoint. |

#### Making a section's heading heavier

**Pages → the page → the block → Heading weight**, on a Feature Grid or a Split Feature. **Default**
matches every other heading on the site; **Heavy** is a bolder cut. Only *Join the Expert Panel*
uses it — the design reference makes that one page's headings heavier than the rest, and this field
is how that stays confined to that page instead of re-weighting all of them.

Separately, on a **Services Grid**, the **Card alignment** field is what turns the cards into centred
tiles — icon centred above a centred title, all cards the same height. Left is the default and gives
you a normal left-aligned card. The homepage and Information for Clients both use **Centred**; if a
services grid ever looks unexpectedly ragged next to those, this is the field to check.

#### The FAQ accordion — six settings, and every one leaves the others alone

**Pages → the page → the FAQ block.** The block has always drawn each question in its own outlined
white box. The design reference draws a flat list instead, so both are now available, along with the
pieces that vary between them. **Leave any of these blank and nothing changes** — an untouched FAQ
looks exactly as it always has.

| Setting | Choices | What changes |
|---|---|---|
| **Item style** | Card · **Divided** | Card keeps each question in its own outlined box with a gap between. Divided drops the boxes for a flat list separated by hairline rules. |
| **Toggle style** | Plus / minus · **Chevron** · **Pill** | The open/close marker at the end of each question. Chevron is a thin arrow that turns as it opens; Pill sets the + and − in a filled circle that inverts to white-on-blue. |
| **Icon style** | Inline · **Tile** | Only matters if a question has an icon. Tile sets it in a rounded tinted square and indents the answer so it lines up under the question text. |
| **Density** | Comfortable · **Compact** | Compact tightens the row height and steps the question, answer and section heading down a size. |
| **Rule colour** | Light · Grey · **Brand tinted** | Only appears when Item style is Divided. Brand tinted suits an accordion sitting on a coloured band. |
| **Content width** | Narrow · Normal · Wide · Full | Leave blank for the narrow column the block has always used. |

Where each is used: **Information for Clients** and **Information for Claimants** are Divided +
Chevron; the **IME** page's claim-types list is Divided + Pill + Tile + Compact on brand-tinted rules;
the **JME** FAQ is Divided + Pill + Compact. Those four are the only FAQ blocks on the site — the
Style Guide page that used to hold a fifth on the plain **Card** style was removed on 2026-08-20, so
there is nowhere left to see the Card look without adding an FAQ block to a page yourself.

> **"Only one open at a time" is a separate tickbox.** Untick it and a
> reader can leave several answers open to compare them — which is what the reference does on both
> Information Centre pages. Tick it and opening one closes the last, which suits a short list where
> the whole set should stay on screen. Both Information Centre pages are now unticked; IME and JME
> stay ticked.

> **Side by side** (under Layout) puts the heading and intro in a narrow left column with the
> questions beside them. It replaces a hand-written style class that used to do the same thing on the
> JME page only — so it is now available on any FAQ.

#### A fifth section background: Pale blue

**Background** on any Section now offers **Pale blue** alongside White, Light grey, Light blue accent,
Light blue (solid), Primary and Dark. It is the palest of the blues — noticeably lighter than "Light
blue (solid)" — and is what the design reference bands the Claimants FAQ, the contact enquiry panel
and the appointment-guide highlight cards with. Its value is editable like every other band token.

#### The enquiry form — a card, and placeholders

**Pages → the page → the Form block.** Two things you can now set that used to need a developer:

| Setting | Choices | What changes |
|---|---|---|
| **Card style** | None · **Card** | Card wraps the whole block — intro heading included — in a white panel with a soft shadow, so the heading sits *inside* the box rather than above it. |

Used on **Contact**, the **homepage** enquiry band and **Join Our Expert Panel**. All three used to
achieve this with a hand-written style class; it is one setting now, so any form can have it.

**Placeholders** are the grey prompt text inside an empty field ("you@company.com", "07 XXXX XXXX").
**Forms → the form → the field → Placeholder.** Every text, email, number and long-text field has one,
and so does a dropdown, where it replaces the default "Select…" line. A placeholder is *not* a default
value — it is never submitted, so it cannot arrive in an enquiry as if the visitor typed it.

#### A button that opens a prefilled email

Portal access is by registration only, so two buttons open the visitor's mail app with the whole
enquiry already written — they only fill in the blanks and hit send. **"Email Us to Register"** on
Contact's Online Booking Portal card, and **"Register an Account"** on Make a Booking.

**You edit the message in one place: Site Settings → Booking portal registration email.**

| Field | What it is |
|---|---|
| **Send to** | Where the enquiry arrives. Currently `admin@vmls.com.au`. |
| **Subject** | The subject line the visitor's mail app is given. |
| **Body** | The message itself. Blank lines and spacing are kept exactly as you type them, so the `Full Name:` / `Company/Organisation:` prompts stay on their own lines. |

Both buttons read the same settings, so changing the wording here changes it in both places — you do
not need to find and edit each button.

> **Clearing "Send to" switches the buttons off**, on purpose: they render as plain grey text instead
> of links. An email with no recipient would open an empty compose window and look like it worked, so
> a visibly dead button is the honest outcome. Put an address back and they return.

To put this on another button: **Pages → the page → a Button block → the link → Registration enquiry
email**. It needs no URL — the address and wording come from Site Settings. The option appears only on
Button blocks and the Make a Booking chooser panels, which are the two that know how to build the
email; it is deliberately absent elsewhere rather than offered and silently doing nothing.

#### The Booking Chooser can be a single, shorter panel

The **Booking Chooser (split)** block is the full-bleed pair on *Make a Booking* — the pale-blue
"Specialist Availability" side and the dark "Client Portal" side. Two things about it are worth
knowing:

- **It accepts one half, not just two, and one half fills the whole band.** Delete a half and the
  remaining panel keeps its colour treatment, spreads across the full width, centres its copy, and
  stops sliding sideways under the pointer — the slide is how the two-panel version says "pick one",
  and with one panel there is nothing to pick. That is how the "See this month's availability"
  signpost under the hero on *Specialist Panel* and *Specialists* is built — it is the same block,
  not a bespoke band. Nothing you set does this; the block reads how many panels you left it.
- **Panel height** sets how tall the band is. **Default** is the full-height band on Make a Booking,
  which sizes itself to the browser window. **Compact** fixes it at about the height of a page hero,
  which is what you want when the chooser is a signpost sitting under a hero rather than the main
  event on the page. Default is what the block has always rendered, so switching an existing block to
  Compact is the only thing that moves it.

#### Choosing an icon, and its colour

Every icon field is now a **picker that shows the icons**, not a list of their names — open it, and
search. Two things it offers that the old dropdown could not:

- **One library, and you control it.** What the picker offers comes from **Design → Icon Library** —
  all 1,513 Phosphor icons and your own uploaded SVGs on one screen, each with a tick box. An admin
  can add any of them, or upload a new one, without a developer.
- **Your own icons** appear at the top of the picker, above the rest.
- If an icon you used is later unticked, your page keeps it and your picker still shows it, under
  *"Used here, not in the library"*.
- **A colour, per placement.** Under the chosen icon there is a **Colour** control offering the same
  brand palette as the text colours. Leave it alone and nothing changes: a built-in icon keeps taking
  the colour of the text beside it, and an uploaded one keeps its own default. Choose a colour and it
  applies to that one placement only.

The colour is stored as a brand *name*, not a fixed shade — so if the brand blue is changed in
**Site Settings → Brand colours**, every icon coloured with it changes too. And a colour that would
disappear on a dark navy band re-points automatically there, exactly as coloured text does.

> **A two-colour logo will not work as an icon.** Icons are drawn in one colour so they can take the
> colour of whatever they sit on. Use an Image block for a multi-colour mark.

#### Two-column rows that are not 50/50

**Pages → the page → the Row block → Column ratio.** Leave it unset for equal columns. The other
options — 1 : 1.5, 1.5 : 1, 1 : 2, 2 : 1 — apply to two-column rows only, and stack on mobile like any
other row. The Join Expert Panel enquiry band is 1 : 1.5, a narrow intro beside a wider form.

Beside it, **Gap** gained an **Extra wide** step (72px), which is what the design reference uses
between the columns of those bands — one notch wider than Wide.

#### An icon list can be left-aligned

**Pages → the page → the Icon List block → Heading align.** The eyebrow, heading and intro above the
list were always centred, with no way to change it. Leave it unset for centred; choose Left for a list
that sits in a column beside something else, as the Join Expert Panel contact details do.

> **An icon list whose items are links styles itself as a contact list** — brand-blue links, a larger
> icon and tighter spacing. There is no setting for it: adding links is the signal, because that is
> what distinguishes contact details from a row of feature chips.

#### A section that hides itself — and its tab — when it has nothing to show

**Pages → the page → an Archive, Featured Articles Carousel or Resources Grid block → "Hide this
section when it has nothing to show".**

These three blocks list whatever is in the CMS — articles in a stream, featured articles, resources.
When there is nothing to list they used to leave a heading over an empty band. Tick this and the
whole section stands down instead: heading, intro and all.

**The tab goes with it.** On a page with a sticky Section Nav — /in-the-loop's *Latest · News &
Updates · AAMLE Events · …* bar — the pill pointing at a hidden section is removed too, so the bar
never offers a tab that leads nowhere. There is nothing to set for that; the nav reads the section's
own tickbox.

All eight sections on **In the Loop** have it ticked. Today that leaves one tab, *QA Insights*,
because that is the only stream with published articles. Publish a News & Updates article and its
section and its tab both come back on their own — nothing needs re-ticking.

> **Untick it to see an empty section.** With the box off, the section renders as it always did —
> heading, intro and no cards — which is how you check the wording and the band colour before the
> content exists. The tab stays too, so you can click through to it.

Note *AAMLE Events* on that page lists **upcoming** events only. Every event currently in the CMS is
in the past, so that section counts as empty and is hidden. Adding a future-dated event brings it back.

#### Telling Upcoming Events from Past Events apart

**Pages → Events & Seminars → the Events Explorer block → "Separating Upcoming from Past".**

The two groups sit in one section, so by default nothing but whitespace divides them. Two controls,
which work independently — use either, both, or neither:

- **Divider line** — None (the default) · Line · Dots · Gradient. Draws a rule between the two
  groups, aligned with the text. **Divider width** appears once you pick one: Full spans the content,
  Narrow is a short centred rule.
- **Band behind the Past group** — leave it on *Same as the section* for no band, or pick any section
  colour to put the Past group on its own full-width stripe. **Pale blue** is the treatment the design
  reference uses. The colours themselves come from Design System → Section bands.

`/events` uses the **band** (Light blue accent) with no divider line — the reference's own treatment.
The divider is there if you would rather have a rule, and the two are independent, so you can use
either without touching the other.

> **A band runs to the bottom of the section**, flush into the footer, and takes its breathing room
> from its own padding rather than leaving a gap underneath. Pick a colour; the block handles it.

> **These only appear on a block set to "Upcoming & Past".** The two dedicated listing pages show one
> group each, so there is nothing to separate — the controls are hidden there rather than offered and
> quietly ignored.

## Part 8 — The rules the code must not break

*The four standing instructions, the 59 invariants and what guards each, the commands, and what
every suite covers.*
### Read this before you change anything

**The governing idea: nothing fails silently, and nothing appears to work when it doesn't.** This
site is handed to people who do not write code. A control that looks editable and isn't, a form that
says "sent" and discarded the enquiry, a link that renders as nothing — each is worse than a visible
error, because nobody finds it and nobody can report it. Every rule below exists because that
already happened here.

**Four standing instructions.**

1. **Assume your instrument is lying before you assume the code is broken.** A stale `.next`, an
   unquoted grep glob, a Playwright probe that never logged in — each has produced a confident wrong
   answer here. `docs/TRAPS.md` (in the code) is the catalogue; read the relevant section before believing a measurement.
2. **Every negative result needs a positive control.** Before believing "not found", make the same
   check find something you know is there.
3. **A guard that has never failed is not evidence.** If you add or change one, prove it goes red on
   the real defect (`zsh tests/int/prove-guards.sh`).
4. **Ask before assuming.** Where the request is ambiguous and the readings disagree, say so rather
   than picking the interpretation that is easiest to build.
### Invariants

Every rule below is here because the failure already happened in this repo. The evidence for each is
in `docs/TRAPS.md` (in the code) under the matching number — **read it before deleting or weakening a rule**, as
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
### Commands

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

#### What each suite guards — the fuller table

Six of these were never named anywhere in this file, so the invariants they cover read as unguarded
and the specs read as deletable. Counts are deliberately **not** recorded here — they live in
Part 5, each beside the command that measures it — because four documents once carried four
disagreeing numbers for the same suite.

| File | What it guards |
|---|---|
| `tests/int/adminControls.int.spec.ts` | The control guards: orphan fields, option values with no CSS rule, the class picker, hardcoded brand assets, placeholders with no upload, `cacheLife` on a tag purge, discarded `appearance`, unguarded draft queries. Proved by `zsh tests/int/prove-guards.sh`; every case must report PASS (Part 5 has the count and how to take it). |
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

`README.md` in the repository has been rewritten as this project's own readme (running it locally,
deploying, where the editor's manual lives). It is no longer the Payload template's.

### The developer environment and the deploy loop — the code-facing view

*Part 5 has the operator's side — what to type, in what order. This is the code's side: what the
schema push does, and why the sequence is the sequence.*
#### Local development

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
#### Deploy workflow

Production builds and migrates on **the production host** — a Linux server the site's owner
controls. Loop: edit code locally → commit & push → the host pulls, builds, and migrates against
the **live** database. Nothing about the code assumes a particular host; the local `.env` and
`verify_cms` database stay on the development machine and are never pushed.

After a `CollectionConfig`/`GlobalConfig` field change, the server sequence is:
`pnpm payload generate:types` → `pnpm payload migrate:create <name>` → `pnpm payload migrate` →
`pnpm build`. Multiple config changes in one push can share a single `migrate:create`.

## Part 9 — If something goes wrong

*Start here. Two more troubleshooting lists sit where you would be standing when you hit them:
**Part 2, Step 10** for standing the site up, **Part 3, Step 10** for the cutover.*

| Symptom | Where to look |
|---|---|
| The app will not start at all | Below — *The site is down* |
| The app runs but the public address does not load | Below, and **Part 3, Step 10** |
| Something broke while first standing the site up | **Part 2, Step 10** |
| Something broke during or after the domain cutover | **Part 3, Step 10** |
| A form submits but no email arrives | Below, and **Part 5** → *Email* |
| A test run goes red | `README.md` §10 in the code — some specs flake under load |
| A measurement looks wrong or contradicts the docs | `docs/TRAPS.md` in the code, by lookup |
| Content vanished or looks wrong | Below — *Content looks wrong or missing* |
| A domain move went wrong | **Appendix A, A4** |

> **Two registers live in the code rather than here**, because they are for whoever changes the
> code rather than whoever runs the site: **`docs/TRAPS.md`** (every measurement that has already
> misled someone) and **`README.md` §10 and §11** (everything knowingly imperfect, and every
> deliberate difference from the design reference). Read them before "fixing" anything that looks
> wrong in the code — several of those differences are intentional and were paid for once already.
Work top to bottom; each item ends with when to escalate.

**The site is down / the app won't start.** Read the log — it almost always names the cause:

```bash
sudo journalctl -u payload -n 40 --no-pager
```

The app **deliberately refuses to start** if a required setting is missing, printing a
`REFUSING TO START` banner naming the exact variable. This guard exists because, without it, the site
was once found serving its homepage normally while the admin and forms silently failed. Fix `.env`,
`sudo systemctl restart payload`. *Escalate to FortiTech* only if the app runs cleanly but the site is
still unreachable — that points at DNS/Cloudflare, not the app.

**The public address doesn't load but the app is healthy.** The problem is between Cloudflare and the
host — DNS, the tunnel/proxy, or a Cloudflare setting. None of it is fixed on the server. *This is
FortiTech's territory.*

**The app won't start after a change.** Almost always a missing/misnamed `.env` variable or a failed
migration (the log names which). A failed migration rolls back on its own — the database is unharmed;
retry once fixed. See Part 9.

**Content looks wrong or missing.** First confirm it isn't just filtered or an unpublished draft (the
public site hides drafts). If content genuinely vanished, restore the most recent database backup —
take a backup of the current (bad) state first.

**The database won't connect.** Check PostgreSQL is running and `DATABASE_URL` is correct; a restart of
the database then the app clears most transient cases. *Escalate if* the database itself is corrupt or
won't start — restore from backup, and if that fails this needs someone comfortable with PostgreSQL.

**Contact-form emails don't arrive.** Almost always SMTP AUTH not enabled on the M365 mailbox, or a
per-form recipient wrong (Part 5), or `ALLOW_MISSING_SMTP` still set. The log shows the SMTP error.

**A test run goes red.** Not automatically a regression — some browser tests flake under a loaded dev
server — see `README.md` §10 (in the code). Re-run the failing spec in isolation before treating it as a
defect.

## Appendix A — Domain transfers

*A different job from Part 3, and the difference matters.* Part 3 **repoints** `vmls.com.au` — the
domain stays registered where it is and its DNS stays in the same Cloudflare account, and only the
website record changes. This appendix **moves** a domain: either its DNS zone to a different
Cloudflare account, or its registration to a different registrar.

**You probably do not need this appendix to go live.** It is here because the two jobs are confused
constantly, and because VERIFY may later want the domain under its own accounts rather than
FortiTech's.

> **Note the worked example is a different domain.** This guide was written against
> **`vmlsapps.com.au`** — the company's separate internal-tools domain, registered at GoDaddy with
> DNS at Cloudflare. `vmls.com.au`, the public website this handover is about, is in **FortiTech's**
> Cloudflare account. Do not assume the registrar or account details here apply to `vmls.com.au`;
> confirm them first.
This walks you through the two things people mean when they say "transfer a domain," one step at a
time, with an explanation of what each step does and why. It assumes you can follow instructions and
use a terminal for the odd check, but not that you already know how DNS works.

The two procedures are genuinely different jobs, and confusing them is the single most common way
people break a live website. Read A1 first — it tells you which one you actually need. Most of the
time the answer is only one of them.

**The worked example throughout** is VMLS's own setup, so the steps are concrete rather than abstract:
the domain `vmlsapps.com.au` is **registered at GoDaddy** and its **DNS is run by Cloudflare**. Where a
value is specific to us it's called out; where you'd substitute your own, it's written as a
`PLACEHOLDER`.

Set aside an hour, and more importantly pick your timing deliberately — one of these two procedures
causes a short outage and the other doesn't, and knowing which is half the battle.

Throughout: lines in code blocks are commands to type into a terminal, one at a time. Text after a `#`
is a comment, not something to type. A "registrar" is the company you *bought* the
domain from (GoDaddy, Namecheap, Crazy Domains). A "DNS provider" is whatever actually *answers*
questions about where the domain points (for us, Cloudflare). They are often, but not always, the same
company — and that's the whole source of the confusion.

### A1 — Which transfer do you actually need?

A domain has two separate things attached to it, owned in two separate places:

1. **The registration** — the legal record that says who holds the domain. This lives at the
   **registrar** (GoDaddy). Moving it is a *registrar transfer* and is what A3 covers. People
   often describe this as moving the domain "from one website to another," meaning from GoDaddy's
   website to another provider's website.

2. **The DNS zone** — the live settings that say "the website is at this IP, mail goes to that
   server, here's the proxy and security config." For us this lives in a **Cloudflare account**.
   Moving it between Cloudflare accounts is A2.

These are independent. You can move one without touching the other, and usually you should. Use this
to decide:

| What you're actually trying to do | Which part |
|---|---|
| Hand the domain's DNS/Cloudflare config to a different Cloudflare login (e.g. personal → company) | **A2** |
| Move the domain's billing/ownership to a different registrar company | **A3** |
| Both (rare — e.g. a full handover to a new provider) | A2 **then** A3, in that order |

> **The trap that catches everyone.** A registrar transfer (A3) does **not** move your DNS, and
> moving your DNS (A2) does **not** move your registration. If someone asks you to "transfer the
> domain" and you do the wrong one, you either achieve nothing they wanted, or you take the site
> offline. Ask them plainly: *are we changing who we pay for the domain, or where the DNS lives?*

### A2 — Move a domain's DNS from one Cloudflare account to another

**Use this when:** the domain should keep living at the same registrar, but its Cloudflare zone needs
to belong to a different Cloudflare login — the classic case being a personal account handing over to
a company account.

**Know before you begin:** on Cloudflare's Free and Pro plans there is **no button to move a zone
between accounts**. The only method is to delete it from the old account and add it to the new one.
Because Cloudflare won't hold the same domain in two accounts at once, **there is an unavoidable
outage** between the delete and the moment the new account is serving. It's usually short, but it's
real — so this is scheduled work, not something you do casually mid-morning.

#### 2.1 Measure the outage before you commit

The length of the outage is set by how long the internet caches the domain's current nameservers.
Check it from any terminal:

```bash
dig +trace PLACEHOLDER_DOMAIN NS      # e.g. dig +trace vmlsapps.com.au NS
```

Read the number (the TTL) next to the `NS` records handed out by the registry servers. If it's around
`3600`, expect most of the internet to recover within an hour or two. If it's `86400`, the tail can
stretch toward a day. Either way you now know what you're signing up for. (When we did ours it was
3600 and it recovered in about five minutes — but plan for the number you actually see.)

#### 2.2 Capture everything that has no export button

This is the step people skip and regret. The DNS *records* can be exported, but the **zone settings
cannot** — there is no download for them, so if you don't write them down, you rebuild them from
memory. In the old account, open the zone and record:

- **DNS → Records** — click **Export** to download the records file (keep it as a reference; note the
  warning in 2.5 about not importing it blindly).
- **SSL/TLS → Overview** — the encryption mode (ours is *Full (Strict)*).
- **SSL/TLS → Origin Server → Authenticated Origin Pulls** — is it on? (Ours: **Global, on.** This one
  is dangerous to forget — see the warning in 2.6.)
- **SSL/TLS → Edge Certificates** — Always Use HTTPS, Minimum TLS version, and whether HSTS is set
  here or at the server.
- **Security → Security rules** — every custom rule and every rate-limiting rule. **Screenshot each
  one with its expression showing**, because these don't export.
- **Rules** — any redirect, transform, or page rules.
- **Caching** and **Network** — anything changed from the default.

> **Write down which tab each security rule lives on.** "Custom rules" and "Rate limiting rules" are
> different lists on the same page. A rate limit accidentally built as a custom rule blocks the page
> *permanently* instead of only under load — a genuinely confusing outage. (We hit exactly this.)

#### 2.3 Have the new account ready and access confirmed

- The new Cloudflare account exists and you can log in.
- It's owned by an address that will **outlive whoever set it up** — a shared mailbox like
  `it@COMPANY`, not a personal work address that gets disabled when someone leaves.
- You have out-of-band access to the origin server (SSH by IP), in case you need to check or restart
  anything while DNS is down.

#### 2.4 The move itself — don't pause between these two

In the **old** account: open the zone → **Overview** → scroll to the bottom → **Remove Site from
Cloudflare** → confirm. *The outage starts here.*

Immediately, in the **new** account: **Add a domain** → type the domain → choose the plan (Free is
fine) → Continue. The automatic DNS scan will find little or nothing because the old nameservers no
longer answer — that's expected. Then **write down the new nameserver pair it gives you.** It will be
a *different* pair from the old one (ours went from `dax`/`riya` to `diana`/`kenneth`); you cannot
choose or reuse the old pair.

#### 2.5 Rebuild the DNS records

For a small zone, **type the records in by hand** rather than importing the export file. Cloudflare
rejects certain leftover records on import (notably old `NS` records at the domain root, which throw
"error 9221"), so on a handful of records the import causes more trouble than it saves. Recreate:

- Each real record from your export — the website `A` record, any `www`, mail (`MX`), and text
  (`TXT`) records like `SPF`/`DMARC`.
- Set the **proxy status** (orange cloud vs grey) to match the old zone exactly. For us the website
  `A` record is **proxied (orange)**.
- **Don't** recreate provider "discovery" records (e.g. GoDaddy's `_domainconnect`) or old root `NS`
  records — they're leftovers.

#### 2.6 Re-apply the zone settings, most important first

From your A2.2 notes:

1. **SSL/TLS → Overview →** set the encryption mode (ours: *Full (Strict)*).
2. **SSL/TLS → Origin Server → Authenticated Origin Pulls →** set it to match the old zone.

> **This is the highest-risk setting in the whole procedure.** If the origin server is configured to
> demand Cloudflare's client certificate (ours is), and you forget to turn Authenticated Origin Pulls
> back on in the new account, **every single request fails with a 400 error** — a total outage that
> looks nothing like a DNS or certificate problem, so it's easy to chase the wrong thing for an hour.
> If the site returns 400 on everything after the move, this is almost always why.

3. Edge certificate settings (Always Use HTTPS, minimum TLS, HSTS if it was set here).
4. Recreate the security rules **on the correct tabs**.
5. Caching and network toggles.

#### 2.7 Point the registrar at the new nameservers

Log in to the **registrar** (GoDaddy for us) → the domain's **Nameservers** setting → replace the old
pair with the **new pair from step 2.4** → save. Then confirm it took:

```bash
whois PLACEHOLDER_DOMAIN | grep -i "name server"
```

You want the new pair listed and no trace of the old one. Do this as soon as the records exist so the
propagation clock starts running while you finish the rest.

#### 2.8 Verify — from outside, not just your own screen

Wait for the zone to show **Active** in the new account (it activates once it sees the registrar
pointing at its nameservers — usually minutes; ignore any "may take a few hours" boilerplate). Then:

```bash
dig @1.1.1.1 PLACEHOLDER_DOMAIN A     # should return the proxy's addresses, not the raw server IP
dig @8.8.8.8 PLACEHOLDER_DOMAIN A     # a second independent resolver
curl -sI https://PLACEHOLDER_DOMAIN | grep -iE "HTTP/|cf-ray"   # want a 2xx and a cf-ray header
```

A `2xx` status with a `cf-ray` header means the new account is serving the site. Then open it in a
private/incognito browser window and **actually log in / click through** — a homepage loading doesn't
prove the login or any background services work.

> **Don't judge success from your own laptop alone.** Your machine may have the old answer cached.
> The two `dig @` checks against public resolvers are the honest test.

#### 2.9 Tidy up afterwards

- If the origin uses a **Cloudflare certificate** for the server itself (an "Origin CA" certificate),
  consider re-issuing it from the new account so it's visible and manageable there. **Back up the old
  certificate files first**, and only replace them if the new ones test correctly — the certificate's
  private key is shown **only once** when you create it, so save it immediately.
- Revoke any **API tokens** in the old account that were scoped to this domain (backups, scripts) and
  re-create them in the new account.
- If a monitor (e.g. UptimeRobot) watches the site, expect it to alert during the outage — either
  trim its contacts to just you for the window, or use its "back up" alert as your recovery signal.

### A3 — Transfer a domain's registration from one provider to another

**Use this when:** you want the domain itself to be *held and billed* by a different company — moving
`vmlsapps.com.au` away from GoDaddy to another registrar, for example. This is what "transfer the
domain to another website" usually means.

**The good news:** done correctly, this causes **no outage**. A registration transfer does not move
or change your DNS — the site and email keep working the entire time — *provided you don't let the
nameservers get reset* (see the warning at the end). The site stays live because the DNS keeps being
answered by wherever it's answered now (Cloudflare, in our case), regardless of who bills for the
domain.

**Timing for our domains:** `.com.au` transfers are usually quick — commonly a couple of hours, up to
about two days — rather than the up-to-five-days that `.com` can take.

#### 3.1 Check it's even allowed to move yet

A domain generally **cannot** be transferred if:

- it was registered, or last transferred, **within the last 60 days**;
- the registrant contact details were changed in the **last 60 days**;
- it's **locked** at the current registrar (this you can fix — see 3.3);
- it's expired or in a redemption period.

If any apply, sort them out or wait before starting.

#### 3.2 Make sure the registrant email is current and you can read it

The transfer approval is sent to the **registrant contact email recorded in the registry** — not your
login email, and not necessarily an address anyone still checks. For `.au` domains, the auth code and
approvals go to this registry address. Check it in the registrar's contact settings, and if it's
wrong or dead, **update it first** — but note that changing registrant details can itself trigger a
60-day transfer lock (see 3.1), so do this well ahead of the transfer, not the day of.

#### 3.3 Unlock the domain at the current registrar

Registrars apply a "transfer lock" (also called "registrar lock" or "domain lock") that blocks
transfers as an anti-hijacking measure. In GoDaddy: the domain's settings → find the lock toggle →
turn it **off**. The domain must stay unlocked until the transfer completes.

#### 3.4 Get the authorisation code (EPP / auth code)

This is a one-time password that proves you're allowed to move the domain. Request it from the current
registrar — usually a button in the domain settings ("Get authorisation code" / "Transfer" / "EPP
code"), or by contacting their support. For `.au` specifically, if you can't get it from the
registrar you can also recover it via auDA's `.au` password recovery tool, which emails it to the
registry contact address (which is why 3.2 matters).

Copy the code exactly — they're case-sensitive and often contain symbols. **Treat it like a password**
and don't paste it anywhere public.

#### 3.5 Handle DNSSEC before you move (skip only if it's off)

DNSSEC is an extra layer that cryptographically signs your DNS. If it's enabled, a registrar transfer
can break it and make the domain **fail to resolve entirely** for anyone using a strict resolver — a
hard outage that looks baffling. The safe sequence is:

- Check whether DNSSEC is on (in the DNS provider — for us, Cloudflare → DNS → Settings). **Ours is
  off**, so there's nothing to do here.
- If it *is* on: turn it off, remove the corresponding "DS record" at the registrar, wait a day for
  that to clear, *then* do the transfer, and re-enable it afterwards at the new registrar.

#### 3.6 Start the transfer at the NEW registrar

Everything so far was at the old registrar. Now go to the **new** (gaining) registrar's website and
start a **transfer in**:

1. Enter the domain name.
2. Pay the transfer fee. For most domains this **includes an extra year's renewal** — that's normal,
   you don't lose the time you've already paid for, it's added on.
3. Paste the **authorisation code** from 3.4.

#### 3.7 Approve the transfer

The registry (or the old registrar) sends a **Form of Authorisation / approval email** to the
registrant address from 3.2. Click the approval link **promptly** — these time out, and an expired
request means starting over. Some registrars also let you *accept* or *speed up* an outgoing transfer
from the old account's dashboard, which can shave off the waiting period.

#### 3.8 Confirm it completed

Watch for the "Registrar of record" to flip to the new provider:

```bash
whois PLACEHOLDER_DOMAIN | grep -iE "registrar|name server"
```

When the registrar line shows the new company, you're done. Check the nameserver line still shows your
DNS provider (Cloudflare for us) — see the warning below.

> **The one thing that turns a no-outage transfer into an outage.** A registration transfer shouldn't
> touch DNS — **but some registrars reset the nameservers to their own defaults when a domain lands.**
> If that happens, the domain stops pointing at your DNS provider and the site/email drop. Immediately
> after the transfer completes, check the nameservers (command above) and, if they've changed, set
> them back to your DNS provider's pair. If your DNS is on Cloudflare, leaving the nameservers pointed
> at Cloudflare is all that's needed — just don't let the new registrar "helpfully" change them.

> **After a successful transfer, the domain is locked against transferring again for 60 days.** This
> is normal ICANN policy and not something to worry about — just don't plan two moves close together.

### A4 — If something goes wrong

**After a Cloudflare move, every page returns a 400 error.** Almost always Authenticated Origin Pulls
wasn't re-enabled in the new account (A2.6). Turn it on. If the server enforces the client
certificate and Cloudflare isn't presenting it, everything 400s.

**After a Cloudflare move, the browser says the site can't be reached, or a certificate warning.**
Either the zone hasn't finished activating / propagating (wait, and check with the two `dig @` commands
in 2.8), or the new zone's edge certificate hasn't been issued yet (it can't issue until the zone is
active — this is usually minutes). Give it time before assuming it's broken.

**The login page shows a generic "connection error" but the homepage loads.** Check the DNS provider's
security events (Cloudflare → Security → Analytics) for blocked requests. A too-aggressive rate-limit
rule, or a rate limit accidentally built as a custom rule, will block the login while leaving the rest
of the site up. The event will name the rule that fired.

**A registrar transfer seems stuck.** The commonest causes are the approval email not being clicked
(check the registry contact inbox and spam), the domain still being locked, or the auth code being
wrong. If the old registrar simply isn't releasing it, the registry allows them a few days — but if
they miss reasonable deadlines, both auDA (for `.au`) and ICANN (for `.com` etc.) take complaints.

**After a registrar transfer the site went down.** Check the nameservers (`whois … | grep -i "name
server"`). If the new registrar reset them to its own defaults, point them back at your DNS provider.

**When to stop and get help.** If a domain is business-critical and you're unsure, the safe move is to
do the reversible half first: for a Cloudflare move, get the new zone fully built and verified against
its temporary nameservers before flipping the registrar; for a registration transfer, confirm DNS is
solid and independent of the registrar before you start, so the transfer can't take the site with it.

### A5 — Reference: the distinction in one table

| | **Registration** (A3) | **DNS zone** (A2) |
|---|---|---|
| Lives at | The registrar (GoDaddy) | The DNS provider (Cloudflare) |
| Answers the question | "Who owns/pays for this domain?" | "Where does this domain point?" |
| Moving it is called | A registrar transfer / domain transfer | A zone move between Cloudflare accounts |
| Needs | Auth code, unlock, approval email | Delete + re-add, new nameservers, rebuild settings |
| Causes an outage? | **No** (if nameservers left alone) | **Yes** (short, unavoidable on Free/Pro) |
| Typical time | Hours to a couple of days (`.au`) | Minutes to a couple of hours |

### A6 — Reference: command cheat sheet

```bash
# See who runs DNS and how long it's cached (run before a Cloudflare move)
dig +trace PLACEHOLDER_DOMAIN NS

# Confirm the current registrar and nameservers
whois PLACEHOLDER_DOMAIN | grep -iE "registrar|name server"

# After a change, check what the world actually sees (two independent resolvers)
dig @1.1.1.1 PLACEHOLDER_DOMAIN A
dig @8.8.8.8 PLACEHOLDER_DOMAIN A

# Check the site responds through the proxy (want a 2xx and a cf-ray header)
curl -sI https://PLACEHOLDER_DOMAIN | grep -iE "HTTP/|cf-ray"
```

### A7 — Reference: glossary of domain terms

| Term | Plain meaning |
|---|---|
| **Registrar** | The company you buy/renew the domain from (GoDaddy). |
| **DNS provider** | Whatever answers "where does this domain point" (Cloudflare, for us). |
| **Nameservers** | The specific servers that hold the live DNS answers; the registrar points the domain at these. |
| **DNS zone** | The full set of a domain's DNS records and settings, held by the DNS provider. |
| **Auth / EPP code** | A one-time password from the current registrar that authorises a registration transfer. |
| **Registrar lock** | An anti-hijacking setting that blocks transfers until you turn it off. |
| **DNSSEC / DS record** | Cryptographic signing of DNS; must be handled carefully around transfers or the domain can fail to resolve. |
| **Authenticated Origin Pulls** | A Cloudflare setting that makes it prove to your server it's really Cloudflare; if the server requires it and it's off, everything 400s. |
| **TTL** | How long the internet is allowed to cache an answer before asking again — sets how long a change takes to spread. |

## Appendix B — Glossary

*Domain and DNS terms are at **A7**. Everything else is here.*

### Glossary — the stack

**Payload** — the CMS built into the site. Provides `/admin`, stores content in PostgreSQL. Version 3.
It is not a separate server; it runs inside the Next.js process, so the public site, the admin and
the APIs are one deployable.

**Next.js** — the framework that renders the public site. Version 16. Has a **build** step, so a code
change appears only after `pnpm build` — unlike WordPress, where editing a PHP file takes effect on
the next request.

**PostgreSQL** — the database. Holds every page, specialist, event, article and setting.

**pnpm** — the tool that installs and manages the code's dependencies. Like `npm`, faster, and what
this project is set up for. Use it rather than `npm`.

**Node.js** — the runtime the whole thing executes on. Version 22 LTS is what to install.

**React Server Components / App Router** — how Next.js 16 organises pages. Relevant only if you are
changing code.

### Running it

**`.env`** — the file on the server holding configuration and secrets. Never in the repository, and
recreated per host. Part 2, Step 4.3 builds it.

**`NEXT_PUBLIC_SERVER_URL`** — the site's public address, **compiled into the build**. Changing it
needs a rebuild, not just a restart. The one setting where that distinction matters, and the
single commonest cause of "I changed it and nothing happened".

**`PAYLOAD_SECRET`** — signs logins and encrypts stored secrets. **Must never change once the site
holds data**; changing it logs everyone out and scrambles what it encrypted.

**`ALLOW_MISSING_SMTP`** — the flag that lets the app start before email is configured. Waives
`SMTP_HOST` and nothing else. **Must never be set on a site taking real enquiries** — while it is,
enquiries are stored and nobody is notified.

**`LOCAL_PROD_REPRO`** — the development-machine equivalent, which waives *all three* required
variables. Never set it on a server.

**Migration** — a versioned change to the database structure, in `src/migrations/`. Applied with
`pnpm payload migrate`; generated from code changes with `pnpm payload migrate:create`.

**The seed** — code that populates a fresh database with the site's starting content. Run once at
setup (Part 2, Step 8). Idempotent and non-destructive, but **not** a restore mechanism.

**Process manager** — what keeps the app running and restarts it on crash or reboot. This document
assumes a **systemd** service named `payload`.

**ISR (Incremental Static Regeneration)** — how the frontend caches pages. An edit appears when
revalidation succeeds or when the cache window lapses, which is why a staleness bug cannot be
reproduced with `pnpm dev`.

### Content and the admin

**Collection** — a kind of record there are many of: Pages, Articles, Events, Specialists, Team.

**Global** — a one-of-a-kind settings screen: Header, Footer, Site Settings, Design System.

**Taxonomy** — the small classifying lists (Specialties, Claim Types, Streams, Departments…) that
records are tagged with. They are collections rather than fixed dropdowns so staff can extend them
without a developer.

**Block** — one section of a page in the page builder. An editor stacks blocks to compose a page.

**Draft / Published** — only Pages, Articles, Events, Specialists and Team Members have this toggle.
Everything else goes live the moment you press Save.

**Rich text** — a field you type words into, with a formatting toolbar. Almost every text box in the
admin is one; a box *without* a toolbar is deliberate.

### Deploying and going live

**Cutover** — pointing the live domain at the new server (Part 3). Distinct from a *transfer*
(Appendix A), which moves registration or DNS ownership.

**Cloudflare Tunnel** — a way to expose the app over HTTPS with no open inbound ports; the connector
makes an outbound connection to Cloudflare. The recommended exposure method here.

**Reverse proxy** — the alternative: nginx or Caddy in front of the app, handling TLS.

**Cloudflare Access** — an identity check placed in front of a path (here, `/admin`), requiring an
approved login before the page is even reachable.

**HSTS** — a setting that tells browsers "always use HTTPS for this site". Its consequence at
cutover: if the certificate is not ready, the site looks completely dead rather than merely
insecure.

## Appendix C — Command reference

*Every command in one place. Each block says where it is explained.*

### On the server, day to day

```bash
cd /opt/verify-cms                                    # where the app lives

sudo systemctl status payload --no-pager | head -5    # is it running?
sudo systemctl restart payload                        # restart (after any .env change)
sudo journalctl -u payload -n 50 --no-pager           # recent logs and errors
sudo journalctl -u payload -f                         # live tail (Ctrl-C to stop)
```

*Explained in Part 2, Step 9.*

### Deploying a code change

```bash
cd /opt/verify-cms
git pull                                    # fetch the change
pnpm install                                # pick up new dependencies (harmless if none)
pnpm payload generate:types                 # refresh internal definitions

# ONLY if the change altered the database structure — BOTH lines, in this order:
pnpm payload migrate:create some_short_name # writes the migration
pnpm payload migrate                        # applies it

pnpm payload generate:importmap
pnpm build                                  # recompile (old build keeps serving until restart)
sudo systemctl restart payload
```

*Explained in Part 2, Step 9 and Part 5.* **`migrate` without `migrate:create` applies nothing new.**

### Backing up and restoring

```bash
cd /opt/verify-cms
set -a; . ./.env; set +a                              # load DATABASE_URL from .env
pg_dump "$DATABASE_URL" > ~/verify-backup-$(date +%F).sql
```

```bash
sudo systemctl stop payload
sudo -u postgres dropdb verify_cms
sudo -u postgres createdb verify_cms --owner=verify --encoding=UTF8 \
  --lc-collate=C.UTF-8 --lc-ctype=C.UTF-8 --template=template0
cd /opt/verify-cms && set -a; . ./.env; set +a
psql "$DATABASE_URL" < ~/verify-backup-YYYY-MM-DD.sql
sudo systemctl start payload
```

*Explained in Part 2, Step 9.* **Also back up `/opt/verify-cms/public/media`** — uploaded images live
there and are not in the repository.

### Running the seed

```bash
echo 'ENABLE_SEED_ENDPOINT=true' >> .env && sudo systemctl restart payload

curl -s -c cookies.txt -X POST https://YOUR_HOST/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ADMIN_EMAIL","password":"ADMIN_PASSWORD"}'
curl -X POST https://YOUR_HOST/next/seed-verify -b cookies.txt      # expect {"success":true}

rm cookies.txt && sed -i '/ENABLE_SEED_ENDPOINT=true/d' .env && sudo systemctl restart payload
```

*Explained in Part 2, Step 8.* **Never leave `ENABLE_SEED_ENDPOINT` set on a live site.**

### Checking DNS and the live site

```bash
dig vmls.com.au A +short                 # before the cutover: the old target, for rollback
dig www.vmls.com.au +short

dig @1.1.1.1 vmls.com.au A +short        # after: what independent resolvers see
dig @8.8.8.8 www.vmls.com.au +short
curl -sI https://vmls.com.au | grep -iE "HTTP/|cf-ray"   # want a 2xx and a cf-ray header
```

*Explained in Part 3, Steps 6 and 7.* Domain-move equivalents are at **A6**.

### Local development commands

```bash
pnpm install
cp .env.example .env      # then fill in DATABASE_URL and PAYLOAD_SECRET
pnpm dev                  # http://localhost:3000, admin at /admin

./start.sh / ./stop.sh    # the same server backgrounded -> .dev.log / .dev.pid
pnpm dev:prod             # build + serve in production mode — needs LOCAL_PROD_REPRO=1
pnpm build / pnpm start   # production build and serve
```

*Explained in Part 5.*

### Testing commands

```bash
pnpm test                       # lint -> integration -> e2e, stopping at the first failure
pnpm test:int                   # vitest only
pnpm test:e2e                   # playwright only
pnpm exec tsc --noEmit          # typecheck (there is no `typecheck` script)
pnpm lint                       # eslint (pnpm lint:fix to autofix)
zsh tests/int/prove-guards.sh   # the guards on the guards; every case must report PASS

pnpm test:int tests/int/api.int.spec.ts -t "name"        # one integration test
pnpm test:e2e tests/e2e/frontend.e2e.spec.ts -g "name"   # one browser test
```

*Explained in Part 5.*

### Code generation, after a field change

```bash
pnpm generate:types        # -> src/payload-types.ts   (after ANY collection/global/block field change)
pnpm generate:importmap    # -> src/app/(payload)/admin/importMap.js (after adding an admin component)
```

*Explained in Part 5 and Part 8.*

### Tools `pnpm test` does not run — the commands

```bash
node tests/visual/computedSnapshot.mjs capture|compare <name>   # computed-style gate
node tests/visual/referenceCssDiff.mjs <family> [--verbose]     # design-reference declaration diff
node tests/visual/findFalseHover.mjs [--verbose]                # hover effects nothing can click
node tests/visual/findDeadCss.mjs                               # unreachable selectors
node tests/visual/tokenise.mjs <4a|4b|4c|4d> [--dry]            # one-shot CSS codemods
node tests/visual/tokeniseShape.mjs <radius|gradient> [--dry]

pnpm payload run scripts/inventory.ts    # -> photo-inventory.csv + content-inventory.csv

(cd .design-reference && python3 -m http.server 4100)   # serve the design target over HTTP
```

*Explained in Part 5 and Part 4B.* **Their output is candidates, not verdicts.**

## Appendix D — The documentation inside the code

This document is a **snapshot**. The code ships with six documentation files that are the **living**
copies — they travel with the code and are updated in the same pass as any change to it. If this file
and one of them disagree, **the file inside the code is right**.

Here is what each one is, and which part of this document it became.

| File in the code | Became | What it holds |
|---|---|---|
| `README.md` | **Part 5** (and its §10/§11 registers are NOT reproduced here) | Running a box, the environment file, email, local development, deploying, testing, images, and every known-imperfect thing with its measured cost |
| `CLAUDE.md` | **Part 8**, **Part 4B** | The invariants, what guards each, the block system, the icon architecture, the CSS tooling |
| `docs/ARCHITECTURE.md` | **Part 4A** | The map — which subsystems exist, what each owns, how a request becomes a page |
| `docs/TRAPS.md` | `docs/TRAPS.md` (in the code) | Why each rule exists, and every measurement that has already misled someone |
| `docs/ADMIN-GUIDE.md` | **Part 6** | What every item in the admin sidebar is, and what feeds off it |
| `src/Styles/HOOKS.md` | **Part 7** | Every editable appearance control and where it lives |

**Two of those files cannot be moved or restructured**, because code reads them:
`tests/int/adminControls.int.spec.ts` reads `src/Styles/HOOKS.md` **by path** and parses its §6 by
name, and `tests/visual/findDeadCss.mjs` builds its dead-CSS allowlist from the same section. Moving
or renaming that file breaks a test.

### The rule that governs all six, and why it exists

**A change lands in every document it touches, in the same pass** — or the set starts lying, and a
reader cannot tell which one is stale.

That rule is the whole reason the set is small. It was once **ten documents and 9,554 lines**, and it
collapsed because the rule could not be held at that size: on 2026-08-24, one day after a full
"update every document" pass, three documents gave three different counts for the same shell script,
and a status file still described a deployment that had already happened. Three files were merged
into `README.md`, three were deleted as history (`git log` holds all six), and the trap log moved out
of `CLAUDE.md` into its own file. **Read that before adding a seventh.**

`docs/ARCHITECTURE.md` was added last, on the condition that it carries **no counts, no invariant
text and no schema figures** — only structure. That restriction is the only reason a sixth file is
safe.

`docs/ADMIN-GUIDE.md` and `src/Styles/HOOKS.md` share a reader and must not share content:
HOOKS owns *"how do I change how this looks"*, ADMIN-GUIDE owns *"what is this thing and what feeds
off it"*. Where they touch, they cross-link rather than restate.

### What that means for this file

This document deliberately breaks that rule — it is a seventh thing, and it duplicates all six. That
is acceptable only because it is **frozen and dated**, and says so at the top. It is a handover
artifact, not a maintained record.

**If you keep maintaining this project, maintain the six files inside the code.** Let this one age
into a historical record of what was handed over on 26 August 2026, and do not try to keep it in
step — that is precisely the ten-document failure that this project already had once.

## A closing note on this handover
Once this handover is complete and the development environment is offline, the author no longer has the
server, the repository, the domain, or the accounts used to build this. **This document, and the six records inside the code, are the complete handover.** The setup in Parts 2 and 3 and any later changes should be
carried out by VERIFY's own people or contractors using these documents.

The system is complete, working, and documented. What remains is to give it a home under VERIFY's
control: a server, the domain via FortiTech, Cloudflare, and email. Everything needed to do that, and
to run it afterward, is in this file and the six records inside the code.
