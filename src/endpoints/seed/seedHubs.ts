import { seedCreate, seedUpdate } from './seedWrite'
import type { Payload, PayloadRequest } from 'payload'
import { isUnauthored } from './authored'

import { plainTextToLexical } from './data/richText'
// One definition of the events-hub carousel, shared with the repair that adds it
// to installs the fixture cannot reach. Two copies would drift.
import { fourWaysCarousel, eventsHubExplorer } from './seedEventsHub'

type Ctx = { payload: Payload; req: PayloadRequest }

// The reference styles the events heroes differently from every other page
// (`.events-hero`, not `.page-hero`): centred, 52.8px/700 in an 860px column,
// against our shared 60.8px/800. This class scopes that port to the three
// events pages — see `.events-pages` in globals.css, and the entry in
// src/fields/codeDefinedClasses.ts that keeps it offerable in the admin picker.
const EVENTS_PAGE_CSS = ['events-pages']

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const custom = (url: string, label: string, extra: Record<string, unknown> = {}): any => ({
  link: { type: 'custom', url, label, newTab: false, ...extra },
})

// ── Minimal Lexical builders for archive `introContent` section headers ──
// (the shared plainTextToLexical only emits paragraphs; an archive section
// header wants a real heading + a supporting line).
const textNode = (text: string) => ({
  type: 'text',
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text,
  version: 1,
})
const headingNode = (text: string) => ({
  type: 'heading',
  tag: 'h2',
  children: [textNode(text)],
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
})
const paragraphNode = (text: string) => ({
  type: 'paragraph',
  children: [textNode(text)],
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: 0,
  version: 1,
})
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sectionIntro = (heading: string, desc?: string): any => ({
  root: {
    type: 'root',
    children: desc ? [headingNode(heading), paragraphNode(desc)] : [headingNode(heading)],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})

async function authorPage(
  { payload, req }: Ctx,
  slug: string,
  hero: Record<string, unknown>,
  layout: unknown[],
  // Optional per-page SEO meta (plugin-seo `meta` group). generateMeta renders
  // `<title>` as `${meta.title} | ${siteName}`, so pass the bare page title
  // (e.g. 'Upcoming Events') and let the site name suffix be appended.
  meta?: { title?: string; description?: string },
  // Page-level classes, applied to the wrapping <article>. The events pages use
  // this to pick up their own hero treatment — see `.events-pages` in globals.css.
  pageCss?: string[],
): Promise<void> {
  const found = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    req,
  })
  const rec = found.docs[0] as { id: number | string; layout?: unknown[] } | undefined
  if (!rec) {
    payload.logger.warn(`— ${slug}: page not found, skipping`)
    return
  }
  if (!isUnauthored(rec.layout)) {
    payload.logger.info(`— ${slug} already authored, skipping`)
    return
  }
  await seedUpdate(payload, {
    collection: 'pages',
    id: rec.id,
    data: { hero, layout, ...(meta ? { meta } : {}), ...(pageCss ? { cssClass: pageCss } : {}) } as never,
    req,
    context: { disableRevalidate: true },
  })
  payload.logger.info(`— Authored /${slug}`)
}

// Resolve an In-the-Loop stream SLUG → its record id (archive `stream` is a
// relationship, so the block wants the id, not the slug).
async function streamId({ payload, req }: Ctx, slug: string): Promise<number | string | null> {
  const s = await payload.find({
    collection: 'streams',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    req,
  })
  return (s.docs[0]?.id as number | string | undefined) ?? null
}

// Idempotently ensure a Resources doc exists (the `resources` collection ships
// empty, so the In-the-Loop resources grid would otherwise render nothing). Any
// failure is swallowed so it can never abort page authoring.
type ResourceSeed = {
  slug: string
  title: string
  icon: string
  resourceType: 'checklist' | 'guide' | 'template' | 'fact-sheet'
  audience: 'clients' | 'claimants' | 'all'
  description: string
  ctaLabel: string
  externalUrl: string
  order: number
}
// Retained deliberately though nothing calls it today: the three scaffold
// resources it created were links to deleted articles and were removed on
// 2026-08-20. The next REAL resource (a PDF with a `file`) needs exactly this,
// and re-deriving it from scratch would be wasted work.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function ensureResource({ payload, req }: Ctx, data: ResourceSeed): Promise<void> {
  try {
    const existing = await payload.find({
      collection: 'resources',
      where: { slug: { equals: data.slug } },
      limit: 1,
      depth: 0,
      req,
    })
    if (existing.docs.length > 0) return
    await seedCreate(payload, {
      collection: 'resources',
      data: data as never,
      req,
      context: { disableRevalidate: true },
    })
    payload.logger.info(`— Seeded resource: ${data.title}`)
  } catch (err) {
    payload.logger.warn(`— Resource "${data.slug}" not seeded: ${(err as Error).message}`)
  }
}

// ── Archive block builders ──────────────────────────────────────────────
// A stream-filtered posts archive (one In-the-Loop hub section).
const postsArchive = (opts: {
  stream?: number | string | null
  featured?: boolean
  heading: string
  desc: string
  cssClass: string[]
  viewAll?: string
  viewAllLabel?: string
  limit?: number
  columns?: '2' | '3' | '4'
  postStyle?: 'card' | 'narrative'
  anchorId?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): any => ({
  blockType: 'archive',
  populateBy: 'collection',
  relationTo: 'posts',
  ...(opts.stream ? { stream: opts.stream } : {}),
  ...(opts.featured ? { featured: true } : {}),
  ...(opts.postStyle ? { postStyle: opts.postStyle } : {}),
  ...(opts.anchorId ? { anchorId: opts.anchorId } : {}),
  limit: opts.limit ?? 3,
  columns: opts.columns ?? '3',
  introContent: sectionIntro(opts.heading, opts.desc),
  cssClass: opts.cssClass,
  // Always provide a valid view-all link — an empty group still validates its
  // required nested link, so default to the hub when a section has none.
  viewAllLink: custom(opts.viewAll ?? '/in-the-loop', opts.viewAllLabel ?? 'View All'),
})

// An events archive (upcoming/past), rendered via the shared event cards.
const eventsArchive = (opts: {
  view: 'upcoming' | 'past'
  heading: string
  desc: string
  cssClass: string[]
  viewAll?: string
  viewAllLabel?: string
  limit?: number
  columns?: '2' | '3' | '4'
  eventStyle?: 'card' | 'compact'
  anchorId?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): any => ({
  blockType: 'archive',
  populateBy: 'collection',
  relationTo: 'events',
  view: opts.view,
  ...(opts.eventStyle ? { eventStyle: opts.eventStyle } : {}),
  ...(opts.anchorId ? { anchorId: opts.anchorId } : {}),
  limit: opts.limit ?? 3,
  columns: opts.columns ?? '3',
  introContent: sectionIntro(opts.heading, opts.desc),
  cssClass: opts.cssClass,
  viewAllLink: custom(opts.viewAll ?? '/events', opts.viewAllLabel ?? 'View All'),
})

/**
 * Authors the content-hub landing pages to match the design reference:
 *  · /in-the-loop  (in-the-loop/in-the-loop.html) — sticky section-nav bar, a
 *    single rotating featured-article carousel, per-stream archives (news,
 *    industry insights, specialist spotlights, QA insights ×5, staff narratives
 *    ×4 in narrative-card style), a compact AAMLE upcoming-events archive (2×2,
 *    next 4), a resources grid and the newsletter band.
 *  · /events (chooser) — a two-card gateway routing to the dedicated listings
 *    (the old promo carousel + 3-item preview treatment is removed).
 *  · /upcoming-events (events/upcoming-events.html) — full upcoming event list.
 *  · /past-events (events/past-events.html) — full past event list (8 most recent).
 *    All authored only if the page nodes already exist (skipped gracefully
 *    otherwise; no nodes are created).
 * Every section stays editable in the admin.
 */
/**
 * Idempotently returns the id of the "Newsletter Signup" form the newsletter
 * band posts into. The band's `form` relationship is required precisely so a
 * signup can never be accepted with nowhere to store it, so the seed has to
 * supply one.
 */
const ensureNewsletterForm = async ({ payload, req }: Ctx): Promise<string | number> => {
  const existing = await payload.find({
    collection: 'forms',
    where: { title: { equals: 'Newsletter Signup' } },
    limit: 1,
    depth: 0,
    req,
  })
  if (existing.docs[0]?.id) return existing.docs[0].id

  const created = await seedCreate(payload, {
    collection: 'forms',
    depth: 0,
    req,
    context: { disableRevalidate: true },
    data: {
      title: 'Newsletter Signup',
      fields: [
        { blockType: 'email', name: 'email', label: 'Email Address', width: 100, required: true },
      ],
      confirmationType: 'message',
      confirmationMessage: plainTextToLexical(
        'Thanks — you are subscribed. Watch your inbox for the next issue of In the Loop.',
      ),
    },
  })
  return created.id
}

export const seedHubs = async (ctx: Ctx): Promise<void> => {
  const newsletterFormId = await ensureNewsletterForm(ctx)

  // No scaffold resources are seeded. There were three, and each was a link to
  // an In-the-Loop article — `externalUrl: '/in-the-loop/resources/…'`. Those
  // articles were AI-written scaffold and were deleted on 2026-08-20, which left
  // three resource cards pointing at 404s; `links.e2e.spec.ts` caught all three.
  //
  // The pointers went with the articles rather than being re-aimed at nothing.
  // `ResourcesGrid` returns null when it has no cards, so the "Guides, Checklists
  // & Tools" section on /in-the-loop simply does not render — no empty box.
  // Add real resources here (with `file` for a genuine download) when they exist.

  // Resolve the In-the-Loop stream ids up front.
  const [news, insights, spotlights, qa, staff] = await Promise.all([
    streamId(ctx, 'news-updates'),
    streamId(ctx, 'industry-insights'),
    streamId(ctx, 'specialist-spotlights'),
    streamId(ctx, 'qa-insights'),
    streamId(ctx, 'staff-narratives'),
  ])

  // ── In the Loop ──────────────────────────────────────────────────────
  await authorPage(
    ctx,
    'in-the-loop',
    {
      type: 'pageHero',
      theme: 'dark',
      align: 'left',
      showBreadcrumb: true,
      showShield: false,
      imagePanel: true,
      imagePanelLabel: 'Company Image Placeholder',
      heading: 'Your Source for [[Medico-Legal]] Intelligence',
      subtitle:
        'Industry updates, expert perspectives, AAMLE events, and practical resources — everything you need to stay informed and ahead.',
    },
    [
      // Sticky category tab / anchor bar directly below the hero (design ref
      // `.ni-section-nav`). Order + labels mirror the reference exactly — the
      // nav drops any item whose section has hidden itself, so a stream with no
      // articles costs neither a tab nor an empty band.
      //
      // None of the sections below set `hideWhenEmpty` here. It is owned by
      // `repairHubEmptySections`, which runs unconditionally and so reaches a
      // fresh install and an authored one alike; setting it in both places would
      // be two copies to keep in step for no gain.
      {
        blockType: 'sectionNav',
        sticky: true,
        items: [
          { label: 'Latest', anchorId: 'featured' },
          { label: 'News & Updates', anchorId: 'news' },
          { label: 'AAMLE Events', anchorId: 'events' },
          { label: 'Industry Insights', anchorId: 'insights' },
          { label: 'Specialist Spotlights', anchorId: 'spotlights' },
          { label: 'Resources', anchorId: 'resources' },
          { label: 'QA Insights', anchorId: 'qa-insights' },
          { label: 'Staff Narratives', anchorId: 'staff-narratives' },
        ],
      },
      // Featured — a single rotating featured-article carousel (design ref
      // `.ni-featured` carousel), NOT a 3-card grid. Authored from the three
      // `featured` posts; the SlideCarousel gives the arrows + dots + autoplay.
      // Featured-article carousel (design-reference .ni-featured/.ni-carousel).
      // Auto-pulls posts in the "featured" stream (or flagged featured); the block
      // renders the #featured anchor so the sticky category nav resolves.
      {
        blockType: 'featuredArticles',
        anchorId: 'featured',
        eyebrow: 'Featured',
        source: 'auto',
        limit: 6,
        background: 'white',
      },
      // News & Updates — per-article "Company News" / "Industry News" chips.
      postsArchive({
        stream: news,
        anchorId: 'news',
        heading: 'Latest from [[VERIFY]]',
        desc: 'Company news, announcements, and updates from the medico-legal industry.',
        cssClass: ['ni-section', 'bg-grey'],
        viewAll: '/in-the-loop/news-updates',
        viewAllLabel: 'View All News',
      }),
      // AAMLE Events (upcoming) — compact date-badge cards, 2×2, next 4 events.
      eventsArchive({
        view: 'upcoming',
        eventStyle: 'compact',
        columns: '2',
        limit: 4,
        anchorId: 'events',
        heading: 'Upcoming Webinars & [[Training]]',
        desc: 'Complimentary, CPD-eligible education for legal, medical, and insurance professionals.',
        cssClass: ['ni-section', 'bg-white'],
        viewAll: '/events',
        viewAllLabel: 'View All Events',
      }),
      // Industry Insights — "Practice Guide" / "Legal Framework" / "Clinical" chips.
      postsArchive({
        stream: insights,
        anchorId: 'insights',
        heading: 'Practical Knowledge for [[Practitioners]]',
        desc: 'In-depth articles on medico-legal practice, legislation, and clinical assessment written for legal and insurance professionals.',
        cssClass: ['ni-section', 'bg-grey'],
        viewAll: '/in-the-loop/industry-insights',
        viewAllLabel: 'View All Insights',
      }),
      // Specialist Spotlights (dark band) — "Orthopaedics" / "Psychiatry" / "Pain Medicine".
      postsArchive({
        stream: spotlights,
        anchorId: 'spotlights',
        heading: 'Meet the Experts [[Behind the Reports]]',
        desc: 'Short profiles and conversations with specialists on the VERIFY expert panel.',
        cssClass: ['ni-section', 'bg-dark'],
        viewAll: '/in-the-loop/specialist-spotlights',
        viewAllLabel: 'View All Spotlights',
      }),
      // Resources (light-blue band, driven by the Resources collection)
      {
        blockType: 'resourcesGrid',
        anchorId: 'resources',
        variant: 'ni-resource',
        eyebrow: 'Resources',
        heading: 'Guides, Checklists & [[Templates]]',
        subheading:
          'Practical tools for legal practitioners, insurers, and claimants navigating the medico-legal process.',
        background: 'accent',
        source: 'auto',
        columns: '3',
        limit: 6,
      },
      // QA Insights — 5 items (Vol. 24–27 + the IME Report Quality Checklist).
      postsArchive({
        stream: qa,
        anchorId: 'qa-insights',
        limit: 5,
        heading: "From VERIFY's [[Quality Assurance Team]]",
        desc: 'Practical notes from the team that reviews every report — what they look for, what they find, and what it means for your matter.',
        cssClass: ['ni-section', 'bg-white'],
        viewAll: '/in-the-loop/qa-insights',
        viewAllLabel: 'View All QA Insights',
      }),
      // Staff Narratives — 2×2 narrative cards with author photo/name/role.
      postsArchive({
        stream: staff,
        anchorId: 'staff-narratives',
        postStyle: 'narrative',
        limit: 4,
        heading: 'Insights from the [[VERIFY Team]]',
        desc: 'Practical perspectives from the people behind your medico-legal outcomes.',
        cssClass: ['ni-section', 'bg-grey'],
        viewAll: '/in-the-loop/staff-narratives',
        viewAllLabel: 'View All Narratives',
      }),
      // Newsletter
      {
        blockType: 'newsletter',
        form: newsletterFormId,
        eyebrow: 'Stay in the Loop',
        heading: 'Be the First to Know About [[VERIFY & AAMLE Updates]]',
        subheading:
          'Subscribe to receive new articles from In the Loop, AAMLE industry event invitations, and announcements — delivered directly to your inbox.',
        placeholder: 'Enter your email address',
        buttonLabel: 'Subscribe',
        note: 'Unsubscribe at any time. We respect your privacy.',
      },
    ],
  )

  // ── Events (hub) ─────────────────────────────────────────────────────
  // The reference has THREE events pages, not two: the full listings at
  // /upcoming-events and /past-events, plus a hub at events-seminars.html that
  // opens with a four-way carousel of what VERIFY runs.
  //
  // The carousel used to be here and was removed, on the grounds that it was
  // "not present in either Target page" on the strength of a comparison that
  // only ever looked at the two listing
  // pages, so it could not have found it. It is on the hub, and it is back.
  //
  // What the reference does NOT have is a search bar; its hub offers two static
  // three-item previews instead. The explorer stays, below the carousel, because
  // it already splits upcoming from past and lists everything — adding previews
  // as well would print the same events twice on one page.
  await authorPage(
    ctx,
    'events',
    {
      type: 'pageHero',
      theme: 'dark',
      // The reference centres all three events heroes.
      align: 'center',
      showBreadcrumb: true,
      showShield: false,
      heading: 'Medico-Legal Education for [[Better Practice]]',
      subtitle:
        'VERIFY and AAMLE host practical education, industry briefings, specialist-led seminars, and professional networking events for legal, medical, and insurance professionals.',
    },
    [
      // Reference `.events-offer-stage` — the four ways VERIFY teaches.
      fourWaysCarousel(),
      // The reference hub's two sections — Upcoming and Past, each with an
      // eyebrow, an accented heading, a line of copy and a "View more" button,
      // rendered as `.event-card`s with an image panel.
      //
      // One block, not two, because the explorer already splits upcoming from
      // past: adding separate preview sections alongside it would print the same
      // events twice on one page. `cardStyle: 'card'` is what swaps the child
      // pages' list rows for the hub's cards.
      eventsHubExplorer(),
    ],
    undefined,
    EVENTS_PAGE_CSS,
  )

  // ── Upcoming Events (dedicated full listing) ─────────────────────────
  await authorPage(
    ctx,
    'upcoming-events',
    {
      type: 'pageHero',
      theme: 'dark',
      // Reference `.events-hero` is centre-aligned (breadcrumb + heading centred,
      // 860px max-width). PageHero emits `page-hero--center` for align:'center'.
      align: 'center',
      showBreadcrumb: true,
      showShield: false,
      heading: 'Explore Upcoming Medico-Legal [[Education Events]]',
    },
    [
      // Full-width list rows + search/filter toolbar + pagination (reference
      // upcoming-events page). Browser-date filtered to upcoming only.
      {
        blockType: 'eventsExplorer',
        mode: 'upcoming-only',
        showSearch: true,
        pageSize: 8,
        background: 'white',
      },
    ],
    {
      title: 'Upcoming Events',
      description:
        'Explore upcoming VERIFY and AAMLE medico-legal seminars, webinars, workshops, industry briefings, sponsorships, and networking events.',
    },
    EVENTS_PAGE_CSS,
  )

  // ── Past Events (dedicated full listing — 8 most recent) ─────────────
  await authorPage(
    ctx,
    'past-events',
    {
      type: 'pageHero',
      theme: 'dark',
      // Reference `.events-hero` is centre-aligned (matches upcoming-events).
      align: 'center',
      showBreadcrumb: true,
      showShield: false,
      heading: 'Explore Past Medico-Legal [[Education Events]]',
    },
    [
      // Full-width list rows + search/filter toolbar + pagination (reference
      // past-events page). Browser-date filtered to past only.
      {
        blockType: 'eventsExplorer',
        mode: 'past-only',
        showSearch: true,
        pageSize: 8,
        background: 'white',
      },
    ],
    {
      title: 'Past Events',
      description:
        'Browse previous VERIFY and AAMLE medico-legal seminars, webinars, workshops, industry briefings, sponsorships, and networking events.',
    },
    EVENTS_PAGE_CSS,
  )
}
