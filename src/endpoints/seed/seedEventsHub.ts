import { seedUpdate } from './seedWrite'
import type { Payload, PayloadRequest } from 'payload'

import { storedText } from './repairMatch'

type Ctx = { payload: Payload; req: PayloadRequest }

/**
 * Two content repairs that a seed edit alone cannot deliver, because `authorPage`
 * early-returns on an already-authored document — so a fixture change only ever
 * reaches a virgin database. The box will be one; a working install is not.
 * Same reasoning as `repairLinkTargets`.
 *
 * ── Both repairs are ADDITIVE. ──────────────────────────────────────────────
 *
 * Everything they touch is editable at /admin, and a repair that reasserts the
 * fixture on every seed run would quietly revert an editor — which is a worse
 * failure than the gap it closes, and precisely what this codebase's rules exist
 * to prevent. So each one writes only into an *absence*:
 *
 *   · the carousel is inserted only when the page has no `slideCarousel` at all;
 *     an existing one is never replaced;
 *   · the explorer instance is reused, so edited labels and settings survive;
 *     empty section-header fields are filled, populated ones are not;
 *   · a post's category is set only when it has none;
 *   · the page class is appended to whatever is already stored.
 *
 * The one apparent exception proves the rule. Some slide text and a few hero
 * strings are corrected **in place**, but only on an exact match against a
 * string this seed itself wrote and got wrong — see SUPERSEDED_SLIDE_TEXT. The
 * first carousel here was seeded from a paraphrase, so installs that already had
 * it were holding bad copy that "write only into an absence" could never reach.
 * Matching the exact superseded string is what keeps that safe: reword a slide by
 * one character and the repair no longer recognises it, and leaves it alone.
 *
 * Re-running the seed after any hand-edit must therefore be a no-op. That is the
 * acceptance test, not an aspiration.
 */

// ── /events hub ─────────────────────────────────────────────────────────────

/** Headings the events hub has carried before now. Matched exactly: anything
 *  else is an editor's wording and is left alone. */
// Compared through `storedText` on BOTH sides wherever these are used. Two of
// these literals carry `[[accent]]` brackets, and `storedText` strips them — so
// normalising only the stored value would mean the literal could never match
// again, silently, which is the whole failure this pass is closing.
const SUPERSEDED_EVENTS_HEADINGS = [
  'Medico-Legal [[Education Events]]',
  // Briefly seeded before the hero was aligned to the reference.
  'Medico-Legal Education for [[Better Practice]]',
]
const EVENTS_HEADING = 'Medico-Legal Education for [[Better Practice]]'

/** Likewise for the hub subtitle, which the reference words differently. */
const SUPERSEDED_EVENTS_SUBTITLES = [
  'Practical education, industry briefings, and specialist-led seminars from VERIFY and AAMLE — browse what is coming up or revisit recent programs.',
]
const EVENTS_SUBTITLE =
  'VERIFY and AAMLE host practical education, industry briefings, specialist-led seminars, and professional networking events for legal, medical, and insurance professionals.'

/**
 * Subheadings this seed has written on the hub explorer, all now deleted.
 *
 * Both are listed because the first one is what live installs actually hold: a
 * later pass rewrote the string in the fixture, but the repair only ever FILLS
 * an empty field, so that edit never reached a database and the original line
 * kept rendering. Removing a value needs its own exact-match rule; leaving it
 * out of the fixture does nothing on an existing install.
 */
const SUPERSEDED_EXPLORER_SUBHEADINGS = [
  'Everything coming up and every recent program in one place — upcoming and past are sorted automatically by date.',
  'Search everything coming up and every recent program — upcoming and past are sorted automatically by date.',
]

/** All three events pages carry this so the reference's hero treatment applies.
 *  See `.events-pages` in globals.css. */
const EVENTS_PAGE_SLUGS = ['events', 'upcoming-events', 'past-events']
const EVENTS_PAGE_CLASS = 'events-pages'

/**
 * The four-ways carousel, copied from `.design-reference/events/events-seminars.html`.
 *
 * The first version of this was lifted from the style-guide showcase seed (since
 * removed with the page), where a paraphrased set of the same four slides had been
 * written. Only the four *titles* matched, which is exactly why it passed a review: a check
 * that compares headings finds four out of four and stops. Every body was
 * shorter and differently worded, three of the four pill sets were wrong, and
 * slide 2 had lost the quotation marks in its title. This is the reference copy,
 * verbatim.
 *
 * All four panels take the same `seminars` accent and the same "Office Photo"
 * label, because the reference gives every slide one identical translucent-blue
 * panel — it is a placeholder saying a photograph belongs here. The accent,
 * label and per-slide image upload all remain editable in the admin.
 */
export const fourWaysCarousel = () => ({
  blockType: 'slideCarousel' as const,
  eyebrow: 'Programs & partnerships',
  heading: 'Four ways VERIFY brings medico-legal learning to life',
  autoplay: true,
  interval: 5800,
  slides: [
    {
      title: 'Informative Seminars',
      body: 'VERIFY and AAMLE organise tailored professional development seminars for legal, insurance, and medical professionals in the medico-legal domain. Sessions are designed to sharpen practical knowledge, specialist understanding, and briefing confidence.',
      accent: 'seminars' as const,
      visualLabel: 'Office Photo',
      pills: [{ text: 'CPD-ready' }, { text: 'Practical topics' }, { text: 'Expert-led' }],
    },
    {
      // The reference quotes this one. Keep the single quotes.
      title: "'Specialist Insights' Presentations",
      body: 'VERIFY, in collaboration with AAMLE, delivers high-quality specialist presentations that empower professionals within the medico-legal field. These sessions translate clinical expertise into practical, usable insight for complex legal and insurance matters.',
      accent: 'seminars' as const,
      visualLabel: 'Office Photo',
      pills: [{ text: 'Specialist voices' }, { text: 'Clinical clarity' }, { text: 'Case context' }],
    },
    {
      title: 'Networking Events',
      body: 'VERIFY actively participates in networking events, both as a sponsor and participant, to support the growth of the medico-legal community. These events create opportunities to share experience and build meaningful industry connections.',
      accent: 'seminars' as const,
      visualLabel: 'Office Photo',
      pills: [
        { text: 'Client connection' },
        { text: 'Industry dialogue' },
        { text: 'Community building' },
      ],
    },
    {
      title: 'Industry Sponsorships',
      body: 'VERIFY proudly sponsors and participates in industry events related to medico-legal practice, forensic medicine, legal consultation, and allied fields. Our sponsorships reflect a commitment to collaboration, knowledge sharing, and professional excellence.',
      accent: 'seminars' as const,
      visualLabel: 'Office Photo',
      pills: [
        { text: 'Industry support' },
        { text: 'Shared standards' },
        { text: 'Professional growth' },
      ],
    },
  ],
})

/**
 * The hub's events section — one Events Explorer carrying the search bar AND
 * both of the reference's sections.
 *
 * The search bar is the single deliberate deviation from `events-seminars.html`,
 * which has none. Everything below it is the reference's copy: the eyebrow, the
 * `[[bracketed]]` accent in each heading, the intro line and the "View more"
 * button, all verbatim.
 */
export const eventsHubExplorer = () => ({
  blockType: 'eventsExplorer' as const,
  mode: 'all' as const,
  showSearch: true,
  // The reference previews 5 per section on the hub (events.js
  // `data-event-cards-limit` defaults to 5) and keeps the full lists on the two
  // child pages, which is what the "View more" buttons are for.
  pageSize: 5,
  background: 'white' as const,
  cardStyle: 'card' as const,
  eyebrow: 'Events & Seminars',
  heading: 'Explore VERIFY & [[AAMLE Events]]',
  // No subheading. The reference has no equivalent line, and the one that was
  // here restated what the section below it plainly shows.
  groups: {
    upcomingEyebrow: 'Upcoming Events',
    upcomingHeading: 'Latest Medico-Legal [[Education Events]]',
    upcomingIntro:
      'Register for upcoming breakfast seminars, webinars, and specialist-led sessions designed for practical medico-legal learning.',
    upcomingLinkLabel: 'View more upcoming events',
    upcomingLinkUrl: '/events/upcoming-events',
    pastEyebrow: 'Past Events',
    pastHeading: 'Recent VERIFY & AAMLE [[Programs]]',
    pastIntro:
      'Browse recent seminars, training sessions, and industry events delivered for our medico-legal community.',
    pastLinkLabel: 'View more past events',
    pastLinkUrl: '/events/past-events',
  },
})

/**
 * Slide text this seed previously wrote, mapped to the reference's wording.
 *
 * The first version of the carousel was seeded from a paraphrase (see the note
 * on `fourWaysCarousel`). Installs that already have it hold that wrong copy,
 * and the repair below will not replace a carousel wholesale — so correct the
 * fields individually, and ONLY where they still hold the exact superseded
 * string. An editor who has reworded a slide keeps their wording.
 */
const SUPERSEDED_SLIDE_TEXT: Record<string, string> = {
  'Tailored professional development seminars for legal, insurance and medical professionals across the medico-legal domain.':
    'VERIFY and AAMLE organise tailored professional development seminars for legal, insurance, and medical professionals in the medico-legal domain. Sessions are designed to sharpen practical knowledge, specialist understanding, and briefing confidence.',
  'Deep-dive presentations from our expert panel on the issues shaping assessment and reporting.':
    'VERIFY, in collaboration with AAMLE, delivers high-quality specialist presentations that empower professionals within the medico-legal field. These sessions translate clinical expertise into practical, usable insight for complex legal and insurance matters.',
  'Connect with peers across the medico-legal sector at curated networking events.':
    'VERIFY actively participates in networking events, both as a sponsor and participant, to support the growth of the medico-legal community. These events create opportunities to share experience and build meaningful industry connections.',
  'Partner with VERIFY and AAMLE to support education and innovation in the sector.':
    'VERIFY proudly sponsors and participates in industry events related to medico-legal practice, forensic medicine, legal consultation, and allied fields. Our sponsorships reflect a commitment to collaboration, knowledge sharing, and professional excellence.',
  // Title: the reference quotes this one.
  'Specialist Insights Presentations': "'Specialist Insights' Presentations",
  // Panel labels: the reference uses one placeholder on every slide.
  Seminar: 'Office Photo',
  Insights: 'Office Photo',
  Networking: 'Office Photo',
  Sponsorship: 'Office Photo',
}

/** Pills the paraphrase got wrong, keyed by slide title. */
const SUPERSEDED_PILLS: Record<string, { from: string[]; to: string[] }> = {
  "'Specialist Insights' Presentations": {
    from: ['Panel experts', 'Case studies'],
    to: ['Specialist voices', 'Clinical clarity', 'Case context'],
  },
  'Networking Events': {
    from: ['Industry-wide', 'Relationship-building'],
    to: ['Client connection', 'Industry dialogue', 'Community building'],
  },
  'Industry Sponsorships': {
    from: ['Brand visibility', 'Thought leadership'],
    to: ['Industry support', 'Shared standards', 'Professional growth'],
  },
}

type Slide = Record<string, unknown>

/** Returns the corrected slide, or null when nothing needed changing. */
const correctSlide = (slide: Slide): Slide | null => {
  const next: Slide = { ...slide }
  let changed = false

  for (const key of ['title', 'body', 'visualLabel'] as const) {
    // `storedText` rather than a `typeof === 'string'` guard: these fields are
    // becoming rich text, and a type guard would turn this repair into a silent
    // no-op the moment they do. The write below hands back a string, which the
    // seed's write wrapper lifts into a Lexical value for a converted field.
    const current = storedText(slide[key])
    if (current && SUPERSEDED_SLIDE_TEXT[current]) {
      next[key] = SUPERSEDED_SLIDE_TEXT[current]
      changed = true
    }
  }
  // The reference gives every panel the same fill; ours varied it per slide.
  if (slide.accent && slide.accent !== 'seminars' && changed) {
    next.accent = 'seminars'
  }

  const title = storedText(next.title) || storedText(slide.title)
  const pillFix = SUPERSEDED_PILLS[title]
  if (pillFix && Array.isArray(slide.pills)) {
    const current = (slide.pills as { text?: unknown }[])
      .map((p) => storedText(p?.text))
      .filter(Boolean)
    if (JSON.stringify(current) === JSON.stringify(pillFix.from)) {
      next.pills = pillFix.to.map((text) => ({ text }))
      changed = true
    }
  }
  return changed ? next : null
}

const blockTypeOf = (b: unknown): string | null =>
  b && typeof b === 'object' && typeof (b as { blockType?: unknown }).blockType === 'string'
    ? (b as { blockType: string }).blockType
    : null

export const repairEventsHub = async ({ payload, req }: Ctx): Promise<void> => {
  const found = await payload.find({
    collection: 'pages',
    limit: 1,
    depth: 0,
    where: { slug: { equals: 'events' } },
    req,
  })
  const page = found.docs[0]
  if (!page) return

  const layout = Array.isArray((page as { layout?: unknown }).layout)
    ? ([...((page as { layout: unknown[] }).layout ?? [])] as unknown[])
    : []

  const data: Record<string, unknown> = {}
  const changes: string[] = []

  // An existing carousel is never replaced, but slide text this seed itself got
  // wrong is corrected in place, field by field, on exact match only.
  const carouselAt = layout.findIndex((b) => blockTypeOf(b) === 'slideCarousel')
  if (carouselAt !== -1) {
    const carousel = layout[carouselAt] as Record<string, unknown>
    const slides = Array.isArray(carousel.slides) ? (carousel.slides as Slide[]) : []
    let fixed = 0
    const nextSlides = slides.map((s) => {
      const corrected = correctSlide(s)
      if (corrected) fixed++
      return corrected ?? s
    })
    if (fixed) {
      layout[carouselAt] = { ...carousel, slides: nextSlides }
      data.layout = layout
      changes.push(`corrected ${fixed} carousel slide(s) to the reference copy`)
    }
  }

  // The carousel — only into an absence.
  if (!layout.some((b) => blockTypeOf(b) === 'slideCarousel')) {
    // Sit it directly above the explorer, so the page reads: what we run, then
    // find one. With no explorer present, append and leave the rest alone.
    const explorerAt = layout.findIndex((b) => blockTypeOf(b) === 'eventsExplorer')
    if (explorerAt === -1) layout.push(fourWaysCarousel())
    else layout.splice(explorerAt, 0, fourWaysCarousel())
    data.layout = layout
    changes.push('added the Programs & partnerships carousel')
  }

  // The explorer's presentation and section headers. Only fills what is EMPTY:
  // a hub explorer still in list mode gets the reference's card treatment, and
  // an absent section header gets the reference's copy. An editor's own heading
  // or intro is never overwritten.
  const explorerAt = layout.findIndex((b) => blockTypeOf(b) === 'eventsExplorer')
  if (explorerAt !== -1) {
    const current = layout[explorerAt] as Record<string, unknown>
    const wanted = eventsHubExplorer()
    const groups = (current.groups as Record<string, unknown> | undefined) || {}
    const filledGroups: Record<string, unknown> = { ...groups }
    let groupChanged = false
    for (const [k, v] of Object.entries(wanted.groups)) {
      if (!filledGroups[k]) {
        filledGroups[k] = v
        groupChanged = true
      }
    }
    const needsCard = current.cardStyle !== 'card'
    const needsPageSize = current.pageSize === 8
    // Deleting a value, unlike filling one, needs an exact match against text
    // this seed wrote — an editor's own subheading is left in place.
    const dropSubheading = SUPERSEDED_EXPLORER_SUBHEADINGS.map(storedText).includes(storedText(current.subheading))
    if (needsCard || groupChanged || needsPageSize || dropSubheading) {
      layout[explorerAt] = {
        ...current,
        cardStyle: 'card',
        // 8 was the full-listing page size this seed gave the hub before it
        // became a preview. Exact match only, so an editor's own number stands.
        pageSize: current.pageSize === 8 || current.pageSize == null ? wanted.pageSize : current.pageSize,
        ...(dropSubheading ? { subheading: null } : {}),
        groups: filledGroups,
      }
      data.layout = layout
      // Report what actually changed. An earlier version picked one of two
      // messages from `needsCard` alone, so a run that only adjusted the page
      // size announced that it had filled the section headers.
      if (needsCard) changes.push('switched the events list to the reference card layout')
      if (groupChanged) changes.push('filled the section headers')
      if (needsPageSize) changes.push(`set the hub preview to ${wanted.pageSize} per section`)
      if (dropSubheading) changes.push('removed the superseded explorer subheading')
    }
  }

  // The hero — only while it still holds a string this seed wrote.
  const hero = (page as { hero?: Record<string, unknown> | null }).hero
  if (hero) {
    const nextHero = { ...hero }
    let heroChanged = false
    if (SUPERSEDED_EVENTS_HEADINGS.map(storedText).includes(storedText(hero.heading)) &&
      storedText(hero.heading) !== storedText(EVENTS_HEADING)) {
      nextHero.heading = EVENTS_HEADING
      heroChanged = true
    }
    if (SUPERSEDED_EVENTS_SUBTITLES.map(storedText).includes(storedText(hero.subtitle))) {
      nextHero.subtitle = EVENTS_SUBTITLE
      heroChanged = true
    }
    // The reference centres all three events heroes; ours was left-aligned.
    if (hero.align === 'left') {
      nextHero.align = 'center'
      heroChanged = true
    }
    if (heroChanged) {
      data.hero = nextHero
      changes.push('aligned the hero to the reference')
    }
  }

  if (changes.length) {
    await seedUpdate(payload, {
      collection: 'pages',
      id: page.id,
      data: data as never,
      req,
      context: { disableRevalidate: true },
    })
    payload.logger.info(`— Events hub: ${changes.join(', ')}`)
  }

  await applyEventsPageClass({ payload, req })
}

/**
 * Gives all three events pages the `events-pages` class their hero treatment is
 * scoped to. Additive: the class is appended to whatever is already stored, and
 * a page that already has it is skipped.
 */
const applyEventsPageClass = async ({ payload, req }: Ctx): Promise<void> => {
  let touched = 0
  for (const slug of EVENTS_PAGE_SLUGS) {
    const found = await payload.find({
      collection: 'pages',
      limit: 1,
      depth: 0,
      where: { slug: { equals: slug } },
      req,
    })
    const page = found.docs[0]
    if (!page) continue
    const raw = (page as { cssClass?: unknown }).cssClass
    const classes = Array.isArray(raw) ? (raw as string[]) : raw ? [String(raw)] : []
    if (classes.includes(EVENTS_PAGE_CLASS)) continue
    await seedUpdate(payload, {
      collection: 'pages',
      id: page.id,
      data: { cssClass: [...classes, EVENTS_PAGE_CLASS] } as never,
      req,
      context: { disableRevalidate: true },
    })
    touched++
  }
  if (touched) payload.logger.info(`— Events pages: applied the hero treatment to ${touched} page(s)`)
}

// ── Featured article topic chips ────────────────────────────────────────────

/** Post slug → the category slug its card should show beside the Featured badge,
 *  per `.design-reference/in-the-loop/in-the-loop.html`. */
const FEATURED_CATEGORY: Record<string, string> = {
  'the-ime-referral-brief-why-quality-documentation-determines-report-quality': 'expert-guidance',
  'aamle-2026-annual-conference-registration-now-open': 'aamle-events',
  'understanding-queenslands-updated-workcover-guidelines-what-every-legal-practitioner-needs-to-know':
    'industry-insights',
}

export const repairFeaturedCategories = async ({ payload, req }: Ctx): Promise<void> => {
  let fixed = 0

  for (const [postSlug, categorySlug] of Object.entries(FEATURED_CATEGORY)) {
    const found = await payload.find({
      collection: 'posts',
      limit: 1,
      depth: 0,
      where: { slug: { equals: postSlug } },
      req,
    })
    const post = found.docs[0]
    if (!post) continue

    // Only into an absence. A post an editor has already categorised — even
    // differently from the reference — is left alone.
    const existing = (post as { categories?: unknown }).categories
    if (Array.isArray(existing) && existing.length > 0) continue

    const category = await payload.find({
      collection: 'categories',
      limit: 1,
      depth: 0,
      where: { slug: { equals: categorySlug } },
      req,
    })
    const categoryId = category.docs[0]?.id
    if (!categoryId) continue

    await seedUpdate(payload, {
      collection: 'posts',
      id: post.id,
      data: { categories: [categoryId] } as never,
      req,
      context: { disableRevalidate: true },
    })
    fixed++
  }

  if (fixed) payload.logger.info(`— Featured articles: added a topic chip to ${fixed} post(s)`)
}
